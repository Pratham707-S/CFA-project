"use client";

import React, { useState } from "react";
import { ResourceItem, RelatedTopicItem } from "./types";
import {
  Download,
  FileText,
  ChevronRight,
  Check,
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
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadSuccessId, setDownloadSuccessId] = useState<string | null>(null);

  const handleDownload = (res: ResourceItem) => {
    setDownloadingId(res.id);
    setTimeout(() => {
      setDownloadingId(null);
      setDownloadSuccessId(res.id);

      // Create a dummy text file to download for demonstration
      const blob = new Blob(
        [
          `CFA Prep - ${res.title}\nTopic: Time Value of Money\nSubtitle: ${res.subtitle}\n\nKey Formulas and Review Notes included.`,
        ],
        { type: "text/plain;charset=utf-8" }
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${res.title.toLowerCase().replace(/\s+/g, "_")}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setTimeout(() => {
        setDownloadSuccessId(null);
      }, 2500);
    }, 600);
  };

  return (
    <div className="cfa-lesson-right-column">
      {/* Card 1: Lesson Resources */}
      <div className="cfa-resources-card">
        <h3 className="cfa-resources-card-title">Lesson Resources</h3>

        <div className="cfa-resources-list">
          {resources.map((res) => {
            const isSuccess = downloadSuccessId === res.id;
            const isDownloading = downloadingId === res.id;

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

                <button
                  type="button"
                  className={`cfa-resource-download-btn ${isSuccess ? "downloaded" : ""}`}
                  onClick={() => handleDownload(res)}
                  disabled={isDownloading}
                  title={`Download ${res.title}`}
                  aria-label={`Download ${res.title}`}
                >
                  {isSuccess ? (
                    <Check size={16} color="#0d7b5f" strokeWidth={2.5} />
                  ) : isDownloading ? (
                    <span className="cfa-resource-spinner" />
                  ) : (
                    <Download size={16} />
                  )}
                </button>
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
