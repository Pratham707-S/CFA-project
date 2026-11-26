export interface Lesson {
  id: string;
  title: string;
  duration: string;
  completed: boolean;
  videoUrl?: string;
  keyConcepts: string[];
  quickNote: string;
}

export interface Topic {
  id: string;
  title: string;
  completed?: boolean;
  lessons?: Lesson[];
}

export interface Subject {
  id: string;
  name: string;
  iconType: "quant" | "econ" | "fsa" | "corp" | "equity" | "fixed" | "deriv" | "alt" | "port" | "ethics";
  completedTopics: number;
  totalTopics: number;
  topics: Topic[];
}

export interface ResourceItem {
  id: string;
  title: string;
  subtitle: string;
  fileType: "pdf" | "doc" | "sheet";
  color: string;
}

export interface RelatedTopicItem {
  id: string;
  title: string;
  subjectId?: string;
}

export interface ExampleProblem {
  id: string;
  title: string;
  problem: string;
  formula: string;
  solutionSteps: string[];
  finalAnswer: string;
}

export interface PracticeQuestion {
  id: string;
  question: string;
  options: { id: string; label: string; text: string }[];
  correctOptionId: string;
  explanation: string;
}
