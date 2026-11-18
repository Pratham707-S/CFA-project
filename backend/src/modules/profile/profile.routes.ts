import type { FastifyInstance } from "fastify";
import { HttpError } from "../../shared/errors/http-error.js";
import type { AuthService } from "../auth/auth.service.js";
import { SESSION_COOKIE_NAME } from "../auth/token.js";
import { cfaProfileInputSchema } from "./profile.schema.js";
import type { ProfileRepository } from "./profile.repository.js";

async function requireUserId(request: { cookies: Record<string, string | undefined> }, auth: AuthService): Promise<string> {
  const token = request.cookies[SESSION_COOKIE_NAME];
  if (!token) throw new HttpError(401, "Sign in is required.", "UNAUTHENTICATED");
  const user = await auth.authenticateSession(token);
  if (!user) throw new HttpError(401, "Session is no longer valid.", "INVALID_SESSION");
  return user.id;
}

export function registerProfileRoutes(app: FastifyInstance, repository: ProfileRepository, auth: AuthService) {
  app.get("/profile", async (request) => {
    const userId = await requireUserId(request, auth);
    return { profile: await repository.findByUserId(userId) };
  });

  app.put("/profile", async (request) => {
    const userId = await requireUserId(request, auth);
    const input = cfaProfileInputSchema.parse(request.body);
    return { profile: await repository.upsert(userId, input) };
  });
}
