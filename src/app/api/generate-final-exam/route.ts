export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getChatModel } from "@/lib/ai-service";
import { generateText } from "ai";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await req.json();
    const { subjectId } = body;

    if (!subjectId) {
      return NextResponse.json({ error: "Faltando subjectId" }, { status: 400 });
    }

    // 1. Obter detalhes da matéria + aulas para contexto real
    const subject = await prisma.subject.findUnique({
      where: { id: subjectId },
      include: {
        lessons: { orderBy: { order: "asc" } },
      }
    });

    if (!subject) throw new Error("Matéria não encontrada");

    // 2. Verificar se já existe uma prova final pra esse usuário nessa matéria
    const existingFinal = await prisma.quiz.findFirst({
      where: {
        subjectId,
        isFinal: true,
        userId
      },
      include: {
        questions: { include: { options: true } }
      }
    });

    if (existingFinal) {
      return NextResponse.json({ quiz: existingFinal }, { status: 200 });
    }

    // 3. Se não existe, pedir à IA para gerar 20 questões + tema de redação
    const lessonTopics = (subject as any).lessons.map((l: any) => l.title).join(", ");
    const topicContext = lessonTopics || `Fundamentos de ${subject.name}`;

    console.log(`🎓 Gerando Prova Final para ${subject.name} com temas: ${topicContext}`);
    
    const promptMessage = `Você é o "Mestre ENEM Avaliador". Elabore a PROVA FINAL de certificação para a disciplina de ${subject.name}.
    Os temas OBRIGATÓRIOS desta prova são: ${topicContext}.
    
    As 20 questões de múltipla escolha DEVEM OBRIGATORIAMENTE abordar esses temas específicos, com distribuição proporcional entre eles. É TOTALMENTE PROIBIDO gerar questões de Matemática ou outra matéria se a disciplina for ${subject.name}. Use o estilo do ENEM com nível de dificuldade elevado. A proposta de redação deve estar diretamente relacionada a um desses temas.
    
    Retorne EXCLUSIVAMENTE o JSON abaixo, sem markdown, sem texto adicional:
    {
      "title": "Prova Final: ${subject.name}",
      "description": "Exame de Certificação — ${topicContext}",
      "questions": [
        {
          "text": "Enunciado completo da questão 1 sobre [tema específico]",
          "options": [
            { "text": "Alternativa A (correta)", "isCorrect": true },
            { "text": "Alternativa B", "isCorrect": false },
            { "text": "Alternativa C", "isCorrect": false },
            { "text": "Alternativa D", "isCorrect": false }
          ]
        }
      ],
      "essayPrompt": "TEMA DA REDAÇÃO relacionado a ${subject.name}: [proposta desafiadora e específica]"
    }`;

    console.log("Chamando Mestre IA para gerar prova final...");
    let aiResponseText = "";
    try {
      const response = await askAI(promptMessage, "Você é a Banca Examinadora Suprema do ENEM.", "quiz");
      aiResponseText = response.text;
    } catch (aiError: any) {
      console.error("Erro no Orquestrador IA (Prova Final):", aiError.message);
      aiResponseText = JSON.stringify({
          },
          {
            text: `(ENEM) Qual a premissa base dos estudos modernos envolvendo essa disciplina específica do ENEM?`,
            options: [
              { text: "Garante uma análise sistêmica orientada para um desenvolvimento sustentável e racional.", isCorrect: true },
              { text: "Serve apenas para desconstrução linguística e não de aplicação de fatos reais.", isCorrect: false },
              { text: "As abordagens teóricas não passam por evoluções construtivas interativas.", isCorrect: false },
              { text: "Aumenta drasticamente o ruído e dificulta resoluções pacíficas.", isCorrect: false }
            ]
          },
          {
            text: `(ENEM) De modo geral, o domínio deste tópico do conhecimento exige:`,
            options: [
              { text: "Uso de ferramentas analíticas, intelectuais e argumentativas, para lidar com as incertezas.", isCorrect: true },
              { text: "A eliminação de testes práticos, baseando-se por mero acaso nos dados obtidos.", isCorrect: false },
              { text: "Uma leitura dogmática impossibilitando a refutabilidade racional do que é aceito.", isCorrect: false },
              { text: "Uso de instinto para a tomada final de decisão nas matrizes educacionais.", isCorrect: false }
            ]
          }
        ],
        essayPrompt: "TEMA DA REDAÇÃO: O impacto das inovações na sociedade moderna, e de que forma o pensamento crítico e a ética moldam as estruturas do século XXI."
      });
    }

    console.log("Prova final gerada/carregada, processando...");

    let generatedData;
    try {
      // Limpeza caso o modelo retorne mensagens extra com o JSON
      let rawJson = aiResponseText;
      const stIdx = rawJson.indexOf('{');
      const endIdx = rawJson.lastIndexOf('}');
      if (stIdx !== -1 && endIdx !== -1) {
        rawJson = rawJson.substring(stIdx, endIdx + 1);
      }
      // Evita problemas de formatação obscura
      rawJson = rawJson.replace(/```json/g, "").replace(/```/g, "").trim();
      generatedData = JSON.parse(rawJson);
    } catch (err) {
      console.error("Erro ao parsear JSON da IA", aiResponseText);
      throw new Error("A IA falhou na formatação. Tente novamente.");
    }

    // 4. Salvar essa prova incrível no bando de dados amarrada com o usuário
    const newQuiz = await prisma.quiz.create({
      data: {
        title: generatedData.title || `Prova Final Exclusiva: ${subject.name}`,
        description: generatedData.description || "Criada via Llama 3 para " + session.user.name,
        subjectId,
        isFinal: true,
        userId,
        hasEssay: true,
        essayPrompt: generatedData.essayPrompt || `Elabore uma dissertação sobre ${subject.name}.`,
        questions: {
          create: generatedData.questions.map((q: any) => ({
            text: q.text,
            options: {
              create: q.options.map((o: any) => ({
                text: o.text
              }))
            }
          }))
        }
      },
      include: {
        questions: {
          include: {
            options: true
          }
        }
      }
    });

    // 5. Corrigir os corretsOptionId depois de criados
    for (let i = 0; i < generatedData.questions.length; i++) {
        const genQ = generatedData.questions[i];
        const dbQ = newQuiz.questions[i];
        const correctIndex = genQ.options.findIndex((o: any) => o.isCorrect === true);
        
        if (correctIndex !== -1 && dbQ.options[correctIndex]) {
            await prisma.question.update({
                where: { id: dbQ.id },
                data: { correctOptionId: dbQ.options[correctIndex].id } as any
            });
        } else if (dbQ.options.length > 0) {
            await prisma.question.update({
                where: { id: dbQ.id },
                data: { correctOptionId: dbQ.options[0].id } as any
            });
        }
    }

    // Re-buscar o quiz com as respostas corretas atreladas
    const finalSavedQuiz = await prisma.quiz.findUnique({
      where: { id: newQuiz.id },
      include: {
        questions: { include: { options: true } }
      }
    });

    return NextResponse.json({ quiz: finalSavedQuiz }, { status: 200 });
  } catch (error: any) {
    console.error("Erro na API de generate-final-exam:", error);
    return NextResponse.json({ error: error.message || "Erro interno" }, { status: 500 });
  }
}
