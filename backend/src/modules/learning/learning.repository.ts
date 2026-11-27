import type {
  CurriculumCreateInput, LessonCreateInput, LessonPatchInput, ModuleCreateInput,
  ProgressUpdateInput, QuestionAttemptInput, QuestionCreateInput, SubtopicCreateInput,
  LearningOutcomeCreateInput, LearningOutcomeMappingsInput, SubjectCreateInput, VideoCreateInput, VideoPatchInput,
} from "./learning.schema.js";
import type {
  AttemptQuestion, CurriculumTree, DraftLessonRecord, LessonRecord, LessonSummary, ModuleTree, ProgressRecord,
  PublicQuestion, QuestionAttemptRecord, QuantProgressView, SubtopicTree,
  LearningOutcomeStatementRecord, SubjectTree, TutorLessonContext, VideoRecord, WeakConceptRecord,
} from "./learning.types.js";

export interface LearningRepository {
  getCurriculum(level: "LEVEL_I" | "LEVEL_II" | "LEVEL_III", year: number): Promise<CurriculumTree | null>;
  listSubjects(level: "LEVEL_I" | "LEVEL_II" | "LEVEL_III", year: number): Promise<SubjectTree[]>;
  getSubjectBySlug(slug: string, year: number): Promise<SubjectTree | null>;
  listModules(subjectId: string): Promise<CurriculumTree["subjects"][number]["modules"]>;
  getModule(moduleId: string): Promise<ModuleTree | null>;
  getSubtopic(subtopicId: string): Promise<SubtopicTree | null>;
  listSubtopics(moduleId: string): Promise<SubtopicTree[]>;
  listLearningOutcomes(subtopicId: string): Promise<LearningOutcomeStatementRecord[]>;
  listLessonLearningOutcomes(lessonId: string): Promise<LearningOutcomeStatementRecord[]>;
  listQuestionLearningOutcomes(questionId: string): Promise<LearningOutcomeStatementRecord[]>;
  listLessons(subtopicId: string): Promise<LessonSummary[]>;
  getLesson(lessonId: string): Promise<LessonRecord | null>;
  listDraftLessonsForAdmin(moduleId: string): Promise<DraftLessonRecord[]>;
  listVideos(lessonId: string): Promise<VideoRecord[]>;
  listQuestions(lessonId: string): Promise<PublicQuestion[]>;
  getQuestionForAttempt(questionId: string): Promise<AttemptQuestion | null>;
  updateProgress(studentId: string, lessonId: string, input: ProgressUpdateInput): Promise<ProgressRecord>;
  getProgress(studentId: string, lessonId: string): Promise<ProgressRecord | null>;
  createAttempt(studentId: string, questionId: string, input: QuestionAttemptInput, isCorrect: boolean, concepts: string[]): Promise<QuestionAttemptRecord>;
  getQuantProgress(studentId: string, year: number): Promise<QuantProgressView>;
  getWeakConcepts(studentId: string): Promise<WeakConceptRecord[]>;
  getTutorContext(studentId: string, lessonId: string): Promise<TutorLessonContext | null>;
  createCurriculum(input: CurriculumCreateInput): Promise<CurriculumTree>;
  createSubject(input: SubjectCreateInput): Promise<SubjectTree>;
  createModule(input: ModuleCreateInput): Promise<NonNullable<CurriculumTree["subjects"][number]["modules"]>[number]>;
  createSubtopic(input: SubtopicCreateInput): Promise<SubtopicTree>;
  createLearningOutcome(subtopicId: string, input: LearningOutcomeCreateInput): Promise<LearningOutcomeStatementRecord | null>;
  setLessonLearningOutcomes(lessonId: string, input: LearningOutcomeMappingsInput): Promise<LearningOutcomeStatementRecord[] | null>;
  setQuestionLearningOutcomes(questionId: string, input: LearningOutcomeMappingsInput): Promise<LearningOutcomeStatementRecord[] | null>;
  createLesson(input: LessonCreateInput): Promise<LessonSummary>;
  updateLesson(lessonId: string, input: LessonPatchInput): Promise<LessonSummary | null>;
  archiveLesson(lessonId: string): Promise<boolean>;
  createVideo(adminId: string, lessonId: string, input: VideoCreateInput): Promise<VideoRecord | null>;
  updateVideo(videoId: string, input: VideoPatchInput): Promise<VideoRecord | null>;
  updateVideoVerification(adminId: string, videoId: string, status: "PENDING_REVIEW" | "VERIFIED" | "UNAVAILABLE" | "REJECTED"): Promise<VideoRecord | null>;
  archiveVideo(videoId: string): Promise<boolean>;
  createQuestion(input: QuestionCreateInput): Promise<PublicQuestion | null>;
  archiveQuestion(questionId: string): Promise<boolean>;
}
