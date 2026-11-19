"use client";

import React from "react";
import { BarChart3, Lightbulb } from "@/components/ui/icons";
import { Card } from "@/components/ui/card";

interface WeakTopic {
  name: string;
  accuracy: number;
  colorVariant: "red" | "red-orange" | "amber" | "yellow";
}

interface WeakAreasCardProps {
  topics?: WeakTopic[];
  recommendationText?: string;
  onViewAll?: () => void;
}

export function WeakAreasCard({
  topics = [
    { name: "Deferred Tax", accuracy: 43, colorVariant: "red" },
    { name: "Probability", accuracy: 51, colorVariant: "red-orange" },
    { name: "Fixed Income", accuracy: 64, colorVariant: "amber" },
    { name: "Economics", accuracy: 68, colorVariant: "yellow" },
  ],
  recommendationText = "You made 7 mistakes in Deferred Tax this week. Consider revising this topic.",
  onViewAll,
}: WeakAreasCardProps) {
  return (
    <Card className="cfa-weak-areas-card">
      {/* Header */}
      <div className="cfa-card-header-row">
        <div className="cfa-header-title-group">
          <div className="cfa-icon-badge green">
            <BarChart3 size={18} />
          </div>
          <h2 className="cfa-card-heading">Your Weak Areas</h2>
        </div>
        <button
          type="button"
          className="cfa-card-action-link"
          onClick={onViewAll}
        >
          View All →
        </button>
      </div>

      {/* Weak Topics List */}
      <div className="cfa-weak-topics-list">
        {topics.map((topic) => (
          <div key={topic.name} className="cfa-weak-topic-row">
            <div className="cfa-weak-topic-left">
              <span className={`cfa-severity-badge ${topic.colorVariant}`}>
                !
              </span>
              <span className="cfa-weak-topic-name">{topic.name}</span>
            </div>

            <div className="cfa-weak-bar-track">
              <div
                className={`cfa-weak-bar-fill ${topic.colorVariant}`}
                style={{ width: `${topic.accuracy}%` }}
              />
            </div>

            <span className="cfa-weak-topic-pct">{topic.accuracy}%</span>
          </div>
        ))}
      </div>

      {/* Recommendation / Suggestion Box */}
      <div className="cfa-weak-recommendation-box">
        <div className="cfa-recommendation-icon">
          <Lightbulb size={17} />
        </div>
        <p className="cfa-recommendation-text">{recommendationText}</p>
      </div>
    </Card>
  );
}
