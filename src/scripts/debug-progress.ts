import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst({
    where: { email: process.env.DEV_EMAIL },
    include: { progress: { include: { lesson: true, content: true } } }
  });

  const subjects = await prisma.subject.findMany({
    include: { lessons: true, contents: true }
  });

  console.log(`User: ${user?.email}`);
  console.log(`Total Progress records: ${user?.progress.length}`);
  
  if (user?.progress.length && user.progress.length > 0) {
     console.log('Sample progress:', user.progress.slice(0, 2).map((p:any) => ({ id: p.id, lessonId: p.lessonId, contentId: p.contentId, completed: p.completed })));
  }

  console.log(`\nSubjects count: ${subjects.length}`);
  for (const s of subjects) {
     console.log(`${s.name}: lessons=${s.lessons.length}, contents=${s.contents.length}`);
  }

  const completedSubjects = subjects.filter(subject => {
    const hasCompletedContent = subject.contents.some((c: any) =>
      user?.progress?.some((p: any) => p.contentId === c.id && p.completed)
    );
    const hasCompletedLesson = subject.lessons?.some((l: any) =>
      user?.progress?.some((p: any) => p.lessonId === l.id && p.completed)
    );
    return hasCompletedContent || hasCompletedLesson;
  }).length;

  console.log(`Completed subjects calculated: ${completedSubjects}/${subjects.length}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
