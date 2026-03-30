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

  // Buscar dados reais do usuário (progresso)
  const user = await prisma.user.findUnique({
    where: { id: (session.user as any).id },
    include: {
      progress: {
        include: {
          content: true
        }
      },
    }
  });

  // Buscar todas as matérias do banco
  const dbSubjects = await prisma.subject.findMany({
    include: {
      contents: true,
    }
  });

  // Mapear sujeitos e calcular progresso real por matéria
  const subjects = dbSubjects.map(subject => {
    const totalContents = subject.contents.length;
    const completedContents = user?.progress?.filter(p => p.content?.subjectId === subject.id && p.completed).length || 0;
    const progressPercentage = totalContents > 0 ? Math.round((completedContents / totalContents) * 100) : 0;

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
