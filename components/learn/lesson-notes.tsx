"use client";

import React, { useState, useEffect } from "react";
import { Check, Pencil, FileText } from "@/components/ui/icons";

interface LessonNotesProps {
  lessonId: string;
}

export function LessonNotes({ lessonId }: LessonNotesProps) {
  const defaultNotes = `• Time Value of Money Notes:
- Remember that higher compounding frequency increases the EAR.
- Annuity due: payments at BEGINNING of period, multiply by (1 + r).
- Perpetuity formula: PV = PMT / r (for constant PMT).
- For growing perpetuity: PV = PMT_1 / (r - g). Make sure r > g.
- BA II Plus: 2nd + BGN to toggle annuity mode.`;

  const [notes, setNotes] = useState<string>(defaultNotes);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving">("saved");

  useEffect(() => {
    try {
      const stored = localStorage.getItem(`cfa_notes_${lessonId}`);
      if (stored) {
        setNotes(stored);
      }
    } catch {
      // ignore
    }
  }, [lessonId]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setNotes(val);
    setSaveStatus("saving");
    try {
      localStorage.setItem(`cfa_notes_${lessonId}`, val);
      setTimeout(() => setSaveStatus("saved"), 400);
    } catch {
      setSaveStatus("saved");
    }
  };

  const insertSnippet = (snippet: string) => {
    const updated = notes + "\n" + snippet;
    setNotes(updated);
    try {
      localStorage.setItem(`cfa_notes_${lessonId}`, updated);
    } catch {
      // ignore
    }
  };

  return (
    <div className="cfa-lesson-tab-body">
      <div className="cfa-learn-tab-intro flex-between">
        <div>
          <h3 className="cfa-learn-tab-title">Personal Study Notes</h3>
          <p className="cfa-learn-tab-desc">
            Your private notes for this lesson. Automatically saved in your browser.
          </p>
        </div>

        <div className="cfa-notes-save-badge">
          {saveStatus === "saved" ? (
            <>
              <Check size={13} color="#0d7b5f" strokeWidth={2.5} />
              <span>Saved</span>
            </>
          ) : (
            <>
              <span className="cfa-saving-spinner" />
              <span>Saving…</span>
            </>
          )}
        </div>
      </div>

      {/* Snippet insertion pills */}
      <div className="cfa-notes-snippets-row">
        <span className="cfa-notes-snippets-label">Quick Inserts:</span>
        <button
          type="button"
          className="cfa-notes-insert-pill"
          onClick={() => insertSnippet("• [Formula]: ")}
        >
          + Formula
        </button>
        <button
          type="button"
          className="cfa-notes-insert-pill"
          onClick={() => insertSnippet("• [Exam Tip]: ")}
        >
          + Exam Tip
        </button>
        <button
          type="button"
          className="cfa-notes-insert-pill"
          onClick={() => insertSnippet("• [Mistake to Avoid]: ")}
        >
          + Mistake to Avoid
        </button>
      </div>

      {/* Textarea */}
      <div className="cfa-notes-editor-card">
        <textarea
          className="cfa-notes-textarea"
          value={notes}
          onChange={handleChange}
          placeholder="Write your study notes, insights, and formula notes here..."
          rows={12}
        />
      </div>
    </div>
  );
}
