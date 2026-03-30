const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  // Limpar dados existentes para evitar duplicatas e inconsistências no novo schema
  await prisma.progress.deleteMany({});
  await prisma.quizAttempt.deleteMany({});
  await prisma.option.deleteMany({});
  await prisma.question.deleteMany({});
  await prisma.quiz.deleteMany({});
  await prisma.lesson.deleteMany({});
  await prisma.content.deleteMany({});
  await prisma.resource.deleteMany({});
  // await prisma.subject.deleteMany({}); // Não deletar subjects para manter IDs se possível, mas upsert resolve

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
    const subject = await prisma.subject.upsert({
      where: { slug: s.slug },
      update: { name: s.name, color: s.color, icon: s.icon },
      create: { name: s.name, slug: s.slug, color: s.color, icon: s.icon },
    });

    // 1. Criar Aulas (Curadoria Sênior)
    let lessonData = {
      title: `Introdução a ${s.name} para o ENEM`,
      content: `Iniciamos nossa jornada em ${s.name}. Este módulo aborda os conceitos fundamentais mais cobrados na prova nos últimos 5 anos.`,
      videoUrl: "",
      order: 1,
      subjectId: subject.id,
    };

    if (s.slug === "matematica") {
      lessonData.title = "Matemática Básica: Potenciação";
      lessonData.content = "A base de toda a matemática do ENEM. Entenda as propriedades das potências para ganhar tempo nas questões complexas.";
      lessonData.videoUrl = "https://www.youtube.com/watch?v=m-_sIVXNnXU"; // Link enviado pelo usuário (Aula 01 Ferretto)
    } else if (s.slug === "biologia") {
      lessonData.title = "Citologia: A Célula Animal";
      lessonData.content = "Entenda as organelas citoplasmáticas e suas funções. Essencial para bioenergética.";
      lessonData.videoUrl = "https://www.youtube.com/watch?v=jYAtuTcHNqo&list=PL8vXuI6zmpdgu7TOyarRBU42MXOrUJnOS"; // Samuel Cunha - Playlist Biologia Completa
    } else if (s.slug === "fisica") {
      lessonData.title = "Cinemática: MU e MUV";
      lessonData.content = "Velocidade média, aceleração e as funções horárias do movimento.";
      lessonData.videoUrl = "https://www.youtube.com/watch?v=M58XvuZ4Zy8"; // Professor Boaro - Física Completa (Mecânica)
    } else if (s.slug === "quimica") {
      lessonData.title = "Ligações Químicas";
      lessonData.content = "Entenda como os átomos se unem para formar moléculas (Iônica, Covalente, Metálica).";
      lessonData.videoUrl = "https://www.youtube.com/watch?v=S5O-_kHn3W0"; // Professor Gabriel Cabral - Química Geral Completa
    } else if (s.slug === "historia") {
      lessonData.title = "Era Vargas: Tudo para o ENEM";
      lessonData.content = "Geitúlio Vargas e as transformações do estado brasileiro. Um clássico da prova de humanas.";
      lessonData.videoUrl = "https://www.youtube.com/watch?v=7HEKqvV2JiU"; // Professor Felipe Figueiredo - História Geral Completa
    } else if (s.slug === "geografia") {
      lessonData.title = "População Brasileira";
      lessonData.content = "Urbanização, fluxos migratórios e transição demográfica.";
      lessonData.videoUrl = "https://www.youtube.com/watch?v=tkn-YU7rleQ"; // Professor Ricardo Marcílio - Geografia Geral Completa
    } else if (s.slug === "filosofia") {
      lessonData.title = "Filosofia Moderna: René Descartes";
      lessonData.content = "Penso, logo existo. O racionalismo moderno simplificado.";
      lessonData.videoUrl = "https://www.youtube.com/watch?v=HNldzs3-aZM"; // Filosofia para o ENEM Completa
    } else if (s.slug === "sociologia") {
      lessonData.title = "Émile Durkheim e o Fato Social";
      lessonData.content = "A base da sociologia moderna segundo Durkheim.";
      lessonData.videoUrl = "https://www.youtube.com/watch?v=m1mMyomcFdA"; // Sociologia para o ENEM Completa
    } else if (s.slug === "linguagens") {
      lessonData.title = "Interpretação de Texto";
      lessonData.content = "As competências de linguagens do ENEM em 10 minutos.";
      lessonData.videoUrl = "https://www.youtube.com/watch?v=veYcoZfnDfc"; // Professor Noslen - Português Completo para o ENEM
    } else if (s.slug === "redacao") {
      lessonData.title = "A Estrutura da Redação Nota 1000";
      lessonData.content = "Introdução, Desenvolvimento e Proposta de Intervenção explicadas passo a passo.";
      lessonData.videoUrl = "https://www.youtube.com/watch?v=Bwcn_Ps-r48"; // Professor Vinicius Oliveira - Redação Nota 1000
    } else if (s.slug === "atualidades") {
      lessonData.title = "Guerra na Ucrânia e Conflitos Atuais";
      lessonData.content = "Entenda o cenário geopolítico global para o vestibular.";
      lessonData.videoUrl = "https://www.youtube.com/watch?v=XyW8ecNMF_s"; // Xadrez Verbal - Atualidades Completa
    }

    await prisma.lesson.create({ data: lessonData });

    // 2. Criar Quiz
    const quiz = await prisma.quiz.create({
      data: {
        title: `Desafio Master ${s.name}`,
        description: "Teste seus conhecimentos do módulo básico.",
        subjectId: subject.id,
      }
    });

    // 3. Adicionar Questões ao Quiz
    const q1 = await prisma.question.create({
      data: {
        text: s.slug === "matematica" 
          ? "Se um conjunto A tem 3 elementos e o conjunto B tem 4 elementos, quantas funções de A em B existem?"
          : `Qual o principal objetivo do estudo de ${s.name} no contexto do ENEM?`,
        quizId: quiz.id,
      }
    });

    const options = s.slug === "matematica"
      ? ["12", "64", "81", "7"]
      : ["Passar na prova", "Decorar fórmulas", "Compreender fenômenos", "Analisar dados"];

    for (let i = 0; i < options.length; i++) {
      const option = await prisma.option.create({
        data: {
          text: options[i],
          questionId: q1.id,
        }
      });
      // Definir a primeira opção como correta para exemplo
      if (i === 1) { // 64 ou Decorar
        await prisma.question.update({
          where: { id: q1.id },
          data: { correctOptionId: option.id }
        });
      }
    }
  }

  // Recursos Gerais (Manter para consistência)
  const resources = [
    { title: "Simulados ENEM (Completo)", link: "https://drive.google.com/drive/u/0/folders/1vW_3eI2_9yLSdwksJRQ2NRMyUlzepbVE", type: "Simulados", category: "ENEM" },
    { title: "Comunidade ENEM Geral", link: "https://t.me/joinchat/EKELf9WR0Bk2Yzdh", type: "Comunidade", category: "Geral" },
  ];

  for (const res of resources) {
    await prisma.resource.create({ data: res });
  }

  console.log("Seed Exclusive concluído com sucesso! 🚀✨");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
