import { describe, expect, it } from "vitest";
import { parseEnvironment } from "../src/config/env.js";

describe("environment security settings", () => {
  it("requires a configured JWT secret in production", () => {
    expect(() => parseEnvironment({ NODE_ENV: "production", DATABASE_URL: "postgresql://user:pass@db.example.test/app", CORS_ORIGINS: "https://learn.example.test" })).toThrow(/JWT_SECRET is required in production/);
  });

  it("does not require a JWT secret for the test environment", () => {
    expect(parseEnvironment({ NODE_ENV: "test" }).JWT_SECRET).toBeUndefined();
  });

  it("requires a production database and explicit HTTPS CORS origins", () => {
    const jwtSecret = "a".repeat(48);
    expect(() => parseEnvironment({ NODE_ENV: "production", JWT_SECRET: jwtSecret })).toThrow(/DATABASE_URL is required in production/);
    expect(() => parseEnvironment({ NODE_ENV: "production", JWT_SECRET: jwtSecret, DATABASE_URL: "postgresql://user:pass@db.example.test/app" })).toThrow(/CORS_ORIGINS is required in production/);
    expect(() => parseEnvironment({ NODE_ENV: "production", JWT_SECRET: jwtSecret, DATABASE_URL: "postgresql://user:pass@db.example.test/app", CORS_ORIGINS: "http://learn.example.test" })).toThrow(/production origins must use HTTPS/);
  });

  it("requires a production JWT secret sized for 32 random bytes", () => {
    expect(() => parseEnvironment({ NODE_ENV: "production", JWT_SECRET: "x".repeat(32), DATABASE_URL: "postgresql://user:pass@db.example.test/app", CORS_ORIGINS: "https://learn.example.test" }))
      .toThrow(/at least 43 characters in production/);
  });

  it("parses exact comma-separated allowed origins and rejects paths", () => {
    expect(parseEnvironment({ NODE_ENV: "test", CORS_ORIGINS: "https://learn.example.test, https://admin.example.test" }).CORS_ORIGINS)
      .toEqual(["https://learn.example.test", "https://admin.example.test"]);
    expect(() => parseEnvironment({ NODE_ENV: "test", CORS_ORIGINS: "https://learn.example.test/path" })).toThrow(/exact origins/);
  });
});
