"use client";

import React, { useState } from "react";
import { CfaBarsLogo, CalendarDays, ChevronDown } from "@/components/ui/icons";

interface GreetingSectionProps {
  studentName?: string;
  selectedLevel?: string;
  onLevelChange?: (level: string) => void;
  examDaysLeft?: number;
  examDateFormatted?: string;
  progressPercent?: number;
}

export function GreetingSection({
  studentName = "Pratham",
  selectedLevel = "CFA Level I",
  onLevelChange,
  examDaysLeft = 124,
  examDateFormatted = "26 Aug 2026",
  progressPercent = 68,
}: GreetingSectionProps) {
  const [levelDropdownOpen, setLevelDropdownOpen] = useState(false);

  // Formatted date string matching reference style: "Mon, 22 April 2024"
  const now = new Date();
  const dayName = now.toLocaleDateString("en-US", { weekday: "short" });
  const dayNum = now.getDate();
  const monthName = now.toLocaleDateString("en-US", { month: "long" });
  const year = now.getFullYear();
  const formattedDate = `${dayName}, ${dayNum} ${monthName} ${year}`;

  const levels = ["CFA Level I", "CFA Level II", "CFA Level III"];

  return (
    <section className="cfa-greeting-section">
      {/* Mountain sunrise atmospheric background layer */}
      <div className="cfa-greeting-bg-visual" aria-hidden="true" />

      <div className="cfa-greeting-content">
        {/* Left Column: Date, Greeting, Subtitle */}
        <div className="cfa-greeting-text">
          <div className="cfa-greeting-date">{formattedDate}</div>
          <h1 className="cfa-greeting-heading">
            Good morning, {studentName} <span className="cfa-wave-emoji">👋</span>
          </h1>
          <p className="cfa-greeting-subtitle">
            Stay consistent. You&apos;re {progressPercent}% towards your goal.
          </p>
        </div>

        {/* Right Column: Level Selector & Exam Countdown Cards */}
        <div className="cfa-greeting-badges">
          {/* Level Selector Card */}
          <div className="cfa-level-selector-wrapper">
            <button
              type="button"
              className="cfa-greeting-card cfa-level-card"
              onClick={() => setLevelDropdownOpen(!levelDropdownOpen)}
              aria-expanded={levelDropdownOpen}
            >
              <div className="cfa-greeting-card-icon green">
                <CfaBarsLogo size={18} />
              </div>
              <div className="cfa-greeting-card-details">
                <span className="cfa-greeting-card-title">{selectedLevel}</span>
                <span className="cfa-greeting-card-sub">Change Level</span>
              </div>
              <ChevronDown size={15} className="cfa-greeting-card-chevron" />
            </button>

            {levelDropdownOpen && (
              <div className="cfa-level-dropdown">
                {levels.map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    className={`cfa-level-dropdown-item ${lvl === selectedLevel ? "selected" : ""}`}
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

          {/* Exam Countdown Card */}
          <div className="cfa-greeting-card cfa-countdown-card">
            <div className="cfa-greeting-card-icon neutral">
              <CalendarDays size={18} />
            </div>
            <div className="cfa-greeting-card-details">
              <span className="cfa-greeting-card-title">
                {examDaysLeft} days to exam
              </span>
              <span className="cfa-greeting-card-sub">{examDateFormatted}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
