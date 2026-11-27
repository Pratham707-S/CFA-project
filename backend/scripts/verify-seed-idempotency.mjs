import { execFileSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const { Pool } = pg;
const backendRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const connectionString = process.env.CFA_TEST_DATABASE_URL;
if (process.env.NODE_ENV === "production")
  throw new Error("Refusing to run seed verification in production.");
if (!connectionString) throw new Error("CFA_TEST_DATABASE_URL is required.");
const databaseUrl = new URL(connectionString);
if (
  !new Set(["localhost", "127.0.0.1", "::1", "[::1]"]).has(
    databaseUrl.hostname,
  ) ||
  databaseUrl.pathname !== "/cfa_prep_test"
) {
  throw new Error(
    "Seed verification permits only the dedicated loopback cfa_prep_test database.",
  );
}

const pool = new Pool({ connectionString });
const fromEconomics = `
  FROM "Curriculum" c
  JOIN "Subject" s ON s."curriculumId" = c.id
  JOIN "LearningModule" m ON m."subjectId" = s.id
  JOIN "Subtopic" st ON st."moduleId" = m.id
  JOIN "Lesson" l ON l."subtopicId" = st.id
  WHERE c.program = 'CFA' AND c.level = 'LEVEL_I' AND c."curriculumYear" = 2027 AND s.slug = 'economics'
`;

async function readSeedSnapshot() {
  const curriculum = await pool.query(`
    SELECT s.slug, count(DISTINCT m.id)::int AS modules
    FROM "Curriculum" c JOIN "Subject" s ON s."curriculumId" = c.id
    LEFT JOIN "LearningModule" m ON m."subjectId" = s.id
    WHERE c.program = 'CFA' AND c.level = 'LEVEL_I' AND c."curriculumYear" = 2027
      AND s.slug IN ('quantitative-methods', 'economics')
    GROUP BY s.slug ORDER BY s.slug
  `);
  const lessons = await pool.query(`
    SELECT l.id, l.slug, l.status, md5(l.content::text) AS content_hash
    ${fromEconomics} AND l.slug LIKE '%-written-draft'
    ORDER BY l.slug
  `);
  const questions = await pool.query(`
    SELECT q.id, q.status, q.question, q.options, q."correctAnswer", q.explanation, q."order"
    FROM "Curriculum" c
    JOIN "Subject" s ON s."curriculumId" = c.id
    JOIN "LearningModule" m ON m."subjectId" = s.id
    JOIN "Subtopic" st ON st."moduleId" = m.id
    JOIN "Lesson" l ON l."subtopicId" = st.id AND l.slug LIKE '%-written-draft'
    JOIN "PracticeQuestion" q ON q."lessonId" = l.id
    WHERE c.program = 'CFA' AND c.level = 'LEVEL_I' AND c."curriculumYear" = 2027 AND s.slug = 'economics'
    ORDER BY l.slug, q."order"
  `);
  const videos = await pool.query(`
    SELECT v.id, v."youtubeVideoId", v.title, v."verificationStatus", v."isPrimary", v.language
    ${fromEconomics}
    JOIN "VideoResource" v ON v."lessonId" = l.id
    ORDER BY v."youtubeVideoId", v.id
  `);
  const mappings = await pool.query(`
    SELECT lo.identifier, lo.status, l.slug AS "lessonSlug", lm."learningOutcomeStatementId"
    FROM "Curriculum" c
    JOIN "Subject" s ON s."curriculumId" = c.id
    JOIN "LearningModule" m ON m."subjectId" = s.id
    JOIN "Subtopic" st ON st."moduleId" = m.id
    JOIN "LearningOutcomeStatement" lo ON lo."subtopicId" = st.id AND lo."curriculumId" = c.id
    JOIN "Lesson" l ON l."subtopicId" = st.id AND l.slug LIKE '%-written-draft'
    JOIN "LessonLearningOutcome" lm ON lm."lessonId" = l.id AND lm."learningOutcomeStatementId" = lo.id
    WHERE c.program = 'CFA' AND c.level = 'LEVEL_I' AND c."curriculumYear" = 2027 AND s.slug = 'economics'
    ORDER BY lo.identifier, l.slug
  `);

  return {
    modules: curriculum.rows,
    lessons: lessons.rows,
    questions: questions.rows,
    videos: videos.rows,
    mappings: mappings.rows,
  };
}

function assertInitialSeed(snapshot) {
  const modulesBySubject = Object.fromEntries(
    snapshot.modules.map((row) => [row.slug, row.modules]),
  );
  if (
    modulesBySubject["quantitative-methods"] !== 11 ||
    modulesBySubject.economics !== 8
  ) {
    throw new Error(
      "Seed counts did not match 11 Quantitative Methods and 8 Economics modules.",
    );
  }
  if (
    snapshot.lessons.length !== 8 ||
    snapshot.lessons.some(
      (row) => row.status !== "DRAFT" || row.content_hash === null,
    )
  ) {
    throw new Error(
      "Expected eight non-empty Economics written lesson drafts.",
    );
  }
  if (
    snapshot.questions.length !== 16 ||
    snapshot.questions.some((row) => row.status !== "DRAFT")
  ) {
    throw new Error("Expected sixteen Economics questions in DRAFT status.");
  }
  if (snapshot.mappings.length === 0)
    throw new Error("Economics written drafts have no outcome mappings.");
  if (
    snapshot.videos.length < 8 ||
    snapshot.videos.some(
      (row) => row.verificationStatus !== "PENDING_REVIEW" || row.isPrimary,
    )
  ) {
    throw new Error(
      "Economics candidate videos must remain pending review and non-primary.",
    );
  }
}

function runSeed() {
  const seedEnvironment = { ...process.env };
  delete seedEnvironment.DATABASE_URL;
  seedEnvironment.NODE_ENV = "test";
  seedEnvironment.CFA_SEED_TARGET = "local";
  seedEnvironment.CFA_SEED_DATABASE_URL = connectionString;
  seedEnvironment.CFA_SEED_CONFIRM_NONPRODUCTION =
    "I_VERIFIED_THIS_IS_NOT_PRODUCTION";
  execFileSync("npm", ["run", "seed"], {
    cwd: backendRoot,
    env: seedEnvironment,
    stdio: "inherit",
  });
}

try {
  runSeed();
  const firstSnapshot = await readSeedSnapshot();
  assertInitialSeed(firstSnapshot);

  const videoId = firstSnapshot.videos[0]?.id;
  const questionId = firstSnapshot.questions[0]?.id;
  if (!videoId || !questionId)
    throw new Error("Missing Economics review fixtures.");
  await pool.query(
    `UPDATE "VideoResource" SET "verificationStatus" = 'REJECTED', title = title || ' [test reviewer decision]' WHERE id = $1`,
    [videoId],
  );
  await pool.query(
    `UPDATE "PracticeQuestion" SET status = 'ARCHIVED', question = question || ' [test reviewer edit]' WHERE id = $1`,
    [questionId],
  );
  const reviewerSnapshot = await readSeedSnapshot();

  runSeed();
  const afterRepeat = await readSeedSnapshot();
  if (JSON.stringify(afterRepeat) !== JSON.stringify(reviewerSnapshot)) {
    throw new Error(
      "A repeat seed changed content, a reviewer decision, or an assigned resource.",
    );
  }
  if (
    !afterRepeat.videos.some(
      (row) =>
        row.id === videoId &&
        row.verificationStatus === "REJECTED" &&
        !row.isPrimary,
    )
  ) {
    throw new Error(
      "Repeat seed did not preserve the video rejection decision.",
    );
  }
  if (
    !afterRepeat.questions.some(
      (row) =>
        row.id === questionId &&
        row.status === "ARCHIVED" &&
        row.question.endsWith("[test reviewer edit]"),
    )
  ) {
    throw new Error("Repeat seed did not preserve the question review edit.");
  }
  console.log(
    "Seed idempotency verified: curriculum counts stable; synthetic rejection/archive decisions preserved; no content auto-approved.",
  );
} finally {
  await pool.end();
}
