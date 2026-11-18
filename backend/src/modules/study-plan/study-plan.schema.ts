import { z } from "zod";

export const studyPlanViewSchema = z.object({
  id: z.string(),
  userId: z.string(),
  version: z.number().int(),
  status: z.enum(["ACTIVE", "ARCHIVED"]),
  generatedAt: z.string(),
});

export type StudyPlanView = z.infer<typeof studyPlanViewSchema>;
