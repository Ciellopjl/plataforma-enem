"use client";

import { CheckCircle2, Circle, ChevronLeft, PlayCircle } from "lucide-react";
import { useState, useTransition } from "react";
import { cn } from "@/lib/utils";
import { toggleProgress } from "./actions";
import { Button } from "@/components/ui/base-ui";

interface LessonViewerProps {
  lesson: any;
  initialCompleted: boolean;
  onBack: () => void;
  onCompleteChange?: (completed: boolean) => void;
}

export function LessonViewer({ lesson, initialCompleted, onBack, onCompleteChange }: LessonViewerProps) {
  const [completed, setCompleted] = useState(initialCompleted);
  const [isPending, startTransition] = useTransition();

  const handleToggle = async () => {
    const newState = !completed;
    setCompleted(newState);
    if (onCompleteChange) {
      onCompleteChange(newState);
    }

    startTransition(async () => {
      const result = await toggleProgress(lesson.id, "lesson", newState);
      if (!result.success) {
        setCompleted(!newState);
        if (onCompleteChange) {
          onCompleteChange(!newState);
        }
        alert("Erro ao salvar progresso.");
      }
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors mb-4"
      >
        <ChevronLeft size={20} />
        Voltar para a Trilha
      </button>

      <div className="glass p-8 rounded-[2.5rem] space-y-8 relative overflow-hidden">
        {/* Decoração de Fundo */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/5 blur-[100px] -z-10" />

        <header className="space-y-4">
          <div className="flex justify-between items-start">
            <h1 className="text-4xl font-black text-white leading-tight max-w-2xl">
              {lesson.title}
            </h1>
            <button 
              onClick={handleToggle}
              disabled={isPending}
              className={cn(
                "flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold transition-all active:scale-95 disabled:opacity-50",
                completed 
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                  : "bg-white/5 text-zinc-400 border border-white/5 hover:bg-white/10 hover:text-white"
              )}
            >
              {completed ? <CheckCircle2 size={20} /> : <Circle size={20} />}
              {completed ? "Concluída" : "Marcar Concluída"}
            </button>
          </div>
          <div className="h-1 w-20 bg-primary-500 rounded-full" />
        </header>

        {lesson.videoUrl && (
          <div className="relative aspect-video rounded-3xl overflow-hidden glass border-white/5 group bg-zinc-950">
            {/* Player Ultra-Compatível com Fallback de Referrer e Origem */}
            <iframe 
              src={`https://www.youtube-nocookie.com/embed/${lesson.videoUrl.split('v=')[1]?.split('&')[0] || lesson.videoUrl.split('/').pop()}?rel=0&modestbranding=1&origin=${typeof window !== 'undefined' ? window.location.origin : ''}`}
              className="absolute inset-0 w-full h-full border-none shadow-2xl"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
              title={lesson.title}
            />
            
            {/* Link de Fallback caso continue bloqueado no localhost do usuário */}
            <div className="absolute bottom-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
              <a 
                href={lesson.videoUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-primary-600 hover:bg-primary-500 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg"
              >
                Assistir no YouTube
              </a>
            </div>
          </div>
        )}

        <div className="prose prose-invert max-w-none text-zinc-300 leading-relaxed text-lg">
          {lesson.content.split('\n').map((para: string, i: number) => (
            <p key={i} className="mb-4">{para}</p>
          ))}
        </div>

        <div className="pt-8 border-t border-white/5 flex justify-between items-center">
          <div className="text-sm text-zinc-500 italic">
            Pronto para testar seus conhecimentos?
          </div>
          <Button onClick={onBack} variant="primary">
            Próximo Passo: Quiz
          </Button>
        </div>
      </div>
    </div>
  );
}
