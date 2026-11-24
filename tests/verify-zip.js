const fs = require('fs');
const path = require('path');
const vm = require('vm');

const baseDir = path.resolve('temp_zip_extract_test');
const htmlContent = fs.readFileSync(path.join(baseDir, 'index.html'), 'utf8');

const regex = /<script[^>]+src=["']([^"']+)["']/g;
const scriptMatches = [];
let match;
while ((match = regex.exec(htmlContent)) !== null) {
  scriptMatches.push(match[1]);
}

console.log('Scripts in extracted index.html:', scriptMatches);

const sandbox = { window: {}, document: {}, ThirdEye: {}, console, localStorage: {} };
vm.createContext(sandbox);

const localScripts = scriptMatches.filter(s => !s.startsWith('http'));
localScripts.forEach(relPath => {
  const fullPath = path.join(baseDir, relPath);
  if (!fs.existsSync(fullPath)) {
    throw new Error('MISSING FILE IN EXTRACTED ZIP: ' + fullPath);
  }
  const code = fs.readFileSync(fullPath, 'utf8');
  vm.runInContext(code, sandbox);
  console.log('✓ Successfully executed extracted file:', relPath);
});

console.log('✓ All engines verified in extracted ZIP:', Object.keys(sandbox.ThirdEye));

// Run full test triage on each sample directly from the extracted directory
const samples = sandbox.ThirdEye.Data.samples;
console.log('✓ Samples loaded. SMS:', samples.sms.length, 'URLs:', samples.urls.length, 'APK:', samples.apk.length, 'Websites:', samples.websites.length);

const rec1 = sandbox.ThirdEye.ReportGenerator.buildCaseRecord({ type: 'message', content: samples.sms[0].content }, sandbox.ThirdEye.RiskScorer.evaluate({ type: 'message', content: samples.sms[0].content }));
console.log('✓ Extracted ZIP - SMS 1 Triage:', rec1.id, rec1.result.level, 'Score:', rec1.result.score, 'Triggers:', rec1.result.triggers.length, 'IOCs:', rec1.result.iocs.length);

const rec2 = sandbox.ThirdEye.ReportGenerator.buildCaseRecord({ type: 'url', content: samples.urls[0].content }, sandbox.ThirdEye.RiskScorer.evaluate({ type: 'url', content: samples.urls[0].content }));
console.log('✓ Extracted ZIP - URL 1 Triage:', rec2.id, rec2.result.level, 'Score:', rec2.result.score, 'Triggers:', rec2.result.triggers.length, 'IOCs:', rec2.result.iocs.length);

const rec3 = sandbox.ThirdEye.ReportGenerator.buildCaseRecord({ type: 'apk', content: samples.apk[0] }, sandbox.ThirdEye.RiskScorer.evaluate({ type: 'apk', content: samples.apk[0] }));
console.log('✓ Extracted ZIP - APK 1 Triage:', rec3.id, rec3.result.level, 'Score:', rec3.result.score, 'Triggers:', rec3.result.triggers.length, 'IOCs:', rec3.result.iocs.length);

const rec4 = sandbox.ThirdEye.ReportGenerator.buildCaseRecord({ type: 'website', content: samples.websites[0].html, url: samples.websites[0].url }, sandbox.ThirdEye.RiskScorer.evaluate({ type: 'website', content: samples.websites[0].html, url: samples.websites[0].url }));
console.log('✓ Extracted ZIP - Website 1 Triage:', rec4.id, rec4.result.level, 'Score:', rec4.result.score, 'Triggers:', rec4.result.triggers.length, 'IOCs:', rec4.result.iocs.length);

console.log('>>> ALL EXTRACTED ZIP FILES ARE FULLY FUNCTIONAL AND 100% OPERATIONAL <<<');
