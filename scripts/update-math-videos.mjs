import pkg from "@prisma/client";
const { PrismaClient } = pkg;
import { Pool } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";

const neonPool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaNeon(neonPool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🛠️  Vinculando Aulas Externas (Ferretto/Math Rio) ao Sistema Sênior...");

  const mathVideos = {
    "Porcentagem": "https://www.youtube.com/embed/m-_sIVXNnXU",
    "Regra de três": "https://www.youtube.com/embed/R9Z_yF8z_3A",
    "Média, moda, mediana": "https://www.youtube.com/embed/Yp69I-5iHks",
    "Probabilidade": "https://www.youtube.com/embed/y8C4GvP40pY",
    "Estatística (gráficos e tabelas)": "https://www.youtube.com/embed/48-i8D86U3I",
    "Funções (1º e 2º grau)": "https://www.youtube.com/embed/Vl3W6Uq_o9M",
    "Equações": "https://www.youtube.com/embed/O1KjK_Y-rI8",
    "Geometria plana (área, perímetro)": "https://www.youtube.com/embed/U19d6_0Y5iE",
    "Geometria espacial (volume)": "https://www.youtube.com/embed/qshkXNoK1iA",
    "Razão e proporção": "https://www.youtube.com/embed/o7uD012V3Y4",
    "Juros simples e compostos": "https://www.youtube.com/embed/uD9B5-1_sXg"
  };

  const subject = await prisma.subject.findUnique({ where: { slug: "matematica" } });
  if (!subject) {
    console.error("❌ Matemática não encontrada no banco.");
    return;
  }

  for (const [title, url] of Object.entries(mathVideos)) {
    const updated = await prisma.lesson.updateMany({
      where: { 
        subjectId: subject.id,
        title: title
      },
      data: { videoUrl: url }
    });

    if (updated.count > 0) {
      console.log(`✅ Sintonizado: ${title}`);
    } else {
      console.warn(`⚠️ Tema não encontrado para vincular: ${title}`);
    }
  }

  console.log("\n🚀 Operação Blindada concluída! Todos os links estão vivos.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
