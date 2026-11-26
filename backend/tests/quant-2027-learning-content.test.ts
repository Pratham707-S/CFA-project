import { describe, expect, it } from "vitest";
import { quant2027Curriculum } from "../src/modules/learning/quant-2027-curriculum.js";
import { quant2027LearningContent } from "../src/modules/learning/quant-2027-learning-content.js";

describe("CFA Level I 2027 Quant draft learning content", () => {
  it("has one original draft lesson plan for each existing Quant module", () => {
    expect(quant2027LearningContent).toHaveLength(quant2027Curriculum.modules.length);
    expect(quant2027LearningContent.map((entry) => entry.moduleSlug).sort()).toEqual(
      quant2027Curriculum.modules.map((module) => module.slug).sort(),
    );
    for (const entry of quant2027LearningContent) {
      expect(entry.lessonTitle.trim().length).toBeGreaterThan(8);
      expect(entry.lessonSlug).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
      expect(entry.learningObjectives.length).toBeGreaterThan(0);
    }
  });

  it("contains valid, non-duplicate YouTube IDs per lesson", () => {
    for (const entry of quant2027LearningContent) {
      const ids = entry.videos.map((video) => video.id);
      expect(new Set(ids).size).toBe(ids.length);
      for (const id of ids) expect(id).toMatch(/^[A-Za-z0-9_-]{11}$/);
    }
  });

  it("maps a 2027 module 6 video candidate to statistical distributions", () => {
    const distributions = quant2027LearningContent.find((entry) => entry.moduleSlug === "statistical-distributions-for-financial-asset-prices-and-returns");
    expect(distributions?.videos).toEqual([
      expect.objectContaining({
        id: "JrXRXgi2M-s",
        title: "Continuous uniform distribution (for the CFA Level 1 exam)",
        channel: "Let me explain",
      }),
    ]);
  });
});
