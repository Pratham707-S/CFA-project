import { describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";

describe("dashboard API", () => {
  it("requires an authenticated session", async () => {
    const app = createApp();
    const response = await app.inject({ method: "GET", url: "/dashboard" });
    expect(response.statusCode).toBe(401);
    await app.close();
  });

  it("returns a dashboard envelope for an authenticated user", async () => {
    const app = createApp();
    const signup = await app.inject({ method: "POST", url: "/auth/signup", payload: { email: "dashboard@example.com", password: "password123", displayName: "Dashboard Student" } });
    const setCookie = signup.headers["set-cookie"];
    const cookie = Array.isArray(setCookie) ? setCookie[0]?.split(";")[0] : setCookie?.split(";")[0];
    const response = await app.inject({ method: "GET", url: "/dashboard", headers: { cookie } });
    expect(response.statusCode).toBe(404);
    expect(response.json().error.code).toBe("DASHBOARD_NOT_FOUND");
    await app.close();
  });
});
