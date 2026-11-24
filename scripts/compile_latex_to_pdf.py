import os
import re
from reportlab.lib.pagesizes import letter, landscape
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.pdfgen import canvas

class ActionPlanCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super(ActionPlanCanvas, self).__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_decorations(num_pages)
            super(ActionPlanCanvas, self).showPage()
        super(ActionPlanCanvas, self).save()

    def draw_decorations(self, total_pages):
        # Frame 1 and Frame 8 are plain cover/closing slides
        if self._pageNumber in [1, total_pages]:
            return

        self.saveState()
        # Top Header Banner
        self.setFillColor(colors.HexColor('#0A1D37'))
        self.rect(0, 560, 792, 52, fill=1, stroke=0)
        
        # Gold Accent Line
        self.setFillColor(colors.HexColor('#C28B24'))
        self.rect(0, 556, 792, 4, fill=1, stroke=0)
        
        # Header text
        self.setFillColor(colors.HexColor('#C28B24'))
        self.setFont("Helvetica-Bold", 7.5)
        self.drawString(45, 595, "RAJASTHAN POLICE HACKATHON 2026 (R4C)  |  PS01: CYBER FRAUD & SCAM DETECTION")
        
        # Footer dividing line
        self.setFillColor(colors.HexColor('#E2E8F0'))
        self.rect(45, 28, 702, 1, fill=1, stroke=0)
        
        # Footer text
        self.setFillColor(colors.HexColor('#64748B'))
        self.setFont("Helvetica", 7.5)
        self.drawString(45, 17, "Team Third Eye  •  SKIT Jaipur (B.Tech Year 3)  •  Leader: Hardik Singhal  •  Section 65B BSA 2023 Evidence Ready")
        
        # Slide numbering
        self.setFillColor(colors.HexColor('#C28B24'))
        self.setFont("Helvetica-Bold", 8)
        self.drawRightString(747, 17, f"Slide {self._pageNumber} of {total_pages}")
        self.restoreState()

