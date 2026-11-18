import { SignJWT } from "jose";

export const SESSION_COOKIE_NAME = "cfa_session";

export async function createSessionToken(userId: string, secret: string): Promise<string> {
  return new SignJWT({ sub: userId, type: "session" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(new TextEncoder().encode(secret));
}

export async function verifySessionToken(token: string, secret: string): Promise<{ userId: string }> {
  const { jwtVerify } = await import("jose");
  const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
  if (payload.type !== "session" || typeof payload.sub !== "string") throw new Error("Invalid session");
  return { userId: payload.sub };
}
