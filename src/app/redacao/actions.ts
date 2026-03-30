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
    const model = getChatModel(); // Definido como Llama 3.3 70B - O melhor para raciocínio denso
    const { text: responseText } = await generateText({
      model,
      system: systemPrompt,
      prompt: prompt,
      temperature: 0.2, // Precisão técnica
    });

    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    const cleanJson = jsonMatch ? jsonMatch[0] : responseText;
    const data = JSON.parse(cleanJson);
    
    // PERSISTÊNCIA SÊNIOR: Salvar no Banco de Dados
    const savedEssay = await prisma.essay.create({
      data: {
        userId,
        content: text,
        score: data.total,
        feedback: data.feedback,
        c1: data.c1.score,
        c2: data.c2.score,
        c3: data.c3.score,
        c4: data.c4.score,
        c5: data.c5.score,
        aiProbability: data.aiProbability,
        aiReason: data.aiReason,
      }
    });

    // Recompensa Sênior: Ganhar pontos por estudar redação (Limiar de 100XP)
    await prisma.user.update({
      where: { id: userId },
      data: {
        points: { increment: 100 },
        totalPoints: { increment: 100 }
      }
    });

    revalidatePath("/ranking");
    revalidatePath("/analise");
    
    return { ...data, id: savedEssay.id };
  } catch (err: any) {
    console.error("Erro na correção Sênior Groq:", err.message);
    throw new Error("Falha ao processar a correção da redação. Verifique a quota da IA.");
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
