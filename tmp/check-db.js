
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const subjectsCount = await prisma.subject.count();
    const contentsCount = await prisma.content.count();
    const usersCount = await prisma.user.count();
    console.log(`Subjects: ${subjectsCount}`);
    console.log(`Contents: ${contentsCount}`);
    console.log(`Users: ${usersCount}`);
    
    if (subjectsCount > 0) {
      const subjects = await prisma.subject.findMany({ take: 5 });
      console.log('Sample subjects:', subjects.map(s => s.name));
    }
  } catch (e) {
    console.error('Error connecting to DB:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
