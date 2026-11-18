import { randomUUID } from "node:crypto";
import type { AuthRepository } from "./auth.repository.js";
import type { AuthUser, StoredAuthUser } from "./auth.types.js";

export class MemoryAuthRepository implements AuthRepository {
  private readonly users = new Map<string, StoredAuthUser>();
  private readonly revokedTokens = new Set<string>();

  async findByEmail(email: string): Promise<StoredAuthUser | null> {
    return this.users.get(email.toLowerCase()) ?? null;
  }

  async findById(id: string): Promise<AuthUser | null> {
    for (const user of this.users.values()) {
      if (user.id === id) return { id: user.id, email: user.email, displayName: user.displayName, role: user.role };
    }
    return null;
  }

  async createUser(input: { email: string; displayName: string; passwordHash: string }): Promise<AuthUser> {
    const user: StoredAuthUser = { id: randomUUID(), email: input.email, displayName: input.displayName, role: "STUDENT", passwordHash: input.passwordHash };
    this.users.set(user.email.toLowerCase(), user);
    return { id: user.id, email: user.email, displayName: user.displayName, role: user.role };
  }

  async createSession(_input: { userId: string; token: string; expiresAt: Date }): Promise<void> {}

  async revokeSession(token: string): Promise<void> {
    this.revokedTokens.add(token);
  }

  async isSessionRevoked(token: string): Promise<boolean> {
    return this.revokedTokens.has(token);
  }
}
