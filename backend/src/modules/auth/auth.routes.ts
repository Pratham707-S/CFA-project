import type { FastifyInstance } from "fastify";
import { signInSchema, signUpSchema } from "./auth.schema.js";
import { AuthService } from "./auth.service.js";
import { SESSION_COOKIE_NAME, verifySessionToken } from "./token.js";
import { env } from "../../config/env.js";

export function registerAuthRoutes(app: FastifyInstance, service: AuthService) {
  const cookieOptions = { httpOnly: true, sameSite: "lax" as const, secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 7 };

  app.post("/auth/signup", { config: { rateLimit: { max: 5, timeWindow: "1 hour" } } }, async (request, reply) => {
    const input = signUpSchema.parse(request.body);
    const result = await service.signUp(input);
    reply.setCookie(SESSION_COOKIE_NAME, result.token, cookieOptions);
    return reply.status(201).send({ user: result.user });
  });

  app.post("/auth/signin", { config: { rateLimit: { max: 5, timeWindow: "15 minutes" } } }, async (request, reply) => {
    const input = signInSchema.parse(request.body);
    const result = await service.signIn(input);
    reply.setCookie(SESSION_COOKIE_NAME, result.token, cookieOptions);
    return { user: result.user };
  });

  app.post("/auth/logout", async (_request, reply) => {
    const token = _request.cookies[SESSION_COOKIE_NAME];
    if (token) await service.revokeSession(token);
    reply.clearCookie(SESSION_COOKIE_NAME, { path: "/" });
    return { success: true };
  });

  app.get("/auth/me", async (request, reply) => {
    const token = request.cookies[SESSION_COOKIE_NAME];
    if (!token) return reply.status(401).send({ error: { code: "UNAUTHENTICATED", message: "Sign in is required." } });
    if (await service.isSessionRevoked(token)) return reply.status(401).send({ error: { code: "INVALID_SESSION", message: "Session is no longer valid." } });
    try {
      const { userId } = await verifySessionToken(token, env.JWT_SECRET);
      const user = await service.findById(userId);
      if (!user) return reply.status(401).send({ error: { code: "INVALID_SESSION", message: "Session is no longer valid." } });
      return { user };
    } catch {
      return reply.status(401).send({ error: { code: "INVALID_SESSION", message: "Session is no longer valid." } });
    }
  });
}
