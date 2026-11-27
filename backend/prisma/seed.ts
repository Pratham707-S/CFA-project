import "dotenv/config";
import { getPrismaClient } from "../src/shared/db/prisma.js";
import { quant2027Curriculum } from "../src/modules/learning/quant-2027-curriculum.js";
import { quant2027LearningContent } from "../src/modules/learning/quant-2027-learning-content.js";
import { quant2027LessonDrafts } from "../src/modules/learning/quant-2027-lesson-drafts.js";
import { economics2027Curriculum } from "../src/modules/learning/economics-2027-curriculum.js";
import { economics2027LearningContent } from "../src/modules/learning/economics-2027-learning-content.js";
import { economics2027PracticeDrafts, economics2027LessonDrafts, economics2027QuestionOutcomeIndexes } from "../src/modules/learning/economics-2027-lesson-drafts.js";
import { lessonContentSchema, questionCreateSchema } from "../src/modules/learning/learning.schema.js";
import { getSafeSeedDatabaseUrl } from "../src/config/safe-seed-target.js";

async function seed() {
  process.env.DATABASE_URL = getSafeSeedDatabaseUrl(process.env);
  const prisma = getPrismaClient();
  try {
  const curriculum = await prisma.curriculum.upsert({
    where: { program_level_curriculumYear: { program: quant2027Curriculum.program, level: quant2027Curriculum.level, curriculumYear: quant2027Curriculum.curriculumYear } },
    create: {
      program: quant2027Curriculum.program,
      level: quant2027Curriculum.level,
      curriculumYear: quant2027Curriculum.curriculumYear,
      status: quant2027Curriculum.status,
      sourceUrl: quant2027Curriculum.sourceUrl,
    },
    update: { status: quant2027Curriculum.status, sourceUrl: quant2027Curriculum.sourceUrl },
  });

  const subject = await prisma.subject.upsert({
    where: { curriculumId_slug: { curriculumId: curriculum.id, slug: quant2027Curriculum.subject.slug } },
    create: { ...quant2027Curriculum.subject, curriculumId: curriculum.id },
    update: { name: quant2027Curriculum.subject.name, description: quant2027Curriculum.subject.description, order: quant2027Curriculum.subject.order, status: quant2027Curriculum.subject.status },
  });

  for (const module of quant2027Curriculum.modules) {
    const learningModule = await prisma.learningModule.upsert({
      where: { subjectId_slug: { subjectId: subject.id, slug: module.slug } },
      create: { ...module, subjectId: subject.id, description: null },
      update: { title: module.title, order: module.order, learningOutcomes: module.learningOutcomes, status: module.status },
    });

    const lessonContent = quant2027LearningContent.find((entry) => entry.moduleSlug === module.slug);
    if (!lessonContent) continue;
    const draftContent = quant2027LessonDrafts[module.slug as keyof typeof quant2027LessonDrafts];

    const subtopic = await prisma.subtopic.upsert({
      where: { moduleId_slug: { moduleId: learningModule.id, slug: "reading-overview" } },
      create: {
        moduleId: learningModule.id,
        title: lessonContent.subtopicTitle,
        slug: "reading-overview",
        order: 1,
        learningOutcomes: [...lessonContent.learningObjectives],
        status: "DRAFT",
      },
      update: {},
    });

    const lesson = await prisma.lesson.upsert({
      where: { subtopicId_slug: { subtopicId: subtopic.id, slug: lessonContent.lessonSlug } },
      create: {
        subtopicId: subtopic.id,
        title: lessonContent.lessonTitle,
        slug: lessonContent.lessonSlug,
        description: "Draft platform lesson based on the public CFA Institute 2027 Level I Quantitative Methods outcomes.",
        learningObjectives: [...lessonContent.learningObjectives],
        order: 1,
        content: draftContent,
        status: "DRAFT",
      },
      update: {},
    });

    // Fill only empty lesson bodies so repeat seed runs never overwrite reviewed edits.
    if (lesson.content === null && draftContent) {
      await prisma.lesson.update({ where: { id: lesson.id }, data: { content: draftContent } });
    }

    for (const candidate of lessonContent.videos) {
      await prisma.videoResource.upsert({
        where: { lessonId_youtubeVideoId: { lessonId: lesson.id, youtubeVideoId: candidate.id } },
        create: {
          lessonId: lesson.id,
          youtubeVideoId: candidate.id,
          title: candidate.title,
          videoUrl: `https://www.youtube.com/watch?v=${candidate.id}`,
          embedUrl: `https://www.youtube-nocookie.com/embed/${candidate.id}`,
          language: "English",
          sourceChannel: candidate.channel,
          sourceChannelUrl: "channelUrl" in candidate ? candidate.channelUrl : undefined,
          isPrimary: false,
          verificationStatus: "PENDING_REVIEW",
        },
        update: {},
      });
    }
  }

  const economicsCurriculum = await prisma.curriculum.upsert({
    where: { program_level_curriculumYear: { program: economics2027Curriculum.program, level: economics2027Curriculum.level, curriculumYear: economics2027Curriculum.curriculumYear } },
    create: { program: economics2027Curriculum.program, level: economics2027Curriculum.level, curriculumYear: economics2027Curriculum.curriculumYear, status: economics2027Curriculum.status, sourceUrl: economics2027Curriculum.sourceUrl },
    update: { status: economics2027Curriculum.status, sourceUrl: economics2027Curriculum.sourceUrl },
  });
  const economicsSubject = await prisma.subject.upsert({
    where: { curriculumId_slug: { curriculumId: economicsCurriculum.id, slug: economics2027Curriculum.subject.slug } },
    create: { ...economics2027Curriculum.subject, curriculumId: economicsCurriculum.id },
    update: { name: economics2027Curriculum.subject.name, description: economics2027Curriculum.subject.description, order: economics2027Curriculum.subject.order, status: economics2027Curriculum.subject.status },
  });
  for (const module of economics2027Curriculum.modules) {
    const learningModule = await prisma.learningModule.upsert({
      where: { subjectId_slug: { subjectId: economicsSubject.id, slug: module.slug } },
      create: { ...module, subjectId: economicsSubject.id, description: null },
      update: { title: module.title, order: module.order, learningOutcomes: [...module.learningOutcomes], status: module.status },
    });
    const content = economics2027LearningContent.find((item) => item.moduleSlug === module.slug);
    if (!content) continue;
    const subtopic = await prisma.subtopic.upsert({
      where: { moduleId_slug: { moduleId: learningModule.id, slug: "module-overview" } },
      create: { moduleId: learningModule.id, title: content.subtopicTitle, slug: "module-overview", order: 1, learningOutcomes: [...content.learningObjectives], status: "PUBLISHED" },
      update: { status: "PUBLISHED" },
    });
    const draftBody = lessonContentSchema.parse(economics2027LessonDrafts[module.slug as keyof typeof economics2027LessonDrafts]);
    const draftOutcomeRecords = [];
    for (const [index, statement] of draftBody.curriculumOutcomeMappings.entries()) {
      const identifier = `ECON-2027-${String(module.order).padStart(2, "0")}-${String(index + 1).padStart(2, "2")}`;
      const outcome = await prisma.learningOutcomeStatement.upsert({
        where: { curriculumId_identifier: { curriculumId: economicsCurriculum.id, identifier } },
        create: {
          curriculumId: economicsCurriculum.id,
          subtopicId: subtopic.id,
          identifier,
          statement,
          order: index + 1,
          sourceUrl: economics2027Curriculum.sourceUrl,
          sourcePage: `Economics / ${module.title}`,
          status: "DRAFT",
        },
        update: {},
      });
      draftOutcomeRecords.push(outcome);
    }
    const lesson = await prisma.lesson.upsert({
      where: { subtopicId_slug: { subtopicId: subtopic.id, slug: content.lessonSlug } },
      create: {
        subtopicId: subtopic.id,
        title: content.lessonTitle,
        slug: content.lessonSlug,
        description: "Video lesson shell aligned to the CFA Institute 2027 Level I Economics outline.",
        learningObjectives: [...content.learningObjectives],
        order: 1,
        status: "PUBLISHED",
      },
      update: {},
    });
    await prisma.videoResource.upsert({
      where: { lessonId_youtubeVideoId: { lessonId: lesson.id, youtubeVideoId: content.video.id } },
      create: {
        lessonId: lesson.id,
        youtubeVideoId: content.video.id,
        title: content.video.title,
        videoUrl: content.video.sourceUrl,
        embedUrl: content.video.embedUrl,
        language: content.video.language,
        sourceChannel: content.video.channel,
        isPrimary: false,
        verificationStatus: "PENDING_REVIEW",
      },
      // Preserve any existing reviewer decision. This does not verify or promote videos.
      update: {},
    });
    const draftLessonSlug = `${content.lessonSlug}-written-draft`;
    const draftLesson = await prisma.lesson.upsert({
      where: { subtopicId_slug: { subtopicId: subtopic.id, slug: draftLessonSlug } },
      create: {
        subtopicId: subtopic.id,
        title: `${content.lessonTitle} — Written Draft`,
        slug: draftLessonSlug,
        description: "Original platform-authored lesson draft. Not independently reviewed or published.",
        learningObjectives: [...content.learningObjectives],
        order: 2,
        content: draftBody,
        status: "DRAFT",
      },
      update: {},
    });
    if (draftLesson.status === "DRAFT" && draftLesson.content === null) {
      await prisma.lesson.update({ where: { id: draftLesson.id }, data: { content: draftBody } });
    }
    for (const [index, outcome] of draftOutcomeRecords.entries()) {
      await prisma.lessonLearningOutcome.upsert({
        where: { lessonId_learningOutcomeStatementId: { lessonId: draftLesson.id, learningOutcomeStatementId: outcome.id } },
        create: { lessonId: draftLesson.id, learningOutcomeStatementId: outcome.id, order: index + 1 },
        update: {},
      });
    }

    const questionDrafts = economics2027PracticeDrafts[module.slug as keyof typeof economics2027PracticeDrafts] ?? [];
    const questionOutcomeIndexes = economics2027QuestionOutcomeIndexes[module.slug as keyof typeof economics2027QuestionOutcomeIndexes] ?? [];
    for (const [index, questionDraft] of questionDrafts.entries()) {
      const question = questionCreateSchema.parse({ lessonId: draftLesson.id, ...questionDraft, order: index + 1, status: "DRAFT" });
      const savedQuestion = await prisma.practiceQuestion.upsert({
        where: { lessonId_order: { lessonId: draftLesson.id, order: question.order } },
        create: question,
        // Preserve reviewer edits, status, and answer key on repeat seed runs.
        update: {},
      });
      for (const outcomeIndex of questionOutcomeIndexes[index] ?? []) {
        const outcome = draftOutcomeRecords[outcomeIndex];
        if (!outcome) continue;
        await prisma.practiceQuestionLearningOutcome.upsert({
          where: { questionId_learningOutcomeStatementId: { questionId: savedQuestion.id, learningOutcomeStatementId: outcome.id } },
          create: { questionId: savedQuestion.id, learningOutcomeStatementId: outcome.id },
          update: { learningOutcomeStatementId: outcome.id },
        });
      }
    }
  }

  const adminEmails = (process.env.CURRICULUM_ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
  if (adminEmails.length) {
    await prisma.user.updateMany({ where: { email: { in: adminEmails } }, data: { role: "ADMIN" } });
  }

  console.log(`Seeded CFA Level I ${quant2027Curriculum.curriculumYear}: ${quant2027Curriculum.modules.length} Quant modules and ${economics2027Curriculum.modules.length} Economics modules. Economics video candidates remain pending review.`);
  } finally {
    await prisma.$disconnect();
  }
}

seed().catch((error: unknown) => {
  console.error("Curriculum seed failed.", error instanceof Error ? error.message : "Unknown error");
  process.exitCode = 1;
});
