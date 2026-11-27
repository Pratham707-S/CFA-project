import Fastify from "fastify";
import cookie from "@fastify/cookie";
import { ZodError } from "zod";
import { describe, expect, it } from "vitest";
import { registerLearningRoutes } from "../src/modules/learning/learning.routes.js";
import { MemoryLearningRepository } from "../src/modules/learning/memory-learning.repository.js";
import type { SessionAuthenticator } from "../src/shared/auth/session-authenticator.js";
import { HttpError } from "../src/shared/errors/http-error.js";
import { TutorContextService } from "../src/ai/tutor-context.service.js";

const users = {
  student: { id: "student-1", email: "student@example.test", displayName: "Student", role: "STUDENT" as const },
  other: { id: "student-2", email: "other@example.test", displayName: "Other", role: "STUDENT" as const },
  admin: { id: "admin-1", email: "admin@example.test", displayName: "Admin", role: "ADMIN" as const },
};

async function harness() {
  const app = Fastify({ logger: false });
  await app.register(cookie);
  const repository = new MemoryLearningRepository();
  const auth: SessionAuthenticator = { async authenticateSession(token) { return users[token as keyof typeof users] ?? null; } };
  registerLearningRoutes(app, repository, auth);
  app.setErrorHandler((error, _request, reply) => {
    const status = error instanceof HttpError ? error.statusCode : error instanceof ZodError ? 400 : 500;
    const code = error instanceof HttpError ? error.code : error instanceof ZodError ? "VALIDATION_ERROR" : "INTERNAL_SERVER_ERROR";
    const message = error instanceof HttpError ? error.message : error instanceof ZodError ? "Please check the submitted fields." : "Unexpected test error.";
    reply.status(status).send({ error: { code, message } });
  });
  return { app, repository, context: new TutorContextService(repository) };
}

const auth = (id = "student") => ({ cookie: `cfa_session=${id}` });

