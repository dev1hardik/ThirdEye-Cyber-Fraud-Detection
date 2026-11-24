import os
from reportlab.lib.pagesizes import letter, landscape
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

def create_wireframe_pdf(output_pdf="wireframe.pdf"):
    # 5-screen landscape wireframe specification adhering strictly to PS01 and Rajasthan Police Hackathon 2026
    doc = SimpleDocTemplate(
        output_pdf,
        pagesize=landscape(letter), # 792 x 612 pt
        leftMargin=32,
        rightMargin=32,
        topMargin=32,
        bottomMargin=32
    )
    
    C_NAVY = colors.HexColor('#0A1D37')   # PrimaryNavy  — exact match to PPT header bars
    C_GOLD = colors.HexColor('#C28B24')   # AccentGold   — exact match to PPT gold lines
    C_DARK = colors.HexColor('#0F172A')   # DarkText     — exact match to PPT body text
    C_BORDER = colors.HexColor('#E2E8F0') # LightGray    — exact match to PPT dividers
    C_LIGHT = colors.HexColor('#F8FAFC')  # OffWhite     — exact match to PPT alt rows
    C_RED = colors.HexColor('#B91C1C')    # DangerRed    — exact match to PPT HIGH badge
    C_GREEN = colors.HexColor('#15803D')  # SuccessGreen — exact match to PPT PASS badge
    C_AMBER = colors.HexColor('#D97706')  # WarningAmber — exact match to PPT MEDIUM badge
    
    style_header = ParagraphStyle('WH', fontName='Helvetica-Bold', fontSize=13, leading=16, textColor=colors.white)
    style_sub = ParagraphStyle('WS', fontName='Helvetica-Bold', fontSize=8.5, leading=11, textColor=C_GOLD)
    style_box_title = ParagraphStyle('WBT', fontName='Helvetica-Bold', fontSize=10.5, leading=13, textColor=C_NAVY)
    style_text = ParagraphStyle('WT', fontName='Helvetica', fontSize=8.5, leading=12, textColor=C_DARK)
    style_callout = ParagraphStyle('WC', fontName='Helvetica-Bold', fontSize=9, leading=12, textColor=C_GOLD)
    style_footer = ParagraphStyle('WF', fontName='Helvetica', fontSize=8, leading=10, textColor=colors.HexColor('#64748B'))

    story = []

    def make_screen_layout(screen_num, screen_title, subtitle, left_content, right_content, callout_text):
        hdr = Table([
            [Paragraph(f"<b>SCREEN {screen_num} OF 5: {screen_title.upper()}</b>", style_header)],
            [Paragraph(f"RAJASTHAN POLICE HACKATHON 2026 (R4C) &nbsp;|&nbsp; PS01 FORENSIC ARCHITECTURAL WIREFRAME &nbsp;|&nbsp; {subtitle.upper()}", style_sub)]
        ], colWidths=[728])
        hdr.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), C_NAVY),
            ('TOPPADDING', (0,0), (-1,-1), 6),
            ('BOTTOMPADDING', (0,0), (-1,-1), 6),
            ('LEFTPADDING', (0,0), (-1,-1), 12),
            ('RIGHTPADDING', (0,0), (-1,-1), 12),
        ]))
        
        body_table = Table([[left_content, right_content]], colWidths=[359, 359])
        body_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.white),
            ('BOX', (0,0), (0,0), 1, C_BORDER),
            ('BOX', (1,0), (1,0), 1, C_BORDER),
            ('TOPPADDING', (0,0), (-1,-1), 10),
            ('BOTTOMPADDING', (0,0), (-1,-1), 10),
            ('LEFTPADDING', (0,0), (-1,-1), 12),
            ('RIGHTPADDING', (0,0), (-1,-1), 12),
            ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ]))
        
        callout_table = Table([
            [Paragraph(f"<b>POLICE FORENSIC OPERATIONAL CALLOUT:</b> {callout_text}", style_callout)]
        ], colWidths=[728])
        callout_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), C_NAVY),
            ('BOX', (0,0), (-1,-1), 1.2, C_GOLD),
            ('TOPPADDING', (0,0), (-1,-1), 6),
            ('BOTTOMPADDING', (0,0), (-1,-1), 6),
            ('LEFTPADDING', (0,0), (-1,-1), 12),
            ('RIGHTPADDING', (0,0), (-1,-1), 12),
        ]))

        footer_table = Table([
            [Paragraph("<b>Team Third Eye</b> &bull; Hardik Singhal (SKIT Jaipur, B.Tech Year 3) &bull; hardik06singhal@gmail.com &bull; Rajasthan Police Academy (RPA), Jaipur", style_footer)]
        ], colWidths=[728])
        footer_table.setStyle(TableStyle([
            ('TOPPADDING', (0,0), (-1,-1), 4),
            ('BOTTOMPADDING', (0,0), (-1,-1), 0),
            ('ALIGN', (0,0), (-1,-1), 'CENTER')
        ]))
        
        return [hdr, Spacer(1, 8), body_table, Spacer(1, 8), callout_table, Spacer(1, 4), footer_table]

    # =========================================================================
    # SCREEN 1: Multi-Channel Ingestion & Real-Time Scanner
    # =========================================================================
    s1_left = [
        Paragraph("1. Citizen & Officer Multi-Channel Ingestion Canvas", style_box_title),
        Spacer(1, 5),
        Paragraph("<b>[ Channel Tabs ]:</b> &nbsp; <b>[ 📱 SMS / WhatsApp / URL ]</b> &nbsp;|&nbsp; [ 📲 Android APK ] &nbsp;|&nbsp; [ 🌐 Website HTML ]", style_text),
        Spacer(1, 5),
        Paragraph("<b>Forensic Input Canvas:</b><br/>"
                  "<i>'Paste suspicious SMS text, WhatsApp fraud alert, banking link, or Play Store URL...'</i><br/>"
                  "<b>Live Character Counter:</b> 214 chars &nbsp;|&nbsp; <b>Actions:</b> [ Clear Canvas ] &nbsp; [ Paste Sample ]", style_text),
        Spacer(1, 7),
        Paragraph("<b>Pre-Loaded Jury Demonstration Pills (Codebase Test Cases):</b><br/>"
                  "&bull; <b>[ 📱 SBI YONO KYC Suspension ]</b> &rarr; Urgency token + APK shortener<br/>"
                  "&bull; <b>[ ⚡ JVVNL Electricity Cutoff ]</b> &rarr; Bijli disconnection tonight at 9:30 PM<br/>"
                  "&bull; <b>[ 🌐 Fake SBI Netbanking Link ]</b> &rarr; Levenshtein typosquat domain<br/>"
                  "&bull; <b>[ 🛍️ Fake Play Store Loan App ]</b> &rarr; Lookalike predatory loan package<br/>"
                  "&bull; <b>[ 📲 Instant Loan Harvester APK ]</b> &rarr; Sideloaded extortion spyware<br/>"
                  "&bull; <b>[ 💰 Ponzi MLM Doubling Site ]</b> &rarr; Guaranteed daily ROI + binary tree", style_text)
    ]
    s1_right = [
        Paragraph("2. Calibrated 5-Second Forensic Scanner Engine", style_box_title),
        Spacer(1, 5),
        Paragraph("<b>Primary Action CTA:</b> [ 🔍 Verify Safety & Analyze Risk &rarr; ]", style_text),
        Spacer(1, 7),
        Paragraph("<b>Observable Multi-Stage Pipeline (Builds Judicial Trust):</b><br/>"
                  "<b>Stage 1: Tokenizing Input (0 &ndash; 1.2s):</b><br/>"
                  "&bull; Extracts phone numbers, UPI handles, URLs, and banking keywords via regex.<br/>"
                  "<b>Stage 2: Querying Threat Intelligence (1.2 &ndash; 2.5s):</b><br/>"
                  "&bull; Cross-checks pre-loaded state blacklist (16 domains, 11 phones, 8 UPIs) & WHOIS.<br/>"
                  "<b>Stage 3: Calculating Deterministic Risk (2.5 &ndash; 3.8s):</b><br/>"
                  "&bull; Weighs 7 heuristic rule engines (Urgency, Spoofing, APK, Ponzi, Betting).<br/>"
                  "<b>Stage 4: Sealing Cryptographic Evidence (3.8 &ndash; 5.0s):</b><br/>"
                  "&bull; Computes immutable SHA-256 hash for Section 63 BSA 2023 compliance.", style_text),
        Spacer(1, 7),
        Paragraph("<b>Offline Operational Guarantee:</b><br/>"
                  "&bull; Zero external API dependencies; executes 100% locally in rural police stations.", style_text)
    ]
    for el in make_screen_layout(1, "Multi-Channel Ingestion & Real-Time Scanner", "Unified Ingestion Interface", s1_left, s1_right, "100% Deterministic Regex & Rule Engine &bull; Zero Black-Box ML &bull; Works 100% Offline with zero cloud dependencies"):
        story.append(el)
    story.append(PageBreak())

    # =========================================================================
    # SCREEN 2: Explainable Forensic Verdict & Audit Trail
    # =========================================================================
    s2_left = [
        Paragraph("1. Explainable Verdict & Risk Calibrator", style_box_title),
        Spacer(1, 5),
        Paragraph("<b>Incident Classification:</b> <font color='#dc2626'><b>🔴 CRITICAL RISK / HIGH SEVERITY THREAT</b></font><br/>"
                  "<b>Calculated Risk Score:</b> <b>85 / 100</b> &nbsp;|&nbsp; <b>Confidence:</b> 98% Forensic Certainty<br/>"
                  "<b>Case ID:</b> <code>RJ-CYBER-2026-8272B</code> &nbsp;|&nbsp; <b>Timestamp:</b> 24-Nov-2026 18:45 IST<br/>"
                  "<b>Summary:</b> Impersonation of State Bank of India with false account closure threat.", style_text),
        Spacer(1, 7),
        Paragraph("<b>True Negative Immunity Protection (Zero False Alarms):</b><br/>"
                  "&bull; Built-in institution whitelist protects genuine banking & government apps (SBI YONO, HDFC, ICICI, BHIM, UIDAI, WhatsApp) from false alarms.", style_text),
        Spacer(1, 7),
        Paragraph("<b>Statutory Offence Mapping:</b><br/>"
                  "&bull; <b>Section 318 BNS</b> (Cheating by Impersonation / formerly Sec 420 IPC)<br/>"
                  "&bull; <b>Section 66D IT Act</b> (Cheating by Personation using Computer Resource)", style_text)
    ]
    s2_right = [
        Paragraph("2. Court-Admissible Rule Audit Trail Table", style_box_title),
        Spacer(1, 5),
        Paragraph("Every single point is explicitly substantiated by an evidence substring:", style_text),
        Spacer(1, 5),
        Paragraph("┌───────────────────────────┬──────────┬───────────┬───────────────────────────────┐<br/>"
                  "│ <b>Rule Identifier</b>         │ <b>Weight</b>   │ <b>Severity</b>  │ <b>Evidence Substring Found</b>     │<br/>"
                  "├───────────────────────────┼──────────┼───────────┼───────────────────────────────┤<br/>"
                  "│ RULE_MSG_URGENCY          │ +30 pts  │ HIGH      │ 'within 2 hours' / 'blocked'  │<br/>"
                  "│ RULE_MSG_IMPERSONATION    │ +25 pts  │ HIGH      │ 'Dear SBI Customer, YONO'     │<br/>"
                  "│ RULE_URL_SUSPICIOUS_TLD   │ +20 pts  │ MEDIUM    │ '.xyz / .top domain extension'│<br/>"
                  "│ RULE_IOC_EXTRACTED_UPI    │ +10 pts  │ HIGH      │ 'refund.sbi.kyc@okaxis'       │<br/>"
                  "│ RULE_INTEL_BLACKLIST_HIT  │ ESCALATE │ CRITICAL  │ Matched I4C / State Blacklist │<br/>"
                  "└───────────────────────────┴──────────┴───────────┴───────────────────────────────┘", style_text),
        Spacer(1, 6),
        Paragraph("<b>Judicial Cross-Examination Defense:</b><br/>"
                  "Because scores are deterministic rules, forensic officers can defend every point in court without black-box neural network opacity.", style_text)
    ]
    for el in make_screen_layout(2, "Explainable Forensic Verdict & Audit Trail", "Deterministic Risk Scorer", s2_left, s2_right, "Every point maps directly to a statutory rule ID and verifiable evidence token (Supreme Court: Arjun Panditrao Khotkar v. K.K. Gorantyal)"):
        story.append(el)
    story.append(PageBreak())

    # =========================================================================
    # SCREEN 3: Extracted Indicators of Compromise (IOCs) & Entity Intelligence
    # =========================================================================
    s3_left = [
        Paragraph("1. Extracted Indicators of Compromise (IOCs)", style_box_title),
        Spacer(1, 5),
        Paragraph("Automated regex & parser extracts actionable forensic artifacts into structured chips:", style_text),
        Spacer(1, 5),
        Paragraph("┌──────────────────┬─────────────────────────────┬───────────────────────────────┐<br/>"
                  "│ <b>IOC Category</b>      │ <b>Extracted Value</b>          │ <b>Threat Intel Status</b>         │<br/>"
                  "├──────────────────┼─────────────────────────────┼───────────────────────────────┤<br/>"
                  "│ 💰 Scammer UPI   │ refund.sbi.kyc@okaxis       │ 🔴 Blacklisted Fraud Mule     │<br/>"
                  "│ 📞 Rogue Phone   │ +919876543210               │ 🔴 Fake Nodal Officer Match   │<br/>"
                  "│ 🌐 Phishing URL  │ sbi-kyc-verification.xyz    │ 🔴 Registered 3 Days Ago (RU) │<br/>"
                  "│ 📦 APK Package   │ com.quickcash.sbi.loan      │ 🔴 Predatory Loan Lookalike   │<br/>"
                  "│ 🔑 Crypto Wallet │ TJg4X8k7zLpQ3vB7qN4n...     │ 🟡 TRC20 USDT Deposit Wallet  │<br/>"
                  "└──────────────────┴─────────────────────────────┴───────────────────────────────┘", style_text),
        Spacer(1, 7),
        Paragraph("<b>One-Click Operational Actions:</b><br/>"
                  "[ Copy All IOCs ] &nbsp;|&nbsp; [ Push to I4C / NCRP Portal ] &nbsp;|&nbsp; [ Send Telecom Notice ]", style_text)
    ]
    s3_right = [
        Paragraph("2. Offline Threat Intelligence & Domain Matrix", style_box_title),
        Spacer(1, 5),
        Paragraph("<b>Mock WHOIS & Domain Age Simulation:</b><br/>"
                  "&bull; <b>Domain:</b> <code>sbi-kyc-verification.xyz</code><br/>"
                  "&bull; <b>Domain Age:</b> 3 Days Old (Flagged: Newly Created Phishing Domain &le; 30d)<br/>"
                  "&bull; <b>Registrar:</b> NameCheap, Inc. &nbsp;|&nbsp; <b>Registrant Country:</b> RU<br/>"
                  "&bull; <b>SSL Certificate:</b> Let's Encrypt Free DV (Zero Enterprise Validation)", style_text),
        Spacer(1, 7),
        Paragraph("<b>Android APK Permission Threat Matrix:</b><br/>"
                  "&bull; <code>READ_SMS</code> + <code>RECEIVE_SMS</code> &rarr; Intercepts 2FA OTPs for unauthorized bank debit<br/>"
                  "&bull; <code>READ_CONTACTS</code> &rarr; Exfiltrates entire address book for borrower blackmail<br/>"
                  "&bull; <code>SYSTEM_ALERT_WINDOW</code> &rarr; Injects invisible phishing overlay over banking apps<br/>"
                  "&bull; <code>BIND_ACCESSIBILITY_SERVICE</code> &rarr; Complete remote device takeover", style_text)
    ]
    for el in make_screen_layout(3, "Extracted IOCs & Entity Threat Intelligence", "Forensic Extraction Layer", s3_left, s3_right, "Instantly extracts UPI VPAs, phone numbers, and domains for freezing accounts under Section 106 / 107 BNSS"):
        story.append(el)
    story.append(PageBreak())

    # =========================================================================
    # SCREEN 4: Cross-District Police Case Ledger & Syndicate Linking
    # =========================================================================
    s4_left = [
        Paragraph("1. Searchable Police Case Ledger", style_box_title),
        Spacer(1, 5),
        Paragraph("<b>Search & Multi-Filter Bar:</b><br/>"
                  "[ Search by UPI VPA, Phone, Case ID, Domain... ] &nbsp; [ Priority: All | High | Med | Low ]", style_text),
        Spacer(1, 6),
        Paragraph("<b>Station Complaint Registry (Persistent Local Storage):</b><br/>"
                  "&bull; <b>Case #1:</b> RJ-CYBER-2026-8272B &bull; SMS &bull; Score: 85% &bull; <font color='#dc2626'><b>🔴 HIGH</b></font><br/>"
                  "&bull; <b>Case #2:</b> RJ-CYBER-2026-HPEXP &bull; URL &bull; Score: 65% &bull; <font color='#d97706'><b>🟡 MEDIUM</b></font><br/>"
                  "&bull; <b>Case #3:</b> RJ-CYBER-2026-DMWS0 &bull; APK &bull; Score: 85% &bull; <font color='#dc2626'><b>🔴 HIGH</b></font><br/>"
                  "&bull; <b>Case #4:</b> RJ-CYBER-2026-K9EKI &bull; Web &bull; Score: 100% &bull; <font color='#dc2626'><b>🔴 HIGH</b></font>", style_text),
        Spacer(1, 6),
        Paragraph("<b>Zero Ghost Cases Architecture:</b><br/>"
                  "Verified clear/reseed logic ensures complaint records survive browser refreshes and station shift handovers without phantom state corruption.", style_text)
    ]
    s4_right = [
        Paragraph("2. Cross-Case Syndicate Correlation & Heat-List", style_box_title),
        Spacer(1, 5),
        Paragraph("<font color='#dc2626'><b>⚠️ SYNDICATE MATCH IDENTIFIED (Multi-District Nexus):</b></font><br/>"
                  "The UPI ID <code>refund.sbi.kyc@okaxis</code> appears across <b>3 separate police complaints</b>:<br/>"
                  "&bull; <b>FIR 42/26 (Jaipur East):</b> Fake SBI KYC SMS complaint<br/>"
                  "&bull; <b>FIR 18/26 (Jodhpur Cyber Cell):</b> Ponzi investment deposit handle<br/>"
                  "&bull; <b>Complaint 902/26 (Kota):</b> Predatory loan APK recovery handle", style_text),
        Spacer(1, 7),
        Paragraph("<b>Rajasthan Cyber Crime Heat-List (Top Recurring Entities):</b><br/>"
                  "1. <code>refund.sbi.kyc@okaxis</code> &mdash; 14 Complaints [UPI Mule Account]<br/>"
                  "2. <code>+918899001122</code> &mdash; 11 Complaints [JVVNL Extortion Caller]<br/>"
                  "3. <code>bijli-bill-alert.top</code> &mdash; 9 Complaints [Fake Disconnection Domain]<br/>"
                  "4. <code>com.quickcash.sbi.loan</code> &mdash; 7 Complaints [Trojan Loan Sideload]", style_text),
        Spacer(1, 6),
        Paragraph("<b>Police Action:</b> One-click export to freeze syndicate accounts under Section 106/107 BNSS.", style_text)
    ]
    for el in make_screen_layout(4, "Cross-District Syndicate Linking & Case Ledger", "Intelligence Correlation Engine", s4_left, s4_right, "Bridges siloed district databases to expose organized cyber fraud syndicates operating across Rajasthan"):
        story.append(el)
    story.append(PageBreak())

    # =========================================================================
    # SCREEN 5: Court-Admissible Evidence Dossier & Export
    # =========================================================================
    s5_left = [
        Paragraph("1. Formal Police Cyber Cell Evidence Dossier", style_box_title),
        Spacer(1, 5),
        Paragraph("<b>Institutional Header:</b> Government of Rajasthan &bull; Cyber Crime Police Station<br/>"
                  "<b>Case ID:</b> <code>RJ-CYBER-2026-8272B</code> &nbsp;|&nbsp; <b>Station:</b> Jaipur Cyber PS", style_text),
        Spacer(1, 6),
        Paragraph("<b>Statutory Certification (Section 63 BSA 2023):</b><br/>"
                  "<i>'I hereby certify that this digital forensic analysis was generated on an offline, deterministic triage terminal. The underlying electronic record has remained unaltered throughout the custody chain.'</i>", style_text),
        Spacer(1, 6),
        Paragraph("<b>Immutable Cryptographic Seal:</b><br/>"
                  "&bull; <b>SHA-256 Digest:</b> <code>9f83a21b4e98...d7102e34</code><br/>"
                  "&bull; <b>Algorithm:</b> Standard FIPS 180-4 SHA-256 Digest<br/>"
                  "&bull; <b>Audit Verification:</b> Matches live input payload 100%", style_text)
    ]
    s5_right = [
        Paragraph("2. Dual-Format Evidence Export Engine", style_box_title),
        Spacer(1, 5),
        Paragraph("<b>Export Option A: Structured JSON Evidence Dossier</b><br/>"
                  "&bull; Export formatted for direct ingestion into National Cyber Crime Reporting Portal (NCRP / 1930) and CCTNS database.<br/>"
                  "&bull; Contains complete trigger array, timestamps, and normalized IOC objects.<br/>"
                  "[ 📥 Download Signed JSON Dossier ]", style_text),
        Spacer(1, 7),
        Paragraph("<b>Export Option B: Printable Court-Ready PDF Certificate</b><br/>"
                  "&bull; Generates official police case sheet with Rajasthan state crest, rule audit trail, entity links, and investigating officer sign-off block.<br/>"
                  "[ 🖨️ Generate Official Police Inspection PDF ]", style_text),
        Spacer(1, 7),
        Paragraph("<b>Operational Prosecution Impact:</b><br/>"
                  "Transforms raw digital complaints into legally binding evidence packets ready for immediate court submission before judicial magistrates.", style_text)
    ]
    for el in make_screen_layout(5, "Court-Admissible Evidence Dossier & Export", "Section 63 BSA 2023 Compliance", s5_left, s5_right, "Generates signed JSON and printable PDF evidence certificates fully compliant with Section 63 BSA 2023 (formerly Sec 65B)"):
        story.append(el)

    doc.build(story)
    print(f"✓ Award-Winning 5-Screen Wireframe generated successfully as: {output_pdf}")

if __name__ == "__main__":
    create_wireframe_pdf("wireframe.pdf")


