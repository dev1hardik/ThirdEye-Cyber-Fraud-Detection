/**
 * Comprehensive Evaluation: App Store & Play Store Functionality Matrix
 * Tests True Positives, True Negatives, False Positives, and False Negatives
 */

const assert = require('assert');
const RiskScorer = require('../engine/risk-scorer');

console.log('=== APP STORE & PLAY STORE THREAT DETECTION MATRIX ===\n');

// 1. TRUE POSITIVE TEST CASES (Malicious apps that MUST be flagged)
const truePositiveCases = [
  {
    name: 'Fake SBI Loan App on Play Store',
    url: 'https://play.google.com/store/apps/details?id=com.quickcash.sbi.loan',
    expectedTrigger: 'RULE_APP_LOOKALIKE_PACKAGE',
    minScore: 40
  },
  {
    name: 'Typosquatted HDFC Banking Trojan on Play Store',
    url: 'https://play.google.com/store/apps/details?id=com.yono.hdfc.banking.verify',
    expectedTrigger: 'RULE_APP_LOOKALIKE_PACKAGE',
    minScore: 25
  },
  {
    name: 'Predatory Instant Loan Extortion App on Play Store',
    url: 'https://play.google.com/store/apps/details?id=com.instantloan.fastrupee.cashadvance',
    expectedTrigger: 'RULE_APP_PREDATORY_LOAN',
    minScore: 25
  },
  {
    name: 'Illegal Satta / Real Money Betting App on Play Store',
    url: 'https://play.google.com/store/apps/details?id=com.teenpatti.sattamatka.realcash',
    expectedTrigger: 'RULE_APP_ILLEGAL_BETTING',
    minScore: 25
  },
  {
    name: 'Alternative Unverified APK Store Trojan on APKPure',
    url: 'https://apkpure.com/sbi-quick/com.quickcash.sbi.loan',
    expectedTrigger: 'RULE_APP_UNVERIFIED_APP_STORE',
    minScore: 40
  },
  {
    name: 'Direct APK Sideload Download URL',
    url: 'http://185.220.101.5/payload/drop.apk',
    expectedTrigger: 'RULE_APP_DIRECT_APK_DOWNLOAD',
    minScore: 20
  }
];

// 2. TRUE NEGATIVE TEST CASES (Legitimate apps that MUST NOT be flagged as threats)
const trueNegativeCases = [
  {
    name: 'Official State Bank of India YONO (Play Store)',
    url: 'https://play.google.com/store/apps/details?id=com.sbi.lotusintouch',
    maxScore: 0
  },
  {
    name: 'Official HDFC Bank MobileBanking (Play Store)',
    url: 'https://play.google.com/store/apps/details?id=com.hdfcbank.payzapp',
    maxScore: 0
  },
  {
    name: 'Official ICICI iMobile Pay (Play Store)',
    url: 'https://play.google.com/store/apps/details?id=com.icicibank.imobile',
    maxScore: 0
  },
  {
    name: 'Official BHIM UPI by NPCI (Play Store)',
    url: 'https://play.google.com/store/apps/details?id=in.org.npci.upiapp',
    maxScore: 0
  },
  {
    name: 'Official UIDAI mAadhaar (Play Store)',
    url: 'https://play.google.com/store/apps/details?id=in.gov.uidai.mAadhaarPlus',
    maxScore: 0
  },
  {
    name: 'Benign General Utility App (WhatsApp on Play Store)',
    url: 'https://play.google.com/store/apps/details?id=com.whatsapp',
    maxScore: 0
  }
];

let tpCount = 0;
let fpCount = 0;
let tnCount = 0;
let fnCount = 0;

console.log('--- EVALUATING TRUE POSITIVES (Threat Detection) ---');
truePositiveCases.forEach((tc, idx) => {
  const res = RiskScorer.evaluate({ type: 'url', content: tc.url });
  const hasTrigger = res.triggers.some(t => t.id === tc.expectedTrigger);
  const isFlagged = res.score >= (tc.minScore || 20);

  if (hasTrigger && isFlagged) {
    tpCount++;
    console.log(`[PASS TP ${idx + 1}] ${tc.name} -> Score: ${res.score}%, Triggers: ${res.triggers.map(t => t.id).join(', ')}`);
  } else {
    fnCount++;
    console.error(`[FAIL FN ${idx + 1}] ${tc.name} was missed! Score: ${res.score}%, Triggers: ${res.triggers.map(t => t.id).join(', ')}`);
  }
});

console.log('\n--- EVALUATING TRUE NEGATIVES (False Positive Prevention) ---');
trueNegativeCases.forEach((tc, idx) => {
  const res = RiskScorer.evaluate({ type: 'url', content: tc.url });
  const isSafe = res.score <= (tc.maxScore || 0) && res.level === 'LOW';

  if (isSafe) {
    tnCount++;
    console.log(`[PASS TN ${idx + 1}] ${tc.name} -> Score: ${res.score}% (${res.level}), Triggers: ${res.triggers.length}`);
  } else {
    fpCount++;
    console.error(`[FAIL FP ${idx + 1}] FALSE POSITIVE ON ${tc.name}! Score: ${res.score}%, Triggers: ${res.triggers.map(t => t.id).join(', ')}`);
  }
});

console.log('\n=== CONFUSION MATRIX SUMMARY ===');
console.log(`True Positives (Threats Caught):     ${tpCount} / ${truePositiveCases.length}`);
console.log(`True Negatives (Legit Apps Cleared): ${tnCount} / ${trueNegativeCases.length}`);
console.log(`False Positives (False Alarms):      ${fpCount} (Target: 0)`);
console.log(`False Negatives (Missed Threats):    ${fnCount} (Target: 0)`);

const accuracy = ((tpCount + tnCount) / (truePositiveCases.length + trueNegativeCases.length)) * 100;
console.log(`Total App-Store Triage Accuracy:     ${accuracy.toFixed(1)}%`);

assert.strictEqual(fpCount, 0, 'False Positives detected! Legitimate apps must not be penalized.');
assert.strictEqual(fnCount, 0, 'False Negatives detected! Scam apps must not be missed.');
console.log('\n✓ ALL TRUE POSITIVE AND FALSE POSITIVE CHECKS PASSED WITH 100% SUCCESS.');

