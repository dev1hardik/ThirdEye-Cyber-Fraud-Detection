import os
from reportlab.lib.pagesizes import letter, landscape
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super(NumberedCanvas, self).__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super(NumberedCanvas, self).showPage()
        super(NumberedCanvas, self).save()

    def draw_page_decorations(self, page_count):
        if self._pageNumber == 1:
            return  # Cover slide has custom full-bleed artwork
            
        self.saveState()
        # Top banner bar (full width)
        self.setFillColor(colors.HexColor('#0b192c'))
        self.rect(0, 560, 792, 52, fill=1, stroke=0)
        
        # Gold accent dividing strip
        self.setFillColor(colors.HexColor('#c28b24'))
        self.rect(0, 556, 792, 4, fill=1, stroke=0)
        
        # Top banner text
        self.setFillColor(colors.HexColor('#c28b24'))
        self.setFont("Helvetica-Bold", 8)
        self.drawString(45, 595, "RAJASTHAN POLICE HACKATHON 2026 (R4C)  |  PS01: CYBER FRAUD & SCAM DETECTION")
        
        # Bottom footer dividing line (margins: 45 to 747 = 702 pt)
        self.setFillColor(colors.HexColor('#e2e8f0'))
        self.rect(45, 28, 702, 1, fill=1, stroke=0)
        
        # Bottom footer text
        self.setFillColor(colors.HexColor('#64748b'))
        self.setFont("Helvetica", 8)
        self.drawString(45, 17, "Team Third Eye  •  SKIT Jaipur (B.Tech Year 3)  •  Hardik Singhal (Leader)  •  Section 65B BSA 2023 Evidence Standard")
        
        page_str = f"Slide {self._pageNumber} of {page_count}"
        self.drawRightString(747, 17, page_str)
        self.restoreState()

