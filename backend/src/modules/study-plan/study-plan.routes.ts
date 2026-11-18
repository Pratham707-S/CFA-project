import type { FastifyInstance } from "fastify";
import { HttpError } from "../../shared/errors/http-error.js";
import type { AuthService } from "../auth/auth.service.js";
import { SESSION_COOKIE_NAME } from "../auth/token.js";
import type { StudyPlanRepository } from "./study-plan.repository.js";

async function requireUserId(request: { cookies: Record<string, string | undefined> }, auth: AuthService): Promise<string> {
  const token = request.cookies[SESSION_COOKIE_NAME];
  if (!token) throw new HttpError(401, "Sign in is required.", "UNAUTHENTICATED");
  const user = await auth.authenticateSession(token);
  if (!user) throw new HttpError(401, "Session is no longer valid.", "INVALID_SESSION");
  return user.id;
}

export function registerStudyPlanRoutes(app: FastifyInstance, repository: StudyPlanRepository, auth: AuthService) {
  app.get("/study-plan", async (request) => ({ studyPlan: await repository.findActive(await requireUserId(request, auth)) }));
  app.post("/study-plan/generate", async (request) => ({ studyPlan: await repository.createNext(await requireUserId(request, auth)) }));
}
