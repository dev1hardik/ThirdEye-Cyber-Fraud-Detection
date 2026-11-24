/**
 * Rajasthan Police Hackathon (R4C) - PS01 Cyber Fraud Detection Platform
 * Team: Third Eye
 * File: utils/helpers.js
 * 
 * JSDoc Type Definitions and reusable utility functions.
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['./constants'], factory);
  } else if (typeof module === 'object' && module.exports) {
    const Constants = require('./constants');
    module.exports = factory(Constants);
  } else {
    root.ThirdEye = root.ThirdEye || {};
    root.ThirdEye.Helpers = factory(root.ThirdEye.Constants);
  }
}(typeof self !== 'undefined' ? self : this, function (Constants) {
  'use strict';

  /**
   * =========================================================================
   * 1.2 CORE DATA TYPES (TypeScript-style JSDoc)
   * =========================================================================
   */

  /**
   * @typedef {'message' | 'url' | 'apk' | 'website'} InputType
   */

  /**
   * @typedef {'HIGH' | 'MEDIUM' | 'LOW'} RiskLevel
   */

  /**
   * @typedef {'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'} SeverityLevel
   */

  /**
   * @typedef {'url' | 'phone' | 'upi' | 'email' | 'crypto' | 'bank_ifsc' | 'bank_account' | 'package'} IOCType
   */

  /**
   * @typedef {Object} Trigger
   * @property {string} id - Unique trigger identifier (e.g. 'RULE_URGENCY_DEADLINE')
   * @property {string} category - Category description
   * @property {string} description - Human-friendly explanation of why triggered
   * @property {SeverityLevel} severity - CRITICAL | HIGH | MEDIUM | LOW
   * @property {string} evidence - The exact text snippet or evidence that triggered it
   * @property {number} weight - Points attributed to this trigger
   */

  /**
   * @typedef {Object} IOC
   * @property {IOCType} type - Type of IOC
   * @property {string} value - Normalized value of the IOC
   * @property {string} source - Where it was extracted from (e.g. 'sms_body', 'sms_url', 'manifest')
   * @property {number} confidence - Confidence score 0.0 - 1.0
   * @property {string} [notes] - Optional context notes
   */

  /**
   * @typedef {Object} AnalysisInput
   * @property {InputType} type - 'message'|'url'|'apk'|'website'
   * @property {string} content - Raw text, URL, pasted HTML, or filename
   * @property {File} [file] - Optional uploaded file object (for APK)
   * @property {Object} [metadata] - Optional sender info, channel, received time
   */

  /**
   * @typedef {Object} RiskResult
   * @property {RiskLevel} level - 'HIGH'|'MEDIUM'|'LOW'
   * @property {number} score - Score between 0 and 100
   * @property {Trigger[]} triggers - Array of triggered rules explaining WHY
   * @property {IOC[]} iocs - Array of extracted Indicators of Compromise
   * @property {string} explanation - Transparent human-readable verdict
   * @property {Object} breakdown - Detailed point breakdown for jury audit
   */

  /**
   * @typedef {Object} CaseRecord
   * @property {string} id - Unique case ID (e.g. 'RJ-CYBER-2026-A109')
   * @property {string} timestamp - ISO timestamp string
   * @property {AnalysisInput} input - Original input analyzed
   * @property {RiskResult} result - Final risk result and triggers
   * @property {string} reportHash - SHA-256 digital signature placeholder
   * @property {string} [investigatorNotes] - Police notes
   * @property {string} [status] - 'NEW' | 'UNDER_INVESTIGATION' | 'ESCALATED' | 'CLOSED'
   */

  /**
   * =========================================================================
   * UTILITY FUNCTIONS
   * =========================================================================
   */

  /**
   * Simple, fast synchronous SHA-256 implementation (works in any JS environment)
   * Used for court-admissible evidence hash / digital signature placeholder
   * @param {string} ascii - String to hash
   * @returns {string} - Hex string (64 characters)
   */
  function sha256(ascii) {
    function rightRotate(value, amount) {
      return (value >>> amount) | (value << (32 - amount));
    }
    const mathPow = Math.pow;
    const maxWord = mathPow(2, 32);
    let i, j;
    let result = '';

    const words = [];
    const asciiBitLength = ascii.length * 8;
    
    let hash = [];
    const k = [];
    let primeCounter = 0;

    const isComposite = {};
    for (let candidate = 2; primeCounter < 64; candidate++) {
      if (!isComposite[candidate]) {
        for (i = 0; i < 313; i += candidate) {
          isComposite[i] = candidate;
        }
        hash[primeCounter] = (mathPow(candidate, 0.5) * maxWord) | 0;
        k[primeCounter++] = (mathPow(candidate, 1 / 3) * maxWord) | 0;
      }
    }
    hash = hash.slice(0, 8);

    ascii += '\x80';
    while ((ascii.length % 64) - 56) ascii += '\x00';
    for (i = 0; i < ascii.length; i++) {
      j = ascii.charCodeAt(i);
      words[i >> 2] |= j << (((3 - i) % 4) * 8);
    }
    words[words.length] = (asciiBitLength / maxWord) | 0;
    words[words.length] = asciiBitLength | 0;

    for (j = 0; j < words.length;) {
      const w = words.slice(j, j += 16);
      const oldHash = hash;
      hash = hash.slice(0, 8);

      for (i = 0; i < 64; i++) {
        const w15 = w[i - 15], w2 = w[i - 2];
        const a = hash[0], e = hash[4];
        const temp1 = hash[7]
          + (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25))
          + ((e & hash[5]) ^ ((~e) & hash[6]))
          + k[i]
          + (w[i] = (i < 16) ? (w[i] | 0) : (
            w[i - 16]
            + (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3))
            + w[i - 7]
            + (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10))
          ) | 0);
        const temp2 = (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22))
          + ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]));

        hash = [(temp1 + temp2) | 0].concat(hash);
        hash[4] = (hash[4] + temp1) | 0;
      }

      for (i = 0; i < 8; i++) {
        hash[i] = (hash[i] + oldHash[i]) | 0;
      }
    }

    for (i = 0; i < 8; i++) {
      for (let b = 3; b >= 0; b--) {
        const byte = (hash[i] >> (8 * b)) & 255;
        result += ((byte < 16 ? '0' : '') + byte.toString(16));
      }
    }
    return result;
  }

  /**
   * Generates official Rajasthan Police Case ID
   * Example: RJ-CYBER-2026-F982B
   * @returns {string}
   */
  function generateCaseId() {
    const year = new Date().getFullYear();
    const rand = Math.random().toString(36).substring(2, 7).toUpperCase();
    return `RJ-CYBER-${year}-${rand}`;
  }

  /**
   * Calculate Levenshtein Distance between two strings
   * Used to detect typosquatting / look-alike domains (e.g. 'sbl' vs 'sbi')
   * @param {string} a 
   * @param {string} b 
   * @returns {number}
   */
  function levenshtein(a, b) {
    if (!a || !b) return (a || b).length;
    const al = a.length;
    const bl = b.length;
    const matrix = [];

    for (let i = 0; i <= al; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= bl; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= al; i++) {
      for (let j = 1; j <= bl; j++) {
        if (a.charAt(i - 1) === b.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substitution
            matrix[i][j - 1] + 1,     // insertion
            matrix[i - 1][j] + 1      // deletion
          );
        }
      }
    }
    return matrix[al][bl];
  }

  /**
   * Check if a domain is a look-alike / typosquatted version of a legitimate brand
   * @param {string} domain 
   * @returns {{isLookalike: boolean, targetBrand?: string, targetDomain?: string, distance?: number}}
   */
  function checkLookalikeDomain(domain) {
    if (!domain) return { isLookalike: false };
    const cleanDomain = domain.toLowerCase().replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0].split(':')[0];
    const targets = Constants ? Constants.LEGITIMATE_TARGETS : [];

    // Pre-flight whitelist: If domain is an authentic bank, government, or institutional domain, it is NEVER a lookalike
    const isWhitelisted = targets.some(target => 
      cleanDomain === target.domain || cleanDomain.endsWith('.' + target.domain)
    ) || cleanDomain.endsWith('.sbi') || cleanDomain.endsWith('.gov.in') || cleanDomain.endsWith('.nic.in');

    if (isWhitelisted) {
      return { isLookalike: false, isLegitimate: true };
    }

    for (const target of targets) {

      // Check if domain contains brand name or pattern but is not official
      const domainParts = cleanDomain.split('.');
      const mainPart = domainParts.length > 2 ? domainParts[domainParts.length - 2] : domainParts[0];

      // Targets keywords e.g. 'hdfc', 'sbi', 'icici', 'axis', 'pnb'
      const brandKeys = [
        target.domain.split('.')[0],
        target.name.toLowerCase().replace(/\s+/g, '')
      ];
      if (target.pattern) {
        brandKeys.push(target.pattern.source.toLowerCase());
      }

      for (const brand of brandKeys) {
        if (!brand || brand.length < 3) continue;

        // Typo check on main domain label (e.g. sbl vs sbi, hdfcc vs hdfc)
        const dist = levenshtein(mainPart, brand);
        if (dist > 0 && dist <= 2 && Math.abs(mainPart.length - brand.length) <= 2) {
          return {
            isLookalike: true,
            targetBrand: target.name,
            targetDomain: target.domain,
            distance: dist,
            reason: `Typosquatting of ${target.name} (edit distance: ${dist})`
          };
        }

        // Subdomain or hyphenated embedding (e.g. sbi-update.xyz or sbi.phishing.com)
        if (cleanDomain.includes(brand) && !cleanDomain.endsWith('.' + target.domain) && cleanDomain !== target.domain) {
          return {
            isLookalike: true,
            targetBrand: target.name,
            targetDomain: target.domain,
            distance: 0,
            reason: `Deceptive brand name '${brand}' embedded in non-official domain`
          };
        }
      }
    }

    return { isLookalike: false };
  }

  /**
   * Escape special characters in string for safe use in RegExp
   * @param {string} string 
   * @returns {string}
   */
  function escapeRegExp(string) {
    if (!string) return '';
    return String(string).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * Sanitize string for HTML display (Prevents XSS)
   * @param {string} str 
   * @returns {string}
   */
  function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')
      .replace(/\//g, '&#x2F;');
  }

  /**
   * Format ISO date string to Indian Standard Time (IST) readable format
   * @param {string|Date} date 
   * @returns {string}
   */
  function formatIST(date) {
    const d = date ? new Date(date) : new Date();
    return d.toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      dateStyle: 'medium',
      timeStyle: 'medium'
    }) + ' IST';
  }

  /**
   * Deduplicate IOC array by type and value
   * @param {IOC[]} iocs 
   * @returns {IOC[]}
   */
  function deduplicateIOCs(iocs) {
    if (!Array.isArray(iocs)) return [];
    const seen = new Set();
    const result = [];
    for (const ioc of iocs) {
      if (!ioc || !ioc.value) continue;
      const key = `${ioc.type}:::${ioc.value.toLowerCase().trim()}`;
      if (!seen.has(key)) {
        seen.add(key);
        result.push(ioc);
      }
    }
    return result;
  }

  /**
   * Deduplicate Triggers by id
   * @param {Trigger[]} triggers 
   * @returns {Trigger[]}
   */
  function deduplicateTriggers(triggers) {
    if (!Array.isArray(triggers)) return [];
    const seen = new Set();
    const result = [];
    for (const t of triggers) {
      if (!t || !t.id) continue;
      if (!seen.has(t.id)) {
        seen.add(t.id);
        result.push(t);
      }
    }
    return result;
  }

  return {
    sha256: sha256,
    generateCaseId: generateCaseId,
    levenshtein: levenshtein,
    checkLookalikeDomain: checkLookalikeDomain,
    escapeHtml: escapeHtml,
    escapeRegExp: escapeRegExp,
    formatIST: formatIST,
    formatDateIST: formatIST,
    deduplicateIOCs: deduplicateIOCs,
    deduplicateTriggers: deduplicateTriggers
  };
}));
