import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    console.log("[SEED] Iniciando popularização do banco de dados...");

    // 1. Matérias (Áreas do Conhecimento)
    const subjects = [
      { name: "Matemática", slug: "matematica", icon: "Calculator", color: "bg-red-500" },
      { name: "Linguagens", slug: "linguagens", icon: "BookA", color: "bg-blue-500" },
      { name: "Ciências da Natureza", slug: "natureza", icon: "FlaskConical", color: "bg-emerald-500" },
      { name: "Ciências Humanas", slug: "humanas", icon: "Globe", color: "bg-orange-500" },
    ];

    for (const s of subjects) {
      const exists = await prisma.subject.findUnique({ where: { slug: s.slug } });
      if (!exists) await prisma.subject.create({ data: s });
    }

    // 2. Simulados (Recursos)
    const simulados = [
      { id: "simuladominin1", title: "Mini-Simulado 1 (Diagnóstico)", link: "https://enem.inep.gov.br", type: "Simulados", category: "Geral", description: "Avaliação inicial para mapeamento de gaps. 20 questões inéditas do Mestre IA." },
      { id: "simuladominin2", title: "Simulado 2 (Matemática e Natureza)", link: "https://enem.inep.gov.br", type: "Simulados", category: "Exatas", description: "Pratique o segundo dia de prova com foco em velocidade de cálculo TRI." },
      { id: "simuladominin3", title: "Simulado 3 (Humanas e Linguagens)", link: "https://enem.inep.gov.br", type: "Simulados", category: "Humanas", description: "Treino intensivo de interpretação de texto e correntes sociológicas." },
    ];

    for (const simu of simulados) {
      const exists = await prisma.resource.findUnique({ where: { id: simu.id } });
      if (!exists) await prisma.resource.create({ data: simu });
    }

    // 3. Biblioteca (Drives / Apostilas)
    const files = [
      { id: "biblioteca_drive1", title: "Drive Oficial Mestre ENEM", link: "https://drive.google.com/drive/u/0/folders/1vW_3eI2_9yLSdwksJRQ2NRMyUlzepbVE", type: "Biblioteca", category: "Completo", description: "Acesso total ao repositório de PDFs, cronogramas e mapas mentais." },
      { id: "biblioteca_redacao", title: "Kit Redação Nota 1000", link: "https://drive.google.com", type: "Biblioteca", category: "Redação", description: "E-book com modelos prontos, repertórios coringas e alusões históricas." },
      { id: "biblioteca_form", title: "Formulário Descomplica Matemática", link: "https://drive.google.com", type: "Biblioteca", category: "Exatas", description: "Resumo de todas as fórmulas matemáticas que mais caem no ENEM." },
    ];

    for (const f of files) {
      const exists = await prisma.resource.findUnique({ where: { id: f.id } });
      if (!exists) await prisma.resource.create({ data: f });
    }

    // 4. Mock Users (Ranking)
    const mockUsers = [
      { email: "1lugar_mestre@test.com", name: "Gabriel Souza", points: 8750, role: "STUDENT", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Gabriel" },
      { email: "2lugar_mestre@test.com", name: "Lara Fernandes", points: 7420, role: "STUDENT", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lara" },
      { email: "3lugar_mestre@test.com", name: "Thiago P.", points: 6100, role: "STUDENT", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Thiago" },
      { email: "4lugar_mestre@test.com", name: "Marcos V.", points: 5800, role: "STUDENT", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Marcos" },
    ];

    const hashedPassword = await bcrypt.hash("123456", 10);

    for (const mu of mockUsers) {
      const exists = await prisma.user.findUnique({ where: { email: mu.email } });
      if (!exists) {
        await prisma.user.create({
          data: {
            email: mu.email,
            name: mu.name,
            password: hashedPassword,
            points: mu.points,
            totalPoints: mu.points,
            image: mu.image,
            role: "STUDENT",
          },
        });
      }
    }

    return NextResponse.json({ message: "Plataforma populada (Seeded) com sucesso!" });

  } catch (error: any) {
    console.error("[SEED ERROR]", error);
    return NextResponse.json({ error: "Erro ao popular o banco", details: error.stack || error.message }, { status: 500 });
  }
}
