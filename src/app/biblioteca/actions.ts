"use server";

import { auth } from "@/lib/auth";
import { getQuizModel } from "@/lib/ai-service";
import { generateText } from "ai";

export async function generateFlashcards(subject: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Não autorizado");

  const systemPrompt = `Você é um criador de materiais de estudo sênior para o ENEM. 
Gere 5 FLASHCARDS de revisão rápida sobre o tema fornecido.

ESTRUTURA DA RESPOSTA (Obrigatório):
Retorne APENAS um JSON válido.
{
  "flashcards": [
    { "front": "Conceito Curto", "back": "Explicação Direta" },
    ... total de 5
  ]
}`;

  const prompt = `Gere flashcards sobre: ${subject}.`;

  try {
    const model = getQuizModel();
    if (!model) throw new Error("Motor de IA Mestre indisponível.");
    
    const { text: responseText } = await generateText({
      model: model as any,
      system: systemPrompt,
      prompt: prompt,
      temperature: 0.7,
    });

    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    const cleanJson = jsonMatch ? jsonMatch[0] : responseText;
    const data = JSON.parse(cleanJson);
    
    return data;
  } catch (err) {
    console.error("Erro na geração de flashcards Groq:", err);
    throw new Error("Erro ao gerar flashcards.");
  }
}

export async function getResources() {
  const prisma = (await import("@/lib/prisma")).default;
  return await prisma.resource.findMany({
    orderBy: { createdAt: "desc" }
  });
}
