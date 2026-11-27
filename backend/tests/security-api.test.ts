import { afterAll, describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";

const app = createApp();

describe("API origin security", () => {
  afterAll(async () => app.close());

  it("returns credentialed CORS headers only for an explicit development origin", async () => {
    const allowed = await app.inject({
      method: "OPTIONS",
      url: "/auth/logout",
      headers: { origin: "http://localhost:3000", "access-control-request-method": "POST" },
    });
    expect(allowed.headers["access-control-allow-origin"]).toBe("http://localhost:3000");
    expect(allowed.headers["access-control-allow-credentials"]).toBe("true");

    const rejected = await app.inject({
      method: "OPTIONS",
      url: "/auth/logout",
      headers: { origin: "https://attacker.example", "access-control-request-method": "POST" },
    });
    expect(rejected.headers["access-control-allow-origin"]).toBeUndefined();
  });

  it("rejects state-changing requests from untrusted origins", async () => {
    const response = await app.inject({ method: "POST", url: "/auth/logout", headers: { origin: "https://attacker.example" } });
    expect(response.statusCode).toBe(403);
    expect(response.json().error.code).toBe("UNTRUSTED_ORIGIN");
  });

  it("limits repeated question-attempt requests", async () => {
    for (let attempt = 0; attempt < 30; attempt += 1) {
      const response = await app.inject({ method: "POST", url: "/api/questions/nonexistent/attempt", payload: { selectedAnswer: "A" } });
      expect(response.statusCode).toBe(401);
    }
    const limited = await app.inject({ method: "POST", url: "/api/questions/nonexistent/attempt", payload: { selectedAnswer: "A" } });
    expect(limited.statusCode).toBe(429);
  });

});
