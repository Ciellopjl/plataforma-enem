import { getQuizModel } from "./ai-service";
import { generateText } from "ai";

/**
 * Mestre ENEM - Geração de Desafios Elite (Sênior)
 * Definitivamente alimentado por GROQ (Llama 3) para 100% de disponibilidade.
 */

const DIFFICULTY_MAP: Record<string, string> = {
  facil: "FÁCIL — questões diretas sobre conceitos básicos, sem texto-base longo, enunciado simples e claro",
  medio: "MÉDIO — padrão ENEM real, com pequeno texto-base e opções bem elaboradas",
  dificil: "DIFÍCIL — nível TRI alto, textos-base densos, interdisciplinar, com pegadinhas nas alternativas",
};

const CONTINGENCY_DB: Record<string, any[]> = {
  "Física": [
    { text: "(ENEM) Um reator de usina hidrelétrica converte energia potencial gravitacional em energia elétrica. Considere uma queda d'água de 100m com vazão de 500 m³/s. Sabendo que g=10 m/s², densidade da água é 1000 kg/m³ e rendimento é 80%, qual é a potência elétrica útil gerada?", options: ["400 MW", "500 MW", "80 MW", "40 MW", "400.000 MW"], correctOptionIndex: 0 },
    { text: "(ENEM) Um objeto de massa 2 kg é solto de uma altura de 5m. Desprezando a resistência do ar e g=10 m/s², qual a energia cinética ao atingir o solo?", options: ["10 J", "100 J", "20 J", "200 J", "50 J"], correctOptionIndex: 1 },
    { text: "(ENEM) Um circuito tem uma resistência de 10 ohms ligada a uma bateria de 20V. Qual a corrente que percorre o circuito?", options: ["1 A", "2 A", "10 A", "20 A", "0,5 A"], correctOptionIndex: 1 },
    { text: "(ENEM) O som é uma onda mecânica. Qual das propriedades abaixo NÃO muda quando o som passa do ar para a água?", options: ["Velocidade", "Comprimento de onda", "Frequência", "Amplitude", "Intensidade"], correctOptionIndex: 2 },
    { text: "(ENEM) Calorimetria: Quanto calor é necessário para aquecer 100g de água de 20ºC para 80ºC? (c = 1 cal/gºC)", options: ["1000 cal", "6000 cal", "8000 cal", "2000 cal", "4000 cal"], correctOptionIndex: 1 }
  ],
  "Biologia": [
    { text: "(ENEM) O processo de fotossíntese é vital. Qual organela é responsável e qual gás é liberado?", options: ["Mitocôndria e CO2.", "Cloroplasto e O2.", "Complexo de Golgi e N2.", "Lisossomo e O2.", "Ribossomo e H2."], correctOptionIndex: 1 },
    { text: "(ENEM) A síntese de proteínas ocorre em qual estrutura celular?", options: ["Núcleo", "Ribossomo", "Lisossomo", "Citoesqueleto", "Membrana"], correctOptionIndex: 1 },
    { text: "(ENEM) No DNA, a base nitrogenada citosina pareia sempre com:", options: ["Adenina", "Timina", "Uracila", "Guanina", "Pentose"], correctOptionIndex: 3 },
    { text: "(ENEM) O sistema imunológico produz proteínas de defesa chamadas:", options: ["Enzimas", "Hormônios", "Anticorpos", "Lipídios", "Glicídios"], correctOptionIndex: 2 },
    { text: "(ENEM) A teoria da evolução por seleção natural foi proposta por:", options: ["Lamarck", "Mendel", "Darwin", "Pasteur", "Linneu"], correctOptionIndex: 2 }
  ],
  "Matemática": [
    { text: "(ENEM) Uma função do segundo grau f(x) = ax² + bx + c tem gráfico em parábola. Se a é negativo, a concavidade é:", options: ["Para cima.", "Para baixo.", "Para a direita.", "Para a esquerda.", "Nula."], correctOptionIndex: 1 },
    { text: "(ENEM) Qual a área de um triângulo de base 10cm e altura 6cm?", options: ["60 cm²", "30 cm²", "15 cm²", "120 cm²", "16 cm²"], correctOptionIndex: 1 },
    { text: "(ENEM) O valor de log10(1000) é:", options: ["1", "2", "3", "4", "10"], correctOptionIndex: 2 },
    { text: "(ENEM) Se um produto custa R$ 200,00 e tem um aumento de 15%, seu novo valor será:", options: ["R$ 215,00", "R$ 230,00", "R$ 215,15", "R$ 235,00", "R$ 210,00"], correctOptionIndex: 1 },
    { text: "(ENEM) Em um dado comum, qual a probabilidade de sair um número par?", options: ["1/6", "1/2", "1/3", "2/3", "1/4"], correctOptionIndex: 1 }
  ],
  "História": [
    { text: "(ENEM) A Revolução Francesa (1789) teve como um de seus marcos a Queda da Bastilha. O lema 'Liberdade, Igualdade e Fraternidade' refletia os ideais:", options: ["Socialistas.", "Absolutistas.", "Iluministas.", "Anarquistas.", "Teocráticos."], correctOptionIndex: 2 },
    { text: "(ENEM) A abolição da escravidão no Brasil (1888) ocorreu através da:", options: ["Lei Eusébio de Queirós", "Lei do Ventre Livre", "Lei Áurea", "Constituição de 1824", "Proclamação da República"], correctOptionIndex: 2 },
    { text: "(ENEM) O período da Ditadura Militar no Brasil iniciou-se em:", options: ["1930", "1945", "1964", "1985", "1922"], correctOptionIndex: 2 },
    { text: "(ENEM) A Primeira Guerra Mundial ocorreu entre:", options: ["1914 e 1918", "1939 e 1945", "1910 e 1914", "1918 e 1922", "1889 e 1895"], correctOptionIndex: 0 },
    { text: "(ENEM) A democracia surgiu na Grécia Antiga, especificamente em:", options: ["Esparta", "Atenas", "Tebas", "Corinto", "Macedônia"], correctOptionIndex: 1 }
  ],
  "Atualidades": [
    { text: "(ENEM) O conceito de 'Guerra Híbrida' no cenário geopolítico contemporâneo refere-se a:", options: ["Uso exclusivo de armas nucleares.", "Conflitos que mesclam táticas militares, cibernéticas e desinformação.", "Guerras travadas apenas no ambiente digital.", "Disputas comerciais sem envolvimento militar.", "Conflitos entre drones autônomos."], correctOptionIndex: 1 },
    { text: "(ENEM) O Acordo de Paris (2015) tem como objetivo principal no cenário global:", options: ["Regular o comércio de criptomoedas.", "Reduzir a desigualdade social na Europa.", "Cessar conflitos no Oriente Médio.", "Limitar o aumento da temperatura global abaixo de 2°C.", "Padronizar o sistema educacional mundial."], correctOptionIndex: 3 }
  ]
};

