"use client";

import React, { useState } from "react";
import { CfaBarsLogo, ChevronDown } from "@/components/ui/icons";

interface LearnHeaderProps {
  currentLevel?: string;
  onLevelChange?: (level: string) => void;
}

export function LearnHeader({
  currentLevel = "CFA Level I",
  onLevelChange,
}: LearnHeaderProps) {
  const [levelDropdownOpen, setLevelDropdownOpen] = useState(false);

  const levels = ["CFA Level I", "CFA Level II", "CFA Level III"];

  return (
    <div className="cfa-learn-header-container">
      <div className="cfa-learn-title-row">
        {/* Left: Heading & Subtitle */}
        <div className="cfa-learn-title-group">
          <h1 className="cfa-learn-main-title">Learn</h1>
          <p className="cfa-learn-subtitle">
            Structured curriculum with concept explanations, examples, and practice.
          </p>
        </div>

        {/* Right: CFA Level Selector */}
        <div className="cfa-learn-level-wrapper">
          <button
            type="button"
            className="cfa-learn-level-btn"
            onClick={() => setLevelDropdownOpen(!levelDropdownOpen)}
            aria-expanded={levelDropdownOpen}
          >
            <span className="cfa-learn-level-icon">
              <CfaBarsLogo size={18} />
            </span>
            <span className="cfa-learn-level-text">{currentLevel}</span>
            <ChevronDown size={14} className="cfa-learn-level-chevron" />
          </button>

          {levelDropdownOpen && (
            <div className="cfa-learn-level-dropdown">
              {levels.map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  className={`cfa-learn-level-item ${lvl === currentLevel ? "active" : ""}`}
                  onClick={() => {
                    onLevelChange?.(lvl);
                    setLevelDropdownOpen(false);
                  }}
                >
                  <CfaBarsLogo size={14} />
                  <span>{lvl}</span>
                  {lvl === currentLevel && <span className="cfa-learn-level-dot" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
