import { randomUUID } from "node:crypto";
import type { ProfileRepository } from "./profile.repository.js";
import type { CfaProfileInput, CfaProfileView } from "./profile.schema.js";

export class MemoryProfileRepository implements ProfileRepository {
  private readonly profiles = new Map<string, CfaProfileView>();

  async findByUserId(userId: string): Promise<CfaProfileView | null> {
    return this.profiles.get(userId) ?? null;
  }

  async upsert(userId: string, input: CfaProfileInput): Promise<CfaProfileView> {
    const current = this.profiles.get(userId);
    const profile: CfaProfileView = {
      id: current?.id ?? randomUUID(),
      userId,
      level: input.level,
      examDate: new Date(input.examDate).toISOString(),
      status: input.status ?? null,
      experience: input.experience ?? null,
    };
    this.profiles.set(userId, profile);
    return profile;
  }
}
