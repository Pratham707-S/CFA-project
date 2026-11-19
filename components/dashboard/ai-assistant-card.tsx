"use client";

import React, { useState } from "react";
import {
  Bot,
  Send,
  BookOpen,
  ListChecks,
  Sparkles,
  CalendarDays,
} from "@/components/ui/icons";
import { Card } from "@/components/ui/card";

export function AiAssistantCard() {
  const [query, setQuery] = useState("");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setStatusMessage("CFA AI Assistant integration is currently in preview mode.");
  };

  const handleQuickAction = (actionName: string) => {
    setQuery(actionName);
    setStatusMessage(`Selected: "${actionName}". AI Tutor preview is ready.`);
  };

  return (
    <Card className="cfa-ai-card">
      {/* Header */}
      <div className="cfa-card-header-row ai-header">
        <div className="cfa-ai-header-left">
          <div className="cfa-icon-badge green ai-badge">
            <Bot size={22} />
          </div>
          <div>
            <h2 className="cfa-card-heading">Ask Your CFA AI</h2>
          </div>
        </div>
      </div>

      <p className="cfa-ai-description">
        Get instant explanations, solve doubts, or generate practice questions.
      </p>

      {/* Input Field */}
      <form onSubmit={handleSubmit} className="cfa-ai-input-form">
        <div className="cfa-ai-input-wrapper">
          <input
            type="text"
            className="cfa-ai-text-input"
            placeholder="Ask anything about CFA..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (statusMessage) setStatusMessage(null);
            }}
          />
          <button
            type="submit"
            className="cfa-ai-send-btn"
            aria-label="Send question to AI"
          >
            <Send size={15} />
          </button>
        </div>
      </form>

      {statusMessage && (
        <div className="cfa-ai-preview-notice" role="status">
          {statusMessage}
        </div>
      )}

      {/* 4 Quick Action Cards (2x2 Grid) */}
      <div className="cfa-ai-quick-actions-grid">
        <button
          type="button"
          className="cfa-ai-action-chip"
          onClick={() => handleQuickAction("Explain a concept")}
        >
          <BookOpen size={15} className="cfa-action-chip-icon" />
          <span className="cfa-action-chip-text">Explain a concept</span>
        </button>

        <button
          type="button"
          className="cfa-ai-action-chip"
          onClick={() => handleQuickAction("Solve a question")}
        >
          <ListChecks size={15} className="cfa-action-chip-icon" />
          <span className="cfa-action-chip-text">Solve a question</span>
        </button>

        <button
          type="button"
          className="cfa-ai-action-chip"
          onClick={() => handleQuickAction("Create a quiz")}
        >
          <Sparkles size={15} className="cfa-action-chip-icon" />
          <span className="cfa-action-chip-text">Create a quiz</span>
        </button>

        <button
          type="button"
          className="cfa-ai-action-chip"
          onClick={() => handleQuickAction("Make a study plan")}
        >
          <CalendarDays size={15} className="cfa-action-chip-icon" />
          <span className="cfa-action-chip-text">Make a study plan</span>
        </button>
      </div>
    </Card>
  );
}
