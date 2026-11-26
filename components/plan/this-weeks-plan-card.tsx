"use client";

import React, { useState } from "react";
import {
  Check,
  Play,
  Circle,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
} from "@/components/ui/icons";
import { Card } from "@/components/ui/card";

export interface DayPlanItem {
  id: string;
  dayShort: string;
  dateLabel: string;
  subject: string;
  detail: string;
  duration: string;
  status: "completed" | "in-progress" | "pending";
}

interface ThisWeeksPlanCardProps {
  initialDateRange?: string;
  initialItems?: DayPlanItem[];
}

export function ThisWeeksPlanCard({
  initialDateRange = "Mar 24 – Mar 30, 2025",
  initialItems = [
    {
      id: "1",
      dayShort: "Mon",
      dateLabel: "24 Mar",
      subject: "Quantitative Methods",
      detail: "Time Value of Money, Practice Questions",
      duration: "2 hrs",
      status: "completed",
    },
    {
      id: "2",
      dayShort: "Tue",
      dateLabel: "25 Mar",
      subject: "Financial Statement Analysis",
      detail: "Financial Statements, Ratio Analysis",
      duration: "2 hrs",
      status: "completed",
    },
    {
      id: "3",
      dayShort: "Wed",
      dateLabel: "26 Mar",
      subject: "Economics",
      detail: "Macro & Micro Basics",
      duration: "2 hrs",
      status: "in-progress",
    },
    {
      id: "4",
      dayShort: "Thu",
      dateLabel: "27 Mar",
      subject: "Fixed Income",
      detail: "Bond Valuation",
      duration: "2 hrs",
      status: "pending",
    },
    {
      id: "5",
      dayShort: "Fri",
      dateLabel: "28 Mar",
      subject: "Ethics",
      detail: "Standards I-III",
      duration: "2 hrs",
      status: "pending",
    },
    {
      id: "6",
      dayShort: "Sat",
      dateLabel: "29 Mar",
      subject: "Mixed Practice",
      detail: "Topic-wise questions",
      duration: "2 hrs",
      status: "pending",
    },
    {
      id: "7",
      dayShort: "Sun",
      dateLabel: "30 Mar",
      subject: "Weekly Review",
      detail: "Revise notes & analyze mistakes",
      duration: "1 hr",
      status: "pending",
    },
  ],
}: ThisWeeksPlanCardProps) {
  const [items, setItems] = useState<DayPlanItem[]>(initialItems);
  const [dateRange] = useState(initialDateRange);

  const toggleDayStatus = (id: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextStatus =
            item.status === "completed"
              ? "pending"
              : item.status === "pending"
              ? "in-progress"
              : "completed";
          return { ...item, status: nextStatus };
        }
        return item;
      })
    );
  };

  return (
    <Card className="cfa-plan-card cfa-week-plan-card">
      {/* Header */}
      <div className="cfa-card-header-row">
        <h2 className="cfa-card-heading">This Week&apos;s Plan</h2>

        <div className="cfa-card-pagination-group">
          <span className="cfa-pagination-date-label">{dateRange}</span>
          <div className="cfa-pagination-arrows">
            <button
              type="button"
              className="cfa-pagination-arrow-btn"
              aria-label="Previous week"
            >
              <ChevronLeft size={15} />
            </button>
            <button
              type="button"
              className="cfa-pagination-arrow-btn"
              aria-label="Next week"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* 7-Day Rows */}
      <div className="cfa-week-plan-rows">
        {items.map((item) => (
          <div key={item.id} className={`cfa-day-plan-row ${item.status}`}>
            {/* Day & Date */}
            <div className="cfa-day-plan-col-date">
              <span className="cfa-day-short">{item.dayShort}</span>
              <span className="cfa-date-num">{item.dateLabel}</span>
            </div>

            {/* Status Icon */}
            <button
              type="button"
              className={`cfa-day-status-btn ${item.status}`}
              onClick={() => toggleDayStatus(item.id)}
              aria-label={`Toggle status for ${item.dayShort}`}
            >
              {item.status === "completed" && (
                <div className="cfa-status-circle completed">
                  <Check size={12} />
                </div>
              )}
              {item.status === "in-progress" && (
                <div className="cfa-status-circle in-progress">
                  <Play size={10} className="cfa-play-icon" />
                </div>
              )}
              {item.status === "pending" && (
                <div className="cfa-status-circle pending">
                  <Circle size={16} />
                </div>
              )}
            </button>

            {/* Subject & Detail */}
            <div className="cfa-day-plan-col-info">
              <span className="cfa-day-plan-subject">{item.subject}</span>
              <span className="cfa-day-plan-detail">{item.detail}</span>
            </div>

            {/* Duration */}
            <div className="cfa-day-plan-col-time">
              <span>{item.duration}</span>
            </div>

            {/* 3-Dots Action */}
            <div className="cfa-day-plan-col-action">
              <button
                type="button"
                className="cfa-icon-btn"
                aria-label="More day options"
              >
                <MoreVertical size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
