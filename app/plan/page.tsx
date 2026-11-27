"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";
import "../dashboard/dashboard-layout.css";
import "./plan-layout.css";

// Shared Dashboard Components
import { Sidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";

// Plan Subcomponents
import { PlanHeader, PlanTab } from "@/components/plan/plan-header";
import { ExamDetailsCard } from "@/components/plan/exam-details-card";
import { PlanOverviewCard } from "@/components/plan/plan-overview-card";
import { CfaRoadmap } from "@/components/plan/cfa-roadmap";
import { ThisWeeksPlanCard } from "@/components/plan/this-weeks-plan-card";
import { MonthlyCalendarCard } from "@/components/plan/monthly-calendar-card";

// Other Tabs Views
import { WeeklyPlanTab } from "@/components/plan/weekly-plan-tab";
import { CalendarTab } from "@/components/plan/calendar-tab";
import { SubjectsTab } from "@/components/plan/subjects-tab";
import { RevisionTab } from "@/components/plan/revision-tab";

// Modals
import { EditPlanModal } from "@/components/plan/edit-plan-modal";
import { AiPlanModal } from "@/components/plan/ai-plan-modal";

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
    dailyStudyHours: 2,
    studyDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  },
  studyPlan: {
    version: 1,
    status: "ACTIVE",
    generatedAt: "2026-04-20",
  },
};

export default function MyCfaPlanPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData>(previewData);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<PlanTab>("overview");
  const [selectedLevel, setSelectedLevel] = useState("CFA Level I");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  // Dynamic plan settings state
  const [dailyHours, setDailyHours] = useState(2);
  const [studyDaysPerWeek, setStudyDaysPerWeek] = useState(6);
  const [examDateLabel, setExamDateLabel] = useState("August 2026");

  const loadPlanData = () => {
    setError("");
    apiRequest<DashboardData>("/dashboard")
      .then((result) => {
        setData(result);
        if (result.cfaProfile?.level) {
          setSelectedLevel(result.cfaProfile.level.replace("LEVEL_", "CFA Level "));
        }
        if (result.preferences?.dailyStudyHours) {
          setDailyHours(result.preferences.dailyStudyHours);
        }
        if (result.preferences?.studyDays) {
          setStudyDaysPerWeek(result.preferences.studyDays.length);
        }
        if (result.cfaProfile?.examDate) {
          setExamDateLabel(
            new Date(result.cfaProfile.examDate).toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })
          );
        }
      })
      .catch((reason) => {
        setError(
          reason instanceof Error
            ? reason.message
            : "Could not load plan data."
        );
      });
  };

  useEffect(() => {
    loadPlanData();
  }, []);

  const fullName = data.user.displayName || "Pratham Sharma";
  const userEmail = data.user.email || "student@cfaprep.io";
  const examDaysLeft = 124;

  return (
    <div className="cfa-dashboard-shell">
      {/* Shared Sidebar Navigation with active 'My CFA Plan' */}
      <Sidebar
        currentRoute="My CFA Plan"
        onNavigate={(route) => {
          if (route === "Dashboard") {
            router.push("/dashboard");
          } else if (route === "My CFA Plan") {
            setActiveTab("overview");
          }
        }}
        examDaysLeft={examDaysLeft}
        levelName={selectedLevel}
        examDateLabel={`${examDateLabel} Exam`}
      />

      {/* Main Layout Column */}
      <div className="cfa-main-layout">
        {/* Shared Top Header */}
        <Header
          userName={fullName}
          userEmail={userEmail}
          onLogout={async () => {
            await apiRequest("/auth/logout", { method: "POST" });
            router.replace("/login");
          }}
        />

        {/* Plan Content Area */}
        <main className="cfa-dashboard-content">
          {/* Data Error / Preview Notice */}
          {error && (
            <div className="cfa-dashboard-data-notice" role="status">
              <span>
                <strong>Preview mode:</strong> Live plan data isn&apos;t available ({error}). Showing sample CFA study plan.
              </span>
              <div className="cfa-data-notice-actions">
                <button
                  type="button"
                  className="cfa-notice-btn"
                  onClick={loadPlanData}
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

          {/* Page Header: Title, Subtitle, Level Selector, Tabs, Actions */}
          <PlanHeader
            activeTab={activeTab}
            onTabChange={(tab) => setActiveTab(tab)}
            selectedLevel={selectedLevel}
            onLevelChange={(lvl) => setSelectedLevel(lvl)}
            onEditPlan={() => setIsEditModalOpen(true)}
            onAdjustWithAi={() => setIsAiModalOpen(true)}
          />

          {/* TAB 1: OVERVIEW (OPTION 2 EXACT REFERENCE) */}
          {activeTab === "overview" && (
            <div className="cfa-tab-content-container">
              {/* Row 1: Exam Details & Plan Overview */}
              <div className="cfa-plan-top-cards-row">
                <ExamDetailsCard
                  level={selectedLevel}
                  examDateLabel={examDateLabel}
                  daysRemaining={examDaysLeft}
                />

                <PlanOverviewCard
                  dailyStudyHours={dailyHours}
                  studyDaysPerWeek={studyDaysPerWeek}
                  currentPhase="Core Learning"
                  planProgressPercent={68}
                />
              </div>

              {/* Row 2: Your CFA Roadmap */}
              <CfaRoadmap />

              {/* Row 3: This Week's Plan & Monthly Calendar */}
              <div className="cfa-plan-bottom-grid">
                <ThisWeeksPlanCard />
                <MonthlyCalendarCard />
              </div>
            </div>
          )}

          {/* TAB 2: WEEKLY PLAN */}
          {activeTab === "weekly" && <WeeklyPlanTab />}

          {/* TAB 3: CALENDAR */}
          {activeTab === "calendar" && <CalendarTab />}

          {/* TAB 4: SUBJECTS */}
          {activeTab === "subjects" && <SubjectsTab />}

          {/* TAB 5: REVISION */}
          {activeTab === "revision" && <RevisionTab />}
        </main>
      </div>

      {/* Edit Plan Modal */}
      <EditPlanModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        currentHours={dailyHours}
        currentDays={studyDaysPerWeek}
        currentExamDate={examDateLabel}
        onSave={({ dailyHours: h, studyDays: d, examDate: ed }) => {
          setDailyHours(h);
          setStudyDaysPerWeek(d);
          setExamDateLabel(ed);
        }}
      />

      {/* AI Plan Optimizer Modal */}
      <AiPlanModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        onApplyOptimization={() => {
          setDailyHours(2.5);
        }}
      />
    </div>
  );
}
