import { randomUUID } from "node:crypto";
import type { OutgoingHttpHeaders } from "node:http";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createApp } from "../../src/app.js";
import { getLocalTestDatabaseUrl } from "../../src/config/test-database-target.js";
import { getPrismaClient } from "../../src/shared/db/prisma.js";

const testSuffix = randomUUID();
const testPassword = "integration-test-password-26";

function sessionCookie(response: { headers: OutgoingHttpHeaders }): string {
  const cookieHeader = response.headers["set-cookie"];
  const firstCookie = Array.isArray(cookieHeader)
    ? cookieHeader.find((value): value is string => typeof value === "string")
    : typeof cookieHeader === "string"
      ? cookieHeader
      : undefined;
  if (!firstCookie)
    throw new Error("Expected the auth route to set a session cookie.");
  return firstCookie.split(";")[0];
}

describe("PostgreSQL persistence and authorization integration", () => {
  const emails = [
    `student-a-${testSuffix}@example.test`,
    `student-b-${testSuffix}@example.test`,
  ];
  let app: ReturnType<typeof createApp> | undefined;
  let prisma: ReturnType<typeof getPrismaClient> | undefined;
  let userIds: string[] = [];
  let createdQuestionId: string | undefined;

  beforeAll(async () => {
    process.env.DATABASE_URL = getLocalTestDatabaseUrl(process.env);
    app = createApp();
    await app.ready();
    prisma = getPrismaClient();
  });

  afterAll(async () => {
    if (createdQuestionId && prisma) {
      await prisma.questionAttempt.deleteMany({
        where: { questionId: createdQuestionId },
      });
      await prisma.practiceQuestion.deleteMany({
        where: { id: createdQuestionId },
      });
    }
    if (userIds.length && prisma)
      await prisma.user.deleteMany({ where: { id: { in: userIds } } });
    await app?.close();
    await prisma?.$disconnect();
  });

  it("persists auth, enforces content visibility and student isolation, and grades attempts server-side", async () => {
    const api = app;
    const db = prisma;
    if (!api || !db)
      throw new Error(
        "Integration test setup did not initialize Fastify and Prisma.",
      );
    const signupA = await api.inject({
      method: "POST",
      url: "/auth/signup",
      payload: {
        email: emails[0],
        password: testPassword,
        displayName: "Integration Student A",
      },
    });
    const signupB = await api.inject({
      method: "POST",
      url: "/auth/signup",
      payload: {
        email: emails[1],
        password: testPassword,
        displayName: "Integration Student B",
      },
    });
    expect(signupA.statusCode).toBe(201);
    expect(signupB.statusCode).toBe(201);
    const userA = signupA.json().user;
    const userB = signupB.json().user;
    if (
      typeof userA.id !== "string" ||
      typeof userA.email !== "string" ||
      typeof userB.id !== "string"
    ) {
      throw new Error(
        "Sign-up response did not include the expected user identity.",
      );
    }
    userIds = [userA.id, userB.id];
    const cookieA = sessionCookie(signupA);
    const cookieB = sessionCookie(signupB);

    expect(await db.user.count({ where: { email: { in: emails } } })).toBe(2);
    expect(
      await db.session.count({ where: { userId: userA.id, revokedAt: null } }),
    ).toBe(1);
    const signin = await api.inject({
      method: "POST",
      url: "/auth/signin",
      payload: { email: userA.email, password: testPassword },
    });
    expect(signin.statusCode).toBe(200);
    expect(
      await db.session.count({ where: { userId: userA.id, revokedAt: null } }),
    ).toBe(2);

    const duplicateEmail = await api.inject({
      method: "POST",
      url: "/auth/signup",
      payload: {
        email: userA.email,
        password: testPassword,
        displayName: "Duplicate User",
      },
    });
    expect(duplicateEmail.statusCode).toBe(409);
    const forbiddenAdminWrite = await api.inject({
      method: "POST",
      url: "/api/admin/curriculum",
      headers: { cookie: cookieA },
      payload: { level: "LEVEL_I", curriculumYear: 2099, status: "DRAFT" },
    });
    expect(forbiddenAdminWrite.statusCode).toBe(403);

    const economics = await db.subject.findFirst({
      where: {
        slug: "economics",
        curriculum: {
          curriculumYear: 2027,
          level: "LEVEL_I",
          status: "PUBLISHED",
        },
      },
      include: {
        modules: {
          include: {
            subtopics: {
              include: {
                lessons: {
                  include: {
                    questions: true,
                    resources: true,
                    learningOutcomeMappings: true,
                  },
                },
              },
            },
          },
        },
      },
    });
    expect(economics).not.toBeNull();
    expect(economics?.modules).toHaveLength(8);
    const economicsLessons =
      economics?.modules.flatMap((module) =>
        module.subtopics.flatMap((subtopic) => subtopic.lessons),
      ) ?? [];
    const writtenDrafts = economicsLessons.filter((lesson) =>
      lesson.slug.endsWith("-written-draft"),
    );
    expect(writtenDrafts).toHaveLength(8);
    expect(
      writtenDrafts.every(
        (lesson) => lesson.status === "DRAFT" && lesson.content !== null,
      ),
    ).toBe(true);
    const economicsQuestions = writtenDrafts.flatMap(
      (lesson) => lesson.questions,
    );
    expect(economicsQuestions).toHaveLength(16);
    expect(
      economicsQuestions.every((question) => question.status === "DRAFT"),
    ).toBe(true);
    expect(
      writtenDrafts.every(
        (lesson) => lesson.learningOutcomeMappings.length > 0,
      ),
    ).toBe(true);
    const candidateVideos = economicsLessons.flatMap(
      (lesson) => lesson.resources,
    );
    expect(candidateVideos.length).toBeGreaterThanOrEqual(8);
    expect(
      candidateVideos.every(
        (video) =>
          video.verificationStatus === "PENDING_REVIEW" && !video.isPrimary,
      ),
    ).toBe(true);

    const draftLesson = writtenDrafts[0];
    const hiddenDraft = await api.inject({
      method: "GET",
      url: `/api/lessons/${draftLesson.id}`,
      headers: { cookie: cookieA },
    });
    expect(hiddenDraft.statusCode).toBe(404);

    const publishedLesson = economicsLessons.find(
      (lesson) =>
        lesson.status === "PUBLISHED" &&
        !lesson.slug.endsWith("-written-draft"),
    );
    if (!publishedLesson)
      throw new Error(
        "Seeded Economics curriculum has no published lesson shell.",
      );
    const pendingVideo = publishedLesson.resources.find(
      (resource) => resource.verificationStatus === "PENDING_REVIEW",
    );
    if (pendingVideo) {
      const resources = await api.inject({
        method: "GET",
        url: `/api/lessons/${publishedLesson.id}/resources`,
        headers: { cookie: cookieA },
      });
      expect(resources.statusCode).toBe(200);
      expect(resources.json().resources).not.toContainEqual(
        expect.objectContaining({ id: pendingVideo.id }),
      );
    }

    const progressWrite = await api.inject({
      method: "POST",
      url: `/api/lessons/${publishedLesson.id}/progress`,
      headers: { cookie: cookieA },
      payload: { lessonCompleted: true },
    });
    expect(progressWrite.statusCode).toBe(200);
    const ownProgress = await api.inject({
      method: "GET",
      url: `/api/lessons/${publishedLesson.id}/progress`,
      headers: { cookie: cookieA },
    });
    const otherProgress = await api.inject({
      method: "GET",
      url: `/api/lessons/${publishedLesson.id}/progress`,
      headers: { cookie: cookieB },
    });
    expect(ownProgress.json().progress.lessonCompleted).toBe(true);
    expect(otherProgress.json().progress).toBeNull();

    const nextOrder = await db.practiceQuestion.aggregate({
      where: { lessonId: publishedLesson.id },
      _max: { order: true },
    });
    const question = await db.practiceQuestion.create({
      data: {
        lessonId: publishedLesson.id,
        question: "Integration fixture: choose the correct option.",
        options: [
          { id: "A", text: "Incorrect" },
          { id: "B", text: "Correct" },
        ],
        correctAnswer: "B",
        explanation: "The server grades against the persisted answer key.",
        concepts: ["integration-grading"],
        order: (nextOrder._max.order ?? 0) + 1,
        status: "PUBLISHED",
      },
    });
    createdQuestionId = question.id;
    const invalidOption = await api.inject({
      method: "POST",
      url: `/api/questions/${question.id}/attempt`,
      headers: { cookie: cookieA },
      payload: { selectedAnswer: "Z" },
    });
    expect(invalidOption.statusCode).toBe(400);
    const attempt = await api.inject({
      method: "POST",
      url: `/api/questions/${question.id}/attempt`,
      headers: { cookie: cookieA },
      payload: { selectedAnswer: "A", timeTakenSeconds: 12 },
    });
    expect(attempt.statusCode).toBe(200);
    expect(attempt.json().feedback).toMatchObject({
      isCorrect: false,
      correctAnswer: "B",
    });
    expect(
      await db.questionAttempt.count({
        where: {
          questionId: question.id,
          studentId: userA.id,
          isCorrect: false,
        },
      }),
    ).toBe(1);
    expect(
      await db.studentWeakConcept.count({
        where: {
          studentId: userA.id,
          lessonId: publishedLesson.id,
          concept: "integration-grading",
        },
      }),
    ).toBe(1);

    await expect(
      db.session.create({
        data: {
          userId: `missing-${testSuffix}`,
          tokenHash: randomUUID(),
          expiresAt: new Date(Date.now() + 60_000),
        },
      }),
    ).rejects.toMatchObject({ code: "P2003" });

    const logout = await api.inject({
      method: "POST",
      url: "/auth/logout",
      headers: { cookie: cookieA },
    });
    expect(logout.statusCode).toBe(200);
    const revokedSession = await api.inject({
      method: "GET",
      url: "/auth/me",
      headers: { cookie: cookieA },
    });
    expect(revokedSession.statusCode).toBe(401);
    expect(
      await db.session.count({
        where: { userId: userA.id, revokedAt: { not: null } },
      }),
    ).toBe(1);
  });
});
