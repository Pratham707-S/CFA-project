import { z } from "zod";

const developmentJwtSecret = "development-only-secret-change-me-123456";
const developmentCorsOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:3001",
];

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(4000),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().url().optional(),
  JWT_SECRET: z.string().min(32).optional(),
  CORS_ORIGINS: z.string().optional(),
}).superRefine((value, context) => {
  if (value.NODE_ENV === "production" && !value.JWT_SECRET) {
    context.addIssue({ code: "custom", path: ["JWT_SECRET"], message: "JWT_SECRET is required in production." });
  }
  if (value.NODE_ENV === "production" && value.JWT_SECRET && value.JWT_SECRET.length < 43) {
    context.addIssue({ code: "custom", path: ["JWT_SECRET"], message: "JWT_SECRET must be at least 43 characters in production; use at least 32 cryptographically random bytes encoded as base64url." });
  }
  if (value.NODE_ENV === "production" && !value.DATABASE_URL) {
    context.addIssue({ code: "custom", path: ["DATABASE_URL"], message: "DATABASE_URL is required in production." });
  }
  if (value.NODE_ENV === "production" && !value.CORS_ORIGINS?.trim()) {
    context.addIssue({ code: "custom", path: ["CORS_ORIGINS"], message: "CORS_ORIGINS is required in production." });
  }
});

export const parseEnvironment = (values: Record<string, string | undefined>) => {
  const parsed = envSchema.parse(values);
  const corsOrigins = (parsed.CORS_ORIGINS?.trim() ? parsed.CORS_ORIGINS.split(",") : developmentCorsOrigins)
    .map((origin) => origin.trim())
    .filter(Boolean);
  if (new Set(corsOrigins).size !== corsOrigins.length) {
    throw new Error("CORS_ORIGINS must not contain duplicates.");
  }
  for (const origin of corsOrigins) {
    let parsedOrigin: URL;
    try {
      parsedOrigin = new URL(origin);
    } catch {
      throw new Error("CORS_ORIGINS must contain valid origins without paths.");
    }
    if (parsedOrigin.origin !== origin || (parsed.NODE_ENV === "production" && parsedOrigin.protocol !== "https:")) {
      throw new Error("CORS_ORIGINS must contain exact origins; production origins must use HTTPS.");
    }
  }
  return { ...parsed, CORS_ORIGINS: corsOrigins };
};

const parsedEnvironment = parseEnvironment({
  PORT: process.env.PORT,
  NODE_ENV: process.env.NODE_ENV,
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  CORS_ORIGINS: process.env.CORS_ORIGINS,
});

export const env = { ...parsedEnvironment, JWT_SECRET: parsedEnvironment.JWT_SECRET ?? developmentJwtSecret };
