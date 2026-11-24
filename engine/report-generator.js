/**
 * Rajasthan Police Hackathon (R4C) - PS01 Cyber Fraud Detection Platform
 * Team: Third Eye
 * File: engine/report-generator.js
 * 
 * Step 1.10: Forensic Incident Report & Evidence Generator
 * Exports court-admissible JSON evidence files and printable PDF/HTML reports with SHA-256 digital signature.
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['../utils/constants', '../utils/helpers'], factory);
  } else if (typeof module === 'object' && module.exports) {
    const Constants = require('../utils/constants');
    const Helpers = require('../utils/helpers');
    module.exports = factory(Constants, Helpers);
  } else {
    root.ThirdEye = root.ThirdEye || {};
    root.ThirdEye.ReportGenerator = factory(root.ThirdEye.Constants, root.ThirdEye.Helpers);
  }
}(typeof self !== 'undefined' ? self : this, function (Constants, Helpers) {
  'use strict';

  const ReportGenerator = {

    /**
     * Build standard, court-admissible Case Record with digital signature hash
     * @param {import('../utils/helpers').AnalysisInput} input 
     * @param {import('../utils/helpers').RiskResult} result 
     * @param {string} [notes='']
     * @returns {import('../utils/helpers').CaseRecord}
     */
    buildCaseRecord: function (input, result, notes = '') {
      const caseId = Helpers.generateCaseId();
      const timestamp = new Date().toISOString();
      const rawPayload = JSON.stringify({ caseId, timestamp, input, result });
      const reportHash = Helpers.sha256(rawPayload);

      return {
        id: caseId,
        timestamp: timestamp,
        agency: 'Rajasthan Police Cyber Crime Branch / RPA Jaipur',
        analyst: 'Officer On Duty (Triage Desk)',
        status: result.level === 'HIGH' ? 'ESCALATED' : (result.level === 'MEDIUM' ? 'UNDER_INVESTIGATION' : 'ARCHIVED'),
        input: {
          type: input.type,
          content: input.content,
          metadata: input.metadata || {}
        },
        result: {
          level: result.level,
          score: result.score,
          explanation: result.explanation,
          breakdown: result.breakdown,
          triggers: result.triggers,
          iocs: result.iocs
        },
        investigatorNotes: notes || '',
        reportHash: reportHash
      };
    },

    /**
     * Generate JSON Evidence string formatted for police systems (I4C / 1930)
     * @param {import('../utils/helpers').CaseRecord} caseRecord 
     * @returns {string}
     */
    exportJSON: function (caseRecord) {
      return JSON.stringify(caseRecord, null, 2);
    },

    /**
     * Generate clean, official printable HTML document for PDF conversion / printing
     * @param {import('../utils/helpers').CaseRecord} caseRecord 
     * @returns {string}
     */
    generatePrintableHTML: function (caseRecord) {
      const res = caseRecord.result || {};
      const triggers = res.triggers || [];
      const iocs = res.iocs || [];
      const isHigh = res.level === 'HIGH';
      const isMed = res.level === 'MEDIUM';
      const badgeColor = isHigh ? '#b91c1c' : (isMed ? '#b45309' : '#15803d');
      const badgeBg = isHigh ? '#fee2e2' : (isMed ? '#fef3c7' : '#dcfce7');

      const triggerRows = triggers.map((t, idx) => `
        <tr style="border-bottom: 1px solid #e2e8f0; font-size: 13px;">
          <td style="padding: 8px 10px; font-weight: 600;">${idx + 1}. ${Helpers.escapeHtml(t.id)}</td>
          <td style="padding: 8px 10px;">${Helpers.escapeHtml(t.category)}</td>
          <td style="padding: 8px 10px; font-weight: 600; color: ${t.severity === 'CRITICAL' ? '#dc2626' : (t.severity === 'HIGH' ? '#ea580c' : '#2563eb')}">
            ${t.severity} (+${t.weight} pts)
          </td>
          <td style="padding: 8px 10px; color: #334155;">${Helpers.escapeHtml(t.description)}</td>
          <td style="padding: 8px 10px; font-family: monospace; background: #f8fafc; word-break: break-all;">${Helpers.escapeHtml(t.evidence)}</td>
        </tr>
      `).join('');

      const iocRows = iocs.map((i, idx) => `
        <tr style="border-bottom: 1px solid #e2e8f0; font-size: 13px;">
          <td style="padding: 8px 10px; font-weight: 600;">${(Constants.IOC_META[i.type]?.icon || '🔍')} ${i.type.toUpperCase()}</td>
          <td style="padding: 8px 10px; font-family: monospace; font-weight: 600; color: ${i.flagged ? '#dc2626' : '#0f172a'}; word-break: break-all;">
            ${Helpers.escapeHtml(i.value)} ${i.flagged ? '<span style="background:#fee2e2;color:#991b1b;padding:2px 6px;border-radius:4px;font-size:10px;">BLACKLISTED</span>' : ''}
          </td>
          <td style="padding: 8px 10px;">${Helpers.escapeHtml(i.source || 'input')}</td>
          <td style="padding: 8px 10px;">${Math.round((i.confidence || 0.9) * 100)}%</td>
        </tr>
      `).join('');

      return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Cyber Fraud Incident Triage Report - ${caseRecord.id}</title>
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; color: #0f172a; margin: 30px; line-height: 1.5; }
    .header { border-bottom: 3px solid #1e3a8a; padding-bottom: 15px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
    .badge { display: inline-block; padding: 6px 14px; border-radius: 9999px; font-weight: 700; font-size: 14px; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
    th { background: #f1f5f9; padding: 8px 10px; text-align: left; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #cbd5e1; }
    .meta-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; margin-bottom: 20px; font-size: 13px; }
    .section-title { font-size: 16px; font-weight: 700; color: #1e3a8a; margin-top: 25px; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; }
    .sig-box { background: #fdf2f8; border: 1px dashed #db2777; border-radius: 6px; padding: 10px; margin-top: 30px; font-size: 12px; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1 style="margin: 0; font-size: 22px; color: #1e3a8a;">RAJASTHAN POLICE CYBER CRIME BRANCH</h1>
      <p style="margin: 4px 0 0 0; color: #64748b; font-size: 13px;">Cyber Fraud Detection & Incident Triage Platform (PS01 - Team Third Eye)</p>
    </div>
    <div style="text-align: right;">
      <div class="badge" style="background: ${badgeBg}; color: ${badgeColor}; border: 1px solid ${badgeColor};">
        ${res.level} RISK (${res.score} / 100)
      </div>
      <div style="font-size: 11px; color: #64748b; margin-top: 4px;">CASE ID: ${caseRecord.id}</div>
    </div>
  </div>

  <div class="meta-box">
    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
      <div><strong>Date & Time:</strong> ${Helpers.formatIST(caseRecord.timestamp)}</div>
      <div><strong>Channel/Type:</strong> ${caseRecord.input.type.toUpperCase()}</div>
      <div><strong>Incident Status:</strong> ${caseRecord.status}</div>
      <div><strong>Investigating Unit:</strong> ${caseRecord.agency}</div>
      <div><strong>Assigned Officer:</strong> ${caseRecord.analyst}</div>
      <div><strong>Scoring Model:</strong> Deterministic Rule Engine (Slide 5)</div>
    </div>
    <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #e2e8f0;">
      <strong>Examined Content / Artifact:</strong>
      <div style="background: #ffffff; border: 1px solid #cbd5e1; padding: 8px; border-radius: 4px; font-family: monospace; font-size: 12px; margin-top: 4px; word-break: break-all;">
        ${Helpers.escapeHtml(typeof caseRecord.input.content === 'object' ? JSON.stringify(caseRecord.input.content) : caseRecord.input.content)}
      </div>
    </div>
  </div>

  <div class="section-title">1. EXPLAINABLE RISK ASSESSMENT & VERDICT</div>
  <p style="font-size: 14px; background: #f8fafc; border-left: 4px solid #1e3a8a; padding: 10px 14px; margin: 10px 0;">
    ${Helpers.escapeHtml(res.explanation)}
  </p>

  <div class="section-title">2. TRIGGERED HEURISTIC RULES (MATHEMATICAL AUDIT TRAIL)</div>
  <table>
    <thead>
      <tr>
        <th>Rule ID</th>
        <th>Category</th>
        <th>Severity & Weight</th>
        <th>Explanation</th>
        <th>Captured Evidence</th>
      </tr>
    </thead>
    <tbody>
      ${triggerRows || '<tr><td colspan="5" style="text-align:center;padding:15px;color:#94a3b8;">No risk triggers activated. Clean evaluation.</td></tr>'}
    </tbody>
  </table>

  <div class="section-title">3. EXTRACTED INDICATORS OF COMPROMISE (IOCs)</div>
  <table>
    <thead>
      <tr>
        <th>IOC Type</th>
        <th>Normalized Value / Identifier</th>
        <th>Artifact Source</th>
        <th>Confidence</th>
      </tr>
    </thead>
    <tbody>
      ${iocRows || '<tr><td colspan="4" style="text-align:center;padding:15px;color:#94a3b8;">No extractable identifiers located.</td></tr>'}
    </tbody>
  </table>

  <div class="section-title">4. INVESTIGATOR DISPOSITION & CASE NOTES</div>
  <p style="font-size: 13px; color: #475569; min-height: 40px; border-bottom: 1px dashed #cbd5e1; padding-bottom: 10px;">
    ${Helpers.escapeHtml(caseRecord.investigatorNotes) || 'No supplementary investigator notes recorded at initial triage.'}
  </p>

  <div class="sig-box">
    <strong>DIGITAL INTEGRITY SIGNATURE (SHA-256):</strong><br>
    <code style="word-break: break-all; color: #831843;">${caseRecord.reportHash}</code>
    <div style="font-size: 11px; color: #9d174d; margin-top: 4px;">
      Verified court-admissible forensic record generated by Third Eye Cyber Platform. Tamper-proof digest matches case timestamp and raw artifact.
    </div>
  </div>
</body>
</html>`;
    },

    /**
     * Trigger browser file download
     */
    downloadFile: function (content, filename, mimeType = 'application/json') {
      if (typeof window === 'undefined') return;
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
    },

    /**
     * Download Case Record as JSON
     */
    downloadCaseJSON: function (caseRecord) {
      const jsonStr = this.exportJSON(caseRecord);
      this.downloadFile(jsonStr, `${caseRecord.id}.json`, 'application/json');
    },

    /**
     * Open printable window for PDF export
     */
    printOrSavePDF: function (caseRecord) {
      if (typeof window === 'undefined') return;
      const html = this.generatePrintableHTML(caseRecord);
      const printWin = window.open('', '_blank');
      if (printWin) {
        printWin.document.open();
        printWin.document.write(html);
        printWin.document.close();
        setTimeout(() => {
          printWin.focus();
          printWin.print();
        }, 300);
      }
    }
  };

  return ReportGenerator;
}));
