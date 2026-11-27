import { z } from "zod";

export const contentStatusSchema = z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]);
export const curriculumLevelSchema = z.enum(["LEVEL_I", "LEVEL_II", "LEVEL_III"]);
export const verificationStatusSchema = z.enum(["PENDING_REVIEW", "VERIFIED", "UNAVAILABLE", "REJECTED"]);
export const questionDifficultySchema = z.enum(["EASY", "MEDIUM", "HARD"]);

const slugSchema = z.string().trim().min(1).max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const textSchema = z.string().trim().min(1).max(10000);
const orderSchema = z.number().int().min(1).max(10000);
type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };
const jsonPrimitiveSchema = z.union([z.string(), z.number().finite(), z.boolean(), z.null()]);
const jsonValueSchema: z.ZodType<JsonValue> = z.lazy(() => z.union([
  jsonPrimitiveSchema,
  z.array(jsonValueSchema),
  z.record(z.string(), jsonValueSchema),
]));

export const yearQuerySchema = z.object({ year: z.coerce.number().int().min(2000).max(2100).default(2027) });
export const levelSlugSchema = z.enum(["level-1", "level-2", "level-3"]);

export const lessonContentSchema = z.object({
  conceptIntroduction: textSchema,
  simpleExplanation: textSchema,
  definitions: z.array(z.object({ term: textSchema, definition: textSchema }).strict()).default([]),
  financialApplications: z.array(textSchema).default([]),
  commonMistakes: z.array(textSchema).default([]),
  curriculumOutcomeMappings: z.array(textSchema).default([]),
  sourceReferences: z.array(z.object({
    title: textSchema.max(240),
    url: z.string().url().refine((value) => value.startsWith("https://"), "Source links must use HTTPS."),
    scope: textSchema.max(1000),
  }).strict()).default([]),
  formulaExplanations: z.array(z.object({
    name: textSchema,
    formula: textSchema,
    variables: z.array(z.object({ symbol: textSchema, meaning: textSchema })),
    notes: z.array(textSchema).default([]),
  })).default([]),
  visualExplanations: z.array(z.object({
    kind: z.enum(["DIAGRAM", "CHART", "TABLE", "IMAGE"]),
    caption: textSchema,
    altText: textSchema,
    metadata: z.record(z.string(), jsonValueSchema).default({}),
  })).default([]),
  workedExamples: z.array(z.object({
    title: textSchema,
    problem: textSchema,
    steps: z.array(z.object({ label: textSchema, calculation: textSchema, explanation: textSchema })).min(1),
    answer: textSchema,
  })).default([]),
  keyTakeaways: z.array(textSchema).default([]),
  summary: textSchema,
  additionalResources: z.array(z.object({ title: textSchema, url: z.string().url().refine((value) => value.startsWith("https://"), "Resource links must use HTTPS."), resourceType: z.enum(["ARTICLE", "DOCUMENT", "OTHER"]) })).default([]),
}).strict();

export const curriculumCreateSchema = z.object({
  program: z.string().trim().min(1).max(40).default("CFA"),
  level: curriculumLevelSchema,
  curriculumYear: z.number().int().min(2000).max(2100),
  status: contentStatusSchema.default("DRAFT"),
  sourceUrl: z.string().url().refine((value) => value.startsWith("https://"), "Source links must use HTTPS.").optional(),
}).strict();

export const subjectCreateSchema = z.object({
  curriculumId: z.string().min(1).max(100), name: textSchema.max(160), slug: slugSchema,
  description: z.string().trim().max(4000).optional(), order: orderSchema, status: contentStatusSchema.default("DRAFT"),
}).strict();

export const moduleCreateSchema = z.object({
  subjectId: z.string().min(1).max(100), title: textSchema.max(240), slug: slugSchema,
  description: z.string().trim().max(4000).optional(), order: orderSchema,
  learningOutcomes: z.array(textSchema.max(2000)).max(100).default([]), status: contentStatusSchema.default("DRAFT"),
}).strict();

