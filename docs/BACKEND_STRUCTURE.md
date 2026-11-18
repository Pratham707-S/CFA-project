# CFA Backend Structure

The backend is a modular monolith in a separate service from the Next.js
frontend. Each product feature owns its route, validation, service and future
repository boundary.

## Module flow

```text
Route → Validation → Controller → Service → Repository → Database
```

Routes stay thin. Controllers translate HTTP input. Services contain business
rules. Repositories contain persistence logic. Modules should communicate
through explicit service interfaces instead of importing another module's
internal files.

## Initial module ownership

- `auth`: sign-in, sign-up, sessions and password recovery.
- `cfa-profile`: level, exam date and preparation status.
- `onboarding`: study preferences and completion state.
- `study-plan`: plan generation, adjustment and regeneration.
- `dashboard`: read-only summary for today's plan and progress.
- `curriculum`, `lessons`, `practice`, `mock-exams`: learning activity.
- `flashcards`, `mistake-book`: revision workflows.
- `market-news`, `career-prep`, `analytics`, `goals`, `settings`: later product modules.

## Stability rules

- Validate all external input with Zod.
- Use one global error response shape.
- Never expose secrets or database credentials to the frontend.
- Keep AI work asynchronous when it can take more than a normal request timeout.
- Add tests before exposing a new module route.
- Prefer readable names and small functions over clever abstractions.