def compile_latest_tex_to_pdf(output_pdf="Team_Third_Eye_PS01.pdf"):
    # Target: 792 x 612 pt landscape
    # Content margins: Left=45, Right=45 => Available = 702 pt.
    doc = SimpleDocTemplate(
        output_pdf,
        pagesize=landscape(letter),
        leftMargin=45,
        rightMargin=45,
        topMargin=64,
        bottomMargin=36
    )
    
    # Exact colors from Team_Third_Eye_Action_Plan.tex
    C_NAVY      = colors.HexColor('#0A1D37') # PrimaryNavy
    C_BLUE      = colors.HexColor('#002B66') # SecondaryBlue
    C_LBLUE     = colors.HexColor('#E8EFF8') # LightBlue
    C_GOLD      = colors.HexColor('#C28B24') # AccentGold
    C_RED       = colors.HexColor('#B91C1C') # DangerRed
    C_AMBER     = colors.HexColor('#D97706') # WarningAmber
    C_GREEN     = colors.HexColor('#15803D') # SuccessGreen
    C_BORDER    = colors.HexColor('#E2E8F0') # LightGray
    C_WHITE     = colors.HexColor('#FFFFFF') # White
    C_OFFWHITE  = colors.HexColor('#F8FAFC') # OffWhite
    C_DARKTEXT  = colors.HexColor('#0F172A') # DarkText
    C_MIDGRAY   = colors.HexColor('#64748B') # MidGray

    styles = getSampleStyleSheet()

    style_title = ParagraphStyle(
        'SlideTitle',
        parent=styles['Normal'],
        fontName='Times-Bold',
        fontSize=15,
        leading=18,
        textColor=C_NAVY,
        spaceAfter=7
    )

    style_card_head_navy = ParagraphStyle(
        'CardHeadNavy',
        parent=styles['Normal'],
        fontName='Times-Bold',
        fontSize=10,
        leading=13,
        textColor=C_NAVY,
        spaceAfter=3
    )

    style_card_head_blue = ParagraphStyle(
        'CardHeadBlue',
        parent=styles['Normal'],
        fontName='Times-Bold',
        fontSize=10,
        leading=13,
        textColor=C_BLUE,
        spaceAfter=3
    )

    style_card_head_red = ParagraphStyle(
        'CardHeadRed',
        parent=styles['Normal'],
        fontName='Times-Bold',
        fontSize=10,
        leading=13,
        textColor=C_RED,
        spaceAfter=3
    )

    style_card_head_gold = ParagraphStyle(
        'CardHeadGold',
        parent=styles['Normal'],
        fontName='Times-Bold',
        fontSize=10,
        leading=13,
        textColor=C_GOLD,
        spaceAfter=3
    )

    style_body = ParagraphStyle(
        'Body',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=7.8,
        leading=10.8,
        textColor=C_DARKTEXT,
        spaceAfter=2
    )

    style_th = ParagraphStyle(
        'TH',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=7.5,
        leading=9.5,
        textColor=colors.white,
        alignment=1
    )

    style_td = ParagraphStyle(
        'TD',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=7.2,
        leading=9.5,
        textColor=C_DARKTEXT
    )

    style_td_center = ParagraphStyle(
        'TDCenter',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=7.2,
        leading=9.5,
        textColor=C_DARKTEXT,
        alignment=1
    )

    story = []

    # =========================================================================
    # FRAME 1: TITLE SLIDE
    # =========================================================================
    f1_content = [
        [Paragraph("<font color='#0A1D37' size=9.5><b>RAJASTHAN POLICE ACADEMY (RPA), JAIPUR &nbsp;|&nbsp; R4C HACKATHON 2026</b></font>", styles['Normal'])],
        [Spacer(1, 8)],
        [Paragraph("<font color='#0A1D37' size=32><b>THIRD EYE</b></font>", styles['Normal'])],
        [Paragraph("<font color='#C28B24' size=16><b>Unified Cyber Fraud &amp; Scam Triage Platform</b></font>", styles['Normal'])],
        [Spacer(1, 4)],
        [Paragraph("<font color='#0F172A' size=10>Problem Statement PS01: Multi-Channel Scam Detection with Fake Loan, Investment &amp; Betting Analysis</font>", styles['Normal'])],
        [Spacer(1, 10)],
        [Paragraph("<font color='#C28B24'>────────────────────────────────────────────────────────────</font>", styles['Normal'])],
        [Spacer(1, 8)],
        [Paragraph("<font color='#0F172A' size=9.5><b>Team Leader:</b> Hardik Singhal (B.Tech Computer Science, Year 3)<br/><b>Institution:</b> Swami Keshvanand Institute of Technology, Management &amp; Gramothan (SKIT), Jaipur<br/><b>Contact:</b> hardik06singhal@gmail.com</font>", styles['Normal'])],
        [Spacer(1, 6)],
        [Paragraph("<font color='#64748B' size=8.5><b>Deterministic &nbsp;•&nbsp; Offline-First &nbsp;•&nbsp; Court-Admissible &nbsp;•&nbsp; Rajasthan-Ready</b></font>", styles['Normal'])],
        [Spacer(1, 8)],
        [Paragraph("<font color='#94A3B8' size=8>Government of Rajasthan &nbsp;•&nbsp; Cyber Crime Branch &nbsp;•&nbsp; Action Plan Dossier</font>", styles['Normal'])]
    ]
    t_f1 = Table(f1_content, colWidths=[660])
    t_f1.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), C_WHITE),
        ('BOX', (0,0), (-1,-1), 1.5, C_GOLD),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('LEFTPADDING', (0,0), (-1,-1), 20),
        ('RIGHTPADDING', (0,0), (-1,-1), 20),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
    ]))
    story.append(Spacer(1, 12))
    story.append(t_f1)
    story.append(PageBreak())

    # =========================================================================
    # FRAME 2: EXECUTIVE SUMMARY & PROBLEM STATEMENT
    # =========================================================================
    story.append(Paragraph("Executive Summary &amp; Problem Statement", style_title))
    
    f2_left = [
        Paragraph("Mission Objective", style_card_head_navy),
        Paragraph("<b>Third Eye</b> is a deterministic, offline-first cyber fraud triage platform built for Rajasthan Police cyber stations. It unifies analysis of <b>SMS/WhatsApp messages, URLs/Play Store links, Android APKs, and website HTML</b> into a single forensic interface producing court-admissible evidence with zero external dependencies.", style_body),
        Spacer(1, 3),
        Paragraph("Critical Gaps in Current Operations", style_card_head_red),
        Paragraph("• <b>Siloed Investigations:</b> Same syndicate's SMS, APK, and website complaints filed separately across districts<br/>"
                  "• <b>No Cross-Referencing:</b> Shared UPI VPAs, phone numbers, domains never linked across FIRs<br/>"
                  "• <b>Black-Box AI Unreliable:</b> Probabilistic models cannot withstand judicial cross-examination<br/>"
                  "• <b>Cloud Dependencies Fail:</b> Rural cyber stations face network drops; offline capability essential<br/>"
                  "• <b>Evidentiary Deficit:</b> Unsigned screenshots fail Section 63 BSA 2023 / Section 65B Evidence Act standards", style_body)
    ]
    
    f2_right = [
        Paragraph("Core Capabilities", style_card_head_blue),
        Paragraph("• <b>4-Channel Ingestion:</b> Paste text, drop APK, paste URL, paste website HTML<br/>"
                  "• <b>7 Heuristic Engines:</b> Urgency, impersonation, URL anomalies, APK permissions, Ponzi/MLM, betting, blacklists<br/>"
                  "• <b>Explainable Scoring:</b> 0–100, every point traced to rule + evidence substring<br/>"
                  "• <b>IOC Extraction:</b> Phone, UPI VPA, URLs, Crypto wallets, IFSC, APK packages<br/>"
                  "• <b>Cross-Case Linking:</b> Automatic syndicate detection across complaints<br/>"
                  "• <b>Evidence Export:</b> SHA-256 signed JSON + printable PDF report", style_body),
        Spacer(1, 3),
        Paragraph("Key Differentiators", style_card_head_gold),
        Paragraph("• <font color='#15803D'><b>✓ Zero False Positives</b></font> on official banking/govt apps (SBI, HDFC, BHIM, UIDAI)<br/>"
                  "• <font color='#15803D'><b>✓ 100% Offline</b></font> — no cloud APIs, field station resilient<br/>"
                  "• <font color='#15803D'><b>✓ Rajasthan-Specific</b></font> — JVVNL, Raj Police, local intel pre-loaded<br/>"
                  "• <font color='#15803D'><b>✓ 5-Second Triage</b></font> — animated multi-stage scan builds officer confidence", style_body)
    ]
    
    t_f2 = Table([[f2_left, f2_right]], colWidths=[345, 335])
    t_f2.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), C_WHITE),
        ('BOX', (0,0), (0,0), 1, C_BORDER),
        ('BOX', (1,0), (1,0), 1, C_BORDER),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('LEFTPADDING', (0,0), (-1,-1), 10),
        ('RIGHTPADDING', (0,0), (-1,-1), 10),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    story.append(t_f2)
    story.append(PageBreak())

    # =========================================================================
    # FRAME 3: SOLUTION ARCHITECTURE: 5-STAGE PIPELINE
    # =========================================================================
    story.append(Paragraph("Solution Architecture: 5-Stage Deterministic Pipeline", style_title))
    
    pipe_row = [
        [Paragraph("<font color='white'><b>01. Ingestion</b></font>", style_th),
         Paragraph("<font color='white'><b>02. Analysis</b></font>", style_th),
         Paragraph("<font color='white'><b>03. Scoring</b></font>", style_th),
         Paragraph("<font color='white'><b>04. Linking</b></font>", style_th),
         Paragraph("<font color='white'><b>05. Evidence</b></font>", style_th)],
        [Paragraph("SMS, WhatsApp, URL,<br/>Play Store, APK, HTML", style_td_center),
         Paragraph("7 Heuristic Engines<br/>Regex, Levenshtein, Perms", style_td_center),
         Paragraph("0–100 Explainable<br/>Rule-to-Evidence Map", style_td_center),
         Paragraph("IOC Extraction<br/>Cross-Case Correlation", style_td_center),
         Paragraph("SHA-256 Signed JSON<br/>Printable PDF (Sec 63)", style_td_center)]
    ]
    t_f3_pipe = Table(pipe_row, colWidths=[136, 136, 136, 136, 136])
    t_f3_pipe.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), C_NAVY),
        ('BACKGROUND', (0,1), (-1,-1), C_WHITE),
        ('BOX', (0,0), (-1,-1), 1, C_GOLD),
        ('INNERGRID', (0,0), (-1,-1), 0.5, C_BORDER),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(t_f3_pipe)
    story.append(Spacer(1, 8))
    
    f3_pillars = [
        Paragraph("Technical Pillars", style_card_head_navy),
        Paragraph("• <b>Offline-First Architecture:</b> Local regex, offline WHOIS simulation, pre-loaded threat lists — zero external API calls<br/>"
                  "• <b>Deterministic Heuristic Engine:</b> 100% rule-based scoring; every point maps to rule ID, evidence substring, severity<br/>"
                  "• <b>5-Second Forensic Scan:</b> Animated pipeline (Tokenize → Intel → Score → Hash) builds officer confidence<br/>"
                  "• <b>Institutional Theme:</b> Police Navy/Gold palette, Merriweather/Calibri typography, high contrast for field viewing", style_body)
    ]
    
    f3_vectors = [
        Paragraph("Input Vectors Supported", style_card_head_blue),
        Paragraph("• <b>SMS / WhatsApp Text:</b> Handled by <code>MessageAnalyzer</code> (urgency, impersonation, action tokens)<br/>"
                  "• <b>URL / Play Store Link:</b> Handled by <code>URLAnalyzer</code> (typosquats, predatory apps, suspicious TLDs)<br/>"
                  "• <b>Android APK:</b> Handled by <code>APKAnalyzer</code> (dangerous permissions, C2 endpoints, lookalikes)<br/>"
                  "• <b>Website HTML:</b> Handled by <code>WebsiteAnalyzer</code> (guaranteed ROI, betting, MLM, fake SEBI claims)<br/>"
                  "<b>All vectors converge on Risk Scorer for a unified 0–100 forensic verdict.</b>", style_body)
    ]
    t_f3_split = Table([[f3_pillars, f3_vectors]], colWidths=[340, 340])
    t_f3_split.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), C_WHITE),
        ('BOX', (0,0), (-1,-1), 1, C_BORDER),
        ('INNERGRID', (0,0), (-1,-1), 1, C_BORDER),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('LEFTPADDING', (0,0), (-1,-1), 10),
        ('RIGHTPADDING', (0,0), (-1,-1), 10),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    story.append(t_f3_split)
    story.append(PageBreak())

    # =========================================================================
    # FRAME 4: EXPLAINABLE SCORING MODEL
    # =========================================================================
    story.append(Paragraph("Explainable Scoring Model: Auditable in Court", style_title))
    
    f4_table_data = [
        [Paragraph("<b>Component</b>", style_th),
         Paragraph("<b>Weight</b>", style_th),
         Paragraph("<b>Heuristic Indicators Monitored</b>", style_th),
         Paragraph("<b>Statutory Legal Value</b>", style_th)],
        [Paragraph("<b>Message Urgency &amp; Impersonation</b>", style_td),
         Paragraph("<font color='#C28B24'><b>30 pts</b></font>", style_td_center),
         Paragraph("Urgency tokens ('within 2 hrs'), action demands, spoofing SBI/HDFC/JVVNL/Raj Police", style_td),
         Paragraph("Proves <i>mens rea</i> under Sec 420 IPC / Sec 318 BNS", style_td)],
        [Paragraph("<b>URL &amp; Domain Anomalies</b>", style_td),
         Paragraph("<font color='#C28B24'><b>25 pts</b></font>", style_td_center),
         Paragraph("Levenshtein lookalikes, new domain sim (≤30 days), suspicious TLDs (.xyz/.top), raw IP, shorteners", style_td),
         Paragraph("Direct proof of phishing infrastructure", style_td)],
        [Paragraph("<b>APK Dangerous Permissions</b>", style_td),
         Paragraph("<font color='#C28B24'><b>25 pts</b></font>", style_td_center),
         Paragraph("SMS read/send (OTP theft), contacts/call log (extortion), overlay/accessibility (Trojan), device admin", style_td),
         Paragraph("Establishes spyware/Trojan functionality", style_td)],
        [Paragraph("<b>Website Ponzi/Betting Content</b>", style_td),
         Paragraph("<font color='#C28B24'><b>20 pts</b></font>", style_td_center),
         Paragraph("Guaranteed returns, daily ROI, MLM binary/downline, real-money betting, fake SEBI/RBI claims", style_td),
         Paragraph("Violates Prize Chits Act, IT Act Sec 67", style_td)],
        [Paragraph("<b>Blacklist Threat Intel Hits</b>", style_td),
         Paragraph("<font color='#15803D'><b>Escalate</b></font>", style_td_center),
         Paragraph("Pre-seeded I4C/1930 UPI handles, fraudster phones, predatory loan packages, malware hashes", style_td),
         Paragraph("Links accused to multi-state warrants", style_td)],
    ]
    t_f4 = Table(f4_table_data, colWidths=[150, 65, 275, 190])
    t_f4.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), C_NAVY),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [C_WHITE, C_OFFWHITE]),
        ('BOX', (0,0), (-1,-1), 1, C_BORDER),
        ('INNERGRID', (0,0), (-1,-1), 0.5, C_BORDER),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('LEFTPADDING', (0,0), (-1,-1), 7),
        ('RIGHTPADDING', (0,0), (-1,-1), 7),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(t_f4)
    story.append(Spacer(1, 8))
    
    f4_why = [
        Paragraph("<font color='#0A1D37'><b>WHY ZERO BLACK-BOX AI?</b></font><br/>"
                  "In criminal trials, police evidence must withstand judicial cross-examination. Neural networks cannot explain <i>why</i> a score was generated. <b>Third Eye is 100% deterministic:</b> every point is substantiated by a specific rule name, exact evidence substring from the input, and severity level. The scoring model is fully documented and reproducible by any forensic auditor.", style_body)
    ]
    t_f4_why = Table([f4_why], colWidths=[680])
    t_f4_why.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), C_WHITE),
        ('BOX', (0,0), (-1,-1), 1.2, C_GOLD),
        ('TOPPADDING', (0,0), (-1,-1), 7),
        ('BOTTOMPADDING', (0,0), (-1,-1), 7),
        ('LEFTPADDING', (0,0), (-1,-1), 10),
        ('RIGHTPADDING', (0,0), (-1,-1), 10),
    ]))
    story.append(t_f4_why)
    story.append(PageBreak())

    # =========================================================================
    # FRAME 5: THREAT COVERAGE (RAJASTHAN SPECIFIC)
    # =========================================================================
    story.append(Paragraph("Threat Coverage: Tailored for Rajasthan &amp; Indian Cyber Crimes", style_title))
    
    f5_v1 = [
        Paragraph("⚡ JVVNL Electricity Cutoff", style_card_head_red),
        Paragraph("<b>Modus Operandi:</b> SMS alerts power disconnection at 9:30 PM. Rogue officer number + fake .top payment gateway.<br/>"
                  "<b>Detection:</b> JVVNL/Bijli tokens, urgency timeline, 10-digit mobile regex, fake domain + UPI extraction.", style_body)
    ]
    f5_v2 = [
        Paragraph("📱 SBI YONO KYC Account Freeze", style_card_head_navy),
        Paragraph("<b>Modus Operandi:</b> SMS claims account blocked within 2 hours. Typosquatted portal for Aadhaar/PAN + ₹5 UPI fee.<br/>"
                  "<b>Detection:</b> Levenshtein on SBI/HDFC, shortener expansion, UPI VPA extraction, blacklist match.", style_body)
    ]
    f5_v3 = [
        Paragraph("📲 Instant Loan Harvester APKs", style_card_head_red),
        Paragraph("<b>Modus Operandi:</b> Sideloaded APKs offering instant ₹5,000 credit. Harvest contacts, gallery, and SMS to run blackmail extortion.<br/>"
                  "<b>Detection:</b> Manifest flags <code>READ_SMS</code>, <code>READ_CONTACTS</code>, <code>SYSTEM_ALERT_WINDOW</code>, <code>BIND_ACCESSIBILITY_SERVICE</code>.", style_body)
    ]
    f5_v4 = [
        Paragraph("💰 Ponzi Schemes &amp; Illegal Satta", style_card_head_navy),
        Paragraph("<b>Modus Operandi:</b> Sites promising 5% daily returns, binary MLM, real-money cricket betting/Teen Patti.<br/>"
                  "<b>Detection:</b> False regulatory claims ('SEBI verified'), compound interest keywords, WhatsApp/Telegram recruiter links, crypto wallet extraction.", style_body)
    ]
    t_f5_grid = Table([[f5_v1, f5_v2], [f5_v3, f5_v4]], colWidths=[340, 340])
    t_f5_grid.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), C_WHITE),
        ('BOX', (0,0), (-1,-1), 1, C_BORDER),
        ('INNERGRID', (0,0), (-1,-1), 1, C_BORDER),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 10),
        ('RIGHTPADDING', (0,0), (-1,-1), 10),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    story.append(t_f5_grid)
    story.append(Spacer(1, 6))
    
    f5_intel_table = [
        [Paragraph("<b>Category</b>", style_th), Paragraph("<b>Domains</b>", style_th), Paragraph("<b>Phones</b>", style_th), Paragraph("<b>UPI VPAs</b>", style_th)],
        [Paragraph("Banking Phishing", style_td), Paragraph("4", style_td_center), Paragraph("3", style_td_center), Paragraph("2", style_td_center)],
        [Paragraph("Utility (JVVNL)", style_td), Paragraph("2", style_td_center), Paragraph("2", style_td_center), Paragraph("1", style_td_center)],
        [Paragraph("Predatory Loan / Betting / Ponzi", style_td), Paragraph("7", style_td_center), Paragraph("4", style_td_center), Paragraph("4", style_td_center)],
        [Paragraph("<b>Total Pre-Loaded Seed Intelligence</b>", style_td), Paragraph("<b>16</b>", style_td_center), Paragraph("<b>11</b>", style_td_center), Paragraph("<b>8</b>", style_td_center)],
    ]
    t_f5_intel = Table(f5_intel_table, colWidths=[280, 130, 130, 140])
    t_f5_intel.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), C_NAVY),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [C_WHITE, C_OFFWHITE]),
        ('BOX', (0,0), (-1,-1), 1, C_BORDER),
        ('INNERGRID', (0,0), (-1,-1), 0.5, C_BORDER),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
    ]))
    story.append(t_f5_intel)
    story.append(PageBreak())

    # =========================================================================
    # FRAME 6: INVESTIGATION DASHBOARD & SYNDICATE LINKING
    # =========================================================================
    story.append(Paragraph("Investigation Dashboard: Cross-District Syndicate Linking", style_title))
    
    f6_left = [
        Paragraph("Searchable Police Case Ledger", style_card_head_navy),
        Paragraph("• <b>Unified Search:</b> Query by Case ID, UPI VPA, phone, domain, or content snippet<br/>"
                  "• <b>State Persistence:</b> Local storage survives browser restart and shift changes<br/>"
                  "• <b>Zero Ghost Cases:</b> Verified clear/reseed logic ensures zero state corruption<br/>"
                  "• <b>Color-Coded Badges:</b> Instant HIGH / MEDIUM / LOW triage classification", style_body),
        Paragraph("<b>Sample Live Ledger Registry:</b><br/>"
                  "• <code>RJ-CYBER-2026-A1</code>: SBI KYC Phishing (85% | 🔴 HIGH)<br/>"
                  "• <code>RJ-CYBER-2026-B2</code>: JVVNL Power Cutoff (100% | 🔴 HIGH)<br/>"
                  "• <code>RJ-CYBER-2026-C3</code>: Loan Harvester APK (85% | 🔴 HIGH)<br/>"
                  "• <code>RJ-CYBER-2026-D4</code>: Ponzi MLM Website (100% | 🔴 HIGH)", style_body)
    ]
    
    f6_right = [
        Paragraph("Cross-Case Syndicate Correlation", style_card_head_gold),
        Paragraph("<font color='#B91C1C'><b>⚠️ ENTITY MATCH IDENTIFIED:</b></font> <code>refund.sbi.kyc@okaxis</code><br/>"
                  "This UPI VPA appears in <b>3 distinct FIRs across Rajasthan</b>:<br/>"
                  "• <b>FIR 42/26 (Jaipur East):</b> Fake SBI KYC SMS complaint<br/>"
                  "• <b>FIR 18/26 (Jodhpur):</b> Ponzi investment platform deposit<br/>"
                  "• <b>Complaint 902 (Kota):</b> Predatory Loan APK recovery handle<br/><br/>"
                  "<b><font color='#15803D'>POLICE OPERATIONAL IMPACT:</font></b><br/>"
                  "Enables Rajasthan Cyber Police to aggregate multi-district petty complaints into a unified organized syndicate case for coordinated bank freeze action under Section 102 CrPC.", style_body),
        Spacer(1, 4),
        Paragraph("<b>Heat-List Visualization:</b> Interactive Chart.js bar chart ranking recurring threat identifiers (UPIs, phones, domains) with one-click CSV intelligence export.", style_body)
    ]
    t_f6 = Table([[f6_left, f6_right]], colWidths=[340, 340])
    t_f6.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), C_WHITE),
        ('BOX', (0,0), (0,0), 1, C_BORDER),
        ('BOX', (1,0), (1,0), 1, colors.HexColor('#FDE68A')),
        ('TOPPADDING', (0,0), (-1,-1), 10),
        ('BOTTOMPADDING', (0,0), (-1,-1), 10),
        ('LEFTPADDING', (0,0), (-1,-1), 12),
        ('RIGHTPADDING', (0,0), (-1,-1), 12),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    story.append(t_f6)
    story.append(PageBreak())

    # =========================================================================
    # FRAME 7: FORENSIC VERIFICATION MATRIX & READINESS
    # =========================================================================
    story.append(Paragraph("Forensic Verification Matrix &amp; RPA Jaipur Readiness", style_title))
    
    f7_audit_data = [
        [Paragraph("<b>Audit Metric</b>", style_th),
         Paragraph("<b>Test Vectors Evaluated</b>", style_th),
         Paragraph("<b>Outcome</b>", style_th),
         Paragraph("<b>Operational Reliability</b>", style_th)],
        [Paragraph("<b>True Positives (Catch Rate)</b>", style_td),
         Paragraph("6 Threat Categories (SBI KYC, JVVNL, Fake Bank, Loan APK, Predatory Loan, Ponzi)", style_td),
         Paragraph("<font color='#15803D'><b>✓ 6 / 6</b></font>", style_td_center),
         Paragraph("100% Threat Detection across vectors", style_td)],
        [Paragraph("<b>True Negatives (False Alarms)</b>", style_td),
         Paragraph("Official Apps (SBI YONO, HDFC, ICICI, BHIM NPCI, UIDAI, WhatsApp)", style_td),
         Paragraph("<font color='#15803D'><b>✓ 6 / 6</b></font>", style_td_center),
         Paragraph("0.0% False Positive Rate; no harassment", style_td)],
        [Paragraph("<b>App Store Threat Matrix</b>", style_td),
         Paragraph("6 Malicious + 6 Benign Play Store package links", style_td),
         Paragraph("<font color='#15803D'><b>✓ 12 / 12</b></font>", style_td_center),
         Paragraph("100% Play Store triage accuracy", style_td)],
        [Paragraph("<b>Cybersecurity (ReDoS/XSS)</b>", style_td),
         Paragraph("Malicious regex payloads, prototype pollution, XSS injection strings", style_td),
         Paragraph("<font color='#15803D'><b>✓ &lt; 1 ms</b></font>", style_td_center),
         Paragraph("Hardened against adversarial inputs", style_td)],
        [Paragraph("<b>Evidence Integrity (BSA 2023 Sec 63)</b>", style_td),
         Paragraph("Cryptographic SHA-256 evidence integrity hashing on all case dossiers", style_td),
         Paragraph("<font color='#15803D'><b>✓ Validated</b></font>", style_td_center),
         Paragraph("Tamper-proof court record for chargesheets", style_td)],
        [Paragraph("<b>Lifecycle Persistence</b>", style_td),
         Paragraph("Seed → Clear → Refresh → New Case workflow", style_td),
         Paragraph("<font color='#15803D'><b>✓ No Ghosts</b></font>", style_td_center),
         Paragraph("Shift-change resilient local storage", style_td)],
    ]
    t_f7_audit = Table(f7_audit_data, colWidths=[150, 240, 90, 200])
    t_f7_audit.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), C_NAVY),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [C_WHITE, C_OFFWHITE]),
        ('BOX', (0,0), (-1,-1), 1, C_BORDER),
        ('INNERGRID', (0,0), (-1,-1), 0.5, C_BORDER),
        ('TOPPADDING', (0,0), (-1,-1), 3.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3.5),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(t_f7_audit)
    story.append(Spacer(1, 6))
    
    f7_evid = [
        Paragraph("Evidence Generation", style_card_head_navy),
        Paragraph("• <b>JSON Export:</b> Structured case record with SHA-256 hash, all triggers, IOCs, formatted for NCRP/1930 direct ingestion.<br/>"
                  "• <b>PDF Export:</b> Formal police cyber cell inspection dossier with case metadata, rule audit trail, and digital integrity seal.", style_body)
    ]
    f7_rpa = [
        Paragraph("RPA Jaipur On-Site Readiness (Nov 28–29)", style_card_head_gold),
        Paragraph("• <font color='#15803D'><b>✓ 100% Offline Standalone</b></font> — zero internet required for full jury evaluation<br/>"
                  "• <font color='#15803D'><b>✓ 5-Minute Live Triage Walkthrough</b></font> — 5 demo cases ready for immediate defense<br/>"
                  "• <b>Team:</b> Hardik Singhal (Leader), SKIT Jaipur — B.Tech Year 3 (hardik06singhal@gmail.com)", style_body)
    ]
    t_f7_split = Table([[f7_evid, f7_rpa]], colWidths=[340, 340])
    t_f7_split.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), C_WHITE),
        ('BOX', (0,0), (0,0), 1, C_BORDER),
        ('BOX', (1,0), (1,0), 1, colors.HexColor('#FDE68A')),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 10),
        ('RIGHTPADDING', (0,0), (-1,-1), 10),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    story.append(t_f7_split)
    story.append(PageBreak())

    # =========================================================================
    # FRAME 8: CLOSING / THANK YOU
    # =========================================================================
    f8_content = [
        [Paragraph("<font color='#0A1D37' size=26><b>THIRD EYE</b></font>", styles['Normal'])],
        [Paragraph("<font color='#C28B24' size=15><b>Unified Cyber Fraud Triage Platform</b></font>", styles['Normal'])],
        [Spacer(1, 6)],
        [Paragraph("<font color='#0A1D37'>────────────────────────────────────────────────────────────</font>", styles['Normal'])],
        [Spacer(1, 6)],
        [Paragraph("<font color='#0F172A' size=10.5><b>Problem Statement PS01</b> — Rajasthan Police Hackathon 2026 (R4C)</font>", styles['Normal'])],
        [Spacer(1, 4)],
        [Paragraph("<font color='#0F172A' size=9.5><b>Team Third Eye</b> &nbsp;•&nbsp; SKIT Jaipur<br/>Hardik Singhal (Leader) &nbsp;•&nbsp; hardik06singhal@gmail.com</font>", styles['Normal'])],
        [Spacer(1, 6)],
        [Paragraph("<font color='#64748B' size=8.5><b>Deterministic &nbsp;•&nbsp; Offline-First &nbsp;•&nbsp; Court-Admissible &nbsp;•&nbsp; Rajasthan-Ready</b></font>", styles['Normal'])],
        [Spacer(1, 8)],
        [Paragraph("<font color='#C28B24' size=13><b>Thank You</b></font>", styles['Normal'])],
        [Paragraph("<font color='#64748B' size=8.5>Ready for Jury Evaluation &nbsp;•&nbsp; RPA Jaipur — November 28–29, 2026</font>", styles['Normal'])]
    ]
    t_f8 = Table(f8_content, colWidths=[660])
    t_f8.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), C_WHITE),
        ('BOX', (0,0), (-1,-1), 1.5, C_NAVY),
        ('TOPPADDING', (0,0), (-1,-1), 10),
        ('BOTTOMPADDING', (0,0), (-1,-1), 10),
        ('LEFTPADDING', (0,0), (-1,-1), 16),
        ('RIGHTPADDING', (0,0), (-1,-1), 16),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
    ]))
    story.append(Spacer(1, 10))
    story.append(t_f8)

    doc.build(story, canvasmaker=ActionPlanCanvas)
    print(f"✓ Successfully compiled latest LaTeX structure as: {output_pdf}")

if __name__ == "__main__":
    compile_latest_tex_to_pdf("Team_Third_Eye_PS01.pdf")
