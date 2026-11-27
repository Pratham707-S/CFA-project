# CFA learning backend

Fastify + TypeScript API. Quantitative Methods is the first seeded subject; the
schema supports additional curriculum levels, years, subjects, and modules.

## Local setup

From this directory:

```sh
npm install
npx prisma generate
npx prisma validate
npm run build
npm test
```

Copy `.env.example` to `.env` and set `DATABASE_URL`, `JWT_SECRET`, `PORT`, and
`NODE_ENV`. Never commit `.env`. To opt specific existing accounts into
curriculum administration, set `CURRICULUM_ADMIN_EMAILS` to a comma-separated
list of their email addresses, then run the seed script. Public signup always
assigns the `STUDENT` role; no request field can set `ADMIN`.

```sh
npm run seed
npm run dev
```

The seed upserts CFA Level I 2027 Quantitative Methods and Economics curriculum
data, and defines written lesson/question drafts and video candidates. Draft
written content stays `DRAFT`; newly created video candidates stay
`PENDING_REVIEW`, while existing reviewer decisions are preserved. Its upsert
structure is intended to be idempotent, but that has not yet been verified
against a disposable PostgreSQL database. No seed or migration was run against
Neon in this sprint. Run migrations deliberately with `npx prisma migrate
deploy` only after reviewing the SQL and choosing a non-production target.

## API groups

All `/api` routes require the existing `cfa_session` cookie, except public auth
routes outside this module. `/api/admin/*` requires an authenticated `ADMIN`.

### Student curriculum and learning

- `GET /api/curriculum/:level?year=2027`
- `GET /api/curriculum/:level/subjects?year=2027`
- `GET /api/subjects/quantitative-methods?year=2027`
- `GET /api/subjects/quantitative-methods/modules?year=2027`
- `GET /api/modules/:moduleId`
- `GET /api/modules/:moduleId/subtopics`
- `GET /api/subtopics/:subtopicId/learning-outcomes`
- `GET /api/subtopics/:subtopicId/lessons`
- `GET /api/lessons/:lessonId`
- `GET /api/lessons/:lessonId/learning-outcomes`
- `GET /api/lessons/:lessonId/resources` (verified resources only)
- `GET /api/lessons/:lessonId/questions` (answer key excluded)
- `GET|POST /api/lessons/:lessonId/progress`
- `POST /api/questions/:questionId/attempt`
- `GET /api/students/me/quant-progress?year=2027`
- `GET /api/students/me/weak-concepts`

### Admin content management

- `POST /api/admin/curriculum`
- `POST /api/admin/subjects`
- `POST /api/admin/modules`
- `POST /api/admin/subtopics`
- `POST /api/admin/subtopics/:subtopicId/learning-outcomes`
- `POST /api/admin/lessons`; `PATCH|DELETE /api/admin/lessons/:lessonId`
- `PUT /api/admin/lessons/:lessonId/learning-outcomes`
- `POST /api/admin/lessons/:lessonId/videos`
- `PATCH|DELETE /api/admin/videos/:videoId`
- `PATCH /api/admin/videos/:videoId/verification`
- `POST /api/admin/lessons/:lessonId/questions`
- `PUT /api/admin/questions/:questionId/learning-outcomes`
- `DELETE /api/admin/questions/:questionId`

Question attempts are graded by the backend. Incorrect answers update a
student-owned weak-concept counter. Video progress and lesson completion are
separate fields. YouTube URLs are derived from validated video IDs; resources
remain hidden until an admin marks them verified. No automated video selection
or transcript copying is performed.

## AI tutor boundary

`src/ai/tutor-context.service.ts` returns lesson-specific, student-owned
context for a future tutor. It does not call a model, fabricate answers, or
access credentials. Provider integration belongs behind a later service
interface and server-side configuration.

## Safe curriculum seed workflow

The seed command requires an explicit disposable local or approved staging
database; it does not fall back to `DATABASE_URL`. Never set the seed target to
production.

```sh
CFA_SEED_TARGET=local # or staging
CFA_SEED_DATABASE_URL=postgresql://... # separate non-production database
CFA_SEED_CONFIRM_NONPRODUCTION=I_VERIFIED_THIS_IS_NOT_PRODUCTION
npm run seed
```

The guard rejects `NODE_ENV=production`, missing acknowledgement,
non-PostgreSQL URLs, and a seed URL that resolves to the same host/database
path as `DATABASE_URL`. It cannot determine whether an arbitrary remote URL is
truly staging; verify the database name and branch before acknowledging it.

Use a disposable PostgreSQL instance for repository integration tests. Apply
the reviewed migration set to that instance only, run the seed twice, then
compare row counts and statuses to verify idempotency. The migration history
contains two password-hash migrations; review their applied state and resolve
the duplicate safely before initializing a fresh test database. No migration
or seed command in this sprint was run against Neon.

## API rate limits

Sign-up is limited to 5 requests per IP per hour, sign-in to 5 per IP per 15
minutes, and question attempts to 30 per IP per minute. The default client IP
is used because Fastify proxy trust remains disabled; do not enable
`trustProxy` until the trusted proxy hops are explicitly configured. The
current limiter uses process-local memory, so limits are not shared across
multiple backend instances or restarts. A multi-instance deployment needs a
shared store such as Redis and should consider adding per-account limits to the
IP limits.
