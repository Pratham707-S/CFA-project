export function getLocalTestDatabaseUrl(environment: Record<string, string | undefined>): string {
  if (environment.NODE_ENV === "production") {
    throw new Error("Refusing to use a test database while NODE_ENV is production.");
  }
  const connectionString = environment.CFA_TEST_DATABASE_URL;
  if (!connectionString) {
    throw new Error("CFA_TEST_DATABASE_URL is required for PostgreSQL integration tests.");
  }

  let url: URL;
  try {
    url = new URL(connectionString);
  } catch {
    throw new Error("CFA_TEST_DATABASE_URL must be a valid PostgreSQL connection URL.");
  }
  if (url.protocol !== "postgresql:" && url.protocol !== "postgres:") {
    throw new Error("CFA_TEST_DATABASE_URL must use the PostgreSQL protocol.");
  }
  if (!new Set(["localhost", "127.0.0.1", "::1", "[::1]"]).has(url.hostname)) {
    throw new Error("Integration tests may connect only to a loopback PostgreSQL host.");
  }
  if (url.pathname !== "/cfa_prep_test") {
    throw new Error("Integration tests may connect only to the dedicated cfa_prep_test database.");
  }
  return connectionString;
}
