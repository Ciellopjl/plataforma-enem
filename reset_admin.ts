import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function godMode() {
  const email = "ciellolisboa023@gmail.com";
  console.log(`⚡ ATIVANDO MODO DEUS PARA: ${email}...`);
  
  const hashedPassword = await bcrypt.hash("ciello291108", 10);
  
  // 1. Atualizar Nome e Pontos Reais no Perfil
  const user = await prisma.user.upsert({
    where: { email },
    update: {
      name: "Ciel Lisboa",
      points: 30000,
      role: "ADMIN",
      isBlocked: false,
      password: hashedPassword
    },
    create: {
      email,
      name: "Ciel Lisboa",
      points: 30000,
      role: "ADMIN",
      password: hashedPassword,
      isBlocked: false
    }
  });

  console.log("✅ NOME ATUALIZADO: Ciel Lisboa");
  console.log("✅ PONTOS ATUALIZADOS: 30,000 (Elite)");

  // 2. Sincronizar Progresso 100% (Todas as lições completas)
  const lessons = await prisma.lesson.findMany({
    select: { id: true }
  });

  console.log(`🔄 Sincronizando progresso em ${lessons.length} aulas...`);

  await Promise.all(lessons.map(lesson => 
    prisma.progress.upsert({
      where: {
        userId_lessonId: {
          userId: user.id,
          lessonId: lesson.id
        }
      },
      update: { completed: true },
      create: {
        userId: user.id,
        lessonId: lesson.id,
        completed: true
      }
    })
  ));

  console.log("✅ PROGRESSO 100% SINCRONIZADO!");
  console.log("Agora o seu painel deve refletir o estado de MAESTRIA TOTAL.");
}

godMode().catch(console.error).finally(() => prisma.$disconnect());
