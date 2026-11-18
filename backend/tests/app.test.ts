import { describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";

describe("backend app", () => {
  it("returns a healthy service response", async () => {
    const app = createApp();
    const response = await app.inject({ method: "GET", url: "/health" });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ status: "ok", service: "cfa-platform-backend" });
    await app.close();
  });
});
