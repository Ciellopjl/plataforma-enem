import pkg from "@prisma/client";
const { PrismaClient } = pkg;
import { Pool } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";

// Sênior HTTP Adapter para CLI (Ignorar bloqueio de porta 5432)
const neonPool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaNeon(neonPool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🚀 Iniciando Carga Sênior de Matérias e Temas ENEM...");

  const fullCurriculum = [
    {
      name: "Matemática",
      slug: "matematica",
      color: "bg-blue-600",
      icon: "Calculator",
      themes: [
        "Porcentagem",
        "Regra de três",
        "Média, moda, mediana",
        "Probabilidade",
        "Estatística (gráficos e tabelas)",
        "Funções (1º e 2º grau)",
        "Equações",
        "Geometria plana (área, perímetro)",
        "Geometria espacial (volume)",
        "Razão e proporção",
        "Juros simples e compostos"
      ]
    },
    {
      name: "Biologia",
      slug: "biologia",
      color: "bg-emerald-600",
      icon: "Dna",
      themes: [
        "Ecologia e Meio Ambiente",
        "Genética e DNA",
        "Citologia (Estudo das Células)",
        "Fisiologia Humana (Sistemas)",
        "Evolução das Espécies",
        "Botânica",
        "Bioenergética (Fotossíntese)"
      ]
    },
    {
      name: "Física",
      slug: "fisica",
      color: "bg-indigo-600",
      icon: "Zap",
      themes: [
        "Cinemática (Movimento)",
        "Dinâmica (Leis de Newton)",
        "Calorimetria e Termologia",
        "Óptica e Luz",
        "Ondulatória (Som e Ondas)",
        "Eletrodinâmica (Circuitos)",
        "Energia e Trabalho"
      ]
    },
    {
      name: "Química",
      slug: "quimica",
      color: "bg-teal-600",
      icon: "TestTube",
      themes: [
        "Química Geral (Atomística)",
        "Ligações Químicas",
        "Estequiometria (Cálculos)",
        "Química Orgânica (Cadeias)",
        "Eletroquímica (Pilhas)",
        "Termoquímica",
        "Química Ambiental"
      ]
    },
    {
      name: "História",
      slug: "historia",
      color: "bg-amber-700",
      icon: "History",
      themes: [
        "Brasil Colônia",
        "Brasil Império",
        "República e Era Vargas",
        "Ditadura Militar no Brasil",
        "História Geral: Revoluções Industriais",
        "Grandes Guerras Mundiais",
        "Civilizações Clássicas (Grécia/Roma)"
      ]
    },
    {
      name: "Geografia",
      slug: "geografia",
      color: "bg-green-700",
      icon: "Globe",
      themes: [
        "Geografia Física (Clima e Relevo)",
        "Urbanização e Cidades",
        "População e Demografia",
        "Agronegócio e Agricultura",
        "Geopolítica Mundial",
        "Meio Ambiente e Sustentabilidade",
        "Globalização"
      ]
    },
    {
      name: "Filosofia",
      slug: "filosofia",
      color: "bg-violet-700",
      icon: "Brain",
      themes: [
        "Ética e Moral",
        "Filosofia Política",
        "Filosofia Moderna (Descartes/Kant)",
        "Filosofia Grega (Socráticos)",
        "Teoria do Conhecimento"
      ]
    },
    {
      name: "Sociologia",
      slug: "sociologia",
      color: "bg-purple-700",
      icon: "Users",
      themes: [
        "Sociologia do Trabalho",
        "Cultura e Identidade",
        "Direitos Humanos e Cidadania",
        "Movimentos Sociais",
        "Clássicos da Sociologia"
      ]
    },
    {
      name: "Linguagens",
      slug: "linguagens",
      color: "bg-orange-600",
      icon: "Languages",
      themes: [
        "Interpretação de Textos",
        "Gêneros Textuais",
        "Gramática Aplicada",
        "Figuras de Linguagem",
        "Artes e Cultura"
      ]
    },
    {
      name: "Literatura",
      slug: "literatura",
      color: "bg-rose-700",
      icon: "Book",
      themes: [
        "Modernismo no Brasil",
        "Romantismo e Realismo",
        "Barroco e Arcadismo",
        "Literatura Contemporânea",
        "Vanguardas Europeias"
      ]
    },
    {
      name: "Redação",
      slug: "redacao",
      color: "bg-pink-600",
      icon: "PenTool",
      themes: [
        "Estrutura da Redação ENEM",
        "Repertório Sociocultural",
        "Proposta de Intervenção",
        "Competências Avaliadas",
        "Temas de Prática (Natureza)",
        "Temas de Prática (Humanas)"
      ]
    }
  ];

  for (const item of fullCurriculum) {
    console.log(`📦 Carregando: ${item.name}...`);
    
    // 1. Criar ou Atualizar a Matéria
    const subject = await prisma.subject.upsert({
      where: { slug: item.slug },
      update: { 
        name: item.name, 
        color: item.color, 
        icon: item.icon 
      },
      create: { 
        name: item.name, 
        slug: item.slug, 
        color: item.color, 
        icon: item.icon 
      },
    });

    // 2. Carregar Temas (Lessons)
    for (const [index, themeName] of item.themes.entries()) {
      // Verifica se já existe para não duplicar
      const existingLesson = await prisma.lesson.findFirst({
        where: { title: themeName, subjectId: subject.id }
      });

      if (!existingLesson) {
        console.log(`  └─ Tema: ${themeName}`);
        await prisma.lesson.create({
          data: {
            title: themeName,
            content: `### Roteiro de Estudos: ${themeName}\nAqui você encontrará os pontos principais cobrados no ENEM sobre este tema. Recomenda-se focar em resoluções de questões após a leitura base.`,
            order: index + 1,
            subjectId: subject.id,
          }
        });
      }
    }

    // 3. Garantir um Quiz Básico
    const basicQuiz = await prisma.quiz.findFirst({
        where: { subjectId: subject.id, isFinal: false }
    });

    if (!basicQuiz) {
        await prisma.quiz.create({
            data: {
                title: `Desafio Básico: ${item.name}`,
                description: `Teste seus conhecimentos base em todos os temas de ${item.name}.`,
                subjectId: subject.id,
            }
        });
    }
  }

  console.log("\n✅ Base de Conhecimento Expandida com Sucesso! 🚀💪✨");
}

main()
  .catch((e) => {
    console.error("❌ Erro durante a carga:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
