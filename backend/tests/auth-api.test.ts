import { describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";

describe("email and password auth API", () => {
  it("creates an account and signs in with the same password", async () => {
    const app = createApp();
    const signup = await app.inject({
      method: "POST",
      url: "/auth/signup",
      payload: { email: "student@example.com", password: "password123", displayName: "CFA Student" },
    });
    const signin = await app.inject({
      method: "POST",
      url: "/auth/signin",
      payload: { email: "student@example.com", password: "password123" },
    });

    expect(signup.statusCode).toBe(201);
    expect(signup.json().token).toBeUndefined();
    expect(signup.headers["set-cookie"]).toContain("cfa_session=");
    expect(signup.headers["set-cookie"]).toContain("HttpOnly");
    expect(signup.headers["set-cookie"]).toContain("SameSite=Lax");
    expect(signin.statusCode).toBe(200);
    expect(signin.json().user.email).toBe("student@example.com");
    expect(signin.json().token).toBeUndefined();
    expect(signin.headers["set-cookie"]).toContain("cfa_session=");
    await app.close();
  });

  it("rejects an incorrect password", async () => {
    const app = createApp();
    await app.inject({ method: "POST", url: "/auth/signup", payload: { email: "student@example.com", password: "password123", displayName: "CFA Student" } });
    const response = await app.inject({ method: "POST", url: "/auth/signin", payload: { email: "student@example.com", password: "wrongpass" } });

    expect(response.statusCode).toBe(401);
    expect(response.json().error.code).toBe("INVALID_CREDENTIALS");
    await app.close();
  });

  it("rejects duplicate email registration", async () => {
    const app = createApp();
    const payload = { email: "duplicate@example.com", password: "password123", displayName: "CFA Student" };
    await app.inject({ method: "POST", url: "/auth/signup", payload });
    const response = await app.inject({ method: "POST", url: "/auth/signup", payload });

    expect(response.statusCode).toBe(409);
    expect(response.json().error.code).toBe("EMAIL_EXISTS");
    await app.close();
  });

  it("protects the session, then logs it out", async () => {
    const app = createApp();
    const signup = await app.inject({ method: "POST", url: "/auth/signup", payload: { email: "session@example.com", password: "password123", displayName: "Session Student" } });
    const setCookie = signup.headers["set-cookie"];
    const cookie = Array.isArray(setCookie) ? setCookie[0]?.split(";")[0] : setCookie?.split(";")[0];
    const me = await app.inject({ method: "GET", url: "/auth/me", headers: { cookie } });
    const logout = await app.inject({ method: "POST", url: "/auth/logout", headers: { cookie } });
    const unauthenticated = await app.inject({ method: "GET", url: "/auth/me", headers: { cookie } });

    expect(me.statusCode).toBe(200);
    expect(me.json().user.role).toBe("STUDENT");
    expect(logout.statusCode).toBe(200);
    expect(unauthenticated.statusCode).toBe(401);
    await app.close();
  });
});
