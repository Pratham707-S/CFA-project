"use client";

import React, { useState } from "react";
import { Check, RotateCcw } from "@/components/ui/icons";
import { apiRequest } from "@/lib/api";
import type { LessonQuestion } from "./content-types";

type AttemptResult = { isCorrect: boolean; correctAnswer: string; explanation: string; solutionSteps: { label: string; content: string }[] | null };

export function LessonPractice({ questions, isLoading, error }: { questions: LessonQuestion[]; isLoading: boolean; error: string | null }) {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [submittedResults, setSubmittedResults] = useState<Record<string, AttemptResult>>({});
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSelect = (questionId: string, optionId: string) => {
    if (submittedResults[questionId]) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  const handleSubmit = async (questionId: string) => {
    if (!selectedAnswers[questionId]) return;
    setSubmittingId(questionId);
    setSubmitError(null);
    try {
      const response = await apiRequest<{ feedback: AttemptResult }>(`/api/questions/${questionId}/attempt`, {
        method: "POST",
        body: JSON.stringify({ selectedAnswer: selectedAnswers[questionId] }),
      });
      setSubmittedResults((previous) => ({ ...previous, [questionId]: response.feedback }));
    } catch (cause) {
      setSubmitError(cause instanceof Error ? cause.message : "Could not submit your answer. Please try again.");
    } finally {
      setSubmittingId(null);
    }
  };

  const handleReset = (questionId: string) => {
    setSelectedAnswers((prev) => {
      const copy = { ...prev };
      delete copy[questionId];
      return copy;
    });
    setSubmittedResults((prev) => {
      const copy = { ...prev };
      delete copy[questionId];
      return copy;
    });
  };

  // Score count
  const totalQuestions = questions.length;
  const correctCount = Object.values(submittedResults).filter((result) => result.isCorrect).length;

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

      {isLoading && <p role="status">Loading published questions…</p>}
      {error && <p role="alert">{error}</p>}
      {submitError && <p role="alert">{submitError}</p>}
      {!isLoading && !error && questions.length === 0 && <p role="status">No practice questions have been published for this lesson yet.</p>}
      <div className="cfa-learn-practice-list">
        {questions.map((q, qIndex) => {
          const result = submittedResults[q.id];
          const isSubmitted = !!result;
          const selectedOption = selectedAnswers[q.id];
          const isCorrect = result?.isCorrect ?? false;

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
                {q.options.map((opt, optionIndex) => {
                  const isSelected = selectedOption === opt.id;
                  let optionClass = "cfa-practice-option";
                  if (isSelected) optionClass += " selected";
                  if (isSubmitted) {
                    if (opt.id === result?.correctAnswer) {
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
                      <span className="cfa-practice-opt-letter">{String.fromCharCode(65 + optionIndex)}</span>
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
                    onClick={() => void handleSubmit(q.id)}
                    disabled={!selectedOption || submittingId === q.id}
                  >
                    <span>{submittingId === q.id ? "Submitting…" : "Check Answer"}</span>
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
                  <p className="cfa-explanation-text">{result.explanation}</p>
                  {result.solutionSteps?.length ? <ol>{result.solutionSteps.map((step) => <li key={step.label}><strong>{step.label}: </strong>{step.content}</li>)}</ol> : null}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
