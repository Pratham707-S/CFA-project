import { HttpError } from "../errors/http-error.js";
import { SESSION_COOKIE_NAME } from "../../modules/auth/token.js";

export type AuthenticatedUser = {
  id: string;
  email: string;
  displayName: string | null;
  role: "STUDENT" | "ADMIN";
};

export interface SessionAuthenticator {
  authenticateSession(token: string): Promise<AuthenticatedUser | null>;
}

export async function requireSessionUser(
  request: { cookies: Record<string, string | undefined> },
  auth: SessionAuthenticator,
): Promise<AuthenticatedUser> {
  const token = request.cookies[SESSION_COOKIE_NAME];
  if (!token) throw new HttpError(401, "Sign in is required.", "UNAUTHENTICATED");
  const user = await auth.authenticateSession(token);
  if (!user) throw new HttpError(401, "Session is no longer valid.", "INVALID_SESSION");
  return user;
}

export async function requireAdminUser(
  request: { cookies: Record<string, string | undefined> },
  auth: SessionAuthenticator,
): Promise<AuthenticatedUser> {
  const user = await requireSessionUser(request, auth);
  if (user.role !== "ADMIN") throw new HttpError(403, "Administrator access is required.", "FORBIDDEN");
  return user;
}
