-- CreateTable
CREATE TABLE "LearningOutcomeStatement" (
    "id" TEXT NOT NULL,
    "curriculumId" TEXT NOT NULL,
    "subtopicId" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "statement" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "sourceUrl" TEXT,
    "sourcePage" TEXT,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LearningOutcomeStatement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LessonLearningOutcome" (
    "lessonId" TEXT NOT NULL,
    "learningOutcomeStatementId" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "LessonLearningOutcome_pkey" PRIMARY KEY ("lessonId","learningOutcomeStatementId")
);

-- CreateTable
CREATE TABLE "PracticeQuestionLearningOutcome" (
    "questionId" TEXT NOT NULL,
    "learningOutcomeStatementId" TEXT NOT NULL,

    CONSTRAINT "PracticeQuestionLearningOutcome_pkey" PRIMARY KEY ("questionId","learningOutcomeStatementId")
);

-- CreateIndex
CREATE INDEX "LearningOutcomeStatement_subtopicId_status_order_idx" ON "LearningOutcomeStatement"("subtopicId", "status", "order");

-- CreateIndex
CREATE UNIQUE INDEX "LearningOutcomeStatement_curriculumId_identifier_key" ON "LearningOutcomeStatement"("curriculumId", "identifier");

-- CreateIndex
CREATE INDEX "LessonLearningOutcome_learningOutcomeStatementId_idx" ON "LessonLearningOutcome"("learningOutcomeStatementId");

-- CreateIndex
CREATE INDEX "PracticeQuestionLearningOutcome_learningOutcomeStatementId_idx" ON "PracticeQuestionLearningOutcome"("learningOutcomeStatementId");

-- AddForeignKey
ALTER TABLE "LearningOutcomeStatement" ADD CONSTRAINT "LearningOutcomeStatement_curriculumId_fkey" FOREIGN KEY ("curriculumId") REFERENCES "Curriculum"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningOutcomeStatement" ADD CONSTRAINT "LearningOutcomeStatement_subtopicId_fkey" FOREIGN KEY ("subtopicId") REFERENCES "Subtopic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonLearningOutcome" ADD CONSTRAINT "LessonLearningOutcome_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonLearningOutcome" ADD CONSTRAINT "LessonLearningOutcome_learningOutcomeStatementId_fkey" FOREIGN KEY ("learningOutcomeStatementId") REFERENCES "LearningOutcomeStatement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PracticeQuestionLearningOutcome" ADD CONSTRAINT "PracticeQuestionLearningOutcome_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "PracticeQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PracticeQuestionLearningOutcome" ADD CONSTRAINT "PracticeQuestionLearningOutcome_learningOutcomeStatementId_fkey" FOREIGN KEY ("learningOutcomeStatementId") REFERENCES "LearningOutcomeStatement"("id") ON DELETE CASCADE ON UPDATE CASCADE;
