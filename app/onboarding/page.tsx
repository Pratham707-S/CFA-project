"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const steps = ["Account", "CFA Profile", "Study Preferences", "Complete"];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [level, setLevel] = useState("CFA Level I");
  const [hours, setHours] = useState("1–2 hours");

  return <main className="onboarding-page">
    <aside className="onboarding-visual"><div className="auth-brand">● CFA Prep</div></aside>
    <section className="onboarding-panel"><div className="onboarding-card">
      <div className="stepper">{steps.map((label, index) => <div className={`step ${index + 1 <= step ? "active" : ""}`} key={label}><span>{index + 1 <= step ? "✓" : index + 1}</span><small>{label}</small></div>)}</div>
      {step === 1 && <><p className="eyebrow"><span /> Account</p><h2>Create your account</h2><p className="auth-subtitle">Get started with your CFA preparation.</p><div className="field-grid"><label>Full name<input placeholder="Pratham Sharma" /></label><label>Email<input placeholder="pratham@example.com" /></label><label>Password<input placeholder="••••••••••" type="password" /></label></div><button className="primary-button onboarding-action" onClick={() => setStep(2)}>Create Account <span>→</span></button></>}
      {step === 2 && <><p className="eyebrow"><span /> CFA profile</p><h2>CFA Profile</h2><p className="auth-subtitle">Help us understand your current status.</p><h3>Which level are you preparing for?</h3><div className="choice-grid three">{["CFA Level I", "CFA Level II", "CFA Level III"].map(item => <button className={`choice ${level === item ? "selected" : ""}`} onClick={() => setLevel(item)} key={item}><b>{item}</b><small>{item === "CFA Level I" ? "Foundation of investment knowledge" : item === "CFA Level II" ? "Application and analysis of concepts" : "Portfolio management and wealth planning"}</small></button>)}</div><h3>When is your exam?</h3><select className="select-field"><option>August 2026</option><option>November 2026</option></select><div className="onboarding-actions"><button className="secondary-button" onClick={() => setStep(1)}>← Back</button><button className="primary-button" onClick={() => setStep(3)}>Continue →</button></div></>}
      {step === 3 && <><p className="eyebrow"><span /> Study preferences</p><h2>Study Preferences</h2><p className="auth-subtitle">You can change these anytime.</p><h3>How much time can you study each day?</h3><div className="choice-grid four">{["< 1 hour", "1–2 hours", "2–4 hours", "4+ hours"].map(item => <button className={`choice compact ${hours === item ? "selected" : ""}`} onClick={() => setHours(item)} key={item}><b>{item}</b><small>Study target</small></button>)}</div><h3>What is your main goal?</h3><div className="choice-grid three">{["Pass the CFA exam", "Build strong knowledge", "Improve weak subjects"].map(item => <button className="choice compact" key={item}><b>{item}</b></button>)}</div><div className="onboarding-actions"><button className="secondary-button" onClick={() => setStep(2)}>← Back</button><button className="primary-button" onClick={() => setStep(4)}>Continue →</button></div></>}
      {step === 4 && <div className="complete-state"><div className="celebration">✦</div><h2>Your Study Plan is Ready!</h2><p className="auth-subtitle">Based on your preferences, we've created a personalized study plan for you.</p><div className="plan-summary"><b>{level}</b><span>Exam: August 2026</span><b>Daily Study Target</b><span>{hours}</span></div><div className="focus-grid"><div>▣ <b>Concept learning</b><small>with visual explanations</small></div><div>▥ <b>Daily practice</b><small>MCQs and topic tests</small></div><div>◷ <b>Weekly revision</b><small>Mock exams and reviews</small></div><div>✦ <b>AI doubt solving</b><small>24/7 support</small></div></div><button className="primary-button onboarding-action" onClick={() => router.push("/dashboard")}>Go to My Dashboard →</button></div>}
    </div></section>
  </main>;
}
