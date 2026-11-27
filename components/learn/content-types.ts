export interface LessonContent {
  conceptIntroduction: string;
  simpleExplanation: string;
  definitions: { term: string; definition: string }[];
  financialApplications: string[];
  commonMistakes: string[];
  curriculumOutcomeMappings: string[];
  sourceReferences: { title: string; url: string; scope: string }[];
  formulaExplanations: { name: string; formula: string; variables: { symbol: string; meaning: string }[]; notes: string[] }[];
  workedExamples: { title: string; problem: string; steps: { label: string; calculation: string; explanation: string }[]; answer: string }[];
  keyTakeaways: string[];
  summary: string;
}

export interface LessonQuestion {
  id: string;
  question: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  options: { id: string; text: string }[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isQuestionOption(value: unknown): value is { id: string; text: string } {
  return isRecord(value) && typeof value.id === "string" && typeof value.text === "string";
}

export function isLessonQuestion(value: unknown): value is LessonQuestion {
  if (!isRecord(value)) return false;
  const item = value;
  return typeof item.id === "string"
    && typeof item.question === "string"
    && ["EASY", "MEDIUM", "HARD"].includes(String(item.difficulty))
    && Array.isArray(item.options)
    && item.options.every(isQuestionOption);
}
