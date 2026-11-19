"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";

const steps = ["Account", "CFA Profile", "Study Preferences", "Complete"];
const levelMap = { "CFA Level I": "LEVEL_I", "CFA Level II": "LEVEL_II", "CFA Level III": "LEVEL_III" } as const;
const hoursMap = { "< 1 hour": 1, "1–2 hours": 2, "2–4 hours": 4, "4+ hours": 5 } as const;

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(2);
  const [level, setLevel] = useState<keyof typeof levelMap>("CFA Level I");
  const [hours, setHours] = useState<keyof typeof hoursMap>("1–2 hours");
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function saveProfile() {
    setIsSaving(true); setErrorMessage("");
    try {
      await apiRequest("/profile", { method: "PUT", body: JSON.stringify({ level: levelMap[level], examDate: "2026-08-20", status: "FIRST_ATTEMPT", experience: "BEGINNER" }) });
      setStep(3);
    } catch (error) { setErrorMessage(error instanceof Error ? error.message : "Could not save your profile."); } finally { setIsSaving(false); }
  }

  async function savePreferences() {
    setIsSaving(true); setErrorMessage("");
    try {
      try {
        await apiRequest("/onboarding/preferences", { method: "PUT", body: JSON.stringify({ dailyStudyHours: hoursMap[hours], studyDays: ["MONDAY", "WEDNESDAY", "FRIDAY"], learningStyle: "VISUAL", strongSubjects: [], weakSubjects: [] }) });
      } catch (error) {
        throw new Error(`Preferences save failed: ${error instanceof Error ? error.message : "request failed"}`);
      }
      try {
        await apiRequest("/onboarding/preferences/complete", { method: "POST" });
      } catch (error) {
        throw new Error(`Onboarding completion failed: ${error instanceof Error ? error.message : "request failed"}`);
      }
      try {
        await apiRequest("/study-plan/generate", { method: "POST" });
      } catch (error) {
        throw new Error(`Study plan generation failed: ${error instanceof Error ? error.message : "request failed"}`);
      }
      setStep(4);
    } catch (error) { setErrorMessage(error instanceof Error ? error.message : "Could not save your preferences."); } finally { setIsSaving(false); }
  }

  return <main className="onboarding-page">
    <aside className="onboarding-visual"><div className="auth-brand">● CFA Prep</div></aside>
    <section className="onboarding-panel"><div className="onboarding-card">
      <div className="stepper">{steps.map((label, index) => <div className={`step ${index + 1 <= step ? "active" : ""}`} key={label}><span>{index + 1 <= step ? "✓" : index + 1}</span><small>{label}</small></div>)}</div>
      {step === 2 && <><p className="eyebrow"><span /> CFA profile</p><h2>CFA Profile</h2><p className="auth-subtitle">Help us understand your current status.</p><h3>Which level are you preparing for?</h3><div className="choice-grid three">{(Object.keys(levelMap) as Array<keyof typeof levelMap>).map(item => <button type="button" className={`choice ${level === item ? "selected" : ""}`} onClick={() => setLevel(item)} key={item}><b>{item}</b><small>{item === "CFA Level I" ? "Foundation of investment knowledge" : item === "CFA Level II" ? "Application and analysis of concepts" : "Portfolio management and wealth planning"}</small></button>)}</div><h3>When is your exam?</h3><select className="select-field" defaultValue="2026-08-20"><option value="2026-08-20">August 2026</option><option value="2026-11-20">November 2026</option></select><div className="onboarding-actions"><button type="button" className="secondary-button" onClick={() => router.push("/login")}>← Back</button><button type="button" className="primary-button" onClick={saveProfile} disabled={isSaving}>{isSaving ? "Saving…" : "Continue →"}</button></div></>}
      {step === 3 && <><p className="eyebrow"><span /> Study preferences</p><h2>Study Preferences</h2><p className="auth-subtitle">You can change these anytime.</p><h3>How much time can you study each day?</h3><div className="choice-grid four">{(Object.keys(hoursMap) as Array<keyof typeof hoursMap>).map(item => <button type="button" className={`choice compact ${hours === item ? "selected" : ""}`} onClick={() => setHours(item)} key={item}><b>{item}</b><small>Study target</small></button>)}</div><h3>What is your main goal?</h3><div className="choice-grid three"><button type="button" className="choice compact selected"><b>Pass the CFA exam</b></button><button type="button" className="choice compact"><b>Build strong knowledge</b></button><button type="button" className="choice compact"><b>Improve weak subjects</b></button></div><div className="onboarding-actions"><button type="button" className="secondary-button" onClick={() => setStep(2)}>← Back</button><button type="button" className="primary-button" onClick={savePreferences} disabled={isSaving}>{isSaving ? "Saving…" : "Continue →"}</button></div></>}
      {step === 4 && <div className="complete-state"><div className="celebration">✦</div><h2>Your Study Plan is Ready!</h2><p className="auth-subtitle">Your preferences are saved and your first plan is ready.</p><div className="plan-summary"><b>{level}</b><span>Exam: August 2026</span><b>Daily Study Target</b><span>{hours}</span></div><div className="focus-grid"><div>▣ <b>Concept learning</b><small>with visual explanations</small></div><div>▥ <b>Daily practice</b><small>MCQs and topic tests</small></div><div>◷ <b>Weekly revision</b><small>Mock exams and reviews</small></div><div>✦ <b>AI doubt solving</b><small>Coming later</small></div></div><button type="button" className="primary-button onboarding-action" onClick={() => router.push("/dashboard")}>Go to My Dashboard →</button></div>}
      {errorMessage && <p className="form-message error-message" role="alert">{errorMessage}</p>}
    </div></section>
  </main>;
}
