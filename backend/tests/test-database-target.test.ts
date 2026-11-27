import { describe, expect, it } from "vitest";
import { getLocalTestDatabaseUrl } from "../src/config/test-database-target.js";

describe("local integration database guard", () => {
  const local =
    "postgresql://cfa_test:cfa_test@127.0.0.1:5432/cfa_prep_test?schema=public";

  it("accepts only the dedicated loopback test database", () => {
    expect(
      getLocalTestDatabaseUrl({
        NODE_ENV: "test",
        CFA_TEST_DATABASE_URL: local,
      }),
    ).toBe(local);
  });

  it.each([
    { NODE_ENV: "production", CFA_TEST_DATABASE_URL: local },
    {
      NODE_ENV: "test",
      CFA_TEST_DATABASE_URL: "postgresql://user:pass@db.example/cfa_prep_test",
    },
    {
      NODE_ENV: "test",
      CFA_TEST_DATABASE_URL: "postgresql://user:pass@127.0.0.1/production",
    },
  ])("rejects a non-test target", (environment) => {
    expect(() => getLocalTestDatabaseUrl(environment)).toThrow();
  });
});
