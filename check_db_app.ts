import "dotenv/config";
import { prisma } from "./src/lib/prisma";

async function check() {
  console.log("Checking DB using APP's prisma singleton...");
  const s = await prisma.subject.count();
  const l = await prisma.lesson.count();
  const q = await prisma.quiz.count();
  const r = await prisma.resource.count();
  console.log({ subjects: s, lessons: l, quizzes: q, resources: r });
}

check().catch(console.error).finally(() => process.exit(0));
