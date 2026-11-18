import type { DashboardRepository, DashboardView } from "./dashboard.repository.js";

export class MemoryDashboardRepository implements DashboardRepository {
  async getForUser(_userId: string): Promise<DashboardView | null> {
    return null;
  }
}
