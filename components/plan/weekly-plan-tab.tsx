"use client";

import React, { useState } from "react";
import { Check, Circle, Clock, Target, CalendarDays } from "@/components/ui/icons";
import { Card } from "@/components/ui/card";

interface WeeklyTask {
  id: string;
  day: string;
  subject: string;
  title: string;
  hours: number;
  completed: boolean;
  type: "Concept" | "Practice" | "Revision";
}

export function WeeklyPlanTab() {
  const [tasks, setTasks] = useState<WeeklyTask[]>([
    { id: "1", day: "Monday", subject: "Quantitative Methods", title: "Time Value of Money - Compounding & Discounting", hours: 2, completed: true, type: "Concept" },
    { id: "2", day: "Monday", subject: "Quantitative Methods", title: "Practice: 25 TVM Problems", hours: 0.5, completed: true, type: "Practice" },
    { id: "3", day: "Tuesday", subject: "Financial Statement Analysis", title: "Financial Reporting Mechanics & Balance Sheet", hours: 2, completed: true, type: "Concept" },
    { id: "4", day: "Wednesday", subject: "Economics", title: "Aggregate Output, Prices & Economic Growth", hours: 2, completed: false, type: "Concept" },
    { id: "5", day: "Thursday", subject: "Fixed Income", title: "Fixed-Income Securities: Defining Elements", hours: 2, completed: false, type: "Concept" },
    { id: "6", day: "Friday", subject: "Ethics", title: "Code of Ethics & Professional Conduct Standards", hours: 2, completed: false, type: "Concept" },
    { id: "7", day: "Saturday", subject: "Mixed Review", title: "Weekly Topic Quiz: Quant + FSA (50 Questions)", hours: 2, completed: false, type: "Practice" },
    { id: "8", day: "Sunday", subject: "Revision", title: "Formula Sheet Review & Error Log Analysis", hours: 1, completed: false, type: "Revision" },
  ]);

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const completedCount = tasks.filter(t => t.completed).length;
  const totalHours = tasks.reduce((sum, t) => sum + t.hours, 0);
  const completedHours = tasks.filter(t => t.completed).reduce((sum, t) => sum + t.hours, 0);

  return (
    <div className="cfa-tab-content-container">
      {/* Summary Row */}
      <div className="cfa-weekly-summary-row">
        <Card className="cfa-tab-metric-card">
          <div className="cfa-tab-metric-header">
            <span className="cfa-metric-icon-badge"><Target size={18} /></span>
            <span className="cfa-metric-title">Tasks Completed</span>
          </div>
          <span className="cfa-tab-metric-num">{completedCount} / {tasks.length}</span>
          <span className="cfa-tab-metric-sub">{Math.round((completedCount / tasks.length) * 100)}% of week target</span>
        </Card>

        <Card className="cfa-tab-metric-card">
          <div className="cfa-tab-metric-header">
            <span className="cfa-metric-icon-badge"><Clock size={18} /></span>
            <span className="cfa-metric-title">Hours Studied</span>
          </div>
          <span className="cfa-tab-metric-num">{completedHours} / {totalHours} hrs</span>
          <span className="cfa-tab-metric-sub">Pace: on track for weekly goal</span>
        </Card>

        <Card className="cfa-tab-metric-card">
          <div className="cfa-tab-metric-header">
            <span className="cfa-metric-icon-badge"><CalendarDays size={18} /></span>
            <span className="cfa-metric-title">Remaining Days</span>
          </div>
          <span className="cfa-tab-metric-num">5 days left</span>
          <span className="cfa-tab-metric-sub">Week ending Sun, 30 Mar</span>
        </Card>
      </div>

      {/* Task List by Day */}
      <Card className="cfa-plan-card">
        <div className="cfa-card-header-row">
          <h2 className="cfa-card-heading">Detailed Weekly Schedule</h2>
          <span className="cfa-card-subheading">Click items to mark them complete</span>
        </div>

        <div className="cfa-weekly-tasks-table">
          {tasks.map(task => (
            <div
              key={task.id}
              className={`cfa-weekly-task-item ${task.completed ? "done" : ""}`}
              onClick={() => toggleTask(task.id)}
              role="button"
              tabIndex={0}
            >
              <div className="cfa-task-check-circle">
                {task.completed ? <Check size={14} /> : <Circle size={16} />}
              </div>

              <div className="cfa-task-day-badge">{task.day}</div>

              <div className="cfa-task-details-col">
                <span className="cfa-task-subject-tag">{task.subject}</span>
                <span className="cfa-task-main-title">{task.title}</span>
              </div>

              <span className={`cfa-task-type-tag ${task.type.toLowerCase()}`}>
                {task.type}
              </span>

              <span className="cfa-task-hours-badge">
                <Clock size={13} /> {task.hours} hrs
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
