import { createGroq } from "@ai-sdk/groq";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";

/**
 * Mestre ENEM - Serviço de IA DEFINITIVO (Padrão Sênior)
 * Arquitetura de Alta Disponibilidade: Groq (Primário) -> Gemini (Fallback)
 */

const getGroqInstance = () => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY ausente");

  return createGroq({
    apiKey,
  });
};

const getGeminiInstance = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY ausente");

  return createGoogleGenerativeAI({
    apiKey,
  });
};

export const getChatModel = (useFallback = false) => {
  if (useFallback) {
    return getGeminiInstance()("gemini-1.5-flash");
  }
  
  return getGroqInstance()("llama-3.3-70b-versatile");
};

export const getQuizModel = (useFallback = false) => {
  if (useFallback) {
    return getGeminiInstance()("gemini-1.5-flash");
  }

  return getGroqInstance()("llama-3.1-8b-instant");
};

/**
 * Mestre ENEM - Configuração de Elite: Auditor de Redações (Pós-Sênior)
 * Especializado em Detectar Padrões de IAs (GPT, Gemini, Claude)
 * 🔬 Analisa: Perplexidade, Simetria, Conectivos Clicheados e Estrutura TRI.
 */

export const REDACAO_AUDITOR_SYSTEM_PROMPT = `Você é o "Avaliador Sênior Mestre ENEM". Sua função é fornecer uma análise técnica e criteriosa de redações, garantindo que o aluno receba um feedback realista do nível do ENEM.

DIRETRIZES DE ANÁLISE:
- Identifique se o texto segue uma estrutura "padrão de manual" (muito comum em IAs) ou se demonstra um repertório sociocultural autêntico e bem relacionado.
- Procure por marcas de autoria: uso de dados específicos, exemplos do cotidiano e uma voz argumentativa fluida.
- Marcas de Automação: Esteja atento a conectivos excessivamente formais usados de forma repetitiva, mas considere que bons alunos também estudam esses conectivos.

FORMATO DE RESPOSTA (Obrigatório):
- SCORE DE AUTENTICIDADE: [0-100]% (Onde 100% é um texto com forte marca de autoria humana).
- DIAGNÓSTICO: (Breve resumo técnico sobre a fluidez e originalidade do texto).
- ANÁLISE TÉCNICA: (Destaque pontos positivos de estilo ou sinais de estruturação mecânica).
- DICA PEDAGÓGICA: (Como tornar a argumentação mais pessoal, profunda e convincente).

Seja o "treinador rigoroso" que desafia o aluno a ser melhor que uma IA.`;

export const getRedacaoDetectiveModel = (useFallback = false) => {
  if (useFallback) {
    return getGeminiInstance()("gemini-1.5-flash");
  }
  return getGroqInstance()("llama-3.3-70b-versatile");
};

export async function askAI(
  prompt: string, 
  system: string, 
  type: "chat" | "quiz" | "redacao" = "chat",
  messages?: any[] // Histórico opcional
) {
  const activeSystem = system || (type === "redacao" ? REDACAO_AUDITOR_SYSTEM_PROMPT : "");
  
  const getCallArgs = (model: any) => ({
    model,
    system: activeSystem,
    temperature: type === "redacao" ? 0.3 : 0.7,
    ...(messages ? { messages } : { prompt })
  });

  try {
    const model = type === "chat" ? getChatModel() : type === "redacao" ? getRedacaoDetectiveModel() : getQuizModel();
    return await generateText(getCallArgs(model) as any);
  } catch (error: any) {
    console.error(`[AI ERROR] Falha no modelo primário (${type}): ${error.message}. Tentando fallback Gemini...`);
    
    try {
      const fallbackModel = type === "chat" ? getChatModel(true) : type === "redacao" ? getRedacaoDetectiveModel(true) : getQuizModel(true);
      return await generateText(getCallArgs(fallbackModel) as any);
    } catch (fallbackError) {
      throw fallbackError;
    }
  }
}
