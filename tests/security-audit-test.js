/**
 * Security Audit Verification Suite
 * Tests against ReDoS, Prototype Pollution, RegExp Injection, and XSS Sanitization
 */

const assert = require('assert');
const Constants = require('../utils/constants');
const Helpers = require('../utils/helpers');
const IOCExtractor = require('../engine/ioc-extractor');
const MessageAnalyzer = require('../engine/message-analyzer');
const URLAnalyzer = require('../engine/url-analyzer');
const APKAnalyzer = require('../engine/apk-analyzer');
const WebsiteAnalyzer = require('../engine/website-analyzer');
const RiskScorer = require('../engine/risk-scorer');

console.log('--- RUNNING CLOUDFLARE SECURITY AUDIT SUITE ---');

// Test 1: ReDoS Resistance in WebsiteAnalyzer.stripHtml
console.log('Test 1: ReDoS Resistance in stripHtml...');
const maliciousReDoS = '<script ' + 'a'.repeat(25000) + '<script <style';
const t0 = Date.now();
const cleanText = WebsiteAnalyzer.stripHtml(maliciousReDoS);
const elapsed = Date.now() - t0;
console.log(`✓ stripHtml completed in ${elapsed}ms (< 50ms expected)`);
assert(elapsed < 100, 'ReDoS vulnerability detected: took too long to evaluate');

// Test 2: RegExp Metacharacter Safety in MessageAnalyzer
console.log('Test 2: Dynamic RegExp Injection Safety in MessageAnalyzer...');
try {
  // Brand name with dangerous regex metacharacters
  MessageAnalyzer.configure({
    keywords: {
      urgency_keywords: [],
      impersonation_brands: ['e-challan (official)', 'c++', '[bank]', 'test*+?'],
      action_demands: [],
      indian_scam_contexts: []
    }
  });
  const res = MessageAnalyzer.analyze('This is e-challan (official) notice for c++ violations [bank]');
  console.log('✓ Successfully evaluated message without RegExp syntax crash');
} catch (err) {
  assert.fail('RegExp Injection caused an error: ' + err.message);
}

// Test 3: Prototype Pollution Protection in APKAnalyzer
console.log('Test 3: Prototype Pollution Protection in APKAnalyzer...');
const maliciousPayload = JSON.stringify({
  "__proto__": { "polluted": true },
  "constructor": { "prototype": { "polluted": true } },
  "package_name": "com.evil.malware",
  "permissions": ["android.permission.READ_SMS"]
});
const apkRes = APKAnalyzer.analyze(maliciousPayload);
assert.strictEqual({}.polluted, undefined, 'Prototype pollution succeeded! Object prototype was modified.');
console.log('✓ Prototype Pollution blocked safely: Object.prototype remains clean');

// Test 4: Comprehensive HTML Escaping in Helpers.escapeHtml
console.log('Test 4: XSS Vector Neutralization in Helpers.escapeHtml...');
const dangerousInputs = [
  '<script>alert(1)</script>',
  '" onmouseover="alert(2)"',
  "' onclick='alert(3)'",
  '<img src=x onerror=alert(4)>',
  'https://evil.com/x?a=1&b=2<svg onload=alert(5)>'
];

dangerousInputs.forEach(input => {
  const escaped = Helpers.escapeHtml(input);
  assert(!escaped.includes('<script>'), 'Failed to neutralize <script>');
  assert(!escaped.includes('" onmouseover='), 'Failed to neutralize attribute injection');
  assert(!escaped.includes("' onclick="), 'Failed to neutralize single-quote breakout');
  assert(!escaped.includes('<img'), 'Failed to neutralize <img');
  assert(!escaped.includes('<svg'), 'Failed to neutralize <svg');
});
console.log('✓ All 5 critical XSS vectors neutralized by Helpers.escapeHtml');

console.log('--- ALL SECURITY AUDIT TESTS PASSED WITH 100% SUCCESS ---');

