# CFA Database Schema

Neon PostgreSQL is the database provider for the first slice. Prisma connects
to Neon through the `DATABASE_URL` environment variable. The first database slice keeps identity, CFA profile, onboarding preferences
and study-plan versions separate. A plan is versioned so regenerating a plan
does not erase completed work from an earlier plan.

## Initial entities

- `User`: application identity and account metadata.
- `CfaProfile`: CFA level, exam date and preparation status.
- `OnboardingPreferences`: study time, days, style and subject strengths.
- `StudyPlan`: versioned generated plan with an explicit active/archive state.

The Prisma schema lives in `backend/prisma/schema.prisma`. Neon credentials remain
in environment variables and are never sent to the frontend.
