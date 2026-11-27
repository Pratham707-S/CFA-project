const confirmationText = "I_VERIFIED_THIS_IS_NOT_PRODUCTION";

export type SeedTargetEnvironment = Record<string, string | undefined>;

export function getSafeSeedDatabaseUrl(environment: SeedTargetEnvironment): string {
  if (environment.NODE_ENV === "production") {
    throw new Error("Refusing to seed while NODE_ENV is production.");
  }
  if (environment.CFA_SEED_TARGET !== "local" && environment.CFA_SEED_TARGET !== "staging") {
    throw new Error("Set CFA_SEED_TARGET to local or staging before seeding.");
  }
  if (environment.CFA_SEED_CONFIRM_NONPRODUCTION !== confirmationText) {
    throw new Error("Confirm the seed target by setting CFA_SEED_CONFIRM_NONPRODUCTION to the documented non-production confirmation value.");
  }
  const seedUrl = environment.CFA_SEED_DATABASE_URL;
  if (!seedUrl || seedUrl === environment.DATABASE_URL) {
    throw new Error("Set a separate CFA_SEED_DATABASE_URL for the verified non-production database.");
  }
  let parsed: URL;
  try {
    parsed = new URL(seedUrl);
  } catch {
    throw new Error("CFA_SEED_DATABASE_URL must be a valid PostgreSQL connection URL.");
  }
  if (parsed.protocol !== "postgresql:" && parsed.protocol !== "postgres:") {
    throw new Error("CFA_SEED_DATABASE_URL must use the PostgreSQL protocol.");
  }
  if (environment.DATABASE_URL) {
    const configuredDatabase = new URL(environment.DATABASE_URL);
    if (configuredDatabase.host === parsed.host && configuredDatabase.pathname === parsed.pathname) {
      throw new Error("CFA_SEED_DATABASE_URL points to the same database as DATABASE_URL; choose a distinct local or staging database.");
    }
  }
  return seedUrl;
}
