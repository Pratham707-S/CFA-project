import type { FastifyInstance } from "fastify";
import { HttpError } from "../../shared/errors/http-error.js";
import type { AuthService } from "../auth/auth.service.js";
import { SESSION_COOKIE_NAME } from "../auth/token.js";
import type { OnboardingRepository } from "./onboarding.repository.js";
import { onboardingPreferencesInputSchema } from "./onboarding.schema.js";

async function requireUserId(request: { cookies: Record<string, string | undefined> }, auth: AuthService): Promise<string> {
  const token = request.cookies[SESSION_COOKIE_NAME];
  if (!token) throw new HttpError(401, "Sign in is required.", "UNAUTHENTICATED");
  const user = await auth.authenticateSession(token);
  if (!user) throw new HttpError(401, "Session is no longer valid.", "INVALID_SESSION");
  return user.id;
}

export function registerOnboardingRoutes(app: FastifyInstance, repository: OnboardingRepository, auth: AuthService) {
  app.get("/onboarding/preferences", async (request) => ({ preferences: await repository.findByUserId(await requireUserId(request, auth)) }));

  app.put("/onboarding/preferences", async (request) => {
    const userId = await requireUserId(request, auth);
    const input = onboardingPreferencesInputSchema.parse(request.body);
    return { preferences: await repository.upsert(userId, input) };
  });

  app.post("/onboarding/preferences/complete", async (request) => {
    const value = await repository.markComplete(await requireUserId(request, auth));
    if (!value) throw new HttpError(404, "Save your preferences before completing onboarding.", "PREFERENCES_NOT_FOUND");
    return { preferences: value };
  });
}
