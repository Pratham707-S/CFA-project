"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";
import "./dashboard-layout.css";

// Reusable Dashboard Subcomponents
import { Sidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";
import { GreetingSection } from "@/components/dashboard/greeting-section";
import { StudyPlanCard } from "@/components/dashboard/study-plan-card";
import { ProgressCard } from "@/components/dashboard/progress-card";
import { AiAssistantCard } from "@/components/dashboard/ai-assistant-card";
import { ContinueLearningCard } from "@/components/dashboard/continue-learning-card";
import { WeakAreasCard } from "@/components/dashboard/weak-areas-card";
import { ThisWeekCard } from "@/components/dashboard/this-week-card";
import { MotivationalBanner } from "@/components/dashboard/motivational-banner";

type DashboardData = {
  user: { displayName: string | null; email: string; role: string };
  cfaProfile: { level: string; examDate: string } | null;
  preferences: { dailyStudyHours: number; studyDays: string[] } | null;
  studyPlan: { version: number; status: string; generatedAt: string } | null;
};

const previewData: DashboardData = {
  user: {
    displayName: "Pratham Sharma",
    email: "pratham@cfaprep.io",
    role: "STUDENT",
  },
  cfaProfile: {
    level: "LEVEL_I",
    examDate: "2026-08-26",
  },
  preferences: {
    dailyStudyHours: 2.5,
    studyDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  },
  studyPlan: {
    version: 1,
    status: "ACTIVE",
    generatedAt: "2026-04-20",
  },
};

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData>(previewData);
  const [error, setError] = useState("");
  const [currentNav, setCurrentNav] = useState("Dashboard");
  const [selectedLevel, setSelectedLevel] = useState("CFA Level I");

  const loadDashboard = () => {
    setError("");
    apiRequest<DashboardData>("/dashboard")
      .then((result) => {
        setData(result);
        if (result.cfaProfile?.level) {
          setSelectedLevel(result.cfaProfile.level.replace("LEVEL_", "CFA Level "));
        }
      })
      .catch((reason) => {
        setError(
          reason instanceof Error
            ? reason.message
            : "Could not load your dashboard."
        );
      });
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  // Derived user values
  const fullName = data.user.displayName || "Pratham Sharma";
  const firstName = fullName.split(" ")[0] || "Pratham";
  const userEmail = data.user.email || "student@cfaprep.io";

  // Exam info
  const examDaysLeft = 124;
  const examDateFormatted = data.cfaProfile?.examDate
    ? new Date(data.cfaProfile.examDate).toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "26 Aug 2026";
  const examDateLabel = data.cfaProfile?.examDate
    ? new Date(data.cfaProfile.examDate).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      }) + " Exam"
    : "Aug 2026 Exam";

  return (
    <div className="cfa-dashboard-shell">
      {/* Sidebar navigation */}
      <Sidebar
        currentRoute={currentNav}
        onNavigate={(route) => {
          setCurrentNav(route);
          if (route === "Settings") {
            // Can navigate or keep on page
          }
        }}
        examDaysLeft={examDaysLeft}
        levelName={selectedLevel}
        examDateLabel={examDateLabel}
      />

      {/* Main layout column */}
      <div className="cfa-main-layout">
        {/* Top Header */}
        <Header
          userName={fullName}
          userEmail={userEmail}
          onLogout={async () => {
            await apiRequest("/auth/logout", { method: "POST" });
            router.replace("/login");
          }}
        />

        {/* Dashboard Content Area */}
        <main className="cfa-dashboard-content">
          {/* Data Error / Preview Mode Banner */}
          {error && (
            <div className="cfa-dashboard-data-notice" role="status">
              <span>
                <strong>Preview mode:</strong> Live account data isn&apos;t available ({error}). Showing sample study dashboard.
              </span>
              <div className="cfa-data-notice-actions">
                <button
                  type="button"
                  className="cfa-notice-btn"
                  onClick={loadDashboard}
                >
                  Retry
                </button>
                <button
                  type="button"
                  className="cfa-notice-btn"
                  onClick={() => router.push("/login")}
                >
                  Sign in
                </button>
              </div>
            </div>
          )}

          {/* Greeting Section with subtle mountain background */}
          <GreetingSection
            studentName={firstName}
            selectedLevel={selectedLevel}
            onLevelChange={(newLevel) => setSelectedLevel(newLevel)}
            examDaysLeft={examDaysLeft}
            examDateFormatted={examDateFormatted}
            progressPercent={68}
          />

          {/* ROW 1: Today's Plan (~50%), Progress (~27%), AI Assistant (~23%) */}
          <div className="cfa-grid-row-1">
            <StudyPlanCard
              completedCount={4}
              totalCount={5}
              totalTimePlanned="2h 10m"
              onContinuePlan={() => setCurrentNav("Practice")}
            />

            <ProgressCard
              overallMastery={68}
              learningProgress={74}
              practiceProgress={61}
              revisionProgress={52}
              mocksProgress={45}
              dayStreak={12}
              totalStudyTime="84 hrs"
              questionsAttempted={428}
              accuracyPercent={73}
              onViewAnalytics={() => setCurrentNav("Analytics")}
            />

            <AiAssistantCard />
          </div>

          {/* ROW 2: Continue Learning (~53%) & Weak Areas (~47%) */}
          <div className="cfa-grid-row-2">
            <ContinueLearningCard
              subject="Financial Statement Analysis"
              lessonTitle="Inventory Valuation"
              progressPercent={82}
              description="Understand the different inventory valuation methods, lower of cost and net realizable value…"
              thumbnailUrl="/inventory-blocks.png"
              onContinueLesson={() => setCurrentNav("Learn")}
              onGoToLearn={() => setCurrentNav("Learn")}
            />

            <WeakAreasCard
              recommendationText="You made 7 mistakes in Deferred Tax this week. Consider revising this topic."
              onViewAll={() => setCurrentNav("Practice")}
            />
          </div>

          {/* ROW 3: This Week Study Hours (~53%) & Motivational Banner (~47%) */}
          <div className="cfa-grid-row-3">
            <ThisWeekCard
              currentHours={10.5}
              goalHours={12}
              goalPercent={88}
              onViewCalendar={() => setCurrentNav("My CFA Plan")}
            />

            <MotivationalBanner
              studentName={firstName}
              headline="Consistency compounds."
              subtitle={`Keep going, ${firstName}. You're building something great.`}
              backgroundImageUrl="/dashboard-mountain.png"
            />
          </div>
        </main>
      </div>
    </div>
  );
}
