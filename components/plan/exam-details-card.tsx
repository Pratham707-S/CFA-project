"use client";

import React from "react";
import { CalendarDays } from "@/components/ui/icons";
import { Card } from "@/components/ui/card";

interface ExamDetailsCardProps {
  level?: string;
  examDateLabel?: string;
  daysRemaining?: number;
}

export function ExamDetailsCard({
  level = "CFA Level I",
  examDateLabel = "August 2026",
  daysRemaining = 124,
}: ExamDetailsCardProps) {
  return (
    <Card className="cfa-plan-card cfa-exam-details-card">
      {/* Header */}
      <div className="cfa-card-header-row">
        <div className="cfa-header-title-group">
          <div className="cfa-icon-badge green">
            <CalendarDays size={18} />
          </div>
          <h2 className="cfa-card-heading">Exam Details</h2>
        </div>
      </div>

      {/* Two-Column Content */}
      <div className="cfa-exam-details-content">
        {/* Left: Level & Exam Month */}
        <div className="cfa-exam-info-block">
          <div className="cfa-exam-calendar-icon">
            <CalendarDays size={22} />
          </div>
          <div className="cfa-exam-info-text">
            <span className="cfa-exam-level-name">{level}</span>
            <span className="cfa-exam-date-month">{examDateLabel}</span>
          </div>
        </div>

        {/* Right: Days Remaining */}
        <div className="cfa-days-remaining-block">
          <span className="cfa-days-number">{daysRemaining}</span>
          <span className="cfa-days-label">days remaining</span>
        </div>
      </div>
    </Card>
  );
}
