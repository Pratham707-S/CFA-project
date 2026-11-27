import { describe, expect, it } from "vitest";
import { getSafeSeedDatabaseUrl } from "../src/config/safe-seed-target.js";

const confirmation = "I_VERIFIED_THIS_IS_NOT_PRODUCTION";

describe("safe seed target guard", () => {
  it("requires explicit local or staging target, confirmation, and a separate PostgreSQL URL", () => {
    const base = {
      NODE_ENV: "development",
      DATABASE_URL: "postgresql://configured-main.example.test/app",
      CFA_SEED_TARGET: "staging",
      CFA_SEED_CONFIRM_NONPRODUCTION: confirmation,
      CFA_SEED_DATABASE_URL: "postgresql://staging.example.test/app",
    };
    expect(getSafeSeedDatabaseUrl(base)).toBe(base.CFA_SEED_DATABASE_URL);
    expect(() => getSafeSeedDatabaseUrl({ ...base, NODE_ENV: "production" })).toThrow(/NODE_ENV is production/);
    expect(() => getSafeSeedDatabaseUrl({ ...base, CFA_SEED_TARGET: "production" })).toThrow(/local or staging/);
    expect(() => getSafeSeedDatabaseUrl({ ...base, CFA_SEED_DATABASE_URL: base.DATABASE_URL })).toThrow(/separate CFA_SEED_DATABASE_URL/);
    expect(() => getSafeSeedDatabaseUrl({ ...base, CFA_SEED_DATABASE_URL: `${base.DATABASE_URL}?sslmode=require` })).toThrow(/same database as DATABASE_URL/);
    expect(() => getSafeSeedDatabaseUrl({ ...base, CFA_SEED_CONFIRM_NONPRODUCTION: "yes" })).toThrow(/Confirm the seed target/);
    expect(() => getSafeSeedDatabaseUrl({ ...base, CFA_SEED_DATABASE_URL: "https://example.test" })).toThrow(/PostgreSQL protocol/);
  });
});
