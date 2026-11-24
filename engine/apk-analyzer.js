/**
 * Rajasthan Police Hackathon (R4C) - PS01 Cyber Fraud Detection Platform
 * Team: Third Eye
 * File: engine/apk-analyzer.js
 * 
 * Step 1.7: Static Android Package (APK) Analyzer
 * Analyzes permissions, C2 endpoints, hardcoded credentials, certificate & package typosquatting.
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['../utils/constants', '../utils/helpers', './ioc-extractor'], factory);
  } else if (typeof module === 'object' && module.exports) {
    const Constants = require('../utils/constants');
    const Helpers = require('../utils/helpers');
    const IOCExtractor = require('./ioc-extractor');
    let blacklists = null;
    try {
      blacklists = require('../data/blacklists.json');
    } catch (e) {
      // Handled via defaults
    }
    module.exports = factory(Constants, Helpers, IOCExtractor, blacklists);
  } else {
    root.ThirdEye = root.ThirdEye || {};
    root.ThirdEye.APKAnalyzer = factory(
      root.ThirdEye.Constants,
      root.ThirdEye.Helpers,
      root.ThirdEye.IOCExtractor,
      root.ThirdEye.Data && root.ThirdEye.Data.blacklists
    );
  }
}(typeof self !== 'undefined' ? self : this, function (Constants, Helpers, IOCExtractor, injectedBlacklists) {
  'use strict';

  const APKAnalyzer = {
    blacklists: injectedBlacklists || { apk_hashes: [], domains: [] },

    /**
     * Configure or update blacklists
     */
    configure: function (opts) {
      if (opts.blacklists) this.blacklists = opts.blacklists;
    },

    /**
     * Parse permissions from manifest XML or text
     * @param {string} manifestText 
     * @returns {string[]}
     */
    extractPermissionsFromXml: function (manifestText) {
      if (!manifestText || typeof manifestText !== 'string') return [];
      const perms = [];
      const permRegex = /<uses-permission[^>]+android:name=["']([^"']+)["']/gi;
      let match;
      while ((match = permRegex.exec(manifestText)) !== null) {
        perms.push(match[1]);
      }
      return perms;
    },

    /**
     * Parse package name from manifest XML
     * @param {string} manifestText 
     * @returns {string|null}
     */
    extractPackageFromXml: function (manifestText) {
      if (!manifestText || typeof manifestText !== 'string') return null;
      const pkgMatch = manifestText.match(/package=["']([^"']+)["']/i);
      return pkgMatch ? pkgMatch[1] : null;
    },

    /**
     * Analyze APK data (mock object, manifest XML, or metadata)
     * @param {Object|string} input - JSON object, manifest XML string, or File data
     * @returns {{ triggers: Array<import('../utils/helpers').Trigger>, iocs: Array<import('../utils/helpers').IOC>, details: Object }}
     */
    analyze: function (input) {
      let apkData = {};

      if (typeof input === 'string') {
        // Could be manifest XML or JSON string
        if (input.trim().startsWith('{')) {
          try {
            // Guard against prototype pollution when parsing user-uploaded APK JSON
            apkData = JSON.parse(input, (key, value) => {
              if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
                return undefined;
              }
              return value;
            }) || {};
          } catch (e) {
            apkData = { manifest_xml: input };
          }
        } else {
          apkData = { manifest_xml: input };
        }
      } else if (typeof input === 'object' && input !== null) {
        apkData = input;
      }

      const triggers = [];
      const iocs = [];
      const weights = (Constants && Constants.WEIGHTS && Constants.WEIGHTS.APK) ? Constants.WEIGHTS.APK : {
        SMS_PERMISSIONS: 20,
        CONTACTS_CALL_PERMISSIONS: 10,
        OVERLAY_ADMIN_INSTALL_PERMS: 10,
        EMBEDDED_URLS_IPS: 15,
        HARDCODED_PAYMENTS: 10,
        LOOKALIKE_PACKAGE: 15,
        DEBUG_SELFSIGNED_CERT: 5,
        BLACKLIST_MATCH: 15
      };

      // 1. Resolve Package Name
      let packageName = apkData.package_name;
      if (!packageName && apkData.manifest_xml) {
        packageName = this.extractPackageFromXml(apkData.manifest_xml);
      }
      if (!packageName) {
        packageName = 'com.unknown.unregistered.app';
      }

      iocs.push({
        type: 'package',
        value: packageName,
        source: 'apk_metadata',
        confidence: 1.0,
        notes: apkData.app_name || 'Target APK Package'
      });

      // 2. Resolve Permissions
      let permissions = apkData.permissions || [];
      if ((!permissions || permissions.length === 0) && apkData.manifest_xml) {
        permissions = this.extractPermissionsFromXml(apkData.manifest_xml);
      }

      const dangerousPermsDef = (Constants && Constants.DANGEROUS_PERMISSIONS) || {};
      const foundSmsPerms = [];
      const foundContactCallPerms = [];
      const foundOverlayAdminPerms = [];

      permissions.forEach(p => {
        const pClean = p.trim();
        if (pClean.includes('READ_SMS') || pClean.includes('RECEIVE_SMS') || pClean.includes('SEND_SMS')) {
          foundSmsPerms.push(pClean.split('.').pop());
        } else if (pClean.includes('READ_CONTACTS') || pClean.includes('WRITE_CONTACTS') || pClean.includes('READ_CALL_LOG') || pClean.includes('CALL_PHONE')) {
          foundContactCallPerms.push(pClean.split('.').pop());
        } else if (pClean.includes('SYSTEM_ALERT_WINDOW') || pClean.includes('BIND_ACCESSIBILITY_SERVICE') || pClean.includes('REQUEST_INSTALL_PACKAGES') || pClean.includes('DEVICE_ADMIN')) {
          foundOverlayAdminPerms.push(pClean.split('.').pop());
        }
      });

      // Trigger: Abusive SMS permissions (Banking OTP stealer signature)
      if (foundSmsPerms.length > 0) {
        triggers.push({
          id: 'RULE_APK_SMS_THEFT',
          category: Constants.CATEGORIES.DANGEROUS_PERMS,
          description: 'High-risk SMS interception permissions (characteristic of banking OTP stealers)',
          severity: 'CRITICAL',
          evidence: foundSmsPerms.join(', '),
          weight: weights.SMS_PERMISSIONS
        });
      }

      // Trigger: Contact / Call log harvesting (Predatory loan app signature)
      if (foundContactCallPerms.length > 0) {
        triggers.push({
          id: 'RULE_APK_CONTACT_HARVEST',
          category: Constants.CATEGORIES.DANGEROUS_PERMS,
          description: 'Address book & call log surveillance permissions used in predatory loan extortion',
          severity: 'HIGH',
          evidence: foundContactCallPerms.join(', '),
          weight: weights.CONTACTS_CALL_PERMISSIONS
        });
      }

      // Trigger: Overlay / Accessibility / Dropper permissions (Banking Trojan signature)
      if (foundOverlayAdminPerms.length > 0) {
        triggers.push({
          id: 'RULE_APK_OVERLAY_DROPPER',
          category: Constants.CATEGORIES.DANGEROUS_PERMS,
          description: 'Screen overlay / Accessibility service abuse capable of hijacking banking sessions',
          severity: 'CRITICAL',
          evidence: foundOverlayAdminPerms.join(', '),
          weight: weights.OVERLAY_ADMIN_INSTALL_PERMS
        });
      }

      // 3. Embedded URLs and C2 IP Endpoints
      const allStrings = [
        apkData.manifest_xml || '',
        JSON.stringify(apkData.embedded_urls || []),
        JSON.stringify(apkData.embedded_iocs || []),
        apkData.raw_dex_strings || ''
      ].join(' ');

      const embeddedExtracted = IOCExtractor.extractAll(allStrings, 'apk_strings');
      for (const item of embeddedExtracted) {
        // Filter out benign Android system schema URLs
        if (item.type === 'url' && (item.value.includes('schemas.android.com') || item.value.includes('www.w3.org'))) {
          continue;
        }
        if (!iocs.some(i => i.value.toLowerCase() === item.value.toLowerCase())) {
          iocs.push(item);
        }
      }

      // Check if embedded URLs or IP addresses exist
      const embeddedUrls = iocs.filter(i => i.type === 'url');
      if (embeddedUrls.length > 0) {
        triggers.push({
          id: 'RULE_APK_EMBEDDED_C2_URLS',
          category: Constants.CATEGORIES.CODE_ANOMALY,
          description: 'Hardcoded external Command & Control (C2) / Exfiltration endpoints discovered',
          severity: 'HIGH',
          evidence: embeddedUrls.map(u => u.value).join(', '),
          weight: weights.EMBEDDED_URLS_IPS
        });
      }

      // 4. Hardcoded Payment VPAs or Scam Phone numbers
      const embeddedPayments = iocs.filter(i => i.type === 'upi' || i.type === 'phone');
      if (embeddedPayments.length > 0) {
        triggers.push({
          id: 'RULE_APK_HARDCODED_PAYMENTS',
          category: Constants.CATEGORIES.PAYMENT_SCAM,
          description: 'Hardcoded UPI collection VPA or scammer contact baked into application binary',
          severity: 'HIGH',
          evidence: embeddedPayments.map(p => `${p.type.toUpperCase()}: ${p.value}`).join(', '),
          weight: weights.HARDCODED_PAYMENTS
        });
      }

      // 5. Look-alike Package Name (Typosquatting legitimate banking apps)
      const targetBrands = ['sbi', 'hdfc', 'icici', 'axis', 'pnb', 'paytm', 'phonepe', 'yono'];
      const isBankLookalike = targetBrands.some(b => packageName.toLowerCase().includes(b)) &&
                             !packageName.startsWith('com.sbi.') &&
                             !packageName.startsWith('com.hdfcbank.') &&
                             !packageName.startsWith('com.icicibank.');
      if (isBankLookalike) {
        triggers.push({
          id: 'RULE_APK_LOOKALIKE_PACKAGE',
          category: Constants.CATEGORIES.IMPERSONATION,
          description: 'Deceptive package name mimicking official Indian banking application',
          severity: 'CRITICAL',
          evidence: packageName,
          weight: weights.LOOKALIKE_PACKAGE
        });
      }

      // 6. Certificate Anomalies (Debug cert / self-signed)
      const cert = apkData.certificate || {};
      if (cert.is_debug || (cert.issuer && cert.issuer.includes('Android Debug'))) {
        triggers.push({
          id: 'RULE_APK_DEBUG_CERTIFICATE',
          category: Constants.CATEGORIES.CODE_ANOMALY,
          description: 'Signed with insecure debug keystore (not distributed via legitimate Google Play)',
          severity: 'MEDIUM',
          evidence: cert.issuer || 'Android Debug Key',
          weight: weights.DEBUG_SELFSIGNED_CERT
        });
      }

      // 7. Blacklist / Threat Intel Match
      const certHash = cert.sha256;
      const blacklistedHashes = (this.blacklists && this.blacklists.apk_hashes) || [];
      if (certHash && blacklistedHashes.includes(certHash.toLowerCase())) {
        triggers.push({
          id: 'RULE_APK_BLACKLISTED_HASH',
          category: Constants.CATEGORIES.BLACKLIST,
          description: 'APK signature hash matches known malware family catalogued by State Cyber Cell',
          severity: 'CRITICAL',
          evidence: certHash,
          weight: weights.BLACKLIST_MATCH
        });
        iocs[0].flagged = true;
      }

      return {
        triggers: Helpers && Helpers.deduplicateTriggers ? Helpers.deduplicateTriggers(triggers) : triggers,
        iocs: Helpers && Helpers.deduplicateIOCs ? Helpers.deduplicateIOCs(iocs) : iocs,
        details: {
          packageName: packageName,
          appName: apkData.app_name || 'Android Application',
          version: apkData.version || '1.0',
          permissionsCount: permissions.length,
          permissions: permissions,
          certificate: cert
        }
      };
    }
  };

  return APKAnalyzer;
}));
