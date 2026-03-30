import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export const revalidate = 0;

export async function GET(
  req: Request,
  { params }: { params: { slug: string } }
) {
  const session = await auth();
  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const userId = (session.user as any).id;

  try {
    const subject = await prisma.subject.findUnique({
      where: { slug: params.slug },
      include: {
        lessons: {
          orderBy: { order: "asc" },
          include: {
            progress: { where: { userId } }
          }
        },
        quizzes: {
          include: {
            questions: { include: { options: true } },
            attempts: {
              where: { userId },
              orderBy: { createdAt: "desc" },
              take: 5
            }
          }
        }
      }
    });

    if (!subject) {
      return new NextResponse("Not Found", { status: 404 });
    }

    // Formatar lições com status de conclusão
    const formattedLessons = subject.lessons.map(lesson => ({
      ...lesson,
      completed: lesson.progress.some(p => p.completed)
    }));

    const totalLessons = subject.lessons.length;
    const completedLessons = formattedLessons.filter(l => l.completed).length;

    // Separar quizzes em Básico e Final
    const basicQuiz = subject.quizzes.find(q => !q.isFinal) ?? null;
    const finalQuiz = subject.quizzes.find(q => q.isFinal) ?? null;

    // Verificar se o aluno já tirou 100% no quiz básico
    let basicPassed = false;
    if (basicQuiz && basicQuiz.questions.length > 0) {
      const bestAttempt = basicQuiz.attempts.reduce((best: any, attempt: any) => {
        return (!best || attempt.score > best.score) ? attempt : best;
      }, null);
      if (bestAttempt && bestAttempt.score >= basicQuiz.questions.length) {
        basicPassed = true;
      }
    }

    // Verificar se a prova final foi concluída (pelo menos 1 tentativa)
    const finalPassed = finalQuiz ? finalQuiz.attempts.some(a => a.completed) : false;

    // Cálculo Holístico do Progresso (Aulas + Quizzes)
    const totalMilestones = totalLessons + (basicQuiz ? 1 : 0) + (finalQuiz ? 1 : 0);
    const completedMilestones = completedLessons + (basicPassed ? 1 : 0) + (finalPassed ? 1 : 0);
    const progress = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

    return NextResponse.json({
      ...subject,
      lessons: formattedLessons,
      progress,
      basicQuiz,
      finalQuiz,
      basicPassed,
      finalPassed,
      // manter retrocompatibilidade
      quizzes: subject.quizzes
    });
  } catch (error) {
    console.error("Error fetching subject details:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
