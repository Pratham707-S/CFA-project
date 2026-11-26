import "dotenv/config";
import { getPrismaClient } from "../src/shared/db/prisma.js";
import { quant2027Curriculum } from "../src/modules/learning/quant-2027-curriculum.js";
import { quant2027LearningContent } from "../src/modules/learning/quant-2027-learning-content.js";
import { quant2027LessonDrafts } from "../src/modules/learning/quant-2027-lesson-drafts.js";

async function seed() {
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

  const adminEmails = (process.env.CURRICULUM_ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
  if (adminEmails.length) {
    await prisma.user.updateMany({ where: { email: { in: adminEmails } }, data: { role: "ADMIN" } });
  }

  console.log(`Seeded CFA Level I Quantitative Methods ${quant2027Curriculum.curriculumYear}: ${quant2027Curriculum.modules.length} official modules with draft platform lessons and review-pending video candidates.`);
  } finally {
    await prisma.$disconnect();
  }
}

seed().catch((error: unknown) => {
  console.error("Curriculum seed failed.", error instanceof Error ? error.message : "Unknown error");
  process.exitCode = 1;
});
