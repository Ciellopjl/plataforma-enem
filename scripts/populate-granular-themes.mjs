import pkg from "@prisma/client";
const { PrismaClient } = pkg;
import { Pool } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";

const neonPool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaNeon(neonPool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🛠️  Sincronizando Temas Específicos do Currículo Sênior...");

  const curriculumData = [
    {
      subjectSlug: "portugues",
      themes: ["Interpretação de texto", "Figuras de linguagem", "Coesão e coerência"]
    },
    {
      subjectSlug: "literatura",
      themes: ["Escolas literárias", "Modernismo", "Interpretação de obras"]
    },
    {
      subjectSlug: "ingles",
      themes: ["Interpretação de texto", "Vocabulário", "Falsos cognatos"]
    },
    {
      subjectSlug: "espanhol",
      themes: ["Interpretação de texto", "Vocabulário básico", "Gramática instrumental"]
    },
    {
      subjectSlug: "artes",
      themes: ["Movimentos artísticos", "Arte brasileira", "Arte contemporânea"]
    },
    {
      subjectSlug: "educacao-fisica",
      themes: ["Saúde e qualidade de vida", "Esportes", "Corpo e movimento"]
    },
    {
      subjectSlug: "tecnologias",
      themes: ["Tecnologia e sociedade", "Cultura digital", "Impactos tecnológicos"]
    },
    {
      subjectSlug: "redacao",
      themes: ["Estrutura dissertativa", "Argumentação", "Proposta de intervenção"]
    },
    {
      subjectSlug: "historia",
      themes: ["História do Brasil", "Revoluções", "Guerras mundiais"]
    },
    {
      subjectSlug: "geografia",
      themes: ["Globalização", "Meio ambiente", "Geopolítica"]
    },
    {
      subjectSlug: "filosofia",
      themes: ["Ética", "Política", "Filosofia clássica"]
    },
    {
      subjectSlug: "sociologia",
      themes: ["Sociedade", "Desigualdade social", "Capitalismo"]
    },
    {
      subjectSlug: "biologia",
      themes: ["Ecologia", "Genética", "Corpo humano"]
    },
    {
      subjectSlug: "quimica",
      themes: ["Reações químicas", "pH", "Química orgânica"]
    },
    {
      subjectSlug: "fisica",
      themes: ["Movimento (cinemática)", "Energia", "Eletricidade"]
    }
  ];

  for (const data of curriculumData) {
    const subject = await prisma.subject.findUnique({ where: { slug: data.subjectSlug } });
    
    if (!subject) {
      console.warn(`⚠️ Matéria não encontrada: ${data.subjectSlug}`);
      continue;
    }

    console.log(`📦 Processando: ${subject.name}...`);

    // Limpar as aulas de "Boas-vindas" genéricas para inserir os temas reais
    await prisma.lesson.deleteMany({
      where: { 
        subjectId: subject.id,
        title: { startsWith: "Boas-vindas" }
      }
    });

    for (const [index, theme] of data.themes.entries()) {
      // Verifica se já existe para evitar duplicatas
      const existing = await prisma.lesson.findFirst({
        where: { title: theme, subjectId: subject.id }
      });

      if (!existing) {
        console.log(`  └─ Tema: ${theme}`);
        await prisma.lesson.create({
          data: {
            title: theme,
            content: `### Roteiro Sênior: ${theme}\nEste tema é um dos pilares do ENEM em ${subject.name}. Concentre-se nos conceitos básicos e na resolução de exercícios práticos.`,
            order: index + 1,
            subjectId: subject.id,
            videoUrl: "" // Aguardando os links do mestre
          }
        });
      }
    }
  }

  console.log("\n✅ Currículo Sênior Sincronizado com Sucesso! 🚀💎✨");
}

main()
  .catch((e) => {
    console.error("❌ Erro na sincronização:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
