"use client";

import React, { useState } from "react";
import { exampleProblems } from "./learn-data";
import { ChevronDown, ChevronRight, Sigma } from "@/components/ui/icons";

export function LessonExamples() {
  const [expandedId, setExpandedId] = useState<string>("ex-1");

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? "" : id));
  };

  return (
    <div className="cfa-lesson-tab-body">
      <div className="cfa-learn-tab-intro">
        <h3 className="cfa-learn-tab-title">Worked Numerical Examples</h3>
        <p className="cfa-learn-tab-desc">
          Step-by-step solutions to typical CFA Level I calculation problems for Time Value of Money.
        </p>
      </div>

      <div className="cfa-learn-examples-list">
        {exampleProblems.map((ex) => {
          const isOpen = expandedId === ex.id;
          return (
            <div key={ex.id} className="cfa-learn-example-card">
              <button
                type="button"
                className="cfa-learn-example-header"
                onClick={() => toggleExpand(ex.id)}
              >
                <div className="cfa-learn-example-header-left">
                  <span className="cfa-learn-example-icon">
                    <Sigma size={16} color="#0d7b5f" />
                  </span>
                  <span className="cfa-learn-example-title">{ex.title}</span>
                </div>
                <span className="cfa-learn-example-chevron">
                  {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </span>
              </button>

              {isOpen && (
                <div className="cfa-learn-example-body">
                  {/* Problem statement */}
                  <div className="cfa-learn-problem-box">
                    <span className="cfa-learn-problem-label">Problem:</span>
                    <p className="cfa-learn-problem-text">{ex.problem}</p>
                  </div>

                  {/* Formula banner */}
                  <div className="cfa-learn-formula-banner">
                    <span className="cfa-learn-formula-tag">Applicable Formula</span>
                    <code className="cfa-learn-formula-code">{ex.formula}</code>
                  </div>

                  {/* Step by step solution */}
                  <div className="cfa-learn-solution-section">
                    <span className="cfa-learn-solution-title">Step-by-Step Breakdown:</span>
                    <ol className="cfa-learn-solution-steps">
                      {ex.solutionSteps.map((step, idx) => (
                        <li key={idx} className="cfa-learn-solution-step">
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>

                  {/* Final Answer pill */}
                  <div className="cfa-learn-final-answer-row">
                    <span className="cfa-learn-final-label">Final Value:</span>
                    <span className="cfa-learn-final-pill">{ex.finalAnswer}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
