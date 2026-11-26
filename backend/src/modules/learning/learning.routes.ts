import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { HttpError } from "../../shared/errors/http-error.js";
import { requireAdminUser, requireSessionUser, type SessionAuthenticator } from "../../shared/auth/session-authenticator.js";
import type { LearningRepository } from "./learning.repository.js";
import { LearningService } from "./learning.service.js";
import {
  curriculumCreateSchema, lessonCreateSchema, lessonIdParamSchema,
  learningOutcomeCreateSchema, learningOutcomeMappingsSchema, lessonPatchSchema, levelSlugSchema, moduleCreateSchema, moduleIdParamSchema,
  progressUpdateSchema, questionAttemptSchema, questionCreateSchema,
  questionIdParamSchema, subtopicCreateSchema, subtopicIdParamSchema,
  subjectCreateSchema, videoCreateSchema, videoIdParamSchema, videoPatchSchema,
  videoVerificationSchema, yearQuerySchema,
} from "./learning.schema.js";

const levelValues = { "level-1": "LEVEL_I", "level-2": "LEVEL_II", "level-3": "LEVEL_III" } as const;
const levelParamSchema = z.object({ level: levelSlugSchema });

export function registerLearningRoutes(app: FastifyInstance, repository: LearningRepository, auth: SessionAuthenticator) {
  const service = new LearningService(repository);

  app.get("/api/curriculum/:level", async (request) => {
    const user = await requireSessionUser(request, auth);
    const { level } = levelParamSchema.parse(request.params);
    const { year } = yearQuerySchema.parse(request.query);
    const curriculum = await repository.getCurriculum(levelValues[level], year);
    if (!curriculum) throw new HttpError(404, "Curriculum was not found.", "CURRICULUM_NOT_FOUND");
    return { curriculum };
  });

  app.get("/api/curriculum/:level/subjects", async (request) => {
    await requireSessionUser(request, auth);
    const { level } = levelParamSchema.parse(request.params);
    const { year } = yearQuerySchema.parse(request.query);
    return { subjects: await repository.listSubjects(levelValues[level], year) };
  });

  app.get("/api/subjects/quantitative-methods", async (request) => {
    await requireSessionUser(request, auth);
    const { year } = yearQuerySchema.parse(request.query);
    const subject = await repository.getSubjectBySlug("quantitative-methods", year);
    if (!subject) throw new HttpError(404, "Quantitative Methods was not found for this curriculum year.", "SUBJECT_NOT_FOUND");
    return { subject };
  });

  app.get("/api/subjects/quantitative-methods/modules", async (request) => {
    await requireSessionUser(request, auth);
    const { year } = yearQuerySchema.parse(request.query);
    const subject = await repository.getSubjectBySlug("quantitative-methods", year);
    if (!subject) throw new HttpError(404, "Quantitative Methods was not found for this curriculum year.", "SUBJECT_NOT_FOUND");
    return { modules: await repository.listModules(subject.id) };
  });

  app.get("/api/modules/:moduleId", async (request) => {
    await requireSessionUser(request, auth);
    const { moduleId } = moduleIdParamSchema.parse(request.params);
    const module = await repository.getModule(moduleId);
    if (!module) throw new HttpError(404, "Learning module was not found.", "MODULE_NOT_FOUND");
    return { module };
  });

  app.get("/api/modules/:moduleId/subtopics", async (request) => {
    await requireSessionUser(request, auth);
    const { moduleId } = moduleIdParamSchema.parse(request.params);
    if (!await repository.getModule(moduleId)) throw new HttpError(404, "Learning module was not found.", "MODULE_NOT_FOUND");
    return { subtopics: await repository.listSubtopics(moduleId) };
  });

  app.get("/api/subtopics/:subtopicId/learning-outcomes", async (request) => {
    await requireSessionUser(request, auth);
    const { subtopicId } = subtopicIdParamSchema.parse(request.params);
    if (!await repository.getSubtopic(subtopicId)) throw new HttpError(404, "Subtopic was not found.", "SUBTOPIC_NOT_FOUND");
    return { learningOutcomes: await repository.listLearningOutcomes(subtopicId) };
  });

  app.get("/api/lessons/:lessonId/learning-outcomes", async (request) => {
    await requireSessionUser(request, auth);
    const { lessonId } = lessonIdParamSchema.parse(request.params);
    if (!await repository.getLesson(lessonId)) throw new HttpError(404, "Lesson was not found.", "LESSON_NOT_FOUND");
    return { learningOutcomes: await repository.listLessonLearningOutcomes(lessonId) };
  });

  app.get("/api/subtopics/:subtopicId/lessons", async (request) => {
    await requireSessionUser(request, auth);
    const { subtopicId } = subtopicIdParamSchema.parse(request.params);
    const lessons = await repository.listLessons(subtopicId);
    return { lessons };
  });

  app.get("/api/lessons/:lessonId", async (request) => {
    await requireSessionUser(request, auth);
    const { lessonId } = lessonIdParamSchema.parse(request.params);
    const lesson = await repository.getLesson(lessonId);
    if (!lesson) throw new HttpError(404, "Lesson was not found.", "LESSON_NOT_FOUND");
    return { lesson };
  });

  app.get("/api/lessons/:lessonId/resources", async (request) => {
    await requireSessionUser(request, auth);
    const { lessonId } = lessonIdParamSchema.parse(request.params);
    if (!await repository.getLesson(lessonId)) throw new HttpError(404, "Lesson was not found.", "LESSON_NOT_FOUND");
    return { resources: await repository.listVideos(lessonId) };
  });

  app.get("/api/lessons/:lessonId/questions", async (request) => {
    await requireSessionUser(request, auth);
    const { lessonId } = lessonIdParamSchema.parse(request.params);
    if (!await repository.getLesson(lessonId)) throw new HttpError(404, "Lesson was not found.", "LESSON_NOT_FOUND");
    return { questions: await repository.listQuestions(lessonId) };
  });

  app.post("/api/lessons/:lessonId/progress", async (request) => {
    const user = await requireSessionUser(request, auth);
    const { lessonId } = lessonIdParamSchema.parse(request.params);
    const input = progressUpdateSchema.parse(request.body);
    return { progress: await service.updateProgress(user.id, lessonId, input) };
  });

  app.get("/api/lessons/:lessonId/progress", async (request) => {
    const user = await requireSessionUser(request, auth);
    const { lessonId } = lessonIdParamSchema.parse(request.params);
    if (!await repository.getLesson(lessonId)) throw new HttpError(404, "Lesson was not found.", "LESSON_NOT_FOUND");
    return { progress: await service.getProgress(user.id, lessonId) };
  });

  app.post("/api/questions/:questionId/attempt", async (request) => {
    const user = await requireSessionUser(request, auth);
    const { questionId } = questionIdParamSchema.parse(request.params);
    const input = questionAttemptSchema.parse(request.body);
    return service.attemptQuestion(user.id, questionId, input);
  });

  app.get("/api/students/me/quant-progress", async (request) => {
    const user = await requireSessionUser(request, auth);
    const { year } = yearQuerySchema.parse(request.query);
    return { progress: await repository.getQuantProgress(user.id, year) };
  });

  app.get("/api/students/me/weak-concepts", async (request) => {
    const user = await requireSessionUser(request, auth);
    return { weakConcepts: await repository.getWeakConcepts(user.id) };
  });

  app.post("/api/admin/curriculum", async (request, reply) => {
    await requireAdminUser(request, auth);
    const input = curriculumCreateSchema.parse(request.body);
    return reply.status(201).send({ curriculum: await repository.createCurriculum(input) });
  });

  app.post("/api/admin/subjects", async (request, reply) => {
    await requireAdminUser(request, auth);
    const input = subjectCreateSchema.parse(request.body);
    return reply.status(201).send({ subject: await repository.createSubject(input) });
  });

  app.post("/api/admin/modules", async (request, reply) => {
    await requireAdminUser(request, auth);
    const input = moduleCreateSchema.parse(request.body);
    return reply.status(201).send({ module: await repository.createModule(input) });
  });

  app.post("/api/admin/subtopics", async (request, reply) => {
    await requireAdminUser(request, auth);
    const input = subtopicCreateSchema.parse(request.body);
    return reply.status(201).send({ subtopic: await repository.createSubtopic(input) });
  });

  app.post("/api/admin/subtopics/:subtopicId/learning-outcomes", async (request, reply) => {
    await requireAdminUser(request, auth);
    const { subtopicId } = subtopicIdParamSchema.parse(request.params);
    const input = learningOutcomeCreateSchema.parse(request.body);
    const learningOutcome = await repository.createLearningOutcome(subtopicId, input);
    if (!learningOutcome) throw new HttpError(404, "Subtopic was not found.", "SUBTOPIC_NOT_FOUND");
    return reply.status(201).send({ learningOutcome });
  });

  app.put("/api/admin/lessons/:lessonId/learning-outcomes", async (request) => {
    await requireAdminUser(request, auth);
    const { lessonId } = lessonIdParamSchema.parse(request.params);
    const input = learningOutcomeMappingsSchema.parse(request.body);
    const learningOutcomes = await repository.setLessonLearningOutcomes(lessonId, input);
    if (!learningOutcomes) throw new HttpError(404, "Lesson was not found.", "LESSON_NOT_FOUND");
    return { learningOutcomes };
  });

  app.put("/api/admin/questions/:questionId/learning-outcomes", async (request) => {
    await requireAdminUser(request, auth);
    const { questionId } = questionIdParamSchema.parse(request.params);
    const input = learningOutcomeMappingsSchema.parse(request.body);
    const learningOutcomes = await repository.setQuestionLearningOutcomes(questionId, input);
    if (!learningOutcomes) throw new HttpError(404, "Practice question was not found.", "QUESTION_NOT_FOUND");
    return { learningOutcomes };
  });

  app.post("/api/admin/lessons", async (request, reply) => {
    await requireAdminUser(request, auth);
    const input = lessonCreateSchema.parse(request.body);
    return reply.status(201).send({ lesson: await repository.createLesson(input) });
  });

  app.patch("/api/admin/lessons/:lessonId", async (request) => {
    await requireAdminUser(request, auth);
    const { lessonId } = lessonIdParamSchema.parse(request.params);
    const input = lessonPatchSchema.parse(request.body);
    const lesson = await repository.updateLesson(lessonId, input);
    if (!lesson) throw new HttpError(404, "Lesson was not found.", "LESSON_NOT_FOUND");
    return { lesson };
  });

  app.delete("/api/admin/lessons/:lessonId", async (request) => {
    await requireAdminUser(request, auth);
    const { lessonId } = lessonIdParamSchema.parse(request.params);
    if (!await repository.archiveLesson(lessonId)) throw new HttpError(404, "Lesson was not found.", "LESSON_NOT_FOUND");
    return { archived: true };
  });

  app.post("/api/admin/lessons/:lessonId/videos", async (request, reply) => {
    const admin = await requireAdminUser(request, auth);
    const { lessonId } = lessonIdParamSchema.parse(request.params);
    const input = videoCreateSchema.parse(request.body);
    return reply.status(201).send({ resource: await service.createVideo(admin.id, lessonId, input) });
  });

  app.patch("/api/admin/videos/:videoId", async (request) => {
    await requireAdminUser(request, auth);
    const { videoId } = videoIdParamSchema.parse(request.params);
    const input = videoPatchSchema.parse(request.body);
    return { resource: await service.updateVideo(videoId, input) };
  });

  app.patch("/api/admin/videos/:videoId/verification", async (request) => {
    const admin = await requireAdminUser(request, auth);
    const { videoId } = videoIdParamSchema.parse(request.params);
    const { verificationStatus } = videoVerificationSchema.parse(request.body);
    return { resource: await service.updateVideoVerification(admin.id, videoId, verificationStatus) };
  });

  app.delete("/api/admin/videos/:videoId", async (request) => {
    await requireAdminUser(request, auth);
    const { videoId } = videoIdParamSchema.parse(request.params);
    if (!await repository.archiveVideo(videoId)) throw new HttpError(404, "Video resource was not found.", "VIDEO_NOT_FOUND");
    return { archived: true };
  });

  app.post("/api/admin/lessons/:lessonId/questions", async (request, reply) => {
    await requireAdminUser(request, auth);
    const { lessonId } = lessonIdParamSchema.parse(request.params);
    const input = questionCreateSchema.parse({ ...z.record(z.string(), z.unknown()).parse(request.body), lessonId });
    return reply.status(201).send({ question: await service.createQuestion(input) });
  });

  app.delete("/api/admin/questions/:questionId", async (request) => {
    await requireAdminUser(request, auth);
    const { questionId } = questionIdParamSchema.parse(request.params);
    if (!await repository.archiveQuestion(questionId)) throw new HttpError(404, "Practice question was not found.", "QUESTION_NOT_FOUND");
    return { archived: true };
  });
}
