"use client";

import React from "react";
import { Check } from "@/components/ui/icons";
import { Card } from "@/components/ui/card";

export interface RoadmapPhase {
  id: number;
  title: string;
  dateRange: string;
  status: "completed" | "current" | "upcoming";
  items: string[];
}

interface CfaRoadmapProps {
  phases?: RoadmapPhase[];
}

export function CfaRoadmap({
  phases = [
    {
      id: 1,
      title: "1. Foundation",
      dateRange: "Jan 2026 – Mar 2026",
      status: "completed",
      items: [
        "Study strategy",
        "Core concepts",
        "Build base knowledge",
      ],
    },
    {
      id: 2,
      title: "2. Core Learning",
      dateRange: "Mar 2026 – Jun 2026",
      status: "current",
      items: [
        "Complete all subjects",
        "Learn concepts in depth",
        "Make notes and flashcards",
      ],
    },
    {
      id: 3,
      title: "3. Practice & Mocks",
      dateRange: "Jun 2026 – Aug 2026",
      status: "upcoming",
      items: [
        "Topic-wise practice",
        "Full-length mocks",
        "Analyze mistakes",
      ],
    },
    {
      id: 4,
      title: "4. Final Revision",
      dateRange: "Aug 2026",
      status: "upcoming",
      items: [
        "Revise notes & formulas",
        "Focus on weak areas",
        "Take final mocks",
      ],
    },
  ],
}: CfaRoadmapProps) {
  return (
    <Card className="cfa-plan-card cfa-roadmap-card">
      <div className="cfa-card-header-row">
        <h2 className="cfa-card-heading">Your CFA Roadmap</h2>
      </div>

      {/* Horizontal Stepper Progress Line */}
      <div className="cfa-roadmap-timeline-wrapper">
        <div className="cfa-roadmap-track-line">
          {/* Active green portion up to current step (from 12.5% to 37.5%) */}
          <div className="cfa-roadmap-track-fill" style={{ width: "34%" }} />
        </div>

        {/* 4 Stage Columns */}
        <div className="cfa-roadmap-grid">
          {phases.map((phase) => {
            const isCompleted = phase.status === "completed";
            const isCurrent = phase.status === "current";
            const isUpcoming = phase.status === "upcoming";

            return (
              <div
                key={phase.id}
                className={`cfa-roadmap-col ${phase.status}`}
              >
                {/* Step Node Circle */}
                <div className="cfa-roadmap-node-container">
                  <div className={`cfa-roadmap-node ${phase.status}`}>
                    {isCompleted && <Check size={14} className="cfa-node-check" />}
                    {isCurrent && <div className="cfa-node-current-dot" />}
                  </div>
                </div>

                {/* Title & Date */}
                <div className="cfa-roadmap-col-header">
                  <div className="cfa-roadmap-title-row">
                    <span className="cfa-roadmap-phase-title">{phase.title}</span>
                    {isCurrent && (
                      <span className="cfa-roadmap-current-badge">CURRENT</span>
                    )}
                  </div>
                  <span className="cfa-roadmap-phase-dates">
                    {phase.dateRange}
                  </span>
                </div>

                {/* Objectives Card Box */}
                <div className={`cfa-roadmap-box ${phase.status}`}>
                  <ul className="cfa-roadmap-items-list">
                    {phase.items.map((item, idx) => (
                      <li key={idx} className="cfa-roadmap-item">
                        <span className={`cfa-item-bullet ${phase.status}`}>
                          {isCompleted || isCurrent ? "✓" : "○"}
                        </span>
                        <span className="cfa-item-text">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
