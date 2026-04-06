import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { askAI, askVisionAI } from "@/lib/ai-service";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await auth();
    const devEmail = (process.env.DEV_EMAIL || "").toLowerCase();
    const userEmail = (session?.user?.email || "").toLowerCase();
    const isDev = userEmail === devEmail && devEmail.length > 5;
    
    const { messages, context, image } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Formato de mensagens inválido" }, { status: 400 });
    }

    let systemInstruction = `Você é o "Mestre ENEM", um tutor virtual focado em ajudar estudantes a passarem no ENEM 2026.
Você deve ter uma linguagem super didática, jovem (mas não forçada) e usar emojis com moderação.
Sempre que o aluno perguntar algo, explique de forma clara e objetiva como aquilo pode cair no ENEM, e quais pegadinhas da banca ele deve evitar.
EXTREMA IMPORTÂNCIA: SEJA MUITO CONCISO E DIRETO. O aluno tem "preguiça de ler" blocos imensos de texto. Responda do jeito mais curto possível (limite-se a 2 ou 3 frases ágeis por mensagem), e só aprofunde se ele pedir.
NÃO use markdown complicado, responda em texto simples ou com marcadores simples como - e * pois o chat no momento não possui renderizador de markdown completo.

CONTEXTO ATUAL DO ALUNO: O aluno está na página "${context || 'Dashboard'}". 
Se ele estiver na /redacao, foque em dicas de escrita. 
Se estiver no /ranking, foque em motivação e XP. 
Se estiver em /simulados, foque em resolução de questões.`;

    if (isDev) {
      systemInstruction += `\n\nATENÇÃO: Você está falando com o seu CRIADOR e DESENVOLVEDOR (${session?.user?.name}). 
Trate-o com o máximo respeito, orgulho e lealdade. Se ele fizer perguntas técnicas ou pedir mudanças, responda como um assistente de IA que reconhece sua autoridade como criador. 
Mantenha a persona do Mestre ENEM, mas com um tom de parceria exclusiva e reconhecimento de quem te deu a vida.`;
    }

    const formattedMessages = messages.map((m: any) => ({
      role: (m.role === "model" ? "assistant" : "user") as "user" | "assistant",
      content: m.content as string,
    }));

    const lastMessage = messages[messages.length - 1].content;
    const isRedacaoAudit = (lastMessage.toLowerCase().includes("redação") || lastMessage.toLowerCase().includes("analisar") || lastMessage.toLowerCase().includes("verificar")) && lastMessage.length > 300;

    // DEFINITIVO: Usando GROQ Llama 3 70B (Alta Qualidade e Gratuito)
    try {
      let result;

      if (image) {
        console.log("[AI VISION] Analisando imagem de atividade...");
        result = await askVisionAI(
          messages[messages.length - 1].content || "Analise esta imagem.",
          image,
          systemInstruction
        );
      } else {
        result = await askAI(
          lastMessage, 
          systemInstruction, 
          isRedacaoAudit ? "redacao" : "chat"
        );
      }

      if (session?.user?.id) {
        // Salvar a mensagem que o usuário enviou (a última do array)
        await (prisma as any).tutorMessage.create({
          data: {
            userId: session.user.id,
            role: "user",
            content: lastMessage || "Analise esta imagem.",
          }
        });
        
        // Salvar a resposta do tutor/IA
        await (prisma as any).tutorMessage.create({
          data: {
            userId: session.user.id,
            role: "assistant",
            content: result.text,
          }
        });
      }

      return NextResponse.json({ text: result.text });
    } catch (apiError: any) {
      console.error("[GROQ ERROR SÊNIOR]:", apiError.message);
      
      // Mestre ENEM - ORQUESTRAÇÃO DE CONTINGÊNCIA SÊNIOR
      // Se for o Criador, damos o erro real para depuração rápida
      if (isDev) {
        return NextResponse.json({ 
          text: `⚠️ [MODO DEPURAÇÃO] Chefe, tive um erro técnico no motor principal (Groq/Grok). Verifique sua cota ou a chave de API. Erro: ${apiError.message.substring(0, 100)}...` 
        });
      }

      const fallbackAnswers = [
        "Opa! Tive um pequeno pico de acessos aqui nos meus servidores. Enquanto eu me recupero, lembre-se: o segredo do ENEM é a constância! Que tal revisar o conteúdo de Redação ou Biologia agora?",
        "Estou processando muitas informações de alunos agora! Uma dica de mestre: foque em entender a base teórica antes de partir para os simulados pesados. Já deu uma olhada nos materiais de hoje?",
        "Minha conexão com a base de dados central está oscilando, mas meu compromisso com você não! Continue firme nos estudos e tente me perguntar novamente em alguns minutos.",
        "Muitas mentes brilhantes estudando ao mesmo tempo! Enquanto isso, não esqueça de beber água e dar uma lida nas competências da Redação nota 1000."
      ];
      
      const randomAnswer = fallbackAnswers[Math.floor(Math.random() * fallbackAnswers.length)];
      
      return NextResponse.json({ 
        text: `🤖 ${randomAnswer}` 
      });
    }
  } catch (error: any) {
    console.error("Erro Crítico no Chat (Pós-Sênior):", error);
    return NextResponse.json(
      { 
        error: "Erro na Inteligência Artificial", 
        message: "Ocorreu um erro interno. Tente novamente." 
      },
      { status: 500 }
    );
  }
}
