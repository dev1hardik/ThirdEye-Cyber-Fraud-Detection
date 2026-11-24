# Third Eye: Unified Cyber Fraud & Scam Triage Platform

> **Submission for Rajasthan Police Hackathon 2026 (R4C)**  
> **Problem Statement:** PS01 — Cyber Fraud / Phishing / Malicious Apps  
> **Team:** Third Eye  
> **Institution:** Swami Keshvanand Institute of Technology, Management & Gramothan (SKIT), Jaipur  

---

## Executive Summary

Third Eye is an offline-first, deterministic cyber fraud analysis engine built for state police cyber crime stations. It analyzes suspicious SMS text, WhatsApp messages, banking phishing links, Android APK manifests, and fraudulent website HTML to extract actionable Indicators of Compromise (IOCs), correlate multi-district criminal syndicates, and output court-admissible forensic dossiers compliant with **Section 63 of Bharatiya Sakshya Adhiniyam, 2023 (BSA)**.

---

## Key Capabilities

- **Multi-Vector Analysis:** Ingests SMS/WhatsApp text, URLs, APK manifests, and website HTML.
- **Deterministic Heuristic Engine:** 100% rule-based scoring (0–100 scale). Every score links to rule IDs and verified input tokens for legal cross-examination (*Arjun Panditrao Khotkar v. K.K. Gorantyal, 2020*).
- **False Positive Immunity:** Whitelist validation clears legitimate banking and government applications (SBI YONO, HDFC, ICICI, BHIM NPCI, UIDAI, WhatsApp) with 0.0% false alarms.
- **Cross-District Syndicate Correlation:** Matches shared technical entities (such as mule UPI handles and rogue helpline numbers) across distinct FIR complaints for coordinated account freezes under **Section 106 / 107 of Bharatiya Nagarik Suraksha Sanhita, 2023 (BNSS)**.
- **Offline & Sovereign:** Zero external API or cloud calls; runs in isolated environments on rural police terminals.

---

## Repository Structure

```text
├── assets/
│   ├── docs/                   # Wireframe screens, slide deck, and presentation assets
│   └── samples/                # Mock APK manifests, test websites, and sample inputs
├── data/
│   ├── blacklists.json         # Threat intelligence blacklist (domains, phones, UPIs)
│   ├── data-store.js           # Client-side data store for offline execution
│   └── mock-whois.json         # Offline simulated WHOIS registrar database
├── engine/
│   ├── apk-analyzer.js         # Android manifest and dangerous permission auditor
│   ├── ioc-extractor.js        # Regex extractor for UPIs, phones, URLs, and wallets
│   ├── message-analyzer.js     # SMS/WhatsApp urgency and impersonation heuristics
│   ├── report-generator.js     # SHA-256 evidence hashing and export generator
│   ├── risk-scorer.js          # Deterministic 0–100 risk scoring engine
│   ├── url-analyzer.js         # Levenshtein typosquatting and TLD inspector
│   └── website-analyzer.js     # Ponzi, MLM, and illegal gambling content scanner
├── scripts/
│   ├── compile_latex_to_pdf.py # LaTeX action plan build automation
│   └── generate_wireframe.py   # 5-screen architectural wireframe compiler
├── tests/
│   ├── final-audit.js          # Pre-submission verification test suite
│   ├── security-audit-test.js  # Adversarial input and ReDoS hardening tests
│   ├── simulate-lifecycle.js   # State persistence and storage test
│   └── test-appstore-matrix.js # App store confusion matrix test
├── utils/
│   ├── constants.js            # Statutory references and system constants
│   └── helpers.js              # Formatting and normalization helpers
├── index.html                  # Main forensic workstation interface
└── README.md                   # Project documentation
```

---

## Verification & Test Results

Run all test suites locally with Node.js:

```bash
# Execute complete pre-submission verification
node tests/final-audit.js

# Run App Store confusion matrix (true positive / true negative verification)
node tests/test-appstore-matrix.js

# Run security and adversarial input audit
node tests/security-audit-test.js
```

### Audit Highlights
- **Threat Detection (True Positives):** 6 / 6 test categories verified.
- **False Alarm Prevention (True Negatives):** 6 / 6 legitimate applications cleared (0.0% false alarm rate).
- **App Store Matrix:** 12 / 12 benign and malicious packages classified correctly.
- **Adversarial Resilience:** Evaluates inputs in < 1 ms; resilient against ReDoS and prototype pollution.

---

## Legal & Statutory Anchors

| Statutory Clause | Legal Subject | System Application |
| :--- | :--- | :--- |
| **Section 63 BSA 2023** | Electronic Records Admissibility | SHA-256 signed tamper-proof evidence reports |
| **Section 106 / 107 BNSS** | Seizure & Freezing of Crime Proceeds | Immediate automated mule UPI / bank freezing notices |
| **Section 318 BNS** | Cheating by Personation | Establishes mens rea from deceptive SMS and links |
| **Section 66D IT Act** | Impersonation via Computer Resource | Flags brand spoofing of public sector entities |

---

## Team

- **Hardik Singhal** — Team Leader (B.Tech Computer Science, Year 3)  
  *Swami Keshvanand Institute of Technology, Management & Gramothan (SKIT), Jaipur*  
  Email: hardik06singhal@gmail.com
