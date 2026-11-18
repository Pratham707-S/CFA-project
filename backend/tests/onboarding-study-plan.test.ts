import { describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";

describe("onboarding and study plan APIs", () => {
  it("saves preferences, completes onboarding, and generates a plan", async () => {
    const app = createApp();
    const signup = await app.inject({ method: "POST", url: "/auth/signup", payload: { email: "onboarding@example.com", password: "password123", displayName: "Onboarding Student" } });
    const setCookie = signup.headers["set-cookie"];
    const cookie = Array.isArray(setCookie) ? setCookie[0]?.split(";")[0] : setCookie?.split(";")[0];
    const saved = await app.inject({ method: "PUT", url: "/onboarding/preferences", headers: { cookie }, payload: { dailyStudyHours: 2, studyDays: ["MONDAY", "WEDNESDAY"], learningStyle: "VISUAL", strongSubjects: ["Ethics"], weakSubjects: ["Quantitative Methods"] } });
    const completed = await app.inject({ method: "POST", url: "/onboarding/preferences/complete", headers: { cookie } });
    const generated = await app.inject({ method: "POST", url: "/study-plan/generate", headers: { cookie } });
    const current = await app.inject({ method: "GET", url: "/study-plan", headers: { cookie } });
    expect(saved.statusCode).toBe(200);
    expect(completed.json().preferences.completedAt).toBeTruthy();
    expect(generated.json().studyPlan.status).toBe("ACTIVE");
    expect(current.json().studyPlan.version).toBe(1);
    await app.close();
  });
});
