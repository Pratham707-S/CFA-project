import { randomUUID } from "node:crypto";
import type { OnboardingRepository } from "./onboarding.repository.js";
import type { OnboardingPreferencesInput, OnboardingPreferencesView } from "./onboarding.schema.js";

export class MemoryOnboardingRepository implements OnboardingRepository {
  private readonly preferences = new Map<string, OnboardingPreferencesView>();

  async findByUserId(userId: string): Promise<OnboardingPreferencesView | null> {
    return this.preferences.get(userId) ?? null;
  }

  async upsert(userId: string, input: OnboardingPreferencesInput): Promise<OnboardingPreferencesView> {
    const current = this.preferences.get(userId);
    const value: OnboardingPreferencesView = { ...input, learningStyle: input.learningStyle ?? null, id: current?.id ?? randomUUID(), userId, completedAt: current?.completedAt ?? null };
    this.preferences.set(userId, value);
    return value;
  }

  async markComplete(userId: string): Promise<OnboardingPreferencesView | null> {
    const current = this.preferences.get(userId);
    if (!current) return null;
    const value = { ...current, completedAt: new Date().toISOString() };
    this.preferences.set(userId, value);
    return value;
  }
}
