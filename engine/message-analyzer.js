/**
 * Rajasthan Police Hackathon (R4C) - PS01 Cyber Fraud Detection Platform
 * Team: Third Eye
 * File: engine/message-analyzer.js
 * 
 * Step 1.4: Deterministic SMS / WhatsApp / Email Message Analyzer
 * Transparent, explainable rule engine for urgency, impersonation, coercion, and IOCs.
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['../utils/constants', '../utils/helpers', './ioc-extractor'], factory);
  } else if (typeof module === 'object' && module.exports) {
    const Constants = require('../utils/constants');
    const Helpers = require('../utils/helpers');
    const IOCExtractor = require('./ioc-extractor');
    let blacklists = null;
    let keywords = null;
    try {
      blacklists = require('../data/blacklists.json');
      keywords = require('../data/keywords.json');
    } catch (e) {
      // Handled via defaults
    }
    module.exports = factory(Constants, Helpers, IOCExtractor, blacklists, keywords);
  } else {
    root.ThirdEye = root.ThirdEye || {};
    root.ThirdEye.MessageAnalyzer = factory(
      root.ThirdEye.Constants,
      root.ThirdEye.Helpers,
      root.ThirdEye.IOCExtractor,
      root.ThirdEye.Data && root.ThirdEye.Data.blacklists,
      root.ThirdEye.Data && root.ThirdEye.Data.keywords
    );
  }
}(typeof self !== 'undefined' ? self : this, function (Constants, Helpers, IOCExtractor, injectedBlacklists, injectedKeywords) {
  'use strict';

  // Fallback default dictionaries if not injected
  const DEFAULT_KEYWORDS = {
    urgency_keywords: [
      'urgent', 'immediately', 'within 2 hours', 'within 24 hours',
      'account will be closed', 'account suspended', 'blocked today',
      'tonight 9:30 pm', 'electricity disconnected', 'power cut',
      'card deactivated', 'sim will be blocked', 'legal action', 'arrest warrant'
    ],
    impersonation_brands: [
      'sbi', 'state bank', 'hdfc', 'icici', 'axis bank', 'pnb', 'rbi',
      'income tax', 'traffic police', 'e-challan', 'rajasthan police',
      'jvvnl', 'jdvvnl', 'bijli vibhag', 'india post', 'speed post',
      'uidai', 'aadhaar', 'pm-kisan', 'epfo', 'cyber crime'
    ],
    action_demands: [
      'click here', 'download apk', 'download now', 'install app',
      'verify now', 'update kyc', 'complete kyc', 'pay immediately',
      'redeem reward points', 'submit otp', 'share otp'
    ],
    indian_scam_contexts: [
      'kyc pending', 'pan card link', 'aadhaar update', 'electricity bill unpaid',
      'parcel stuck', 'customs fee', 'lottery prize', 'part time job daily',
      'youtube like job', 'instant loan without cibil', 'echallan fine'
    ]
  };

  const DEFAULT_BLACKLISTS = {
    domains: ['sbi-kyc-verification.xyz', 'bijli-bill-alert.top', 'indiapost-track-parcel.click'],
    phones: ['+919876543210', '+918899001122', '+919123456789'],
    upis: ['refund.sbi.kyc@okaxis', 'bijlihelpdesk.raj@ptsbi', 'indiapost.parcelfee@ybl']
  };

  const MessageAnalyzer = {
    blacklists: injectedBlacklists || DEFAULT_BLACKLISTS,
    keywords: injectedKeywords || DEFAULT_KEYWORDS,

    /**
     * Configure or update dictionaries dynamically
     */
    configure: function (opts) {
      if (opts.blacklists) this.blacklists = opts.blacklists;
      if (opts.keywords) this.keywords = opts.keywords;
    },

    /**
     * Analyze message text
     * @param {string} text - Raw message string
     * @param {Object} [meta] - Sender info or channel
     * @returns {{ triggers: Array<import('../utils/helpers').Trigger>, iocs: Array<import('../utils/helpers').IOC> }}
     */
    analyze: function (text, meta = {}) {
      if (!text || typeof text !== 'string') {
        return { triggers: [], iocs: [] };
      }

      const triggers = [];
      const lower = text.toLowerCase();
      const weights = (Constants && Constants.WEIGHTS && Constants.WEIGHTS.MESSAGE) ? Constants.WEIGHTS.MESSAGE : {
        HIGH_URGENCY: 15,
        IMPERSONATION: 15,
        ACTION_DEMAND: 10,
        INDIAN_CONTEXT: 10,
        BLACKLIST_PHONE: 15,
        BLACKLIST_UPI: 15,
        BLACKLIST_DOMAIN: 25,
        URL_SHORTENER: 10
      };

      // 1. Extract all IOCs
      const iocs = IOCExtractor.extractAll(text, 'message_body');

      // Add sender phone if passed in metadata
      if (meta && meta.sender) {
        const senderPhones = IOCExtractor.extractPhones(meta.sender, 'message_header');
        iocs.push(...senderPhones);
      }

      // 2. Check Urgency Keywords
      const urgencyList = (this.keywords && this.keywords.urgency_keywords) || DEFAULT_KEYWORDS.urgency_keywords;
      const matchedUrgency = urgencyList.filter(k => lower.includes(k.toLowerCase()));
      if (matchedUrgency.length > 0) {
        triggers.push({
          id: 'RULE_MSG_URGENCY',
          category: Constants.CATEGORIES.URGENCY,
          description: 'Artificial urgency or deadline coercion detected to panic victim',
          severity: 'HIGH',
          evidence: matchedUrgency.slice(0, 3).join(', '),
          weight: weights.HIGH_URGENCY
        });
      }

      // 3. Check Authority / Brand Impersonation (whole word match for short brands)
      const brandList = (this.keywords && this.keywords.impersonation_brands) || DEFAULT_KEYWORDS.impersonation_brands;
      const matchedBrands = brandList.filter(b => {
        const bl = b.toLowerCase();
        if (bl.length <= 4) {
          const safeBl = (Helpers && Helpers.escapeRegExp) ? Helpers.escapeRegExp(bl) : bl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const regex = new RegExp(`\\b${safeBl}\\b`, 'i');
          return regex.test(text);
        }
        return lower.includes(bl);
      });
      if (matchedBrands.length > 0) {
        triggers.push({
          id: 'RULE_MSG_IMPERSONATION',
          category: Constants.CATEGORIES.IMPERSONATION,
          description: 'Impersonation of trusted government authority, utility, or financial bank',
          severity: 'CRITICAL',
          evidence: matchedBrands.slice(0, 3).join(', '),
          weight: weights.IMPERSONATION
        });
      }

      // 4. Check Action Demands / Coercive Links
      const actionList = (this.keywords && this.keywords.action_demands) || DEFAULT_KEYWORDS.action_demands;
      const matchedActions = actionList.filter(k => lower.includes(k.toLowerCase()));
      if (matchedActions.length > 0) {
        triggers.push({
          id: 'RULE_MSG_ACTION_DEMAND',
          category: Constants.CATEGORIES.ACTION_DEMAND,
          description: 'High-pressure call-to-action prompting click, payment, or app download',
          severity: 'MEDIUM',
          evidence: matchedActions.slice(0, 3).join(', '),
          weight: weights.ACTION_DEMAND
        });
      }

      // 5. Check Indian Cyber Fraud Context Patterns
      const contextList = (this.keywords && this.keywords.indian_scam_contexts) || DEFAULT_KEYWORDS.indian_scam_contexts;
      const matchedContexts = contextList.filter(k => lower.includes(k.toLowerCase()));
      if (matchedContexts.length > 0) {
        triggers.push({
          id: 'RULE_MSG_INDIAN_SCAM_PATTERN',
          category: Constants.CATEGORIES.PAYMENT_SCAM,
          description: 'Matches known modus operandi documented by State Cyber Police / I4C',
          severity: 'HIGH',
          evidence: matchedContexts.slice(0, 2).join(', '),
          weight: weights.INDIAN_CONTEXT
        });
      }

      // 6. Check Extracted IOC Presence
      const upiIocs = iocs.filter(i => i.type === 'upi');
      if (upiIocs.length > 0) {
        triggers.push({
          id: 'RULE_IOC_UPI_IN_MSG',
          category: Constants.CATEGORIES.PAYMENT_SCAM,
          description: 'Direct UPI payment address embedded in unsolicited message',
          severity: 'HIGH',
          evidence: upiIocs.map(u => u.value).join(', '),
          weight: weights.UPI_PRESENT || 10
        });
      }

      const phoneIocs = iocs.filter(i => i.type === 'phone');
      if (phoneIocs.length > 0) {
        triggers.push({
          id: 'RULE_IOC_PHONE_IN_MSG',
          category: Constants.CATEGORIES.ACTION_DEMAND,
          description: 'Call-back contact number provided for social engineering',
          severity: 'LOW',
          evidence: phoneIocs.map(p => p.value).join(', '),
          weight: weights.PHONE_PRESENT || 5
        });
      }

      // 7. Check Blacklist Matches (Phone, UPI, Domain)
      const blacklistedPhones = (this.blacklists && this.blacklists.phones) || [];
      for (const phone of phoneIocs) {
        const cleanVal = phone.value.replace(/[\-\s]/g, '');
        const matched = blacklistedPhones.some(bp => cleanVal.endsWith(bp.replace(/[\-\s+]/g, '')));
        if (matched) {
          triggers.push({
            id: 'RULE_BLACKLIST_PHONE',
            category: Constants.CATEGORIES.BLACKLIST,
            description: 'Phone number matches known cybercrime fraudster registry (1930 / I4C)',
            severity: 'CRITICAL',
            evidence: phone.value,
            weight: weights.BLACKLIST_PHONE
          });
          phone.flagged = true;
        }
      }

      const blacklistedUpis = (this.blacklists && this.blacklists.upis) || [];
      for (const upi of upiIocs) {
        const matched = blacklistedUpis.some(bu => bu.toLowerCase() === upi.value.toLowerCase());
        if (matched) {
          triggers.push({
            id: 'RULE_BLACKLIST_UPI',
            category: Constants.CATEGORIES.BLACKLIST,
            description: 'UPI VPA matches active mule account database flagged by Cyber Police',
            severity: 'CRITICAL',
            evidence: upi.value,
            weight: weights.BLACKLIST_UPI
          });
          upi.flagged = true;
        }
      }

      const urlIocs = iocs.filter(i => i.type === 'url');
      const blacklistedDomains = (this.blacklists && this.blacklists.domains) || [];
      for (const urlIoc of urlIocs) {
        // Check for URL shorteners
        const isShortener = (Constants.URL_SHORTENERS || []).some(s => urlIoc.value.includes(s));
        if (isShortener) {
          triggers.push({
            id: 'RULE_URL_SHORTENER',
            category: Constants.CATEGORIES.URL_ANOMALY,
            description: 'URL shortener hides actual destination host to evade filters',
            severity: 'HIGH',
            evidence: urlIoc.value,
            weight: weights.URL_SHORTENER
          });
        }

        // Check if destination domain in blacklist
        const matchedDomain = blacklistedDomains.find(bd => urlIoc.value.toLowerCase().includes(bd.toLowerCase()));
        if (matchedDomain) {
          triggers.push({
            id: 'RULE_BLACKLIST_DOMAIN',
            category: Constants.CATEGORIES.BLACKLIST,
            description: 'Embedded URL points to active phishing / malicious domain in police blacklist',
            severity: 'CRITICAL',
            evidence: matchedDomain,
            weight: weights.BLACKLIST_DOMAIN
          });
          urlIoc.flagged = true;
        }
      }

      return {
        triggers: Helpers && Helpers.deduplicateTriggers ? Helpers.deduplicateTriggers(triggers) : triggers,
        iocs: Helpers && Helpers.deduplicateIOCs ? Helpers.deduplicateIOCs(iocs) : iocs
      };
    }
  };

  return MessageAnalyzer;
}));
