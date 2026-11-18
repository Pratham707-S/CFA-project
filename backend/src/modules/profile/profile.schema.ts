import { z } from "zod";

export const cfaLevelSchema = z.enum(["LEVEL_I", "LEVEL_II", "LEVEL_III"]);

export const cfaProfileInputSchema = z.object({
  level: cfaLevelSchema,
  examDate: z.string().datetime({ offset: true }).or(z.string().date()),
  status: z.string().trim().min(1).max(80).optional(),
  experience: z.string().trim().min(1).max(80).optional(),
});

export type CfaProfileInput = z.infer<typeof cfaProfileInputSchema>;

export type CfaProfileView = {
  id: string;
  userId: string;
  level: "LEVEL_I" | "LEVEL_II" | "LEVEL_III";
  examDate: string;
  status: string | null;
  experience: string | null;
};
