"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Clock, RotateCw, Target } from "@/components/ui/icons";

export function RevisionTab() {
  const revisionPhases = [
    {
      phase: "Phase 1: Spaced Repetition (Current)",
      description: "Review completed modules after 3 days, 10 days, and 30 days to cement retention.",
      topics: ["Quantitative Methods (TVM, Probability)", "FSA (Inventory, Long-lived assets)"],
      frequency: "Daily 30 mins",
    },
    {
      phase: "Phase 2: High-Yield Formula Drilling",
      description: "Formula memorization, calculator speed drills (BA II Plus), and quick conceptual checklists.",
      topics: ["Time Value of Money", "Bond Pricing & Duration", "DuPont Analysis", "Hypothesis Testing"],
      frequency: "Starts June 1, 2026",
    },
    {
      phase: "Phase 3: Full-Length Mock Exams & Mistake Log",
      description: "6 full exam simulations under strict timed conditions (135 min morning session + 135 min afternoon session).",
      topics: ["Mock Exam 1 (Diagnostic)", "Mock Exam 2", "Mock Exam 3", "Official CFAI Mocks 1 & 2"],
      frequency: "Starts July 10, 2026",
    },
  ];

  return (
    <div className="cfa-tab-content-container">
      <Card className="cfa-plan-card">
        <div className="cfa-card-header-row">
          <div>
            <h2 className="cfa-card-heading">Revision & Retention Strategy</h2>
            <p className="cfa-card-subheading">
              Evidence-based spaced repetition and targeted practice to reach &gt;75% mock exam accuracy.
            </p>
          </div>
        </div>

        <div className="cfa-revision-phases-list">
          {revisionPhases.map((rp, idx) => (
            <div key={idx} className="cfa-revision-phase-box">
              <div className="cfa-revision-header">
                <span className="cfa-revision-title">
                  <RotateCw size={16} /> {rp.phase}
                </span>
                <span className="cfa-revision-frequency">
                  <Clock size={13} /> {rp.frequency}
                </span>
              </div>
              <p className="cfa-revision-desc">{rp.description}</p>
              <div className="cfa-revision-topics-chips">
                {rp.topics.map((t) => (
                  <span key={t} className="cfa-revision-chip">
                    <Target size={12} /> {t}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
