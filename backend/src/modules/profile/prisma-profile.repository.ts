import type { PrismaClient } from "@prisma/client";
import type { ProfileRepository } from "./profile.repository.js";
import type { CfaProfileInput, CfaProfileView } from "./profile.schema.js";

export class PrismaProfileRepository implements ProfileRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByUserId(userId: string): Promise<CfaProfileView | null> {
    const profile = await this.prisma.cfaProfile.findUnique({ where: { userId } });
    return profile ? this.toView(profile) : null;
  }

  async upsert(userId: string, input: CfaProfileInput): Promise<CfaProfileView> {
    const profile = await this.prisma.cfaProfile.upsert({
      where: { userId },
      create: { userId, level: input.level, examDate: new Date(input.examDate), status: input.status, experience: input.experience },
      update: { level: input.level, examDate: new Date(input.examDate), status: input.status, experience: input.experience },
    });
    return this.toView(profile);
  }

  private toView(profile: { id: string; userId: string; level: "LEVEL_I" | "LEVEL_II" | "LEVEL_III"; examDate: Date; status: string | null; experience: string | null }): CfaProfileView {
    return { ...profile, examDate: profile.examDate.toISOString() };
  }
}
