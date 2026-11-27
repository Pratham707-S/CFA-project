import { useCallback, useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";
import {
  isLessonQuestion,
  type LessonContent,
  type LessonQuestion,
} from "@/components/learn/content-types";

export type LessonVideo = {
  id: string;
  youtubeVideoId: string;
  title: string;
  durationSeconds: number | null;
  language: string;
  isPrimary: boolean;
  embedUrl: string;
  videoUrl: string;
};

type LessonDataState = {
  lessonId: string | null;
  content: LessonContent | null;
  videos: LessonVideo[];
  questions: LessonQuestion[];
  contentLoading: boolean;
  questionsLoading: boolean;
  contentError: string | null;
  questionsError: string | null;
};

const emptyState = (lessonId: string | null): LessonDataState => ({
  lessonId,
  content: null,
  videos: [],
  questions: [],
  contentLoading: false,
  questionsLoading: false,
  contentError: null,
  questionsError: null,
});

export function useLessonData(lessonId: string | null, enabled: boolean) {
  const [state, setState] = useState<LessonDataState>(() => emptyState(null));
  const [completedLessonIds, setCompletedLessonIds] = useState<Set<string>>(
    () => new Set(),
  );
  const isActive = enabled && Boolean(lessonId);

  const reloadVideos = useCallback(async () => {
    if (!isActive || !lessonId) return;
    const response = await apiRequest<{ resources: LessonVideo[] }>(
      `/api/lessons/${lessonId}/resources`,
    );
    setState((previous) =>
      previous.lessonId === lessonId
        ? { ...previous, videos: response.resources }
        : previous,
    );
  }, [isActive, lessonId]);

  const setLessonCompleted = useCallback(
    async (completed: boolean) => {
      if (!isActive || !lessonId) return;
      await apiRequest(`/api/lessons/${lessonId}/progress`, {
        method: "POST",
        body: JSON.stringify({ lessonCompleted: completed }),
      });
      setCompletedLessonIds((previous) => {
        const next = new Set(previous);
        if (completed) next.add(lessonId);
        else next.delete(lessonId);
        return next;
      });
    },
    [isActive, lessonId],
  );

  useEffect(() => {
    if (!isActive || !lessonId) {
      setState(emptyState(null));
      return;
    }

    const controller = new AbortController();
    const { signal } = controller;
    setState({
      ...emptyState(lessonId),
      contentLoading: true,
      questionsLoading: true,
    });

    void apiRequest<{ lesson: { content: LessonContent | null } }>(
      `/api/lessons/${lessonId}`,
      { signal },
    )
      .then(({ lesson }) => {
        if (!signal.aborted)
          setState((previous) =>
            previous.lessonId === lessonId
              ? { ...previous, content: lesson.content }
              : previous,
          );
      })
      .catch((error: unknown) => {
        if (!signal.aborted)
          setState((previous) =>
            previous.lessonId === lessonId
              ? {
                  ...previous,
                  contentError:
                    error instanceof Error
                      ? error.message
                      : "Lesson content could not be loaded.",
                }
              : previous,
          );
      })
      .finally(() => {
        if (!signal.aborted)
          setState((previous) =>
            previous.lessonId === lessonId
              ? { ...previous, contentLoading: false }
              : previous,
          );
      });

    void apiRequest<{ questions: unknown[] }>(
      `/api/lessons/${lessonId}/questions`,
      { signal },
    )
      .then(({ questions }) => {
        if (!signal.aborted)
          setState((previous) =>
            previous.lessonId === lessonId
              ? { ...previous, questions: questions.filter(isLessonQuestion) }
              : previous,
          );
      })
      .catch((error: unknown) => {
        if (!signal.aborted)
          setState((previous) =>
            previous.lessonId === lessonId
              ? {
                  ...previous,
                  questionsError:
                    error instanceof Error
                      ? error.message
                      : "Practice questions could not be loaded.",
                }
              : previous,
          );
      })
      .finally(() => {
        if (!signal.aborted)
          setState((previous) =>
            previous.lessonId === lessonId
              ? { ...previous, questionsLoading: false }
              : previous,
          );
      });

    void apiRequest<{ resources: LessonVideo[] }>(
      `/api/lessons/${lessonId}/resources`,
      { signal },
    )
      .then(({ resources }) => {
        if (!signal.aborted)
          setState((previous) =>
            previous.lessonId === lessonId
              ? { ...previous, videos: resources }
              : previous,
          );
      })
      .catch(() => {
        if (!signal.aborted)
          setState((previous) =>
            previous.lessonId === lessonId
              ? { ...previous, videos: [] }
              : previous,
          );
      });

    void apiRequest<{ progress: { lessonCompleted: boolean } | null }>(
      `/api/lessons/${lessonId}/progress`,
      { signal },
    )
      .then(({ progress }) => {
        if (signal.aborted) return;
        setCompletedLessonIds((previous) => {
          const next = new Set(previous);
          if (progress?.lessonCompleted) next.add(lessonId);
          else next.delete(lessonId);
          return next;
        });
      })
      .catch(() => undefined);

    return () => controller.abort();
  }, [isActive, lessonId]);

  const current = state.lessonId === lessonId ? state : emptyState(lessonId);
  return { ...current, completedLessonIds, reloadVideos, setLessonCompleted };
}
