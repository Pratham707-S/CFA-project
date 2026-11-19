"use client";

import React from "react";
import { Target, CalendarDays, BookOpen, BarChart3 } from "@/components/ui/icons";
import { Card } from "@/components/ui/card";

interface PlanOverviewCardProps {
  dailyStudyHours?: number;
  studyDaysPerWeek?: number;
  currentPhase?: string;
  planProgressPercent?: number;
}

export function PlanOverviewCard({
  dailyStudyHours = 2,
  studyDaysPerWeek = 6,
  currentPhase = "Core Learning",
  planProgressPercent = 68,
}: PlanOverviewCardProps) {
  return (
    <Card className="cfa-plan-card cfa-plan-overview-card">
      {/* Header */}
      <div className="cfa-card-header-row">
        <h2 className="cfa-card-heading">Plan Overview</h2>
      </div>

      {/* 4 Metric Sub-Cards Grid */}
      <div className="cfa-plan-metrics-grid">
        {/* Metric 1: Daily Study Target */}
        <div className="cfa-metric-subcard">
          <div className="cfa-metric-icon-badge">
            <Target size={18} />
          </div>
          <div className="cfa-metric-text-group">
            <span className="cfa-metric-title">Daily Study Target</span>
            <span className="cfa-metric-value">{dailyStudyHours} hours</span>
          </div>
        </div>

        {/* Metric 2: Study Days */}
        <div className="cfa-metric-subcard">
          <div className="cfa-metric-icon-badge">
            <CalendarDays size={18} />
          </div>
          <div className="cfa-metric-text-group">
            <span className="cfa-metric-title">Study Days</span>
            <span className="cfa-metric-value">{studyDaysPerWeek} days/week</span>
          </div>
        </div>

        {/* Metric 3: Current Phase */}
        <div className="cfa-metric-subcard">
          <div className="cfa-metric-icon-badge">
            <BookOpen size={18} />
          </div>
          <div className="cfa-metric-text-group">
            <span className="cfa-metric-title">Current Phase</span>
            <span className="cfa-metric-value">{currentPhase}</span>
          </div>
        </div>

        {/* Metric 4: Plan Progress */}
        <div className="cfa-metric-subcard progress-subcard">
          <div className="cfa-metric-top-row">
            <div className="cfa-metric-icon-badge">
              <BarChart3 size={18} />
            </div>
            <div className="cfa-metric-text-group">
              <span className="cfa-metric-title">Plan Progress</span>
              <span className="cfa-metric-value">{planProgressPercent}% planned</span>
            </div>
          </div>
          <div className="cfa-plan-progress-bar-track">
            <div
              className="cfa-plan-progress-bar-fill"
              style={{ width: `${planProgressPercent}%` }}
            />
          </div>
        </div>
      </div>
    </Card>
  );
}
