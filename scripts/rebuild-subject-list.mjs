import pkg from "@prisma/client";
const { PrismaClient } = pkg;
import { Pool } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";

const neonPool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaNeon(neonPool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🛠️  Iniciando Reestruturação Granular do Currículo...");

  // 1. Manter Matemática Protegida
  const mathSubject = await prisma.subject.findUnique({ where: { slug: "matematica" } });
  const mathId = mathSubject?.id;

  // 2. Limpar todas as outras matérias (Remoção total para evitar duplicatas das genéricas)
  console.log("🧹 Removendo categorias obsoletas (Exceto Matemática)...");
  
  // Devido a foreign keys, deletamos aulas e quizzes primeiro das outras matérias
  await prisma.progress.deleteMany({ where: { lesson: { subjectId: { not: mathId } } } });
  await prisma.quizAttempt.deleteMany({ where: { quiz: { subjectId: { not: mathId } } } });
  await prisma.option.deleteMany({ where: { question: { quiz: { subjectId: { not: mathId } } } } });
  await prisma.question.deleteMany({ where: { quiz: { subjectId: { not: mathId } } } });
  await prisma.quiz.deleteMany({ where: { subjectId: { not: mathId } } });
  await prisma.lesson.deleteMany({ where: { subjectId: { not: mathId } } });
  await prisma.content.deleteMany({ where: { subjectId: { not: mathId } } });
  await prisma.note.deleteMany({ where: { subjectId: { not: mathId } } });
  
  await prisma.subject.deleteMany({ where: { id: { not: mathId } } });

  const newSubjects = [
    { name: "Português", slug: "portugues", color: "bg-orange-600", icon: "Type" },
    { name: "Literatura", slug: "literatura", color: "bg-rose-700", icon: "Book" },
    { name: "Inglês", slug: "ingles", color: "bg-blue-800", icon: "Globe" },
    { name: "Espanhol", slug: "espanhol", color: "bg-red-700", icon: "Globe" },
    { name: "Artes", slug: "artes", color: "bg-pink-700", icon: "Palette" },
    { name: "Educação Física", slug: "educacao-fisica", color: "bg-emerald-700", icon: "Dumbbell" },
    { name: "Tecnologias", slug: "tecnologias", color: "bg-cyan-700", icon: "Cpu" },
    { name: "Redação", slug: "redacao", color: "bg-pink-600", icon: "PenTool" },
    { name: "História", slug: "historia", color: "bg-amber-700", icon: "History" },
    { name: "Geografia", slug: "geografia", color: "bg-green-700", icon: "Map" },
    { name: "Filosofia", slug: "filosofia", color: "bg-violet-700", icon: "Brain" },
    { name: "Sociologia", slug: "sociologia", color: "bg-purple-700", icon: "Users" },
    { name: "Biologia", slug: "biologia", color: "bg-emerald-600", icon: "Dna" },
    { name: "Química", slug: "quimica", color: "bg-teal-600", icon: "TestTube" },
    { name: "Física", slug: "fisica", color: "bg-indigo-600", icon: "Zap" }
  ];

  for (const s of newSubjects) {
    console.log(`📦 Onboard: ${s.name}...`);
    const subject = await prisma.subject.upsert({
      where: { slug: s.slug },
      update: { name: s.name, color: s.color, icon: s.icon },
      create: { name: s.name, slug: s.slug, color: s.color, icon: s.icon },
    });

    // Criar Aula de Boas-vindas para todas exceto as que já tinham conteúdo (Redação/História etc foram limpas)
    await prisma.lesson.create({
      data: {
        title: `Boas-vindas a ${s.name}`,
        content: `### Introdução ao Currículo Sênior de ${s.name}\nPrepare-se para dominar esta área do ENEM 2026. Em breve, novos módulos e simulados serão adicionados por aqui.`,
        order: 1,
        subjectId: subject.id,
      }
    });

    // Criar Quiz Básico
    await prisma.quiz.create({
        data: {
            title: `Desafio Inicial: ${s.name}`,
            description: `Teste seus conhecimentos base para iniciar os estudos em ${s.name}.`,
            subjectId: subject.id,
        }
    });
  }

  console.log("\n✅ Reestruturação Concluída! Plataforma com 16 Matérias Ativas. 🚀💎✨");
}

main()
  .catch((e) => {
    console.error("❌ Erro fatal na reestruturação:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
