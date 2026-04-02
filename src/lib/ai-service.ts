import { createGroq } from "@ai-sdk/groq";
import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";

/**
 * Mestre ENEM - Serviço de IA DEFINITIVO (Padrão Sênior)
 * Arquitetura de Alta Disponibilidade: Groq (Primário) -> Grok (Auditor/Fallback)
 */

const getGroqInstance = () => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY ausente no ambiente");

  return createGroq({
    apiKey,
  });
};

const getGrokInstance = () => {
  const apiKey = process.env.GROK_API_KEY;
  // Sênior: Se a chave estiver como placeholder, não tentamos a chamada
  if (!apiKey || apiKey.includes("Sua_Chave")) {
    throw new Error("GROK_API_KEY (xAI) não configurada corretamente no .env");
  }

  return createOpenAI({
    apiKey,
    baseURL: "https://api.x.ai/v1",
  });
};

export const getChatModel = (useFallback = false, modelType: "standard" | "versatile" = "versatile") => {
  if (useFallback) {
    return getGrokInstance()("grok-beta");
  }
  
  return getGroqInstance()(modelType === "versatile" ? "llama-3.3-70b-versatile" : "llama3-70b-8192");
};

export const getQuizModel = (useFallback = false) => {
  if (useFallback) {
    return getGrokInstance()("grok-beta");
  }

  return getGroqInstance()("llama-3.1-8b-instant");
};

export const getVisionModel = () => {
  return getGroqInstance()("llama-3.2-11b-vision-preview");
};

/**
 * Mestre ENEM - Configuração de Elite: Auditor de Redações (Pós-Sênior)
 * Especializado em Detectar Padrões de IAs e Análise Crítica do Grok.
 */

export const REDACAO_AUDITOR_SYSTEM_PROMPT = `Você é o "Coordenador de Banca ENEM Sênior". Sua missão é analisar a macro-estrutura dissertativa-argumentativa.

CRITÉRIOS DE EXCELÊNCIA:
1. INTRODUÇÃO: Deve conter a contextualização do tema e uma TESE clara (duas causas/problemas).
2. DESENVOLVIMENTO: Deve apresentar argumentos embasados em repertório sociocultural legitimado e produtivo.
3. CONCLUSÃO: Deve conter uma PROPOSTA DE INTERVENÇÃO com os 5 elementos (Agente, Ação, Meio/Modo, Efeito e Detalhamento).

DIRETRIZES DE AUDITORIA:
- Valorize "Marcas de Autoria": opiniões articuladas, repertórios socioculturais originais e projeto de texto estratégico.
- Não penalize o texto apenas por ser "perfeito demais" em sua estrutura (isso é esperado em Notas 1000).
- Se o texto demonstra senso crítico e uma proposta de intervenção detalhada, considere-o autenticamente humano.
- O objetivo é guiar o aluno rumo à excelência, não apenas caçar padrões de robô.`;

export const getRedacaoDetectiveModel = (useFallback = false) => {
  if (useFallback) {
    return getGrokInstance()("grok-beta");
  }
  return getGroqInstance()("llama-3.3-70b-versatile");
};

export async function askAI(
  prompt: string, 
  system: string, 
  type: "chat" | "quiz" | "redacao" = "chat",
  messages?: any[]
) {
  const activeSystem = system || (type === "redacao" ? REDACAO_AUDITOR_SYSTEM_PROMPT : "");
  
  const getCallArgs = (model: any) => ({
    model,
    system: activeSystem,
    temperature: type === "redacao" ? 0.3 : 0.7,
    maxTokens: 4000,
    ...(messages ? { messages } : { prompt })
  });

  // Sênior: Motor Primário (High Speed)
  try {
    console.log(`[AI INFO] Invocando Groq (Llama) primário para ${type}...`);
    const model = type === "chat" ? getChatModel() : type === "redacao" ? getRedacaoDetectiveModel() : getQuizModel();
    return await generateText(getCallArgs(model) as any);
  } catch (error: any) {
    console.error(`[AI ERROR] Falha no Groq Primário:`, error.message);
    
    // Fallback 1: Groq com modelo 70B padrão (menos Versátil, mais estável)
    try {
      console.log(`[AI INFO] Tentando Fallback 1: Groq Llama3-70b...`);
      const fallbackModel1 = getChatModel(false, "standard");
      return await generateText(getCallArgs(fallbackModel1) as any);
    } catch (f1Error: any) {
      console.error(`[AI ERROR] Falha no Fallback 1 (Groq Standard):`, f1Error.message);

      // Fallback 2: Grok (xAI) - O motor de Elite
      try {
        console.log(`[AI INFO] Tentando Fallback 2: Grok (xAI)...`);
        const fallbackModel2 = type === "chat" ? getChatModel(true) : type === "redacao" ? getRedacaoDetectiveModel(true) : getQuizModel(true);
        return await generateText(getCallArgs(fallbackModel2) as any);
      } catch (f2Error: any) {
        console.error(`[AI FATAL ERROR] Todos os modelos falharam.`);
        throw new Error(`Serviços de IA saturados. Erro: ${f2Error.message}`);
      }
    }
  }
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
    throw new Error(`O motor de visão falhou. Motivo: ${error.message}`);
  }
}
