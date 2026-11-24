/**
 * Rajasthan Police Hackathon (R4C) - PS01 Cyber Fraud Detection Platform
 * Team: Third Eye
 * File: data/data-store.js
 * 
 * Bundled offline intelligence & sample data for file:// protocol resiliency.
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.ThirdEye = root.ThirdEye || {};
    root.ThirdEye.Data = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  return {
    blacklists: {
      domains: [
        "sbi-kyc-verification.xyz",
        "sbi-reward-points.online",
        "bijli-bill-alert.top",
        "raj-electricity-disconnect.xyz",
        "indiapost-track-parcel.click",
        "indiapost-redelivery.info",
        "pm-kisan-yojana-reward.site",
        "quickcash-instant-loan.xyz",
        "easyloan-rupee-advance.click",
        "teenpatti-gold-vip.live",
        "bet365-india-club.top",
        "doublemoney-roi-mlm.win",
        "growcapital-dailyroi.top",
        "secure-banking-alert.xyz"
      ],
      phones: [
        "+919876543210",
        "+918899001122",
        "+919123456789",
        "+917012345678",
        "+919988776655",
        "+918012345678",
        "+919543210987",
        "+917890123456"
      ],
      upis: [
        "refund.sbi.kyc@okaxis",
        "bijlihelpdesk.raj@ptsbi",
        "indiapost.parcelfee@ybl",
        "fastloan.disbursal@paytm",
        "doublemoney.vip@ibl",
        "teenpatti.cashier@axl",
        "cyberdesk.support@okicici"
      ],
      apk_hashes: [
        "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        "a5c88b9a1e3458fa83b9247c4380104e1c27e8a93d3950efb2dae950892a0134"
      ]
    },
    keywords: {
      urgency_keywords: [
        "urgent", "immediately", "within 2 hours", "within 24 hours",
        "account will be closed", "account suspended", "blocked today",
        "tonight 9:30 pm", "tonight at 9:30 pm", "power will be disconnected",
        "electricity disconnected", "card deactivated", "sim will be blocked",
        "legal action", "arrest warrant"
      ],
      impersonation_brands: [
        "sbi", "state bank of india", "hdfc", "icici", "axis bank", "pnb",
        "rbi", "reserve bank of india", "income tax", "traffic police",
        "e-challan", "rajasthan police", "jvvnl", "jdvvnl", "avvnl",
        "bijli vibhag", "india post", "speed post", "uidai", "aadhaar",
        "pm-kisan", "pm kisan yojana", "epfo", "cyber crime"
      ],
      action_demands: [
        "click here", "download now", "download apk", "install app",
        "verify now", "update kyc", "complete your kyc", "pay immediately",
        "redeem reward points", "claim bonus", "submit otp", "share otp"
      ],
      indian_scam_contexts: [
        "kyc pending", "pan card link", "aadhaar update", "electricity bill unpaid",
        "parcel stuck", "customs fee", "lottery prize", "part time job daily",
        "youtube like job", "instant loan without cibil", "echallan fine"
      ],
      mlm_ponzi_keywords: [
        "guaranteed returns", "fixed daily profit", "daily roi", "compound interest daily",
        "risk-free investment", "double your money", "200% return", "referral bonus",
        "downline income", "upline bonus", "binary income", "matrix plan", "level income",
        "auto pool income"
      ],
      betting_gambling_keywords: [
        "cricket betting id", "online casino real money", "teen patti real cash",
        "rummy real money", "color trading", "wingo prediction", "aviator hack"
      ],
      fake_regulatory_claims: [
        "sebi registered", "rbi approved", "govt of india approved",
        "ministry of finance certified", "licensed nbfc"
      ]
    },
    whois: {
      domains: {
        "sbi-kyc-verification.xyz": { registrar: "NameCheap, Inc.", age_days: 3, created_date: "2026-11-18T10:14:00Z", registrant_country: "RU", ssl_issuer: "Let's Encrypt Free DV", category: "High Risk Phishing", threat_status: "FLAGGED_MALICIOUS" },
        "bijli-bill-alert.top": { registrar: "Porkbun LLC", age_days: 6, created_date: "2026-11-15T04:22:00Z", registrant_country: "HK", ssl_issuer: "cPanel Free SSL", category: "Utility Scam", threat_status: "FLAGGED_MALICIOUS" },
        "indiapost-track-parcel.click": { registrar: "Dynadot LLC", age_days: 2, created_date: "2026-11-19T18:00:00Z", registrant_country: "CN", ssl_issuer: "ZeroSSL Free", category: "Delivery Scam", threat_status: "FLAGGED_MALICIOUS" },
        "pm-kisan-yojana-reward.site": { registrar: "Hostinger", age_days: 11, created_date: "2026-11-10T12:00:00Z", registrant_country: "NG", ssl_issuer: "Self-Signed", category: "Subsidy Scam", threat_status: "FLAGGED_MALICIOUS" },
        "quickcash-instant-loan.xyz": { registrar: "Tucows", age_days: 9, created_date: "2026-11-12T08:30:00Z", registrant_country: "KH", ssl_issuer: "Cloudflare", category: "Predatory Loan", threat_status: "FLAGGED_MALICIOUS" },
        "teenpatti-gold-vip.live": { registrar: "Alibaba Cloud", age_days: 27, created_date: "2026-10-25T14:15:00Z", registrant_country: "MM", ssl_issuer: "Free DV", category: "Illegal Gambling", threat_status: "FLAGGED_SUSPICIOUS" },
        "doublemoney-roi-mlm.win": { registrar: "PDR Ltd", age_days: 7, created_date: "2026-11-14T02:11:00Z", registrant_country: "SC", ssl_issuer: "Let's Encrypt", category: "Ponzi Scheme", threat_status: "FLAGGED_MALICIOUS" }
      }
    },
    samples: {
      sms: [
        {
          id: "sample-sms-1",
          title: "SBI YONO KYC Suspension Scam",
          sender: "VK-SBINB",
          content: "Dear SBI Customer, Your YONO Account will be blocked today within 2 hours due to pending KYC. Click immediately to update PAN & Aadhaar: https://bit.ly/sbi-kyc-verify or contact Nodal Officer at +919876543210. Pay token verification fee Rs 5 to refund.sbi.kyc@okaxis"
        },
        {
          id: "sample-sms-2",
          title: "Rajasthan JVVNL Electricity Disconnection Alert",
          sender: "BP-JVVNL",
          content: "Dear Consumer, Your electricity power will be disconnected tonight at 9:30 PM from JVVNL office because previous month bill was not updated. Immediately call electricity officer at +918899001122 or pay pending bill online http://bijli-bill-alert.top via UPI bijlihelpdesk.raj@ptsbi to avoid disconnection."
        },
        {
          id: "sample-sms-3",
          title: "India Post Speed Post Delivery Hold",
          sender: "AD-INDPOST",
          content: "India Post Alert: Your Speed Post parcel package #IN88921049 cannot be delivered due to incomplete home address. Please update address immediately within 24 hours: https://cutt.ly/post-parcel or submit re-delivery fee Rs 25 to indiapost.parcelfee@ybl or call helpline +919123456789"
        }
      ],
      urls: [
        {
          id: "sample-url-1",
          title: "SBI Phishing & OTP Harvester",
          content: "https://sbi-kyc-verification.xyz/netbanking/secure-login/verify-otp.php?session=login"
        },
        {
          id: "sample-url-2",
          title: "Predatory Loan & APK Sideload Site",
          content: "http://quickcash-instant-loan.xyz/apply?amount=50000&pan=required"
        },
        {
          id: "sample-url-3",
          title: "Illegal Betting & Money Laundering Portal",
          content: "https://teenpatti-gold-vip.live/register/cricket-betting-id?ref=bonus100"
        },
        {
          id: "sample-url-4",
          title: "Fake SBI Loan App on Play Store",
          content: "https://play.google.com/store/apps/details?id=com.quickcash.sbi.loan"
        }
      ],
      apk: [
        {
          id: "sample-apk-1",
          title: "CashAdvance Instant Loan (Snoop-Loan Malware)",
          package_name: "com.quickcash.instant.loan",
          app_name: "CashAdvance Fast Rupee",
          version: "1.0.4-debug",
          certificate: {
            issuer: "CN=Android Debug, O=Android, C=US",
            is_debug: true,
            sha256: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
          },
          permissions: [
            "android.permission.READ_SMS",
            "android.permission.RECEIVE_SMS",
            "android.permission.SEND_SMS",
            "android.permission.READ_CONTACTS",
            "android.permission.READ_CALL_LOG",
            "android.permission.SYSTEM_ALERT_WINDOW",
            "android.permission.REQUEST_INSTALL_PACKAGES",
            "android.permission.BIND_ACCESSIBILITY_SERVICE"
          ],
          embedded_urls: [
            "http://api.quickcash-instant-loan.xyz/c2/exfiltrate-contacts",
            "http://185.220.101.5/payload/drop.apk"
          ],
          embedded_iocs: [
            { type: "upi", value: "fastloan.disbursal@paytm" },
            { type: "phone", value: "+917012345678" }
          ]
        }
      ],
      websites: [
        {
          id: "sample-site-1",
          title: "DoubleMoney Crypto MLM Ponzi Scheme",
          url: "http://doublemoney-roi-mlm.win",
          html: "<!DOCTYPE html><html><head><title>DoubleMoney India - 200% Guaranteed Profit</title></head><body><header><h1>Welcome to DoubleMoney India Club</h1><p class='badge'>SEBI registered & RBI approved digital asset scheme</p></header><main><section class='hero'><h2>Guaranteed 200% Fixed Return in 7 Days!</h2><p>Risk-free investment with 15% daily ROI compound interest paid directly to your wallet.</p><button>Invest Now With UPI</button></section><section class='mlm'><h3>Multi-Tier Level Income Opportunity</h3><p>Join downline now! 5 levels of binary income and referral bonus. Auto pool income of Rs 50,000 every week!</p></section><section class='payment'><h3>Deposit Wallet</h3><p>Transfer activation fee to UPI: <strong>doublemoney.vip@ibl</strong> or <strong>earncompound@upi</strong></p><p>USDT (TRC20) Deposit: <code>TJg4X8k7zLpQ3vB7qN4nK9mE6rF8sD2tY</code></p><p>For VIP support WhatsApp: <strong>+919988776655</strong></p></section></main></body></html>"
        }
      ]
    }
  };
}));
