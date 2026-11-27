"use client";

import React from "react";
import { ResourceItem, RelatedTopicItem } from "./types";
import {
  FileText,
  ChevronRight,
} from "@/components/ui/icons";

interface LessonResourcesProps {
  resources: ResourceItem[];
  relatedTopics: RelatedTopicItem[];
  onSelectRelatedTopic?: (topicTitle: string) => void;
}

export function LessonResources({
  resources,
  relatedTopics,
  onSelectRelatedTopic,
}: LessonResourcesProps) {
  return (
    <div className="cfa-lesson-right-column">
      {/* Card 1: Lesson Resources */}
      <div className="cfa-resources-card">
        <h3 className="cfa-resources-card-title">Lesson Resources</h3>

        <div className="cfa-resources-list">
          {resources.length === 0 && <p role="status">No verified resources are available for this lesson yet.</p>}
          {resources.map((res) => {
            return (
              <div key={res.id} className="cfa-resource-item">
                <div
                  className="cfa-resource-icon-badge"
                  style={{
                    backgroundColor: `${res.color}15`,
                    color: res.color,
                  }}
                >
                  <FileText size={18} />
                </div>

                <div className="cfa-resource-info">
                  <span className="cfa-resource-title">{res.title}</span>
                  <span className="cfa-resource-subtitle">{res.subtitle}</span>
                </div>

                {res.url ? <a className="cfa-resource-download-btn" href={res.url} target="_blank" rel="noreferrer" aria-label={`Open ${res.title}`}><ChevronRight size={16} /></a> : <span className="cfa-resource-download-btn" aria-hidden="true"><FileText size={16} /></span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Card 2: Related Topics */}
      <div className="cfa-related-topics-card">
        <h3 className="cfa-resources-card-title">Related Topics</h3>

        <div className="cfa-related-topics-list">
          {relatedTopics.map((rel) => (
            <button
              key={rel.id}
              type="button"
              className="cfa-related-topic-item"
              onClick={() => onSelectRelatedTopic?.(rel.title)}
            >
              <div className="cfa-related-topic-left">
                <span className="cfa-related-topic-icon">
                  <FileText size={15} color="#64748b" />
                </span>
                <span className="cfa-related-topic-title">{rel.title}</span>
              </div>
              <ChevronRight size={14} className="cfa-related-topic-chevron" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
