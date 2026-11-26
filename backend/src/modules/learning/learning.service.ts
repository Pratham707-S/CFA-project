import { HttpError } from "../../shared/errors/http-error.js";
import type { LearningRepository } from "./learning.repository.js";
import type { ProgressUpdateInput, QuestionAttemptInput } from "./learning.schema.js";

export class LearningService {
  constructor(private readonly repository: LearningRepository) {}

  async updateProgress(studentId: string, lessonId: string, input: ProgressUpdateInput) {
    const lesson = await this.repository.getLesson(lessonId);
    if (!lesson) throw new HttpError(404, "Lesson was not found.", "LESSON_NOT_FOUND");
    return this.repository.updateProgress(studentId, lessonId, input);
  }

  getProgress(studentId: string, lessonId: string) {
    return this.repository.getProgress(studentId, lessonId);
  }

  async attemptQuestion(studentId: string, questionId: string, input: QuestionAttemptInput) {
    const question = await this.repository.getQuestionForAttempt(questionId);
    if (!question) throw new HttpError(404, "Practice question was not found.", "QUESTION_NOT_FOUND");
    const options = Array.isArray(question.options) ? question.options as Array<{ id: string }> : [];
    if (!options.some((option) => option.id === input.selectedAnswer)) {
      throw new HttpError(400, "Choose one of the available answers.", "INVALID_ANSWER");
    }
    const isCorrect = input.selectedAnswer === question.correctAnswer;
    const attempt = await this.repository.createAttempt(studentId, questionId, input, isCorrect, isCorrect ? [] : question.concepts);
    return {
      attempt,
      feedback: { isCorrect, correctAnswer: question.correctAnswer, explanation: question.explanation, solutionSteps: question.solutionSteps },
    };
  }

  async createVideo(adminId: string, lessonId: string, input: Parameters<LearningRepository["createVideo"]>[2]) {
    const video = await this.repository.createVideo(adminId, lessonId, input);
    if (!video) throw new HttpError(404, "Lesson was not found.", "LESSON_NOT_FOUND");
    return video;
  }

  async updateVideo(videoId: string, input: Parameters<LearningRepository["updateVideo"]>[1]) {
    const video = await this.repository.updateVideo(videoId, input);
    if (!video) throw new HttpError(404, "Video resource was not found.", "VIDEO_NOT_FOUND");
    if (input.isPrimary && video.verificationStatus !== "VERIFIED") {
      throw new HttpError(409, "Only a verified video can be set as primary.", "VIDEO_NOT_VERIFIED");
    }
    return video;
  }

  async updateVideoVerification(adminId: string, videoId: string, status: Parameters<LearningRepository["updateVideoVerification"]>[2]) {
    const video = await this.repository.updateVideoVerification(adminId, videoId, status);
    if (!video) throw new HttpError(404, "Video resource was not found.", "VIDEO_NOT_FOUND");
    return video;
  }

  async createQuestion(input: Parameters<LearningRepository["createQuestion"]>[0]) {
    const question = await this.repository.createQuestion(input);
    if (!question) throw new HttpError(404, "Lesson was not found.", "LESSON_NOT_FOUND");
    return question;
  }
}