def build_7slide_pdf(output_pdf="Team_Third_Eye_PS01.pdf"):
    # Target: 792 x 612 pt landscape
    # Content Margins: Left=45, Right=45 => Printable Width = 702 pt.
    doc = SimpleDocTemplate(
        output_pdf,
        pagesize=landscape(letter),
        leftMargin=45,
        rightMargin=45,
        topMargin=64,
        bottomMargin=36
    )
    
    styles = getSampleStyleSheet()
    
    # Modern Executive Palette
    C_NAVY_DARK = colors.HexColor('#0b192c')
    C_NAVY_MID  = colors.HexColor('#1e3e62')
    C_GOLD      = colors.HexColor('#c28b24')
    C_DARK      = colors.HexColor('#1e293b')
    C_MUTED     = colors.HexColor('#64748b')
    C_BORDER    = colors.HexColor('#cbd5e1')
    C_CARD_BG   = colors.HexColor('#ffffff')
    C_ALT_BG    = colors.HexColor('#f8fafc')
    C_EMERALD   = colors.HexColor('#059669')
    C_RED       = colors.HexColor('#dc2626')
    
    # Stylish & Professional Typography
    style_slide_title = ParagraphStyle(
        'SlideTitle',
        parent=styles['Normal'],
        fontName='Times-Bold',
        fontSize=15.5,
        leading=19,
        textColor=C_NAVY_DARK,
        spaceAfter=8
    )
    
    style_card_head = ParagraphStyle(
        'CardHead',
        parent=styles['Normal'],
        fontName='Times-Bold',
        fontSize=11.5,
        leading=14.5,
        textColor=C_NAVY_DARK,
        spaceAfter=5
    )

    style_card_head_red = ParagraphStyle(
        'CardHeadRed',
        parent=styles['Normal'],
        fontName='Times-Bold',
        fontSize=11.5,
        leading=14.5,
        textColor=C_RED,
        spaceAfter=5
    )

    style_card_head_gold = ParagraphStyle(
        'CardHeadGold',
        parent=styles['Normal'],
        fontName='Times-Bold',
        fontSize=11.5,
        leading=14.5,
        textColor=C_GOLD,
        spaceAfter=5
    )
    
    style_body = ParagraphStyle(
        'Body',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12.2,
        textColor=C_DARK,
        spaceAfter=4
    )

    style_table_header = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=11.5,
        textColor=colors.white,
        alignment=1 # Center
    )
    
    style_table_cell = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=11,
        textColor=C_DARK
    )

    style_table_cell_center = ParagraphStyle(
        'TableCellCenter',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=11,
        textColor=C_DARK,
        alignment=1 # Center
    )

    story = []
    
    # =========================================================================
    # SLIDE 1: COVER SLIDE
    # =========================================================================
    cover_data = [
        [Paragraph("<font color='#c28b24' size=10><b>RAJASTHAN POLICE ACADEMY (RPA) • JAIPUR &nbsp;|&nbsp; R4C 2026</b></font>", styles['Normal'])],
        [Paragraph("<font color='white' size=30><b>THIRD EYE</b></font>", styles['Normal'])],
        [Paragraph("<font color='#c28b24' size=15><b>Unified Cyber Fraud &amp; Scam Triage Platform</b></font>", styles['Normal'])],
        [Paragraph("<font color='#cbd5e1' size=9.5>Problem Statement PS01: Scam Message &amp; Phishing Link Detection with Fake Loan / Investment App &amp; Fraudulent Website Analysis</font>", styles['Normal'])],
        [Spacer(1, 14)],
        [Paragraph("<font color='#c28b24' size=9><b>ACTION PLAN PRESENTATION &amp; TECHNICAL SPECIFICATION</b></font>", styles['Normal'])],
        [Paragraph("<font color='white' size=9.5><b>Team Leader:</b> Hardik Singhal (B.Tech Computer Science, Year 3) &nbsp;|&nbsp; <b>Email:</b> hardik06singhal@gmail.com<br/><b>Institution:</b> Swami Keshvanand Institute of Technology, Management &amp; Gramothan (SKIT), Jaipur<br/><b>Core Architecture:</b> 100% Deterministic Rule Engine &nbsp;•&nbsp; Zero Black-Box AI &nbsp;•&nbsp; 100% Offline Station Readiness</font>", styles['Normal'])]
    ]
    t_cover = Table(cover_data, colWidths=[660])
    t_cover.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), C_NAVY_DARK),
        ('BOX', (0,0), (-1,-1), 2, C_GOLD),
        ('TOPPADDING', (0,0), (-1,-1), 16),
        ('BOTTOMPADDING', (0,0), (-1,-1), 16),
        ('LEFTPADDING', (0,0), (-1,-1), 24),
        ('RIGHTPADDING', (0,0), (-1,-1), 24),
    ]))
    story.append(Spacer(1, 20))
    story.append(t_cover)
    story.append(PageBreak())
    
    # =========================================================================
    # SLIDE 2: OPERATIONAL FIELD REALITY
    # =========================================================================
    story.append(Paragraph("Operational Field Reality: Multi-Channel Syndicates vs. Siloed Policing", style_slide_title))
    
    c1_content = [
        Paragraph("The Ground Threat in Rajasthan", style_card_head),
        Paragraph("<b>• Multi-Channel Campaign Networks:</b> Cyber fraud groups in Mewat, Bharatpur, and Alwar do not operate in single silos. The identical syndicate runs fake JVVNL electricity cutoff SMS, instant loan apps, and Ponzi sites simultaneously.", style_body),
        Paragraph("<b>• Financial Identifier Reuse:</b> A single fraudulent operation reuses the identical UPI VPA, virtual SIM card, and APK infrastructure across 50+ victim complaints in different districts.", style_body),
        Paragraph("<b>• Vulnerable Citizen Profiles:</b> Farmers facing power cutoff threats, students trapped by ₹5,000 instant loan blackmail, and senior citizens receiving bank KYC suspension warnings.", style_body)
    ]
    
    c2_content = [
        Paragraph("Investigation Bottlenecks at Cyber Stations", style_card_head_red),
        Paragraph("<b>• Siloed Case Files:</b> An SMS complaint in Jodhpur is filed separately from an APK loan extortion case in Jaipur, missing the shared underlying UPI handle across FIRs.", style_body),
        Paragraph("<b>• Flaws of Black-Box GenAI:</b> Generative AI and unverified LLMs hallucinate, cannot be explained in court under cross-examination, and violate strict criminal proof standards.", style_body),
        Paragraph("<b>• Rural Station Network Drops:</b> Cloud-dependent tools fail when internet drops in field deployments. Stations need 100% self-contained offline triage.", style_body),
        Paragraph("<b>• Evidentiary Deficiencies:</b> Raw screenshots without cryptographic hash verification often fail Section 65B Indian Evidence Act / BSA 2023 legal muster.", style_body)
    ]
    
    t_s2 = Table([[c1_content, c2_content]], colWidths=[340, 340])
    t_s2.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), C_CARD_BG),
        ('BOX', (0,0), (0,0), 1, C_BORDER),
        ('BOX', (1,0), (1,0), 1, colors.HexColor('#fca5a5')),
        ('TOPPADDING', (0,0), (-1,-1), 12),
        ('BOTTOMPADDING', (0,0), (-1,-1), 12),
        ('LEFTPADDING', (0,0), (-1,-1), 14),
        ('RIGHTPADDING', (0,0), (-1,-1), 14),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    story.append(t_s2)
    story.append(PageBreak())

    # =========================================================================
    # SLIDE 3: UNIFIED SOLUTION & INVESTIGATION PIPELINE
    # =========================================================================
    story.append(Paragraph("Proposed Solution: Third Eye 4-Channel Unified Triage Pipeline", style_slide_title))
    
    steps = [
        [Paragraph("<font color='white'><b>01</b></font>", style_table_header),
         Paragraph("<b>1. Multi-Vector Ingestion:</b> Citizen or IO inputs SMS, WhatsApp text, suspicious link, Play Store URL, APK file, or Website HTML into a single unified window.", style_body)],
        [Paragraph("<font color='white'><b>02</b></font>", style_table_header),
         Paragraph("<b>2. Heuristic Analysis Engine:</b> 7 deterministic analyzers run regex tokenization, typosquatting (Levenshtein), permission risk mapping, and Ponzi keywords.", style_body)],
        [Paragraph("<font color='white'><b>03</b></font>", style_table_header),
         Paragraph("<b>3. Explainable Risk Scoring:</b> Calculates 0–100 calibrated score. Every single point maps to an exact statutory rule ID, evidence substring, and category.", style_body)],
        [Paragraph("<font color='white'><b>04</b></font>", style_table_header),
         Paragraph("<b>4. Cross-Case Entity Linking:</b> Extracts IOCs (UPI, Phone, Domain, Crypto). Automatically queries local ledger to reveal syndicate connections across complaints.", style_body)],
        [Paragraph("<font color='white'><b>05</b></font>", style_table_header),
         Paragraph("<b>5. Court-Ready Evidence Dossier:</b> Produces formal inspection report with SHA-256 evidence integrity seal, ready for chargesheets and bank freeze requests.", style_body)]
    ]
    t_s3 = Table(steps, colWidths=[40, 640])
    t_s3.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (0,0), C_NAVY_DARK),
        ('BACKGROUND', (0,1), (0,1), C_NAVY_DARK),
        ('BACKGROUND', (0,2), (0,2), C_NAVY_DARK),
        ('BACKGROUND', (0,3), (0,3), C_GOLD),
        ('BACKGROUND', (0,4), (0,4), C_EMERALD),
        ('BACKGROUND', (1,0), (1,-1), C_CARD_BG),
        ('BOX', (0,0), (-1,-1), 1, C_BORDER),
        ('INNERGRID', (0,0), (-1,-1), 0.5, C_BORDER),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 7),
        ('BOTTOMPADDING', (0,0), (-1,-1), 7),
        ('LEFTPADDING', (1,0), (1,-1), 10),
    ]))
    story.append(t_s3)
    story.append(Spacer(1, 10))
    
    pillars_content = [
        Paragraph("<font color='#0b192c'><b>CORE ARCHITECTURAL PILLARS:</b></font> &nbsp; "
                  "<b>100% Offline Station Operation</b> (zero cloud dependency) &nbsp;•&nbsp; "
                  "<b>Calibrated 5s Inspection Scanner</b> (multi-stage observable verification) &nbsp;•&nbsp; "
                  "<b>Light Authoritative Police Theme</b> (optimized for projection and print)", style_body)
    ]
    t_s3_pill = Table([pillars_content], colWidths=[680])
    t_s3_pill.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), C_ALT_BG),
        ('BOX', (0,0), (-1,-1), 1, C_GOLD),
        ('TOPPADDING', (0,0), (-1,-1), 7),
        ('BOTTOMPADDING', (0,0), (-1,-1), 7),
        ('LEFTPADDING', (0,0), (-1,-1), 10),
        ('RIGHTPADDING', (0,0), (-1,-1), 10),
    ]))
    story.append(t_s3_pill)
    story.append(PageBreak())

    # =========================================================================
    # SLIDE 4: EXPLAINABLE RISK SCORING MODEL
    # =========================================================================
    story.append(Paragraph("Explainable Risk Scoring Model: Auditable in a Court of Law", style_slide_title))
    
    score_table_data = [
        [Paragraph("<b>Component</b>", style_table_header),
         Paragraph("<b>Weight</b>", style_table_header),
         Paragraph("<b>Heuristic Indicators Monitored</b>", style_table_header),
         Paragraph("<b>Statutory Legal Value</b>", style_table_header)],
        [Paragraph("<b>Message Urgency &amp; Impersonation</b>", style_table_cell),
         Paragraph("<font color='#c28b24'><b>30 Pts</b></font>", style_table_cell_center),
         Paragraph("Urgency tokens ('within 2 hours'), action demands, spoofing SBI, HDFC, JVVNL.", style_table_cell),
         Paragraph("Proves Mens Rea under Sec 420 IPC / Sec 318 BNS", style_table_cell)],
        [Paragraph("<b>URL &amp; Domain Anomalies</b>", style_table_cell),
         Paragraph("<font color='#c28b24'><b>25 Pts</b></font>", style_table_cell_center),
         Paragraph("Levenshtein lookalike banks, newly registered domain simulation, .top/.xyz, raw IP URLs.", style_table_cell),
         Paragraph("Direct proof of technical phishing infrastructure", style_table_cell)],
        [Paragraph("<b>APK Dangerous Permissions</b>", style_table_cell),
         Paragraph("<font color='#c28b24'><b>25 Pts</b></font>", style_table_cell_center),
         Paragraph("SMS read/send (OTP theft), contact harvesting, overlay attacks, call logs, device admin.", style_table_cell),
         Paragraph("Establishes Trojan spyware functionality", style_table_cell)],
        [Paragraph("<b>Website Content &amp; Ponzi Claims</b>", style_table_cell),
         Paragraph("<font color='#c28b24'><b>20 Pts</b></font>", style_table_cell_center),
         Paragraph("Guaranteed daily ROI, MLM binary downlines, real money cricket betting, fake SEBI/RBI claims.", style_table_cell),
         Paragraph("Violates Prize Chits &amp; Money Circulation Act", style_table_cell)],
        [Paragraph("<b>Blacklist Threat Intel Hits</b>", style_table_cell),
         Paragraph("<font color='#059669'><b>Escalate</b></font>", style_table_cell_center),
         Paragraph("Pre-seeded cyber syndicate UPI handles, fraudulent mobile numbers, and predatory APK IDs.", style_table_cell),
         Paragraph("Links accused directly to multi-state warrants", style_table_cell)],
    ]
    t_s4 = Table(score_table_data, colWidths=[150, 65, 275, 190])
    t_s4.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), C_NAVY_DARK),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [C_CARD_BG, C_ALT_BG]),
        ('BOX', (0,0), (-1,-1), 1, C_BORDER),
        ('INNERGRID', (0,0), (-1,-1), 0.5, C_BORDER),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('LEFTPADDING', (0,0), (-1,-1), 7),
        ('RIGHTPADDING', (0,0), (-1,-1), 7),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(t_s4)
    story.append(Spacer(1, 8))
    
    why_no_ai = [
        Paragraph("<font color='#0b192c'><b>CRITICAL LEGAL PRINCIPLE: WHY ZERO BLACK-BOX AI?</b></font><br/>"
                  "In criminal trials, police evidence must withstand judicial cross-examination. Neural networks and generative LLMs cannot explain why a score was generated and hallucinate under uncertainty. Third Eye is 100% deterministic: every score point is substantiated by statutory evidence substrings with zero guesswork.", style_body)
    ]
    t_s4_why = Table([why_no_ai], colWidths=[680])
    t_s4_why.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), C_CARD_BG),
        ('BOX', (0,0), (-1,-1), 1.2, C_GOLD),
        ('TOPPADDING', (0,0), (-1,-1), 7),
        ('BOTTOMPADDING', (0,0), (-1,-1), 7),
        ('LEFTPADDING', (0,0), (-1,-1), 10),
        ('RIGHTPADDING', (0,0), (-1,-1), 10),
    ]))
    story.append(t_s4_why)
    story.append(PageBreak())

    # =========================================================================
    # SLIDE 5: RAJASTHAN & INDIA THREAT COVERAGE
    # =========================================================================
    story.append(Paragraph("Ground Reality: Tailored for Rajasthan &amp; Indian Cyber Crimes", style_slide_title))
    
    v1 = [
        Paragraph("⚡ JVVNL Electricity Cutoff Scam", style_card_head),
        Paragraph("<b>Modus Operandi:</b> SMS warning power will be disconnected at 9:30 PM tonight due to unpaid bill. Directs victim to call a rogue officer number.<br/>"
                  "<b>Heuristic Detection:</b> Regex matches JVVNL/Bijli office tokens, urgency timelines, rogue 10-digit mobile numbers, and fake .top payment gateways.", style_body)
    ]
    v2 = [
        Paragraph("📱 SBI YONO KYC Account Freeze", style_card_head),
        Paragraph("<b>Modus Operandi:</b> SMS claiming bank account will be blocked within 2 hours. Prompts victim to submit Aadhaar/PAN on typosquatted portal.<br/>"
                  "<b>Heuristic Detection:</b> Levenshtein distance checks on SBI/HDFC, shortener expansion, and UPI VPA extraction for fake ₹5 verification fees.", style_body)
    ]
    v3 = [
        Paragraph("📲 Instant Loan Harvester APKs", style_card_head),
        Paragraph("<b>Modus Operandi:</b> Sideloaded APKs offering instant ₹5,000 credit, harvesting contacts, gallery, and SMS to run blackmail extortion rackets.<br/>"
                  "<b>Heuristic Detection:</b> Manifest inspection flags SMS theft (READ_SMS), contact extraction, and suspicious overlay window permissions.", style_body)
    ]
    v4 = [
        Paragraph("💰 Ponzi Schemes &amp; Illegal Satta", style_card_head),
        Paragraph("<b>Modus Operandi:</b> Websites promising 5% daily returns, binary tree MLM incomes, or illegal real-money cricket betting/teen patti.<br/>"
                  "<b>Heuristic Detection:</b> Detects false regulatory claims ('SEBI verified'), compound interest keywords, and direct WhatsApp/Telegram recruiter links.", style_body)
    ]
    
    t_s5 = Table([[v1, v2], [v3, v4]], colWidths=[340, 340])
    t_s5.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), C_CARD_BG),
        ('BOX', (0,0), (-1,-1), 1, C_BORDER),
        ('INNERGRID', (0,0), (-1,-1), 1, C_BORDER),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('LEFTPADDING', (0,0), (-1,-1), 10),
        ('RIGHTPADDING', (0,0), (-1,-1), 10),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    story.append(t_s5)
    story.append(PageBreak())

    # =========================================================================
    # SLIDE 6: POLICE CASE LEDGER & CROSS-DISTRICT ENTITY LINKING
    # =========================================================================
    story.append(Paragraph("Investigation Dashboard: Cross-District Syndicate Entity Linking", style_slide_title))
    
    dash_left = [
        Paragraph("Searchable Police Case Ledger", style_card_head),
        Paragraph("<b>• Unified Search &amp; Filter:</b> IOs query past complaints by UPI VPA, suspect phone, case ID, or domain extension.", style_body),
        Paragraph("<b>• State Persistence:</b> Local storage lifecycle preserves complaint records across browser refreshes and station shifts without ghost cases.", style_body),
        Paragraph("<b>• Live Registry Cases:</b><br/>"
                  "• Case #101: SBI KYC Phishing (Score: 85% | 🔴 HIGH)<br/>"
                  "• Case #102: JVVNL Power Cutoff (Score: 100% | 🔴 HIGH)<br/>"
                  "• Case #103: Loan Harvester APK (Score: 85% | 🔴 HIGH)<br/>"
                  "• Case #104: Ponzi MLM Platform (Score: 100% | 🔴 HIGH)", style_body)
    ]
    
    dash_right = [
        Paragraph("Cross-Case Syndicate Correlation Graph", style_card_head_gold),
        Paragraph("<font color='#dc2626'><b>⚠️ SYNDICATE ENTITY MATCH IDENTIFIED:</b></font><br/>"
                  "The UPI ID <code>refund.sbi.kyc@okaxis</code> identified in this complaint appears in <b>3 distinct FIRs across Rajasthan</b>:<br/>"
                  "• <b>FIR 42/26 (Jaipur East):</b> Fake SBI KYC SMS complaint<br/>"
                  "• <b>FIR 18/26 (Jodhpur):</b> Ponzi Investment platform deposit<br/>"
                  "• <b>Complaint 902 (Kota):</b> Predatory Loan APK recovery handle<br/><br/>"
                  "<b>POLICE STRATEGIC IMPACT:</b><br/>"
                  "Enables Rajasthan Cyber Police to aggregate multi-district petty complaints into a unified organized syndicate case for coordinated bank freeze action.", style_body)
    ]
    
    t_s6 = Table([[dash_left, dash_right]], colWidths=[340, 340])
    t_s6.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (0,0), C_CARD_BG),
        ('BACKGROUND', (1,0), (1,0), C_CARD_BG),
        ('BOX', (0,0), (0,0), 1, C_BORDER),
        ('BOX', (1,0), (1,0), 1, colors.HexColor('#fde68a')),
        ('TOPPADDING', (0,0), (-1,-1), 10),
        ('BOTTOMPADDING', (0,0), (-1,-1), 10),
        ('LEFTPADDING', (0,0), (-1,-1), 12),
        ('RIGHTPADDING', (0,0), (-1,-1), 12),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    story.append(t_s6)
    story.append(PageBreak())

    # =========================================================================
    # SLIDE 7: FORENSIC STANDARDS, VERIFICATION & READINESS
    # =========================================================================
    story.append(Paragraph("Forensic Admissibility, Verification Matrix &amp; RPA Jaipur Readiness", style_slide_title))
    
    verif_table = [
        [Paragraph("<b>Audit Metric</b>", style_table_header),
         Paragraph("<b>Test Vectors Evaluated</b>", style_table_header),
         Paragraph("<b>Observed Outcome</b>", style_table_header),
         Paragraph("<b>Operational Reliability</b>", style_table_header)],
        [Paragraph("<b>True Positives (Threat Catch Rate)</b>", style_table_cell),
         Paragraph("6 Threat Categories (SMS, JVVNL, Fake Bank, APK, Loan App, Ponzi)", style_table_cell),
         Paragraph("<font color='#059669'><b>6 / 6 Detected</b></font>", style_table_cell_center),
         Paragraph("100% Threat Detection across all vectors", style_table_cell)],
        [Paragraph("<b>True Negatives (False Alarm Prevention)</b>", style_table_cell),
         Paragraph("Official Apps (SBI YONO, HDFC, ICICI, BHIM NPCI, UIDAI, WhatsApp)", style_table_cell),
         Paragraph("<font color='#059669'><b>6 / 6 Cleared (0%)</b></font>", style_table_cell_center),
         Paragraph("0.0% False Positive Rate; no citizen harassment", style_table_cell)],
        [Paragraph("<b>Cybersecurity &amp; ReDoS Resilience</b>", style_table_cell),
         Paragraph("Malicious regex payloads, prototype pollution, XSS injection strings", style_table_cell),
         Paragraph("<font color='#059669'><b>&lt; 1 ms Latency</b></font>", style_table_cell_center),
         Paragraph("Hardened against adversarial attacker inputs", style_table_cell)],
        [Paragraph("<b>Section 65B BSA 2023 Compliance</b>", style_table_cell),
         Paragraph("Cryptographic SHA-256 evidence integrity hashing on all case dossiers", style_table_cell),
         Paragraph("<font color='#059669'><b>Validated</b></font>", style_table_cell_center),
         Paragraph("Tamper-proof court record for chargesheets", style_table_cell)],
    ]
    t_s7_verif = Table(verif_table, colWidths=[150, 230, 110, 190])
    t_s7_verif.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), C_NAVY_DARK),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [C_CARD_BG, C_ALT_BG]),
        ('BOX', (0,0), (-1,-1), 1, C_BORDER),
        ('INNERGRID', (0,0), (-1,-1), 0.5, C_BORDER),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('LEFTPADDING', (0,0), (-1,-1), 7),
        ('RIGHTPADDING', (0,0), (-1,-1), 7),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(t_s7_verif)
    story.append(Spacer(1, 8))
    
    readiness_left = [
        Paragraph("Court Evidence Generation", style_card_head),
        Paragraph("• One-click PDF evidence export formatted for Section 65B BSA 2023 legal muster.<br/>"
                  "• Structured JSON export formatted for NCRP / 1930 direct portal ingestion.", style_body)
    ]
    readiness_right = [
        Paragraph("RPA Jaipur Final Event Readiness (Nov 28–29)", style_card_head_gold),
        Paragraph("• 100% Offline standalone demo ready for jury evaluation in RPA auditoriums.<br/>"
                  "• 5-minute live triage walkthrough ready for immediate technical defense.", style_body)
    ]
    t_s7_bottom = Table([[readiness_left, readiness_right]], colWidths=[340, 340])
    t_s7_bottom.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (0,0), C_CARD_BG),
        ('BACKGROUND', (1,0), (1,0), C_CARD_BG),
        ('BOX', (0,0), (0,0), 1, C_BORDER),
        ('BOX', (1,0), (1,0), 1, colors.HexColor('#fde68a')),
        ('TOPPADDING', (0,0), (-1,-1), 7),
        ('BOTTOMPADDING', (0,0), (-1,-1), 7),
        ('LEFTPADDING', (0,0), (-1,-1), 10),
        ('RIGHTPADDING', (0,0), (-1,-1), 10),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    story.append(t_s7_bottom)

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"✓ Beautiful 7-Slide PDF saved successfully as: {output_pdf}")

if __name__ == "__main__":
    build_7slide_pdf("Team_Third_Eye_PS01.pdf")

