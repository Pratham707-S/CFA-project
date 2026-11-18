-- Keep the migration safe for the already-provisioned Neon branch while
-- making fresh environments include the field required by email/password auth.
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "passwordHash" TEXT;

-- Existing users are not created by the current app before password auth, so
-- enforce the invariant after the additive change has been applied.
ALTER TABLE "User" ALTER COLUMN "passwordHash" SET NOT NULL;
