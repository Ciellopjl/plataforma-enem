import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 BIG SEED (MODO RESILIENTE)...");

  // Limpar
  await prisma.resource.deleteMany();
  await prisma.option.deleteMany();
  await prisma.question.deleteMany();
  await prisma.quizAttempt.deleteMany();
  await prisma.quiz.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.subject.deleteMany();

  const data = [
    {
      name: 'Matemática', slug: 'matematica', icon: 'Calculator', color: 'bg-rose-500',
      lessons: [
        { title: "Razão e Proporção", content: "Regra de três e escalas.", videoUrl: "https://youtube.com", order: 1 },
        { title: "Geometria Plana", content: "Áreas e perímetros.", videoUrl: "https://youtube.com", order: 2 }
      ]
    },
    {
      name: 'Linguagens', slug: 'linguagens', icon: 'BookA', color: 'bg-blue-500',
      lessons: [
        { title: "Interpretação de Texto", content: "Gêneros textuais.", videoUrl: "https://youtube.com", order: 1 },
        { title: "Literatura Moderna", content: "Semana de 22.", videoUrl: "https://youtube.com", order: 2 }
      ]
    },
    {
       name: 'Ciências da Natureza', slug: 'natureza', icon: 'FlaskConical', color: 'bg-emerald-500',
       lessons: [
         { title: "Ecologia", content: "Cadeias alimentares.", videoUrl: "https://youtube.com", order: 1 },
         { title: "Termodinâmica", content: "Leis da física.", videoUrl: "https://youtube.com", order: 2 }
       ]
    },
    {
       name: 'Ciências Humanas', slug: 'humanas', icon: 'Globe', color: 'bg-orange-500',
       lessons: [
         { title: "História do Brasil", content: "Brasil Colônia.", videoUrl: "https://youtube.com", order: 1 },
         { title: "Geopolítica", content: "Mundo Pós-Guerra.", videoUrl: "https://youtube.com", order: 2 }
       ]
    },
    {
       name: 'Redação', slug: 'redacao', icon: 'PenTool', color: 'bg-purple-600',
       lessons: [
         { title: "A Proposta de Intervenção", content: "Os 5 elementos.", videoUrl: "https://youtube.com", order: 1 }
       ]
    }
  ];

  for (const s of data) {
    const sub = await prisma.subject.create({
      data: {
        name: s.name,
        slug: s.slug,
        icon: s.icon,
        color: s.color,
      }
    });
    console.log(`+ Subject: ${s.name}`);

    for (const l of s.lessons) {
      await prisma.lesson.create({
        data: {
          title: l.title,
          content: l.content,
          videoUrl: l.videoUrl,
          order: l.order,
          subjectId: sub.id
        }
      });
    }

    await prisma.quiz.create({
      data: {
        title: `Simulado Pocket ${s.name}`,
        subjectId: sub.id,
        questions: {
          create: [
            {
              text: `Pergunta de teste para ${s.name}`,
              options: {
                create: [
                  { text: 'Opção Correta', isCorrect: true },
                  { text: 'Opção Incorreta', isCorrect: false }
                ]
              }
            }
          ]
        }
      }
    });
  }

  await prisma.resource.createMany({
    data: [
      { title: "Simulado Geral I", type: "Simulados", category: "ENEM", link: "#", description: "Primeiro Dia" },
      { title: "Simulado Geral II", type: "Simulados", category: "ENEM", link: "#", description: "Segundo Dia" }
    ]
  });

  console.log("✅ SEED COMPLETO E RESILIENTE!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
