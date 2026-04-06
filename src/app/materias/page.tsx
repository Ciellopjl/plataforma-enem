export const dynamic = 'force-dynamic';
import { SubjectCard } from "@/components/ui/subject-card";
import { BookOpen, Search, Filter } from "lucide-react";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function MateriasPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const userId = (session.user as any).id;

  // Buscar todas as matérias com Aulas e Quizzes para cálculo real de progresso
  const dbSubjects = await prisma.subject.findMany({
    include: {
      contents: true,
      lessons: {
        include: {
          progress: { where: { userId } }
        }
      },
      quizzes: {
        include: {
          questions: true,
          attempts: { 
            where: { userId },
            orderBy: { score: "desc" },
            take: 1
          }
        }
      }
    }
  });

  // Mapear sujeitos e calcular progresso (Sincronizado com a Régua Sênior)
  const subjects = dbSubjects.map(subject => {
    // 1. Aulas concluídas
    const totalLessons = subject.lessons.length;
    const completedLessons = subject.lessons.filter((l: any) => 
      l.progress?.some((p: any) => p.completed)
    ).length;

    // 2. Status dos Quizzes (Básico e Final)
    const basicQuiz = subject.quizzes.find((q: any) => !q.isFinal);
    const finalQuiz = subject.quizzes.find((q: any) => q.isFinal);

    let basicPassed = false;
    if (basicQuiz && basicQuiz.attempts.length > 0) {
      const bestAttempt = basicQuiz.attempts[0];
      if (bestAttempt.score >= basicQuiz.questions.length && basicQuiz.questions.length > 0) {
        basicPassed = true;
      }
    }

    const finalPassed = finalQuiz ? finalQuiz.attempts.some((a: any) => a.completed) : false;

    // 3. Cálculo Holístico (Milestones)
    const totalMilestones = totalLessons + (basicQuiz ? 1 : 0) + (finalQuiz ? 1 : 0);
    const completedMilestones = completedLessons + (basicPassed ? 1 : 0) + (finalPassed ? 1 : 0);
    const progressPercentage = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

    return {
      name: subject.name,
      slug: subject.slug,
      color: subject.color || "bg-primary-600",
      iconName: subject.icon || "BookOpen",
      progress: progressPercentage
    };
  });

  return (
    <div className="space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <header className="space-y-4">
        <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-3">
          <BookOpen className="text-primary-500" size={36} />
          Todas as Matérias
        </h1>
        <p className="text-zinc-500 max-w-2xl">
          Sua jornada completa organizada por áreas do conhecimento. Clique em uma matéria para ver o cronograma e materiais.
        </p>
      </header>

      {/* Barra de Pesquisa e Filtros (UI Sênior) */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-primary-500 transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Buscar matéria..."
            className="w-full bg-zinc-900 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500/50 transition-all"
          />
        </div>
        <button className="glass px-6 py-4 rounded-2xl flex items-center gap-2 text-zinc-400 hover:text-white transition-all border-white/5">
          <Filter size={20} />
          Áreas do Conhecimento
        </button>
      </div>

      {/* Grid de Matérias */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {subjects.map((subject) => (
          <SubjectCard key={subject.slug} {...subject} />
        ))}
      </div>
    </div>
  );
}
