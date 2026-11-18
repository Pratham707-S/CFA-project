import { describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";

describe("CFA profile API", () => {
  it("requires authentication", async () => {
    const app = createApp();
    const response = await app.inject({ method: "GET", url: "/profile" });
    expect(response.statusCode).toBe(401);
    await app.close();
  });

  it("creates and updates the authenticated user's profile", async () => {
    const app = createApp();
    const signup = await app.inject({ method: "POST", url: "/auth/signup", payload: { email: "profile@example.com", password: "password123", displayName: "Profile Student" } });
    const setCookie = signup.headers["set-cookie"];
    const cookie = Array.isArray(setCookie) ? setCookie[0]?.split(";")[0] : setCookie?.split(";")[0];
    const created = await app.inject({ method: "PUT", url: "/profile", headers: { cookie }, payload: { level: "LEVEL_I", examDate: "2026-08-20", status: "FIRST_ATTEMPT", experience: "BEGINNER" } });
    const fetched = await app.inject({ method: "GET", url: "/profile", headers: { cookie } });
    expect(created.statusCode).toBe(200);
    expect(created.json().profile.level).toBe("LEVEL_I");
    expect(fetched.json().profile.experience).toBe("BEGINNER");
    await app.close();
  });
});
