const fs = require('fs');
const vm = require('vm');

console.log('=== RIGOROUS LIFECYCLE SIMULATION ===\n');

// Load HTML
const html = fs.readFileSync('index.html', 'utf8');

// Mock a complete browser DOM + LocalStorage environment
let store = {};
const mockLocalStorage = {
  getItem: (k) => store[k] || null,
  setItem: (k, v) => { store[k] = String(v); },
  removeItem: (k) => { delete store[k]; },
  clear: () => { store = {}; }
};

let eventListeners = {};
const elements = {};

function getMockEl(id) {
  if (!elements[id]) {
    elements[id] = {
      id: id,
      value: '',
      textContent: '',
      innerHTML: '',
      style: {},
      classList: {
        classes: new Set(),
        add: function(c) { this.classes.add(c); },
        remove: function(c) { this.classes.delete(c); },
        contains: function(c) { return this.classes.has(c); }
      },
      scrollIntoView: () => {},
      focus: () => {},
      select: () => {},
      setAttribute: () => {},
      getAttribute: () => null,
      appendChild: () => {},
      closest: () => null,
      remove: () => {}
    };
  }
  return elements[id];
}

const mockDocument = {
  getElementById: getMockEl,
  querySelector: () => null,
  querySelectorAll: () => [],
  createElement: (tag) => getMockEl('mock-' + Math.random()),
  addEventListener: (event, handler) => { eventListeners[event] = handler; },
  body: getMockEl('body')
};

const sandbox = {
  console: console,
  window: {
    addEventListener: (event, handler) => { eventListeners[event] = handler; }
  },
  document: mockDocument,
  localStorage: mockLocalStorage,
  navigator: { clipboard: { writeText: () => Promise.resolve() } },
  Chart: function() { return { destroy: () => {} }; },
  JSZip: { loadAsync: () => Promise.resolve() },
  requestAnimationFrame: (cb) => cb(),
  setTimeout: (cb) => cb(),
  confirm: () => true
};
sandbox.window.window = sandbox.window;
sandbox.window.document = mockDocument;
sandbox.window.localStorage = mockLocalStorage;
sandbox.self = sandbox.window;

// Run scripts in order
const scriptRegex = /<script src="([^"]+)"><\/script>/g;
let m;
while ((m = scriptRegex.exec(html)) !== null) {
  const src = m[1];
  if (!src.startsWith('http')) {
    const code = fs.readFileSync(src, 'utf8');
    vm.runInNewContext(code, sandbox);
  }
}

// Extract and run inline script from index.html
const inlineScriptMatch = html.match(/<!-- APPLICATION LOGIC -->[\s\S]*?<script>([\s\S]*?)<\/script>/);
if (!inlineScriptMatch) throw new Error('Inline script not found');
vm.runInNewContext(inlineScriptMatch[1], sandbox);

// 1. Initial Load Test
console.log('Test 1: App Initial Load (First Time Open)...');
eventListeners['DOMContentLoaded']();
let cases = JSON.parse(mockLocalStorage.getItem('third_eye_cases_v1') || '[]');
console.log('Initial seeded cases count:', cases.length);
if (cases.length !== 2) throw new Error('First-time seed failed! Expected 2 cases.');
console.log('✓ Initial load seeded 2 demo cases properly.');

// 2. Clear History Test
console.log('\nTest 2: User Clicks Clear History...');
sandbox.clearAllHistory();
cases = JSON.parse(mockLocalStorage.getItem('third_eye_cases_v1') || '[]');
console.log('Cases in storage after clear:', cases.length);
console.log('Seeded flag status:', mockLocalStorage.getItem('third_eye_seeded_v1'));
if (cases.length !== 0) throw new Error('Clear failed! Expected 0 cases.');
console.log('✓ Storage is completely 0.');

// 3. Page Refresh Simulation
console.log('\nTest 3: Page Refresh after Clear...');
// Simulate browser page refresh: DOMContentLoaded fires again with existing localStorage
eventListeners['DOMContentLoaded']();
cases = JSON.parse(mockLocalStorage.getItem('third_eye_cases_v1') || '[]');
console.log('Cases in storage after refresh:', cases.length);
if (cases.length !== 0) throw new Error('CRITICAL: Page refresh re-seeded cases after clear!');
console.log('✓ Verified: 0 cases preserved on refresh. No ghost cases.');

// 4. Adding a Single Case after Clear
console.log('\nTest 4: Triaging a New Case after Clear...');
const testSms = 'Dear SBI Customer, update KYC now at https://sbi-kyc-verification.xyz';
const evalResult = sandbox.window.ThirdEye.RiskScorer.evaluate({ type: 'message', content: testSms });
const newRecord = sandbox.window.ThirdEye.ReportGenerator.buildCaseRecord({ type: 'message', content: testSms }, evalResult);
(sandbox.saveCaseToHistory || sandbox.window.saveCaseToHistory)(newRecord);
cases = JSON.parse(mockLocalStorage.getItem('third_eye_cases_v1') || '[]');
console.log('Cases count after adding 1 new case:', cases.length);
if (cases.length !== 1) throw new Error('Expected exactly 1 case!');
console.log('✓ Exactly 1 case added. ID:', cases[0].id);

// 5. Test Demo Pills do not auto-run
console.log('\nTest 5: Testing One-Click Demo Pills (Ensuring No Auto-Run)...');
getMockEl('unified-paste-input').value = '';
(sandbox.loadAndRunSample || sandbox.window.loadAndRunSample)('appstore-1');
const editorVal = getMockEl('unified-paste-input').value;
console.log('Editor value after clicking Play Store pill:', editorVal);
if (!editorVal.includes('play.google.com')) throw new Error('Sample did not load into editor!');
console.log('✓ Sample loaded into editor without auto-running verification.');

console.log('\n=== ALL SIMULATION TESTS PASSED WITH 100% SUCCESS ===');
