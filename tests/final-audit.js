const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { execSync } = require('child_process');

console.log('=== PRE-SUBMISSION AUDIT SUITE FOR ThirdEye_PS01_Prototype.zip ===');

// Extract zip to temporary directory
const tempDir = path.resolve('temp_final_audit');
if (fs.existsSync(tempDir)) fs.rmSync(tempDir, { recursive: true, force: true });
fs.mkdirSync(tempDir);

// Use PowerShell to unpack cleanly
execSync(`powershell -NoProfile -Command "Add-Type -AssemblyName System.IO.Compression.FileSystem; [System.IO.Compression.ZipFile]::ExtractToDirectory('ThirdEye_PS01_Prototype.zip', '${tempDir}')"`);

console.log('\n[CHECK 1] FILE & DIRECTORY STRUCTURE');
const expectedItems = [
  'index.html',
  'data/data-store.js',
  'engine/apk-analyzer.js',
  'engine/ioc-extractor.js',
  'engine/message-analyzer.js',
  'engine/report-generator.js',
  'engine/risk-scorer.js',
  'engine/url-analyzer.js',
  'engine/website-analyzer.js',
  'utils/constants.js',
  'utils/helpers.js'
];

let structurePass = true;
expectedItems.forEach(item => {
  const full = path.join(tempDir, item);
  if (!fs.existsSync(full)) {
    console.error(`✗ MISSING EXPECTED ITEM: ${item}`);
    structurePass = false;
  } else {
    console.log(`✓ Verified item: ${item}`);
  }
});

if (!structurePass) throw new Error('Structure check failed');

console.log('\n[CHECK 2] HTML SCRIPT RESOLUTION & ARCHITECTURE');
const html = fs.readFileSync(path.join(tempDir, 'index.html'), 'utf8');

// Match script tags
const scriptMatches = [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map(m => m[1]);
console.log('Found scripts referenced in index.html:', scriptMatches.length);

const sandbox = {
  window: {},
  document: {
    addEventListener: () => {},
    querySelectorAll: () => [],
    getElementById: () => ({ classList: { add: () => {}, remove: () => {} }, setAttribute: () => {}, style: {} })
  },
  localStorage: {
    store: {},
    getItem(k) { return this.store[k] || null; },
    setItem(k, v) { this.store[k] = v; },
    removeItem(k) { delete this.store[k]; }
  },
  console: console
};
sandbox.window = sandbox;
sandbox.self = sandbox;
vm.createContext(sandbox);

scriptMatches.forEach(src => {
  if (src.startsWith('http')) {
    console.log(`✓ CDN Script acknowledged: ${src}`);
  } else {
    const full = path.join(tempDir, src);
    if (!fs.existsSync(full)) throw new Error(`Script not found: ${src}`);
    const code = fs.readFileSync(full, 'utf8');
    vm.runInContext(code, sandbox);
    console.log(`✓ Executed local module: ${src}`);
  }
});

console.log('\n[CHECK 3] CORE ARCHITECTURE MODULE REGISTRY');
const requiredModules = [
  'Data',
  'Constants',
  'Helpers',
  'IOCExtractor',
  'MessageAnalyzer',
  'URLAnalyzer',
  'APKAnalyzer',
  'WebsiteAnalyzer',
  'RiskScorer',
  'ReportGenerator'
];
requiredModules.forEach(mod => {
  if (!sandbox.ThirdEye[mod]) throw new Error(`Missing module in ThirdEye namespace: ${mod}`);
  console.log(`✓ ThirdEye.${mod} loaded and active`);
});

console.log('\n[CHECK 4] DEMONSTRATION CASES EVALUATION (THE 6 JURY CASES)');
const samples = sandbox.ThirdEye.Data.samples;
const demoCases = [
  {
    name: '1. 📱 SBI YONO KYC Scam',
    type: 'message',
    input: samples.sms[0].content,
    expectedLevel: 'HIGH',
    minScore: 70
  },
  {
    name: '2. ⚡ JVVNL Electricity Cutoff',
    type: 'message',
    input: samples.sms[1].content,
    expectedLevel: 'HIGH',
    minScore: 70
  },
  {
    name: '3. 🌐 Fake SBI Netbanking Link',
    type: 'url',
    input: samples.urls[0].content,
    expectedLevel: 'MEDIUM',
    minScore: 50
  },
  {
    name: '4. 🛍️ Fake Play Store App Link',
    type: 'url',
    input: (samples.urls && samples.urls[3]) ? samples.urls[3].content : 'https://play.google.com/store/apps/details?id=com.quickcash.sbi.loan',
    expectedLevel: 'MEDIUM',
    minScore: 40
  },
  {
    name: '5. 📲 Instant Loan Harvester APK',
    type: 'apk',
    input: samples.apk[0],
    expectedLevel: 'HIGH',
    minScore: 70
  },
  {
    name: '6. 💰 Ponzi MLM Doubling Site',
    type: 'website',
    input: { html: samples.websites[0].html, url: samples.websites[0].url },
    expectedLevel: 'HIGH',
    minScore: 70
  }
];

demoCases.forEach(c => {
  let res;
  if (c.type === 'message') {
    res = sandbox.ThirdEye.RiskScorer.evaluate({ type: 'message', content: c.input });
  } else if (c.type === 'url') {
    res = sandbox.ThirdEye.RiskScorer.evaluate({ type: 'url', content: c.input });
  } else if (c.type === 'apk') {
    res = sandbox.ThirdEye.RiskScorer.evaluate({ type: 'apk', content: c.input });
  } else if (c.type === 'website') {
    res = sandbox.ThirdEye.RiskScorer.evaluate({ type: 'website', content: c.input.html, url: c.input.url });
  }
  
  const passed = res.score >= c.minScore && (c.expectedLevel === 'ANY_ALERT' || res.level === c.expectedLevel);
  console.log(`[CASE TEST] ${c.name} -> Score: ${res.score}/100 [${res.level}] | Triggers: ${res.triggers.length} | IOCs: ${res.iocs.length} | Status: ${passed ? 'PASSED ✓' : 'FAILED ✗'}`);
  if (!passed) throw new Error(`Test failed for ${c.name}`);
});

console.log('\n[CHECK 5] TRUE NEGATIVE / WHITELIST PROTECTION (NO FALSE ALARMS)');
const legitApp = 'https://play.google.com/store/apps/details?id=com.sbi.lotusintouch';
const legitUrlRes = sandbox.ThirdEye.RiskScorer.evaluate({ type: 'url', content: legitApp });
console.log(`[WHITELIST TEST] Official SBI YONO App -> Score: ${legitUrlRes.score}% [${legitUrlRes.level}] | Status: ${legitUrlRes.score === 0 ? 'PASSED (Zero False Alarm) ✓' : 'FAILED ✗'}`);
if (legitUrlRes.score !== 0) throw new Error('Whitelist test failed');

// Clean up
fs.rmSync(tempDir, { recursive: true, force: true });
console.log('\n=== PRE-SUBMISSION AUDIT: 100% SUCCESSFUL & VERIFIED ===');
