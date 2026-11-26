"use client";

import React, { useState } from "react";
import { Sparkles, Bot, CheckCircle2 } from "@/components/ui/icons";

interface AiPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyOptimization?: () => void;
}

export function AiPlanModal({ isOpen, onClose, onApplyOptimization }: AiPlanModalProps) {
  const [applied, setApplied] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="cfa-modal-backdrop" onClick={onClose}>
      <div className="cfa-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="cfa-modal-header">
          <div className="cfa-ai-modal-title-group">
            <span className="cfa-icon-badge green"><Sparkles size={18} /></span>
            <div>
              <h3 className="cfa-modal-title">AI Study Plan Optimizer</h3>
              <span className="cfa-ai-preview-badge">Preview Feature</span>
            </div>
          </div>
          <button
            type="button"
            className="cfa-modal-close-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        <div className="cfa-modal-body">
          <p className="cfa-ai-modal-desc">
            The CFA AI Plan Optimizer evaluates your mock exam accuracy, subject mastery gaps, and days remaining to dynamically rebalance your preparation schedule.
          </p>

          <div className="cfa-ai-recommendations-box">
            <h4 className="cfa-ai-rec-title">
              <Bot size={16} /> AI Suggested Adjustments for Your Pace:
            </h4>
            <ul className="cfa-ai-rec-list">
              <li>
                <b>Increase FSA allocation (+2 hrs/week):</b> Inventory valuation accuracy is below 50%.
              </li>
              <li>
                <b>Fast-track Quantitative Methods:</b> High retention (&gt;85%) allows skipping redundant practice sets.
              </li>
              <li>
                <b>Schedule Early Diagnostic Mock:</b> Recommended completion before April 15 to establish baseline score.
              </li>
            </ul>
          </div>

          {applied && (
            <div className="cfa-ai-applied-banner">
              <CheckCircle2 size={16} />
              <span>Optimized study allocations preview applied to your current schedule!</span>
            </div>
          )}
        </div>

        <div className="cfa-modal-footer">
          <button
            type="button"
            className="cfa-btn-modal-cancel"
            onClick={onClose}
          >
            Close
          </button>
          <button
            type="button"
            className="cfa-plan-btn-ai"
            onClick={() => {
              setApplied(true);
              onApplyOptimization?.();
            }}
          >
            <Sparkles size={14} />
            <span>Apply AI Recommendations</span>
          </button>
        </div>
      </div>
    </div>
  );
}
