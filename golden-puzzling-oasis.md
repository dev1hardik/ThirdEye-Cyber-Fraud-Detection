# Rajasthan Police Hackathon - PS01 Cyber Fraud Detection Platform
## Step-by-Step Execution Plan for Team Third Eye

---

## 🎯 CONTEXT & PROBLEM UNDERSTANDING

**Event**: Rajasthan Police Hackathon (R4C) - RajasthanPoliceHackathon.in
**Problem Statement**: PS01 - Cyber Fraud / Phishing / Malicious Apps Detection
**Team**: Third Eye (Leader: Hardik Singhal, SKIT Jaipur, B.Tech Year 3)
**Submission Deadline**: 24 Nov 2026, 11:59 PM IST
**Final Event**: 28-29 Nov 2026, Rajasthan Police Academy, Jaipur (if shortlisted)

### What the Jury Expects (Indian Context)
- **Practical, deployable solution** - Not just a prototype, something police can actually use
- **Explainable AI/heuristics** - No black boxes; every risk score must show WHY
- **India-specific patterns** - UPI IDs (@okaxis, @ybl, @ptsbi), Indian phone formats (+91, 10-digit), Indian scam keywords (KYC, electricity bill, parcel delivery, job offer)
- **Offline capability** - RPA Jaipur may have flaky internet; demo must work offline
- **Police-ready evidence** - Reports must be court-admissible format (PDF/JSON with timestamps, hashes)
- **Citizen-facing simplicity** - One-click analysis for non-technical users
- **Investigation dashboard** - Cross-linking entities (same UPI across SMS + APK + website)

### ❌ NO ML MODEL TRAINING REQUIRED
**This is a RULE-BASED / HEURISTIC SYSTEM, not an ML project.**
- Problem statement explicitly asks for "deterministic regex + heuristics engine"
- Jury wants **explainable** results - every risk point must show WHY (specific rule triggered)
- "Out of scope" includes complex ML training
- R4C provides sample data for **testing your rules**, not for training
- Your scoring weights table (Slide 5) IS the "model" - transparent, auditable, no training needed
- **If you add ML, you lose points for explainability**

---

## 📋 THREE SUBMISSION DELIVERABLES (Due 24 Nov)

| Deliverable | Format | Max Size | Purpose |
|-------------|--------|----------|---------|
| **1. HTML Prototype** | Single `.html` file (or `.zip`) | 25 MB | Interactive demo - primary judging artifact |
| **2. Wireframe** | PDF/PNG (4 screens on 1 page) | 25 MB | UI/UX design thinking |
| **3. Action Plan PPT** | PDF/PPTX (8-10 slides) | 25 MB | Technical approach & execution plan |

---

## 🗓️ TIMELINE OVERVIEW

```
PHASE 1: Foundation & Core Engine (Nov 21 - Nov 22)     → 2 days
PHASE 2: HTML Prototype - 3 Tabs (Nov 22 - Nov 23)      → 2 days
PHASE 3: Wireframe & PPT (Nov 23 - Nov 24 morning)      → 1.5 days
PHASE 4: Polish, Test, Upload (Nov 24, by 9 PM)         → 0.5 day (BUFFER!)
```

---

## 📦 PHASE 1: FOUNDATION & CORE DETECTION ENGINE (Nov 21-22)

### Day 1 Morning (Nov 21) - Project Setup & Data Structures
**Priority: CRITICAL**

```
[ ] 1.1 Create project folder structure
    third-eye-hackathon/
    ├── index.html              (main deliverable)
    ├── assets/
    │   ├── samples/            (mock data for demo)
    │   └── styles/             (if not inline)
    ├── engine/
    │   ├── message-analyzer.js
    │   ├── url-analyzer.js
    │   ├── apk-analyzer.js
    │   ├── website-analyzer.js
    │   ├── risk-scorer.js
    │   ├── ioc-extractor.js
    │   └── report-generator.js
    ├── data/
    │   ├── blacklists.json     (domains, phones, UPIs)
    │   ├── keywords.json       (scam patterns, MLM terms)
    │   └── mock-whois.json     (offline domain data)
    └── utils/
        ├── helpers.js
        └── constants.js

[ ] 1.2 Define core data types (TypeScript-style JSDoc in JS)
    - AnalysisInput { type: 'message'|'url'|'apk'|'website', content: string, file?: File }
    - RiskResult { level: 'HIGH'|'MEDIUM'|'LOW', score: 0-100, triggers: Trigger[], iocs: IOC[] }
    - Trigger { id, category, description, severity, evidence }
    - IOC { type: 'url'|'phone'|'upi'|'email'|'crypto'|'bank'|'package', value, source, confidence }
    - CaseRecord { id, timestamp, input, result, reportHash }

[ ] 1.3 Create mock sample data (R4C will provide real samples, but prep now)
    - 3 SMS samples: KYC scam, electricity bill, parcel delivery
    - 3 URLs: phishing link, fake loan site, betting site
    - 1 APK manifest (mock): dangerous permissions, embedded URLs
    - 1 Website HTML: guaranteed returns, MLM language, UPI IDs
    - Save as JSON in assets/samples/
```

