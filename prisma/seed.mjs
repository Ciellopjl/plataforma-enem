import pkg from "@prisma/client";
const { PrismaClient } = pkg;
import { Pool } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";

// Sênior HTTP Adapter para CLI (Ignorar bloqueio de porta 5432)
const neonPool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaNeon(neonPool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🚀 Iniciando Seeding Sênior via HTTP (Porta 443)...");

  // Limpar dados existentes para evitar duplicatas e inconsistências no novo schema
  try {
    await prisma.progress.deleteMany({});
    await prisma.dailyChallenge.deleteMany({});
    await prisma.quizAttempt.deleteMany({});
    await prisma.option.deleteMany({});
    await prisma.question.deleteMany({});
    await prisma.quiz.deleteMany({});
    await prisma.lesson.deleteMany({});
    await prisma.content.deleteMany({});
    await prisma.resource.deleteMany({});
    console.log("🧹 Banco limpo com sucesso.");
  } catch (err) {
    console.warn("⚠️ Erro ao limpar tabelas (pode estar vazio):", err.message);
  }

  const subjects = [
    { name: "Matemática", slug: "matematica", color: "bg-blue-600", icon: "Calculator" },
    { name: "Biologia", slug: "biologia", color: "bg-emerald-600", icon: "Dna" },
    { name: "Física", slug: "fisica", color: "bg-indigo-600", icon: "Zap" },
    { name: "Química", slug: "quimica", color: "bg-teal-600", icon: "TestTube" },
    { name: "História", slug: "historia", color: "bg-amber-700", icon: "History" },
    { name: "Geografia", slug: "geografia", color: "bg-green-700", icon: "Globe" },
    { name: "Filosofia", slug: "filosofia", color: "bg-violet-700", icon: "Brain" },
    { name: "Sociologia", slug: "sociologia", color: "bg-purple-700", icon: "Users" },
    { name: "Atualidades", slug: "atualidades", color: "bg-rose-600", icon: "Newspaper" },
    { name: "Linguagens", slug: "linguagens", color: "bg-orange-600", icon: "Languages" },
    { name: "Redação", slug: "redacao", color: "bg-pink-600", icon: "PenTool" },
  ];

  for (const s of subjects) {
    console.log(`📦 Sincronizando categoria: ${s.name}...`);
    const subject = await prisma.subject.upsert({
      where: { slug: s.slug },
      update: { name: s.name, color: s.color, icon: s.icon },
      create: { name: s.name, slug: s.slug, color: s.color, icon: s.icon },
    });

    // 1. Criar Aula Inicial para cada categoria
    let lessonData = {
      title: `Introdução a ${s.name} para o ENEM`,
      content: `Iniciamos nossa jornada em ${s.name}. Este módulo aborda os conceitos fundamentais mais cobrados na prova nos últimos 5 anos.`,
      videoUrl: "",
      order: 1,
      subjectId: subject.id,
    };

    // Personalização de links/conteúdo...
    if (s.slug === "matematica") {
      lessonData.title = "Matemática Básica: Potenciação";
      lessonData.content = "A base de toda a matemática do ENEM. Entenda as propriedades das potências para ganhar tempo nas questões complexas.";
      lessonData.videoUrl = "https://www.youtube.com/watch?v=m-_sIVXNnXU";
    } else if (s.slug === "redacao") {
      lessonData.title = "A Estrutura da Redação Nota 1000";
      lessonData.content = "Introdução, Desenvolvimento e Proposta de Intervenção explicadas passo a passo.";
      lessonData.videoUrl = "https://www.youtube.com/watch?v=Bwcn_Ps-r48";
    }

    await prisma.lesson.create({ data: lessonData });

    // 2. Criar Quiz (Desafio Master)
    const quiz = await prisma.quiz.create({
      data: {
        title: `Desafio Master ${subject.name}`,
        description: `Teste seus conhecimentos sobre ${subject.name} (Módulo 1).`,
        subjectId: subject.id,
      }
    });

    // 3. Adicionar Questões Base
    const questionsMap = [
      { text: `Como o ENEM cobra ${subject.name}?`, options: ["Decoreba pura", "Interpretação e Contexto", "Apenas fórmulas", "Não cai na prova"], correct: 1 },
      { text: `Qual a melhor forma de estudar ${subject.name}?`, options: ["Ler o livro todo", "Ver 10 horas de aula", "Praticar com provas anteriores", "Não estudar"], correct: 2 },
    ];

    for (const qData of questionsMap) {
      const question = await prisma.question.create({
        data: {
          text: qData.text,
          quizId: quiz.id,
        }
      });

      for (let i = 0; i < qData.options.length; i++) {
        const option = await prisma.option.create({
          data: {
            text: qData.options[i],
            questionId: question.id,
          }
        });

        if (i === qData.correct) {
          await prisma.question.update({
            where: { id: question.id },
            data: { correctOptionId: option.id }
          });
        }
      }
    }
  }

  console.log("\n✅ Sincronização Sênior concluída com sucesso! 🚀✨");
}

main()
  .catch((e) => {
    console.error("❌ Erro fatal durante o seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
