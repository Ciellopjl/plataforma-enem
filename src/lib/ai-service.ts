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

export const getChatModel = (useFallback = false) => {
  if (useFallback) {
    return getGrokInstance()("grok-beta");
  }
  
  return getGroqInstance()("llama-3.3-70b-versatile");
};

export const getQuizModel = (useFallback = false) => {
  if (useFallback) {
    return getGrokInstance()("grok-beta");
  }

  return getGroqInstance()("llama-3.1-8b-instant");
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

  // Sênior: Restaurando o Groq (Llama 3.3) como motor primário pela alta velocidade
  try {
    console.log(`[AI INFO] Invocando Groq (Llama) como primário para ${type}...`);
    const model = type === "chat" ? getChatModel() : type === "redacao" ? getRedacaoDetectiveModel() : getQuizModel();
    return await generateText(getCallArgs(model) as any);
  } catch (error: any) {
    console.error(`[AI ERROR] Falha no Groq (Llama):`, error.message);
    
    try {
      console.log(`[AI INFO] Tentando fallback Grok (xAI) para ${type}...`);
      const fallbackModel = type === "chat" ? getChatModel(true) : type === "redacao" ? getRedacaoDetectiveModel(true) : getQuizModel(true);
      return await generateText(getCallArgs(fallbackModel) as any);
    } catch (fallbackError: any) {
      console.error(`[AI FATAL ERROR] Todos os modelos falharam.`);
      // Se a falha for falta de chave do Grok, damo uma dica clara
      if (fallbackError.message.includes("GROK_API_KEY")) {
        throw new Error("O servidor do Groq está instável e você ainda não configurou a chave do Grok (xAI) no seu .env para o backup definitivo.");
      }
      throw new Error(`Serviços de IA indisponíveis no momento. Verifique suas cotas e chaves de API.`);
    }
  }
}
