# CFA Website

The CFA Prep product starts as a calm, human-readable learning platform for CFA candidates.

## Current user flow

```text
Login / Signup → Onboarding → Dashboard
```

The public landing page is intentionally paused. Its first prototype is archived in `work/cfa-landing-archive/` for a later design pass.

## Product modules

- Dashboard
- My CFA Plan
- Learn
- Practice
- Mock Exams
- Flashcards
- Mistake Book
- Market News
- AI Tutor
- Career Prep
- Analytics
- Goals
- Settings

## Current build milestone

The current UI milestone is the authenticated entry flow:

1. Login and signup
2. Onboarding
3. Dashboard shell

The working visual prototype is in [`../cfa-landing/index.html`](../cfa-landing/index.html).

## Architecture rules

- Keep features isolated by ownership.
- Keep UI, services, repositories, and schemas separate.
- Components never call the database or AI provider directly.
- Validate every boundary with Zod.
- Prefer readable code over clever abstractions.
- Add loading, error, empty, and success states to every feature.
