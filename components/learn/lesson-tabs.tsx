"use client";

import React from "react";

export type LessonTabType = "lesson" | "examples" | "practice" | "summary" | "notes";

interface LessonTabsProps {
  activeTab: LessonTabType;
  onChangeTab: (tab: LessonTabType) => void;
  practiceCount?: number;
}

export function LessonTabs({
  activeTab,
  onChangeTab,
  practiceCount,
}: LessonTabsProps) {
  const tabs: { id: LessonTabType; label: string; badge?: number }[] = [
    { id: "lesson", label: "Lesson" },
    { id: "examples", label: "Examples" },
    { id: "practice", label: "Practice Questions", badge: practiceCount },
    { id: "summary", label: "Summary" },
    { id: "notes", label: "Notes" },
  ];

  return (
    <div className="cfa-lesson-tabs-container">
      <div className="cfa-lesson-tabs-list" role="tablist">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={`cfa-lesson-tab-btn ${isActive ? "active" : ""}`}
              onClick={() => onChangeTab(tab.id)}
            >
              <span>{tab.label}</span>
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className="cfa-lesson-tab-badge">{tab.badge}</span>
              )}
              {isActive && <div className="cfa-lesson-tab-indicator" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