export const subtopicCreateSchema = z.object({
  moduleId: z.string().min(1).max(100), title: textSchema.max(240), slug: slugSchema,
  description: z.string().trim().max(4000).optional(), order: orderSchema,
  learningOutcomes: z.array(textSchema.max(2000)).max(100).default([]), status: contentStatusSchema.default("DRAFT"),
}).strict();

export const learningOutcomeCreateSchema = z.object({
  identifier: z.string().trim().min(1).max(80),
  statement: textSchema.max(4000),
  order: orderSchema,
  sourceUrl: z.string().url().refine((value) => value.startsWith("https://"), "Source links must use HTTPS.").optional(),
  sourcePage: z.string().trim().max(80).optional(),
  status: contentStatusSchema.default("DRAFT"),
}).strict();

export const learningOutcomeMappingsSchema = z.object({
  learningOutcomeStatementIds: z.array(z.string().trim().min(1).max(100)).max(100),
}).strict().refine((value) => new Set(value.learningOutcomeStatementIds).size === value.learningOutcomeStatementIds.length, "Learning outcome IDs must be unique.");

export const lessonCreateSchema = z.object({
  subtopicId: z.string().min(1).max(100), title: textSchema.max(240), slug: slugSchema,
  description: z.string().trim().max(4000).optional(), learningObjectives: z.array(textSchema.max(2000)).max(100).default([]),
  estimatedDurationMinutes: z.number().int().positive().max(600).optional(), order: orderSchema,
  content: lessonContentSchema.optional(), status: contentStatusSchema.default("DRAFT"),
}).strict();

export const lessonPatchSchema = lessonCreateSchema.omit({ subtopicId: true }).partial().strict().refine((value) => Object.keys(value).length > 0, "At least one field is required.");

const chapterSchema = z.object({ title: textSchema.max(200), startSeconds: z.number().int().min(0) }).strict();
const youtubeVideoIdSchema = z.string().regex(/^[A-Za-z0-9_-]{11}$/, "Enter an 11-character YouTube video ID.");

export const videoCreateSchema = z.object({
  youtubeVideoId: youtubeVideoIdSchema,
  title: textSchema.max(240), durationSeconds: z.number().int().positive().max(86400).optional(),
  language: z.string().trim().min(2).max(40), explanationStyle: z.string().trim().max(120).optional(),
  sourceChannel: z.string().trim().max(200).optional(),
  sourceChannelUrl: z.string().url().refine((value) => {
    try { return ["youtube.com", "www.youtube.com"].includes(new URL(value).hostname); } catch { return false; }
  }, "Channel URL must be on youtube.com." ).optional(),
  chapters: z.array(chapterSchema).max(100).optional(),
}).strict().superRefine((value, context) => {
  const chapters = value.chapters ?? [];
  for (let index = 1; index < chapters.length; index += 1) {
    if (chapters[index]!.startSeconds <= chapters[index - 1]!.startSeconds) {
      context.addIssue({ code: "custom", path: ["chapters", index, "startSeconds"], message: "Chapter timestamps must increase." });
    }
  }
  if (value.durationSeconds && chapters.some((chapter) => chapter.startSeconds >= value.durationSeconds!)) {
    context.addIssue({ code: "custom", path: ["chapters"], message: "Chapter timestamps must be before the video duration." });
  }
});

export const videoPatchSchema = z.object({
  title: textSchema.max(240).optional(), durationSeconds: z.number().int().positive().max(86400).nullable().optional(),
  language: z.string().trim().min(2).max(40).optional(), explanationStyle: z.string().trim().max(120).nullable().optional(),
  sourceChannel: z.string().trim().max(200).nullable().optional(), chapters: z.array(chapterSchema).max(100).nullable().optional(),
  isPrimary: z.boolean().optional(),
}).strict().refine((value) => Object.keys(value).length > 0, "At least one field is required.").superRefine((value, context) => {
  const chapters = value.chapters ?? [];
  for (let index = 1; index < chapters.length; index += 1) {
    if (chapters[index]!.startSeconds <= chapters[index - 1]!.startSeconds) {
      context.addIssue({ code: "custom", path: ["chapters", index, "startSeconds"], message: "Chapter timestamps must increase." });
    }
  }
  if (value.durationSeconds && chapters.some((chapter) => chapter.startSeconds >= value.durationSeconds!)) {
    context.addIssue({ code: "custom", path: ["chapters"], message: "Chapter timestamps must be before the video duration." });
  }
});

