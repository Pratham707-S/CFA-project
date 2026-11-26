import { randomUUID } from "node:crypto";
import { HttpError } from "../../shared/errors/http-error.js";
import { quant2027Curriculum } from "./quant-2027-curriculum.js";
import type {
  CurriculumCreateInput, LessonCreateInput, LessonPatchInput, ModuleCreateInput,
  ProgressUpdateInput, QuestionAttemptInput, QuestionCreateInput, SubtopicCreateInput,
  SubjectCreateInput, VideoCreateInput, VideoPatchInput,
} from "./learning.schema.js";
import type { LearningRepository } from "./learning.repository.js";
import type {
  AttemptQuestion, CurriculumTree, LessonRecord, LessonSummary, ModuleTree,
  ProgressRecord, PublicQuestion, QuestionAttemptRecord, QuantProgressView,
  LearningOutcomeStatementRecord, SubtopicTree, SubjectTree, TutorLessonContext, VideoRecord, WeakConceptRecord,
} from "./learning.types.js";

type CurriculumRow = Omit<CurriculumTree, "subjects"> & { createdAt: Date; updatedAt: Date };
type SubjectRow = Omit<SubjectTree, "modules"> & { createdAt: Date; updatedAt: Date };
type ModuleRow = Omit<ModuleTree, "subtopics"> & { createdAt: Date; updatedAt: Date };
type SubtopicRow = Omit<SubtopicTree, "lessons"> & { createdAt: Date; updatedAt: Date };
type LessonRow = LessonSummary & { content: unknown | null; createdAt: Date; updatedAt: Date };
type QuestionRow = AttemptQuestion & { status: "DRAFT" | "PUBLISHED" | "ARCHIVED"; solutionSteps: unknown | null; createdAt: Date; updatedAt: Date };

export class MemoryLearningRepository implements LearningRepository {
  private readonly curricula = new Map<string, CurriculumRow>();
  private readonly subjects = new Map<string, SubjectRow>();
  private readonly modules = new Map<string, ModuleRow>();
  private readonly subtopics = new Map<string, SubtopicRow>();
  private readonly learningOutcomes = new Map<string, LearningOutcomeStatementRecord>();
  private readonly lessonLearningOutcomes = new Map<string, string[]>();
  private readonly questionLearningOutcomes = new Map<string, string[]>();
  private readonly lessons = new Map<string, LessonRow>();
  private readonly videos = new Map<string, VideoRecord>();
  private readonly questions = new Map<string, QuestionRow>();
  private readonly progress = new Map<string, ProgressRecord>();
  private readonly attempts: QuestionAttemptRecord[] = [];
  private readonly weakConcepts = new Map<string, WeakConceptRecord>();

  constructor() {
    const now = new Date();
    const curriculumId = "curriculum-cfa-level-i-2027";
    this.curricula.set(curriculumId, { id: curriculumId, program: "CFA", level: "LEVEL_I", curriculumYear: 2027, status: "PUBLISHED", sourceUrl: quant2027Curriculum.sourceUrl, createdAt: now, updatedAt: now });
    const subjectId = "subject-quantitative-methods-2027";
    this.subjects.set(subjectId, { id: subjectId, curriculumId, ...quant2027Curriculum.subject, description: quant2027Curriculum.subject.description, createdAt: now, updatedAt: now });
    for (const item of quant2027Curriculum.modules) {
      const id = `module-${item.slug}`;
      this.modules.set(id, { id, subjectId, ...item, description: null, learningOutcomes: item.learningOutcomes, createdAt: now, updatedAt: now });
    }
  }

  async getCurriculum(level: "LEVEL_I" | "LEVEL_II" | "LEVEL_III", year: number): Promise<CurriculumTree | null> {
    const curriculum = [...this.curricula.values()].find((item) => item.level === level && item.curriculumYear === year && item.status === "PUBLISHED");
    if (!curriculum) return null;
    const subjects = [...this.subjects.values()].filter((item) => item.curriculumId === curriculum.id && item.status === "PUBLISHED").sort((a, b) => a.order - b.order);
    return { ...curriculum, subjects: subjects.map((subject) => this.subjectTree(subject, true)) };
  }

