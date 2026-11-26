"use client";

import React, { useState } from "react";
import { practiceQuestions } from "./learn-data";
import { Check, RotateCcw } from "@/components/ui/icons";

export function LessonPractice() {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [submittedQuestions, setSubmittedQuestions] = useState<Record<string, boolean>>({});

  const handleSelect = (questionId: string, optionId: string) => {
    if (submittedQuestions[questionId]) return; // lock once submitted
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  const handleSubmit = (questionId: string) => {
    if (!selectedAnswers[questionId]) return;
    setSubmittedQuestions((prev) => ({
      ...prev,
      [questionId]: true,
    }));
  };

  const handleReset = (questionId: string) => {
    setSelectedAnswers((prev) => {
      const copy = { ...prev };
      delete copy[questionId];
      return copy;
    });
    setSubmittedQuestions((prev) => {
      const copy = { ...prev };
      delete copy[questionId];
      return copy;
    });
  };

  // Score count
  const totalQuestions = practiceQuestions.length;
  const answeredCount = Object.keys(submittedQuestions).length;
  const correctCount = practiceQuestions.filter(
    (q) => submittedQuestions[q.id] && selectedAnswers[q.id] === q.correctOptionId
  ).length;

  return (
    <div className="cfa-lesson-tab-body">
      <div className="cfa-learn-tab-intro flex-between">
        <div>
          <h3 className="cfa-learn-tab-title">CFA Level I Practice Questions</h3>
          <p className="cfa-learn-tab-desc">
            Test your understanding with exam-style questions. Explanations unlock instantly upon submission.
          </p>
        </div>

        <div className="cfa-learn-practice-score-card">
          <span className="cfa-score-label">Score</span>
          <span className="cfa-score-val">
            {correctCount} / {totalQuestions}
          </span>
        </div>
      </div>

      <div className="cfa-learn-practice-list">
        {practiceQuestions.map((q, qIndex) => {
          const isSubmitted = !!submittedQuestions[q.id];
          const selectedOption = selectedAnswers[q.id];
          const isCorrect = isSubmitted && selectedOption === q.correctOptionId;

          return (
            <div key={q.id} className="cfa-learn-practice-card">
              <div className="cfa-practice-header-row">
                <span className="cfa-practice-q-num">Question {qIndex + 1} of {totalQuestions}</span>
                {isSubmitted && (
                  <span
                    className={`cfa-practice-result-badge ${
                      isCorrect ? "correct" : "incorrect"
                    }`}
                  >
                    {isCorrect ? "Correct" : "Incorrect"}
                  </span>
                )}
              </div>

              <p className="cfa-practice-question-text">{q.question}</p>

              {/* Options */}
              <div className="cfa-practice-options-list">
                {q.options.map((opt) => {
                  const isSelected = selectedOption === opt.id;
                  let optionClass = "cfa-practice-option";
                  if (isSelected) optionClass += " selected";
                  if (isSubmitted) {
                    if (opt.id === q.correctOptionId) {
                      optionClass += " correct-opt";
                    } else if (isSelected && !isCorrect) {
                      optionClass += " incorrect-opt";
                    }
                  }

                  return (
                    <button
                      key={opt.id}
                      type="button"
                      className={optionClass}
                      onClick={() => handleSelect(q.id, opt.id)}
                      disabled={isSubmitted}
                    >
                      <span className="cfa-practice-opt-letter">{opt.label}</span>
                      <span className="cfa-practice-opt-text">{opt.text}</span>
                    </button>
                  );
                })}
              </div>

              {/* Actions & Explanation */}
              <div className="cfa-practice-actions-row">
                {!isSubmitted ? (
                  <button
                    type="button"
                    className="cfa-practice-submit-btn"
                    disabled={!selectedOption}
                    onClick={() => handleSubmit(q.id)}
                  >
                    <span>Check Answer</span>
                    <Check size={14} />
                  </button>
                ) : (
                  <button
                    type="button"
                    className="cfa-practice-retry-btn"
                    onClick={() => handleReset(q.id)}
                  >
                    <RotateCcw size={13} />
                    <span>Try Again</span>
                  </button>
                )}
              </div>

              {isSubmitted && (
                <div className="cfa-practice-explanation-box">
                  <div className="cfa-explanation-title">Explanation:</div>
                  <p className="cfa-explanation-text">{q.explanation}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
