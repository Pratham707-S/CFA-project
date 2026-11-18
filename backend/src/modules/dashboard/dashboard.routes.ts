import type { FastifyInstance } from "fastify";
import { HttpError } from "../../shared/errors/http-error.js";
import type { AuthService } from "../auth/auth.service.js";
import { SESSION_COOKIE_NAME } from "../auth/token.js";
import type { DashboardRepository } from "./dashboard.repository.js";

export function registerDashboardRoutes(app: FastifyInstance, repository: DashboardRepository, auth: AuthService) {
  app.get("/dashboard", async (request) => {
    const token = request.cookies[SESSION_COOKIE_NAME];
    if (!token) throw new HttpError(401, "Sign in is required.", "UNAUTHENTICATED");
    const user = await auth.authenticateSession(token);
    if (!user) throw new HttpError(401, "Session is no longer valid.", "INVALID_SESSION");
    const dashboard = await repository.getForUser(user.id);
    if (!dashboard) throw new HttpError(404, "Dashboard data was not found.", "DASHBOARD_NOT_FOUND");
    return dashboard;
  });
}
