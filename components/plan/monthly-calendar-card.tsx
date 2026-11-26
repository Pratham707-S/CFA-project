"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "@/components/ui/icons";
import { Card } from "@/components/ui/card";

interface CalendarDay {
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday?: boolean;
  dots?: string[]; // array of subject colors e.g. ["#0d7b5f", "#2563eb"]
}

export function MonthlyCalendarCard() {
  const [currentMonth] = useState("March 2025");

  // Subject Legend Items
  const legendItems = [
    { name: "Quant", color: "#0d7b5f" },
    { name: "FSA", color: "#2563eb" },
    { name: "Economics", color: "#f59e0b" },
    { name: "Fixed Income", color: "#8b5cf6" },
    { name: "Equity", color: "#1e40af" },
    { name: "Derivatives", color: "#ec4899" },
    { name: "Ethics", color: "#f472b6" },
    { name: "Revision/Mock", color: "#94a3b8" },
  ];

  // March 2025 starts on Saturday. Previous month days: Feb 24-28
  const days: CalendarDay[] = [
    // Week 1
    { dayNumber: 24, isCurrentMonth: false },
    { dayNumber: 25, isCurrentMonth: false },
    { dayNumber: 26, isCurrentMonth: false },
    { dayNumber: 27, isCurrentMonth: false },
    { dayNumber: 28, isCurrentMonth: false },
    { dayNumber: 1, isCurrentMonth: true },
    { dayNumber: 2, isCurrentMonth: true },
    // Week 2
    { dayNumber: 3, isCurrentMonth: true, dots: ["#0d7b5f"] },
    { dayNumber: 4, isCurrentMonth: true, dots: ["#0d7b5f", "#f59e0b"] },
    { dayNumber: 5, isCurrentMonth: true, dots: ["#2563eb"] },
    { dayNumber: 6, isCurrentMonth: true, dots: ["#8b5cf6"] },
    { dayNumber: 7, isCurrentMonth: true, dots: ["#2563eb"] },
    { dayNumber: 8, isCurrentMonth: true },
    { dayNumber: 9, isCurrentMonth: true },
    // Week 3
    { dayNumber: 10, isCurrentMonth: true, dots: ["#0d7b5f"] },
    { dayNumber: 11, isCurrentMonth: true, dots: ["#2563eb"] },
    { dayNumber: 12, isCurrentMonth: true, dots: ["#f59e0b"] },
    { dayNumber: 13, isCurrentMonth: true, dots: ["#8b5cf6"] },
    { dayNumber: 14, isCurrentMonth: true, dots: ["#1e40af"] },
    { dayNumber: 15, isCurrentMonth: true },
    { dayNumber: 16, isCurrentMonth: true },
    // Week 4
    { dayNumber: 17, isCurrentMonth: true, dots: ["#2563eb"] },
    { dayNumber: 18, isCurrentMonth: true, dots: ["#f59e0b"] },
    { dayNumber: 19, isCurrentMonth: true, dots: ["#ec4899"] },
    { dayNumber: 20, isCurrentMonth: true, dots: ["#f472b6"] },
    { dayNumber: 21, isCurrentMonth: true, dots: ["#94a3b8"] },
    { dayNumber: 22, isCurrentMonth: true },
    { dayNumber: 23, isCurrentMonth: true },
    // Week 5
    { dayNumber: 24, isCurrentMonth: true, isToday: true, dots: ["#0d7b5f"] },
    { dayNumber: 25, isCurrentMonth: true, dots: ["#2563eb"] },
    { dayNumber: 26, isCurrentMonth: true, dots: ["#f59e0b"] },
    { dayNumber: 27, isCurrentMonth: true, dots: ["#8b5cf6"] },
    { dayNumber: 28, isCurrentMonth: true, dots: ["#f472b6"] },
    { dayNumber: 29, isCurrentMonth: true },
    { dayNumber: 30, isCurrentMonth: true },
    // Week 6
    { dayNumber: 31, isCurrentMonth: true, dots: ["#94a3b8"] },
    { dayNumber: 1, isCurrentMonth: false },
    { dayNumber: 2, isCurrentMonth: false },
    { dayNumber: 3, isCurrentMonth: false },
    { dayNumber: 4, isCurrentMonth: false },
    { dayNumber: 5, isCurrentMonth: false },
    { dayNumber: 6, isCurrentMonth: false },
  ];

  const weekHeaders = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <Card className="cfa-plan-card cfa-monthly-calendar-card">
      {/* Header */}
      <div className="cfa-card-header-row">
        <h2 className="cfa-card-heading">Monthly Calendar</h2>

        <div className="cfa-card-pagination-group">
          <span className="cfa-pagination-date-label">{currentMonth}</span>
          <div className="cfa-pagination-arrows">
            <button
              type="button"
              className="cfa-pagination-arrow-btn"
              aria-label="Previous month"
            >
              <ChevronLeft size={15} />
            </button>
            <button
              type="button"
              className="cfa-pagination-arrow-btn"
              aria-label="Next month"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="cfa-calendar-table-container">
        {/* Day-of-week header */}
        <div className="cfa-calendar-weekdays-row">
          {weekHeaders.map((day) => (
            <div key={day} className="cfa-calendar-weekday-col">
              {day}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="cfa-calendar-days-grid">
          {days.map((day, idx) => (
            <div
              key={idx}
              className={`cfa-calendar-day-cell ${
                !day.isCurrentMonth ? "other-month" : ""
              } ${day.isToday ? "today-cell" : ""}`}
            >
              <span
                className={`cfa-calendar-day-number ${
                  day.isToday ? "today-badge" : ""
                }`}
              >
                {day.dayNumber}
              </span>

              {/* Dots row */}
              <div className="cfa-calendar-dots-row">
                {day.dots?.map((color, dotIdx) => (
                  <span
                    key={dotIdx}
                    className="cfa-calendar-dot"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Color Legend at Bottom */}
      <div className="cfa-calendar-legend">
        {legendItems.map((item) => (
          <div key={item.name} className="cfa-legend-item">
            <span
              className="cfa-legend-dot"
              style={{ backgroundColor: item.color }}
            />
            <span className="cfa-legend-name">{item.name}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
