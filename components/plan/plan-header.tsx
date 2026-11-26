"use client";

import React, { useState } from "react";
import { CfaBarsLogo, ChevronDown, Pencil, Sparkles } from "@/components/ui/icons";

export type PlanTab = "overview" | "weekly" | "calendar" | "subjects" | "revision";

interface PlanHeaderProps {
  activeTab: PlanTab;
  onTabChange: (tab: PlanTab) => void;
  selectedLevel?: string;
  onLevelChange?: (level: string) => void;
  onEditPlan?: () => void;
  onAdjustWithAi?: () => void;
}

export function PlanHeader({
  activeTab,
  onTabChange,
  selectedLevel = "CFA Level I",
  onLevelChange,
  onEditPlan,
  onAdjustWithAi,
}: PlanHeaderProps) {
  const [levelDropdownOpen, setLevelDropdownOpen] = useState(false);
  const levels = ["CFA Level I", "CFA Level II", "CFA Level III"];

  const tabs: { id: PlanTab; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "weekly", label: "Weekly Plan" },
    { id: "calendar", label: "Calendar" },
    { id: "subjects", label: "Subjects" },
    { id: "revision", label: "Revision" },
  ];

  return (
    <div className="cfa-plan-header-container">
      {/* Top Title & Level Row */}
      <div className="cfa-plan-title-row">
        <div className="cfa-plan-title-group">
          <h1 className="cfa-plan-main-title">My CFA Plan</h1>
          <p className="cfa-plan-subtitle">
            Your personalized roadmap to crack CFA Level I.
          </p>
        </div>

        {/* Level Selector Dropdown */}
        <div className="cfa-plan-level-wrapper">
          <button
            type="button"
            className="cfa-plan-level-btn"
            onClick={() => setLevelDropdownOpen(!levelDropdownOpen)}
            aria-expanded={levelDropdownOpen}
          >
            <span className="cfa-plan-level-icon">
              <CfaBarsLogo size={18} />
            </span>
            <span className="cfa-plan-level-text">{selectedLevel}</span>
            <ChevronDown size={15} className="cfa-plan-level-chevron" />
          </button>

          {levelDropdownOpen && (
            <div className="cfa-plan-level-dropdown">
              {levels.map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  className={`cfa-plan-level-item ${lvl === selectedLevel ? "selected" : ""}`}
                  onClick={() => {
                    onLevelChange?.(lvl);
                    setLevelDropdownOpen(false);
                  }}
                >
                  {lvl}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tabs Row & Action Buttons */}
      <div className="cfa-plan-nav-bar">
        {/* Navigation Tabs */}
        <div className="cfa-plan-tabs-list" role="tablist">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={`cfa-plan-tab-btn ${isActive ? "active" : ""}`}
                onClick={() => onTabChange(tab.id)}
              >
                <span>{tab.label}</span>
                {isActive && <div className="cfa-plan-tab-indicator" />}
              </button>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="cfa-plan-header-actions">
          <button
            type="button"
            className="cfa-plan-btn-edit"
            onClick={onEditPlan}
          >
            <Pencil size={14} />
            <span>Edit Plan</span>
          </button>

          <button
            type="button"
            className="cfa-plan-btn-ai"
            onClick={onAdjustWithAi}
          >
            <Sparkles size={14} />
            <span>Adjust my plan with AI</span>
          </button>
        </div>
      </div>
    </div>
  );
}
