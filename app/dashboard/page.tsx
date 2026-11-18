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

const navGroups = [["LEARN", ["Study Plan", "Subjects", "Concept Library", "Formula Vault", "Flashcards"]], ["PRACTICE", ["Question Bank", "Mock Exams", "Mistake Book"]], ["EXPLORE", ["Market News", "AI Tutor", "Career Prep"]], ["PROGRESS", ["Analytics", "Goals", "Achievements"]]];

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
      <nav><button className="active"><span>⌂</span>Dashboard</button>{navGroups.map(([group, items]) => <div className="dashboard-nav-group" key={group as string}><small>{group}</small>{(items as string[]).map(item => <button key={item}><span>◫</span>{item}</button>)}</div>)}</nav>
      <div className="dashboard-sidebar-bottom"><button>Settings</button><button>Help & Support</button></div>
    </aside>
    <section className="dashboard-main">
      <header className="dashboard-header"><div className="dashboard-search">⌕ <span>Search for topics, questions, or ask AI…</span><kbd>⌘ K</kbd></div><div className="dashboard-header-actions"><span className="notification">♧</span><div className="dashboard-user"><span className="avatar">{displayName[0].toUpperCase()}</span><span>{data.user.displayName ?? data.user.email}</span>⌄</div></div></header>
      <div className="dashboard-content">
        <div className="dashboard-topline"><div><p className="dashboard-date">Monday, 18 November 2026</p><h1>Good morning, {displayName} <span>👋</span></h1><p className="dashboard-muted">Let&apos;s keep building your CFA journey.</p></div><div className="dashboard-context"><span>▮ {level}⌄</span><span>▣ <b>124 days</b> to exam <small>{examDate}</small></span><button className="ask-ai-button">✦ Ask AI</button></div></div>
        <div className="dashboard-grid dashboard-grid-top">
          <section className="dashboard-card study-card"><div className="card-heading"><div><p className="card-kicker">Today&apos;s Study Plan</p><h2 className="study-summary">4 of 5 tasks · 2h 10m planned</h2></div><span className="time-badge">◷ 2h 10m</span></div><div className="task-list"><div className="task done"><span>✓</span><div><b>Quantitative Methods – Time Value of Money</b><small>Continue lesson · 3.2 TVM Applications</small></div><em>40 min</em></div><div className="task"><span>○</span><div><b>Financial Statement Analysis – Inventory</b><small>New lesson · 4.1 Inventory Valuation</small></div><em>35 min</em></div><div className="task"><span>○</span><div><b>Practice Questions – Mixed Set</b><small>20 MCQs · Quant + FSA</small></div><em>30 min</em></div><div className="task"><span>○</span><div><b>Ethics – Standards I–III</b><small>Quick revision · Key concepts</small></div><em>25 min</em></div></div><button className="primary-button full-button">Continue Today&apos;s Plan →</button></section>
          <section className="dashboard-card progress-card"><div className="card-heading"><div><p className="card-kicker">Your CFA progress</p><h2>Your CFA Progress</h2></div><span className="view-link">View Detailed Analytics →</span></div><div className="progress-overview"><div className="progress-ring"><strong>68%</strong><small>Overall mastery</small></div><div className="progress-bars"><span>Learning <i><b style={{width:"74%"}} /></i>74%</span><span>Practice <i><b style={{width:"61%"}} /></i>61%</span><span>Revision <i><b style={{width:"52%"}} /></i>52%</span><span>Mocks <i><b style={{width:"45%"}} /></i>45%</span></div></div><div className="progress-stats"><span>🔥 <b>12</b><small>Day streak</small></span><span>◷ <b>84 hrs</b><small>Total study time</small></span><span>▤ <b>428</b><small>Questions</small></span></div></section>
          <section className="dashboard-card ai-card"><p className="card-kicker">Your study companion</p><h2>Ask your CFA AI</h2><p className="dashboard-muted">Get explanations, solve doubts, and create practice questions.</p><button className="ai-input">Ask anything about CFA… <span>↗</span></button><div className="quick-actions"><button>▣ Explain a concept</button><button>☷ Solve a question</button><button>✦ Create a quiz</button><button>▦ Make a study plan</button></div></section>
        </div>
        <div className="dashboard-grid dashboard-grid-footer"><section className="dashboard-card brief-card"><div className="card-heading"><div><p className="card-kicker">Market brief</p><h2>What&apos;s moving today</h2></div><span className="view-link">View all →</span></div><p><b>Fed holds rates steady, signals cautious approach for 2024</b><small>2 hours ago · Reuters</small></p><p><b>Oil prices rise on Middle East tensions</b><small>5 hours ago · Bloomberg</small></p></section><section className="dashboard-card week-card"><div className="card-heading"><div><p className="card-kicker">This week</p><h2>Study hours</h2></div><span className="view-link">View calendar →</span></div><div className="week-bars"><i style={{height:"35%"}} /><i style={{height:"55%"}} /><i style={{height:"18%"}} /><i style={{height:"75%"}} /><i style={{height:"48%"}} /><i style={{height:"68%"}} /><i style={{height:"30%"}} /></div><div className="week-labels"><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span></div></section><section className="dashboard-card quick-card"><div className="card-heading"><div><p className="card-kicker">Quick revision</p><h2>Pick up where you left off</h2></div></div><div className="revision-links"><span>▣ Formula Vault <b>124 formulas</b></span><span>▤ Flashcards <b>86 due</b></span><span>⚑ Mistake Book <b>47 questions</b></span></div></section></div>
        <div className="dashboard-grid dashboard-grid-bottom"><section className="dashboard-card continue-card"><div className="card-heading"><div><p className="card-kicker">Continue learning</p><h2>Continue Learning</h2></div><span className="view-link">Go to Learn →</span></div><div className="lesson-preview"><div className="lesson-image">▱</div><div><span className="dashboard-muted">Financial Statement Analysis</span><b>Inventory Valuation</b><p className="dashboard-muted">Understand the different inventory valuation methods, lower of cost and net realizable value…</p><div className="lesson-progress"><span style={{width:"82%"}} /></div><small>82% complete</small></div></div><button className="primary-button">Continue Lesson →</button></section><section className="dashboard-card weak-card"><div className="card-heading"><div><p className="card-kicker">Your weak areas</p><h2>Your Weak Areas</h2></div><span className="view-link">View All →</span></div>{["Deferred Tax", "Probability", "Fixed Income", "Economics"].map((item, index) => <div className="weak-row" key={item}><span>{index < 2 ? "◉" : "◌"} {item}</span><i><b style={{width:`${43 + index * 8}%`}} /></i><small>{43 + index * 8}%</small></div>)}</section><section className="dashboard-card practice-card"><div className="card-heading"><div><p className="card-kicker">Practice center</p><h2>Ready when you are</h2></div></div><div className="practice-stats"><div><b>428</b><small>Questions attempted</small></div><div><b>3</b><small>Mocks completed</small></div><div><b>47</b><small>Mistakes to review</small></div></div><button className="primary-button full-button">Start practice →</button></section></div>
      </div>
    </section>
  </main>;
}
