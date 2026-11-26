export type CfaLevel = "LEVEL_I" | "LEVEL_II" | "LEVEL_III";
export type ContentStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";
export type VideoVerificationStatus = "PENDING_REVIEW" | "VERIFIED" | "UNAVAILABLE" | "REJECTED";
export type LessonProgressStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
export type PracticeQuestionType = "MULTIPLE_CHOICE";
export type PracticeDifficulty = "EASY" | "MEDIUM" | "HARD";

export type CurriculumTree = {
  id: string; program: string; level: CfaLevel; curriculumYear: number; status: ContentStatus; sourceUrl: string | null;
  subjects: SubjectTree[];
};

export type SubjectTree = {
  id: string; curriculumId: string; name: string; slug: string; description: string | null; order: number; status: ContentStatus;
  modules?: ModuleTree[];
};

export type ModuleTree = {
  id: string; subjectId: string; title: string; slug: string; description: string | null; order: number;
  learningOutcomes: string[]; status: ContentStatus; subtopics?: SubtopicTree[];
};

export type SubtopicTree = {
  id: string; moduleId: string; title: string; slug: string; description: string | null; order: number;
  learningOutcomes: string[]; status: ContentStatus; lessons?: LessonSummary[];
};

export type LearningOutcomeStatementRecord = {
  id: string; curriculumId: string; subtopicId: string; identifier: string; statement: string;
  order: number; sourceUrl: string | null; sourcePage: string | null; status: ContentStatus;
};

export type LessonSummary = {
  id: string; subtopicId: string; title: string; slug: string; description: string | null;
  learningObjectives: string[]; estimatedDurationMinutes: number | null; order: number; status: ContentStatus;
};

export type LessonRecord = LessonSummary & {
  content: unknown | null;
  subtopic: SubtopicTree & { module: ModuleTree & { subject: SubjectTree & { curriculum: CurriculumTree } } };
};

export type VideoRecord = {
  id: string; lessonId: string; provider: string; youtubeVideoId: string; title: string; videoUrl: string; embedUrl: string;
  durationSeconds: number | null; language: string; explanationStyle: string | null; isPrimary: boolean;
  resourceType: "VIDEO"; sourceChannel: string | null; sourceChannelUrl: string | null; chapters: unknown | null;
  verificationStatus: VideoVerificationStatus; verifiedAt: Date | null; verifiedById: string | null;
  lastCheckedAt: Date | null; createdAt: Date; updatedAt: Date;
};

export type PublicQuestion = {
  id: string; lessonId: string; question: string; questionType: PracticeQuestionType; difficulty: PracticeDifficulty;
  options: unknown; concepts: string[]; marks: number; order: number;
};

export type AttemptQuestion = PublicQuestion & { correctAnswer: string; explanation: string; solutionSteps: unknown | null };

export type ProgressRecord = {
  id: string; studentId: string; lessonId: string; status: LessonProgressStatus;
  videoProgressSeconds: number; videoCompleted: boolean; lessonCompleted: boolean;
  lastAccessedAt: Date; completedAt: Date | null; createdAt: Date; updatedAt: Date;
};

export type QuestionAttemptRecord = {
  id: string; studentId: string; questionId: string; selectedAnswer: string; isCorrect: boolean;
  timeTakenSeconds: number | null; attemptedAt: Date;
};

export type WeakConceptRecord = {
  id: string; studentId: string; lessonId: string; concept: string; mistakeCount: number; updatedAt: Date;
};

export type QuantProgressView = {
  curriculumYear: number;
  totalLessons: number;
  completedLessons: number;
  inProgressLessons: number;
  videoCompletedLessons: number;
  attemptedQuestions: number;
  correctAttempts: number;
};

export type TutorLessonContext = {
  level: "LEVEL_I";
  subject: string;
  curriculumYear: number;
  module: string;
  subtopic: string;
  lesson: string;
  learningObjectives: string[];
  content: unknown | null;
  recentIncorrectAnswers: Array<{ question: string; selectedAnswer: string; correctAnswer: string; explanation: string }>;
  weakConcepts: string[];
};
