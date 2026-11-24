/**
 * Rajasthan Police Hackathon (R4C) - PS01 Cyber Fraud Detection Platform
 * Team: Third Eye
 * File: utils/constants.js
 * 
 * Central constants, regex patterns, risk weights, and thresholds.
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.ThirdEye = root.ThirdEye || {};
    root.ThirdEye.Constants = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  return {
    APP_NAME: 'Third Eye - Cyber Fraud Triage Platform',
    VERSION: '1.0.0',
    HACKATHON: 'Rajasthan Police Hackathon (R4C) - PS01',

    // Risk Levels & Thresholds
    RISK_LEVELS: {
      HIGH: 'HIGH',
      MEDIUM: 'MEDIUM',
      LOW: 'LOW'
    },

    RISK_THRESHOLDS: {
      HIGH: 70,    // 70 - 100
      MEDIUM: 40,  // 40 - 69
      LOW: 0       // 0 - 39
    },

    // Severity Levels & Display Badges
    SEVERITY: {
      CRITICAL: { label: 'CRITICAL', color: 'red', emoji: '🔴', weight: 4 },
      HIGH: { label: 'HIGH', color: 'orange', emoji: '🟠', weight: 3 },
      MEDIUM: { label: 'MEDIUM', color: 'yellow', emoji: '🟡', weight: 2 },
      LOW: { label: 'LOW', color: 'blue', emoji: '🔵', weight: 1 }
    },

    // Categories
    CATEGORIES: {
      URGENCY: 'Urgency & Coercion',
      IMPERSONATION: 'Authority/Brand Impersonation',
      ACTION_DEMAND: 'Call-to-Action Pressure',
      URL_ANOMALY: 'Suspicious Link / Domain',
      PAYMENT_SCAM: 'Payment / UPI Extortion',
      DANGEROUS_PERMS: 'Abusive Android Permissions',
      CODE_ANOMALY: 'Embedded URLs / Payload Drop',
      REGULATORY_FRAUD: 'Fake Regulatory Claim',
      PONZI_MLM: 'Ponzi / MLM Scheme Pattern',
      GAMBLING_BETTING: 'Illegal Gambling / Betting',
      BLACKLIST: 'Threat Intel Blacklist Match'
    },

    // IOC Types
    IOC_TYPES: {
      URL: 'url',
      PHONE: 'phone',
      UPI: 'upi',
      EMAIL: 'email',
      CRYPTO: 'crypto',
      BANK_IFSC: 'bank_ifsc',
      BANK_ACCOUNT: 'bank_account',
      APK_PACKAGE: 'package'
    },

    // IOC Icons & Labels
    IOC_META: {
      url: { label: 'URL / Domain', icon: '🌐' },
      phone: { label: 'Phone Number', icon: '📞' },
      upi: { label: 'UPI ID', icon: '💰' },
      email: { label: 'Email Address', icon: '📧' },
      crypto: { label: 'Crypto Wallet', icon: '₿' },
      bank_ifsc: { label: 'IFSC Code', icon: '🏦' },
      bank_account: { label: 'Bank Account', icon: '🏛️' },
      package: { label: 'APK Package', icon: '📦' }
    },

    // Deterministic Scoring Weights (Transparent & Explainable - Slide 5)
    WEIGHTS: {
      MESSAGE: {
        HIGH_URGENCY: 15,
        IMPERSONATION: 15,
        ACTION_DEMAND: 10,
        INDIAN_CONTEXT: 10,
        URL_SHORTENER: 10,
        LOOKALIKE_DOMAIN: 15,
        SUSPICIOUS_TLD: 5,
        NO_HTTPS: 5,
        YOUNG_DOMAIN: 10,
        UPI_PRESENT: 10,
        PHONE_PRESENT: 5,
        CRYPTO_PRESENT: 5,
        BLACKLIST_DOMAIN: 25,
        BLACKLIST_PHONE: 15,
        BLACKLIST_UPI: 15
      },
      APK: {
        SMS_PERMISSIONS: 20,
        CONTACTS_CALL_PERMISSIONS: 10,
        OVERLAY_ADMIN_INSTALL_PERMS: 10,
        EMBEDDED_URLS_IPS: 15,
        HARDCODED_PAYMENTS: 10,
        LOOKALIKE_PACKAGE: 15,
        DEBUG_SELFSIGNED_CERT: 5,
        BLACKLIST_MATCH: 15
      },
      WEBSITE: {
        GUARANTEED_RETURNS_PONZI: 25,
        MLM_BINARY_SCHEME: 15,
        ILLEGAL_BETTING: 20,
        FAKE_REGULATORY_SEBI_RBI: 20,
        PAYMENT_IDENTIFIERS: 15,
        DOMAIN_ANOMALY: 15,
        BLACKLIST_MATCH: 20
      }
    },

    // Known Target Brands / Legitimate Domains for Levenshtein Look-Alike Checks
    LEGITIMATE_TARGETS: [
      { name: 'State Bank of India', domain: 'sbi.co.in', pattern: /sbi/i },
      { name: 'State Bank of India NetBanking', domain: 'onlinesbi.sbi', pattern: /onlinesbi/i },
      { name: 'HDFC Bank', domain: 'hdfcbank.com', pattern: /hdfc/i },
      { name: 'ICICI Bank', domain: 'icicibank.com', pattern: /icici/i },
      { name: 'Axis Bank', domain: 'axisbank.com', pattern: /axis/i },
      { name: 'Punjab National Bank', domain: 'pnbindia.in', pattern: /pnb/i },
      { name: 'Income Tax Department', domain: 'incometax.gov.in', pattern: /incometax/i },
      { name: 'UIDAI Aadhaar', domain: 'uidai.gov.in', pattern: /uidai/i },
      { name: 'Reserve Bank of India', domain: 'rbi.org.in', pattern: /rbi/i },
      { name: 'National Cyber Crime Reporting', domain: 'cybercrime.gov.in', pattern: /cybercrime/i },
      { name: 'India Post', domain: 'indiapostgdsonline.gov.in', pattern: /indiapost/i },
      { name: 'EPFO India', domain: 'epfindia.gov.in', pattern: /epfindia/i },
      { name: 'Rajasthan Police', domain: 'police.rajasthan.gov.in', pattern: /police\.rajasthan/i },
      { name: 'Government of Rajasthan', domain: 'rajasthan.gov.in', pattern: /rajasthan\.gov/i },
      { name: 'Paytm Payments Bank', domain: 'paytm.com', pattern: /paytm/i },
      { name: 'PhonePe', domain: 'phonepe.com', pattern: /phonepe/i }
    ],

    // Suspicious TLDs commonly used by cybercriminals
    SUSPICIOUS_TLDS: [
      '.xyz', '.top', '.click', '.loan', '.win', '.cf', '.tk', '.ml', '.ga',
      '.gq', '.work', '.bid', '.racing', '.date', '.party', '.download', '.site',
      '.online', '.buzz', '.monster', '.rest', '.vip', '.live', '.icu'
    ],

    // Known URL shorteners
    URL_SHORTENERS: [
      'bit.ly', 'tinyurl.com', 'cutt.ly', 'rebrand.ly', 't.ly', 'is.gd',
      'rb.gy', 'v.gd', 'shorturl.at', 'bl.ink', 'cli.re', 's.id'
    ],

    // Known UPI Provider VPA Handles (Indian Context)
    UPI_HANDLES: [
      'okaxis', 'okhdfcbank', 'okicici', 'oksbi', 'ybl', 'ibl', 'axl',
      'ptsbi', 'upi', 'paytm', 'gpay', 'phonepe', 'fbl', 'idfcbank',
      'waaxis', 'sbi', 'hdfcbank', 'icici', 'kotak', 'barodampay',
      'federal', 'jupiteraxis', 'airtel', 'indus', 'aubank', 'postbank'
    ],

    // Dangerous Android Permissions
    DANGEROUS_PERMISSIONS: {
      // SMS
      'android.permission.READ_SMS': { severity: 'CRITICAL', category: 'SMS Theft', desc: 'Can read incoming OTPs and bank credentials' },
      'android.permission.RECEIVE_SMS': { severity: 'CRITICAL', category: 'SMS Theft', desc: 'Can intercept banking OTPs in real-time' },
      'android.permission.SEND_SMS': { severity: 'CRITICAL', category: 'SMS Fraud', desc: 'Can silently send unauthorized premium SMS' },
      // Contacts & Calls
      'android.permission.READ_CONTACTS': { severity: 'HIGH', category: 'Harassment/Extortion', desc: 'Harvests contact lists for loan-app extortion' },
      'android.permission.WRITE_CONTACTS': { severity: 'MEDIUM', category: 'Address Book Tampering', desc: 'Can tamper with contacts' },
      'android.permission.READ_CALL_LOG': { severity: 'HIGH', category: 'Call Interception', desc: 'Monitors caller history and 2FA IVR calls' },
      'android.permission.CALL_PHONE': { severity: 'HIGH', category: 'Toll Fraud', desc: 'Can initiate phone calls without user confirmation' },
      // Surveillance & Location
      'android.permission.RECORD_AUDIO': { severity: 'HIGH', category: 'Eavesdropping', desc: 'Can record microphone ambient audio' },
      'android.permission.CAMERA': { severity: 'HIGH', category: 'Spyware', desc: 'Can take photos and video secretly' },
      'android.permission.ACCESS_FINE_LOCATION': { severity: 'MEDIUM', category: 'Stalking/Tracking', desc: 'Tracks precise GPS location' },
      // Persistence & Overlay (Banking Trojans)
      'android.permission.SYSTEM_ALERT_WINDOW': { severity: 'CRITICAL', category: 'Overlay Attack', desc: 'Can draw fake login screens over banking apps' },
      'android.permission.BIND_ACCESSIBILITY_SERVICE': { severity: 'CRITICAL', category: 'Full Device Takeover', desc: 'Can read screen content, tap buttons, bypass 2FA' },
      'android.permission.BIND_DEVICE_ADMIN': { severity: 'CRITICAL', category: 'Ransomware/Anti-Uninstall', desc: 'Prevents device admin uninstallation' },
      'android.permission.REQUEST_INSTALL_PACKAGES': { severity: 'HIGH', category: 'Malware Dropper', desc: 'Silently downloads and sideloads secondary malware' },
      'android.permission.INSTALL_PACKAGES': { severity: 'CRITICAL', category: 'Malware Dropper', desc: 'Direct package installer privileges' }
    }
  };
}));
