import { act, renderHook, waitFor, cleanup } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useLessonData } from "@/hooks/use-lesson-data";

const jsonResponse = (data: unknown) =>
  new Response(JSON.stringify(data), { status: 200 });
const getFetchMock = () => vi.mocked(fetch);

describe("useLessonData", () => {
  beforeEach(() => vi.stubGlobal("fetch", vi.fn()));
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("loads lesson-specific content, questions, resources and progress", async () => {
    getFetchMock().mockImplementation(async (input) => {
      const path = String(input);
      return jsonResponse(
        path.endsWith("/resources")
          ? { resources: [] }
          : path.endsWith("/questions")
            ? { questions: [] }
            : path.endsWith("/progress")
              ? { progress: { lessonCompleted: true } }
              : { lesson: { content: null } },
      );
    });

    const { result } = renderHook(() => useLessonData("lesson-a", true));

    expect(result.current.contentLoading).toBe(true);
    await waitFor(() => expect(result.current.questionsLoading).toBe(false));
    expect(result.current.lessonId).toBe("lesson-a");
    expect(result.current.videos).toEqual([]);
    expect(result.current.questions).toEqual([]);
    expect(result.current.completedLessonIds.has("lesson-a")).toBe(true);
  });

  it("aborts the previous lesson requests and hides its resources after switching", async () => {
    const requests: { path: string; signal?: AbortSignal | null }[] = [];
    getFetchMock().mockImplementation((input, init) => {
      requests.push({
        path: String(input),
        signal: init?.signal,
      });
      return new Promise(() => undefined);
    });

    const { result, rerender } = renderHook(
      ({ lessonId }) => useLessonData(lessonId, true),
      {
        initialProps: { lessonId: "lesson-a" },
      },
    );
    rerender({ lessonId: "lesson-b" });

    await waitFor(() =>
      expect(
        requests.some((request) => request.path.includes("lesson-b")),
      ).toBe(true),
    );
    expect(
      requests
        .filter((request) => request.path.includes("lesson-a"))
        .every((request) => request.signal?.aborted),
    ).toBe(true);
    expect(result.current.lessonId).toBe("lesson-b");
    expect(result.current.content).toBeNull();
    expect(result.current.videos).toEqual([]);
  });

  it("keeps request failures visible as lesson-scoped errors", async () => {
    getFetchMock().mockRejectedValue(new Error("offline"));
    const { result } = renderHook(() => useLessonData("lesson-a", true));

    await waitFor(() => expect(result.current.contentError).toBe("offline"));
    expect(result.current.questionsError).toBe("offline");
    expect(result.current.lessonId).toBe("lesson-a");
  });

  it("does not fetch or show lesson data while disabled", async () => {
    const { result } = renderHook(() => useLessonData("lesson-a", false));
    await act(async () => Promise.resolve());

    expect(getFetchMock()).not.toHaveBeenCalled();
    expect(result.current.content).toBeNull();
    expect(result.current.videos).toEqual([]);
  });
});