  async listSubjects(level: "LEVEL_I" | "LEVEL_II" | "LEVEL_III", year: number): Promise<SubjectTree[]> {
    const curriculum = [...this.curricula.values()].find((item) => item.level === level && item.curriculumYear === year && item.status === "PUBLISHED");
    return curriculum ? [...this.subjects.values()].filter((item) => item.curriculumId === curriculum.id && item.status === "PUBLISHED").sort((a, b) => a.order - b.order).map((item) => ({ ...item })) : [];
  }

  async getSubjectBySlug(slug: string, year: number): Promise<SubjectTree | null> {
    const curriculum = [...this.curricula.values()].find((item) => item.level === "LEVEL_I" && item.curriculumYear === year && item.status === "PUBLISHED");
    const subject = [...this.subjects.values()].find((item) => item.curriculumId === curriculum?.id && item.slug === slug && item.status === "PUBLISHED");
    return subject ? this.subjectTree(subject, true) : null;
  }

  async listModules(subjectId: string): Promise<ModuleTree[]> {
    return [...this.modules.values()].filter((item) => item.subjectId === subjectId && item.status === "PUBLISHED").sort((a, b) => a.order - b.order).map((item) => ({ ...item }));
  }

  async getModule(moduleId: string): Promise<ModuleTree | null> {
    const item = this.modules.get(moduleId);
    return item?.status === "PUBLISHED" ? this.moduleTree(item, true) : null;
  }

  async getSubtopic(subtopicId: string): Promise<SubtopicTree | null> {
    const item = this.subtopics.get(subtopicId);
    const module = item && this.modules.get(item.moduleId);
    const subject = module && this.subjects.get(module.subjectId);
    const curriculum = subject && this.curricula.get(subject.curriculumId);
    if (!item || !module || !subject || !curriculum || [item.status, module.status, subject.status, curriculum.status].some((status) => status !== "PUBLISHED")) return null;
    return { ...item };
  }

  async listSubtopics(moduleId: string): Promise<SubtopicTree[]> {
    return [...this.subtopics.values()].filter((item) => item.moduleId === moduleId && item.status === "PUBLISHED").sort((a, b) => a.order - b.order).map((item) => ({ ...item }));
  }

  async listLearningOutcomes(subtopicId: string): Promise<LearningOutcomeStatementRecord[]> {
    const subtopic = this.subtopics.get(subtopicId);
    const module = subtopic && this.modules.get(subtopic.moduleId);
    const subject = module && this.subjects.get(module.subjectId);
    const curriculum = subject && this.curricula.get(subject.curriculumId);
    if (!subtopic || !module || !subject || !curriculum || [subtopic.status, module.status, subject.status, curriculum.status].some((status) => status !== "PUBLISHED")) return [];
    return [...this.learningOutcomes.values()].filter((item) => item.subtopicId === subtopicId && item.curriculumId === curriculum.id && item.status === "PUBLISHED").sort((a, b) => a.order - b.order);
  }

  async listLessonLearningOutcomes(lessonId: string): Promise<LearningOutcomeStatementRecord[]> {
    const lesson = this.lessons.get(lessonId);
    if (!lesson || lesson.status !== "PUBLISHED") return [];
    return (this.lessonLearningOutcomes.get(lessonId) ?? []).map((id) => this.learningOutcomes.get(id)).filter((item): item is LearningOutcomeStatementRecord => Boolean(item && item.status === "PUBLISHED" && item.subtopicId === lesson.subtopicId));
  }

  async listQuestionLearningOutcomes(questionId: string): Promise<LearningOutcomeStatementRecord[]> {
    const question = this.questions.get(questionId);
    return question ? this.listLessonLearningOutcomes(question.lessonId).then((items) => items.filter((item) => (this.questionLearningOutcomes.get(questionId) ?? []).includes(item.id))) : [];
  }

  async listLessons(subtopicId: string): Promise<LessonSummary[]> {
    return [...this.lessons.values()].filter((item) => item.subtopicId === subtopicId && item.status === "PUBLISHED").sort((a, b) => a.order - b.order).map((item) => this.lessonSummary(item));
  }

