import type { CfaProfileInput, CfaProfileView } from "./profile.schema.js";

export interface ProfileRepository {
  findByUserId(userId: string): Promise<CfaProfileView | null>;
  upsert(userId: string, input: CfaProfileInput): Promise<CfaProfileView>;
}
