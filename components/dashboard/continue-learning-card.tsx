"use client";

import React from "react";
import Image from "next/image";
import { BookOpen } from "@/components/ui/icons";
import { Card } from "@/components/ui/card";

interface ContinueLearningCardProps {
  subject?: string;
  lessonTitle?: string;
  progressPercent?: number;
  description?: string;
  thumbnailUrl?: string;
  onContinueLesson?: () => void;
  onGoToLearn?: () => void;
}

export function ContinueLearningCard({
  subject = "Financial Statement Analysis",
  lessonTitle = "Inventory Valuation",
  progressPercent = 82,
  description = "Understand the different inventory valuation methods, lower of cost and net realizable value…",
  thumbnailUrl = "/inventory-blocks.png",
  onContinueLesson,
  onGoToLearn,
}: ContinueLearningCardProps) {
  return (
    <Card className="cfa-continue-learning-card">
      {/* Header */}
      <div className="cfa-card-header-row">
        <div className="cfa-header-title-group">
          <div className="cfa-icon-badge green">
            <BookOpen size={18} />
          </div>
          <h2 className="cfa-card-heading">Continue Learning</h2>
        </div>
        <button
          type="button"
          className="cfa-card-action-link"
          onClick={onGoToLearn}
        >
          Go to Learn →
        </button>
      </div>

      {/* Content */}
      <div className="cfa-continue-learning-body">
        {/* Lesson Thumbnail */}
        <div className="cfa-lesson-thumbnail-wrapper">
          <Image
            src={thumbnailUrl}
            alt="3D isometric blocks for Inventory Valuation"
            className="cfa-lesson-thumbnail-img"
            width={240}
            height={160}
          />
        </div>

        {/* Lesson Details */}
        <div className="cfa-lesson-details">
          <span className="cfa-lesson-subject">{subject}</span>
          <h3 className="cfa-lesson-title">{lessonTitle}</h3>

          {/* Progress bar with percentage */}
          <div className="cfa-lesson-progress-row">
            <div className="cfa-lesson-progress-track">
              <div
                className="cfa-lesson-progress-fill"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="cfa-lesson-progress-val">{progressPercent}%</span>
          </div>

          <p className="cfa-lesson-desc">{description}</p>
        </div>
      </div>

      {/* Continue Lesson Button */}
      <button
        type="button"
        className="cfa-btn-primary-large cfa-lesson-btn"
        onClick={onContinueLesson}
      >
        <span>Continue Lesson</span>
        <span className="cfa-btn-arrow">→</span>
      </button>
    </Card>
  );
}
