import { Prisma, type PrismaClient } from "@prisma/client";
import { HttpError } from "../../shared/errors/http-error.js";
import type {
  CurriculumCreateInput, LessonCreateInput, LessonPatchInput, ModuleCreateInput,
  ProgressUpdateInput, QuestionAttemptInput, QuestionCreateInput, SubtopicCreateInput,
  SubjectCreateInput, VideoCreateInput, VideoPatchInput,
} from "./learning.schema.js";
import type { LearningRepository } from "./learning.repository.js";
import type {
  AttemptQuestion, CurriculumTree, DraftLessonRecord, LessonRecord, LessonSummary, ModuleTree,
  ProgressRecord, PublicQuestion, QuestionAttemptRecord, QuantProgressView,
  SubtopicTree, SubjectTree, TutorLessonContext, VideoRecord, WeakConceptRecord,
} from "./learning.types.js";

const publishedLessonWhere = {
  status: "PUBLISHED" as const,
  subtopic: { status: "PUBLISHED" as const, module: { status: "PUBLISHED" as const, subject: { status: "PUBLISHED" as const, curriculum: { status: "PUBLISHED" as const } } } },
};

export class PrismaLearningRepository implements LearningRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async getCurriculum(level: "LEVEL_I" | "LEVEL_II" | "LEVEL_III", year: number): Promise<CurriculumTree | null> {
    return this.prisma.curriculum.findFirst({
      where: { program: "CFA", level, curriculumYear: year, status: "PUBLISHED" },
      include: { subjects: {
        where: { status: "PUBLISHED" }, orderBy: { order: "asc" }, include: { modules: {
          where: { status: "PUBLISHED" }, orderBy: { order: "asc" }, include: { subtopics: {
            where: { status: "PUBLISHED" }, orderBy: { order: "asc" }, include: { lessons: { where: { status: "PUBLISHED" }, orderBy: { order: "asc" } } },
          } },
        } },
      } },
    }) as Promise<CurriculumTree | null>;
  }

  async listSubjects(level: "LEVEL_I" | "LEVEL_II" | "LEVEL_III", year: number): Promise<SubjectTree[]> {
    const records = await this.prisma.subject.findMany({ where: { status: "PUBLISHED", curriculum: { program: "CFA", level, curriculumYear: year, status: "PUBLISHED" } }, orderBy: { order: "asc" } });
    return records as SubjectTree[];
  }

  async getSubjectBySlug(slug: string, year: number): Promise<SubjectTree | null> {
    const record = await this.prisma.subject.findFirst({
      where: { slug, status: "PUBLISHED", curriculum: { program: "CFA", level: "LEVEL_I", curriculumYear: year, status: "PUBLISHED" } },
      include: {
        modules: {
          where: { status: "PUBLISHED" }, orderBy: { order: "asc" },
          include: { subtopics: {
            where: { status: "PUBLISHED" }, orderBy: { order: "asc" },
            include: { lessons: { where: { status: "PUBLISHED" }, orderBy: { order: "asc" } } },
          } },
        },
      },
    });
    return record as SubjectTree | null;
  }

  async listModules(subjectId: string): Promise<ModuleTree[]> {
    const records = await this.prisma.learningModule.findMany({ where: { subjectId, status: "PUBLISHED", subject: { status: "PUBLISHED", curriculum: { status: "PUBLISHED" } } }, orderBy: { order: "asc" } });
    return records as ModuleTree[];
  }

  async getModule(moduleId: string): Promise<ModuleTree | null> {
    const record = await this.prisma.learningModule.findFirst({
      where: { id: moduleId, status: "PUBLISHED", subject: { status: "PUBLISHED", curriculum: { status: "PUBLISHED" } } },
      include: { subtopics: { where: { status: "PUBLISHED" }, orderBy: { order: "asc" }, include: { lessons: { where: { status: "PUBLISHED" }, orderBy: { order: "asc" } } } } },
    });
    return record as ModuleTree | null;
  }

  async getSubtopic(subtopicId: string): Promise<SubtopicTree | null> {
    const record = await this.prisma.subtopic.findFirst({
      where: { id: subtopicId, status: "PUBLISHED", module: { status: "PUBLISHED", subject: { status: "PUBLISHED", curriculum: { status: "PUBLISHED" } } } },
    });
    return record as SubtopicTree | null;
  }

  async listSubtopics(moduleId: string): Promise<SubtopicTree[]> {
    const records = await this.prisma.subtopic.findMany({ where: { moduleId, status: "PUBLISHED", module: { status: "PUBLISHED", subject: { status: "PUBLISHED", curriculum: { status: "PUBLISHED" } } } }, orderBy: { order: "asc" } });
    return records as SubtopicTree[];
  }

  async listLearningOutcomes(subtopicId: string): Promise<import("./learning.types.js").LearningOutcomeStatementRecord[]> {
    const records = await this.prisma.learningOutcomeStatement.findMany({
      where: {
        subtopicId, status: "PUBLISHED",
        curriculum: { status: "PUBLISHED", program: "CFA" },
        subtopic: { status: "PUBLISHED", module: { status: "PUBLISHED", subject: { status: "PUBLISHED", curriculum: { status: "PUBLISHED" } } } },
      },
      orderBy: { order: "asc" },
    });
    return records as import("./learning.types.js").LearningOutcomeStatementRecord[];
  }

  async listLessonLearningOutcomes(lessonId: string): Promise<import("./learning.types.js").LearningOutcomeStatementRecord[]> {
    const lesson = await this.prisma.lesson.findFirst({ where: { id: lessonId, ...publishedLessonWhere }, select: { id: true, subtopicId: true, subtopic: { select: { module: { select: { subject: { select: { curriculumId: true } } } } } } } });
    if (!lesson) return [];
    const records = await this.prisma.lessonLearningOutcome.findMany({
      where: { lessonId, learningOutcomeStatement: { status: "PUBLISHED", subtopicId: lesson.subtopicId, curriculumId: lesson.subtopic.module.subject.curriculumId } },
      include: { learningOutcomeStatement: true }, orderBy: { order: "asc" },
    });
    return records.map((record) => record.learningOutcomeStatement) as import("./learning.types.js").LearningOutcomeStatementRecord[];
  }

  async listQuestionLearningOutcomes(questionId: string): Promise<import("./learning.types.js").LearningOutcomeStatementRecord[]> {
    const question = await this.prisma.practiceQuestion.findFirst({ where: { id: questionId, status: "PUBLISHED", lesson: publishedLessonWhere }, select: { id: true, lessonId: true } });
    if (!question) return [];
    const records = await this.prisma.practiceQuestionLearningOutcome.findMany({
      where: { questionId, learningOutcomeStatement: { status: "PUBLISHED" } },
      include: { learningOutcomeStatement: true },
    });
    return records.map((record) => record.learningOutcomeStatement) as import("./learning.types.js").LearningOutcomeStatementRecord[];
  }

  async listLessons(subtopicId: string): Promise<LessonSummary[]> {
    const records = await this.prisma.lesson.findMany({ where: { subtopicId, ...publishedLessonWhere }, orderBy: { order: "asc" } });
    return records as LessonSummary[];
  }

  async getLesson(lessonId: string): Promise<LessonRecord | null> {
    const record = await this.prisma.lesson.findFirst({
      where: { id: lessonId, ...publishedLessonWhere },
      include: { subtopic: { include: { module: { include: { subject: { include: { curriculum: true } } } } } } },
    });
    return record as LessonRecord | null;
  }

  async listDraftLessonsForAdmin(moduleId: string): Promise<DraftLessonRecord[]> {
    const records = await this.prisma.lesson.findMany({
      where: {
        status: "DRAFT",
        subtopic: {
          moduleId,
          status: "PUBLISHED",
          module: { status: "PUBLISHED", subject: { status: "PUBLISHED", curriculum: { program: "CFA", status: "PUBLISHED" } } },
        },
      },
      include: {
        subtopic: {
          include: {
            module: {
              include: { subject: { include: { curriculum: true } } },
            },
          },
        },
      },
      orderBy: [{ subtopic: { order: "asc" } }, { order: "asc" }],
    });
    return records;
  }

  async listVideos(lessonId: string): Promise<VideoRecord[]> {
    const records = await this.prisma.videoResource.findMany({ where: { lessonId, verificationStatus: "VERIFIED" }, orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }] });
    return records as VideoRecord[];
  }

  async listQuestions(lessonId: string): Promise<PublicQuestion[]> {
    const records = await this.prisma.practiceQuestion.findMany({
      where: { lessonId, status: "PUBLISHED", lesson: publishedLessonWhere },
      select: { id: true, lessonId: true, question: true, questionType: true, difficulty: true, options: true, concepts: true, marks: true, order: true },
      orderBy: { order: "asc" },
    });
    return records as PublicQuestion[];
  }

  async getQuestionForAttempt(questionId: string): Promise<AttemptQuestion | null> {
    const record = await this.prisma.practiceQuestion.findFirst({
      where: { id: questionId, status: "PUBLISHED", lesson: publishedLessonWhere },
      select: { id: true, lessonId: true, question: true, questionType: true, difficulty: true, options: true, concepts: true, marks: true, order: true, correctAnswer: true, explanation: true, solutionSteps: true },
    });
    return record as AttemptQuestion | null;
  }

  async updateProgress(studentId: string, lessonId: string, input: ProgressUpdateInput): Promise<ProgressRecord> {
    return this.prisma.$transaction(async (tx) => {
      const previous = await tx.studentLessonProgress.findUnique({ where: { studentId_lessonId: { studentId, lessonId } } });
      const lessonCompleted = input.lessonCompleted ?? previous?.lessonCompleted ?? false;
      const videoCompleted = input.videoCompleted ?? previous?.videoCompleted ?? false;
      const videoProgressSeconds = input.videoProgressSeconds ?? previous?.videoProgressSeconds ?? 0;
      const status = lessonCompleted ? "COMPLETED" : (videoProgressSeconds > 0 || videoCompleted ? "IN_PROGRESS" : previous?.status ?? "NOT_STARTED");
      const record = await tx.studentLessonProgress.upsert({
        where: { studentId_lessonId: { studentId, lessonId } },
        create: { studentId, lessonId, videoProgressSeconds, videoCompleted, lessonCompleted, status, completedAt: lessonCompleted ? new Date() : null, lastAccessedAt: new Date() },
        update: { videoProgressSeconds, videoCompleted, lessonCompleted, status, completedAt: lessonCompleted ? previous?.completedAt ?? new Date() : null, lastAccessedAt: new Date() },
      });
      return record as ProgressRecord;
    });
  }

  async getProgress(studentId: string, lessonId: string): Promise<ProgressRecord | null> {
    const record = await this.prisma.studentLessonProgress.findUnique({ where: { studentId_lessonId: { studentId, lessonId } } });
    return record as ProgressRecord | null;
  }

  async createAttempt(studentId: string, questionId: string, input: QuestionAttemptInput, isCorrect: boolean, concepts: string[]): Promise<QuestionAttemptRecord> {
    return this.prisma.$transaction(async (tx) => {
      const question = await tx.practiceQuestion.findUnique({ where: { id: questionId }, select: { lessonId: true } });
      if (!question) throw new HttpError(404, "Practice question was not found.", "QUESTION_NOT_FOUND");
      const attempt = await tx.questionAttempt.create({ data: { studentId, questionId, selectedAnswer: input.selectedAnswer, timeTakenSeconds: input.timeTakenSeconds, isCorrect } });
      if (!isCorrect) {
        for (const concept of concepts) {
          await tx.studentWeakConcept.upsert({
            where: { studentId_lessonId_concept: { studentId, lessonId: question.lessonId, concept } },
            create: { studentId, lessonId: question.lessonId, concept, mistakeCount: 1 },
            update: { mistakeCount: { increment: 1 } },
          });
        }
      }
      return attempt as QuestionAttemptRecord;
    });
  }

  async getQuantProgress(studentId: string, year: number): Promise<QuantProgressView> {
    const scope = { lesson: { ...publishedLessonWhere, subtopic: { status: "PUBLISHED" as const, module: { status: "PUBLISHED" as const, subject: { slug: "quantitative-methods", status: "PUBLISHED" as const, curriculum: { program: "CFA", level: "LEVEL_I" as const, curriculumYear: year, status: "PUBLISHED" as const } } } } } };
    const [totalLessons, progress, attemptedQuestions, correctAttempts] = await Promise.all([
      this.prisma.lesson.count({ where: { ...publishedLessonWhere, subtopic: { status: "PUBLISHED", module: { status: "PUBLISHED", subject: { slug: "quantitative-methods", status: "PUBLISHED", curriculum: { program: "CFA", level: "LEVEL_I", curriculumYear: year, status: "PUBLISHED" } } } } } }),
      this.prisma.studentLessonProgress.findMany({ where: { studentId, ...scope }, select: { status: true, videoCompleted: true } }),
      this.prisma.questionAttempt.count({ where: { studentId, question: { status: "PUBLISHED", ...scope } } }),
      this.prisma.questionAttempt.count({ where: { studentId, isCorrect: true, question: { status: "PUBLISHED", ...scope } } }),
    ]);
    return {
      curriculumYear: year,
      totalLessons,
      completedLessons: progress.filter((item) => item.status === "COMPLETED").length,
      inProgressLessons: progress.filter((item) => item.status === "IN_PROGRESS").length,
      videoCompletedLessons: progress.filter((item) => item.videoCompleted).length,
      attemptedQuestions,
      correctAttempts,
    };
  }

  async getWeakConcepts(studentId: string): Promise<WeakConceptRecord[]> {
    const records = await this.prisma.studentWeakConcept.findMany({ where: { studentId }, orderBy: [{ mistakeCount: "desc" }, { updatedAt: "desc" }] });
    return records as WeakConceptRecord[];
  }

  async getTutorContext(studentId: string, lessonId: string): Promise<TutorLessonContext | null> {
    const lesson = await this.prisma.lesson.findFirst({ where: { id: lessonId, ...publishedLessonWhere }, include: { subtopic: { include: { module: { include: { subject: { include: { curriculum: true } } } } } } } });
    if (!lesson) return null;
    const [attempts, weakConcepts] = await Promise.all([
      this.prisma.questionAttempt.findMany({ where: { studentId, isCorrect: false, question: { lessonId, status: "PUBLISHED" } }, include: { question: { select: { question: true, correctAnswer: true, explanation: true } } }, orderBy: { attemptedAt: "desc" }, take: 5 }),
      this.prisma.studentWeakConcept.findMany({ where: { studentId, lessonId }, orderBy: { mistakeCount: "desc" }, take: 10 }),
    ]);
    return {
      level: lesson.subtopic.module.subject.curriculum.level,
      subject: lesson.subtopic.module.subject.name,
      curriculumYear: lesson.subtopic.module.subject.curriculum.curriculumYear,
      module: lesson.subtopic.module.title,
      subtopic: lesson.subtopic.title,
      lesson: lesson.title,
      learningObjectives: lesson.learningObjectives,
      content: lesson.content,
      recentIncorrectAnswers: attempts.map((attempt) => ({ question: attempt.question.question, selectedAnswer: attempt.selectedAnswer, correctAnswer: attempt.question.correctAnswer, explanation: attempt.question.explanation })),
      weakConcepts: weakConcepts.map((item) => item.concept),
    } as TutorLessonContext;
  }

  async createCurriculum(input: CurriculumCreateInput): Promise<CurriculumTree> {
    const record = await this.prisma.curriculum.create({ data: input, include: { subjects: true } });
    return { ...record, subjects: [] } as CurriculumTree;
  }

  async createSubject(input: SubjectCreateInput): Promise<SubjectTree> {
    return await this.prisma.subject.create({ data: input }) as SubjectTree;
  }

  async createModule(input: ModuleCreateInput): Promise<ModuleTree> {
    return await this.prisma.learningModule.create({ data: input }) as ModuleTree;
  }

  async createSubtopic(input: SubtopicCreateInput): Promise<SubtopicTree> {
    return await this.prisma.subtopic.create({ data: input }) as SubtopicTree;
  }

  async createLearningOutcome(subtopicId: string, input: import("./learning.schema.js").LearningOutcomeCreateInput): Promise<import("./learning.types.js").LearningOutcomeStatementRecord | null> {
    const subtopic = await this.prisma.subtopic.findUnique({
      where: { id: subtopicId },
      select: { id: true, module: { select: { subject: { select: { curriculumId: true } } } } },
    });
    if (!subtopic) return null;
    const curriculumId = subtopic.module.subject.curriculumId;
    const existing = await this.prisma.learningOutcomeStatement.findUnique({ where: { curriculumId_identifier: { curriculumId, identifier: input.identifier } }, select: { id: true } });
    if (existing) throw new HttpError(409, "This learning outcome identifier already exists in the curriculum.", "LEARNING_OUTCOME_EXISTS");
    try {
      return await this.prisma.learningOutcomeStatement.create({ data: { ...input, curriculumId, subtopicId } }) as import("./learning.types.js").LearningOutcomeStatementRecord;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") throw new HttpError(409, "This learning outcome identifier already exists in the curriculum.", "LEARNING_OUTCOME_EXISTS");
      throw error;
    }
  }

  async setLessonLearningOutcomes(lessonId: string, input: import("./learning.schema.js").LearningOutcomeMappingsInput): Promise<import("./learning.types.js").LearningOutcomeStatementRecord[] | null> {
    return this.prisma.$transaction(async (tx) => {
      const lesson = await tx.lesson.findUnique({ where: { id: lessonId }, select: { id: true, subtopicId: true, subtopic: { select: { module: { select: { subject: { select: { curriculumId: true } } } } } } } });
      if (!lesson) return null;
      const outcomes = await tx.learningOutcomeStatement.findMany({ where: { id: { in: input.learningOutcomeStatementIds }, subtopicId: lesson.subtopicId, curriculumId: lesson.subtopic.module.subject.curriculumId } });
      if (outcomes.length !== input.learningOutcomeStatementIds.length) throw new HttpError(400, "Learning outcomes must belong to the lesson's subtopic.", "INVALID_LEARNING_OUTCOME_MAPPING");
      await tx.lessonLearningOutcome.deleteMany({ where: { lessonId } });
      if (input.learningOutcomeStatementIds.length) await tx.lessonLearningOutcome.createMany({ data: input.learningOutcomeStatementIds.map((learningOutcomeStatementId, order) => ({ lessonId, learningOutcomeStatementId, order: order + 1 })) });
      return outcomes.sort((a, b) => input.learningOutcomeStatementIds.indexOf(a.id) - input.learningOutcomeStatementIds.indexOf(b.id)) as import("./learning.types.js").LearningOutcomeStatementRecord[];
    });
  }

  async setQuestionLearningOutcomes(questionId: string, input: import("./learning.schema.js").LearningOutcomeMappingsInput): Promise<import("./learning.types.js").LearningOutcomeStatementRecord[] | null> {
    return this.prisma.$transaction(async (tx) => {
      const question = await tx.practiceQuestion.findUnique({
        where: { id: questionId },
        select: {
          id: true,
          lesson: {
            select: {
              subtopicId: true,
              subtopic: {
                select: {
                  module: {
                    select: { subject: { select: { curriculumId: true } } },
                  },
                },
              },
            },
          },
        },
      });
      if (!question) return null;
      const subtopicId = question.lesson.subtopicId;
      const curriculumId = question.lesson.subtopic.module.subject.curriculumId;
      const outcomes = await tx.learningOutcomeStatement.findMany({ where: { id: { in: input.learningOutcomeStatementIds }, subtopicId, curriculumId } });
      if (outcomes.length !== input.learningOutcomeStatementIds.length) throw new HttpError(400, "Learning outcomes must belong to the question's lesson subtopic.", "INVALID_LEARNING_OUTCOME_MAPPING");
      await tx.practiceQuestionLearningOutcome.deleteMany({ where: { questionId } });
      if (input.learningOutcomeStatementIds.length) await tx.practiceQuestionLearningOutcome.createMany({ data: input.learningOutcomeStatementIds.map((learningOutcomeStatementId) => ({ questionId, learningOutcomeStatementId })) });
      return outcomes.sort((a, b) => input.learningOutcomeStatementIds.indexOf(a.id) - input.learningOutcomeStatementIds.indexOf(b.id)) as import("./learning.types.js").LearningOutcomeStatementRecord[];
    });
  }

  async createLesson(input: LessonCreateInput): Promise<LessonSummary> {
    return await this.prisma.lesson.create({ data: { ...input, content: input.content as Prisma.InputJsonValue | undefined } }) as LessonSummary;
  }

  async updateLesson(lessonId: string, input: LessonPatchInput): Promise<LessonSummary | null> {
    const result = await this.prisma.lesson.updateMany({ where: { id: lessonId }, data: { ...input, content: input.content as Prisma.InputJsonValue | undefined } });
    if (!result.count) return null;
    return await this.prisma.lesson.findUnique({ where: { id: lessonId } }) as LessonSummary;
  }

  async archiveLesson(lessonId: string): Promise<boolean> {
    const result = await this.prisma.lesson.updateMany({ where: { id: lessonId }, data: { status: "ARCHIVED" } });
    return result.count > 0;
  }

  async createVideo(adminId: string, lessonId: string, input: VideoCreateInput): Promise<VideoRecord | null> {
    const lesson = await this.prisma.lesson.findUnique({ where: { id: lessonId }, select: { id: true } });
    if (!lesson) return null;
    const videoUrl = `https://www.youtube.com/watch?v=${input.youtubeVideoId}`;
    const embedUrl = `https://www.youtube-nocookie.com/embed/${input.youtubeVideoId}`;
    return await this.prisma.videoResource.create({ data: {
      lessonId, youtubeVideoId: input.youtubeVideoId, title: input.title, videoUrl, embedUrl,
      durationSeconds: input.durationSeconds, language: input.language, explanationStyle: input.explanationStyle,
      sourceChannel: input.sourceChannel, sourceChannelUrl: input.sourceChannelUrl,
      chapters: input.chapters as Prisma.InputJsonValue | undefined,
      verifiedById: null, isPrimary: false,
    } }) as VideoRecord;
  }

  async updateVideo(videoId: string, input: VideoPatchInput): Promise<VideoRecord | null> {
    return this.prisma.$transaction(async (tx) => {
      const current = await tx.videoResource.findUnique({ where: { id: videoId } });
      if (!current) return null;
      if (input.isPrimary && current.verificationStatus !== "VERIFIED") throw new HttpError(409, "Only a verified video can be set as primary.", "VIDEO_NOT_VERIFIED");
      if (input.isPrimary) await tx.videoResource.updateMany({ where: { lessonId: current.lessonId, id: { not: videoId }, isPrimary: true }, data: { isPrimary: false } });
      const { isPrimary, ...updates } = input;
      const record = await tx.videoResource.update({ where: { id: videoId }, data: { ...updates, chapters: updates.chapters === null ? Prisma.DbNull : updates.chapters as Prisma.InputJsonValue | undefined, ...(isPrimary === undefined ? {} : { isPrimary }) } });
      return record as VideoRecord;
    });
  }

  async updateVideoVerification(adminId: string, videoId: string, status: "PENDING_REVIEW" | "VERIFIED" | "UNAVAILABLE" | "REJECTED"): Promise<VideoRecord | null> {
    return this.prisma.$transaction(async (tx) => {
      const current = await tx.videoResource.findUnique({ where: { id: videoId } });
      if (!current) return null;
      if (status !== "VERIFIED" && current.isPrimary) await tx.videoResource.update({ where: { id: videoId }, data: { isPrimary: false } });
      const record = await tx.videoResource.update({ where: { id: videoId }, data: {
        verificationStatus: status,
        verifiedAt: status === "VERIFIED" ? new Date() : null,
        verifiedById: status === "VERIFIED" ? adminId : null,
        lastCheckedAt: new Date(),
      } });
      return record as VideoRecord;
    });
  }

  async archiveVideo(videoId: string): Promise<boolean> {
    const result = await this.prisma.videoResource.updateMany({ where: { id: videoId }, data: { verificationStatus: "UNAVAILABLE", isPrimary: false, lastCheckedAt: new Date() } });
    return result.count > 0;
  }

  async createQuestion(input: QuestionCreateInput): Promise<PublicQuestion | null> {
    const lesson = await this.prisma.lesson.findUnique({ where: { id: input.lessonId }, select: { id: true } });
    if (!lesson) return null;
    const { lessonId, solutionSteps, ...data } = input;
    const record = await this.prisma.practiceQuestion.create({
      data: { lessonId, ...data, options: data.options as Prisma.InputJsonValue, solutionSteps: solutionSteps as Prisma.InputJsonValue | undefined },
      select: { id: true, lessonId: true, question: true, questionType: true, difficulty: true, options: true, concepts: true, marks: true, order: true },
    });
    return record as PublicQuestion;
  }

  async archiveQuestion(questionId: string): Promise<boolean> {
    const result = await this.prisma.practiceQuestion.updateMany({ where: { id: questionId }, data: { status: "ARCHIVED" } });
    return result.count > 0;
  }
}
