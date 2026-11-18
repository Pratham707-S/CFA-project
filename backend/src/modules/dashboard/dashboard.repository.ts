export type DashboardView = {
  user: { id: string; email: string; displayName: string | null; role: "STUDENT" };
  cfaProfile: { level: "LEVEL_I" | "LEVEL_II" | "LEVEL_III"; examDate: string; status: string | null; experience: string | null } | null;
  preferences: { dailyStudyHours: number; studyDays: string[]; learningStyle: string | null; strongSubjects: string[]; weakSubjects: string[]; completedAt: string | null } | null;
  studyPlan: { id: string; version: number; status: "ACTIVE" | "ARCHIVED"; generatedAt: string } | null;
};

export interface DashboardRepository {
  getForUser(userId: string): Promise<DashboardView | null>;
}
