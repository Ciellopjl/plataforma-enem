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

    // 1. Obter detalhes da matéria para contexto
    const subject = await prisma.subject.findUnique({
      where: { id: subjectId },
      include: {
        contents: true,
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
    const contentNames = subject.contents.map(c => c.title).join(", ");
    
    const promptMessage = `Você é o "Mestre ENEM Avaliador". Elabore a PROVA FINAL de certificação para a disciplina de ${subject.name}.
    Os tópicos estudados pelo aluno foram: ${contentNames || "Fundamentos de " + subject.name}.
    
    Você deve retornar um objeto JSON perfeitamente estruturado contendo exatamente 20 questões de múltipla escolha (com 4 alternativas cada, onde apenas 1 está correta) e 1 proposta de redação/texto argumentativo. A proposta de redação deve ser desafiadora e coerente com o nível exigido pelos vestibulares (ENEM/FUVEST).
    
    O formato do JSON OBRIGATÓRIO (sem markdown, sem chaves externas de resposta, apenas raw JSON):
    {
      "title": "Prova Final: ${subject.name}",
      "description": "Exame de Certificação Definitivo gerado por IA.",
      "questions": [
        {
          "text": "Texto da questão 1",
          "options": [
            { "text": "Opção A", "isCorrect": true },
            { "text": "Opção B", "isCorrect": false },
            { "text": "Opção C", "isCorrect": false },
            { "text": "Opção D", "isCorrect": false }
          ]
        }
      ],
      "essayPrompt": "TEMA DA REDAÇÃO: [Sua proposta de tema aqui...]"
    }`;

    console.log("Chamando Llama 70B para gerar prova final (Maior qualidade estrutural)...");
    const aiResponse = await generateText({
      model: getChatModel(),
      prompt: promptMessage,
      temperature: 0.5,
      // @ts-ignore
      maxTokens: 4000,
    });

    console.log("Prova final gerada pela IA, processando...");

    let generatedData;
    try {
      // Limpeza caso o modelo retorne mensagens extra com o JSON
      let rawJson = aiResponse.text;
      const stIdx = rawJson.indexOf('{');
      const endIdx = rawJson.lastIndexOf('}');
      if (stIdx !== -1 && endIdx !== -1) {
        rawJson = rawJson.substring(stIdx, endIdx + 1);
      }
      // Evita problemas de formatação obscura
      rawJson = rawJson.replace(/```json/g, "").replace(/```/g, "").trim();
      generatedData = JSON.parse(rawJson);
    } catch (err) {
      console.error("Erro ao parsear JSON da IA", aiResponse.text);
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
                data: { correctOptionId: dbQ.options[correctIndex].id }
            });
        } else if (dbQ.options.length > 0) {
            await prisma.question.update({
                where: { id: dbQ.id },
                data: { correctOptionId: dbQ.options[0].id }
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
