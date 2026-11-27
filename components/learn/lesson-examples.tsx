"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronRight, Sigma } from "@/components/ui/icons";
import type { LessonContent } from "./content-types";

export function LessonExamples({ content }: { content: LessonContent | null }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const examples = content?.workedExamples ?? [];

  return (
    <div className="cfa-lesson-tab-body">
      <div className="cfa-learn-tab-intro">
        <h3 className="cfa-learn-tab-title">Worked Numerical Examples</h3>
        <p className="cfa-learn-tab-desc">Step-by-step examples for the selected lesson.</p>
      </div>
      {examples.length === 0 ? <p role="status">No worked examples have been published for this lesson yet.</p> : <div className="cfa-learn-examples-list">
        {examples.map((example, index) => {
          const isOpen = expandedId === String(index);
          return <div key={`${example.title}-${index}`} className="cfa-learn-example-card">
            <button type="button" className="cfa-learn-example-header" aria-expanded={isOpen} onClick={() => setExpandedId(isOpen ? null : String(index))}>
              <span className="cfa-learn-example-header-left"><span className="cfa-learn-example-icon"><Sigma size={16} color="#0d7b5f" /></span><span className="cfa-learn-example-title">{example.title}</span></span>
              <span className="cfa-learn-example-chevron">{isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}</span>
            </button>
            {isOpen && <div className="cfa-learn-example-body">
              <div className="cfa-learn-problem-box"><span className="cfa-learn-problem-label">Problem:</span><p className="cfa-learn-problem-text">{example.problem}</p></div>
              {content?.formulaExplanations.length ? <div className="cfa-learn-formula-banner"><span className="cfa-learn-formula-tag">Lesson formulas</span>{content.formulaExplanations.map((formula) => <p key={formula.name}><strong>{formula.name}: </strong><code className="cfa-learn-formula-code">{formula.formula}</code></p>)}</div> : null}
              <div className="cfa-learn-solution-section"><span className="cfa-learn-solution-title">Step-by-Step Breakdown:</span><ol className="cfa-learn-solution-steps">{example.steps.map((step, stepIndex) => <li key={`${step.label}-${stepIndex}`} className="cfa-learn-solution-step"><strong>{step.label} — {step.calculation}</strong><br />{step.explanation}</li>)}</ol></div>
              <div className="cfa-learn-final-answer-row"><span className="cfa-learn-final-label">Final Answer:</span><span className="cfa-learn-final-pill">{example.answer}</span></div>
            </div>}
          </div>;
        })}
      </div>}
    </div>
  );
}
