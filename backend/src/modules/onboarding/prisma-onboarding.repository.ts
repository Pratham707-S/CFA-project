import type { PrismaClient } from "@prisma/client";
import type { OnboardingRepository } from "./onboarding.repository.js";
import type { OnboardingPreferencesInput, OnboardingPreferencesView } from "./onboarding.schema.js";

export class PrismaOnboardingRepository implements OnboardingRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByUserId(userId: string): Promise<OnboardingPreferencesView | null> {
    const value = await this.prisma.onboardingPreferences.findUnique({ where: { userId } });
    return value ? this.toView(value) : null;
  }

  async upsert(userId: string, input: OnboardingPreferencesInput): Promise<OnboardingPreferencesView> {
    const value = await this.prisma.onboardingPreferences.upsert({
      where: { userId },
      create: { userId, ...input },
      update: input,
    });
    return this.toView(value);
  }

  async markComplete(userId: string): Promise<OnboardingPreferencesView | null> {
    const value = await this.prisma.onboardingPreferences.updateMany({ where: { userId }, data: { completedAt: new Date() } });
    if (value.count === 0) return null;
    return this.findByUserId(userId);
  }

  private toView(value: { id: string; userId: string; dailyStudyHours: number; studyDays: string[]; learningStyle: string | null; strongSubjects: string[]; weakSubjects: string[]; completedAt: Date | null }): OnboardingPreferencesView {
    return { ...value, completedAt: value.completedAt?.toISOString() ?? null };
  }
}
