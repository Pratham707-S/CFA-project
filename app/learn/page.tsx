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
import type { Subject, Topic, Lesson } from "@/components/learn/types";

type ApiLesson = { id: string; title: string; description: string | null; estimatedDurationMinutes: number | null; learningObjectives: string[]; status: string };
type ApiSubtopic = { id: string; title: string; lessons?: ApiLesson[] };
type ApiModule = { id: string; title: string; description: string | null; learningOutcomes: string[]; subtopics?: ApiSubtopic[] };
type ApiSubject = { id: string; name: string; slug: string; modules?: ApiModule[] };
type ApiVideo = { id: string; youtubeVideoId: string; title: string; durationSeconds: number | null; language: string; isPrimary: boolean };

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
  return { id: subject.id, name: subject.name, iconType: "quant", completedTopics: 0, totalTopics: topics.length, topics };
}

export default function LearnPage() {
  const router = useRouter();

  // Navigation & User State
  const [userName, setUserName] = useState("Pratham Sharma");
  const [userEmail, setUserEmail] = useState("pratham@cfaprep.io");
  const [currentLevel, setCurrentLevel] = useState("CFA Level I");
  const [subjects, setSubjects] = useState<Subject[]>(cfaSubjects);
  const [apiSubject, setApiSubject] = useState<ApiSubject | null>(null);
  const [usingLiveCurriculum, setUsingLiveCurriculum] = useState(false);
  const [curriculumMessage, setCurriculumMessage] = useState("Loading 2027 Quant curriculum…");
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [lessonVideos, setLessonVideos] = useState<ApiVideo[]>([]);
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

  const isCurrentCompleted = completedTopicIds.has(currentTopic.id);
  const currentLessons = currentTopic.lessons ?? [];
  const currentLesson = currentLessons.find((lesson) => lesson.id === selectedLessonId) ?? currentLessons[0];
  const moduleOutcomes = apiSubject?.modules?.find((module) => module.id === currentTopic.id)?.learningOutcomes ?? [];

  // Sync profile data if available from backend (with fast fallback)
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const curriculum = await apiRequest<{ curriculum: { subjects: ApiSubject[] } }>("/api/curriculum/level-1?year=2027");
        const quant = curriculum.curriculum.subjects.find((subject) => subject.slug === "quantitative-methods");
        if (quant && isMounted) {
          setApiSubject(quant);
          const mapped = toLearnSubject(quant);
          setSubjects([mapped]);
          setSelectedSubjectId(mapped.id);
          setSelectedTopicId(mapped.topics[0]?.id ?? "");
          setSelectedLessonId(mapped.topics[0]?.lessons?.[0]?.id ?? null);
          setUsingLiveCurriculum(true);
          setCurriculumMessage(mapped.topics.length ? "Showing published CFA Level I 2027 Quant modules." : "No published Quant modules are available yet.");
        } else if (isMounted) {
          setSubjects([]);
          setUsingLiveCurriculum(true);
          setCurriculumMessage("No published Quantitative Methods subject is available for 2027 yet.");
        }
        const res = await apiRequest<{
          user?: { displayName: string | null; email: string; role?: string };
          cfaProfile?: { level: string };
        }>("/dashboard");

        if (res && isMounted) {
          if (res.user?.displayName) {
            setUserName(res.user.displayName);
          }
          if (res.user?.email) {
            setUserEmail(res.user.email);
          }
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
        }
      } catch {
        if (isMounted) setCurriculumMessage("Sign in to load your saved curriculum. Preview content is shown while the API is unavailable.");
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!currentLesson?.id || !usingLiveCurriculum) {
      setLessonVideos([]);
      return;
    }
    let active = true;
    setSelectedLessonId(currentLesson.id);
    apiRequest<{ resources: ApiVideo[] }>(`/api/lessons/${currentLesson.id}/resources`)
      .then((response) => { if (active) setLessonVideos(response.resources); })
      .catch(() => { if (active) setLessonVideos([]); });
    apiRequest<{ progress: { lessonCompleted: boolean } | null }>(`/api/lessons/${currentLesson.id}/progress`)
      .then(({ progress }) => {
        if (active && progress?.lessonCompleted) setCompletedTopicIds((previous) => new Set(previous).add(currentTopic.id));
      })
      .catch(() => undefined);
    return () => { active = false; };
  }, [currentLesson?.id, currentTopic.id, usingLiveCurriculum]);

  const handleToggleComplete = () => {
    if (usingLiveCurriculum && currentLesson?.id) {
      const complete = !isCurrentCompleted;
      apiRequest(`/api/lessons/${currentLesson.id}/progress`, { method: "POST", body: JSON.stringify({ lessonCompleted: complete }) })
        .then(() => setCompletedTopicIds((prev) => { const next = new Set(prev); complete ? next.add(currentTopic.id) : next.delete(currentTopic.id); return next; }))
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
      const response = await apiRequest<{ resources: ApiVideo[] }>(`/api/lessons/${currentLesson.id}/resources`);
      setLessonVideos(response.resources);
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
              completedTopicIds={completedTopicIds}
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
              <LessonTabs
                activeTab={activeTab}
                onChangeTab={setActiveTab}
                practiceCount={3}
              />

              {/* Tab View Switcher */}
              {activeTab === "lesson" && currentLesson && (
                <LessonOverview
                  lessonTitle={currentLesson.title}
                  duration={currentLesson.duration || "Video not added yet"}
                  keyConcepts={currentLesson.keyConcepts}
                  quickNote={currentLesson.quickNote || "No lesson notes have been published yet."}
                  youtubeVideoId={lessonVideos.find((video) => video.isPrimary)?.youtubeVideoId}
                  isCompleted={isCurrentCompleted}
                  onToggleComplete={handleToggleComplete}
                  onPrevLesson={handlePrevLesson}
                  onNextLesson={handleNextLesson}
                />
              )}

              {activeTab === "lesson" && !currentLesson && <section className="cfa-learn-concept-card" aria-live="polite">
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
