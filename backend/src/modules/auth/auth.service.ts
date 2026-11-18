import { HttpError } from "../../shared/errors/http-error.js";
import type { SignInInput, SignUpInput } from "./auth.schema.js";
import type { AuthRepository } from "./auth.repository.js";
import { hashPassword, verifyPassword } from "./password.js";
import { createSessionToken } from "./token.js";
import type { AuthUser } from "./auth.types.js";
import { verifySessionToken } from "./token.js";

export class AuthService {
  constructor(private readonly repository: AuthRepository, private readonly jwtSecret: string) {}

  async signUp(input: SignUpInput): Promise<{ user: AuthUser; token: string }> {
    const email = input.email.toLowerCase();
    if (await this.repository.findByEmail(email)) throw new HttpError(409, "An account with this email already exists.", "EMAIL_EXISTS");
    const user = await this.repository.createUser({ email, displayName: input.displayName, passwordHash: await hashPassword(input.password) });
    const token = await createSessionToken(user.id, this.jwtSecret);
    await this.repository.createSession({ userId: user.id, token, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) });
    return { user, token };
  }

  async signIn(input: SignInInput): Promise<{ user: AuthUser; token: string }> {
    const user = await this.repository.findByEmail(input.email.toLowerCase());
    if (!user || !(await verifyPassword(input.password, user.passwordHash))) throw new HttpError(401, "Email or password is incorrect.", "INVALID_CREDENTIALS");
    const authUser = { id: user.id, email: user.email, displayName: user.displayName, role: user.role } as const;
    const token = await createSessionToken(user.id, this.jwtSecret);
    await this.repository.createSession({ userId: user.id, token, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) });
    return { user: authUser, token };
  }

  findById(id: string): Promise<AuthUser | null> {
    return this.repository.findById(id);
  }

  revokeSession(token: string): Promise<void> {
    return this.repository.revokeSession(token);
  }

  isSessionRevoked(token: string): Promise<boolean> {
    return this.repository.isSessionRevoked(token);
  }

  async authenticateSession(token: string): Promise<AuthUser | null> {
    if (await this.repository.isSessionRevoked(token)) return null;
    try {
      const { userId } = await verifySessionToken(token, this.jwtSecret);
      return await this.repository.findById(userId);
    } catch {
      return null;
    }
  }
}
