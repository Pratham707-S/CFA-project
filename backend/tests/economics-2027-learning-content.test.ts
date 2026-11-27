import { describe, expect, it } from "vitest";
import { economics2027Curriculum } from "../src/modules/learning/economics-2027-curriculum.js";
import {
  economics2027LessonDrafts,
  economics2027PracticeDrafts,
  economics2027QuestionOutcomeIndexes,
  validatedEconomics2027Questions,
} from "../src/modules/learning/economics-2027-lesson-drafts.js";
import { lessonContentSchema } from "../src/modules/learning/learning.schema.js";

describe("CFA Level I 2027 Economics draft content", () => {
  it("covers each official module with structured, source-mapped teaching content", () => {
    const draftSlugs = Object.keys(economics2027LessonDrafts).sort();
    expect(draftSlugs).toEqual(economics2027Curriculum.modules.map((module) => module.slug).sort());

    for (const [slug, rawContent] of Object.entries(economics2027LessonDrafts)) {
      const content = lessonContentSchema.parse(rawContent);
      expect(content.conceptIntroduction.length, slug).toBeGreaterThan(40);
      expect(content.simpleExplanation.length, slug).toBeGreaterThan(100);
      expect(content.definitions.length, slug).toBeGreaterThan(0);
      expect(content.formulaExplanations.length, slug).toBeGreaterThan(0);
      expect(content.workedExamples.length, slug).toBeGreaterThan(0);
      expect(content.financialApplications.length, slug).toBeGreaterThan(0);
      expect(content.commonMistakes.length, slug).toBeGreaterThan(0);
      expect(content.keyTakeaways.length, slug).toBeGreaterThan(0);
      expect(content.curriculumOutcomeMappings.length, slug).toBeGreaterThan(0);
      expect(content.sourceReferences.length, slug).toBeGreaterThan(0);
      expect(content.curriculumOutcomeMappings.length, slug).toBeGreaterThan(0);
      expect(economics2027QuestionOutcomeIndexes[slug as keyof typeof economics2027QuestionOutcomeIndexes]).toHaveLength(2);
      for (const outcomeIndexes of economics2027QuestionOutcomeIndexes[slug as keyof typeof economics2027QuestionOutcomeIndexes]) {
        expect(outcomeIndexes.length).toBeGreaterThan(0);
        expect(outcomeIndexes.every((index) => index >= 0 && index < content.curriculumOutcomeMappings.length)).toBe(true);
      }
    }
  });

  it("contains two original draft questions per Economics module and valid answer references", () => {
    expect(Object.values(economics2027PracticeDrafts).every((items) => items.length === 2)).toBe(true);
    expect(validatedEconomics2027Questions).toHaveLength(16);
    expect(validatedEconomics2027Questions.every((question) => question.status === "DRAFT")).toBe(true);
    for (const question of validatedEconomics2027Questions) {
      expect(question.options.some((option) => option.id === question.correctAnswer)).toBe(true);
    }
  });

  it("keeps the Capital Flows module focused on flow, FX, and policy-regime outcomes", () => {
    const content = lessonContentSchema.parse(economics2027LessonDrafts["capital-flows-and-the-fx-market"]);
    const searchable = [content.simpleExplanation, ...content.definitions.map(({ term, definition }) => `${term} ${definition}`), ...content.curriculumOutcomeMappings].join(" ").toLowerCase();
    expect(searchable).toContain("capital");
    expect(searchable).toContain("exchange");
    expect(searchable).toContain("impossible trinity");
    expect(searchable).toContain("nominal and real exchange rates");
    expect(searchable).toContain("percentage change");
  });

  it("checks the worked-example arithmetic independently", () => {
    expect(120_000 / (50 - 30)).toBe(6_000);
    expect(40 ** 2 + 30 ** 2 + 20 ** 2 + 10 ** 2).toBe(3_000);
    expect(1.08 / 1.03 - 1).toBeCloseTo(0.0485436893, 9);
    expect(2 * 1.06 / 1.02).toBeCloseTo(2.0784313725, 9);
    expect((1.10 * 150)).toBe(165);
    expect(((1.15 - 1.10) / 1.10) * 100).toBeCloseTo(4.545454545, 8);
    expect(1.20 * 110 / 120).toBeCloseTo(1.1, 10);
  });

  it("rejects malformed lesson content instead of silently accepting it", () => {
    const malformed = { ...economics2027LessonDrafts["fiscal-policy"], summary: "" };
    expect(lessonContentSchema.safeParse(malformed).success).toBe(false);
  });
});
