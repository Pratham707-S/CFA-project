import { createHash } from "node:crypto";
import type { PrismaClient } from "@prisma/client";
import type { AuthRepository } from "./auth.repository.js";
import type { AuthUser, StoredAuthUser } from "./auth.types.js";

function tokenHash(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export class PrismaAuthRepository implements AuthRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByEmail(email: string): Promise<StoredAuthUser | null> {
    const user = await this.prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    return user ? { id: user.id, email: user.email, displayName: user.displayName, role: user.role, passwordHash: user.passwordHash } : null;
  }

  async findById(id: string): Promise<AuthUser | null> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    return user ? { id: user.id, email: user.email, displayName: user.displayName, role: user.role } : null;
  }

  async createUser(input: { email: string; displayName: string; passwordHash: string }): Promise<AuthUser> {
    const user = await this.prisma.user.create({
      data: { email: input.email.toLowerCase(), displayName: input.displayName, passwordHash: input.passwordHash },
    });
    return { id: user.id, email: user.email, displayName: user.displayName, role: user.role };
  }

  async createSession(input: { userId: string; token: string; expiresAt: Date }): Promise<void> {
    await this.prisma.session.create({ data: { userId: input.userId, tokenHash: tokenHash(input.token), expiresAt: input.expiresAt } });
  }

  async revokeSession(token: string): Promise<void> {
    await this.prisma.session.updateMany({ where: { tokenHash: tokenHash(token), revokedAt: null }, data: { revokedAt: new Date() } });
  }

  async isSessionRevoked(token: string): Promise<boolean> {
    const session = await this.prisma.session.findUnique({ where: { tokenHash: tokenHash(token) } });
    return !session || Boolean(session.revokedAt) || session.expiresAt <= new Date();
  }
}
