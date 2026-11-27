import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LessonResources } from "@/components/learn/lesson-resources";

describe("LessonResources", () => {
  it("shows an honest empty state when there are no verified resources", () => {
    render(<LessonResources resources={[]} relatedTopics={[]} />);

    expect(screen.getByRole("status")).toHaveTextContent(
      "No verified resources are available",
    );
  });
});
