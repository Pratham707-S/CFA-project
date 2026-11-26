"use client";

import React from "react";
import { VideoPlayer } from "./video-player";
import {
  ShieldCheck,
  FileText,
  Lightbulb,
  ChevronLeft,
  ChevronRight,
  Check,
} from "@/components/ui/icons";

interface LessonOverviewProps {
  lessonTitle: string;
  duration?: string;
  youtubeVideoId?: string;
  keyConcepts: string[];
  quickNote: string;
  isCompleted?: boolean;
  onToggleComplete?: () => void;
  onPrevLesson?: () => void;
  onNextLesson?: () => void;
}

export function LessonOverview({
  lessonTitle,
  duration = "18 min",
  youtubeVideoId,
  keyConcepts,
  quickNote,
  isCompleted = false,
  onToggleComplete,
  onPrevLesson,
  onNextLesson,
}: LessonOverviewProps) {
  return (
    <div className="cfa-lesson-overview-content">
      {/* 1. Video Player */}
      <VideoPlayer title={lessonTitle} duration={duration} youtubeVideoId={youtubeVideoId} />

      {/* 2. Key Concepts Card */}
      <div className="cfa-learn-concept-card">
        <div className="cfa-learn-card-heading-row">
          <span className="cfa-learn-card-icon-badge green">
            <ShieldCheck size={16} color="#0d7b5f" />
          </span>
          <h3 className="cfa-learn-card-title">Key Concepts</h3>
        </div>

        <ul className="cfa-learn-concepts-list">
          {keyConcepts.map((concept, index) => (
            <li key={index} className="cfa-learn-concept-item">
              <span className="cfa-learn-bullet-dot" />
              <span>{concept}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* 3. Quick Notes Card */}
      <div className="cfa-learn-quick-notes-card">
        <div className="cfa-learn-card-heading-row">
          <span className="cfa-learn-card-icon-badge green">
            <FileText size={16} color="#0d7b5f" />
          </span>
          <h3 className="cfa-learn-card-title">Quick Notes</h3>
        </div>

        <div className="cfa-learn-quick-notes-banner">
          <div className="cfa-learn-quick-notes-bulb">
            <Lightbulb size={20} color="#d97706" />
          </div>
          <p className="cfa-learn-quick-notes-text">{quickNote}</p>
        </div>
      </div>

      {/* 4. Bottom Lesson Navigation */}
      <div className="cfa-learn-bottom-nav">
        <button
          type="button"
          className="cfa-learn-nav-btn prev"
          onClick={onPrevLesson}
        >
          <ChevronLeft size={16} />
          <span>Previous Lesson</span>
        </button>

        <div className="cfa-learn-nav-center-actions">
          <button
            type="button"
            className={`cfa-learn-complete-btn-bottom ${isCompleted ? "completed" : ""}`}
            onClick={onToggleComplete}
          >
            <Check size={15} strokeWidth={2.5} />
            <span>{isCompleted ? "Completed" : "Mark as Complete"}</span>
          </button>
        </div>

        <button
          type="button"
          className="cfa-learn-nav-btn next"
          onClick={onNextLesson}
        >
          <span>Next Lesson</span>
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