describe("Quantitative Methods learning API", () => {
  it("serves only the seeded, verified 2027 Level I Quant modules", async () => {
    const { app } = await harness();
    const response = await app.inject({ method: "GET", url: "/api/subjects/quantitative-methods/modules?year=2027", headers: auth() });
    expect(response.statusCode).toBe(200);
    expect(response.json().modules).toHaveLength(11);
    expect(response.json().modules[0].title).toBe("Returns of Financial Assets and Instruments");
    const otherYear = await app.inject({ method: "GET", url: "/api/subjects/quantitative-methods/modules?year=2028", headers: auth() });
    expect(otherYear.statusCode).toBe(404);
    await app.close();
  });

  it("returns the published Quant and Economics subjects while preserving year isolation", async () => {
    const { app } = await harness();
    const legacy = await app.inject({ method: "GET", url: "/api/curriculum/level-1?year=2027", headers: auth() });
    expect(legacy.statusCode).toBe(200);
    expect(Object.keys(legacy.json())).toEqual(["curriculum"]);
    expect(legacy.json().curriculum).toMatchObject({ level: "LEVEL_I", curriculumYear: 2027 });
    expect(legacy.json().curriculum.subjects.map((subject: { slug: string }) => subject.slug)).toEqual([
      "quantitative-methods",
      "economics",
    ]);
    expect(legacy.json().curriculum.subjects[0].modules).toHaveLength(11);
    expect(legacy.json().curriculum.subjects[1].modules).toHaveLength(8);

    const createdCurriculum = await app.inject({
      method: "POST", url: "/api/admin/curriculum", headers: auth("admin"),
      payload: { level: "LEVEL_I", curriculumYear: 2028, status: "PUBLISHED" },
    });
    expect(createdCurriculum.statusCode).toBe(201);
    const curriculumId = createdCurriculum.json().curriculum.id;
    const createdSubject = await app.inject({
      method: "POST", url: "/api/admin/subjects", headers: auth("admin"),
      payload: { curriculumId, name: "Quantitative Methods 2028", slug: "quantitative-methods", order: 1, status: "PUBLISHED" },
    });
    const subjectId = createdSubject.json().subject.id;
    const createdModule = await app.inject({
      method: "POST", url: "/api/admin/modules", headers: auth("admin"),
      payload: { subjectId, title: "Version-specific module", slug: "version-specific-module", order: 1, status: "PUBLISHED" },
    });
    expect(createdModule.statusCode).toBe(201);

    const year2027 = await app.inject({ method: "GET", url: "/api/subjects/quantitative-methods/modules?year=2027", headers: auth() });
    const year2028 = await app.inject({ method: "GET", url: "/api/subjects/quantitative-methods/modules?year=2028", headers: auth() });
    expect(year2027.json().modules).toHaveLength(11);
    expect(year2028.json().modules.map((module: { title: string }) => module.title)).toEqual(["Version-specific module"]);
    expect(year2028.json()).toHaveProperty("modules");
    expect(year2028.json()).not.toHaveProperty("curriculum");

    const requested2028 = await app.inject({ method: "GET", url: "/api/curriculum/level-1?year=2028", headers: auth() });
    expect(Object.keys(requested2028.json())).toEqual(["curriculum"]);
    expect(requested2028.json().curriculum.subjects[0].id).toBe(subjectId);
    await app.close();
  });

  it("stores version-scoped LOS records, maps several to a lesson, and preserves legacy objectives", async () => {
    const { app } = await harness();
    const moduleId = "module-returns-of-financial-assets-and-instruments";
    const topic = await app.inject({
      method: "POST", url: "/api/admin/subtopics", headers: auth("admin"),
      payload: { moduleId, title: "Test-only subtopic", slug: "los-test-topic", order: 1, status: "PUBLISHED" },
    });
    const subtopicId = topic.json().subtopic.id as string;
    const createOutcome = (identifier: string, statement: string, order: number, status = "PUBLISHED") => app.inject({
      method: "POST", url: `/api/admin/subtopics/${subtopicId}/learning-outcomes`, headers: auth("admin"),
      payload: { identifier, statement, order, status },
    });
    const first = await createOutcome("TEST-2027-QM-1", "Original test-only statement one.", 1);
    const second = await createOutcome("TEST-2027-QM-2", "Original test-only statement two.", 2);
    expect(first.statusCode).toBe(201);
    expect(first.json().learningOutcome.curriculumId).toBe("curriculum-cfa-level-i-2027");
    expect(second.statusCode).toBe(201);
    expect((await createOutcome("TEST-2027-QM-1", "Duplicate test fixture.", 3)).statusCode).toBe(409);

    const year2028 = await app.inject({ method: "POST", url: "/api/admin/curriculum", headers: auth("admin"), payload: { level: "LEVEL_I", curriculumYear: 2028, status: "PUBLISHED" } });
    const subject2028 = await app.inject({ method: "POST", url: "/api/admin/subjects", headers: auth("admin"), payload: { curriculumId: year2028.json().curriculum.id, name: "Quant 2028 test", slug: "quantitative-methods", order: 1, status: "PUBLISHED" } });
    const module2028 = await app.inject({ method: "POST", url: "/api/admin/modules", headers: auth("admin"), payload: { subjectId: subject2028.json().subject.id, title: "2028 test module", slug: "returns-test", order: 1, status: "PUBLISHED" } });
    const subtopic2028 = await app.inject({ method: "POST", url: "/api/admin/subtopics", headers: auth("admin"), payload: { moduleId: module2028.json().module.id, title: "2028 test subtopic", slug: "returns-test-topic", order: 1, status: "PUBLISHED" } });
    const sameIdentifierNextYear = await app.inject({
      method: "POST", url: `/api/admin/subtopics/${subtopic2028.json().subtopic.id}/learning-outcomes`, headers: auth("admin"),
      payload: { identifier: "TEST-2027-QM-1", statement: "Separate-year test fixture.", order: 1, status: "PUBLISHED" },
    });
    expect(sameIdentifierNextYear.statusCode).toBe(201);
    expect(sameIdentifierNextYear.json().learningOutcome.curriculumId).not.toBe(first.json().learningOutcome.curriculumId);

    const lesson = await app.inject({
      method: "POST", url: "/api/admin/lessons", headers: auth("admin"),
      payload: { subtopicId, title: "LOS test lesson", slug: "los-test-lesson", order: 1, status: "PUBLISHED", learningObjectives: ["Legacy objective remains text."] },
    });
    const lessonId = lesson.json().lesson.id as string;
    const mapped = await app.inject({
      method: "PUT", url: `/api/admin/lessons/${lessonId}/learning-outcomes`, headers: auth("admin"),
      payload: { learningOutcomeStatementIds: [first.json().learningOutcome.id, second.json().learningOutcome.id] },
    });
    expect(mapped.statusCode).toBe(200);
    expect(mapped.json().learningOutcomes).toHaveLength(2);
    const crossYearMapping = await app.inject({
      method: "PUT", url: `/api/admin/lessons/${lessonId}/learning-outcomes`, headers: auth("admin"),
      payload: { learningOutcomeStatementIds: [sameIdentifierNextYear.json().learningOutcome.id] },
    });
    expect(crossYearMapping.statusCode).toBe(400);
    const legacyLesson = await app.inject({ method: "GET", url: `/api/lessons/${lessonId}`, headers: auth() });
    expect(legacyLesson.json().lesson.learningObjectives).toEqual(["Legacy objective remains text."]);
    expect(legacyLesson.json().lesson).not.toHaveProperty("learningOutcomeMappings");
    expect((await app.inject({ method: "GET", url: `/api/lessons/${lessonId}/learning-outcomes`, headers: auth() })).json().learningOutcomes).toHaveLength(2);

    const question = await app.inject({
      method: "POST", url: `/api/admin/lessons/${lessonId}/questions`, headers: auth("admin"),
      payload: { question: "Test-only question.", options: [{ id: "A", text: "One" }, { id: "B", text: "Two" }], correctAnswer: "A", explanation: "Test-only explanation.", order: 1, status: "PUBLISHED" },
    });
    const questionId = question.json().question.id as string;
    const questionMapping = await app.inject({
      method: "PUT", url: `/api/admin/questions/${questionId}/learning-outcomes`, headers: auth("admin"),
      payload: { learningOutcomeStatementIds: [first.json().learningOutcome.id] },
    });
    expect(questionMapping.statusCode).toBe(200);
    expect(questionMapping.json().learningOutcomes).toHaveLength(1);
    await app.close();
  });

  it("does not expose draft LOS to students", async () => {
    const { app } = await harness();
    const topic = await app.inject({
      method: "POST", url: "/api/admin/subtopics", headers: auth("admin"),
      payload: { moduleId: "module-returns-of-financial-assets-and-instruments", title: "Draft topic", slug: "draft-los-topic", order: 1, status: "PUBLISHED" },
    });
    const subtopicId = topic.json().subtopic.id as string;
    await app.inject({
      method: "POST", url: `/api/admin/subtopics/${subtopicId}/learning-outcomes`, headers: auth("admin"),
      payload: { identifier: "DRAFT-TEST", statement: "Draft-only test statement.", order: 1, status: "DRAFT" },
    });
    const visible = await app.inject({ method: "GET", url: `/api/subtopics/${subtopicId}/learning-outcomes`, headers: auth() });
    expect(visible.statusCode).toBe(200);
    expect(visible.json().learningOutcomes).toEqual([]);
    await app.close();
  });

  it("requires a session and blocks students from admin writes", async () => {
    const { app } = await harness();
    const unauthorizedCurriculum = await app.inject({ method: "GET", url: "/api/curriculum/level-1?year=2027" });
    expect(unauthorizedCurriculum.statusCode).toBe(401);
    expect(unauthorizedCurriculum.json().error.code).toBe("UNAUTHENTICATED");
    const unauthorizedResources = await app.inject({ method: "GET", url: "/api/lessons/lesson-id/resources" });
    expect(unauthorizedResources.statusCode).toBe(401);
    expect(unauthorizedResources.json().error.code).toBe("UNAUTHENTICATED");
    const forbidden = await app.inject({ method: "POST", url: "/api/admin/subtopics", headers: auth(), payload: { moduleId: "module-returns-of-financial-assets-and-instruments", title: "Sample", slug: "sample", order: 1 } });
    expect(forbidden.statusCode).toBe(403);
    await app.close();
  });

  it("does not expose published child content when its curriculum is still a draft", async () => {
    const { app } = await harness();
    const curriculum = await app.inject({
      method: "POST", url: "/api/admin/curriculum", headers: auth("admin"),
      payload: { program: "TEST", level: "LEVEL_I", curriculumYear: 2030, status: "DRAFT" },
    });
    const subject = await app.inject({
      method: "POST", url: "/api/admin/subjects", headers: auth("admin"),
      payload: { curriculumId: curriculum.json().curriculum.id, name: "Draft parent subject", slug: "draft-parent-subject", order: 1, status: "PUBLISHED" },
    });
    const module = await app.inject({
      method: "POST", url: "/api/admin/modules", headers: auth("admin"),
      payload: { subjectId: subject.json().subject.id, title: "Published child module", slug: "published-child-module", order: 1, status: "PUBLISHED" },
    });
    const subtopic = await app.inject({
      method: "POST", url: "/api/admin/subtopics", headers: auth("admin"),
      payload: { moduleId: module.json().module.id, title: "Published child subtopic", slug: "published-child-subtopic", order: 1, status: "PUBLISHED" },
    });
    const lesson = await app.inject({
      method: "POST", url: "/api/admin/lessons", headers: auth("admin"),
      payload: { subtopicId: subtopic.json().subtopic.id, title: "Published child lesson", slug: "published-child-lesson", order: 1, status: "PUBLISHED" },
    });

    expect((await app.inject({ method: "GET", url: `/api/modules/${module.json().module.id}`, headers: auth() })).statusCode).toBe(404);
    expect((await app.inject({ method: "GET", url: `/api/subtopics/${subtopic.json().subtopic.id}/lessons`, headers: auth() })).json().lessons).toEqual([]);
    expect((await app.inject({ method: "GET", url: `/api/lessons/${lesson.json().lesson.id}`, headers: auth() })).statusCode).toBe(404);
    await app.close();
  });

  it("supports original lesson content, verified video, privacy-safe questions, progress and weak concepts", async () => {
    const { app, context } = await harness();
    const moduleId = "module-returns-of-financial-assets-and-instruments";
    const createdSubtopic = await app.inject({ method: "POST", url: "/api/admin/subtopics", headers: auth("admin"), payload: { moduleId, title: "Original test topic", slug: "original-test-topic", order: 1, learningOutcomes: ["A test-only learning outcome"], status: "PUBLISHED" } });
    expect(createdSubtopic.statusCode).toBe(201);
    const subtopicId = createdSubtopic.json().subtopic.id;
    const createdLesson = await app.inject({ method: "POST", url: "/api/admin/lessons", headers: auth("admin"), payload: { subtopicId, title: "Original test lesson", slug: "original-test-lesson", order: 1, status: "PUBLISHED", content: { conceptIntroduction: "Original fixture.", simpleExplanation: "A test fixture only.", summary: "Test summary." } } });
    expect(createdLesson.statusCode).toBe(201);
    const lessonId = createdLesson.json().lesson.id;
    const lessonDetail = await app.inject({ method: "GET", url: `/api/lessons/${lessonId}`, headers: auth() });
    expect(lessonDetail.statusCode).toBe(200);
    expect(lessonDetail.json().lesson.content).toMatchObject({
      conceptIntroduction: "Original fixture.",
      summary: "Test summary.",
      definitions: [],
      financialApplications: [],
      commonMistakes: [],
      curriculumOutcomeMappings: [],
      sourceReferences: [],
    });
    const draftLesson = await app.inject({ method: "POST", url: "/api/admin/lessons", headers: auth("admin"), payload: { subtopicId, title: "Private review draft", slug: "private-review-draft", order: 2, status: "DRAFT", content: { conceptIntroduction: "Not student facing.", simpleExplanation: "Draft text.", summary: "Draft summary." } } });
    expect(draftLesson.statusCode).toBe(201);
    expect((await app.inject({ method: "GET", url: `/api/lessons/${draftLesson.json().lesson.id}`, headers: auth() })).statusCode).toBe(404);
    expect((await app.inject({ method: "GET", url: `/api/subtopics/${subtopicId}/lessons`, headers: auth() })).json().lessons.map((item: { id: string }) => item.id)).toEqual([lessonId]);
    const draftPreviewPath = `/api/admin/modules/${moduleId}/draft-lessons`;
    expect((await app.inject({ method: "GET", url: draftPreviewPath })).statusCode).toBe(401);
    expect((await app.inject({ method: "GET", url: draftPreviewPath, headers: auth() })).statusCode).toBe(403);
    const draftPreview = await app.inject({ method: "GET", url: draftPreviewPath, headers: auth("admin") });
    expect(draftPreview.statusCode).toBe(200);
    expect(draftPreview.json().lessons[0].content).toMatchObject({ conceptIntroduction: "Not student facing.", definitions: [] });

    const invalidVideo = await app.inject({ method: "POST", url: `/api/admin/lessons/${lessonId}/videos`, headers: auth("admin"), payload: { youtubeVideoId: "invented-url", title: "Test video", language: "English" } });
    expect(invalidVideo.statusCode).toBe(400);
    const videoResponse = await app.inject({ method: "POST", url: `/api/admin/lessons/${lessonId}/videos`, headers: auth("admin"), payload: { youtubeVideoId: "abcdefghijk", title: "Test fixture video", language: "English", chapters: [{ title: "Start", startSeconds: 0 }, { title: "Worked example", startSeconds: 20 }] } });
    expect(videoResponse.statusCode).toBe(201);
    const videoId = videoResponse.json().resource.id;
    expect(videoResponse.json().resource.verificationStatus).toBe("PENDING_REVIEW");
    expect((await app.inject({ method: "GET", url: `/api/lessons/${lessonId}/resources`, headers: auth() })).json().resources).toHaveLength(0);
    expect((await app.inject({ method: "PATCH", url: `/api/admin/videos/${videoId}`, headers: auth("admin"), payload: { isPrimary: true } })).statusCode).toBe(409);
    await app.inject({ method: "PATCH", url: `/api/admin/videos/${videoId}/verification`, headers: auth("admin"), payload: { verificationStatus: "VERIFIED" } });
    const invalidChapters = await app.inject({ method: "PATCH", url: `/api/admin/videos/${videoId}`, headers: auth("admin"), payload: { chapters: [{ title: "Later", startSeconds: 20 }, { title: "Earlier", startSeconds: 10 }] } });
    expect(invalidChapters.statusCode).toBe(400);
    const primary = await app.inject({ method: "PATCH", url: `/api/admin/videos/${videoId}`, headers: auth("admin"), payload: { isPrimary: true } });
    expect(primary.json().resource.embedUrl).toBe("https://www.youtube-nocookie.com/embed/abcdefghijk");
    const backupResponse = await app.inject({ method: "POST", url: `/api/admin/lessons/${lessonId}/videos`, headers: auth("admin"), payload: { youtubeVideoId: "lmnopqrstuv", title: "Backup fixture video", language: "English" } });
    const backupId = backupResponse.json().resource.id;
    await app.inject({ method: "PATCH", url: `/api/admin/videos/${backupId}/verification`, headers: auth("admin"), payload: { verificationStatus: "VERIFIED" } });
    await app.inject({ method: "PATCH", url: `/api/admin/videos/${backupId}`, headers: auth("admin"), payload: { isPrimary: true } });
    const resourcesAfterPromotion = await app.inject({ method: "GET", url: `/api/lessons/${lessonId}/resources`, headers: auth() });
    expect(resourcesAfterPromotion.json().resources.filter((resource: { isPrimary: boolean }) => resource.isPrimary)).toHaveLength(1);
    await app.inject({ method: "PATCH", url: `/api/admin/videos/${backupId}/verification`, headers: auth("admin"), payload: { verificationStatus: "UNAVAILABLE" } });
    expect((await app.inject({ method: "GET", url: `/api/lessons/${lessonId}/resources`, headers: auth() })).json().resources).toHaveLength(1);

    const questionResponse = await app.inject({ method: "POST", url: `/api/admin/lessons/${lessonId}/questions`, headers: auth("admin"), payload: { question: "Original test question: which choice is correct?", options: [{ id: "A", text: "First" }, { id: "B", text: "Second" }], correctAnswer: "B", explanation: "Original test explanation.", concepts: ["sample-concept"], order: 1, status: "PUBLISHED" } });
    expect(questionResponse.statusCode).toBe(201);
    const questionId = questionResponse.json().question.id;
    const publicQuestion = await app.inject({ method: "GET", url: `/api/lessons/${lessonId}/questions`, headers: auth() });
    expect(publicQuestion.json().questions[0]).not.toHaveProperty("correctAnswer");
    const attempt = await app.inject({ method: "POST", url: `/api/questions/${questionId}/attempt`, headers: auth(), payload: { selectedAnswer: "A", timeTakenSeconds: 9 } });
    expect(attempt.json().feedback).toMatchObject({ isCorrect: false, correctAnswer: "B" });
    expect((await app.inject({ method: "GET", url: "/api/students/me/weak-concepts", headers: auth() })).json().weakConcepts[0].concept).toBe("sample-concept");

    await app.inject({ method: "POST", url: `/api/lessons/${lessonId}/progress`, headers: auth(), payload: { videoProgressSeconds: 25, videoCompleted: true } });
    const progress = await app.inject({ method: "GET", url: `/api/lessons/${lessonId}/progress`, headers: auth() });
    expect(progress.json().progress.videoCompleted).toBe(true);
    expect(progress.json().progress.lessonCompleted).toBe(false);
    expect((await app.inject({ method: "GET", url: `/api/lessons/${lessonId}/progress`, headers: auth("other") })).json().progress).toBeNull();
    const tutorContext = await context.getContext(users.student.id, lessonId);
    expect(tutorContext?.recentIncorrectAnswers).toHaveLength(1);
    expect(tutorContext?.weakConcepts).toContain("sample-concept");
    await app.close();
  });

  it("rejects malformed IDs and request bodies with a client error", async () => {
    const { app } = await harness();
    expect((await app.inject({ method: "GET", url: "/api/modules/%20", headers: auth() })).statusCode).toBe(400);
    expect((await app.inject({ method: "POST", url: "/api/lessons/missing/progress", headers: auth(), payload: {} })).statusCode).toBe(400);
    expect((await app.inject({ method: "GET", url: "/api/lessons/missing", headers: auth() })).statusCode).toBe(404);
    await app.close();
  });
});
