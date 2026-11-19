"use client";

import React, { useState } from "react";
import {
  Target,
  Clock,
  MoreVertical,
  CheckCircle2,
  Circle,
  ChevronRight,
  CalendarDays,
  Sliders,
  SlidersHorizontal,
  RotateCw,
  Settings,
} from "@/components/ui/icons";
import { Card } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuItem } from "@/components/ui/dropdown-menu";

interface TaskItem {
  id: string;
  title: string;
  description: string;
  duration?: string;
  completed: boolean;
}

interface StudyPlanCardProps {
  tasks?: TaskItem[];
  completedCount?: number;
  totalCount?: number;
  totalTimePlanned?: string;
  onContinuePlan?: () => void;
}

export function StudyPlanCard({
  tasks = [
    {
      id: "1",
      title: "Quantitative Methods – Time Value of Money",
      description: "Continue lesson • 3.2 TVM Applications",
      completed: true,
    },
    {
      id: "2",
      title: "Financial Statement Analysis – Inventory",
      description: "New lesson • 4.1 Inventory Valuation",
      completed: false,
    },
    {
      id: "3",
      title: "Practice Questions – Mixed Set",
      description: "20 MCQs • Quant + FSA",
      duration: "30 min",
      completed: false,
    },
    {
      id: "4",
      title: "Ethics – Standards I–III",
      description: "Quick revision • Key concepts",
      duration: "25 min",
      completed: false,
    },
  ],
  completedCount = 4,
  totalCount = 5,
  totalTimePlanned = "2h 10m",
  onContinuePlan,
}: StudyPlanCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [taskList, setTaskList] = useState(tasks);

  const toggleTask = (id: string) => {
    setTaskList((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  return (
    <Card className="cfa-study-plan-card">
      {/* Header */}
      <div className="cfa-card-header-row">
        <div className="cfa-header-title-group">
          <div className="cfa-icon-badge green">
            <Target size={20} />
          </div>
          <div className="cfa-header-titles">
            <h2 className="cfa-card-heading">Today&apos;s Study Plan</h2>
            <p className="cfa-card-subheading">
              {completedCount} of {totalCount} tasks • {totalTimePlanned} planned
            </p>
          </div>
        </div>

        <div className="cfa-header-actions-right">
          <div className="cfa-study-time-badge">
            <div className="cfa-time-badge-icon">
              <Clock size={18} />
            </div>
            <div className="cfa-time-badge-text">
              <span className="cfa-time-badge-hours">{totalTimePlanned}</span>
              <span className="cfa-time-badge-label">Planned study time</span>
            </div>
          </div>

          <div className="cfa-more-menu-container">
            <button
              type="button"
              className="cfa-icon-btn"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="More study plan options"
              aria-expanded={menuOpen}
            >
              <MoreVertical size={18} />
            </button>

            <DropdownMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)}>
              <DropdownMenuItem
                icon={<CalendarDays size={15} />}
                onClick={() => setMenuOpen(false)}
              >
                View My CFA Plan
              </DropdownMenuItem>
              <DropdownMenuItem
                icon={<Sliders size={15} />}
                onClick={() => setMenuOpen(false)}
              >
                Adjust Today&apos;s Plan
              </DropdownMenuItem>
              <DropdownMenuItem
                icon={<SlidersHorizontal size={15} />}
                onClick={() => setMenuOpen(false)}
              >
                Edit Preferences
              </DropdownMenuItem>
              <DropdownMenuItem
                icon={<RotateCw size={15} />}
                onClick={() => setMenuOpen(false)}
              >
                Regenerate Plan
              </DropdownMenuItem>
              <DropdownMenuItem
                icon={<Settings size={15} />}
                onClick={() => setMenuOpen(false)}
              >
                Plan Settings
              </DropdownMenuItem>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Task List */}
      <div className="cfa-task-list">
        {taskList.map((task) => (
          <div
            key={task.id}
            className={`cfa-task-row ${task.completed ? "completed" : ""}`}
            onClick={() => toggleTask(task.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                toggleTask(task.id);
              }
            }}
          >
            <div className="cfa-task-indicator">
              {task.completed ? (
                <CheckCircle2 size={20} className="cfa-task-check-icon" />
              ) : (
                <Circle size={20} className="cfa-task-circle-icon" />
              )}
            </div>

            <div className="cfa-task-info">
              <span className="cfa-task-title">{task.title}</span>
              <span className="cfa-task-desc">{task.description}</span>
            </div>

            {task.duration && (
              <div className="cfa-task-duration">
                <span>{task.duration}</span>
                <ChevronRight size={14} className="cfa-task-chevron" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Continue Today's Plan Button */}
      <button
        type="button"
        className="cfa-btn-primary-large"
        onClick={onContinuePlan}
      >
        <span>Continue Today&apos;s Plan</span>
        <span className="cfa-btn-arrow">→</span>
      </button>
    </Card>
  );
}
