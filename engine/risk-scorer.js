/**
 * Rajasthan Police Hackathon (R4C) - PS01 Cyber Fraud Detection Platform
 * Team: Third Eye
 * File: engine/risk-scorer.js
 * 
 * Step 1.9: Deterministic & Explainable Risk Scorer (NO ML - RULE BASED)
 * 100% transparent scoring function for jury audit. Every point traces to a specific rule.
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([
      '../utils/constants',
      '../utils/helpers',
      './message-analyzer',
      './url-analyzer',
      './apk-analyzer',
      './website-analyzer'
    ], factory);
  } else if (typeof module === 'object' && module.exports) {
    const Constants = require('../utils/constants');
    const Helpers = require('../utils/helpers');
    const MessageAnalyzer = require('./message-analyzer');
    const URLAnalyzer = require('./url-analyzer');
    const APKAnalyzer = require('./apk-analyzer');
    const WebsiteAnalyzer = require('./website-analyzer');
    module.exports = factory(Constants, Helpers, MessageAnalyzer, URLAnalyzer, APKAnalyzer, WebsiteAnalyzer);
  } else {
    root.ThirdEye = root.ThirdEye || {};
    root.ThirdEye.RiskScorer = factory(
      root.ThirdEye.Constants,
      root.ThirdEye.Helpers,
      root.ThirdEye.MessageAnalyzer,
      root.ThirdEye.URLAnalyzer,
      root.ThirdEye.APKAnalyzer,
      root.ThirdEye.WebsiteAnalyzer
    );
  }
}(typeof self !== 'undefined' ? self : this, function (Constants, Helpers, MessageAnalyzer, URLAnalyzer, APKAnalyzer, WebsiteAnalyzer) {
  'use strict';

  const RiskScorer = {

    /**
     * Run full triage analysis on any input type
     * @param {import('../utils/helpers').AnalysisInput} input 
     * @returns {import('../utils/helpers').RiskResult}
     */
    evaluate: function (input) {
      if (!input || !input.type) {
        return {
          level: Constants.RISK_LEVELS.LOW,
          score: 0,
          triggers: [],
          iocs: [],
          explanation: 'No input provided for evaluation.',
          breakdown: {}
        };
      }

      let analysisResult = { triggers: [], iocs: [], details: {} };

      // Route to appropriate deterministic analyzer
      switch (input.type.toLowerCase()) {
        case 'message':
        case 'sms':
        case 'email':
        case 'whatsapp':
          analysisResult = MessageAnalyzer.analyze(input.content, input.metadata);
          break;

        case 'url':
        case 'domain':
          analysisResult = URLAnalyzer.analyze(input.content);
          break;

        case 'apk':
        case 'app':
          analysisResult = APKAnalyzer.analyze(input.content || input.file);
          break;

        case 'website':
        case 'site':
        case 'html':
          analysisResult = WebsiteAnalyzer.analyze(input.content, input.url || (input.metadata && input.metadata.url));
          break;

        default:
          analysisResult = MessageAnalyzer.analyze(input.content, input.metadata);
          break;
      }

      const triggers = analysisResult.triggers || [];
      const iocs = analysisResult.iocs || [];

      // Compute raw score from triggers
      let rawScore = 0;
      const breakdown = {};

      triggers.forEach(t => {
        const weight = t.weight || 0;
        rawScore += weight;
        const cat = t.category || 'General';
        breakdown[cat] = (breakdown[cat] || 0) + weight;
      });

      // Score is capped between 0 and 100
      const finalScore = Math.min(100, Math.max(0, rawScore));

      // Determine Risk Level based on deterministic thresholds
      let level = Constants.RISK_LEVELS.LOW;
      if (finalScore >= Constants.RISK_THRESHOLDS.HIGH) {
        level = Constants.RISK_LEVELS.HIGH;
      } else if (finalScore >= Constants.RISK_THRESHOLDS.MEDIUM) {
        level = Constants.RISK_LEVELS.MEDIUM;
      } else {
        level = Constants.RISK_LEVELS.LOW;
      }

      // Generate explainable verdict for jury & investigating officers
      const explanation = this.generateExplanation(level, finalScore, triggers, iocs, input.type);

      return {
        level: level,
        score: finalScore,
        triggers: triggers,
        iocs: iocs,
        explanation: explanation,
        breakdown: breakdown,
        details: analysisResult.details || {}
      };
    },

    /**
     * Generate clear, human-auditable explanation of why the risk score was assigned
     */
    generateExplanation: function (level, score, triggers, iocs, type) {
      if (triggers.length === 0) {
        return `Assessed as LOW RISK (${score}/100). No known cyber fraud patterns, malicious indicators, or threat blacklists were triggered.`;
      }

      const criticalTriggers = triggers.filter(t => t.severity === 'CRITICAL');
      const highTriggers = triggers.filter(t => t.severity === 'HIGH');
      const blacklistedIocs = iocs.filter(i => i.flagged);

      const reasons = [];

      if (blacklistedIocs.length > 0) {
        reasons.push(`${blacklistedIocs.length} entity matched active Rajasthan / I4C threat intel blacklists (${blacklistedIocs.map(b => b.value).join(', ')})`);
      }

      if (criticalTriggers.length > 0) {
        reasons.push(`${criticalTriggers.length} CRITICAL violation(s): ${criticalTriggers.map(c => c.category).join(', ')}`);
      }

      if (highTriggers.length > 0) {
        reasons.push(`${highTriggers.length} HIGH-SEVERITY trigger(s): ${highTriggers.map(h => h.category).slice(0, 2).join(', ')}`);
      }

      const verdictPrefix = level === 'HIGH'
        ? '🔴 DANGER: Flagged as HIGH RISK'
        : (level === 'MEDIUM' ? '🟡 CAUTION: Flagged as SUSPICIOUS' : '🔵 SAFE: Assessed as LOW RISK');

      return `${verdictPrefix} (${score}/100). Triggered ${triggers.length} deterministic rules based on: ${reasons.join('; ')}. All scoring points are mathematically auditable with zero black-box ML inference.`;
    }
  };

  return RiskScorer;
}));
