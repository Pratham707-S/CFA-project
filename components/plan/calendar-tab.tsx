"use client";

import React from "react";
import { MonthlyCalendarCard } from "./monthly-calendar-card";
import { Card } from "@/components/ui/card";
import { Target, Clock } from "@/components/ui/icons";

export function CalendarTab() {
  const milestones = [
    { date: "March 31, 2025", title: "Complete Quantitative Methods & FSA", status: "Upcoming", badgeColor: "#0d7b5f" },
    { date: "April 30, 2025", title: "Complete Economics & Corporate Issuers", status: "Planned", badgeColor: "#2563eb" },
    { date: "May 31, 2025", title: "Complete Equity & Fixed Income", status: "Planned", badgeColor: "#8b5cf6" },
    { date: "June 30, 2025", title: "Complete Derivatives, Alt Inv & Ethics", status: "Planned", badgeColor: "#f59e0b" },
    { date: "July 15, 2025", title: "First Full-Length Mock Exam (Mock 1)", status: "Milestone", badgeColor: "#ea580c" },
    { date: "August 26, 2026", title: "Official CFA Level I Exam Day", status: "Exam", badgeColor: "#ef4444" },
  ];

  return (
    <div className="cfa-tab-content-container">
      <div className="cfa-calendar-tab-grid">
        <MonthlyCalendarCard />

        <Card className="cfa-plan-card cfa-milestones-card">
          <div className="cfa-card-header-row">
            <h2 className="cfa-card-heading">Key Preparation Milestones</h2>
          </div>

          <div className="cfa-milestones-list">
            {milestones.map((m, idx) => (
              <div key={idx} className="cfa-milestone-item">
                <div
                  className="cfa-milestone-indicator"
                  style={{ backgroundColor: m.badgeColor }}
                />
                <div className="cfa-milestone-info">
                  <span className="cfa-milestone-title">{m.title}</span>
                  <div className="cfa-milestone-meta">
                    <span className="cfa-milestone-date">
                      <Clock size={12} /> {m.date}
                    </span>
                    <span
                      className="cfa-milestone-tag"
                      style={{ color: m.badgeColor }}
                    >
                      {m.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
