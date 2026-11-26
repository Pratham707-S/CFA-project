import type { LearningRepository } from "../modules/learning/learning.repository.js";
import type { TutorLessonContext } from "../modules/learning/learning.types.js";

/** Supplies grounded, student-owned lesson context to a future tutor implementation. */
export class TutorContextService {
  constructor(private readonly learningRepository: LearningRepository) {}

  getContext(studentId: string, lessonId: string): Promise<TutorLessonContext | null> {
    return this.learningRepository.getTutorContext(studentId, lessonId);
  }
}
