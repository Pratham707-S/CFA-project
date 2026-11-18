import { z } from "zod";

export const signUpSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8).max(128),
  displayName: z.string().trim().min(2).max(80),
});

export const signInSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8).max(128),
});

export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
