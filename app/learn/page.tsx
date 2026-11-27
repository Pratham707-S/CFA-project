"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiRequest, ApiRequestError } from "@/lib/api";
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
import type { Subject, Topic } from "@/components/learn/types";
import { useLessonData } from "@/hooks/use-lesson-data";

type ApiLesson = { id: string; title: string; description: string | null; estimatedDurationMinutes: number | null; learningObjectives: string[]; status: string };
type ApiSubtopic = { id: string; title: string; lessons?: ApiLesson[] };
type ApiModule = { id: string; title: string; description: string | null; learningOutcomes: string[]; subtopics?: ApiSubtopic[] };
type ApiSubject = { id: string; name: string; slug: string; modules?: ApiModule[] };
function toLearnSubject(subject: ApiSubject): Subject {
  const topics: Topic[] = (subject.modules ?? []).map((module) => ({
    id: module.id,
    title: module.title,
    lessons: (module.subtopics ?? []).flatMap((subtopic) => subtopic.lessons ?? []).map((lesson) => ({
      id: lesson.id,
      title: lesson.title,
      duration: lesson.estimatedDurationMinutes ? `${lesson.estimatedDurationMinutes} min` : "",
      completed: false,
      keyConcepts: lesson.learningObjectives,
      quickNote: lesson.description ?? "",
    })),
  }));
  return { id: subject.id, name: subject.name, iconType: subject.slug === "economics" ? "econ" : "quant", completedTopics: 0, totalTopics: topics.length, topics };
}

