"use server";

import { auth } from "@/lib/auth";
import { getChatModel } from "@/lib/ai-service";
import { generateText } from "ai";
import { logActivity } from "@/lib/logger";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function calculateEssayScore(text: string) {
  // Sênior: Forçar o carregamento da sessão dentro da requisição asíncrona da Action
  let session;
  try {
    session = await auth();
  } catch (e: any) {
    console.error("[AUTH ERROR] Falha ao ler headers da sessão:", e.message);
    throw new Error("Sessão inválida ou erro de headers. Refaça o login.");
  }

  if (!session?.user) throw new Error("Não autorizado");
  const userId = (session.user as any).id;

  const systemPrompt = `Você é um avaliador de redação do ENEM de alto desempenho, focado em identificar a excelência humana e o domínio técnico.

SEU OBJETIVO:
- Avaliar as 5 competências com o máximo critério técnico (0 a 200 pontos cada).
- Identificar "Marcas de Autoria": opiniões articuladas, repertórios socioculturais originais e projeto de texto estratégico.
- Se o texto for excelente (Nota 1000), considere-o autenticamente humano, mesmo que a estrutura seja impecável.

Regras de Saída (Obrigatório):
Retorne APENAS um objeto JSON válido.
{
  "c1": { "score": number, "explanation": "string" },
  "c2": { "score": number, "explanation": "string" },
  "c3": { "score": number, "explanation": "string" },
  "c4": { "score": number, "explanation": "string" },
  "c5": { "score": number, "explanation": "string" },
  "total": number,
  "feedback": "Feedback pedagógico de alto nível (string)",
  "structure": {
    "intro": "Análise da tese e contextualização (string)",
    "dev": "Análise da argumentação e repertório (string)",
    "conc": "Análise da Proposta de Intervenção com os 5 elementos (string)"
  },
  "aiProbability": number (0-100 onde 100 é TOTALMENTE HUMANO),
  "aiReason": "Explique as marcas de autoria ou padrões de excelência humana encontrados (string)"
}`;

  const prompt = `Analise esta redação sob a ótica de um corretor nota 1000 do ENEM:
  
  Texto:
  ${text}
  
  Lembre-se: Valorize a voz do aluno e o repertório sociocultural original.`;

  try {
    const { askAI } = await import("@/lib/ai-service");
    
    console.log(`[REDACAO] Iniciando análise de texto (${text.length} caracteres)...`);
    const startTime = Date.now();
    
    const { text: responseText } = await askAI(
      prompt,
      systemPrompt,
      "redacao"
    );

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`[REDACAO] Resposta da IA recebida em ${duration}s`);

    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    const cleanJson = jsonMatch ? jsonMatch[0] : responseText;
    
    let data;
    try {
      data = JSON.parse(cleanJson);
    } catch (parseError) {
      console.error("[AI PARSE ERROR] Conteúdo bruto da IA:", responseText);
      throw new Error("A IA gerou um formato inválido. Isso pode acontecer se o texto for muito complexo ou violar diretrizes.");
    }
    
    // GALAXY BRAIN: Validação de Estrutura (Padrão Sênior)
    const finalData = {
      total: data.total || 0,
      feedback: data.feedback || "Análise concluída com sucesso.",
      structure: data.structure || { intro: "", dev: "", conc: "" },
      c1: { score: data.c1?.score ?? 0, explanation: data.c1?.explanation || "Sem observações específicas." },
      c2: { score: data.c2?.score ?? 0, explanation: data.c2?.explanation || "Sem observações específicas." },
      c3: { score: data.c3?.score ?? 0, explanation: data.c3?.explanation || "Sem observações específicas." },
      c4: { score: data.c4?.score ?? 0, explanation: data.c4?.explanation || "Sem observações específicas." },
      c5: { score: data.c5?.score ?? 0, explanation: data.c5?.explanation || "Sem observações específicas." },
      aiProbability: data.aiProbability ?? 100,
      aiReason: data.aiReason || "Grok: Texto analisado sob critérios de autoria humana.",
    };
    
    console.log(`[REDACAO] Salvando resultado no banco... (Nota: ${finalData.total})`);

    // PERSISTÊNCIA SÊNIOR: Salvar no Banco de Dados
    const savedEssay = await prisma.essay.create({
      data: {
        userId,
        content: text,
        score: finalData.total,
        feedback: finalData.feedback,
        c1: finalData.c1.score,
        c2: finalData.c2.score,
        c3: finalData.c3.score,
        c4: finalData.c4.score,
        c5: finalData.c5.score,
        aiProbability: finalData.aiProbability,
        aiReason: finalData.aiReason,
      }
    });

    // MONITORAMENTO SÊNIOR: Registrar no Log de Atividades 🕵️‍♂️📈🚀
    await logActivity(
      "Corrigiu Redação", 
      `Nota Final: ${finalData.total} | Humano: ${finalData.aiProbability}%`
    );

    // Recompensa Sênior: Ganhar pontos por estudar redação ⚡🏆
    await prisma.user.update({
      where: { id: userId },
      data: {
        points: { increment: 100 },
        totalPoints: { increment: 100 }
      }
    });

    revalidatePath("/ranking");
    revalidatePath("/analise");
    revalidatePath("/redacao");
    
    return { ...finalData, id: savedEssay.id };
  } catch (err: any) {
    console.error("[ACTIONS ERROR] Falha crítica na correção:", err.message);
    throw new Error(err.message.includes("Não autorizado") 
      ? "Sessão expirada. Refaça o login." 
      : `${err.message}`
    );
  }
}

export async function getEssayHistory() {
  console.log("[DEBUG] getEssayHistory: Tentando carregar sessão...");
  let session;
  try {
    session = await auth();
  } catch (e: any) {
    console.error("[AUTH ERROR] getEssayHistory falhou:", e.message);
    throw new Error("headers inside getEssayHistory failed");
  }

  if (!session?.user) throw new Error("Não autorizado");
  
  return prisma.essay.findMany({
    where: { userId: (session.user as any).id },
    orderBy: { createdAt: "desc" }
  });
}
