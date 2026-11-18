import type { OnboardingPreferencesInput, OnboardingPreferencesView } from "./onboarding.schema.js";

export interface OnboardingRepository {
  findByUserId(userId: string): Promise<OnboardingPreferencesView | null>;
  upsert(userId: string, input: OnboardingPreferencesInput): Promise<OnboardingPreferencesView>;
  markComplete(userId: string): Promise<OnboardingPreferencesView | null>;
}