### Day 1 Afternoon (Nov 21) - Message & URL Analyzer
**Priority: CRITICAL (Must-Have #1)**

```
[ ] 1.4 Message Analyzer (message-analyzer.js)
    Input: SMS/WhatsApp/Email text
    Checks (deterministic regex + keyword scoring):
    □ Urgency keywords: "urgent", "immediately", "within 2 hours", "account will be closed"
    □ Impersonation: "RBI", "SBI", "HDFC", "Income Tax", "Traffic Police", "KYC"
    □ Action demands: "click here", "download", "verify", "update", "pay now"
    □ Indian context: "Aadhaar", "PAN", "UPI", "OTP", "KYC pending"
    □ URL extraction: regex for http(s)://, bit.ly, tinyurl, Indian shorteners
    □ Phone extraction: +91XXXXXXXXXX, 0XXXXXXXXXX, XXXXXXXXXX
    □ UPI extraction: \w+@(okaxis|ybl|ptsbi|ibl|upi|paytm|gpay|phonepe)
    Output: triggers[] + iocs[]

[ ] 1.5 URL Analyzer (url-analyzer.js)
    Input: URL string
    Checks (offline-first, no live network calls):
    □ Domain age simulation: mock WHOIS lookup from mock-whois.json
    □ HTTPS status: parse protocol
    □ Redirect chain: detect URL shorteners (bit.ly, tinyurl, cutt.ly, rebrand.ly)
    □ Look-alike domains: levenshtein distance to known brands (sbi→sbl, hdfc→hdfcc)
    □ Suspicious TLDs: .xyz, .top, .click, .loan, .win, .cf, .tk, .ml, .ga
    □ Subdomain anomalies: security.sbi.phishersite.com
    □ Blacklist match: check against mock blacklist
    □ Path analysis: /kyc/, /verify/, /update/, /otp/, /login/
    Output: triggers[] + iocs[] (domain, subdomains, paths)

[ ] 1.6 IOC Extractor (ioc-extractor.js) - REUSABLE MODULE
    Single source of truth for all identifier extraction:
    □ Phone: Indian formats (+91, 0-prefix, 10-digit)
    □ UPI: handle@provider (all major Indian providers)
    □ Email: standard regex
    □ Crypto: BTC (1/3/bc1), ETH (0x), USDT (TRC20/ERC20)
    □ Bank: IFSC (11 char), Account (9-18 digits)
    □ URLs: full extraction with scheme
    □ APK Package: com.xxx.yyy format
```

### Day 2 Morning (Nov 22) - APK & Website Analyzer
**Priority: CRITICAL (Must-Have #2)**

```
[ ] 1.7 APK Analyzer (apk-analyzer.js) - STATIC ONLY
    Input: File (drag-drop .apk) or Play Store link (parse package name)
    Since no runtime sandbox: ZIP-based static analysis
    □ Parse AndroidManifest.xml (use JSZip + fast-xml-parser or manual regex)
    □ Dangerous permissions mapping:
        - READ_SMS, RECEIVE_SMS, SEND_SMS → SMS theft
        - READ_CONTACTS, WRITE_CONTACTS → Contact harvesting
        - READ_CALL_LOG, CALL_PHONE → Call interception
        - CAMERA, RECORD_AUDIO → Surveillance
        - ACCESS_FINE_LOCATION → Tracking
        - DEVICE_ADMIN → Persistence
        - INSTALL_PACKAGES → Dropper
        - REQUEST_INSTALL_PACKAGES → Sideloading
        - SYSTEM_ALERT_WINDOW → Overlay attacks
    □ Embedded URLs/IPs: grep strings in DEX/ARS
    □ Package name analysis: look-alike (com.sbi.secure vs com.sbi.secur)
    □ Certificate info: self-signed, debug cert, known malicious certs
    □ App name/icon: extract from resources.arsc (simplified: mock for demo)
    Output: triggers[] + iocs[] (package, permissions, urls, cert)

[ ] 1.8 Website Analyzer (website-analyzer.js)
    Input: URL or pasted HTML content
    Checks (static HTML analysis):
    □ Guaranteed returns: "guaranteed", "fixed return", "daily profit", "risk-free"
    □ MLM/Referral: "referral", "downline", "upline", "binary", "matrix", "level income"
    □ Betting/Gambling: "betting", "cricket betting", "casino", "teen patti", "rummy real cash"
    □ Ponzi keywords: "investment plan", "daily ROI", "compound interest", "auto profit"
    □ Fake regulatory: "SEBI registered", "RBI approved", "government scheme" (verify false)
    □ UPI/Bank/Crypto extraction from page (reuse ioc-extractor)
    □ Phone numbers in contact/footers
    □ WhatsApp/Telegram contact buttons
    □ Domain/hosting: mock WHOIS, check for privacy protection
    Output: triggers[] + iocs[]
```

### Day 2 Afternoon (Nov 22) - Risk Scorer & Report Generator
**Priority: CRITICAL (Core Intelligence)**

```
[ ] 1.9 Risk Scorer (risk-scorer.js) - EXPLAINABLE WEIGHTS (NO ML - RULE BASED)
    Transparent scoring (jury must see this logic):
    **This is NOT a trained model. It's a deterministic scoring function:**
    - Input → Run all regex/keyword/structural checks → Each match adds fixed points → Sum = Score → Threshold = Level
    - Same input ALWAYS produces same output (deterministic)
    - Every point traceable to a specific rule (explainable)
    - Jury can read the code and verify: "Why HIGH?" → "Rule X added 15 pts, Rule Y added 20 pts"
    
    MESSAGE/URL SCORE (0-100):
    ├─ Urgency/Impersonation: 0-30 pts
    │   ├─ High urgency words: +15
    │   ├─ Govt/bank impersonation: +15
    ├─ URL Indicators: 0-25 pts
    │   ├─ Shortener: +10
    │   ├─ Look-alike domain: +15
    │   ├─ Suspicious TLD: +5
    │   ├─ No HTTPS: +5
    │   ├─ Young domain (<30 days): +10
    ├─ IOC Presence: 0-20 pts
    │   ├─ UPI ID found: +10
    │   ├─ Phone number: +5
    │   ├─ Crypto wallet: +5
    ├─ Blacklist Match: 0-25 pts
    │   ├─ Domain in blacklist: +25
    │   ├─ Phone in blacklist: +15
    │   ├─ UPI in blacklist: +15
    
    APK SCORE (0-100):
    ├─ Dangerous Permissions: 0-40 pts
    │   ├─ SMS permissions (3): +20
    │   ├─ Contacts/Call log: +10
    │   ├─ Overlay/Admin/Install: +10
    ├─ Embedded IOCs: 0-25 pts
    │   ├─ URLs/IPs in code: +15
    │   ├─ Hardcoded UPI/Phone: +10
    ├─ Package/Cert Anomalies: 0-20 pts
    │   ├─ Look-alike package: +15
    │   ├─ Debug/self-signed cert: +5
    ├─ Blacklist Match: 0-15 pts
    
    WEBSITE SCORE (0-100):
    ├─ Guaranteed Returns/MLM/Betting: 0-40 pts
    ├─ Fake Regulatory Claims: 0-20 pts
    ├─ Extracted Payment Identifiers: 0-20 pts
    ├─ Domain Anomalies: 0-20 pts
    
    FINAL LEVEL:
    ├─ HIGH: 70-100
    ├─ MEDIUM: 40-69
    └─ LOW: 0-39
    
    Output: { level, score, triggers[], iocs[], explanation: string }

[ ] 1.10 Report Generator (report-generator.js)
    □ Generate PDF report (use jsPDF library via CDN)
    □ Generate JSON evidence (for police systems)
    □ Report sections:
        - Case metadata (ID, timestamp, analyst, input hash)
        - Input summary (type, truncated content)
        - Risk assessment (badge, score, level)
        - Triggered rules (table: Rule | Category | Severity | Evidence)
        - Extracted IOCs (table: Type | Value | Source | Confidence)
        - Cross-case links (if same IOC in history)
        - Investigation notes (empty for analyst)
        - Digital signature placeholder (SHA256 of report)
    □ Download buttons for both formats
```

---

## 🎨 PHASE 2: HTML PROTOTYPE - 3 TABS (Nov 22-23)

### Day 2 Evening / Day 3 Morning (Nov 22-23) - Tab 1: Multi-Channel Analyzer
**Priority: CRITICAL (Primary Demo Interface)**

```
[ ] 2.1 Build index.html structure (single file, inline CSS/JS)
    □ DOCTYPE, meta tags, viewport, title: "Third Eye - Cyber Fraud Triage Platform"
    □ Load external libs via CDN (fallback to local):
        - Tailwind CSS (via CDN)
        - Chart.js (for heat-list visualization)
        - jsPDF + autoTable (for PDF reports)
        - JSZip (for APK parsing)
        - Lucide icons (or inline SVG)
    □ CSS Variables for theming (police blue/dark mode support)

[ ] 2.2 Tab Navigation (sticky top bar)
    □ Tab 1: "🔍 Analyze" (active default)
    □ Tab 2: "📊 Risk Report"
    □ Tab 3: "🗂️ Dashboard"
    □ Mobile-responsive (hamburger on < 640px)

[ ] 2.3 Tab 1 Content - Input Panels (3 columns or stacked)
    PANEL A: Message/URL Input
    □ Textarea: "Paste suspicious SMS, WhatsApp, Email or URL"
    □ Placeholder examples (KYC scam, electricity bill, job offer)
    □ "Analyze Message/URL" button (primary CTA)
    □ Character counter, clear button
    
    PANEL B: APK Analyzer
    □ Drag-drop zone: "Drop .apk file here or click to browse"
    □ File validation: .apk only, max 50MB
    □ Play Store link input alternative
    □ "Analyze APK" button
    □ Show extracted package name, permissions preview
    
    PANEL C: Website Analyzer
    □ URL input + "Fetch & Analyze" (simulate with mock data)
    □ HTML paste textarea alternative
    □ "Analyze Website" button
    
    SAMPLE CASE BUTTONS (below panels - one-click demo)
    □ "📱 Load: Fake Electricity Bill KYC SMS"
    □ "📦 Load: Fake Instant-Loan APK"
    □ "🌐 Load: Ponzi Betting Website"
    □ Each pre-fills relevant panel + auto-triggers analysis

[ ] 2.4 Analysis Flow
    □ Show loading spinner with steps: "Extracting IOCs → Checking Patterns → Scoring Risk → Generating Report"
    □ On complete: auto-switch to Tab 2 with results
    □ Save to case history (localStorage)
```

### Day 3 Morning (Nov 23) - Tab 2: Explainable Risk & IOC Report
**Priority: CRITICAL (Jury focuses here)**

```
[ ] 2.5 Risk Badge (Hero section)
    □ Large color-coded badge: 🔴 HIGH / 🟡 MEDIUM / 🟢 LOW
    □ Score circle: "87/100" with progress ring
    □ One-line summary: "High confidence phishing - SMS impersonates SBI with urgency tactics"

[ ] 2.6 Triggered Rules Table (Explainable AI)
    □ Columns: Rule Name | Category | Severity | Evidence | Weight
    □ Rows populated from risk-scorer triggers[]
    □ Color-coded severity: 🔴 Critical, 🟠 High, 🟡 Medium, 🔵 Low
    □ Expandable rows for technical details

[ ] 2.7 Extracted IOCs Table
    □ Columns: Type | Value | Source | Confidence | Actions
    □ Types with icons: 🌐 URL, 📞 Phone, 💰 UPI, 📧 Email, ₿ Crypto, 🏦 Bank, 📦 Package
    □ Actions: Copy, Search in Dashboard, VirusTotal link (external)
    □ Group by type with collapsible sections

[ ] 2.8 Evidence Details (Accordion)
    □ Original input (truncated, expandable)
    □ Technical findings (raw regex matches, permission list, DOM snippets)
    □ Domain/WHOIS mock data
    □ APK manifest preview

[ ] 2.9 Export Buttons (Sticky bottom)
    □ "📄 Download PDF Report" (primary)
    □ "📋 Download JSON Evidence"
    □ "🔗 Copy Case ID"
    □ "➕ Add to Dashboard"
```

### Day 3 Afternoon (Nov 23) - Tab 3: Investigation Dashboard & Heat-List
**Priority: HIGH (Good-to-Have but impressive)**

```
[ ] 2.10 Case History Table (Searchable, Sortable, Filterable)
    □ Columns: Case ID | Date | Type | Input Preview | Risk | Score | Actions
    □ Search: by IOC (UPI, phone, domain), case ID, date range
    □ Filters: Risk level, Input type, Date
    □ Row click → expands to show IOCs + cross-links
    □ Data source: localStorage (persists across reloads)
    □ "Clear History" button (with confirmation)

[ ] 2.11 Cross-Case Entity Linking (Killer Feature)
    □ When viewing a case, show "Linked Cases" section
    □ Match on: UPI ID, Phone, Domain, Package name, Crypto wallet
    □ Visual: "This UPI (scammer@okaxis) appears in 3 other cases: #102, #105, #108"
    □ Click linked case → jump to that case

[ ] 2.12 Trending Scam Heat-List (Visual)
    □ Top 10 most reported IOCs across all cases
    □ Chart.js horizontal bar chart:
        - Y-axis: IOC value (truncated)
        - X-axis: Report count
        - Color: Risk level of associated cases
        - Tooltip: Full IOC, types, recent cases
    □ Tabs: "All" | "Domains" | "Phones" | "UPIs" | "Packages"
    □ "Export Heat-List" button (CSV/JSON)

[ ] 2.13 Dashboard Actions
    □ "📊 Export Full Investigation Report" (combines all cases + heat-list)
    □ "🗑️ Delete Case" (per row)
    □ "🔄 Refresh Stats"
    □ Stats cards: Total Cases, High Risk, Unique IOCs, Top Threat Type
```

---

## 🎨 PHASE 3: WIREFRAME & PPT (Nov 23-24 Morning)

### Wireframe (wireframe.pdf) - 4 Screens on 1 Page
**Priority: HIGH**

```
Tool: Excalidraw (excalidraw.com) - free, hand-drawn look, exports PDF

SCREEN 1: Submission & Input Portal
├── Tabs: [Message/URL] [APK] [Website] [Batch]
├── Message Panel: Textarea + "Analyze" + Sample buttons
├── APK Panel: Drag-drop + Play Store link
├── Website Panel: URL + HTML paste
└── Callout: "Deterministic Regex + Heuristics Engine → No ML Black Box"

SCREEN 2: Explainable Risk & Identifier Extraction
├── Hero: Risk Badge (HIGH/MED/LOW) + Score Circle
├── Triggered Rules Table (Rule | Category | Evidence | Weight)
├── IOC Extraction Table (Type | Value | Source | Confidence)
├── Evidence Accordion (Raw matches, WHOIS, Manifest)
└── Callout: "Transparent Scoring Weights Shown to Jury"

SCREEN 3: Investigator Case Search & Entity-Link Graph
├── Search Bar (IOC, Case ID, Date)
├── Case Table (sortable, filterable)
├── Selected Case Detail: IOCs + Cross-case Links
├── Entity-Link Graph (nodes: cases, edges: shared IOCs)
└── Callout: "Same UPI/Phone/Domain Across SMS+APK+Site = Organized Campaign"

SCREEN 4: Police-Ready Evidence Report & Heat-List
├── Report Preview (PDF structure)
├── Heat-List Bar Chart (Top 10 Trending IOCs)
├── Export Buttons: PDF | JSON | CSV
├── Digital Signature Placeholder (SHA256)
└── Callout: "Court-Admissible Format • Timestamped • Hash-Verified"

EXPORT: 4 artboards → Single PDF (File → Export → PDF)
```

### Action Plan PPT (Team_Third_Eye_PS01.pdf) - 8-10 Slides
**Priority: HIGH**

```
SLIDE 1: Title
    Team Third Eye | SKIT Jaipur | PS01: Unified Cyber Fraud & Scam Triage Platform
    Hardik Singhal (Leader) | hardik06singhal@gmail.com

SLIDE 2: Problem & Gap
    "Fraudsters reuse UPI IDs, phones, domains, APKs across SMS, WhatsApp, betting/loan sites"
    "But investigators analyze them in silos → Missed connections, delayed action"
    Visual: 3 disconnected silos (SMS | APK | Website) with same UPI flowing through

SLIDE 3: Proposed Solution & Workflow
    Citizen/Officer Input → Static/Heuristic Extraction → Risk Scoring → Entity Linking → Evidence Report
    Visual: Flow diagram with 5 boxes, arrows, "Explainable at every step"

SLIDE 4: System Architecture & Tech Stack
    Block Diagram:
    ┌─────────────┐    ┌──────────────┐    ┌────────────────┐    ┌──────────────┐
    │   Frontend  │───▶│   Backend    │───▶│  Analysis      │───▶│  Dashboard   │
    │  (HTML/JS)  │    │  (FastAPI)   │    │  Engine        │    │  (React)     │
    └─────────────┘    └──────────────┘    └────────────────┘    └──────────────┘
    Tech: Python/FastAPI, androguard/zipfile, BeautifulSoup, WHOIS/DNS/SSL, 
    Regex/NLP Rules, SQLite/PostgreSQL, jsPDF, Chart.js
    OFFLINE-FIRST: Mock WHOIS, cached blacklists, local SQLite

SLIDE 5: Explainable Risk Scoring Model
    Table: Component | Weight | Indicators
    Message Urgency/Impersonation | 30% | Keywords, sender spoofing, action demands
    URL/Domain Anomalies | 25% | Age, HTTPS, redirects, look-alike, TLD
    APK Permissions & IOCs | 25% | SMS/Contacts/Admin perms, embedded URLs, cert
    Website Content & Payments | 20% | Guaranteed returns, MLM, betting, UPI/bank/crypto
    Blacklist/Threat Intel | Bonus | Domain/Phone/UPI in known bad lists
    "NO BLACK BOX - Every point traceable to specific evidence"

SLIDE 6: 24-Hour Final Execution Plan (Scope Matrix)
    ┌─────────────────────────────────────┬──────────────┬────────────────────┐
    │ MUST HAVE (Core)                    │ GOOD TO HAVE │ OUT OF SCOPE       │
    ├─────────────────────────────────────┼──────────────┼────────────────────┤
    │ Message/URL Analyzer + Risk + IOCs  │ Cross-case   │ Dynamic sandbox    │
    │ APK Static Analysis + Permissions   │ Entity link  │ Auto-takedown      │
    │ Website Content + Payment Extract   │ Heat-list    │ Private data access│
    │ Searchable Dashboard + History      │ Telegram bot │ Live threat feed   │
    │ PDF/JSON Evidence Report            │ Browser ext  │ ML model training  │
    │ Deterministic Rule-Based Scoring    │              │ Any ML/DL training │
    └─────────────────────────────────────┴──────────────┴────────────────────┘

SLIDE 7: Prototype Preview
    3-4 screenshots from HTML prototype (Tab 1, 2, 3)
    Caption: "Fully functional single-file HTML - works offline"

SLIDE 8: Privacy & Compliance
    "Only R4C sample data + synthetic data used"
    "Zero real personal data • Zero PII in codebase"
    "Offline-first • No external API calls in demo"
    "GDPR/DPDP aware • Audit trail on every analysis"

SLIDE 9: Team & Readiness
    Hardik Singhal (Leader) - Full-stack, Cybersecurity interest
    SKIT Jaipur, B.Tech Year 3
    Local boilerplate ready for RPA Jaipur (Nov 28-29)
    Can demo end-to-end in 5 minutes

SLIDE 10: Thank You / Contact
    Questions? hardik06singhal@gmail.com | 89XXXXX815
    GitHub: [if any] | Live Demo: [index.html]
```

---

## 🚀 PHASE 4: POLISH, TEST & UPLOAD (Nov 24 - BY 9 PM IST)

### Morning (Nov 24) - Integration Testing
```
[ ] 4.1 End-to-end test all 3 tabs
    □ Tab 1: All 3 sample cases load → analyze → auto-switch to Tab 2
    □ Tab 2: Risk badge correct, triggers table populated, IOCs extracted, PDF/JSON download works
    □ Tab 3: Case appears in history, search works, cross-links show, heat-list updates, export works
    □ Refresh page → history persists (localStorage)
    □ Mobile view (Chrome DevTools device toolbar)

[ ] 4.2 Cross-browser test
    □ Chrome (primary)
    □ Firefox
    □ Edge
    □ Safari (if Mac available)

[ ] 4.3 Performance check
    □ File size < 25 MB (target < 5 MB)
    □ Load time < 3 seconds
    □ No console errors
    □ APK parsing doesn't freeze UI (use Web Worker or async chunking)

[ ] 4.4 Content review
    □ No placeholder text left
    □ All sample data realistic (Indian context)
    □ Spelling/grammar check
    □ Team name "Third Eye" consistent everywhere
    □ PS01 referenced correctly
```

### Midday (Nov 24) - Wireframe & PPT Finalization
```
[ ] 4.5 Wireframe
    □ Open Excalidraw, create 4 screens
    □ Export as PDF (wireframe.pdf)
    □ Verify < 25 MB
    □ Check all callouts readable

[ ] 4.6 PPT
    □ Build in PowerPoint/Google Slides/Canva
    □ Export as PDF (Team_Third_Eye_PS01.pdf)
    □ Verify < 25 MB
    □ 8-10 slides max
    □ Fonts embedded, no macros
```

### 3 PM - 6 PM (Nov 24) - Upload & Verification
```
[ ] 4.7 Login to rajasthanpolicehackathon.in
    □ Use OTP to email (hardik06singhal@gmail.com)
    □ Navigate to "Action Plan" section

[ ] 4.8 Upload all 3 files
    □ HTML Prototype: index.html (or .zip if multi-file)
    □ Wireframe: wireframe.pdf
    □ PPT: Team_Third_Eye_PS01.pdf

[ ] 4.9 CRITICAL: Download back & verify
    □ Re-download each file from portal
    □ Open each to confirm not corrupted
    □ Check file sizes match
    □ No macro warnings on PPT

[ ] 4.10 Screenshot confirmation page
    □ Save upload confirmation screenshot
    □ Note submission timestamp
```

### 6 PM - 9 PM - Buffer & Backup
```
[ ] 4.11 Create backup folder
    □ Copy all 3 files to Google Drive/OneDrive
    □ Copy to USB drive
    □ Share with team member (if any)

[ ] 4.12 Prepare for Final Event (if shortlisted)
    □ Local FastAPI + SQLite boilerplate ready
    □ Offline dictionaries: mock-whois.json, blacklists.json, keywords.json
    □ APK parsing: androguard installed, test APKs ready
    □ Laptop charged, charger packed
    □ Internet backup: phone hotspot + JioFi
```

---

## 🎯 PRIORITY MATRIX

| Priority | Task | Deadline | Impact if Missed |
|----------|------|----------|------------------|
| **P0 - BLOCKER** | HTML Prototype Tab 1 (Input + 3 Samples) | Nov 23 EOD | No demo = no score |
| **P0 - BLOCKER** | HTML Prototype Tab 2 (Risk + IOC + Export) | Nov 23 EOD | Jury can't evaluate |
| **P0 - BLOCKER** | HTML Prototype Tab 3 (Dashboard + Heat-list) | Nov 23 EOD | Misses Good-to-Have |
| **P0 - BLOCKER** | Risk Scorer with Explainable Weights | Nov 22 EOD | Core intelligence missing |
| **P0 - BLOCKER** | IOC Extractor (Phone/UPI/URL/Crypto) | Nov 22 EOD | No identifiers = fail |
| **P1 - HIGH** | Wireframe (4 screens, 1 PDF) | Nov 24 12 PM | Design score lost |
| **P1 - HIGH** | PPT (8-10 slides, PDF) | Nov 24 12 PM | Technical score lost |
| **P1 - HIGH** | Upload + Verify Download | Nov 24 9 PM | **DISQUALIFICATION** |
| **P2 - MEDIUM** | APK Static Analysis (permissions + URLs) | Nov 22 EOD | Partial Must-Have |
| **P2 - MEDIUM** | Website Analyzer (MLM/Betting/Returns) | Nov 22 EOD | Partial Must-Have |
| **P3 - NICE** | Cross-case Entity Linking | Nov 23 EOD | Impresses jury |
| **P3 - NICE** | PDF Report with jsPDF | Nov 23 EOD | Professional polish |

---

## 🛠️ TECHNICAL STACK DECISIONS (Beginner-Friendly)

| Component | Choice | Reason |
|-----------|--------|--------|
| **Frontend** | Single HTML + Vanilla JS + Tailwind CDN | No build step, works offline, < 25 MB |
| **APK Parsing** | JSZip + regex (no androguard in browser) | Runs in browser, static only |
| **PDF Generation** | jsPDF + autoTable (CDN) | Client-side, no backend needed |
| **Charts** | Chart.js (CDN) | Lightweight, heat-list visualization |
| **Storage** | localStorage (IndexedDB if large) | Persists across reloads, offline |
| **Backend (Finals)** | Python FastAPI + SQLite | Simple, fast, offline-capable |
| **APK Backend** | androguard | Proper manifest parsing |

### 🎯 DETECTION APPROACH: RULE-BASED / HEURISTIC (NOT ML)
| Approach | What It Is | Why This Hackathon |
|----------|------------|-------------------|
| **Regex Patterns** | Deterministic string matching | Phone, UPI, URL, crypto, bank details |
| **Keyword Scoring** | Weighted keyword lists | Urgency, impersonation, MLM, betting terms |
| **Structural Analysis** | Domain age, HTTPS, redirects, permissions | Technical indicators from PS01 |
| **Blacklist Matching** | Exact lookup in curated lists | Known bad domains, phones, UPIs, packages |
| **Levenshtein Distance** | String similarity to known brands | Look-alike domains (sbi vs sbl) |
| **Transparent Weighted Score** | Sum of rule weights = risk level | Jury can audit every point |

**This IS the "model" - a scoring table (Slide 5) that explains every single point.**

---

## 🇮🇳 INDIA-SPECIFIC CUSTOMIZATIONS (Jury Will Notice)

```
KEYWORDS (keywords.json):
- Scam: "KYC", "Aadhaar", "PAN", "OTP", "verification", "electricity bill", 
  "parcel delivery", "customs", "income tax refund", "job offer", "work from home",
  "instant loan", "pre-approved", "credit score", "CIBIL", "loan against FD"
- MLM/Betting: "daily income", "referral bonus", "binary plan", "matrix plan",
  "teen patti", "rummy", "cricket betting", "dream11", "my11circle",
  "guaranteed return", "fixed profit", "risk free investment"

UPI PROVIDERS (upi-providers.json):
@okaxis, @ybl, @ptsbi, @ibl, @upi, @paytm, @gpay, @phonepe, @mobikwik,
@freecharge, @airtel, @jio, @icici, @hdfcbank, @sbi, @bob, @pnb, @kotak

PHONE REGEX (indian-phone.js):
/(?:\+91|91|0)?[6-9]\d{9}/g

BLACKLIST SEEDS (blacklists.json):
- Known phishing domains (from public feeds like PhishTank, OpenPhish)
- Known scam UPI handles (from news reports)
- Known fake loan app package names

DOMAIN AGE MOCK (mock-whois.json):
- Pre-populate with creation dates for demo domains
- < 30 days = suspicious, < 7 days = very suspicious
```

---

## ✅ VERIFICATION CHECKLIST (Before Upload)

### HTML Prototype
- [ ] Single .html file (or .zip with index.html at root)
- [ ] File size < 25 MB
- [ ] Opens by double-click (no server needed)
- [ ] Tab 1: 3 sample cases work → auto-switch to Tab 2
- [ ] Tab 2: Shows risk badge, triggers table, IOC table, PDF/JSON download
- [ ] Tab 3: Case history persists, search works, heat-list renders, cross-links show
- [ ] Works offline (disable network in DevTools)
- [ ] Mobile responsive
- [ ] No console errors

### Wireframe
- [ ] wireframe.pdf exists
- [ ] 4 screens visible
- [ ] Callouts explain each panel
- [ ] < 25 MB

### PPT
- [ ] Team_Third_Eye_PS01.pdf exists
- [ ] 8-10 slides
- [ ] PS01 referenced
- [ ] Architecture diagram included
- [ ] Scoring weights table included
- [ ] Scope matrix (Must/Good/Out) included
- [ ] Prototype screenshots included
- [ ] Privacy compliance stated
- [ ] < 25 MB
- [ ] No macros

### Submission
- [ ] All 3 uploaded to rajasthanpolicehackathon.in
- [ ] Each re-downloaded and verified
- [ ] Confirmation screenshot saved
- [ ] Backup in cloud + USB
- [ ] Submitted by 9 PM IST (3-hour buffer)

---

## 🚨 CRITICAL REMINDERS

1. **DEADLINE IS HARD**: 24 Nov 11:59 PM IST. Portal may be slow. Upload by **9 PM**.
2. **OTP LOGIN**: Keep email (hardik06singhal@gmail.com) accessible for OTP.
3. **FILE NAMES**: Use exact names: `index.html`, `wireframe.pdf`, `Team_Third_Eye_PS01.pdf`
4. **NO MACROS**: PPT must be .pdf or .pptx without macros.
5. **OFFLINE DEMO**: Final event at RPA Jaipur may have bad WiFi. Your HTML must work 100% offline.
6. **INDIAN CONTEXT**: Jury is Rajasthan Police. Use Hindi/English mix in UI if helpful. Show you understand *Indian* scams (KYC, electricity bill, instant loan, betting).
7. **EXPLAINABLE**: Every risk point must show WHY. No "AI says so."
8. **EVIDENCE READY**: PDF reports must look like police documents - formal, timestamped, hash-verified.

---

## 📞 ESCALATION / HELP

If stuck on any technical piece:
- APK parsing in browser → simplify: just show mock permissions for demo, note "Full androguard in backend"
- PDF generation fails → use JSON download + "Print to PDF" browser feature as fallback
- Chart.js not loading → static SVG bars for heat-list
- localStorage full → implement IndexedDB or just limit to 50 cases

**Mantra**: *Working demo > Perfect code. Explainable > Complex. Offline > Online. Indian context > Generic.*

---

## ❓ FAQ: COMMON CONFUSIONS

### Q: "Do we need to train an ML model on the sample dataset?"
**A: NO.** The sample dataset from R4C is for **testing your rules**, not training.
- You write regex patterns for Indian phone numbers, UPI IDs, scam keywords
- You define keyword lists (urgency words, MLM terms, betting terms)
- You set scoring weights (Urgency=15pts, Look-alike domain=15pts, SMS perms=20pts)
- You test: "Does my SMS analyzer catch the KYC scam sample?" → Adjust rules if not
- That's **rule engineering**, not model training

### Q: "But the problem says 'analyze' and 'classify' - isn't that ML?"
**A:** In this context:
- **Analyze** = Run deterministic checks (regex, keyword search, structural analysis)
- **Classify** = Apply threshold to weighted score (score ≥ 70 → HIGH)
- The PS01 explicitly mentions "deterministic regex + heuristics engine" as expected approach
- Jury wants to see: `if (hasUrgencyWords) score += 15` not `model.predict(input)`

### Q: "What if we want to add a small ML model later?"
**A:** For the hackathon submission (Nov 24): **Don't.** 
- Adds complexity, breaks explainability, needs training data you don't have
- For Final Event (Nov 28-29): You can mention "Future: ML enhancement for unknown patterns" in PPT
- But core demo must be 100% rule-based and explainable

### Q: "How do we handle 'unknown' new scam patterns?"
**A:** That's what the **heuristic/keyword approach** handles:
- Broad patterns: "guaranteed return", "daily profit", "risk free" catch many variants
- IOC extraction catches new UPI/phone/crypto regardless of message text
- Blacklist updates: Police can add new bad domains/phones/UPIs to JSON files instantly
- No retraining needed - just update the lists

---

**PLAN STATUS**: Ready for execution. Start with Phase 1.1 now.