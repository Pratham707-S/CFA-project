"use client";

import React from "react";
import { ShieldCheck, Lightbulb, FileText } from "@/components/ui/icons";

export function LessonSummary() {
  const summaryPoints = [
    {
      title: "Core Principle of TVM",
      description:
        "A dollar received today is worth more than a dollar received tomorrow because money earns interest over time. Compounding calculates future value, while discounting calculates present value.",
    },
    {
      title: "Ordinary Annuity vs Annuity Due",
      description:
        "Ordinary annuities make payments at the END of each period. Annuities due make payments at the BEGINNING of each period. Consequently, PV(Annuity Due) = PV(Ordinary Annuity) × (1 + r).",
    },
    {
      title: "Perpetuities and Growing Perpetuities",
      description:
        "A flat perpetuity pays PMT indefinitely: PV = PMT / r. A perpetuity growing at a constant rate g pays PMT_1 in year 1: PV = PMT_1 / (r - g), where r must strictly exceed g.",
    },
    {
      title: "Effective Annual Rate (EAR)",
      description:
        "EAR accounts for compounding frequency m: EAR = (1 + r_nominal / m)^m - 1. Continuous compounding reaches the limit EAR = e^(r) - 1.",
    },
  ];

  const formulaCheatSheet = [
    { label: "Future Value (Lump Sum)", formula: "FV = PV × (1 + r)^n" },
    { label: "Present Value (Lump Sum)", formula: "PV = FV / (1 + r)^n" },
    { label: "Ordinary Annuity PV", formula: "PV = PMT × [ 1 - (1 + r)^(-n) ] / r" },
    { label: "Ordinary Annuity FV", formula: "FV = PMT × [ (1 + r)^n - 1 ] / r" },
    { label: "Flat Perpetuity PV", formula: "PV = PMT / r" },
    { label: "Growing Perpetuity PV", formula: "PV = PMT_1 / (r - g)" },
  ];

  return (
    <div className="cfa-lesson-tab-body">
      <div className="cfa-learn-tab-intro">
        <h3 className="cfa-learn-tab-title">Executive Summary & Formula Sheet</h3>
        <p className="cfa-learn-tab-desc">
          Quick review sheet containing high-yield formulas and key exam takeaways for Time Value of Money.
        </p>
      </div>

      {/* Key Takeaways */}
      <div className="cfa-summary-section">
        <div className="cfa-summary-section-header">
          <span className="cfa-learn-card-icon-badge green">
            <ShieldCheck size={16} color="#0d7b5f" />
          </span>
          <h4 className="cfa-summary-section-title">Key Exam Takeaways</h4>
        </div>

        <div className="cfa-summary-cards-grid">
          {summaryPoints.map((pt, idx) => (
            <div key={idx} className="cfa-summary-item-card">
              <h5 className="cfa-summary-item-title">{pt.title}</h5>
              <p className="cfa-summary-item-desc">{pt.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Formulas Table */}
      <div className="cfa-summary-section">
        <div className="cfa-summary-section-header">
          <span className="cfa-learn-card-icon-badge blue">
            <FileText size={16} color="#2563eb" />
          </span>
          <h4 className="cfa-summary-section-title">Essential Formula Reference</h4>
        </div>

        <div className="cfa-formulas-table-wrap">
          <table className="cfa-formulas-table">
            <thead>
              <tr>
                <th>Concept / Measure</th>
                <th>Mathematical Formula</th>
              </tr>
            </thead>
            <tbody>
              {formulaCheatSheet.map((item, idx) => (
                <tr key={idx}>
                  <td className="cfa-formula-concept-cell">{item.label}</td>
                  <td className="cfa-formula-code-cell">
                    <code>{item.formula}</code>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Common Exam Traps */}
      <div className="cfa-learn-quick-notes-banner trap-banner">
        <div className="cfa-learn-quick-notes-bulb">
          <Lightbulb size={20} color="#ea580c" />
        </div>
        <div>
          <strong className="cfa-trap-title">Common Exam Trap: Calculator Mode!</strong>
          <p className="cfa-learn-quick-notes-text">
            Ensure your Texas Instruments BA II Plus or HP 12C is set to <strong>END</strong> mode for ordinary annuities and <strong>BGN</strong> mode for annuities due. Don&apos;t forget to switch back to END after annuity due questions!
          </p>
        </div>
      </div>
    </div>
  );
}
