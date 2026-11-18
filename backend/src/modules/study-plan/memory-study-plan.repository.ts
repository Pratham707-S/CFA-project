import { randomUUID } from "node:crypto";
import type { StudyPlanRepository } from "./study-plan.repository.js";
import type { StudyPlanView } from "./study-plan.schema.js";

export class MemoryStudyPlanRepository implements StudyPlanRepository {
  private readonly plans = new Map<string, StudyPlanView[]>();

  async findActive(userId: string): Promise<StudyPlanView | null> {
    return this.plans.get(userId)?.find((plan) => plan.status === "ACTIVE") ?? null;
  }

  async createNext(userId: string): Promise<StudyPlanView> {
    const plans = this.plans.get(userId) ?? [];
    for (const plan of plans) plan.status = "ARCHIVED";
    const value: StudyPlanView = { id: randomUUID(), userId, version: plans.length + 1, status: "ACTIVE", generatedAt: new Date().toISOString() };
    plans.push(value);
    this.plans.set(userId, plans);
    return value;
  }
}
