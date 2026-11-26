"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";
import "../dashboard/dashboard-layout.css";
import "../plan/plan-layout.css";
import "./learn-layout.css";

// Shared Layout Components
import { Sidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";

// Learn Components
import { LearnHeader } from "@/components/learn/learn-header";
import { CurriculumSidebar } from "@/components/learn/curriculum-sidebar";
import { LessonTabs, LessonTabType } from "@/components/learn/lesson-tabs";
import { LessonOverview } from "@/components/learn/lesson-overview";
import { LessonExamples } from "@/components/learn/lesson-examples";
import { LessonPractice } from "@/components/learn/lesson-practice";
import { LessonSummary } from "@/components/learn/lesson-summary";
import { LessonNotes } from "@/components/learn/lesson-notes";
import { LessonResources } from "@/components/learn/lesson-resources";

// Data
import { cfaSubjects, lessonResources, relatedTopics } from "@/components/learn/learn-data";
import { Bookmark, Check, ChevronRight } from "@/components/ui/icons";

export default function LearnPage() {
  const router = useRouter();

  // Navigation & User State
  const [userName, setUserName] = useState("Pratham Sharma");
  const [userEmail, setUserEmail] = useState("pratham@cfaprep.io");
  const [currentLevel, setCurrentLevel] = useState("CFA Level I");

  // Learning Selection State
  const [selectedSubjectId, setSelectedSubjectId] = useState("quant");
  const [selectedTopicId, setSelectedTopicId] = useState("tvm");
  const [activeTab, setActiveTab] = useState<LessonTabType>("lesson");

  // Interactive States
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [completedTopicIds, setCompletedTopicIds] = useState<Set<string>>(new Set());

  // Current Subject & Topic helpers
  const currentSubject =
    cfaSubjects.find((s) => s.id === selectedSubjectId) || cfaSubjects[0];
  const currentTopic =
    currentSubject.topics.find((t) => t.id === selectedTopicId) ||
    currentSubject.topics[0] || {
      id: "tvm",
      title: "Time Value of Money",
    };

  const isCurrentCompleted = completedTopicIds.has(currentTopic.id);

  // Sync profile data if available from backend (with fast fallback)
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const res = await apiRequest<{
          user?: { displayName: string | null; email: string };
          cfaProfile?: { level: string };
        }>("/dashboard");

        if (res && isMounted) {
          if (res.user?.displayName) {
            setUserName(res.user.displayName);
          }
          if (res.user?.email) {
            setUserEmail(res.user.email);
          }
          if (res.cfaProfile?.level) {
            setCurrentLevel(
              res.cfaProfile.level === "LEVEL_II"
                ? "CFA Level II"
                : res.cfaProfile.level === "LEVEL_III"
                ? "CFA Level III"
                : "CFA Level I"
            );
          }
        }
      } catch {
        // Fallback to default user
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleToggleComplete = () => {
    setCompletedTopicIds((prev) => {
      const next = new Set(prev);
      if (next.has(currentTopic.id)) {
        next.delete(currentTopic.id);
      } else {
        next.add(currentTopic.id);
      }
      return next;
    });
  };

  const handleSelectTopic = (subjectId: string, topicId: string) => {
    setSelectedSubjectId(subjectId);
    setSelectedTopicId(topicId);
    setActiveTab("lesson"); // Reset to lesson tab when selecting a new topic
  };

  // Previous & Next Topic Navigation
  const allTopicList = currentSubject.topics;
  const currentIdx = allTopicList.findIndex((t) => t.id === currentTopic.id);

  const handlePrevLesson = () => {
    if (currentIdx > 0) {
      setSelectedTopicId(allTopicList[currentIdx - 1].id);
    }
  };

  const handleNextLesson = () => {
    if (currentIdx < allTopicList.length - 1) {
      setSelectedTopicId(allTopicList[currentIdx + 1].id);
    }
  };

  return (
    <div className="cfa-dashboard-shell">
      {/* 1. Global Left Sidebar */}
      <Sidebar
        currentRoute="Learn"
        onNavigate={(route) => {
          if (route === "Dashboard") router.push("/dashboard");
          if (route === "My CFA Plan") router.push("/plan");
          if (route === "Learn") router.push("/learn");
        }}
        examDaysLeft={124}
        levelName={currentLevel}
        examDateLabel="Aug 2026 Exam"
      />

      {/* 2. Main Content Shell */}
      <div className="cfa-dashboard-main">
        {/* Global Top Header */}
        <Header
          userName={userName}
          userEmail={userEmail}
          onSearch={(query) => {
            if (query.trim()) {
              // Could filter or jump to topic
            }
          }}
        />

        {/* Learn Page Content Container */}
        <main className="cfa-dashboard-content">
          {/* Page Header (Title, Subtitle, CFA Level Selector) */}
          <LearnHeader
            currentLevel={currentLevel}
            onLevelChange={(lvl) => setCurrentLevel(lvl)}
          />

          {/* Three-Column Desktop Learning Workspace */}
          <div className="cfa-learn-workspace-grid">
            {/* COLUMN 1: Curriculum Navigation */}
            <CurriculumSidebar
              subjects={cfaSubjects}
              selectedSubjectId={selectedSubjectId}
              selectedTopicId={selectedTopicId}
              onSelectTopic={handleSelectTopic}
              completedTopicIds={completedTopicIds}
            />

            {/* COLUMN 2: Center Lesson Workspace */}
            <div className="cfa-learn-center-workspace">
              {/* Breadcrumbs & Action Row */}
              <div className="cfa-learn-breadcrumb-row">
                <div className="cfa-learn-breadcrumbs">
                  <span className="cfa-breadcrumb-subject">{currentSubject.name}</span>
                  <span className="cfa-breadcrumb-sep">
                    <ChevronRight size={13} />
                  </span>
                  <span className="cfa-breadcrumb-topic">{currentTopic.title}</span>
                </div>

                <div className="cfa-learn-actions-right">
                  {/* Bookmark Button */}
                  <button
                    type="button"
                    className={`cfa-learn-bookmark-btn ${isBookmarked ? "bookmarked" : ""}`}
                    onClick={() => setIsBookmarked(!isBookmarked)}
                    title={isBookmarked ? "Remove bookmark" : "Bookmark this lesson"}
                    aria-label="Bookmark"
                  >
                    <Bookmark size={15} />
                  </button>

                  {/* Mark as Complete Pill Button */}
                  <button
                    type="button"
                    className={`cfa-learn-complete-pill-btn ${
                      isCurrentCompleted ? "completed" : ""
                    }`}
                    onClick={handleToggleComplete}
                  >
                    <Check size={14} strokeWidth={2.5} />
                    <span>{isCurrentCompleted ? "Completed" : "Mark as Complete"}</span>
                  </button>
                </div>
              </div>

              {/* Lesson Title & Subtitle */}
              <h2 className="cfa-learn-lesson-title">{currentTopic.title}</h2>
              <p className="cfa-learn-lesson-desc">
                Learn the core concepts of present value, future value, annuities, and their applications in finance.
              </p>

              {/* Lesson Tabs */}
              <LessonTabs
                activeTab={activeTab}
                onChangeTab={setActiveTab}
                practiceCount={3}
              />

              {/* Tab View Switcher */}
              {activeTab === "lesson" && (
                <LessonOverview
                  lessonTitle={currentTopic.title}
                  duration="18 min"
                  keyConcepts={[
                    "Present Value (PV) and Future Value (FV)",
                    "Compounding and discounting",
                    "Ordinary and annuity due",
                    "Perpetuities",
                    "Applications in valuation and capital budgeting",
                  ]}
                  quickNote="The time value of money means that a dollar today is worth more than a dollar in the future due to its earning potential."
                  isCompleted={isCurrentCompleted}
                  onToggleComplete={handleToggleComplete}
                  onPrevLesson={handlePrevLesson}
                  onNextLesson={handleNextLesson}
                />
              )}

              {activeTab === "examples" && <LessonExamples />}

              {activeTab === "practice" && <LessonPractice />}

              {activeTab === "summary" && <LessonSummary />}

              {activeTab === "notes" && <LessonNotes lessonId={currentTopic.id} />}
            </div>

            {/* COLUMN 3: Right Lesson Support Column */}
            <LessonResources
              resources={lessonResources}
              relatedTopics={relatedTopics}
              onSelectRelatedTopic={(topicTitle) => {
                // If user clicks a related topic, search or inform
              }}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
