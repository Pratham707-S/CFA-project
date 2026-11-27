"use client";

import React from "react";
import { ShieldCheck, Lightbulb, FileText } from "@/components/ui/icons";
import type { LessonContent } from "./content-types";

export function LessonSummary({ content }: { content: LessonContent | null }) {
  const summaryPoints = content?.keyTakeaways ?? [];
  const formulaCheatSheet = content?.formulaExplanations ?? [];

  return (
    <div className="cfa-lesson-tab-body">
      <div className="cfa-learn-tab-intro">
        <h3 className="cfa-learn-tab-title">Executive Summary & Formula Sheet</h3>
        <p className="cfa-learn-tab-desc">
          Quick review sheet for the selected lesson.
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
          {summaryPoints.map((point) => (
            <div key={point} className="cfa-summary-item-card">
              <p className="cfa-summary-item-desc">{point}</p>
            </div>
          ))}
          {summaryPoints.length === 0 && <p role="status">No revision takeaways have been published for this lesson yet.</p>}
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
              {formulaCheatSheet.map((item) => (
                <tr key={item.name}>
                  <td className="cfa-formula-concept-cell">{item.name}</td>
                  <td className="cfa-formula-code-cell">
                    <code>{item.formula}</code>
                  </td>
                </tr>
              ))}
              {formulaCheatSheet.length === 0 && <tr><td colSpan={2}>No formula sheet has been published for this lesson yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* Common Exam Traps */}
      {content?.commonMistakes.length ? <div className="cfa-learn-quick-notes-banner trap-banner">
        <div className="cfa-learn-quick-notes-bulb">
          <Lightbulb size={20} color="#ea580c" />
        </div>
        <div>
          <strong className="cfa-trap-title">Common mistakes</strong>
          <ul className="cfa-learn-quick-notes-text">{content.commonMistakes.map((mistake) => <li key={mistake}>{mistake}</li>)}</ul>
        </div>
      </div> : null}
      {content && <p>{content.summary}</p>}
    </div>
  );
}
