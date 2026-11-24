/**
 * Rajasthan Police Hackathon (R4C) - PS01 Cyber Fraud Detection Platform
 * Team: Third Eye
 * File: engine/url-analyzer.js
 * 
 * Step 1.5: Offline-First URL & Phishing Domain Analyzer
 * Inspects protocol, shorteners, lookalikes, TLDs, subdomains, path traps, WHOIS & blacklists.
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['../utils/constants', '../utils/helpers', './ioc-extractor'], factory);
  } else if (typeof module === 'object' && module.exports) {
    const Constants = require('../utils/constants');
    const Helpers = require('../utils/helpers');
    const IOCExtractor = require('./ioc-extractor');
    let blacklists = null;
    let whoisDb = null;
    try {
      blacklists = require('../data/blacklists.json');
      whoisDb = require('../data/mock-whois.json');
    } catch (e) {
      // Handled via defaults
    }
    module.exports = factory(Constants, Helpers, IOCExtractor, blacklists, whoisDb);
  } else {
    root.ThirdEye = root.ThirdEye || {};
    root.ThirdEye.URLAnalyzer = factory(
      root.ThirdEye.Constants,
      root.ThirdEye.Helpers,
      root.ThirdEye.IOCExtractor,
      root.ThirdEye.Data && root.ThirdEye.Data.blacklists,
      root.ThirdEye.Data && root.ThirdEye.Data.whois
    );
  }
}(typeof self !== 'undefined' ? self : this, function (Constants, Helpers, IOCExtractor, injectedBlacklists, injectedWhois) {
  'use strict';

  const DEFAULT_BLACKLISTS = {
    domains: [
      'sbi-kyc-verification.xyz',
      'bijli-bill-alert.top',
      'indiapost-track-parcel.click',
      'pm-kisan-yojana-reward.site',
      'quickcash-instant-loan.xyz',
      'teenpatti-gold-vip.live',
      'doublemoney-roi-mlm.win'
    ]
  };

  const DEFAULT_WHOIS = {
    domains: {
      'sbi-kyc-verification.xyz': { registrar: 'NameCheap, Inc.', age_days: 3, created_date: '2026-11-18', registrant_country: 'RU', ssl_issuer: "Let's Encrypt Free DV" },
      'bijli-bill-alert.top': { registrar: 'Porkbun LLC', age_days: 6, created_date: '2026-11-15', registrant_country: 'HK', ssl_issuer: 'cPanel Free SSL' },
      'indiapost-track-parcel.click': { registrar: 'Dynadot LLC', age_days: 2, created_date: '2026-11-19', registrant_country: 'CN', ssl_issuer: 'ZeroSSL Free' },
      'pm-kisan-yojana-reward.site': { registrar: 'Hostinger', age_days: 11, created_date: '2026-11-10', registrant_country: 'NG', ssl_issuer: 'Self-Signed' },
      'quickcash-instant-loan.xyz': { registrar: 'Tucows', age_days: 9, created_date: '2026-11-12', registrant_country: 'KH', ssl_issuer: 'Cloudflare' },
      'teenpatti-gold-vip.live': { registrar: 'Alibaba Cloud', age_days: 27, created_date: '2026-10-25', registrant_country: 'MM', ssl_issuer: 'Free DV' },
      'doublemoney-roi-mlm.win': { registrar: 'PDR Ltd', age_days: 7, created_date: '2026-11-14', registrant_country: 'SC', ssl_issuer: "Let's Encrypt" },
      'sbi.co.in': { registrar: 'NIC India', age_days: 9820, created_date: '2000-01-01', registrant_country: 'IN', ssl_issuer: 'DigiCert EV' },
      'police.rajasthan.gov.in': { registrar: 'NIC India', age_days: 8990, created_date: '2002-04-10', registrant_country: 'IN', ssl_issuer: 'eMudhra Gov' }
    }
  };

  const URLAnalyzer = {
    blacklists: injectedBlacklists || DEFAULT_BLACKLISTS,
    whoisDb: (injectedWhois && injectedWhois.domains) ? injectedWhois.domains : DEFAULT_WHOIS.domains,

    /**
     * Configure or update blacklists/whois
     */
    configure: function (opts) {
      if (opts.blacklists) this.blacklists = opts.blacklists;
      if (opts.whoisDb) this.whoisDb = opts.whoisDb;
    },

    /**
     * Parse URL into components safely without throwing
     * @param {string} rawUrl 
     */
    parseUrl: function (rawUrl) {
      let trimmed = (rawUrl || '').trim();
      if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
        trimmed = 'http://' + trimmed;
      }
      try {
        const parsed = new URL(trimmed);
        return {
          valid: true,
          protocol: parsed.protocol.replace(':', ''),
          hostname: parsed.hostname.toLowerCase(),
          port: parsed.port,
          pathname: parsed.pathname.toLowerCase(),
          search: parsed.search,
          fullUrl: trimmed
        };
      } catch (err) {
        // Fallback simple regex extraction
        const match = trimmed.match(/^https?:\/\/([^/?#:]+)(?::(\d+))?([^?#]*)(\?.*)?/i);
        if (match) {
          return {
            valid: true,
            protocol: trimmed.startsWith('https') ? 'https' : 'http',
            hostname: match[1].toLowerCase(),
            port: match[2] || '',
            pathname: (match[3] || '').toLowerCase(),
            search: match[4] || '',
            fullUrl: trimmed
          };
        }
        return { valid: false, hostname: trimmed, pathname: '', fullUrl: rawUrl };
      }
    },

    /**
     * Analyze a single URL
     * @param {string} rawUrl 
     * @returns {{ triggers: Array<import('../utils/helpers').Trigger>, iocs: Array<import('../utils/helpers').IOC>, details: Object }}
     */
    analyze: function (rawUrl) {
      if (!rawUrl || typeof rawUrl !== 'string') {
        return { triggers: [], iocs: [], details: {} };
      }

      const triggers = [];
      const iocs = [];
      const parsed = this.parseUrl(rawUrl);
      const hostname = parsed.hostname;
      const pathname = parsed.pathname;

      const weights = (Constants && Constants.WEIGHTS && Constants.WEIGHTS.MESSAGE) ? Constants.WEIGHTS.MESSAGE : {
        NO_HTTPS: 5,
        URL_SHORTENER: 10,
        LOOKALIKE_DOMAIN: 15,
        SUSPICIOUS_TLD: 5,
        YOUNG_DOMAIN: 10,
        BLACKLIST_DOMAIN: 25
      };

      // Primary URL IOC
      iocs.push({
        type: 'url',
        value: parsed.fullUrl,
        source: 'url_input',
        confidence: 1.0
      });

      // 1. Check Protocol (HTTPS vs HTTP)
      if (parsed.protocol === 'http') {
        triggers.push({
          id: 'RULE_URL_NO_HTTPS',
          category: Constants.CATEGORIES.URL_ANOMALY,
          description: 'Insecure unencrypted HTTP connection (credentials transmitted in cleartext)',
          severity: 'LOW',
          evidence: 'http:// scheme in ' + parsed.hostname,
          weight: weights.NO_HTTPS
        });
      }

      // 2. Check URL Shortener
      const shorteners = (Constants && Constants.URL_SHORTENERS) || ['bit.ly', 'tinyurl.com', 'cutt.ly', 'rebrand.ly'];
      const isShortener = shorteners.some(s => hostname === s || hostname.endsWith('.' + s));
      if (isShortener) {
        triggers.push({
          id: 'RULE_URL_SHORTENER',
          category: Constants.CATEGORIES.URL_ANOMALY,
          description: 'URL Shortener masks the final landing domain to evade reputation filters',
          severity: 'HIGH',
          evidence: hostname,
          weight: weights.URL_SHORTENER
        });
      }

      // 3. Check Suspicious TLD
      const suspiciousTlds = (Constants && Constants.SUSPICIOUS_TLDS) || [
        '.xyz', '.top', '.click', '.loan', '.win', '.cf', '.tk', '.ml', '.ga', '.live', '.site', '.icu'
      ];
      const matchedTld = suspiciousTlds.find(tld => hostname.endsWith(tld));
      if (matchedTld) {
        triggers.push({
          id: 'RULE_URL_SUSPICIOUS_TLD',
          category: Constants.CATEGORIES.URL_ANOMALY,
          description: `Disproportionately abused low-cost Top-Level Domain (${matchedTld})`,
          severity: 'MEDIUM',
          evidence: matchedTld + ' in ' + hostname,
          weight: weights.SUSPICIOUS_TLD
        });
      }

      // 4. Look-alike / Typosquatting / Brand Hijacking
      if (Helpers && Helpers.checkLookalikeDomain) {
        const lookalike = Helpers.checkLookalikeDomain(hostname);
        if (lookalike.isLookalike) {
          triggers.push({
            id: 'RULE_URL_LOOKALIKE',
            category: Constants.CATEGORIES.IMPERSONATION,
            description: `Brand Spoofing / Typosquatting targeting ${lookalike.targetBrand}`,
            severity: 'CRITICAL',
            evidence: lookalike.reason || `Mimics ${lookalike.targetDomain} (edit distance: ${lookalike.distance})`,
            weight: weights.LOOKALIKE_DOMAIN
          });
        }
      }

      // Check if domain is legitimate official bank/government domain
      const targets = (Constants && Constants.LEGITIMATE_TARGETS) || [];
      const isOfficialDomain = targets.some(t => 
        hostname === t.domain || hostname.endsWith('.' + t.domain)
      ) || hostname.endsWith('.sbi') || hostname.endsWith('.gov.in') || hostname.endsWith('.nic.in');

      // 5. Deceptive Subdomain / Multi-Subdomain Anomalies (Only on non-official domains)
      const domainParts = hostname.split('.');
      if (!isOfficialDomain && domainParts.length >= 4) {
        triggers.push({
          id: 'RULE_URL_SUBDOMAIN_ANOMALY',
          category: Constants.CATEGORIES.URL_ANOMALY,
          description: 'Excessive subdomain depth / deceptive hierarchy masking malicious host',
          severity: 'MEDIUM',
          evidence: hostname + ` (${domainParts.length} levels)`,
          weight: 5
        });
      }

      // 6. Path Traps (Phishing credential harvester indicators on non-official domains)
      const sensitivePathRegex = /\/(kyc|verify|verification|otp|login|netbanking|signin|update|secure|refund|claim|pan|aadhaar)\b/i;
      const pathMatch = pathname.match(sensitivePathRegex);
      if (!isOfficialDomain && pathMatch) {
        triggers.push({
          id: 'RULE_URL_PATH_HARVESTER',
          category: Constants.CATEGORIES.IMPERSONATION,
          description: `Sensitive credential harvesting path segment detected ('${pathMatch[0]}')`,
          severity: 'HIGH',
          evidence: pathname,
          weight: 10
        });
      }

      // 7. Check Police Blacklist
      const blacklistedDomains = (this.blacklists && this.blacklists.domains) || [];
      const isBlacklisted = blacklistedDomains.some(bd => hostname === bd || hostname.endsWith('.' + bd));
      if (isBlacklisted) {
        triggers.push({
          id: 'RULE_URL_BLACKLISTED',
          category: Constants.CATEGORIES.BLACKLIST,
          description: 'Host domain matches active cybercrime phishing registry (I4C / State Cyber Cell)',
          severity: 'CRITICAL',
          evidence: hostname,
          weight: weights.BLACKLIST_DOMAIN
        });
        iocs[0].flagged = true;
      }

      // 8. Offline WHOIS lookup simulation
      let whoisInfo = null;
      if (this.whoisDb) {
        // Find exact or root domain match
        whoisInfo = this.whoisDb[hostname];
        if (!whoisInfo && domainParts.length > 2) {
          const rootDomain = domainParts.slice(-2).join('.');
          whoisInfo = this.whoisDb[rootDomain];
        }
      }

      if (whoisInfo) {
        if (whoisInfo.age_days !== undefined && whoisInfo.age_days <= 30) {
          triggers.push({
            id: 'RULE_URL_YOUNG_DOMAIN',
            category: Constants.CATEGORIES.URL_ANOMALY,
            description: `Recently registered domain (${whoisInfo.age_days} days old, created ${whoisInfo.created_date})`,
            severity: 'HIGH',
            evidence: `Age: ${whoisInfo.age_days} days | Registrar: ${whoisInfo.registrar || 'Unknown'} | Country: ${whoisInfo.registrant_country || 'N/A'}`,
            weight: weights.YOUNG_DOMAIN
          });
        }
      }

      // 9. App Store, Google Play Store & APK Sideload Analysis
      const isPlayStore = hostname === 'play.google.com' || hostname.endsWith('.play.google.com');
      const isAppleStore = hostname === 'apps.apple.com' || hostname.endsWith('.apple.com');
      const altApkStores = ['apkpure.com', 'apkmirror.com', 'uptodown.com', 'getjar.com', '9apps.com', 'apkmonk.com'];
      const isAltApkStore = altApkStores.some(s => hostname === s || hostname.endsWith('.' + s));
      const isDirectApkDownload = pathname.endsWith('.apk') || pathname.includes('.apk?') || rawUrl.toLowerCase().includes('.apk');

      // Resolve package name from Play Store query (?id=...), path, or general string
      let extractedPackage = null;
      if (isPlayStore) {
        const pkgMatch = rawUrl.match(/[?&]id=([a-zA-Z0-9._]+)/i);
        if (pkgMatch) extractedPackage = pkgMatch[1];
      } else {
        const pkgInUrl = rawUrl.match(/\b(com|org|net|in)\.[a-zA-Z0-9._]{3,}\b/i);
        if (pkgInUrl) extractedPackage = pkgInUrl[0];
      }

      if (extractedPackage) {
        iocs.push({
          type: 'package',
          value: extractedPackage,
          source: isPlayStore ? 'google_play_store' : (isAppleStore ? 'apple_app_store' : 'app_store_url'),
          confidence: 0.98,
          notes: isPlayStore ? 'Google Play Package Identifier' : 'App Package Identifier'
        });

        // A. Look-alike Banking Package Typosquatting
        const bankKeywords = ['sbi', 'hdfc', 'icici', 'axis', 'pnb', 'paytm', 'phonepe', 'yono', 'jvvnl', 'aadhaar', 'epfo'];
        const pkgLower = extractedPackage.toLowerCase();
        const matchesBankWord = bankKeywords.some(b => pkgLower.includes(b));
        const isOfficialBankPkg = pkgLower.startsWith('com.sbi.') ||
                                  pkgLower.startsWith('com.hdfcbank.') ||
                                  pkgLower.startsWith('com.icicibank.') ||
                                  pkgLower.startsWith('com.axis.mobile') ||
                                  pkgLower.startsWith('com.pnb.') ||
                                  pkgLower.startsWith('net.one97.paytm') ||
                                  pkgLower.startsWith('com.phonepe.app') ||
                                  pkgLower.startsWith('in.gov.uidai.') ||
                                  pkgLower.startsWith('in.gov.') ||
                                  pkgLower.startsWith('in.org.npci.') ||
                                  pkgLower.startsWith('in.epfo.');

        if (matchesBankWord && !isOfficialBankPkg) {
          triggers.push({
            id: 'RULE_APP_LOOKALIKE_PACKAGE',
            category: Constants.CATEGORIES.IMPERSONATION,
            description: 'Deceptive package name mimicking official Indian banking or government application',
            severity: 'CRITICAL',
            evidence: `App Package: ${extractedPackage}`,
            weight: 25
          });
        }

        // B. Predatory Instant Loan / Extortion App Patterns
        const loanKeywords = [
          'quickcash', 'instantloan', 'fastrupee', 'easyloan', 'rupeeadvance',
          'creditking', 'salaryloan', 'cashadvance', 'pocketrupee', 'fastloan',
          'quickloan', 'easycash', 'cashloan', 'instantcash', 'fastcash',
          'speedloan', 'rupeeloan', 'paisaloan', 'creditplus', 'rupeeking'
        ];
        const isPredatoryLoan = loanKeywords.some(k => pkgLower.includes(k) || rawUrl.toLowerCase().includes(k));
        if (isPredatoryLoan) {
          triggers.push({
            id: 'RULE_APP_PREDATORY_LOAN',
            category: Constants.CATEGORIES.PAYMENT_SCAM,
            description: 'Predatory unauthorized instant loan app signature (associated with contact extortion & harassment)',
            severity: 'HIGH',
            evidence: `App Package: ${extractedPackage}`,
            weight: 25
          });
        }

        // C. Illegal Betting / Gambling App Distribution
        const bettingKeywords = ['teenpatti', 'sattamatka', 'cricketbet', 'aviatorsignal', 'colorprediction', 'wingo'];
        const isBettingApp = bettingKeywords.some(k => pkgLower.includes(k) || rawUrl.toLowerCase().includes(k));
        if (isBettingApp) {
          triggers.push({
            id: 'RULE_APP_ILLEGAL_BETTING',
            category: Constants.CATEGORIES.GAMBLING_BETTING,
            description: 'Unlicensed real-money betting or color-prediction gambling app package',
            severity: 'CRITICAL',
            evidence: `App Package: ${extractedPackage}`,
            weight: 25
          });
        }
      }

      // D. Direct APK Sideload Download URL
      if (isDirectApkDownload) {
        triggers.push({
          id: 'RULE_APP_DIRECT_APK_DOWNLOAD',
          category: Constants.CATEGORIES.CODE_ANOMALY,
          description: 'Direct APK sideloading download link bypassing Google Play Protect',
          severity: 'HIGH',
          evidence: pathname,
          weight: 20
        });
      }

      // E. Third-Party / Unofficial APK Store Distribution
      if (isAltApkStore) {
        triggers.push({
          id: 'RULE_APP_UNVERIFIED_APP_STORE',
          category: Constants.CATEGORIES.CODE_ANOMALY,
          description: 'Alternative unverified app repository known for distributing repacked and trojanized APKs',
          severity: 'MEDIUM',
          evidence: hostname,
          weight: 15
        });
      }

      return {
        triggers: Helpers && Helpers.deduplicateTriggers ? Helpers.deduplicateTriggers(triggers) : triggers,
        iocs: Helpers && Helpers.deduplicateIOCs ? Helpers.deduplicateIOCs(iocs) : iocs,
        details: {
          parsed: parsed,
          whois: whoisInfo || {
            registrar: 'Simulated / Unlisted',
            age_days: 14,
            created_date: 'Recent',
            ssl_issuer: parsed.protocol === 'https' ? 'Standard DV' : 'None',
            status: 'Offline Simulation'
          }
        }
      };
    }
  };

  return URLAnalyzer;
}));
