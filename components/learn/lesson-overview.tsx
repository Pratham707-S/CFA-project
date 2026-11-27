"use client";

import React from "react";
import { VideoPlayer } from "./video-player";
import type { LessonContent } from "./content-types";
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
  videoEmbedUrl?: string;
  videoWatchUrl?: string;
  keyConcepts: string[];
  quickNote: string;
  content?: LessonContent | null;
  isCompleted?: boolean;
  onToggleComplete?: () => void;
  onPrevLesson?: () => void;
  onNextLesson?: () => void;
}

export function LessonOverview({
  lessonTitle,
  duration,
  youtubeVideoId,
  videoEmbedUrl,
  videoWatchUrl,
  keyConcepts,
  quickNote,
  content,
  isCompleted = false,
  onToggleComplete,
  onPrevLesson,
  onNextLesson,
}: LessonOverviewProps) {
  return (
    <div className="cfa-lesson-overview-content">
      {/* 1. Video Player */}
      <VideoPlayer title={lessonTitle} duration={duration} youtubeVideoId={youtubeVideoId} embedUrl={videoEmbedUrl} watchUrl={videoWatchUrl} />

      {/* 2. Key Concepts Card */}
      <div className="cfa-learn-concept-card">
        <div className="cfa-learn-card-heading-row">
          <span className="cfa-learn-card-icon-badge green">
            <ShieldCheck size={16} color="#0d7b5f" />
          </span>
          <h3 className="cfa-learn-card-title">Key Concepts</h3>
        </div>

        {keyConcepts.length > 0 ? <ul className="cfa-learn-concepts-list">
          {keyConcepts.map((concept) => (
            <li key={concept} className="cfa-learn-concept-item">
              <span className="cfa-learn-bullet-dot" />
              <span>{concept}</span>
            </li>
          ))}
        </ul> : <p>No learning objectives are available for this lesson.</p>}
      </div>

      {content && <div className="cfa-learn-concept-card">
        <h3 className="cfa-learn-card-title">Lesson explanation</h3>
        <p>{content.conceptIntroduction}</p>
        <p>{content.simpleExplanation}</p>
        {content.definitions.length > 0 && <dl>{content.definitions.map((item) => <div key={item.term}><dt><strong>{item.term}</strong></dt><dd>{item.definition}</dd></div>)}</dl>}
        {content.financialApplications.length > 0 && <><h4>Financial applications</h4><ul>{content.financialApplications.map((item) => <li key={item}>{item}</li>)}</ul></>}
        {content.commonMistakes.length > 0 && <><h4>Common mistakes</h4><ul>{content.commonMistakes.map((item) => <li key={item}>{item}</li>)}</ul></>}
        {content.curriculumOutcomeMappings.length > 0 && <><h4>Curriculum outcomes addressed</h4><ul>{content.curriculumOutcomeMappings.map((item) => <li key={item}>{item}</li>)}</ul></>}
        {content.sourceReferences.length > 0 && <><h4>Sources</h4><ul>{content.sourceReferences.map((item) => <li key={item.url}><a href={item.url} target="_blank" rel="noreferrer">{item.title}</a>: {item.scope}</li>)}</ul></>}
      </div>}

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
          <p className="cfa-learn-quick-notes-text">{content?.conceptIntroduction ?? quickNote}</p>
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
