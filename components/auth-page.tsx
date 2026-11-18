"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:4000";

export function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const router = useRouter();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true); setErrorMessage(""); setSuccessMessage("");
    const data = new FormData(event.currentTarget);
    const payload = isSignUp ? { displayName: String(data.get("name") ?? ""), email: String(data.get("email") ?? ""), password: String(data.get("password") ?? "") } : { email: String(data.get("email") ?? ""), password: String(data.get("password") ?? "") };
    try {
      const response = await fetch(`${API_URL}/auth/${isSignUp ? "signup" : "signin"}`, { method: "POST", credentials: "include", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error?.message ?? "Authentication failed.");
      setSuccessMessage(isSignUp ? "Account created. Opening your CFA profile…" : "Signed in successfully. Opening your plan…");
      window.setTimeout(() => router.push("/onboarding"), 250);
    } catch (error) { setErrorMessage(error instanceof Error ? error.message : "Something went wrong. Please try again."); } finally { setIsLoading(false); }
  }

  return <main className="auth-page"><div className="auth-visual"><a className="auth-brand" href="/">● CFA Prep</a><div className="auth-visual-copy" /></div><section className="auth-panel"><div className="auth-card"><p className="eyebrow"><span /> {isSignUp ? "Start your plan" : "Welcome back"}</p><h2>{isSignUp ? "Build your CFA rhythm." : "Your next clear step starts here."}</h2><p className="auth-subtitle">{isSignUp ? "Create your account and make a plan that fits your life." : "Sign in to continue your CFA plan."}</p><button className="social-auth" type="button" disabled aria-disabled="true"><svg className="google-mark" viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M21.6 12.23c0-.72-.06-1.42-.18-2.09H12v3.96h5.38a4.6 4.6 0 0 1-1.99 3.02v2.51h3.22c1.89-1.74 2.99-4.3 2.99-7.4Z"/><path fill="#34A853" d="M12 22c2.7 0 4.96-.9 6.61-2.37l-3.22-2.51c-.9.6-2.05.96-3.39.96-2.61 0-4.83-1.76-5.62-4.13H3.05v2.59A10 10 0 0 0 12 22Z"/><path fill="#FBBC05" d="M6.38 13.95A6 6 0 0 1 6.06 12c0-.68.12-1.34.32-1.95V7.46H3.05A10 10 0 0 0 2 12c0 1.63.39 3.17 1.05 4.54l3.33-2.59Z"/><path fill="#EA4335" d="M12 5.92c1.47 0 2.79.5 3.83 1.49l2.87-2.87C16.95 2.9 14.7 2 12 2a9.99 9.99 0 0 0-8.95 5.46l3.33 2.59C7.17 7.68 9.39 5.92 12 5.92Z"/></svg><span>Google OAuth coming soon</span></button><div className="auth-divider"><span>or continue with email</span></div><form onSubmit={handleSubmit}>{isSignUp && <label>Full name<input name="name" type="text" placeholder="Your name" autoComplete="name" required /></label>}<label>Email address<input name="email" type="email" placeholder="you@example.com" autoComplete="email" required /></label><label>Password<input name="password" type="password" placeholder="At least 8 characters" autoComplete={isSignUp ? "new-password" : "current-password"} required /></label>{errorMessage && <p className="form-message error-message" role="alert">{errorMessage}</p>}{successMessage && <p className="form-message success-message" role="status">{successMessage}</p>}<button className="primary-button auth-submit" type="submit" disabled={isLoading}>{isLoading ? "Checking…" : isSignUp ? "Create account" : "Continue"} {!isLoading && <span>↗</span>}</button></form>{!isSignUp && <a className="forgot-link" href="/login">Forgot password?</a>}<p className="auth-switch">{isSignUp ? "Already have an account?" : "New to CFA Prep?"} <button type="button" onClick={() => { setIsSignUp((value) => !value); setErrorMessage(""); setSuccessMessage(""); }}>{isSignUp ? "Log in" : "Create an account"}</button></p></div></section></main>;
}
