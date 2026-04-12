import { createGroq } from "@ai-sdk/groq";
import { createOpenAI } from "@ai-sdk/openai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";

/**
 * Mestre ENEM - Serviço de IA DEFINITIVO (Padrão Sênior)
 * Arquitetura de Alta Disponibilidade: Groq (Primário) -> Grok (Auditor/Fallback)
 */

const getGroqInstance = () => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || apiKey === "SUA_CHAVE_AQUI") return null;

  return createGroq({
    apiKey,
  });
};

const getGrokInstance = () => {
  const apiKey = process.env.GROK_API_KEY;
  if (!apiKey || apiKey.includes("Sua_Chave") || apiKey === "SUA_CHAVE_AQUI") return null;

  return createOpenAI({
    apiKey,
    baseURL: "https://api.x.ai/v1",
  });
};

const getGeminiInstance = () => {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "SUA_CHAVE_AQUI") return null;

  return createGoogleGenerativeAI({ apiKey });
};

/**
 * Mestre ENEM - Orquestrador Universal (High-Availability)
 * Prioridade: Grok-2 (Elite) -> Groq (Speed) -> Gemini (Stability)
 */
export const getChatModel = (provider: "grok" | "groq" | "gemini" = "grok") => {
  try {
    if (provider === "grok") {
      const grok = getGrokInstance();
      return grok ? grok("grok-2-latest") : null;
    }
    if (provider === "groq") {
      const groq = getGroqInstance();
      return groq ? groq("llama-3.3-70b-versatile") : null;
    }
    if (provider === "gemini") {
      const gemini = getGeminiInstance();
      return gemini ? gemini("gemini-1.5-flash") : null;
    }
  } catch (e) {
    return null;
  }
  return null;
};

export const getQuizModel = (provider: "grok" | "groq" = "grok") => {
  try {
    if (provider === "grok") {
      const grok = getGrokInstance();
      return grok ? grok("grok-2-latest") : null;
    }
    const groq = getGroqInstance();
    return groq ? groq("llama-3.1-8b-instant") : null;
  } catch (e) {
    return null;
  }
};

export async function askAI(
  prompt: string, 
  system: string, 
  type: "chat" | "quiz" | "redacao" = "chat",
  messages?: any[]
) {
  const activeSystem = system || (type === "redacao" ? REDACAO_AUDITOR_SYSTEM_PROMPT : "");
  
  const callArgs = {
    system: activeSystem,
    temperature: type === "redacao" ? 0.3 : 0.7,
    maxTokens: 4000,
    ...(messages ? { messages } : { prompt })
  };

  // Ordem de Explorao Serial (Failover Chain)
  const providers = ["grok", "groq", "gemini"] as const;

  for (const provider of providers) {
    try {
      const model = type === "quiz" ? getQuizModel(provider as any) : getChatModel(provider as any);
      if (!model) continue;

      console.log(`[AI ORCHESTRATOR] Tentando ${provider} para ${type}...`);
      const response = await generateText({
        model: model as any,
        ...callArgs
      });
      console.log(`[AI SUCCESS] Respondido por ${provider}`);
      return response;
    } catch (error: any) {
      console.error(`[AI FAIL] Provider ${provider} falhou: ${error.message}`);
      // Continua para o prximo provedor
    }
  }

  // Se todos os provedores falharem, lanamos o erro para os fallbacks offline nas rotas
  throw new Error("Todos os motores de IA esto indisponveis ou com chaves invlidas.");
}

/**
 * SCANNER DE ELITE - VALIDAÇÃO DE NOME
 * Analisa se o nome sugerido contém gírias de baixo calão, 
 * insinuações sexuais (saliência) ou duplo sentido ofensivo.
 */
export async function validateNameSafety(name: string): Promise<{ safe: boolean; reason?: string }> {
  const prompt = `Analise o seguinte nome de usuário para uma plataforma de estudos: "${name}".
  
  REGRAS RÍGIDAS DE MODERAÇÃO:
  1. Nomes com "duplo sentido" pornográfico ou sugestivo são PROIBIDOS.
  2. Palavrões, gírias de baixo calão ou insultos são PROIBIDOS.
  3. Alusões a órgãos sexuais ou atos obscenos são PROIBIDAS.
  4. Nomes de "memes" inofensivos são permitidos.
  
  RESPONDA APENAS EM FORMATO JSON:
  {
    "safe": true/false,
    "reason": "Explicação curta caso seja unsafe (em português)"
  }`;

  try {
    const { text } = await askAI(prompt, "Você é um moderador de nomes profissional e rigoroso.");
    
    // Sênior: Extração segura de JSON (caso a IA coloque markdown)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return { safe: true }; // Fallback seguro
    
    const result = JSON.parse(jsonMatch[0]);
    return { 
      safe: !!result.safe, 
      reason: result.reason || "Nome inapropriado detectado." 
    };
  } catch (error) {
    console.error("[AI SAFETY ERROR]:", error);
    return { safe: true }; // Em caso de erro na API, não travamos o cadastro (Fallback User Friendly)
  }
}

export async function askVisionAI(
  prompt: string,
  image: string, // Base64
  system: string
) {
  const visionSystem = `${system}\n\nREGRAS DE SEGURANÇA E PEDAGOGIA:
1. Se a imagem contiver qualquer conteúdo impróprio, obsceno ou não relacionado a estudos, RECUSE-SE a responder e peça ao aluno para focar no ENEM.
2. Identifique textos, fórmulas e gráficos na imagem.
3. Não dê apenas a resposta, explique o raciocínio pedagógico.`;

  try {
    // Sênior: Limpando o prefixo Base64 se existir (Data URL -> Raw Base64)
    const base64Data = image.includes("base64,") 
      ? image.split("base64,")[1] 
      : image;

    const model = getVisionModel();
    return await generateText({
      model,
      system: visionSystem,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt || "Analise esta atividade e me ajude a entender." },
            { type: "image", image: base64Data },
          ],
        },
      ],
      temperature: 0.5,
    });
  } catch (error: any) {
    console.error(`[VISION ERROR SÊNIOR]: ${error.message}`);
    
    // MODO SÊNIOR ABSOLUTO: Se o motor de visão estourar (API desativada, quota excedida, sem chave),
    // NUNCA derrubamos a UI. Acionamos o motor de texto (primário) para dar uma resposta humanizada e contextual!
    console.log("[AI INFO] Ativando Protocolo Sênior de Emergência: Respondendo via Modelo de Texto...");
    
    try {
      const fallbackModel = getChatModel();
      const fallbackSystem = `${system}\n\n[INSTRUÇÃO DE CONTINGÊNCIA]: Você acaba de receber uma solicitação com uma IMAGEM anexada, porém seu "Sensor Neural de Visão" está em manutenção técnica temporária.
O usuário digitou o seguinte ao enviar a foto: "${prompt || 'olha essa imagem'}".
Responda diretamente a isso com excelente humor. Diga claramente que seu "Sensor Ocular" está passando por um mega upgrade e não pôde ver a imagem, mas responda ao que ele escreveu da melhor maneira possível. Se ele falou de "rosto do desenvolvedor", reconheça seu criador com honras, mas brinque que no escuro não dá pra ver a beleza dele! Mantenha a imersão do Mestre ENEM.`;

      return await generateText({
        model: fallbackModel,
        system: fallbackSystem,
        prompt: prompt || "O que acha da foto?",
        temperature: 0.8,
      });
    } catch (fallbackError: any) {
        throw new Error(`Ambos os motores falharam. Motivo: ${fallbackError.message}`);
    }
  }
}
