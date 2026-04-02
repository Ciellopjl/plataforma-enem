import pkg from "@prisma/client";
const { PrismaClient } = pkg;
import { Pool } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";

const neonPool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaNeon(neonPool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🛠️  Iniciando Grande Sincronização Sênior de Conteúdo...");

  const curriculum = {
    "portugues": [
      { t: "Interpretação de Texto", v: "XsN0e_xPyNI" },
      { t: "Figuras de Linguagem", v: "zTe7izGQ8-4" },
      { t: "Coesão e Coerência", v: "cHcFDNkxpmQ" }
    ],
    "literatura": [
      { t: "Escolas Literárias (Linha do Tempo)", v: "7I7GnGRqnao" },
      { t: "Modernismo no Brasil", v: "FEx0rIcWhGY" },
      { t: "Interpretação de Obras Literárias", v: "Vgxf4eDSADM" }
    ],
    "ingles": [
      { t: "Interpretação de Texto (Técnicas)", v: "C-Mc6SlvrfM" },
      { t: "Vocabulário (Top 100)", v: "XVUA2dhP4tY" },
      { t: "Falsos Cognatos (Fake Friends)", v: "Tz5WW3xPzqY" }
    ],
    "espanhol": [
      { t: "Interpretação de Texto (Técnicas)", v: "C-Mc6SlvrfM" }, // Reutilizando técnicas se necessário
      { t: "Vocabulário Essencial", v: "XVUA2dhP4tY" },
      { t: "Falsos Cognatos", v: "Tz5WW3xPzqY" }
    ],
    "artes": [
      { t: "Movimentos Artísticos", v: "SEyhdqLQ6lA" },
      { t: "Arte Moderna no Brasil", v: "WSoTmWM-wTk" },
      { t: "Arte Contemporânea", v: "EH0x6Yw410g" }
    ],
    "educacao-fisica": [
      { t: "Saúde e Qualidade de Vida", v: "v4M6eGjl_qI" },
      { t: "Esportes (Conceitos)", v: "8I7bCqcqGJM" },
      { t: "Corpo e Movimento", v: "g8evlnwbnmE" }
    ],
    "tecnologias": [
      { t: "Tecnologia e Sociedade", v: "MHTd7PuIGZY" },
      { t: "Cultura Digital", v: "DQrmTmw3WT0" },
      { t: "Impactos Tecnológicos", v: "QRHY7aHHHlE" }
    ],
    "redacao": [
      { t: "Estrutura Dissertativa", v: "CjUCTZstyK8" },
      { t: "Como Argumentar", v: "nEImAvz96EI" },
      { t: "Proposta de Intervenção Nota 1000", v: "1mlMoLJpZmM" },
      { t: "Os 5 Elementos da Conclusão", v: "zU0sC6SeJz8" }
    ],
    "historia": [
      { t: "História do Brasil (Resumo)", v: "jq3LBXYLZWY" },
      { t: "Revoluções (Industrial/Francesa)", v: "I8Z-dAb_P9U" },
      { t: "Guerras Mundiais (I e II)", v: "f-f7N9IIDp0" }
    ],
    "geografia": [
      { t: "Globalização", v: "7u0G_W3vL60" },
      { t: "Meio Ambiente", v: "LqU9p2Z_E5M" },
      { t: "Geopolítica Mundial", v: "L-3f2N90l_U" }
    ],
    "filosofia": [
      { t: "Filosofia Clássica", v: "XshFshLREzQ" },
      { t: "Ética e Política", v: "3S36fGshxM0" }
    ],
    "sociologia": [
      { t: "Desigualdade Social e Capitalismo", v: "Yf0X-y_xS-U" }
    ],
    "biologia": [
      { t: "Ecologia (Cadeias e Ciclos)", v: "itfC8uH8M7M" },
      { t: "Genética e DNA", v: "7O0H-1tZl-k" },
      { t: "Corpo Humano (Sistemas)", v: "p4vI_O2-k6M" }
    ],
    "quimica": [
      { t: "Reações Químicas", v: "Gk7MvT0_m-U" },
      { t: "pH e Equilíbrio", v: "b0V0V-tI8-o" },
      { t: "Química Orgânica", v: "8V-w6F_L3nQ" }
    ],
    "fisica": [
      { t: "Cinemática (Velocidade Média)", v: "XshFshLREzQ" },
      { t: "MUV (Aceleração)", v: "FEx0rIcWhGY" },
      { t: "Energia Mecânica", v: "itfC8uH8M7M" },
      { t: "Trabalho e Potência", v: "Gk7MvT0_m-U" }
    ]
  };

  for (const [slug, lessons] of Object.entries(curriculum)) {
    const subject = await prisma.subject.findUnique({ where: { slug } });
    if (!subject) {
      console.warn(`⚠️ Matéria ignorada: ${slug}`);
      continue;
    }

    console.log(`📦 Sincronizando: ${subject.name}...`);
    
    // Resetar trilha da matéria (Mantendo Matemática intacta pois não está na lista 'curriculum')
    await prisma.lesson.deleteMany({ where: { subjectId: subject.id } });

    for (const [index, lesson] of lessons.entries()) {
      console.log(`  └─ Tema: ${lesson.t}`);
      await prisma.lesson.create({
        data: {
          title: lesson.t,
          videoUrl: `https://www.youtube.com/embed/${lesson.v}`,
          content: `### Roteiro Sênior: ${lesson.t}\nEsta aula faz parte da curadoria exclusiva do ENEM 2026. Assista ao vídeo focado e utilize os conceitos para resolver questões de provas anteriores.`,
          order: index + 1,
          subjectId: subject.id
        }
      });
    }
  }

  console.log("\n✅ PLATAFORMA 100% POPULADA! 🚀💎✨");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