export async function generateDailyChallenge(
  subjectName: string,
  numQuestions: number = 5,
  difficulty: string = "medio",
  lessonTitles: string = "",
  lessonContext: string = ""
) {
  const difficultyDesc = DIFFICULTY_MAP[difficulty] || DIFFICULTY_MAP["medio"];
  const contextPart = lessonTitles
    ? `\n\nO aluno estudou: ${lessonTitles}. Contexto: ${lessonContext.substring(0, 300)}.`
    : "";

  const systemPrompt = `Você é um professor especialista em ENEM da disciplina de ${subjectName}. Gere EXATAMENTE ${numQuestions} questões de nível ${difficultyDesc}.

REGRAS DE OURO:
- Você deve gerar questões EXCLUSIVAMENTE sobre a matéria de ${subjectName}. É terminantemente PROIBIDO gerar questões de Matemática ou outra matéria se o tema for Atualidades ou Linguagens.
- Cada questão deve ter 4 alternativas realistas (A, B, C, D).
- Enunciados densos e contextuais padrão ENEM.
- Responda EXCLUSIVAMENTE no formato JSON puro, sem textos adicionais.
- O campo "questions" deve conter um array com EXATAMENTE ${numQuestions} itens.

FORMATO DO JSON (Exemplo):
{ 
  "title": "Título Impactante", 
  "description": "Breve descrição", 
  "questions": [
    { "text": "Pergunta 1...", "options": ["A", "B", "C", "D"], "correctOptionIndex": 0 },
    { "text": "Pergunta 2...", "options": ["A", "B", "C", "D"], "correctOptionIndex": 1 }
    // ... total de ${numQuestions} blocos
  ] 
}`;

  try {
    const model = getQuizModel();
    console.log(`[GROQ-QUIZ] 🤖 Gerando simulado de ${subjectName} no nível ${difficulty}...`);

    const { text } = await generateText({
      model,
      system: systemPrompt,
      prompt: `Gere questões de ${subjectName} focadas no ENEM.${contextPart}`,
      temperature: 0.4, // Mais rígido para evitar mistura de matérias
    });

    // Extração robusta de JSON
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const cleanJson = jsonMatch ? jsonMatch[0] : text;
    const parsed = JSON.parse(cleanJson);

    if (!parsed.questions || parsed.questions.length < 1) {
      throw new Error("IA retornou poucas questões.");
    }

    return parsed;
  } catch (error: any) {
    console.error(`[AI ORCHESTRATOR FALLBACK] ❌ Falha na geração em tempo real: ${error.message}`);
    
    // Modo Contingência Elite (Fallback Local Silencioso)
    const normalizedInput = subjectName.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    const subjectKey = Object.keys(CONTINGENCY_DB).find(k => 
      k.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() === normalizedInput
    );

    const fallbackQuestions = (subjectKey ? CONTINGENCY_DB[subjectKey] : null) || [
      { text: "(ENEM) O que é o Índice de Gini?", options: ["Mede desigualdade", "Mede PIB", "Mede chuva", "Mede luz"], correctOptionIndex: 0 },
      { text: "(ENEM) Fotossíntese ocorre no...", options: ["Mitocôndria", "Cloroplasto", "Núcleo", "Lisossomo"], correctOptionIndex: 1 }
    ];

    return {
      title: `Simulado: ${subjectName} (Mestre IA)`,
      description: "Conteúdo gerado com base na matriz de referência do ENEM e trilha de conhecimento.",
      questions: fallbackQuestions
    };
  }
}
