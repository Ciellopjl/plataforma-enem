import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { generateDailyChallenge } from "@/lib/gemini";
import { getDaysUntilEnem } from "@/lib/utils";

const SUBJECTS = [
  "Matemática", "Biologia", "Física", "Química",
  "História", "Geografia", "Filosofia", "Sociologia",
  "Atualidades", "Linguagens"
];

// GET → verifica se já existe desafio hoje (sem gerar)
export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = (session.user as any).id;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayChallenge = await prisma.dailyChallenge.findFirst({
      where: { userId, date: { gte: today } },
      include: { quiz: true }
    });

    if (todayChallenge) return NextResponse.json(todayChallenge);
    if (getDaysUntilEnem() <= 0) return NextResponse.json({ isEnemOver: true });

    // Retorna "ready" — sem desafio ainda, aguardando o usuário escolher dificuldade
    return NextResponse.json({ ready: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST → recebe difficulty e gera o desafio
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = (session.user as any).id;

    const { difficulty = "medio" } = await req.json().catch(() => ({ difficulty: "medio" }));

    if (getDaysUntilEnem() <= 0) return NextResponse.json({ isEnemOver: true });

    // Impede duplicata no mesmo dia
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const existing = await prisma.dailyChallenge.findFirst({
      where: { userId, date: { gte: today } }
    });
    if (existing) return NextResponse.json(existing);

    // Sorteia matéria
    const randomSubject = SUBJECTS[Math.floor(Math.random() * SUBJECTS.length)];

    let subjectDb = await prisma.subject.findFirst({
      where: { name: { contains: randomSubject, mode: "insensitive" } },
      include: { lessons: true, contents: true }
    });
    if (!subjectDb) subjectDb = await (prisma.subject.findFirst({ include: { lessons: true, contents: true } }) as any);
    if (!subjectDb) return NextResponse.json({ error: "Banco sem matérias. Rode o seed." }, { status: 500 });

    // Contexto dos materiais cadastrados na matéria
    const lessonTitles = (subjectDb as any).lessons?.map((l: any) => l.title).join(", ") || "";
    const lessonContent = (subjectDb as any).lessons?.map((l: any) => l.content).join(" | ").substring(0, 500) || "";

    const aiData = await generateDailyChallenge(randomSubject, 5, difficulty, lessonTitles, lessonContent);

    // 3. Criação Atômica do Simulado (Padrão Sênior: Alta Performance)
    const newQuiz = await prisma.quiz.create({
      data: {
        title: aiData.title || `Desafio Diário: ${randomSubject}`,
        description: aiData.description || `Nível ${difficulty} gerado por IA.`,
        subjectId: subjectDb.id,
        dailyChallenges: {
          create: {
            userId,
            date: new Date(),
          }
        },
        questions: {
          create: aiData.questions.map((q: any) => ({
            text: q.text,
            options: {
              create: q.options.map((optText: string) => ({
                text: optText
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

    // 4. Mapeamento do Gabarito (TRI)
    // Como o Prisma gera IDs no banco, precisamos atualizar o correctOptionId após a criação das opções
    await prisma.$transaction(
      newQuiz.questions.map((dbQuestion, qIndex) => {
        const aiQuestion = aiData.questions[qIndex];
        const correctOptIndex = aiQuestion.correctOptionIndex ?? 0;
        const correctDbOption = dbQuestion.options[correctOptIndex];

        return prisma.question.update({
          where: { id: dbQuestion.id },
          data: { correctOptionId: correctDbOption?.id }
        });
      })
    );

    const freshChallenge = await prisma.dailyChallenge.findFirst({
      where: { userId, quizId: newQuiz.id },
      include: { quiz: true }
    });

    return NextResponse.json(freshChallenge);
  } catch (error: any) {
    console.error("Erro ao gerar desafio:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE → permite resetar o desafio do dia (apenas se não concluído ou se for dev)
export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = (session.user as any).id;
    const userEmail = session.user.email;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const challenge = await prisma.dailyChallenge.findFirst({
      where: { userId, date: { gte: today } },
      include: { quiz: true }
    });

    if (!challenge) return NextResponse.json({ message: "Nenhum desafio hoje para deletar." });

    // Regra Sênior: Apenas deleta se não estiver completo, OU se for o admin/dev
    const isDev = userEmail === process.env.DEV_EMAIL;
    if (challenge.completed && !isDev) {
      return NextResponse.json({ error: "Desafios concluídos não podem ser resetados (apenas por admins)." }, { status: 403 });
    }

    // Cascade delete manual (segurança máxima)
    const quizId = challenge.quizId;
    await prisma.dailyChallenge.delete({ where: { id: challenge.id } });
    
    const questions = await prisma.question.findMany({ where: { quizId } });
    const questionIds = questions.map(q => q.id);
    
    await prisma.option.deleteMany({ where: { questionId: { in: questionIds } } });
    await prisma.question.deleteMany({ where: { quizId } });
    await prisma.quiz.delete({ where: { id: quizId } });

    console.log(`[ADMIN] Desafio deletado com sucesso para o usuário ${userEmail}`);
    return NextResponse.json({ success: true, message: "Desafio resetado. Você pode gerar um novo agora!" });
  } catch (error: any) {
    console.error("Erro ao deletar desafio:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
