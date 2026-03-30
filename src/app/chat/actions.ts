"use server";

import { auth } from "@/lib/auth";
import { getChatModel } from "@/lib/ai-service";
import { generateText } from "ai";

export async function chatWithTeacher(subject: string, message: string, history: { role: string; content: string }[]) {
  const session = await auth();
  if (!session?.user) throw new Error("Não autorizado");

  const systemPrompt = `Você é um professor mentor sênior especialista em ${subject} para o ENEM. 
Seu objetivo é ajudar o aluno a entender conceitos, resolver dúvidas e dar dicas de estudo de alto nível.

DIRETRIZES:
- Seja didático, encorajador e direto. 
- Use Markdown para fórmulas ou tópicos.
- Mantenha as respostas focadas no conteúdo cobrado pelo ENEM.`;

  const messages = [
    ...history.map(h => ({
      role: (h.role === "model" ? "assistant" : "user") as "user" | "assistant",
      content: h.content as string,
    })),
    { role: "user" as const, content: message }
  ];

  try {
    const model = getChatModel(); // Usando Groq Llama 3 70B para mentoria didática
    const { text: responseText } = await generateText({
      model,
      system: systemPrompt,
      messages: messages,
      temperature: 0.7,
    });

    return { response: responseText };
  } catch (err) {
    console.error("Erro no chat por matéria (Groq):", err);
    return { response: "Desculpe, tive um problema ao processar sua dúvida técnico. Pode repetir a pergunta?" };
  }
}
