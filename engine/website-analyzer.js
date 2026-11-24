/**
 * Rajasthan Police Hackathon (R4C) - PS01 Cyber Fraud Detection Platform
 * Team: Third Eye
 * File: engine/website-analyzer.js
 * 
 * Step 1.8: Static Website Content, MLM & Financial Fraud Analyzer
 * Analyzes Ponzi schemes, MLM matrices, illegal betting, fake regulatory badges, and payments.
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['../utils/constants', '../utils/helpers', './ioc-extractor', './url-analyzer'], factory);
  } else if (typeof module === 'object' && module.exports) {
    const Constants = require('../utils/constants');
    const Helpers = require('../utils/helpers');
    const IOCExtractor = require('./ioc-extractor');
    const URLAnalyzer = require('./url-analyzer');
    let blacklists = null;
    let keywords = null;
    let whoisDb = null;
    try {
      blacklists = require('../data/blacklists.json');
      keywords = require('../data/keywords.json');
      whoisDb = require('../data/mock-whois.json');
    } catch (e) {
      // Handled via defaults
    }
    module.exports = factory(Constants, Helpers, IOCExtractor, URLAnalyzer, blacklists, keywords, whoisDb);
  } else {
    root.ThirdEye = root.ThirdEye || {};
    root.ThirdEye.WebsiteAnalyzer = factory(
      root.ThirdEye.Constants,
      root.ThirdEye.Helpers,
      root.ThirdEye.IOCExtractor,
      root.ThirdEye.URLAnalyzer,
      root.ThirdEye.Data && root.ThirdEye.Data.blacklists,
      root.ThirdEye.Data && root.ThirdEye.Data.keywords,
      root.ThirdEye.Data && root.ThirdEye.Data.whois
    );
  }
}(typeof self !== 'undefined' ? self : this, function (Constants, Helpers, IOCExtractor, URLAnalyzer, injectedBlacklists, injectedKeywords, injectedWhois) {
  'use strict';

  const DEFAULT_KEYWORDS = {
    mlm_ponzi_keywords: [
      'guaranteed returns', 'fixed daily profit', 'daily roi', 'compound interest daily',
      'risk-free investment', 'double your money', '200% return', 'referral bonus',
      'downline income', 'upline bonus', 'binary income', 'matrix plan', 'level income',
      'auto pool income'
    ],
    betting_gambling_keywords: [
      'cricket betting id', 'online casino real money', 'teen patti real cash',
      'rummy real money', 'color trading', 'wingo prediction', 'aviator hack'
    ],
    fake_regulatory_claims: [
      'sebi registered', 'rbi approved', 'govt of india approved',
      'ministry of finance certified', 'licensed nbfc'
    ]
  };

  const WebsiteAnalyzer = {
    blacklists: injectedBlacklists || { domains: [], upis: [] },
    keywords: injectedKeywords || DEFAULT_KEYWORDS,
    whoisDb: (injectedWhois && injectedWhois.domains) ? injectedWhois.domains : {},

    /**
     * Strip HTML tags to get pure visible text for keyword evaluation safely (ReDoS resistant)
     * @param {string} html 
     * @returns {string}
     */
    stripHtml: function (html) {
      if (!html || typeof html !== 'string') return '';
      // Limit to max 2MB for analysis safety to prevent memory exhaustion
      const boundedHtml = html.length > 2000000 ? html.substring(0, 2000000) : html;
      return boundedHtml
        .replace(/<script\b[\s\S]*?(?:<\/script>|$)/gi, ' ')
        .replace(/<style\b[\s\S]*?(?:<\/style>|$)/gi, ' ')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;/gi, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    },

    /**
     * Analyze website HTML content and/or URL
     * @param {string} htmlContent - Raw HTML source or page text
     * @param {string} [siteUrl] - Optional URL of the website
     * @returns {{ triggers: Array<import('../utils/helpers').Trigger>, iocs: Array<import('../utils/helpers').IOC>, details: Object }}
     */
    analyze: function (htmlContent, siteUrl = '') {
      const triggers = [];
      const iocs = [];
      const content = htmlContent || '';
      const textOnly = this.stripHtml(content).toLowerCase();
      const rawLower = content.toLowerCase();

      const weights = (Constants && Constants.WEIGHTS && Constants.WEIGHTS.WEBSITE) ? Constants.WEIGHTS.WEBSITE : {
        GUARANTEED_RETURNS_PONZI: 25,
        MLM_BINARY_SCHEME: 15,
        ILLEGAL_BETTING: 20,
        FAKE_REGULATORY_SEBI_RBI: 20,
        PAYMENT_IDENTIFIERS: 15,
        DOMAIN_ANOMALY: 15,
        BLACKLIST_MATCH: 20
      };

      // 1. If siteUrl provided, run URL analysis first
      if (siteUrl && URLAnalyzer) {
        const urlRes = URLAnalyzer.analyze(siteUrl);
        triggers.push(...urlRes.triggers);
        iocs.push(...urlRes.iocs);
      }

      // 2. Extract IOCs from page HTML (UPIs, Crypto wallets, Phones, Emails, External URLs)
      const pageIocs = IOCExtractor.extractAll(content, 'website_body');
      for (const item of pageIocs) {
        if (!iocs.some(i => i.value.toLowerCase() === item.value.toLowerCase())) {
          iocs.push(item);
        }
      }

      // 3. Guaranteed Returns & Ponzi Scheme Keywords
      const ponziWords = (this.keywords && this.keywords.mlm_ponzi_keywords) || DEFAULT_KEYWORDS.mlm_ponzi_keywords;
      const matchedPonzi = ponziWords.filter(w => textOnly.includes(w.toLowerCase()) || rawLower.includes(w.toLowerCase()));

      const hasGuaranteedReturns = matchedPonzi.some(w => 
        w.includes('guaranteed') || w.includes('daily profit') || w.includes('daily roi') || w.includes('double your money') || w.includes('200%')
      );

      if (hasGuaranteedReturns) {
        triggers.push({
          id: 'RULE_WEB_PONZI_RETURNS',
          category: Constants.CATEGORIES.PONZI_MLM,
          description: 'Unrealistic guaranteed high-yield investment returns / Ponzi doubling scheme',
          severity: 'CRITICAL',
          evidence: matchedPonzi.filter(w => w.includes('guaranteed') || w.includes('roi') || w.includes('double') || w.includes('200%')).join(', '),
          weight: weights.GUARANTEED_RETURNS_PONZI
        });
      }

      // 4. Multi-Level Marketing (MLM) / Binary Matrix Schemes
      const hasMlmMatrix = matchedPonzi.some(w => 
        w.includes('downline') || w.includes('upline') || w.includes('binary') || w.includes('matrix') || w.includes('level income') || w.includes('referral') || w.includes('auto pool')
      );

      if (hasMlmMatrix) {
        triggers.push({
          id: 'RULE_WEB_MLM_MATRIX',
          category: Constants.CATEGORIES.PONZI_MLM,
          description: 'Pyramid / Multi-Tier MLM referral structure (banned under Prize Chits and Money Circulation Schemes Act)',
          severity: 'HIGH',
          evidence: matchedPonzi.filter(w => w.includes('downline') || w.includes('binary') || w.includes('level') || w.includes('matrix') || w.includes('referral') || w.includes('auto pool')).join(', '),
          weight: weights.MLM_BINARY_SCHEME
        });
      }

      // 5. Illegal Betting / Gambling Platforms
      const bettingWords = (this.keywords && this.keywords.betting_gambling_keywords) || DEFAULT_KEYWORDS.betting_gambling_keywords;
      const matchedBetting = bettingWords.filter(w => textOnly.includes(w.toLowerCase()) || rawLower.includes(w.toLowerCase()));

      if (matchedBetting.length > 0) {
        triggers.push({
          id: 'RULE_WEB_ILLEGAL_BETTING',
          category: Constants.CATEGORIES.GAMBLING_BETTING,
          description: 'Unlicensed real-money betting, casino, or color-prediction gambling service',
          severity: 'CRITICAL',
          evidence: matchedBetting.join(', '),
          weight: weights.ILLEGAL_BETTING
        });
      }

      // 6. Fake Regulatory Claims (SEBI / RBI deception)
      const regClaims = (this.keywords && this.keywords.fake_regulatory_claims) || DEFAULT_KEYWORDS.fake_regulatory_claims;
      const matchedClaims = regClaims.filter(c => textOnly.includes(c.toLowerCase()) || rawLower.includes(c.toLowerCase()));

      if (matchedClaims.length > 0) {
        triggers.push({
          id: 'RULE_WEB_FAKE_REGULATORY',
          category: Constants.CATEGORIES.REGULATORY_FRAUD,
          description: 'Deceptive claim of official SEBI registration / RBI endorsement to induce false trust',
          severity: 'CRITICAL',
          evidence: matchedClaims.join(', '),
          weight: weights.FAKE_REGULATORY_SEBI_RBI
        });
      }

      // 7. Payment Identifiers on Website (UPI VPAs / Crypto Wallets)
      const upiFound = iocs.filter(i => i.type === 'upi');
      const cryptoFound = iocs.filter(i => i.type === 'crypto');

      if (upiFound.length > 0 || cryptoFound.length > 0) {
        const paymentEvidence = [];
        if (upiFound.length > 0) paymentEvidence.push(`UPI: ${upiFound.map(u => u.value).join(', ')}`);
        if (cryptoFound.length > 0) paymentEvidence.push(`Crypto: ${cryptoFound.map(c => c.value).join(', ')}`);

        triggers.push({
          id: 'RULE_WEB_EXTRACTED_PAYMENTS',
          category: Constants.CATEGORIES.PAYMENT_SCAM,
          description: 'Direct unregulated payment collection via retail UPI handles and/or anonymous crypto wallets',
          severity: 'HIGH',
          evidence: paymentEvidence.join(' | '),
          weight: weights.PAYMENT_IDENTIFIERS
        });
      }

      // 8. WhatsApp / Telegram Direct Action Channels
      const hasSocialRedirect = rawLower.includes('wa.me/') ||
                                rawLower.includes('api.whatsapp.com') ||
                                rawLower.includes('chat.whatsapp.com') ||
                                rawLower.includes('t.me/');
      if (hasSocialRedirect) {
        triggers.push({
          id: 'RULE_WEB_OFFSHORE_CHAT_CHANNEL',
          category: Constants.CATEGORIES.ACTION_DEMAND,
          description: 'Funneling victims to untraceable Telegram/WhatsApp VIP group channels',
          severity: 'MEDIUM',
          evidence: 'Telegram/WhatsApp direct funnel link present',
          weight: 5
        });
      }

      return {
        triggers: Helpers && Helpers.deduplicateTriggers ? Helpers.deduplicateTriggers(triggers) : triggers,
        iocs: Helpers && Helpers.deduplicateIOCs ? Helpers.deduplicateIOCs(iocs) : iocs,
        details: {
          textLength: textOnly.length,
          upiCount: upiFound.length,
          cryptoCount: cryptoFound.length,
          matchedKeywordsCount: matchedPonzi.length + matchedBetting.length + matchedClaims.length
        }
      };
    }
  };

  return WebsiteAnalyzer;
}));
