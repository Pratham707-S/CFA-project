"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";

type DashboardData = {
  user: { displayName: string | null; email: string; role: string };
  cfaProfile: { level: string; examDate: string } | null;
  preferences: { dailyStudyHours: number; studyDays: string[] } | null;
  studyPlan: { version: number; status: string; generatedAt: string } | null;
};

const nav = ["Dashboard", "Study Plan", "Subjects", "Question Bank", "Mock Exams", "Mistake Book", "Analytics"];

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    apiRequest<DashboardData>("/dashboard")
      .then((result) => setData(result))
      .catch((reason) => setError(reason instanceof Error ? reason.message : "Could not load your dashboard."));
  }, []);

  if (error) return <main className="dashboard-shell"><div className="dashboard-error"><h1>Dashboard unavailable</h1><p>{error}</p><button className="primary-button" onClick={() => router.push("/login")}>Back to login →</button></div></main>;
  if (!data) return <main className="dashboard-shell"><div className="dashboard-loading">Loading your CFA dashboard…</div></main>;

  const level = data.cfaProfile?.level?.replace("LEVEL_", "Level ") ?? "CFA Level I";
  const examDate = data.cfaProfile ? new Date(data.cfaProfile.examDate).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "Set your exam date";
  const displayName = data.user.displayName?.split(" ")[0] ?? "there";

  return <main className="dashboard-shell">
    <aside className="dashboard-sidebar">
      <div className="dashboard-brand"><span className="dashboard-mark">▮▮▮</span> CFA Prep</div>
      <nav>{nav.map((item, index) => <button key={item} className={index === 0 ? "active" : ""}>{item}</button>)}</nav>
      <div className="dashboard-sidebar-bottom"><button>Settings</button><button>Help & Support</button></div>
    </aside>
    <section className="dashboard-main">
      <header className="dashboard-header"><div className="dashboard-search">⌕ <span>Search for topics, questions, or ask AI…</span></div><div className="dashboard-user"><span className="avatar">{displayName[0].toUpperCase()}</span><span>{data.user.displayName ?? data.user.email}</span>⌄</div></header>
      <div className="dashboard-content">
        <div className="dashboard-topline"><div><p className="dashboard-date">Your CFA learning workspace</p><h1>Good morning, {displayName} <span>👋</span></h1><p className="dashboard-muted">Let&apos;s keep building your CFA journey.</p></div><div className="dashboard-context"><span>▮ {level}</span><span>▣ {examDate}</span></div></div>
        <div className="dashboard-grid dashboard-grid-top">
          <section className="dashboard-card study-card"><div className="card-heading"><div><p className="card-kicker">Today&apos;s study plan</p><h2>Keep your momentum</h2></div><span className="time-badge">◷ {data.preferences?.dailyStudyHours ?? 2}h target</span></div><div className="task-list"><div className="task done"><span>✓</span><div><b>Review CFA foundations</b><small>Concept lesson · 25 minutes</small></div><em>Done</em></div><div className="task"><span>○</span><div><b>Practice mixed questions</b><small>Quantitative Methods · 20 MCQs</small></div><em>30 min</em></div><div className="task"><span>○</span><div><b>Build your mistake book</b><small>Review recent weak areas</small></div><em>20 min</em></div></div><button className="primary-button full-button">Continue today&apos;s plan →</button></section>
          <section className="dashboard-card progress-card"><div className="card-heading"><div><p className="card-kicker">Your CFA progress</p><h2>Overall mastery</h2></div><span className="view-link">View analytics →</span></div><div className="progress-ring"><strong>68%</strong><small>Overall mastery</small></div><div className="progress-bars"><span>Learning <i><b style={{width:"74%"}} /></i>74%</span><span>Practice <i><b style={{width:"61%"}} /></i>61%</span><span>Revision <i><b style={{width:"52%"}} /></i>52%</span></div></section>
          <section className="dashboard-card ai-card"><p className="card-kicker">Your study companion</p><h2>Ask your CFA AI</h2><p className="dashboard-muted">Get explanations, solve doubts, and create practice questions.</p><button className="ai-input">Ask anything about CFA… <span>↗</span></button><div className="quick-actions"><button>▣ Explain a concept</button><button>☷ Solve a question</button><button>✦ Create a quiz</button><button>▦ Make a study plan</button></div></section>
        </div>
        <div className="dashboard-grid dashboard-grid-bottom"><section className="dashboard-card continue-card"><div className="card-heading"><div><p className="card-kicker">Continue learning</p><h2>Financial Statement Analysis</h2></div><span className="view-link">Go to learn →</span></div><div className="lesson-preview"><div className="lesson-image">▱</div><div><b>Inventory Valuation</b><p className="dashboard-muted">Understand the different inventory valuation methods and when to use them.</p><div className="lesson-progress"><span style={{width:"82%"}} /></div><small>82% complete</small></div></div><button className="primary-button">Continue lesson →</button></section><section className="dashboard-card weak-card"><div className="card-heading"><div><p className="card-kicker">Your weak areas</p><h2>Focus next</h2></div><span className="view-link">View all →</span></div>{["Deferred Tax", "Probability", "Fixed Income", "Economics"].map((item, index) => <div className="weak-row" key={item}><span>{index < 2 ? "◉" : "◌"} {item}</span><i><b style={{width:`${43 + index * 8}%`}} /></i><small>{43 + index * 8}%</small></div>)}</section><section className="dashboard-card practice-card"><div className="card-heading"><div><p className="card-kicker">Practice center</p><h2>Ready when you are</h2></div></div><div className="practice-stats"><div><b>428</b><small>Questions attempted</small></div><div><b>3</b><small>Mocks completed</small></div><div><b>47</b><small>Mistakes to review</small></div></div><button className="primary-button full-button">Start practice →</button></section></div>
      </div>
    </section>
  </main>;
}
