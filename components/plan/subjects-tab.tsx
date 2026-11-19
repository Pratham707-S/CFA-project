"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { BookOpen } from "@/components/ui/icons";

interface SubjectPlan {
  name: string;
  weight: string;
  completedPercent: number;
  totalModules: number;
  completedModules: number;
  color: string;
}

export function SubjectsTab() {
  const subjects: SubjectPlan[] = [
    { name: "Ethical & Professional Standards", weight: "15-20%", completedPercent: 40, totalModules: 5, completedModules: 2, color: "#0d7b5f" },
    { name: "Quantitative Methods", weight: "6-9%", completedPercent: 85, totalModules: 7, completedModules: 6, color: "#2563eb" },
    { name: "Economics", weight: "6-9%", completedPercent: 50, totalModules: 6, completedModules: 3, color: "#f59e0b" },
    { name: "Financial Statement Analysis", weight: "11-14%", completedPercent: 78, totalModules: 12, completedModules: 9, color: "#0d7b5f" },
    { name: "Corporate Issuers", weight: "6-9%", completedPercent: 30, totalModules: 6, completedModules: 2, color: "#8b5cf6" },
    { name: "Equity Investments", weight: "11-14%", completedPercent: 25, totalModules: 8, completedModules: 2, color: "#1e40af" },
    { name: "Fixed Income", weight: "11-14%", completedPercent: 20, totalModules: 9, completedModules: 2, color: "#ea580c" },
    { name: "Derivatives", weight: "5-8%", completedPercent: 10, totalModules: 5, completedModules: 1, color: "#ec4899" },
    { name: "Alternative Investments", weight: "7-10%", completedPercent: 0, totalModules: 4, completedModules: 0, color: "#64748b" },
    { name: "Portfolio Management", weight: "8-11%", completedPercent: 0, totalModules: 6, completedModules: 0, color: "#64748b" },
  ];

  return (
    <div className="cfa-tab-content-container">
      <Card className="cfa-plan-card">
        <div className="cfa-card-header-row">
          <div>
            <h2 className="cfa-card-heading">CFA Level I Curriculum & Subject Progress</h2>
            <p className="cfa-card-subheading">
              Track syllabus completion and official exam weightages across all 10 topics.
            </p>
          </div>
        </div>

        <div className="cfa-subjects-grid">
          {subjects.map((sub) => (
            <div key={sub.name} className="cfa-subject-card-box">
              <div className="cfa-subject-header">
                <div className="cfa-subject-title-col">
                  <span className="cfa-subject-name">{sub.name}</span>
                  <span className="cfa-subject-weight">Weight: {sub.weight}</span>
                </div>
                <span className="cfa-subject-percent">{sub.completedPercent}%</span>
              </div>

              <div className="cfa-subject-bar-track">
                <div
                  className="cfa-subject-bar-fill"
                  style={{
                    width: `${sub.completedPercent}%`,
                    backgroundColor: sub.color,
                  }}
                />
              </div>

              <div className="cfa-subject-footer">
                <span className="cfa-subject-modules">
                  <BookOpen size={13} /> {sub.completedModules} of {sub.totalModules} modules finished
                </span>
                <span className="cfa-subject-status">
                  {sub.completedPercent >= 75 ? "Mastered" : sub.completedPercent > 0 ? "In Progress" : "Not Started"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
