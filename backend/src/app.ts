import Fastify from "fastify";
import cors from "@fastify/cors";
import cookie from "@fastify/cookie";
import rateLimit from "@fastify/rate-limit";
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
import { MemoryLearningRepository } from "./modules/learning/memory-learning.repository.js";
import { PrismaLearningRepository } from "./modules/learning/prisma-learning.repository.js";
import { registerLearningRoutes } from "./modules/learning/learning.routes.js";
import { env } from "./config/env.js";

export function createApp() {
  const app = Fastify({ logger: false });

  app.register(cors, { origin: env.CORS_ORIGINS, credentials: true, methods: ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"] });
  app.addHook("onRequest", async (request, reply) => {
    const isWrite = ["POST", "PUT", "PATCH", "DELETE"].includes(request.method);
    const requestOrigin = request.headers.origin;
    if (isWrite && env.NODE_ENV === "production" && !requestOrigin) {
      return reply.status(403).send({ error: { code: "ORIGIN_REQUIRED", message: "A trusted request origin is required." } });
    }
    if (isWrite && requestOrigin && !env.CORS_ORIGINS.includes(requestOrigin)) {
      return reply.status(403).send({ error: { code: "UNTRUSTED_ORIGIN", message: "Request origin is not allowed." } });
    }
  });
  app.register(cookie);

  app.get("/health", async () => ({ status: "ok", service: "cfa-platform-backend" }));
  app.register(async (routes) => {
    await routes.register(rateLimit, { global: false, hook: "preHandler" });
    await routes.after();

    const authRepository = process.env.DATABASE_URL ? new PrismaAuthRepository(getPrismaClient()) : new MemoryAuthRepository();
    const authService = new AuthService(authRepository, env.JWT_SECRET);
    registerAuthRoutes(routes, authService);
    const profileRepository = process.env.DATABASE_URL ? new PrismaProfileRepository(getPrismaClient()) : new MemoryProfileRepository();
    registerProfileRoutes(routes, profileRepository, authService);
    const onboardingRepository = process.env.DATABASE_URL ? new PrismaOnboardingRepository(getPrismaClient()) : new MemoryOnboardingRepository();
    registerOnboardingRoutes(routes, onboardingRepository, authService);
    const studyPlanRepository = process.env.DATABASE_URL ? new PrismaStudyPlanRepository(getPrismaClient()) : new MemoryStudyPlanRepository();
    registerStudyPlanRoutes(routes, studyPlanRepository, authService);
    const dashboardRepository = process.env.DATABASE_URL ? new PrismaDashboardRepository(getPrismaClient()) : new MemoryDashboardRepository();
    registerDashboardRoutes(routes, dashboardRepository, authService);
    const learningRepository = process.env.DATABASE_URL ? new PrismaLearningRepository(getPrismaClient()) : new MemoryLearningRepository();
    registerLearningRoutes(routes, learningRepository, authService);
  });

  app.setErrorHandler((error, _request, reply) => {
    if (!(error instanceof HttpError) && !(error instanceof ZodError)) {
      console.error("Unhandled request error", error);
    }
    const isRateLimited = error instanceof Error && "statusCode" in error && error.statusCode === 429;
    const statusCode = error instanceof HttpError ? error.statusCode : error instanceof ZodError ? 400 : isRateLimited ? 429 : 500;
    const code = error instanceof HttpError ? error.code : error instanceof ZodError ? "VALIDATION_ERROR" : isRateLimited ? "RATE_LIMITED" : "INTERNAL_SERVER_ERROR";
    const message = error instanceof HttpError ? error.message : error instanceof ZodError ? "Please check the submitted fields." : isRateLimited ? "Too many requests. Please try again later." : "Something went wrong.";
    reply.status(statusCode).send({ error: { code, message } });
  });

  return app;
}