  async getLesson(lessonId: string): Promise<LessonRecord | null> {
    const lesson = this.lessons.get(lessonId);
    if (!lesson || lesson.status !== "PUBLISHED") return null;
    const subtopic = this.subtopics.get(lesson.subtopicId);
    const module = subtopic && this.modules.get(subtopic.moduleId);
    const subject = module && this.subjects.get(module.subjectId);
    const curriculum = subject && this.curricula.get(subject.curriculumId);
    if (!subtopic || !module || !subject || !curriculum || [subtopic.status, module.status, subject.status, curriculum.status].some((status) => status !== "PUBLISHED")) return null;
    return { ...lesson, subtopic: { ...subtopic, module: { ...module, subject: { ...subject, curriculum: { ...curriculum, subjects: [] } } } } } as LessonRecord;
  }

  async listVideos(lessonId: string): Promise<VideoRecord[]> {
    return [...this.videos.values()].filter((item) => item.lessonId === lessonId && item.verificationStatus === "VERIFIED").sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary) || a.createdAt.getTime() - b.createdAt.getTime());
  }

  async listQuestions(lessonId: string): Promise<PublicQuestion[]> {
    return [...this.questions.values()].filter((item) => item.lessonId === lessonId && item.status === "PUBLISHED").sort((a, b) => a.order - b.order).map(({ correctAnswer: _correct, explanation: _explanation, solutionSteps: _steps, status: _status, createdAt: _created, updatedAt: _updated, ...item }) => item);
  }

  async getQuestionForAttempt(questionId: string): Promise<AttemptQuestion | null> {
    const item = this.questions.get(questionId);
    return item?.status === "PUBLISHED" && await this.getLesson(item.lessonId) ? item : null;
  }

  async updateProgress(studentId: string, lessonId: string, input: ProgressUpdateInput): Promise<ProgressRecord> {
    const key = `${studentId}:${lessonId}`;
    const previous = this.progress.get(key);
    const lessonCompleted = input.lessonCompleted ?? previous?.lessonCompleted ?? false;
    const videoCompleted = input.videoCompleted ?? previous?.videoCompleted ?? false;
    const videoProgressSeconds = input.videoProgressSeconds ?? previous?.videoProgressSeconds ?? 0;
    const now = new Date();
    const result: ProgressRecord = {
      id: previous?.id ?? randomUUID(), studentId, lessonId,
      status: lessonCompleted ? "COMPLETED" : (videoProgressSeconds > 0 || videoCompleted ? "IN_PROGRESS" : previous?.status ?? "NOT_STARTED"),
      videoProgressSeconds, videoCompleted, lessonCompleted, lastAccessedAt: now,
      completedAt: lessonCompleted ? previous?.completedAt ?? now : null,
      createdAt: previous?.createdAt ?? now, updatedAt: now,
    };
    this.progress.set(key, result);
    return result;
  }

  async getProgress(studentId: string, lessonId: string): Promise<ProgressRecord | null> {
    return this.progress.get(`${studentId}:${lessonId}`) ?? null;
  }

  async createAttempt(studentId: string, questionId: string, input: QuestionAttemptInput, isCorrect: boolean, concepts: string[]): Promise<QuestionAttemptRecord> {
    const question = this.questions.get(questionId)!;
    const now = new Date();
    const attempt: QuestionAttemptRecord = { id: randomUUID(), studentId, questionId, selectedAnswer: input.selectedAnswer, isCorrect, timeTakenSeconds: input.timeTakenSeconds ?? null, attemptedAt: now };
    this.attempts.push(attempt);
    if (!isCorrect) {
      for (const concept of concepts) {
        const key = `${studentId}:${question.lessonId}:${concept}`;
        const previous = this.weakConcepts.get(key);
        this.weakConcepts.set(key, { id: previous?.id ?? randomUUID(), studentId, lessonId: question.lessonId, concept, mistakeCount: (previous?.mistakeCount ?? 0) + 1, updatedAt: now });
      }
    }
    return attempt;
  }

  async getQuantProgress(studentId: string, year: number): Promise<QuantProgressView> {
    const subject = [...this.subjects.values()].find((item) => item.slug === "quantitative-methods" && this.curricula.get(item.curriculumId)?.curriculumYear === year);
    const modules = [...this.modules.values()].filter((item) => item.subjectId === subject?.id && item.status === "PUBLISHED");
    const subtopicIds = new Set([...this.subtopics.values()].filter((item) => modules.some((module) => module.id === item.moduleId) && item.status === "PUBLISHED").map((item) => item.id));
    const lessons = [...this.lessons.values()].filter((item) => subtopicIds.has(item.subtopicId) && item.status === "PUBLISHED");
    const lessonIds = new Set(lessons.map((item) => item.id));
    const studentProgress = [...this.progress.values()].filter((item) => item.studentId === studentId && lessonIds.has(item.lessonId));
    const questionIds = new Set([...this.questions.values()].filter((item) => lessonIds.has(item.lessonId) && item.status === "PUBLISHED").map((item) => item.id));
    const attempts = this.attempts.filter((item) => item.studentId === studentId && questionIds.has(item.questionId));
    return {
      curriculumYear: year, totalLessons: lessons.length,
      completedLessons: studentProgress.filter((item) => item.lessonCompleted).length,
      inProgressLessons: studentProgress.filter((item) => item.status === "IN_PROGRESS").length,
      videoCompletedLessons: studentProgress.filter((item) => item.videoCompleted).length,
      attemptedQuestions: attempts.length, correctAttempts: attempts.filter((item) => item.isCorrect).length,
    };
  }

  async getWeakConcepts(studentId: string): Promise<WeakConceptRecord[]> {
    return [...this.weakConcepts.values()].filter((item) => item.studentId === studentId).sort((a, b) => b.mistakeCount - a.mistakeCount || b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  async getTutorContext(studentId: string, lessonId: string): Promise<TutorLessonContext | null> {
    const lesson = await this.getLesson(lessonId);
    if (!lesson) return null;
    const wrongAttempts = this.attempts.filter((item) => item.studentId === studentId && !item.isCorrect && this.questions.get(item.questionId)?.lessonId === lessonId).slice(-5).reverse();
    return {
      level: "LEVEL_I", subject: lesson.subtopic.module.subject.name,
      curriculumYear: lesson.subtopic.module.subject.curriculum.curriculumYear,
      module: lesson.subtopic.module.title, subtopic: lesson.subtopic.title, lesson: lesson.title,
      learningObjectives: lesson.learningObjectives, content: lesson.content,
      recentIncorrectAnswers: wrongAttempts.flatMap((attempt) => {
        const question = this.questions.get(attempt.questionId);
        return question ? [{ question: question.question, selectedAnswer: attempt.selectedAnswer, correctAnswer: question.correctAnswer, explanation: question.explanation }] : [];
      }),
      weakConcepts: (await this.getWeakConcepts(studentId)).filter((item) => item.lessonId === lessonId).map((item) => item.concept),
    };
  }

  async createCurriculum(input: CurriculumCreateInput): Promise<CurriculumTree> {
    const now = new Date(); const id = randomUUID();
    const row: CurriculumRow = { id, ...input, sourceUrl: input.sourceUrl ?? null, createdAt: now, updatedAt: now };
    this.curricula.set(id, row);
    return { ...row, subjects: [] };
  }

  async createSubject(input: SubjectCreateInput): Promise<SubjectTree> {
    const now = new Date(); const row: SubjectRow = { id: randomUUID(), ...input, description: input.description ?? null, createdAt: now, updatedAt: now };
    this.subjects.set(row.id, row); return row;
  }

  async createModule(input: ModuleCreateInput): Promise<ModuleTree> {
    const now = new Date(); const row: ModuleRow = { id: randomUUID(), ...input, description: input.description ?? null, createdAt: now, updatedAt: now };
    this.modules.set(row.id, row); return row;
  }

  async createSubtopic(input: SubtopicCreateInput): Promise<SubtopicTree> {
    const now = new Date(); const row: SubtopicRow = { id: randomUUID(), ...input, description: input.description ?? null, createdAt: now, updatedAt: now };
    this.subtopics.set(row.id, row); return row;
  }

  async createLearningOutcome(subtopicId: string, input: import("./learning.schema.js").LearningOutcomeCreateInput): Promise<LearningOutcomeStatementRecord | null> {
    const subtopic = this.subtopics.get(subtopicId);
    const module = subtopic && this.modules.get(subtopic.moduleId);
    const subject = module && this.subjects.get(module.subjectId);
    const curriculum = subject && this.curricula.get(subject.curriculumId);
    if (!subtopic || !curriculum) return null;
    if ([...this.learningOutcomes.values()].some((item) => item.curriculumId === curriculum.id && item.identifier === input.identifier)) {
      throw new HttpError(409, "This learning outcome identifier already exists in the curriculum.", "LEARNING_OUTCOME_EXISTS");
    }
    const record: LearningOutcomeStatementRecord = { id: randomUUID(), curriculumId: curriculum.id, subtopicId, ...input, sourceUrl: input.sourceUrl ?? null, sourcePage: input.sourcePage ?? null };
    this.learningOutcomes.set(record.id, record);
    return record;
  }

  async setLessonLearningOutcomes(lessonId: string, input: import("./learning.schema.js").LearningOutcomeMappingsInput): Promise<LearningOutcomeStatementRecord[] | null> {
    const lesson = this.lessons.get(lessonId);
    if (!lesson) return null;
    const outcomes = input.learningOutcomeStatementIds.map((id) => this.learningOutcomes.get(id));
    if (outcomes.some((item) => !item || item.subtopicId !== lesson.subtopicId)) throw new HttpError(400, "Learning outcomes must belong to the lesson's subtopic.", "INVALID_LEARNING_OUTCOME_MAPPING");
    this.lessonLearningOutcomes.set(lessonId, [...input.learningOutcomeStatementIds]);
    return outcomes as LearningOutcomeStatementRecord[];
  }

  async setQuestionLearningOutcomes(questionId: string, input: import("./learning.schema.js").LearningOutcomeMappingsInput): Promise<LearningOutcomeStatementRecord[] | null> {
    const question = this.questions.get(questionId);
    if (!question) return null;
    const lesson = this.lessons.get(question.lessonId);
    if (!lesson) return null;
    const outcomes = input.learningOutcomeStatementIds.map((id) => this.learningOutcomes.get(id));
    if (outcomes.some((item) => !item || item.subtopicId !== lesson.subtopicId)) throw new HttpError(400, "Learning outcomes must belong to the question's lesson subtopic.", "INVALID_LEARNING_OUTCOME_MAPPING");
    this.questionLearningOutcomes.set(questionId, [...input.learningOutcomeStatementIds]);
    return outcomes as LearningOutcomeStatementRecord[];
  }

  async createLesson(input: LessonCreateInput): Promise<LessonSummary> {
    const now = new Date(); const row: LessonRow = { id: randomUUID(), ...input, description: input.description ?? null, estimatedDurationMinutes: input.estimatedDurationMinutes ?? null, content: input.content ?? null, createdAt: now, updatedAt: now };
    this.lessons.set(row.id, row); return this.lessonSummary(row);
  }

  async updateLesson(lessonId: string, input: LessonPatchInput): Promise<LessonSummary | null> {
    const current = this.lessons.get(lessonId); if (!current) return null;
    const updated = { ...current, ...input, updatedAt: new Date() };
    this.lessons.set(lessonId, updated); return this.lessonSummary(updated);
  }

  async archiveLesson(lessonId: string): Promise<boolean> {
    const current = this.lessons.get(lessonId); if (!current) return false;
    this.lessons.set(lessonId, { ...current, status: "ARCHIVED", updatedAt: new Date() }); return true;
  }

  async createVideo(_adminId: string, lessonId: string, input: VideoCreateInput): Promise<VideoRecord | null> {
    if (!this.lessons.has(lessonId)) return null;
    const now = new Date(); const id = randomUUID();
    const record: VideoRecord = {
      id, lessonId, provider: "YOUTUBE", youtubeVideoId: input.youtubeVideoId,
      title: input.title, videoUrl: `https://www.youtube.com/watch?v=${input.youtubeVideoId}`,
      embedUrl: `https://www.youtube-nocookie.com/embed/${input.youtubeVideoId}`,
      durationSeconds: input.durationSeconds ?? null, language: input.language,
      explanationStyle: input.explanationStyle ?? null, isPrimary: false, resourceType: "VIDEO",
      sourceChannel: input.sourceChannel ?? null, sourceChannelUrl: input.sourceChannelUrl ?? null,
      chapters: input.chapters ?? null, verificationStatus: "PENDING_REVIEW", verifiedAt: null,
      verifiedById: null, lastCheckedAt: null, createdAt: now, updatedAt: now,
    };
    this.videos.set(id, record); return record;
  }

  async updateVideo(videoId: string, input: VideoPatchInput): Promise<VideoRecord | null> {
    const current = this.videos.get(videoId); if (!current) return null;
    if (input.isPrimary && current.verificationStatus !== "VERIFIED") throw new HttpError(409, "Only a verified video can be set as primary.", "VIDEO_NOT_VERIFIED");
    if (input.isPrimary) for (const [id, video] of this.videos) if (video.lessonId === current.lessonId && id !== videoId && video.isPrimary) this.videos.set(id, { ...video, isPrimary: false, updatedAt: new Date() });
    const updated: VideoRecord = { ...current, ...input, durationSeconds: input.durationSeconds === undefined ? current.durationSeconds : input.durationSeconds, explanationStyle: input.explanationStyle === undefined ? current.explanationStyle : input.explanationStyle, sourceChannel: input.sourceChannel === undefined ? current.sourceChannel : input.sourceChannel, chapters: input.chapters === undefined ? current.chapters : input.chapters, updatedAt: new Date() };
    this.videos.set(videoId, updated); return updated;
  }

  async updateVideoVerification(adminId: string, videoId: string, status: "PENDING_REVIEW" | "VERIFIED" | "UNAVAILABLE" | "REJECTED"): Promise<VideoRecord | null> {
    const current = this.videos.get(videoId); if (!current) return null;
    const checkedAt = new Date();
    const updated: VideoRecord = { ...current, verificationStatus: status, verifiedAt: status === "VERIFIED" ? checkedAt : null, verifiedById: status === "VERIFIED" ? adminId : null, lastCheckedAt: checkedAt, isPrimary: status === "VERIFIED" ? current.isPrimary : false, updatedAt: checkedAt };
    this.videos.set(videoId, updated); return updated;
  }

  async archiveVideo(videoId: string): Promise<boolean> {
    const current = this.videos.get(videoId); if (!current) return false;
    this.videos.set(videoId, { ...current, verificationStatus: "UNAVAILABLE", isPrimary: false, lastCheckedAt: new Date(), updatedAt: new Date() }); return true;
  }

  async createQuestion(input: QuestionCreateInput): Promise<PublicQuestion | null> {
    if (!this.lessons.has(input.lessonId)) return null;
    const now = new Date(); const { solutionSteps, ...data } = input;
    const row: QuestionRow = { id: randomUUID(), ...data, solutionSteps: solutionSteps ?? null, createdAt: now, updatedAt: now };
    this.questions.set(row.id, row);
    const { correctAnswer: _correct, explanation: _explanation, solutionSteps: _steps, status: _status, createdAt: _created, updatedAt: _updated, ...publicQuestion } = row;
    return publicQuestion;
  }

  async archiveQuestion(questionId: string): Promise<boolean> {
    const current = this.questions.get(questionId); if (!current) return false;
    this.questions.set(questionId, { ...current, status: "ARCHIVED", updatedAt: new Date() }); return true;
  }

  private subjectTree(subject: SubjectRow, includeModules: boolean): SubjectTree {
    return { ...subject, ...(includeModules ? { modules: [...this.modules.values()].filter((item) => item.subjectId === subject.id && item.status === "PUBLISHED").sort((a, b) => a.order - b.order).map((item) => this.moduleTree(item, true)) } : {}) };
  }

  private moduleTree(module: ModuleRow, includeSubtopics: boolean): ModuleTree {
    return { ...module, ...(includeSubtopics ? { subtopics: [...this.subtopics.values()].filter((item) => item.moduleId === module.id && item.status === "PUBLISHED").sort((a, b) => a.order - b.order).map((item) => ({ ...item, lessons: [...this.lessons.values()].filter((lesson) => lesson.subtopicId === item.id && lesson.status === "PUBLISHED").sort((a, b) => a.order - b.order).map((lesson) => this.lessonSummary(lesson)) })) } : {}) };
  }

  private lessonSummary(lesson: LessonRow): LessonSummary {
    const { content: _content, createdAt: _created, updatedAt: _updated, ...summary } = lesson; return summary;
  }
}
