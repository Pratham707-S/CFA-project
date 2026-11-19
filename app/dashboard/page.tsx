"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";
import "./dashboard-layout.css";

type DashboardData = {
  user: { displayName: string | null; email: string; role: string };
  cfaProfile: { level: string; examDate: string } | null;
  preferences: { dailyStudyHours: number; studyDays: string[] } | null;
  studyPlan: { version: number; status: string; generatedAt: string } | null;
};

const previewData: DashboardData = {
  user: { displayName: "Student", email: "", role: "STUDENT" },
  cfaProfile: null,
  preferences: null,
  studyPlan: null,
};

const navGroups = [
  ["Study", ["My CFA Plan", "Learn", "Practice", "Mock Exams", "Flashcards", "Mistake Book"]],
  ["Explore", ["Market News", "AI Tutor", "Career Prep"]],
  ["Progress", ["Analytics", "Goals", "Settings"]],
] as const;

const navigationIcons = {
  "My CFA Plan": "plan", Learn: "learn", Practice: "practice", "Mock Exams": "mock",
  Flashcards: "flash", "Mistake Book": "mistake", "Market News": "news",
  "AI Tutor": "tutor", "Career Prep": "career", Analytics: "analytics",
  Goals: "goals", Settings: "settings",
} as const;

function Icon({ name, size = 22 }: { name: string; size?: number }) {
  const paths: Record<string, React.ReactNode> = {
    home: <><path d="m3 10 9-7 9 7"/><path d="M5 9v11h14V9M9 20v-7h6v7"/></>,
    plan: <><rect x="4" y="5" width="16" height="16" rx="2"/><path d="M8 3v4m8-4v4M8 11h8m-8 4h5"/></>,
    learn: <><path d="M3 5.5A2.5 2.5 0 0 1 5.5 3H12v18H5.5A2.5 2.5 0 0 0 3 23z"/><path d="M21 5.5A2.5 2.5 0 0 0 18.5 3H12v18h6.5A2.5 2.5 0 0 1 21 23z"/></>,
    practice: <><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8m-8 4h8m-8 4h5"/></>,
    mock: <><path d="M4 4h16v13H4zM8 21h8m-4-4v4"/><path d="m7 13 3-3 2 2 4-5"/></>,
    flash: <><path d="M13 2 4 13h7l-1 9 10-12h-7z"/></>,
    mistake: <><path d="M6 3h12a2 2 0 0 1 2 2v17l-8-5-8 5V5a2 2 0 0 1 2-2z"/></>,
    news: <><rect x="3" y="4" width="18" height="17" rx="2"/><path d="M7 8h4v4H7zm7 0h3m-3 4h3M7 16h10"/></>,
    tutor: <><path d="M12 3a9 9 0 0 0-9 9v5a3 3 0 0 0 3 3h2v-7H5a7 7 0 0 1 14 0h-3v7h2a3 3 0 0 0 3-3v-5a9 9 0 0 0-9-9z"/></>,
    career: <><rect x="3" y="7" width="18" height="14" rx="2"/><path d="M8 7V4h8v3m-13 5h18m-11 0v2h4v-2"/></>,
    analytics: <><path d="M3 3v18h18"/><path d="m7 14 4-4 3 2 6-7"/></>,
    goals: <><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="m19.4 15 .1.1 1.4 1.1-1.4 2.4-1.7-.6a8 8 0 0 1-1.5.9l-.3 1.8h-2.8l-.3-1.8a8 8 0 0 1-1.5-.9l-1.7.6-1.4-2.4 1.4-1.1a7 7 0 0 1 0-1.8l-1.4-1.1 1.4-2.4 1.7.6a8 8 0 0 1 1.5-.9l.3-1.8h2.8l.3 1.8a8 8 0 0 1 1.5.9l1.7-.6 1.4 2.4-1.4 1.1a7 7 0 0 1 0 1.8z"/></>,
    logo: <><path d="M4 20V11h4v9zm6 0V6h4v14zm6 0V3h4v17z" fill="currentColor" stroke="none"/></>,
    search: <><circle cx="10.8" cy="10.8" r="7"/><path d="m16 16 5 5"/></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9m-8 12h4"/></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4m10-4v4M3 10h18m-14 4h2m3 0h2m-7 3h2"/></>,
    target: <><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><path d="m12 12 7-7m-4 0h4v4"/></>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    bot: <><rect x="4" y="7" width="16" height="13" rx="3"/><path d="M12 3v4m-4 6h.01M16 13h.01M9 17h6m-9-13L4 2m16 3 1-3"/></>,
    check: <><circle cx="12" cy="12" r="10" fill="currentColor"/><path d="m7 12 3 3 7-7" stroke="white"/></>,
    circle: <circle cx="12" cy="12" r="9"/>,
    fire: <path d="M12 22c5 0 8-4 7-9-.5-2-2-4-4-6 0 3-1 4-2 4 1-5-2-8-5-10 1 5-1 7-3 10-3 5 0 11 7 11z"/>,
    doc: <><path d="M6 2h9l5 5v15H6z"/><path d="M14 2v6h6m-10 4h6m-6 4h6"/></>,
    accuracy: <><circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/></>,
    send: <><path d="m22 2-7 20-4-9-9-4zM22 2 11 13"/></>,
    book: <><path d="M3 5a2 2 0 0 1 2-2h6v18H5a2 2 0 0 0-2 2zm18 0a2 2 0 0 0-2-2h-6v18h6a2 2 0 0 1 2 2z"/></>,
    list: <><path d="M9 6h12M9 12h12M9 18h12"/><path d="M4 6h.01M4 12h.01M4 18h.01"/></>,
    spark: <><path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 16l1 2 2 1-2 1-1 2-1-2-2-1 2-1z"/></>,
    weekly: <><rect x="3" y="4" width="18" height="17" rx="2"/><path d="M7 2v4m10-4v4M3 9h18m-14 4v4m5-4v4m5-4v4"/></>,
    warn: <><path d="M12 3 2 21h20z"/><path d="M12 9v5m0 3h.01"/></>,
    yellow: <><path d="m12 2 2.5 6 6.5.5-5 4.3 1.5 6.2-5.5-3.4-5.5 3.4 1.5-6.2-5-4.3L9.5 8z"/></>,
  };
  return <svg className="dashboard-icon" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name] ?? paths.practice}</svg>;
}

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState("");

  const loadDashboard = () => {
    setError("");
    setData(null);
    apiRequest<DashboardData>("/dashboard")
      .then((result) => setData(result))
      .catch((reason) => {
        setError(reason instanceof Error ? reason.message : "Could not load your dashboard.");
        setData(previewData);
      });
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  if (!data) return <main className="dashboard-shell"><div className="dashboard-loading">Loading your CFA dashboard…</div></main>;

  const level = data.cfaProfile?.level?.replace("LEVEL_", "Level ") ?? "CFA Level I";
  const examDate = data.cfaProfile ? new Date(data.cfaProfile.examDate).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "Set your exam date";
  const displayName = data.user.displayName?.split(" ")[0] ?? "there";

  return <main className="dashboard-shell">
    <aside className="dashboard-sidebar">
      <div className="dashboard-brand"><span className="dashboard-mark"><Icon name="logo" size={28} /></span> CFA Prep</div>
      <nav><button className="active"><Icon name="home" />Dashboard</button>{navGroups.map(([group, items]) => <div className="dashboard-nav-group" key={group}><small>{group}</small>{items.map(item => <button key={item}><Icon name={navigationIcons[item]} />{item}</button>)}</div>)}</nav>
      <div className="sidebar-plan"><b><Icon name="logo" size={28} /> &nbsp; CFA Level I</b><span>Aug 2026 Exam</span><i><em /></i><small>124 days left</small></div><div className="sidebar-quote">“Discipline today.<br />A stronger tomorrow.”</div><div className="dashboard-sidebar-bottom"><button>Settings</button><button>Help & Support</button></div>
    </aside>
    <section className="dashboard-main">
      <header className="dashboard-header"><div className="dashboard-search"><Icon name="search" size={19} /> <span>Search for topics, questions, or ask AI…</span><kbd>⌘ K</kbd></div><div className="dashboard-header-actions"><span className="notification"><Icon name="bell" size={26} /></span><div className="dashboard-user"><span className="avatar">{displayName[0].toUpperCase()}</span><span>{data.user.displayName ?? data.user.email}</span>⌄</div></div></header>
      <div className="dashboard-content">
        {error && <div className="dashboard-data-notice" role="status"><span><b>Preview mode:</b> live account data isn&apos;t available ({error}). Your dashboard layout is still shown.</span><div><button type="button" onClick={loadDashboard}>Retry</button><button type="button" onClick={() => router.push("/login")}>Sign in</button></div></div>}
        <div className="dashboard-topline"><div><p className="dashboard-date">Monday, 18 November 2026</p><h1>Good morning, {displayName} <span>👋</span></h1><p className="dashboard-muted">Let&apos;s keep building your CFA journey.</p></div><div className="dashboard-context"><span><Icon name="logo" /> {level}⌄</span><span><Icon name="calendar" /> <b>124 days</b> to exam <small>{examDate}</small></span><button className="ask-ai-button">✦ Ask AI</button></div></div>
        <div className="dashboard-grid dashboard-grid-top">
          <section className="dashboard-card study-card"><div className="card-heading"><div><p className="card-kicker"><Icon name="target" size={30} /> Today&apos;s Study Plan</p><h2 className="study-summary">4 of 5 tasks · 2h 10m planned</h2></div><span className="time-badge"><Icon name="clock" /> 2h 10m</span></div><div className="task-list"><div className="task done"><Icon name="check" size={26} /><div><b>Quantitative Methods – Time Value of Money</b><small>Continue lesson · 3.2 TVM Applications</small></div><em>40 min</em></div><div className="task"><Icon name="circle" size={26} /><div><b>Financial Statement Analysis – Inventory</b><small>New lesson · 4.1 Inventory Valuation</small></div><em>35 min</em></div><div className="task"><Icon name="circle" size={26} /><div><b>Practice Questions – Mixed Set</b><small>20 MCQs · Quant + FSA</small></div><em>30 min</em></div><div className="task"><Icon name="circle" size={26} /><div><b>Ethics – Standards I–III</b><small>Quick revision · Key concepts</small></div><em>25 min</em></div></div><button className="primary-button full-button">Continue Today&apos;s Plan →</button></section>
          <section className="dashboard-card progress-card"><div className="card-heading"><div><p className="card-kicker">Your CFA progress</p><h2>Your CFA Progress</h2></div><span className="view-link">View Detailed Analytics →</span></div><div className="progress-overview"><div className="progress-ring"><strong>68%</strong><small>Overall mastery</small></div><div className="progress-bars"><span>Learning <i><b style={{width:"74%"}} /></i>74%</span><span>Practice <i><b style={{width:"61%"}} /></i>61%</span><span>Revision <i><b style={{width:"52%"}} /></i>52%</span><span>Mocks <i><b style={{width:"45%"}} /></i>45%</span></div></div><div className="progress-stats"><span><Icon name="fire" /> <b>12</b><small>Day streak</small></span><span><Icon name="clock" /> <b>84 hrs</b><small>Total study time</small></span><span><Icon name="doc" /> <b>428</b><small>Questions</small></span><span><Icon name="accuracy" /><b>73%</b><small>Accuracy</small></span></div></section>
          <section className="dashboard-card ai-card"><p className="card-kicker">Your study companion</p><h2><Icon name="bot" size={32} /> Ask Your CFA AI</h2><p className="dashboard-muted">Get explanations, solve doubts, and create practice questions.</p><button className="ai-input">Ask anything about CFA… <span><Icon name="send" size={18} /></span></button><div className="quick-actions"><button><Icon name="book" size={16} /> Explain a concept</button><button><Icon name="list" size={16} /> Solve a question</button><button><Icon name="spark" size={16} /> Create a quiz</button><button><Icon name="weekly" size={16} /> Make a study plan</button></div></section>
        </div>
        <div className="dashboard-grid dashboard-grid-footer"><section className="dashboard-card brief-card"><div className="card-heading"><div><p className="card-kicker">Market brief</p><h2>What&apos;s moving today</h2></div><span className="view-link">View all →</span></div><p><b>Fed holds rates steady, signals cautious approach for 2024</b><small>2 hours ago · Reuters</small></p><p><b>Oil prices rise on Middle East tensions</b><small>5 hours ago · Bloomberg</small></p></section><section className="dashboard-card week-card"><div className="card-heading"><div><p className="card-kicker"><Icon name="weekly" /> This week</p><h2>Study hours</h2></div><span className="view-link">View calendar →</span></div><div className="week-bars"><i style={{height:"35%"}} /><i style={{height:"55%"}} /><i style={{height:"18%"}} /><i style={{height:"75%"}} /><i style={{height:"48%"}} /><i style={{height:"68%"}} /><i style={{height:"30%"}} /></div><div className="week-labels"><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span></div></section><section className="dashboard-card consistency-card"><div><p className="card-kicker">Keep going</p><h2>Consistency compounds.</h2><p>Keep going, {displayName}. You&apos;re building something great.</p></div></section></div>
        <div className="dashboard-grid dashboard-grid-bottom"><section className="dashboard-card continue-card"><div className="card-heading"><div><p className="card-kicker">Continue learning</p><h2><Icon name="book" /> Continue Learning</h2></div><span className="view-link">Go to Learn →</span></div><div className="lesson-preview"><div className="lesson-image">▱</div><div><span className="dashboard-muted">Financial Statement Analysis</span><b>Inventory Valuation</b><p className="dashboard-muted">Understand the different inventory valuation methods, lower of cost and net realizable value…</p><div className="lesson-progress"><span style={{width:"82%"}} /></div><small>82% complete</small></div></div><button className="primary-button">Continue Lesson →</button></section><section className="dashboard-card weak-card"><div className="card-heading"><div><p className="card-kicker">Your weak areas</p><h2><Icon name="bars" /> Your Weak Areas</h2></div><span className="view-link">View All →</span></div>{["Deferred Tax", "Probability", "Fixed Income", "Economics"].map((item, index) => <div className="weak-row" key={item}><span><Icon name={index < 2 ? "warn" : "yellow"} size={17} /> {item}</span><i><b style={{width:`${43 + index * 8}%`}} /></i><small>{43 + index * 8}%</small></div>)}</section><section className="dashboard-card practice-card"><div className="card-heading"><div><p className="card-kicker">Practice center</p><h2>Ready when you are</h2></div></div><div className="practice-stats"><div><b>428</b><small>Questions attempted</small></div><div><b>3</b><small>Mocks completed</small></div><div><b>47</b><small>Mistakes to review</small></div></div><button className="primary-button full-button">Start practice →</button></section></div>
      </div>
    </section>
  </main>;
}
