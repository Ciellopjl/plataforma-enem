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
      { t: "Globalização", v: "4Bc3KVXJZzA" },
      { t: "Meio Ambiente (COP-30)", v: "7N2Ao6NsD5E" },
      { t: "Geopolítica Mundial", v: "VYfMr7FcDq0" }
    ],
    "filosofia": [
      { t: "Filosofia Clássica", v: "tlwQpiKg18M" },
      { t: "Ética (Aristóteles)", v: "FHF1HBpjLXw" }
    ],
    "sociologia": [
      { t: "Desigualdade Social", v: "zHMUzQhv9fM" }
    ],
    "biologia": [
      { t: "Ecologia (Cadeias e Ciclos)", v: "KKELP-3_Dlk" },
      { t: "Genética e DNA", v: "YjwYJHqxwFY" },
      { t: "Corpo Humano (Sistemas)", v: "gz9BSAnNjKE" }
    ],
    "quimica": [
      { t: "Reações Químicas", v: "VrUvy1N66U0" },
      { t: "pH e pOH", v: "8zIhO1eQDrs" },
      { t: "Química Orgânica", v: "fY8E1dhNGNc" }
    ],
    "fisica": [
      { t: "Cinemática (Velocidade Média)", v: "j0gBi-_zorg" },
      { t: "MUV (Aceleração)", v: "yJL7tU1ljpg" },
      { t: "Trabalho, Potência e Energia", v: "Ml_NyaV6oNk" }
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
