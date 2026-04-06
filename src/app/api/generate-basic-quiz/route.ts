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

    const { quizId } = await req.json();
    if (!quizId) {
      return NextResponse.json({ error: "Faltando quizId" }, { status: 400 });
    }

    // 1. Carregar o quiz básico e sua matéria + aulas
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: { include: { options: true } },
        subject: {
          include: { lessons: { orderBy: { order: "asc" } } }
        }
      }
    });

    if (!quiz) {
      return NextResponse.json({ error: "Quiz não encontrado" }, { status: 404 });
    }

    // 2. Se já tem questões, retornar direto
    if (quiz.questions.length > 0) {
      return NextResponse.json({ quiz }, { status: 200 });
    }

    // 3. Montar contexto dos temas das aulas
    const subject = quiz.subject;
    const lessonTopics = subject.lessons.map((l: any) => l.title).join(", ");
    const topicContext = lessonTopics || `Fundamentos de ${subject.name}`;

    console.log(`🎯 Gerando Desafio Básico para ${subject.name} com temas: ${topicContext}`);

    const promptMessage = `Você é o "Mestre Avaliador ENEM". Elabore um Desafio de Fixação de 10 questões de múltipla escolha (com 4 alternativas cada, exatamente uma correta) para a disciplina de ${subject.name}.

Os temas que o aluno estudou foram: ${topicContext}.

As questões DEVEM ser baseadas especificamente nesses temas, com nível de dificuldade progressivo (questões 1-3 fáceis, 4-7 médias, 8-10 difíceis). Use o estilo e padrão das provas do ENEM.

Retorne EXCLUSIVAMENTE o JSON abaixo, sem markdown, sem texto adicional:
{
  "questions": [
    {
      "text": "Enunciado completo da questão 1",
      "options": [
        { "text": "Alternativa A (correta)", "isCorrect": true },
        { "text": "Alternativa B", "isCorrect": false },
        { "text": "Alternativa C", "isCorrect": false },
        { "text": "Alternativa D", "isCorrect": false }
      ]
    }
  ]
}`;

    const aiResponse = await generateText({
      model: getChatModel(),
      prompt: promptMessage,
      temperature: 0.6,
      // @ts-ignore
      maxTokens: 3000,
    });

    // 4. Parsear JSON da IA
    let generatedData: any;
    try {
      let rawJson = aiResponse.text;
      const stIdx = rawJson.indexOf("{");
      const endIdx = rawJson.lastIndexOf("}");
      if (stIdx !== -1 && endIdx !== -1) {
        rawJson = rawJson.substring(stIdx, endIdx + 1);
      }
      rawJson = rawJson.replace(/```json/g, "").replace(/```/g, "").trim();
      generatedData = JSON.parse(rawJson);
    } catch (err) {
      console.error("Erro ao parsear JSON da IA:", aiResponse.text);
      throw new Error("A IA falhou na formatação das questões. Tente novamente.");
    }

    if (!generatedData.questions || generatedData.questions.length === 0) {
      throw new Error("A IA não gerou questões. Tente novamente.");
    }

    // 5. Salvar questões no quiz existente
    for (const q of generatedData.questions) {
      const createdQuestion = await prisma.question.create({
        data: {
          text: q.text,
          quizId: quiz.id,
          options: {
            create: q.options.map((o: any) => ({ text: o.text }))
          }
        },
        include: { options: true }
      });

      // Marcar a opção correta pelo índice
      const correctIndex = q.options.findIndex((o: any) => o.isCorrect === true);
      const correctOptionId =
        correctIndex !== -1 && createdQuestion.options[correctIndex]
          ? createdQuestion.options[correctIndex].id
          : createdQuestion.options[0]?.id;

      if (correctOptionId) {
        await prisma.question.update({
          where: { id: createdQuestion.id },
          data: { correctOptionId } as any
        });
      }
    }

    // 6. Retornar quiz atualizado com questões
    const updatedQuiz = await prisma.quiz.findUnique({
      where: { id: quiz.id },
      include: { questions: { include: { options: true } } }
    });

    console.log(`✅ Desafio Básico gerado: ${updatedQuiz?.questions.length} questões para ${subject.name}`);
    return NextResponse.json({ quiz: updatedQuiz }, { status: 200 });

  } catch (error: any) {
    console.error("Erro na API de generate-basic-quiz:", error);
    return NextResponse.json({ error: error.message || "Erro interno" }, { status: 500 });
  }
}
