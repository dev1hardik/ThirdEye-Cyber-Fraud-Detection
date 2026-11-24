const fs = require('fs');
const vm = require('vm');

console.log('--- Verifying index.html and its scripts ---');
const html = fs.readFileSync('index.html', 'utf8');

// Extract script sources
const scriptRegex = /<script src="([^"]+)"><\/script>/g;
const scriptMatches = [];
let m;
while ((m = scriptRegex.exec(html)) !== null) {
  scriptMatches.push(m[1]);
}
console.log('Script sources in index.html:', scriptMatches);

scriptMatches.forEach(src => {
  if (!src.startsWith('http')) {
    if (!fs.existsSync(src)) throw new Error('Missing script: ' + src);
    console.log('✓ Found local script:', src);
  }
});

// Test execution in mock browser environment
const context = {
  console: console,
  document: {
    addEventListener: () => {},
    querySelectorAll: () => [],
    getElementById: () => ({ classList: { add: () => {}, remove: () => {} }, setAttribute: () => {}, style: {} })
  },
  localStorage: {
    store: {},
    getItem: function(k) { return this.store[k] || null; },
    setItem: function(k, v) { this.store[k] = v; },
    removeItem: function(k) { delete this.store[k]; }
  }
};
context.window = context;
context.self = context;

const localScripts = scriptMatches.filter(s => !s.startsWith('http'));
localScripts.forEach(s => {
  const code = fs.readFileSync(s, 'utf8');
  vm.runInNewContext(code, context);
});

console.log('✓ Loaded ThirdEye keys:', Object.keys(context.ThirdEye));
const samples = context.ThirdEye.Data.samples;
console.log('✓ Samples loaded. SMS:', samples.sms.length, 'URLs:', samples.urls.length, 'APK:', samples.apk.length, 'Websites:', samples.websites.length);

// Run full test triage on each sample
const rec1 = context.ThirdEye.ReportGenerator.buildCaseRecord({ type: 'message', content: samples.sms[0].content }, context.ThirdEye.RiskScorer.evaluate({ type: 'message', content: samples.sms[0].content }));
console.log('✓ SMS 1 Triage:', rec1.id, rec1.result.level, 'Score:', rec1.result.score, 'Triggers:', rec1.result.triggers.length, 'IOCs:', rec1.result.iocs.length);

const rec2 = context.ThirdEye.ReportGenerator.buildCaseRecord({ type: 'url', content: samples.urls[0].content }, context.ThirdEye.RiskScorer.evaluate({ type: 'url', content: samples.urls[0].content }));
console.log('✓ URL 1 Triage:', rec2.id, rec2.result.level, 'Score:', rec2.result.score, 'Triggers:', rec2.result.triggers.length, 'IOCs:', rec2.result.iocs.length);

const rec3 = context.ThirdEye.ReportGenerator.buildCaseRecord({ type: 'apk', content: samples.apk[0] }, context.ThirdEye.RiskScorer.evaluate({ type: 'apk', content: samples.apk[0] }));
console.log('✓ APK 1 Triage:', rec3.id, rec3.result.level, 'Score:', rec3.result.score, 'Triggers:', rec3.result.triggers.length, 'IOCs:', rec3.result.iocs.length);

const rec4 = context.ThirdEye.ReportGenerator.buildCaseRecord({ type: 'website', content: samples.websites[0].html, url: samples.websites[0].url }, context.ThirdEye.RiskScorer.evaluate({ type: 'website', content: samples.websites[0].html, url: samples.websites[0].url }));
console.log('✓ Website 1 Triage:', rec4.id, rec4.result.level, 'Score:', rec4.result.score, 'Triggers:', rec4.result.triggers.length, 'IOCs:', rec4.result.iocs.length);

console.log('--- ALL UI & ENGINE VERIFICATIONS PASSED ---');
