import { describe, expect, it } from "vitest";
import { signInSchema, signUpSchema } from "../src/modules/auth/auth.schema.js";

describe("auth schemas", () => {
  it("accepts valid sign-up data", () => {
    const result = signUpSchema.safeParse({
      email: "student@example.com",
      password: "password123",
      displayName: "CFA Student",
    });

    expect(result.success).toBe(true);
  });

  it("rejects weak passwords", () => {
    const result = signInSchema.safeParse({
      email: "student@example.com",
      password: "short",
    });

    expect(result.success).toBe(false);
  });
});
