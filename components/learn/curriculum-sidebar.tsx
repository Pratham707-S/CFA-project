"use client";

import React, { useState } from "react";
import { Subject } from "./types";
import {
  ChevronUp,
  ChevronDown,
  ChevronRight,
  Play,
  Check,
  Sigma,
  Building2,
  FileText,
  TrendingUp,
  Landmark,
  RefreshCw,
  Gem,
  PieChart,
  ShieldCheck,
} from "@/components/ui/icons";

interface CurriculumSidebarProps {
  subjects: Subject[];
  selectedSubjectId: string;
  selectedTopicId: string;
  onSelectTopic: (subjectId: string, topicId: string) => void;
  completedTopicIds?: Set<string>;
}

export function CurriculumSidebar({
  subjects,
  selectedSubjectId,
  selectedTopicId,
  onSelectTopic,
  completedTopicIds = new Set(),
}: CurriculumSidebarProps) {
  // By default, expand the active subject
  const [expandedSubjects, setExpandedSubjects] = useState<Record<string, boolean>>({
    [selectedSubjectId]: true,
  });
  const [curriculumCollapsed, setCurriculumCollapsed] = useState(false);

  const toggleSubject = (subjectId: string) => {
    setExpandedSubjects((prev) => ({
      ...prev,
      [subjectId]: !prev[subjectId],
    }));
  };

  const getSubjectBadge = (iconType: Subject["iconType"]) => {
    switch (iconType) {
      case "quant":
        return {
          icon: <Sigma size={15} strokeWidth={2.2} />,
          bg: "#eff6ff",
          color: "#2563eb",
          border: "#bfdbfe",
        };
      case "econ":
        return {
          icon: <Landmark size={15} strokeWidth={2.2} />,
          bg: "#fff7ed",
          color: "#ea580c",
          border: "#fed7aa",
        };
      case "fsa":
        return {
          icon: <FileText size={15} strokeWidth={2.2} />,
          bg: "#fef2f2",
          color: "#dc2626",
          border: "#fecaca",
        };
      case "corp":
        return {
          icon: <Building2 size={15} strokeWidth={2.2} />,
          bg: "#fff7ed",
          color: "#c2410c",
          border: "#ffedd5",
        };
      case "equity":
        return {
          icon: <TrendingUp size={15} strokeWidth={2.2} />,
          bg: "#eff6ff",
          color: "#1d4ed8",
          border: "#dbeafe",
        };
      case "fixed":
        return {
          icon: <Landmark size={15} strokeWidth={2.2} />,
          bg: "#fefce8",
          color: "#b45309",
          border: "#fef08a",
        };
      case "deriv":
        return {
          icon: <RefreshCw size={15} strokeWidth={2.2} />,
          bg: "#f0fdfa",
          color: "#0f766e",
          border: "#ccfbf1",
        };
      case "alt":
        return {
          icon: <Gem size={15} strokeWidth={2.2} />,
          bg: "#faf5ff",
          color: "#7e22ce",
          border: "#f3e8ff",
        };
      case "port":
        return {
          icon: <PieChart size={15} strokeWidth={2.2} />,
          bg: "#fff1f2",
          color: "#e11d48",
          border: "#ffe4e6",
        };
      case "ethics":
        return {
          icon: <ShieldCheck size={15} strokeWidth={2.2} />,
          bg: "#fefce8",
          color: "#ca8a04",
          border: "#fef08a",
        };
      default:
        return {
          icon: <FileText size={15} strokeWidth={2.2} />,
          bg: "#f1f5f9",
          color: "#475569",
          border: "#e2e8f0",
        };
    }
  };

  return (
    <aside className="cfa-curriculum-panel">
      {/* Header */}
      <div className="cfa-curriculum-header">
        <span className="cfa-curriculum-title">Curriculum</span>
        <button
          type="button"
          className="cfa-curriculum-collapse-btn"
          onClick={() => setCurriculumCollapsed(!curriculumCollapsed)}
          aria-label="Toggle curriculum panel"
        >
          {curriculumCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
        </button>
      </div>

      {!curriculumCollapsed && (
        <div className="cfa-curriculum-list">
          {subjects.map((subject) => {
            const badge = getSubjectBadge(subject.iconType);
            const isExpanded = !!expandedSubjects[subject.id];
            const isSelectedSubject = subject.id === selectedSubjectId;

            return (
              <div key={subject.id} className="cfa-curriculum-subject-group">
                {/* Subject Row */}
                <button
                  type="button"
                  className={`cfa-curriculum-subject-btn ${
                    isSelectedSubject ? "selected-subject" : ""
                  }`}
                  onClick={() => toggleSubject(subject.id)}
                >
                  <div
                    className="cfa-curriculum-subject-icon"
                    style={{
                      backgroundColor: badge.bg,
                      color: badge.color,
                      borderColor: badge.border,
                    }}
                  >
                    {badge.icon}
                  </div>

                  <div className="cfa-curriculum-subject-info">
                    <span className="cfa-curriculum-subject-name">{subject.name}</span>
                    <span
                      className={`cfa-curriculum-subject-count ${
                        subject.completedTopics > 0 ? "has-progress" : ""
                      }`}
                    >
                      {subject.completedTopics} / {subject.totalTopics} topics
                    </span>
                  </div>

                  <span className="cfa-curriculum-subject-arrow">
                    {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </span>
                </button>

                {/* Topics / Lessons Accordion List */}
                {isExpanded && subject.topics && subject.topics.length > 0 && (
                  <div className="cfa-curriculum-topics-list">
                    {subject.topics.map((topic) => {
                      const isActive =
                        isSelectedSubject && topic.id === selectedTopicId;
                      const isCompleted =
                        completedTopicIds.has(topic.id) || !!topic.completed;

                      return (
                        <button
                          key={topic.id}
                          type="button"
                          className={`cfa-curriculum-topic-item ${isActive ? "active-topic" : ""}`}
                          onClick={() => onSelectTopic(subject.id, topic.id)}
                        >
                          {/* Indicator Icon */}
                          <div className="cfa-curriculum-topic-indicator">
                            {isActive ? (
                              <div className="cfa-curriculum-active-play-circle">
                                <Play size={10} fill="#ffffff" color="#ffffff" />
                              </div>
                            ) : isCompleted ? (
                              <div className="cfa-curriculum-check-circle">
                                <Check size={11} strokeWidth={2.5} color="#0d7b5f" />
                              </div>
                            ) : (
                              <div className="cfa-curriculum-empty-circle" />
                            )}
                          </div>

                          <span className="cfa-curriculum-topic-title">
                            {topic.title}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </aside>
  );
}
