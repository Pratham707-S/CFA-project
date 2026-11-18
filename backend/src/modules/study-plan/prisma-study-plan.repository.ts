import type { PrismaClient } from "@prisma/client";
import type { StudyPlanRepository } from "./study-plan.repository.js";
import type { StudyPlanView } from "./study-plan.schema.js";

export class PrismaStudyPlanRepository implements StudyPlanRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findActive(userId: string): Promise<StudyPlanView | null> {
    const plan = await this.prisma.studyPlan.findFirst({ where: { userId, status: "ACTIVE" }, orderBy: { version: "desc" } });
    return plan ? this.toView(plan) : null;
  }

  async createNext(userId: string): Promise<StudyPlanView> {
    const plan = await this.prisma.$transaction(async (tx) => {
      await tx.studyPlan.updateMany({ where: { userId, status: "ACTIVE" }, data: { status: "ARCHIVED" } });
      const latest = await tx.studyPlan.findFirst({ where: { userId }, orderBy: { version: "desc" }, select: { version: true } });
      return tx.studyPlan.create({ data: { userId, version: (latest?.version ?? 0) + 1 } });
    });
    return this.toView(plan);
  }

  private toView(plan: { id: string; userId: string; version: number; status: "ACTIVE" | "ARCHIVED"; generatedAt: Date }): StudyPlanView {
    return { ...plan, generatedAt: plan.generatedAt.toISOString() };
  }
}
