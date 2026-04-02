"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getChatModel } from "@/lib/ai-service";
import { generateText } from "ai";

export async function generateStudyPlan() {
  const session = await auth();
  if (!session?.user) throw new Error("Não autorizado");

  const userId = (session.user as any).id;

  // 1. Pegar histórico de desempenho do usuário
  const history = await prisma.dailyChallenge.findMany({
    where: { userId, completed: true },
    include: { quiz: { include: { subject: true } } },
    orderBy: { date: "desc" },
    take: 15
  });

  // 2. Extrair pontos fracos
  const subjectScores: Record<string, { total: number; score: number }> = {};
  history.forEach(h => {
    const s = h.quiz?.subject?.name;
    if (!s) return;
    if (!subjectScores[s]) subjectScores[s] = { total: 0, score: 0 };
    subjectScores[s].total += 100;
    subjectScores[s].score += h.score || 0;
  });

  const performanceSummary = Object.entries(subjectScores)
    .map(([name, stats]) => `${name}: ${Math.round((stats.score / stats.total) * 100)}% de aproveitamento`)
    .join(", ");

  const systemPrompt = `Você é um mentor de estudos sênior para o ENEM. 
Baseado no desempenho do aluno: ${performanceSummary || "Nenhum dado ainda — o aluno está começando."}

Crie um PLANO DE ESTUDOS SEMANAL (Segunda a Domingo).
Foque mais tempo nas matérias onde o aproveitamento é menor.
Para cada dia, sugira 2 matérias e um foco específico.

Regras de Saída (Obrigatório):
Retorne APENAS um JSON válido.
{
  "plan": [
    { "day": "Segunda-feira", "subjects": ["Matéria 1", "Matéria 2"], "focus": "Descrição curta do foco do dia" },
    ... até Domingo
  ],
  "advice": "Um conselho motivacional curto e direto de mentor."
}`;

  try {
    const { askAI } = await import("@/lib/ai-service");
    const { text: responseText } = await askAI(
      "Gere meu próximo plano de estudos semanal.",
      systemPrompt,
      "chat"
    );

    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    const cleanJson = jsonMatch ? jsonMatch[0] : responseText;
    const data = JSON.parse(cleanJson);
    
    return data;
  } catch (err) {
    console.error("Erro na geração do plano Groq/Grok, usando Fallback Sênior:", err);
    
    // Tratamento de Erro Definitivo: Garantir que a plataforma NUNCA quebre
    return {
      plan: [
        { day: "Segunda-feira", subjects: ["Matemática", "Natureza"], focus: "Revise Operações Básicas e Cinemática (Módulo 1)" },
        { day: "Terça-feira", subjects: ["Humanas", "Linguagens"], focus: "História do Brasil Império e Interpretação de Texto" },
        { day: "Quarta-feira", subjects: ["Matemática", "Redação"], focus: "Funções de 1º Grau e Prática de Introdução Nota 1000" },
        { day: "Quinta-feira", subjects: ["Natureza", "Humanas"], focus: "Ecologia e Geografia Agrária" },
        { day: "Sexta-feira", subjects: ["Linguagens", "Redação"], focus: "Figuras de Linguagem e Competência 3 da Redação" },
        { day: "Sábado", subjects: ["Revisão Geral", "Simulado"], focus: "Refaça questões erradas da semana e inicie simulado" },
        { day: "Domingo", subjects: ["Descanso", "Plano"], focus: "Recarregue suas energias e organize a mentoria da próxima semana" }
      ],
      advice: "Não se preocupe se o Mentor IA demorar ou falhar. Aqui está um cronograma estratégico montado pelos nossos professores para garantir que você não perca tempo!"
    };
  }
}
