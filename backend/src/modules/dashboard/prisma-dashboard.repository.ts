import type { PrismaClient } from "@prisma/client";
import type { DashboardRepository, DashboardView } from "./dashboard.repository.js";

export class PrismaDashboardRepository implements DashboardRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async getForUser(userId: string): Promise<DashboardView | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { cfaProfile: true, onboardingPreferences: true, studyPlans: { where: { status: "ACTIVE" }, orderBy: { version: "desc" }, take: 1 } },
    });
    if (!user) return null;
    const plan = user.studyPlans[0];
    return {
      user: { id: user.id, email: user.email, displayName: user.displayName, role: user.role },
      cfaProfile: user.cfaProfile ? { level: user.cfaProfile.level, examDate: user.cfaProfile.examDate.toISOString(), status: user.cfaProfile.status, experience: user.cfaProfile.experience } : null,
      preferences: user.onboardingPreferences ? { dailyStudyHours: user.onboardingPreferences.dailyStudyHours, studyDays: user.onboardingPreferences.studyDays, learningStyle: user.onboardingPreferences.learningStyle, strongSubjects: user.onboardingPreferences.strongSubjects, weakSubjects: user.onboardingPreferences.weakSubjects, completedAt: user.onboardingPreferences.completedAt?.toISOString() ?? null } : null,
      studyPlan: plan ? { id: plan.id, version: plan.version, status: plan.status, generatedAt: plan.generatedAt.toISOString() } : null,
    };
  }
}