export default function LearnPage() {
  const router = useRouter();

  // Navigation & User State
  const [userName, setUserName] = useState("Learner");
  const [userEmail, setUserEmail] = useState("");
  const [currentLevel, setCurrentLevel] = useState("CFA Level I");
  const [subjects, setSubjects] = useState<Subject[]>(cfaSubjects);
  const [apiSubjects, setApiSubjects] = useState<ApiSubject[]>([]);
  const [usingLiveCurriculum, setUsingLiveCurriculum] = useState(false);
  const [curriculumMessage, setCurriculumMessage] = useState("Loading CFA Level I 2027 curriculum…");
  const [requiresSignIn, setRequiresSignIn] = useState(false);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [videoIdInput, setVideoIdInput] = useState("");
  const [videoTitleInput, setVideoTitleInput] = useState("");
  const [videoNotice, setVideoNotice] = useState("");

  // Learning Selection State
  const [selectedSubjectId, setSelectedSubjectId] = useState("quant");
  const [selectedTopicId, setSelectedTopicId] = useState("tvm");
  const [activeTab, setActiveTab] = useState<LessonTabType>("lesson");

  // Interactive States
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [completedTopicIds, setCompletedTopicIds] = useState<Set<string>>(new Set());

  // Current Subject & Topic helpers
  const currentSubject =
    subjects.find((s) => s.id === selectedSubjectId) || subjects[0] || cfaSubjects[0];
  const currentTopic =
    currentSubject.topics.find((t) => t.id === selectedTopicId) ||
    currentSubject.topics[0] || {
      id: "tvm",
      title: "Time Value of Money",
    };

  const currentLessons = currentTopic.lessons ?? [];
  const currentLesson = currentLessons.find((lesson) => lesson.id === selectedLessonId) ?? currentLessons[0];
  const lessonData = useLessonData(currentLesson?.id ?? null, usingLiveCurriculum);
  const isCurrentCompleted = usingLiveCurriculum && currentLesson
    ? lessonData.completedLessonIds.has(currentLesson.id)
    : completedTopicIds.has(currentTopic.id);
  const visibleCompletedTopicIds = usingLiveCurriculum
    ? new Set(subjects.flatMap((subject) => subject.topics
      .filter((topic) => (topic.lessons?.length ?? 0) > 0 && topic.lessons!.every((lesson) => lessonData.completedLessonIds.has(lesson.id)))
      .map((topic) => topic.id)))
    : completedTopicIds;
  const moduleOutcomes = apiSubjects.find((subject) => subject.id === selectedSubjectId)?.modules?.find((module) => module.id === currentTopic.id)?.learningOutcomes ?? [];
  const visibleLessonContent = lessonData.content;
  const visibleLessonQuestions = lessonData.questions;
  const visibleLessonVideos = lessonData.videos;

  // Sync profile data if available from backend (with fast fallback)
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const curriculum = await apiRequest<{ curriculum: { subjects: ApiSubject[] } }>("/api/curriculum/level-1?year=2027");
        const availableSubjects = curriculum.curriculum.subjects.filter((subject) => ["quantitative-methods", "economics"].includes(subject.slug));
        if (availableSubjects.length && isMounted) {
          const mappedSubjects = availableSubjects.map(toLearnSubject);
          setApiSubjects(availableSubjects);
          setSubjects(mappedSubjects);
          setSelectedSubjectId(mappedSubjects[0].id);
          setSelectedTopicId(mappedSubjects[0].topics[0]?.id ?? "");
          setSelectedLessonId(mappedSubjects[0].topics[0]?.lessons?.[0]?.id ?? null);
          setUsingLiveCurriculum(true);
          setCurriculumMessage("Showing published CFA Level I 2027 Quantitative Methods and Economics modules. Economics video candidates remain under review, and written lesson notes are incomplete.");
        } else if (isMounted) {
          setApiSubjects([]);
          setSubjects([]);
          setUsingLiveCurriculum(true);
          setCurriculumMessage("No published CFA Level I subjects are available for 2027 yet.");
        }
      } catch (error) {
        if (isMounted) {
          const signedOut = error instanceof ApiRequestError && error.status === 401;
          setRequiresSignIn(signedOut);
          setCurriculumMessage(signedOut
            ? "Sign in to load your published lessons and verified videos."
            : "Live curriculum could not be loaded. The lesson preview below is not live course data.");
        }
        return;
      }

      try {
        const res = await apiRequest<{
          user?: { displayName: string | null; email: string; role?: string };
          cfaProfile?: { level: string };
        }>("/dashboard");

        if (!res || !isMounted) return;
        if (res.user?.displayName) setUserName(res.user.displayName);
        if (res.user?.email) setUserEmail(res.user.email);
        if (res.user?.role) setUserRole(res.user.role);
        if (res.cfaProfile?.level) {
          setCurrentLevel(
            res.cfaProfile.level === "LEVEL_II"
              ? "CFA Level II"
              : res.cfaProfile.level === "LEVEL_III"
              ? "CFA Level III"
              : "CFA Level I"
          );
        }
      } catch {
        // Curriculum and lesson videos remain usable if profile data is unavailable.
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleToggleComplete = () => {
    if (usingLiveCurriculum && currentLesson?.id) {
      const complete = !isCurrentCompleted;
      lessonData.setLessonCompleted(complete)
        .catch(() => setCurriculumMessage("Progress could not be saved. Please sign in again and retry."));
      return;
    }
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
    const topic = subjects.find((subject) => subject.id === subjectId)?.topics.find((item) => item.id === topicId);
    setSelectedLessonId(topic?.lessons?.[0]?.id ?? null);
  };

  const addVideoResource = async () => {
    if (!currentLesson?.id || !videoIdInput.trim() || !videoTitleInput.trim()) return;
    try {
      await apiRequest(`/api/admin/lessons/${currentLesson.id}/videos`, {
        method: "POST",
        body: JSON.stringify({ youtubeVideoId: videoIdInput.trim(), title: videoTitleInput.trim(), language: "English" }),
      });
      setVideoNotice("Video submitted for review. It will appear to students after an admin verifies it.");
      setVideoIdInput(""); setVideoTitleInput("");
      await lessonData.reloadVideos();
    } catch (error) {
      setVideoNotice(error instanceof Error ? error.message : "Could not add video.");
    }
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
          onLogout={async () => {
            await apiRequest("/auth/logout", { method: "POST" });
            router.replace("/login");
          }}
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
              subjects={subjects}
              selectedSubjectId={selectedSubjectId}
              selectedTopicId={selectedTopicId}
              onSelectTopic={handleSelectTopic}
              completedTopicIds={visibleCompletedTopicIds}
            />

            {/* COLUMN 2: Center Lesson Workspace */}
            <div className="cfa-learn-center-workspace">
              <p role="status" className="cfa-learn-data-status">{curriculumMessage}</p>
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
              <h2 className="cfa-learn-lesson-title">{currentLesson?.title ?? currentTopic.title}</h2>
              <p className="cfa-learn-lesson-desc">
                {currentLesson?.quickNote || (moduleOutcomes.length
                  ? "Published curriculum module. Lesson content is being prepared."
                  : "Select a published curriculum module to view its content.")}
              </p>
              {currentLessons.length > 1 && <div className="cfa-learn-module-lessons" aria-label="Lessons in this module">
                {currentLessons.map((lesson) => <button key={lesson.id} type="button" aria-pressed={lesson.id === currentLesson?.id} onClick={() => setSelectedLessonId(lesson.id)}>{lesson.title}</button>)}
              </div>}

              {/* Lesson Tabs */}
              {usingLiveCurriculum && lessonData.contentLoading && <p role="status">Loading lesson content…</p>}
              {usingLiveCurriculum && lessonData.contentError && <p role="alert">{lessonData.contentError}</p>}
              <LessonTabs
                activeTab={activeTab}
                onChangeTab={setActiveTab}
                practiceCount={usingLiveCurriculum ? visibleLessonQuestions.length : 3}
              />

              {/* Tab View Switcher */}
              {requiresSignIn && <section className="cfa-learn-concept-card" role="status">
                <h3 className="cfa-learn-card-title">Sign in to play this lesson</h3>
                <p>Your published lessons and verified YouTube lectures are available after sign-in. The preview below is sample content.</p>
                <button type="button" className="cfa-learn-complete-pill-btn" onClick={() => router.push("/login")}>Sign in</button>
              </section>}

              {!requiresSignIn && activeTab === "lesson" && currentLesson && (
                <LessonOverview
                  lessonTitle={currentLesson.title}
                  duration={visibleLessonVideos.some((video) => video.isPrimary)
                    ? undefined
                    : currentLesson.duration || "Video not added yet"}
                  keyConcepts={currentLesson.keyConcepts}
                  quickNote={visibleLessonContent?.conceptIntroduction ?? (lessonData.contentLoading ? "Loading lesson text…" : "No written lesson content has been published for this lesson yet.")}
                  content={visibleLessonContent}
                  youtubeVideoId={visibleLessonVideos.find((video) => video.isPrimary)?.youtubeVideoId}
                  videoEmbedUrl={visibleLessonVideos.find((video) => video.isPrimary)?.embedUrl}
                  videoWatchUrl={visibleLessonVideos.find((video) => video.isPrimary)?.videoUrl}
                  isCompleted={isCurrentCompleted}
                  onToggleComplete={handleToggleComplete}
                  onPrevLesson={handlePrevLesson}
                  onNextLesson={handleNextLesson}
                />
              )}

              {!requiresSignIn && activeTab === "lesson" && !currentLesson && <section className="cfa-learn-concept-card" aria-live="polite">
                <h3 className="cfa-learn-card-title">Lesson content is not published yet</h3>
                <p>This module is loaded from the 2027 curriculum API. Once its subtopics and lessons are added, lesson progress and verified videos will appear here.</p>
                {moduleOutcomes.length > 0 && <ul>{moduleOutcomes.map((outcome, index) => <li key={index}>{outcome}</li>)}</ul>}
              </section>}

              {userRole === "ADMIN" && currentLesson && <details className="cfa-learn-admin-video">
                <summary>Add a YouTube video for this lesson</summary>
                <label>Video ID<input value={videoIdInput} onChange={(event) => setVideoIdInput(event.target.value)} placeholder="11-character YouTube ID" /></label>
                <label>Title<input value={videoTitleInput} onChange={(event) => setVideoTitleInput(event.target.value)} placeholder="Video title" /></label>
                <button type="button" onClick={addVideoResource}>Submit for review</button>
                {videoNotice && <p role="status">{videoNotice}</p>}
              </details>}

              {activeTab === "examples" && <LessonExamples content={usingLiveCurriculum ? visibleLessonContent : null} />}

              {activeTab === "practice" && <LessonPractice key={currentLesson?.id ?? currentTopic.id} questions={usingLiveCurriculum ? visibleLessonQuestions : []} isLoading={lessonData.questionsLoading} error={lessonData.questionsError} />}

              {activeTab === "summary" && <LessonSummary content={usingLiveCurriculum ? visibleLessonContent : null} />}

              {activeTab === "notes" && <LessonNotes key={currentLesson?.id ?? currentTopic.id} lessonId={currentLesson?.id ?? currentTopic.id} />}
            </div>

            {/* COLUMN 3: Right Lesson Support Column */}
            <LessonResources
              resources={usingLiveCurriculum ? visibleLessonVideos.map((video) => ({ id: video.id, title: video.title, subtitle: `${video.language} lecture`, fileType: "doc" as const, color: "#0d7b5f", url: video.videoUrl })) : lessonResources}
              relatedTopics={relatedTopics}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
