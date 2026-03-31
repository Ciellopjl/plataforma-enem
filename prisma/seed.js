const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  // Limpar dados existentes para evitar duplicatas e inconsistências no novo schema
  await prisma.progress.deleteMany({});
  await prisma.dailyChallenge.deleteMany({}); // Adicionado para limpeza total
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

    // 2. Criar Quiz (Desafio Master)
    const quiz = await prisma.quiz.create({
      data: {
        title: `Desafio Master ${subject.name}`,
        description: `Teste seus conhecimentos sobre ${subject.name} (Módulo 1).`,
        subjectId: subject.id,
      }
    });

    // 3. Adicionar 5 Questões por Matéria (Banco Sênior)
    const subjectQuestions = {
      matematica: [
        { text: "Se um conjunto A tem 3 elementos e o conjunto B tem 4 elementos, quantas funções de A em B existem?", options: ["12", "64", "81", "7"], correct: 2 },
        { text: "Qual a área de um círculo com raio 5 cm? (Use π ≈ 3)", options: ["15", "75", "150", "225"], correct: 1 },
        { text: "Em um mapa de escala 1:100.000, 5 cm representam qual distância real?", options: ["5 km", "50 km", "500 km", "0,5 km"], correct: 0 },
        { text: "A probabilidade de sair um número par no lançamento de um dado comum é:", options: ["1/6", "1/3", "1/2", "2/3"], correct: 2 },
        { text: "A média aritmética entre os números 10, 20 e 60 é:", options: ["30", "45", "90", "15"], correct: 0 }
      ],
      biologia: [
        { text: "Qual organela é responsável pela respiração celular?", options: ["Ribossomo", "Mitocôndria", "Lisossomo", "Complexo de Golgi"], correct: 1 },
        { text: "O que define um organismo procarionte?", options: ["Ausência de núcleo", "Presença de mitocôndria", "Parede celular de quitina", "DNA linear"], correct: 0 },
        { text: "Na cadeia alimentar, os fungos e bactérias são classificados como:", options: ["Produtores", "Consumidores Primários", "Consumidores Terciários", "Decompositores"], correct: 3 },
        { text: "Qual base nitrogenada é exclusiva do RNA?", options: ["Timina", "Uracila", "Citosina", "Guanina"], correct: 1 },
        { text: "O cruzamento de dois heterozigotos (Aa x Aa) resulta em qual proporção fenotípica?", options: ["1:1", "3:1", "9:3:3:1", "2:1"], correct: 1 }
      ],
      fisica: [
        { text: "Qual a unidade de força no Sistema Internacional?", options: ["Joule", "Watt", "Newton", "Pascal"], correct: 2 },
        { text: "Um carro percorre 120 km em 2 horas. Qual sua velocidade média?", options: ["60 km/h", "70 km/h", "80 km/h", "100 km/h"], correct: 0 },
        { text: "A primeira lei de Newton também é conhecida como lei da:", options: ["Ação e Reação", "Gravitação", "Inércia", "Aceleração"], correct: 2 },
        { text: "Qual a fórmula da Segunda Lei de Newton?", options: ["E=mc²", "F = m.a", "V = d/t", "P = U.i"], correct: 1 },
        { text: "Em um circuito em série, a corrente elétrica é:", options: ["Diferente em cada resistor", "Igual em todos os pontos", "Sempre zero", "Inversamente proporcional"], correct: 1 }
      ],
      quimica: [
        { text: "O número atômico (Z) representa a quantidade de:", options: ["Nêutrons", "Elétrons", "Prótons", "Massa"], correct: 2 },
        { text: "Qual o tipo de ligação entre um metal e um não-metal?", options: ["Covalente", "Metálica", "Iônica", "Dipolo-induzido"], correct: 2 },
        { text: "O pH de uma solução neutra a 25°C é:", options: ["0", "7", "14", "1"], correct: 1 },
        { text: "Qual o elemento químico mais abundante no universo?", options: ["Oxigênio", "Hélio", "Hidrogênio", "Nitrôgenio"], correct: 2 },
        { text: "Misturas que apresentam apenas uma fase são chamadas de:", options: ["Heterogêneas", "Homogêneas", "Azeotrópicas", "Colóides"], correct: 1 }
      ],
      historia: [
        { text: "Quem proclamou a independência do Brasil?", options: ["D. Pedro II", "D. Pedro I", "Getúlio Vargas", "Tiradentes"], correct: 1 },
        { text: "O período conhecido como 'Estado Novo' foi liderado por:", options: ["Juscelino Kubitschek", "Castelo Branco", "Getúlio Vargas", "João Goulart"], correct: 2 },
        { text: "A Revolução Industrial teve início em qual país?", options: ["França", "Estados Unidos", "Alemanha", "Inglaterra"], correct: 3 },
        { text: "O Tratado de Tordesilhas dividiu as terras entre:", options: ["Brasil e Portugal", "Portugal e Espanha", "Inglaterra e França", "Espanha e Holanda"], correct: 1 },
        { text: "Qual evento marcou o início da Idade Moderna?", options: ["Queda de Constantinopla", "Revolução Francesa", "Descoberta do Brasil", "Primeira Guerra Mundial"], correct: 0 }
      ],
      geografia: [
        { text: "Qual o maior país em extensão territorial do mundo?", options: ["Canadá", "China", "Estados Unidos", "Rússia"], correct: 3 },
        { text: "O processo de crescimento das cidades em relação ao campo é:", options: ["Êxodo rural", "Gentrificação", "Urbanização", "Metropolização"], correct: 2 },
        { text: "Qual camada da atmosfera contém a camada de ozônio?", options: ["Troposfera", "Estratosfera", "Mesosfera", "Exosfera"], correct: 1 },
        { text: "A linha imaginária que divide a Terra em Norte e Sul é:", options: ["Meridiano de Greenwich", "Trópico de Câncer", "Equador", "Círculo Polar Ártico"], correct: 2 },
        { text: "Qual bioma brasileiro é conhecido como 'Savana brasileira'?", options: ["Caatinga", "Cerrado", "Pampas", "Pantanal"], correct: 1 }
      ]
    };

    const questionsMap = subjectQuestions[subject.slug] || [
      { text: `Questão 1 de ${subject.name}`, options: ["Opção A", "Opção B", "Opção C", "Opção D"], correct: 0 },
      { text: `Questão 2 de ${subject.name}`, options: ["Opção A", "Opção B", "Opção C", "Opção D"], correct: 1 },
      { text: `Questão 3 de ${subject.name}`, options: ["Opção A", "Opção B", "Opção C", "Opção D"], correct: 2 },
      { text: `Questão 4 de ${subject.name}`, options: ["Opção A", "Opção B", "Opção C", "Opção D"], correct: 3 },
      { text: `Questão 5 de ${subject.name}`, options: ["Opção A", "Opção B", "Opção C", "Opção D"], correct: 0 }
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
