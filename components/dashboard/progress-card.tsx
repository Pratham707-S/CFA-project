"use client";

import React from "react";
import {
  Flame,
  Clock,
  FileText,
  Target,
} from "@/components/ui/icons";
import { Card } from "@/components/ui/card";

interface ProgressCardProps {
  overallMastery?: number;
  learningProgress?: number;
  practiceProgress?: number;
  revisionProgress?: number;
  mocksProgress?: number;
  dayStreak?: number;
  totalStudyTime?: string;
  questionsAttempted?: number;
  accuracyPercent?: number;
  onViewAnalytics?: () => void;
}

export function ProgressCard({
  overallMastery = 68,
  learningProgress = 74,
  practiceProgress = 61,
  revisionProgress = 52,
  mocksProgress = 45,
  dayStreak = 12,
  totalStudyTime = "84 hrs",
  questionsAttempted = 428,
  accuracyPercent = 73,
  onViewAnalytics,
}: ProgressCardProps) {
  // SVG circular progress calculation
  // Radius 46, Circumference = 2 * PI * 46 = 289.026
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - (overallMastery / 100) * circumference;

  return (
    <Card className="cfa-progress-card">
      {/* Header */}
      <div className="cfa-card-header-row">
        <h2 className="cfa-card-heading">Your CFA Progress</h2>
        <button
          type="button"
          className="cfa-card-action-link"
          onClick={onViewAnalytics}
        >
          View Analytics →
        </button>
      </div>

      {/* Mastery Ring */}
      <div className="cfa-mastery-gauge-wrapper">
        <div className="cfa-mastery-svg-container">
          <svg className="cfa-mastery-svg" viewBox="0 0 110 110">
            {/* Background Track Circle */}
            <circle
              className="cfa-mastery-track"
              cx="55"
              cy="55"
              r={radius}
              strokeWidth="8"
            />
            {/* Foreground Green Progress Circle */}
            <circle
              className="cfa-mastery-fill"
              cx="55"
              cy="55"
              r={radius}
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              transform="rotate(-90 55 55)"
            />
          </svg>
          <div className="cfa-mastery-center-content">
            <span className="cfa-mastery-percentage">{overallMastery}%</span>
            <span className="cfa-mastery-label">Overall Mastery</span>
          </div>
        </div>
      </div>

      {/* Category Progress Bars */}
      <div className="cfa-progress-categories">
        {/* Learning */}
        <div className="cfa-category-row">
          <span className="cfa-category-name">Learning</span>
          <div className="cfa-category-bar-track">
            <div
              className="cfa-category-bar-fill learning"
              style={{ width: `${learningProgress}%` }}
            />
          </div>
          <span className="cfa-category-pct">{learningProgress}%</span>
        </div>

        {/* Practice */}
        <div className="cfa-category-row">
          <span className="cfa-category-name">Practice</span>
          <div className="cfa-category-bar-track">
            <div
              className="cfa-category-bar-fill practice"
              style={{ width: `${practiceProgress}%` }}
            />
          </div>
          <span className="cfa-category-pct">{practiceProgress}%</span>
        </div>

        {/* Revision */}
        <div className="cfa-category-row">
          <span className="cfa-category-name">Revision</span>
          <div className="cfa-category-bar-track">
            <div
              className="cfa-category-bar-fill revision"
              style={{ width: `${revisionProgress}%` }}
            />
          </div>
          <span className="cfa-category-pct">{revisionProgress}%</span>
        </div>

        {/* Mocks */}
        <div className="cfa-category-row">
          <span className="cfa-category-name">Mocks</span>
          <div className="cfa-category-bar-track">
            <div
              className="cfa-category-bar-fill mocks"
              style={{ width: `${mocksProgress}%` }}
            />
          </div>
          <span className="cfa-category-pct">{mocksProgress}%</span>
        </div>
      </div>

      {/* Bottom 4 Key Stats */}
      <div className="cfa-progress-stats-grid">
        <div className="cfa-stat-box">
          <div className="cfa-stat-icon-wrapper flame">
            <Flame size={15} />
          </div>
          <div className="cfa-stat-value">{dayStreak}</div>
          <div className="cfa-stat-label">Day Streak</div>
        </div>

        <div className="cfa-stat-box">
          <div className="cfa-stat-icon-wrapper green">
            <Clock size={15} />
          </div>
          <div className="cfa-stat-value">{totalStudyTime}</div>
          <div className="cfa-stat-label">Total Study Time</div>
        </div>

        <div className="cfa-stat-box">
          <div className="cfa-stat-icon-wrapper green">
            <FileText size={15} />
          </div>
          <div className="cfa-stat-value">{questionsAttempted}</div>
          <div className="cfa-stat-label">Questions Attempted</div>
        </div>

        <div className="cfa-stat-box">
          <div className="cfa-stat-icon-wrapper green">
            <Target size={15} />
          </div>
          <div className="cfa-stat-value">{accuracyPercent}%</div>
          <div className="cfa-stat-label">Accuracy</div>
        </div>
      </div>
    </Card>
  );
}
