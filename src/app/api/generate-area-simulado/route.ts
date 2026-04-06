export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getChatModel } from "@/lib/ai-service";
import { generateText } from "ai";

const AREA_SUBJECTS: Record<string, string[]> = {
  "Linguagens": ["portugues", "literatura", "ingles", "espanhol", "artes", "educacao-fisica", "tecnologias"],
  "Humanas": ["historia", "geografia", "filosofia", "sociologia"],
  "Natureza": ["biologia", "quimica", "fisica"],
  "Matemática": ["matematica"]
};

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { area } = await req.json();
    if (!area || !AREA_SUBJECTS[area]) {
      return NextResponse.json({ error: "Área inválida ou não selecionada" }, { status: 400 });
    }

    const userId = (session.user as any).id;
    const slugs = AREA_SUBJECTS[area];

    // 1. Buscar todas as matérias e suas aulas para a área
    const subjects = await prisma.subject.findMany({
      where: { slug: { in: slugs } },
      include: {
        lessons: { orderBy: { order: "asc" } }
      }
    });

    if (subjects.length === 0) {
      return NextResponse.json({ error: "Nenhuma matéria encontrada para esta área" }, { status: 404 });
    }

    // 2. Extrair temas (títulos das aulas) agrupados por matéria
    const areaContext = subjects.map(s => {
      const topics = s.lessons.map(l => l.title).join(", ");
      return `${s.name}: ${topics || "Fundamentos Gerais"}`;
    }).join(" | ");

    console.log(`🚀 Gerando Simulado de Área [${area}] para ${session.user.name}...`);

    // 3. Prompt da IA para Simulado Multidisciplinar
    const promptMessage = `Você é o "Coordenador de Simulados ENEM". Elabore um SIMULADO DINÂMICO DE ÁREA para o aluno.
Área: ${area}.
Temas das matérias da área: ${areaContext}.

As questões DEVEM ser distribuídas entre todas as matérias da área.
Você deve gerar EXATAMENTE 15 questões de múltipla escolha (4 alternativas cada, onde exatamente 1 está correta).

A dificuldade deve ser equilibrada (TRI):
- 5 questões Fáceis
- 7 questões Médias
- 3 questões Difíceis

REGRAS DE OURO:
- É TERMINANTEMENTE PROIBIDO gerar questões de Matemática se a Área não for "Matemática".
- As questões devem ser rigorosamente sobre os temas listados: ${areaContext}.

O formato do JSON OBRIGATÓRIO (sem markdown, sem textos adicionais):
{
  "title": "Simulado IA: ${area}",
  "description": "Simulado multidisciplinar focado nos temas de ${slugs.join(', ')}.",
  "questions": [
    {
      "text": "Enunciado da questão 1 sobre [Tema de X matéria]",
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
      temperature: 0.5, // Reduzido para maior precisão de temas
      // @ts-ignore
      maxTokens: 5000,
    });

    // 4. Processar JSON da IA
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
      console.error("Erro ao parsear Simulado IA:", aiResponse.text);
      throw new Error("Falha na formatação da IA. Tente novamente.");
    }

    // 5. Salvar o Quiz como Simulado Temporário (amarrado ao usuário)
    // Usamos a primeira matéria da lista apenas como pivot para o DB (já que o Quiz exige subjectId)
    const pivotSubjectId = subjects[0].id;

    const newQuiz = await prisma.quiz.create({
      data: {
        title: generatedData.title || `Simulado de ${area}`,
        description: generatedData.description || `Avaliação de desempenho em ${area}.`,
        subjectId: pivotSubjectId,
        userId: userId,
        isFinal: false, // Tratamos simulado como um quiz especial
        questions: {
          create: generatedData.questions.map((q: any) => ({
            text: q.text,
            options: {
              create: q.options.map((o: any) => ({ text: o.text }))
            }
          }))
        }
      },
      include: {
        questions: { include: { options: true } }
      }
    });

    // 6. Atualizar correctOptionId (TRI mapping)
    for (let i = 0; i < generatedData.questions.length; i++) {
        const genQ = generatedData.questions[i];
        const dbQ = newQuiz.questions[i];
        const correctIndex = genQ.options.findIndex((o: any) => o.isCorrect === true);
        
        if (correctIndex !== -1 && dbQ.options[correctIndex]) {
            await prisma.question.update({
                where: { id: dbQ.id },
                data: { correctOptionId: dbQ.options[correctIndex].id } as any
            });
        }
    }

    const finalSimulado = await prisma.quiz.findUnique({
      where: { id: newQuiz.id },
      include: { questions: { include: { options: true } } }
    });

    return NextResponse.json({ quiz: finalSimulado }, { status: 200 });

  } catch (error: any) {
    console.error("Erro ao gerar simulado de área:", error);
    return NextResponse.json({ error: error.message || "Erro interno" }, { status: 500 });
  }
}
