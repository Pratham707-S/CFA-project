import type { SignInInput, SignUpInput } from "./auth.schema.js";

export type AuthUser = {
  id: string;
  email: string;
  displayName: string | null;
  role: "STUDENT";
};

export type StoredAuthUser = AuthUser & { passwordHash: string };

export interface AuthProvider {
  signUp(input: SignUpInput): Promise<AuthUser>;
  signIn(input: SignInInput): Promise<AuthUser>;
}
