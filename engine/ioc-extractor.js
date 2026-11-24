/**
 * Rajasthan Police Hackathon (R4C) - PS01 Cyber Fraud Detection Platform
 * Team: Third Eye
 * File: engine/ioc-extractor.js
 * 
 * Step 1.6: Reusable IOC Extractor - Single Source of Truth for Identifiers.
 * Extracts Phone, UPI, URL, Email, Crypto, IFSC/Bank, APK Package.
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['../utils/constants', '../utils/helpers'], factory);
  } else if (typeof module === 'object' && module.exports) {
    const Constants = require('../utils/constants');
    const Helpers = require('../utils/helpers');
    module.exports = factory(Constants, Helpers);
  } else {
    root.ThirdEye = root.ThirdEye || {};
    root.ThirdEye.IOCExtractor = factory(root.ThirdEye.Constants, root.ThirdEye.Helpers);
  }
}(typeof self !== 'undefined' ? self : this, function (Constants, Helpers) {
  'use strict';

  // Fallbacks if loaded in standalone browser environment
  const UPI_HANDLES = (Constants && Constants.UPI_HANDLES) ? Constants.UPI_HANDLES : [
    'okaxis', 'okhdfcbank', 'okicici', 'oksbi', 'ybl', 'ibl', 'axl', 'ptsbi',
    'upi', 'paytm', 'gpay', 'phonepe', 'fbl', 'idfcbank', 'waaxis', 'sbi',
    'hdfcbank', 'icici', 'kotak', 'barodampay', 'federal', 'jupiteraxis', 'airtel'
  ];

  const upiPatternRegex = new RegExp(`[a-zA-Z0-9.\\-_]{2,}@(${UPI_HANDLES.join('|')})\\b`, 'gi');

  /**
   * Reusable IOC Extractor
   */
  const IOCExtractor = {

    /**
     * Extract all IOCs from given text/content
     * @param {string} text - Raw input text
     * @param {string} [source='content'] - Source descriptor
     * @returns {Array<import('../utils/helpers').IOC>}
     */
    extractAll: function (text, source = 'content') {
      if (!text || typeof text !== 'string') return [];

      const iocs = [];

      // 1. URLs
      const urls = this.extractUrls(text, source);
      iocs.push(...urls);

      // 2. UPI IDs
      const upis = this.extractUPI(text, source);
      iocs.push(...upis);

      // 3. Indian Phone Numbers
      const phones = this.extractPhones(text, source);
      iocs.push(...phones);

      // 4. Crypto Wallets
      const cryptos = this.extractCrypto(text, source);
      iocs.push(...cryptos);

      // 5. Emails (excluding UPI matches)
      const emails = this.extractEmails(text, source, upis.map(u => u.value.toLowerCase()));
      iocs.push(...emails);

      // 6. Bank IFSC & Account
      const bankDetails = this.extractBankDetails(text, source);
      iocs.push(...bankDetails);

      // 7. APK Package Names
      const packages = this.extractPackageNames(text, source);
      iocs.push(...packages);

      return Helpers && Helpers.deduplicateIOCs ? Helpers.deduplicateIOCs(iocs) : iocs;
    },

    /**
     * Extract URLs from text
     */
    extractUrls: function (text, source = 'content') {
      const results = [];
      const urlRegex = /(?:https?:\/\/|www\.)[a-zA-Z0-9.\-_~:/?#[\]@!$&'()*+,;=%]+/gi;
      const matches = text.match(urlRegex) || [];

      for (let url of matches) {
        url = url.replace(/[.,;!?)>]+$/, ''); // Strip trailing punctuation
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
          url = 'http://' + url;
        }
        results.push({
          type: 'url',
          value: url,
          source: source,
          confidence: 0.95
        });
      }

      // Also detect common shorteners without scheme (e.g. bit.ly/xyz)
      const shortenerRegex = /\b(bit\.ly|tinyurl\.com|cutt\.ly|rebrand\.ly|t\.ly|s\.id)\/[a-zA-Z0-9_\-]+/gi;
      const shortMatches = text.match(shortenerRegex) || [];
      for (const sm of shortMatches) {
        const fullUrl = 'https://' + sm.replace(/[.,;!?)>]+$/, '');
        if (!results.some(r => r.value === fullUrl)) {
          results.push({
            type: 'url',
            value: fullUrl,
            source: source,
            confidence: 0.98,
            notes: 'URL Shortener'
          });
        }
      }

      return results;
    },

    /**
     * Extract Indian UPI IDs
     */
    extractUPI: function (text, source = 'content') {
      const results = [];
      const matches = text.match(upiPatternRegex) || [];

      for (let upi of matches) {
        upi = upi.trim().toLowerCase();
        // Ignore generic emails that might match regex
        if (upi.includes('@gmail') || upi.includes('@yahoo') || upi.includes('@outlook')) continue;
        results.push({
          type: 'upi',
          value: upi,
          source: source,
          confidence: 0.95
        });
      }

      // Catch generic VPA patterns if preceded by UPI/VPA keyword
      const genericVpaRegex = /(?:upi(?:\s*id|\s*vpa)?|pay(?:\s*to)?|vpa)[:\s]+([a-zA-Z0-9.\-_]{2,}@[a-zA-Z]{2,30})/gi;
      let m;
      while ((m = genericVpaRegex.exec(text)) !== null) {
        const vpa = m[1].toLowerCase().trim();
        if (!results.some(r => r.value === vpa)) {
          results.push({
            type: 'upi',
            value: vpa,
            source: source,
            confidence: 0.90
          });
        }
      }

      return results;
    },

    /**
     * Extract Indian Phone Numbers (+91, 0-prefix, 10-digit starting with 6-9)
     */
    extractPhones: function (text, source = 'content') {
      const results = [];
      // Handles: +91 9876543210, +91-98765-43210, 09876543210, 9876543210
      // Negative lookbehind or context check to avoid capturing bank accounts
      const phoneRegex = /(?:(?:\+91[\-\s]?)?|0)?([6-9]\d{4}[\-\s]?\d{5})\b/g;
      const seen = new Set();
      let match;

      while ((match = phoneRegex.exec(text)) !== null) {
        const raw = match[0];
        const matchIndex = match.index;
        const precedingText = text.substring(Math.max(0, matchIndex - 15), matchIndex).toLowerCase();

        // Avoid matching if preceded by account keywords
        if (precedingText.includes('a/c') || precedingText.includes('acct') || precedingText.includes('account')) {
          continue;
        }

        const digitsOnly = match[1].replace(/[\-\s]/g, '');

        if (digitsOnly.length === 10) {
          const normalized = '+91' + digitsOnly;
          // Ignore false positives: repeated identical digits or sequential dummies
          if (/^(\d)\1{9}$/.test(digitsOnly) || digitsOnly === '1234567890') continue;

          if (!seen.has(normalized)) {
            seen.add(normalized);
            results.push({
              type: 'phone',
              value: normalized,
              source: source,
              confidence: raw.includes('+91') ? 0.95 : 0.85
            });
          }
        }
      }
      return results;
    },

    /**
     * Extract Email addresses
     */
    extractEmails: function (text, source = 'content', excludeUpis = []) {
      const results = [];
      const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;
      const matches = text.match(emailRegex) || [];

      for (let email of matches) {
        email = email.toLowerCase().trim();
        // Ensure not in UPI list
        if (excludeUpis && excludeUpis.includes(email)) continue;
        // Verify common TLD exists
        if (email.includes('.')) {
          results.push({
            type: 'email',
            value: email,
            source: source,
            confidence: 0.90
          });
        }
      }
      return results;
    },

    /**
     * Extract Crypto Wallets (BTC, ETH/ERC20, USDT TRC20)
     */
    extractCrypto: function (text, source = 'content') {
      const results = [];

      // Bitcoin (Legacy & SegWit)
      const btcRegex = /\b(bc1[a-zA-HJ-NP-Z0-9]{25,39}|[13][a-km-zA-HJ-NP-Z1-9]{25,34})\b/g;
      const btcMatches = text.match(btcRegex) || [];
      for (const btc of btcMatches) {
        results.push({
          type: 'crypto',
          value: btc,
          source: source,
          confidence: 0.92,
          notes: 'Bitcoin (BTC) Wallet'
        });
      }

      // Ethereum / ERC20 (0x + 40 hex chars)
      const ethRegex = /\b(0x[a-fA-F0-9]{40})\b/g;
      const ethMatches = text.match(ethRegex) || [];
      for (const eth of ethMatches) {
        results.push({
          type: 'crypto',
          value: eth,
          source: source,
          confidence: 0.92,
          notes: 'Ethereum (ETH) / ERC-20 Address'
        });
      }

      // TRON / USDT TRC-20 (Starts with T, 32-34 alphanumeric)
      const trc20Regex = /\b(T[1-9A-HJ-NP-Za-km-z]{31,34})\b/g;
      const trcMatches = text.match(trc20Regex) || [];
      for (const trc of trcMatches) {
        results.push({
          type: 'crypto',
          value: trc,
          source: source,
          confidence: 0.90,
          notes: 'TRON / USDT (TRC-20) Wallet'
        });
      }

      return results;
    },

    /**
     * Extract Bank details (IFSC code, Bank Account)
     */
    extractBankDetails: function (text, source = 'content') {
      const results = [];

      // Indian IFSC Code (4 letters, 0, 6 alphanumeric)
      const ifscRegex = /\b([A-Z]{4}0[A-Z0-9]{6})\b/g;
      const ifscMatches = text.match(ifscRegex) || [];
      for (const ifsc of ifscMatches) {
        results.push({
          type: 'bank_ifsc',
          value: ifsc,
          source: source,
          confidence: 0.95,
          notes: 'Indian Financial System Code (IFSC)'
        });
      }

      // Bank Account Number when preceded by Account / A/c
      const acctRegex = /(?:a\/c|acct|account(?:\s*no|\s*number)?)[:\s#]+(\d{9,18})\b/gi;
      let m;
      while ((m = acctRegex.exec(text)) !== null) {
        results.push({
          type: 'bank_account',
          value: m[1],
          source: source,
          confidence: 0.88,
          notes: 'Bank Account Number'
        });
      }

      return results;
    },

    /**
     * Extract Android Package Names (e.g. com.sbi.banking, com.quickcash.loan)
     */
    extractPackageNames: function (text, source = 'content') {
      const results = [];
      const pkgRegex = /\b(com|org|net|in|io)\.[a-zA-Z0-9_]{2,}(\.[a-zA-Z0-9_]{2,})+\b/g;
      const matches = text.match(pkgRegex) || [];

      for (const pkg of matches) {
        // Disregard if it's part of a URL or domain
        if (text.includes('//' + pkg) || pkg.endsWith('.com')) continue;
        results.push({
          type: 'package',
          value: pkg,
          source: source,
          confidence: 0.85,
          notes: 'Android Application Package'
        });
      }
      return results;
    }
  };

  return IOCExtractor;
}));
