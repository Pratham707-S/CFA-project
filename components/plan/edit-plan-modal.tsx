"use client";

import React, { useState } from "react";

interface EditPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentHours: number;
  currentDays: number;
  currentExamDate: string;
  onSave: (data: { dailyHours: number; studyDays: number; examDate: string }) => void;
}

export function EditPlanModal({
  isOpen,
  onClose,
  currentHours,
  currentDays,
  currentExamDate,
  onSave,
}: EditPlanModalProps) {
  const [dailyHours, setDailyHours] = useState(currentHours);
  const [studyDays, setStudyDays] = useState(currentDays);
  const [examDate, setExamDate] = useState(currentExamDate);

  if (!isOpen) return null;

  return (
    <div className="cfa-modal-backdrop" onClick={onClose}>
      <div className="cfa-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="cfa-modal-header">
          <h3 className="cfa-modal-title">Edit Your Study Plan</h3>
          <button
            type="button"
            className="cfa-modal-close-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        <div className="cfa-modal-body">
          <div className="cfa-modal-field">
            <label className="cfa-modal-label">Target Exam Session</label>
            <select
              className="cfa-modal-select"
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
            >
              <option value="August 2026">August 2026 (124 days remaining)</option>
              <option value="November 2026">November 2026 (210 days remaining)</option>
              <option value="February 2027">February 2027 (305 days remaining)</option>
            </select>
          </div>

          <div className="cfa-modal-field">
            <label className="cfa-modal-label">Daily Study Target (hours)</label>
            <div className="cfa-hours-options-row">
              {[1.5, 2, 2.5, 3, 4].map((hrs) => (
                <button
                  key={hrs}
                  type="button"
                  className={`cfa-choice-pill ${dailyHours === hrs ? "active" : ""}`}
                  onClick={() => setDailyHours(hrs)}
                >
                  {hrs} hrs/day
                </button>
              ))}
            </div>
          </div>

          <div className="cfa-modal-field">
            <label className="cfa-modal-label">Study Days Per Week</label>
            <div className="cfa-hours-options-row">
              {[5, 6, 7].map((days) => (
                <button
                  key={days}
                  type="button"
                  className={`cfa-choice-pill ${studyDays === days ? "active" : ""}`}
                  onClick={() => setStudyDays(days)}
                >
                  {days} days/week
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="cfa-modal-footer">
          <button
            type="button"
            className="cfa-btn-modal-cancel"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="cfa-btn-modal-save"
            onClick={() => {
              onSave({ dailyHours, studyDays, examDate });
              onClose();
            }}
          >
            Save Plan Changes
          </button>
        </div>
      </div>
    </div>
  );
}
