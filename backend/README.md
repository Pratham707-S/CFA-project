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

The seed is idempotent and adds only the CFA Level I 2027 Quantitative Methods
curriculum and its official module titles. It does not create subtopics,
lessons, sample questions, or video links. Run migrations deliberately with
`npx prisma migrate deploy` only after reviewing the generated SQL and choosing
the intended database. The task implementation generated a migration locally;
it has not been applied to Neon.

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
