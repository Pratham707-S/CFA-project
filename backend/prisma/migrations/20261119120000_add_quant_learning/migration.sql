-- CreateEnum
CREATE TYPE "ContentStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "VideoVerificationStatus" AS ENUM ('PENDING_REVIEW', 'VERIFIED', 'UNAVAILABLE', 'REJECTED');

-- CreateEnum
CREATE TYPE "LearningResourceType" AS ENUM ('VIDEO', 'ARTICLE', 'DOCUMENT', 'OTHER');

-- CreateEnum
CREATE TYPE "PracticeQuestionType" AS ENUM ('MULTIPLE_CHOICE');

-- CreateEnum
CREATE TYPE "PracticeDifficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD');

-- CreateEnum
CREATE TYPE "LessonProgressStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED');

-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'ADMIN';

-- CreateTable
CREATE TABLE "Curriculum" (
    "id" TEXT NOT NULL,
    "program" TEXT NOT NULL DEFAULT 'CFA',
    "level" "CfaLevel" NOT NULL,
    "curriculumYear" INTEGER NOT NULL,
    "sourceUrl" TEXT,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Curriculum_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subject" (
    "id" TEXT NOT NULL,
    "curriculumId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LearningModule" (
    "id" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL,
    "learningOutcomes" TEXT[],
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LearningModule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subtopic" (
    "id" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL,
    "learningOutcomes" TEXT[],
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subtopic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lesson" (
    "id" TEXT NOT NULL,
    "subtopicId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "learningObjectives" TEXT[],
    "estimatedDurationMinutes" INTEGER,
    "order" INTEGER NOT NULL,
    "content" JSONB,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lesson_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VideoResource" (
    "id" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'YOUTUBE',
    "youtubeVideoId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "videoUrl" TEXT NOT NULL,
    "embedUrl" TEXT NOT NULL,
    "durationSeconds" INTEGER,
    "language" TEXT NOT NULL,
    "explanationStyle" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "resourceType" "LearningResourceType" NOT NULL DEFAULT 'VIDEO',
    "sourceChannel" TEXT,
    "sourceChannelUrl" TEXT,
    "chapters" JSONB,
    "verificationStatus" "VideoVerificationStatus" NOT NULL DEFAULT 'PENDING_REVIEW',
    "verifiedAt" TIMESTAMP(3),
    "verifiedById" TEXT,
    "lastCheckedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VideoResource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PracticeQuestion" (
    "id" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "questionType" "PracticeQuestionType" NOT NULL DEFAULT 'MULTIPLE_CHOICE',
    "difficulty" "PracticeDifficulty" NOT NULL DEFAULT 'MEDIUM',
    "options" JSONB NOT NULL,
    "correctAnswer" TEXT NOT NULL,
    "explanation" TEXT NOT NULL,
    "solutionSteps" JSONB,
    "concepts" TEXT[],
    "marks" INTEGER NOT NULL DEFAULT 1,
    "order" INTEGER NOT NULL,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PracticeQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentLessonProgress" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "status" "LessonProgressStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "videoProgressSeconds" INTEGER NOT NULL DEFAULT 0,
    "videoCompleted" BOOLEAN NOT NULL DEFAULT false,
    "lessonCompleted" BOOLEAN NOT NULL DEFAULT false,
    "lastAccessedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentLessonProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionAttempt" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "selectedAnswer" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "timeTakenSeconds" INTEGER,
    "attemptedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuestionAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentWeakConcept" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "concept" TEXT NOT NULL,
    "mistakeCount" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentWeakConcept_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Curriculum_program_level_status_curriculumYear_idx" ON "Curriculum"("program", "level", "status", "curriculumYear");

-- CreateIndex
CREATE UNIQUE INDEX "Curriculum_program_level_curriculumYear_key" ON "Curriculum"("program", "level", "curriculumYear");

-- CreateIndex
CREATE INDEX "Subject_curriculumId_status_order_idx" ON "Subject"("curriculumId", "status", "order");

-- CreateIndex
CREATE UNIQUE INDEX "Subject_curriculumId_slug_key" ON "Subject"("curriculumId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "Subject_curriculumId_order_key" ON "Subject"("curriculumId", "order");

-- CreateIndex
CREATE INDEX "LearningModule_subjectId_status_order_idx" ON "LearningModule"("subjectId", "status", "order");

-- CreateIndex
CREATE UNIQUE INDEX "LearningModule_subjectId_slug_key" ON "LearningModule"("subjectId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "LearningModule_subjectId_order_key" ON "LearningModule"("subjectId", "order");

-- CreateIndex
CREATE INDEX "Subtopic_moduleId_status_order_idx" ON "Subtopic"("moduleId", "status", "order");

-- CreateIndex
CREATE UNIQUE INDEX "Subtopic_moduleId_slug_key" ON "Subtopic"("moduleId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "Subtopic_moduleId_order_key" ON "Subtopic"("moduleId", "order");

-- CreateIndex
CREATE INDEX "Lesson_subtopicId_status_order_idx" ON "Lesson"("subtopicId", "status", "order");

-- CreateIndex
CREATE UNIQUE INDEX "Lesson_subtopicId_slug_key" ON "Lesson"("subtopicId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "Lesson_subtopicId_order_key" ON "Lesson"("subtopicId", "order");

-- CreateIndex
CREATE INDEX "VideoResource_lessonId_verificationStatus_isPrimary_idx" ON "VideoResource"("lessonId", "verificationStatus", "isPrimary");

-- CreateIndex
CREATE INDEX "VideoResource_verificationStatus_lastCheckedAt_idx" ON "VideoResource"("verificationStatus", "lastCheckedAt");

-- CreateIndex
CREATE UNIQUE INDEX "VideoResource_lessonId_youtubeVideoId_key" ON "VideoResource"("lessonId", "youtubeVideoId");

-- CreateIndex
CREATE UNIQUE INDEX "VideoResource_one_primary_per_lesson_key" ON "VideoResource"("lessonId") WHERE ("isPrimary" = true);

-- CreateIndex
CREATE INDEX "PracticeQuestion_lessonId_status_order_idx" ON "PracticeQuestion"("lessonId", "status", "order");

-- CreateIndex
CREATE UNIQUE INDEX "PracticeQuestion_lessonId_order_key" ON "PracticeQuestion"("lessonId", "order");

-- CreateIndex
CREATE INDEX "StudentLessonProgress_studentId_status_lastAccessedAt_idx" ON "StudentLessonProgress"("studentId", "status", "lastAccessedAt");

-- CreateIndex
CREATE UNIQUE INDEX "StudentLessonProgress_studentId_lessonId_key" ON "StudentLessonProgress"("studentId", "lessonId");

-- CreateIndex
CREATE INDEX "QuestionAttempt_studentId_attemptedAt_idx" ON "QuestionAttempt"("studentId", "attemptedAt");

-- CreateIndex
CREATE INDEX "QuestionAttempt_questionId_studentId_attemptedAt_idx" ON "QuestionAttempt"("questionId", "studentId", "attemptedAt");

-- CreateIndex
CREATE INDEX "StudentWeakConcept_studentId_mistakeCount_updatedAt_idx" ON "StudentWeakConcept"("studentId", "mistakeCount", "updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "StudentWeakConcept_studentId_lessonId_concept_key" ON "StudentWeakConcept"("studentId", "lessonId", "concept");

-- AddForeignKey
ALTER TABLE "Subject" ADD CONSTRAINT "Subject_curriculumId_fkey" FOREIGN KEY ("curriculumId") REFERENCES "Curriculum"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningModule" ADD CONSTRAINT "LearningModule_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subtopic" ADD CONSTRAINT "Subtopic_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "LearningModule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lesson" ADD CONSTRAINT "Lesson_subtopicId_fkey" FOREIGN KEY ("subtopicId") REFERENCES "Subtopic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoResource" ADD CONSTRAINT "VideoResource_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoResource" ADD CONSTRAINT "VideoResource_verifiedById_fkey" FOREIGN KEY ("verifiedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PracticeQuestion" ADD CONSTRAINT "PracticeQuestion_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentLessonProgress" ADD CONSTRAINT "StudentLessonProgress_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentLessonProgress" ADD CONSTRAINT "StudentLessonProgress_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionAttempt" ADD CONSTRAINT "QuestionAttempt_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionAttempt" ADD CONSTRAINT "QuestionAttempt_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "PracticeQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentWeakConcept" ADD CONSTRAINT "StudentWeakConcept_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentWeakConcept" ADD CONSTRAINT "StudentWeakConcept_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;
