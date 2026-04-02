import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function check() {
  const s = await prisma.subject.count();
  const l = await prisma.lesson.count();
  const q = await prisma.quiz.count();
  const r = await prisma.resource.count();
  console.log({ subjects: s, lessons: l, quizzes: q, resources: r });
  
  if (s > 0) {
    const subs = await prisma.subject.findMany({ take: 5 });
    console.log("Sample subjects:", subs.map(x => x.name));
  }
}

check().catch(console.error).finally(() => prisma.$disconnect());
