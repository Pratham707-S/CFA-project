import type { AuthUser, StoredAuthUser } from "./auth.types.js";

export interface AuthRepository {
  findByEmail(email: string): Promise<StoredAuthUser | null>;
  findById(id: string): Promise<AuthUser | null>;
  createUser(input: { email: string; displayName: string; passwordHash: string }): Promise<AuthUser>;
  createSession(input: { userId: string; token: string; expiresAt: Date }): Promise<void>;
  revokeSession(token: string): Promise<void>;
  isSessionRevoked(token: string): Promise<boolean>;
}