export const videoVerificationSchema = z.object({ verificationStatus: verificationStatusSchema }).strict();

export const questionOptionSchema = z.object({ id: z.string().trim().min(1).max(20), text: textSchema.max(2000) }).strict();
export const questionCreateSchema = z.object({
  lessonId: z.string().min(1).max(100), question: textSchema.max(8000),
  questionType: z.literal("MULTIPLE_CHOICE").default("MULTIPLE_CHOICE"),
  difficulty: questionDifficultySchema.default("MEDIUM"), options: z.array(questionOptionSchema).min(2).max(6),
  correctAnswer: z.string().trim().min(1).max(20), explanation: textSchema.max(8000),
  solutionSteps: z.array(z.object({ label: textSchema.max(240), content: textSchema.max(4000) }).strict()).max(30).optional(),
  concepts: z.array(z.string().trim().min(1).max(120)).max(30).default([]),
  marks: z.number().int().min(1).max(100).default(1), order: orderSchema, status: contentStatusSchema.default("DRAFT"),
}).strict().superRefine((value, context) => {
  const ids = value.options.map((option) => option.id);
  if (new Set(ids).size !== ids.length) context.addIssue({ code: "custom", path: ["options"], message: "Option IDs must be unique." });
  if (!ids.includes(value.correctAnswer)) context.addIssue({ code: "custom", path: ["correctAnswer"], message: "Correct answer must match an option ID." });
});

export const progressUpdateSchema = z.object({
  videoProgressSeconds: z.number().int().min(0).max(86400).optional(),
  videoCompleted: z.boolean().optional(),
  lessonCompleted: z.boolean().optional(),
}).strict().refine((value) => Object.keys(value).length > 0, "At least one progress field is required.");

export const questionAttemptSchema = z.object({
  selectedAnswer: z.string().trim().min(1).max(20),
  timeTakenSeconds: z.number().int().min(0).max(86400).optional(),
}).strict();

const entityIdSchema = z.string().trim().min(1).max(100);
export const idParamSchema = z.object({ id: entityIdSchema });
export const lessonIdParamSchema = z.object({ lessonId: entityIdSchema });
export const moduleIdParamSchema = z.object({ moduleId: entityIdSchema });
export const subtopicIdParamSchema = z.object({ subtopicId: entityIdSchema });
export const videoIdParamSchema = z.object({ videoId: entityIdSchema });
export const questionIdParamSchema = z.object({ questionId: entityIdSchema });

export type ContentStatus = z.infer<typeof contentStatusSchema>;
export type CurriculumCreateInput = z.infer<typeof curriculumCreateSchema>;
export type SubjectCreateInput = z.infer<typeof subjectCreateSchema>;
export type ModuleCreateInput = z.infer<typeof moduleCreateSchema>;
export type SubtopicCreateInput = z.infer<typeof subtopicCreateSchema>;
export type LearningOutcomeCreateInput = z.infer<typeof learningOutcomeCreateSchema>;
export type LearningOutcomeMappingsInput = z.infer<typeof learningOutcomeMappingsSchema>;
export type LessonCreateInput = z.infer<typeof lessonCreateSchema>;
export type LessonPatchInput = z.infer<typeof lessonPatchSchema>;
export type VideoCreateInput = z.infer<typeof videoCreateSchema>;
export type VideoPatchInput = z.infer<typeof videoPatchSchema>;
export type QuestionCreateInput = z.infer<typeof questionCreateSchema>;
export type ProgressUpdateInput = z.infer<typeof progressUpdateSchema>;
export type QuestionAttemptInput = z.infer<typeof questionAttemptSchema>;
