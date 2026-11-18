import type { StudyPlanView } from "./study-plan.schema.js";

export interface StudyPlanRepository {
  findActive(userId: string): Promise<StudyPlanView | null>;
  createNext(userId: string): Promise<StudyPlanView>;
}
