import Fastify from "fastify";
import cors from "@fastify/cors";
import cookie from "@fastify/cookie";
import { ZodError } from "zod";
import { HttpError } from "./shared/errors/http-error.js";
import { MemoryAuthRepository } from "./modules/auth/memory-auth.repository.js";
import { AuthService } from "./modules/auth/auth.service.js";
import { registerAuthRoutes } from "./modules/auth/auth.routes.js";
import { PrismaAuthRepository } from "./modules/auth/prisma-auth.repository.js";
import { getPrismaClient } from "./shared/db/prisma.js";
import { MemoryProfileRepository } from "./modules/profile/memory-profile.repository.js";
import { PrismaProfileRepository } from "./modules/profile/prisma-profile.repository.js";
import { registerProfileRoutes } from "./modules/profile/profile.routes.js";
import { MemoryOnboardingRepository } from "./modules/onboarding/memory-onboarding.repository.js";
import { PrismaOnboardingRepository } from "./modules/onboarding/prisma-onboarding.repository.js";
import { registerOnboardingRoutes } from "./modules/onboarding/onboarding.routes.js";
import { MemoryStudyPlanRepository } from "./modules/study-plan/memory-study-plan.repository.js";
import { PrismaStudyPlanRepository } from "./modules/study-plan/prisma-study-plan.repository.js";
import { registerStudyPlanRoutes } from "./modules/study-plan/study-plan.routes.js";
import { MemoryDashboardRepository } from "./modules/dashboard/memory-dashboard.repository.js";
import { PrismaDashboardRepository } from "./modules/dashboard/prisma-dashboard.repository.js";
import { registerDashboardRoutes } from "./modules/dashboard/dashboard.routes.js";

export function createApp() {
  const app = Fastify({ logger: false });

  app.register(cors, { origin: true, credentials: true });
  app.register(cookie);

  app.get("/health", async () => ({ status: "ok", service: "cfa-platform-backend" }));
  const authRepository = process.env.DATABASE_URL ? new PrismaAuthRepository(getPrismaClient()) : new MemoryAuthRepository();
  const authService = new AuthService(authRepository, process.env.JWT_SECRET ?? "development-only-secret-change-me-123456");
  registerAuthRoutes(app, authService);
  const profileRepository = process.env.DATABASE_URL ? new PrismaProfileRepository(getPrismaClient()) : new MemoryProfileRepository();
  registerProfileRoutes(app, profileRepository, authService);
  const onboardingRepository = process.env.DATABASE_URL ? new PrismaOnboardingRepository(getPrismaClient()) : new MemoryOnboardingRepository();
  registerOnboardingRoutes(app, onboardingRepository, authService);
  const studyPlanRepository = process.env.DATABASE_URL ? new PrismaStudyPlanRepository(getPrismaClient()) : new MemoryStudyPlanRepository();
  registerStudyPlanRoutes(app, studyPlanRepository, authService);
  const dashboardRepository = process.env.DATABASE_URL ? new PrismaDashboardRepository(getPrismaClient()) : new MemoryDashboardRepository();
  registerDashboardRoutes(app, dashboardRepository, authService);

  app.setErrorHandler((error, _request, reply) => {
    const statusCode = error instanceof HttpError ? error.statusCode : error instanceof ZodError ? 400 : 500;
    const code = error instanceof HttpError ? error.code : error instanceof ZodError ? "VALIDATION_ERROR" : "INTERNAL_SERVER_ERROR";
    const message = error instanceof HttpError ? error.message : error instanceof ZodError ? "Please check the submitted fields." : "Something went wrong.";
    reply.status(statusCode).send({ error: { code, message } });
  });

  return app;
}
