import { z } from "zod";

export const onboardingPreferencesInputSchema = z.object({
  dailyStudyHours: z.number().int().min(1).max(24),
  studyDays: z.array(z.string().trim().min(1).max(20)).min(1).max(7),
  learningStyle: z.string().trim().min(1).max(80).optional(),
  strongSubjects: z.array(z.string().trim().min(1).max(80)).max(20).default([]),
  weakSubjects: z.array(z.string().trim().min(1).max(80)).max(20).default([]),
});

export type OnboardingPreferencesInput = z.infer<typeof onboardingPreferencesInputSchema>;

export type OnboardingPreferencesView = Omit<OnboardingPreferencesInput, "learningStyle"> & {
  id: string;
  userId: string;
  learningStyle: string | null;
  completedAt: string | null;
};
