"use client";

import { CheckCircle2, Circle, ExternalLink } from "lucide-react";
import { useState, useTransition } from "react";
import { cn } from "@/lib/utils";
import { toggleProgress } from "./actions";

interface ContentListProps {
  contents: any[];
  initialCompletedIds: string[];
}

export function ContentList({ contents, initialCompletedIds }: ContentListProps) {
  const [completedIds, setCompletedIds] = useState<string[]>(initialCompletedIds);
  const [isPending, startTransition] = useTransition();

  const handleToggle = async (contentId: string) => {
    const isCurrentlyCompleted = completedIds.includes(contentId);
    const newCompletedState = !isCurrentlyCompleted;

    // Otimista: Atualiza a UI imediatamente
    setCompletedIds(prev => 
      newCompletedState ? [...prev, contentId] : prev.filter(id => id !== contentId)
    );

    startTransition(async () => {
      const result = await toggleProgress(contentId, "content", newCompletedState);
      if (!result.success) {
        // Reverter em caso de erro
        setCompletedIds(prev => 
          isCurrentlyCompleted ? [...prev, contentId] : prev.filter(id => id !== contentId)
        );
        alert("Erro ao salvar progresso. Tente novamente.");
      }
    });
  };

  if (contents.length === 0) {
    return (
      <div className="text-center py-12 glass rounded-3xl text-zinc-500 animate-pulse">
        Nenhum material cadastrado para esta matéria no momento.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3">
      {contents.map((content, i) => {
        const isCompleted = completedIds.includes(content.id);
        
        return (
          <div
            key={content.id}
            className="glass p-4 rounded-2xl flex items-center justify-between group hover:border-white/10 transition-all animate-in fade-in slide-in-from-left-4 duration-500"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className="flex items-center gap-4 flex-1">
              <button 
                onClick={() => handleToggle(content.id)}
                disabled={isPending}
                className={cn(
                  "p-1 rounded-full transition-all duration-300 disabled:opacity-50",
                  isCompleted ? "text-emerald-400 scale-110" : "text-zinc-700 hover:text-zinc-500"
                )}
              >
                {isCompleted ? <CheckCircle2 size={28} /> : <Circle size={28} />}
              </button>
              <div>
                <h3 className={cn(
                  "font-bold transition-all",
                  isCompleted ? "text-zinc-500 line-through" : "text-zinc-100"
                )}>
                  {content.title}
                </h3>
                <p className="text-xs text-zinc-500">{content.description}</p>
              </div>
            </div>
            
            <a 
              href={content.link} 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-3 bg-zinc-800 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-700 transition-all opacity-0 group-hover:opacity-100"
            >
              <ExternalLink size={18} />
            </a>
          </div>
        );
      })}
    </div>
  );
}
