import { auth } from "@/lib/auth";
import { getChatModel } from "@/lib/ai-service";
import { generateText } from "ai";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function calculateEssayScore(text: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Não autorizado");
  const userId = (session.user as any).id;

  const systemPrompt = `Você é um avaliador de redação do ENEM de alto desempenho, focado em identificar a excelência humana e o domínio técnico.

SEU OBJETIVO:
- Avaliar as 5 competências com o máximo critério técnico (0 a 200 pontos cada).
- Identificar "Marcas de Autoria": uso de dados específicos, visão de mundo original e vocabulário preciso.
- Distinguir entre "Texto Robótico (Template)" e "Texto de Aluno Nota 1000 (Elite)".

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
  "aiProbability": number (0-100 onde 100 é TOTALMENTE HUMANO),
  "aiReason": "Destaque o que torna o texto autêntico ou onde ele parece mecânico (string)"
}`;

  const prompt = `Analise esta redação seguindo os critérios do ENEM 2026:
  
  Texto:
  ${text}
  
  Lembre-se: Verifique se há trapaça por IA (padrões robóticos, clichês de LLM, estrutura excessivamente simétrica).`;

  try {
    const { askAI } = await import("@/lib/ai-service");
    const { text: responseText } = await askAI(
      prompt,
      systemPrompt,
      "redacao"
    );

    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    const cleanJson = jsonMatch ? jsonMatch[0] : responseText;
    
    let data;
    try {
      data = JSON.parse(cleanJson);
    } catch (parseError) {
      console.error("[AI PARSE ERROR] Falha ao ler JSON da redação:", responseText);
      throw new Error("A IA retornou um formato inesperado. Tente novamente em alguns segundos.");
    }
    
    // GALAXY BRAIN: Validação de Estrutura (Padrão Sênior)
    const finalData = {
      total: data.total || 0,
      feedback: data.feedback || "Feedback não gerado.",
      c1: { score: data.c1?.score || 0, explanation: data.c1?.explanation || "" },
      c2: { score: data.c2?.score || 0, explanation: data.c2?.explanation || "" },
      c3: { score: data.c3?.score || 0, explanation: data.c3?.explanation || "" },
      c4: { score: data.c4?.score || 0, explanation: data.c4?.explanation || "" },
      c5: { score: data.c5?.score || 0, explanation: data.c5?.explanation || "" },
      aiProbability: data.aiProbability ?? 100,
      aiReason: data.aiReason || "Análise de autoria concluída.",
    };
    
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
    console.error("[ACTIONS ERROR] Erro na correção de redação:", err.message);
    throw new Error(err.message === "Não autorizado" 
      ? "Sua sessão expirou. Faça login novamente." 
      : `Falha na correção: ${err.message}`
    );
  }
}

export async function getEssayHistory() {
  const session = await auth();
  if (!session?.user) throw new Error("Não autorizado");
  
  return prisma.essay.findMany({
    where: { userId: (session.user as any).id },
    orderBy: { createdAt: "desc" }
  });
}
