"use client";

import React from "react";
import { CalendarDays } from "@/components/ui/icons";
import { Card } from "@/components/ui/card";

interface DayData {
  day: string;
  hours: number;
}

interface ThisWeekCardProps {
  currentHours?: number;
  goalHours?: number;
  goalPercent?: number;
  days?: DayData[];
  onViewCalendar?: () => void;
}

export function ThisWeekCard({
  currentHours = 10.5,
  goalHours = 12,
  goalPercent = 88,
  days = [
    { day: "Mon", hours: 1.0 },
    { day: "Tue", hours: 1.5 },
    { day: "Wed", hours: 0.6 },
    { day: "Thu", hours: 2.6 },
    { day: "Fri", hours: 1.2 },
    { day: "Sat", hours: 2.3 },
    { day: "Sun", hours: 0.7 },
  ],
  onViewCalendar,
}: ThisWeekCardProps) {
  const maxScaleHours = 3.0; // Y-axis top value is 3h

  // Goal circular ring
  const ringRadius = 18;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringDashoffset =
    ringCircumference - (goalPercent / 100) * ringCircumference;

  return (
    <Card className="cfa-this-week-card">
      {/* Header */}
      <div className="cfa-card-header-row">
        <div className="cfa-header-title-group">
          <div className="cfa-icon-badge green">
            <CalendarDays size={18} />
          </div>
          <h2 className="cfa-card-heading">This Week</h2>
        </div>
        <button
          type="button"
          className="cfa-card-action-link"
          onClick={onViewCalendar}
        >
          View Calendar →
        </button>
      </div>

      {/* Top Stat Row with Weekly Goal Ring */}
      <div className="cfa-week-stats-row">
        <div className="cfa-week-study-hours-col">
          <span className="cfa-week-stat-label">Study Hours</span>
          <span className="cfa-week-stat-value">
            {currentHours} <span className="cfa-week-stat-slash">/</span> {goalHours} hrs
          </span>
        </div>

        <div className="cfa-week-goal-col">
          <span className="cfa-week-goal-title">Weekly Goal</span>
          <div className="cfa-week-mini-ring-wrapper">
            <svg className="cfa-mini-ring-svg" viewBox="0 0 44 44">
              <circle
                className="cfa-mini-ring-track"
                cx="22"
                cy="22"
                r={ringRadius}
                strokeWidth="4"
              />
              <circle
                className="cfa-mini-ring-fill"
                cx="22"
                cy="22"
                r={ringRadius}
                strokeWidth="4"
                strokeDasharray={ringCircumference}
                strokeDashoffset={ringDashoffset}
                strokeLinecap="round"
                transform="rotate(-90 22 22)"
              />
            </svg>
            <span className="cfa-mini-ring-text">{goalPercent}%</span>
          </div>
          <span className="cfa-week-goal-fraction">
            {currentHours} / {goalHours} hrs
          </span>
        </div>
      </div>

      {/* Bar Chart Container */}
      <div className="cfa-week-chart-container">
        {/* Y Axis Labels & Gridlines */}
        <div className="cfa-chart-y-axis">
          <div className="cfa-y-tick"><span>3h</span><div className="cfa-grid-line" /></div>
          <div className="cfa-y-tick"><span>2h</span><div className="cfa-grid-line" /></div>
          <div className="cfa-y-tick"><span>1h</span><div className="cfa-grid-line" /></div>
          <div className="cfa-y-tick"><span>0h</span><div className="cfa-grid-line baseline" /></div>
        </div>

        {/* Bars and X Labels */}
        <div className="cfa-chart-bars-area">
          {days.map((item) => {
            const heightPercent = Math.min(100, Math.round((item.hours / maxScaleHours) * 100));
            return (
              <div key={item.day} className="cfa-chart-col">
                <div className="cfa-chart-bar-slot">
                  <div
                    className="cfa-chart-bar-rect"
                    style={{ height: `${heightPercent}%` }}
                    title={`${item.day}: ${item.hours} hrs`}
                  />
                </div>
                <span className="cfa-chart-x-label">{item.day}</span>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
