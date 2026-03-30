"use client";

import { useState } from "react";
import { 
  XCircle, CheckCircle2, Sparkles, ChevronDown, 
  BookOpen, Loader2, HelpCircle 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { explainQuestion } from "../simulados/desafio/actions";

type Option = { id: string; text: string };

interface RevisionCardProps {
  question: {
    id: string;
    text: string;
    options: Option[];
    correctOptionId: string | null;
  };
  userAnswerId: string;
  subject: {
    name: string;
    color: string;
  };
  date: Date;
  index: number;
}

export function RevisionCard({ question, userAnswerId, subject, date, index }: RevisionCardProps) {
  const [open, setOpen] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const userOption = question.options.find(o => o.id === userAnswerId);
  const correctOption = question.options.find(o => o.id === question.correctOptionId);

  const handleExplain = async () => {
    if (explanation) {
      setOpen(!open);
      return;
    }

    setOpen(true);
    setLoading(true);
    try {
      const res = await explainQuestion(
        question.text,
        question.options.map(o => o.text),
        correctOption?.text || "Não informado"
      );
      setExplanation(res.explanation);
    } catch (err) {
      setExplanation("Ocorreu um erro ao gerar a explicação. Tente novamente em instantes.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass overflow-hidden rounded-[2.5rem] border-white/5 hover:border-primary-500/20 transition-all group animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${index * 100}ms` }}>
      <div className="p-8 md:p-10">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <span className={cn(
               "px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] border shadow-sm",
               subject.color.replace('bg-', 'text- border- opacity-100').replace('500', '400')
            )}>
              {subject.name}
            </span>
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
              Errada em {new Date(date).toLocaleDateString()}
            </span>
          </div>
          <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20">
             <XCircle size={14} className="text-red-400" />
          </div>
        </div>

        {/* Texto da Questão */}
        <p className="text-lg md:text-xl text-zinc-100 font-bold leading-relaxed mb-10">
          {question.text}
        </p>

        {/* Comparação de Respostas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {/* Errada */}
          <div className="relative group/answer">
             <div className="absolute -inset-1 bg-red-500/10 rounded-[2rem] blur opacity-0 group-hover/answer:opacity-100 transition duration-500" />
             <div className="relative p-6 rounded-[2rem] bg-red-500/5 border border-red-500/20">
                <div className="flex items-center gap-2 mb-3 text-red-400 text-[10px] font-black uppercase tracking-widest">
                  <XCircle size={14} /> Sua Resposta
                </div>
                <p className="text-base text-red-200/50 font-medium italic line-through">
                   {userOption?.text || "Sem resposta"}
                </p>
             </div>
          </div>

          {/* Correta */}
          <div className="relative group/correct">
             <div className="absolute -inset-1 bg-emerald-500/10 rounded-[2rem] blur opacity-0 group-hover/correct:opacity-100 transition duration-500" />
             <div className="relative p-6 rounded-[2rem] bg-emerald-500/5 border border-emerald-500/20">
                <div className="flex items-center gap-2 mb-3 text-emerald-400 text-[10px] font-black uppercase tracking-widest">
                  <CheckCircle2 size={14} /> Gabarito Correto
                </div>
                <p className="text-base text-emerald-300 font-black">
                   {correctOption?.text}
                </p>
             </div>
          </div>
        </div>

        {/* Botão de IA Professor */}
        <button
          onClick={handleExplain}
          className={cn(
            "w-full flex items-center justify-center gap-3 py-5 rounded-[1.5rem] text-sm font-black uppercase tracking-widest transition-all",
            open 
              ? "bg-primary-500/10 text-primary-400 border border-primary-500/20" 
              : "bg-white/5 text-white hover:bg-white/10 border border-white/5"
          )}
        >
          <Sparkles size={18} className={cn(loading && "animate-spin")} />
          {loading ? "Professor IA Analisando..." : open ? "Ocultar Explicação" : "Tirar Dúvida com Professor IA"}
          <ChevronDown size={18} className={cn("ml-2 transition-transform duration-300", open && "rotate-180")} />
        </button>

        {/* Área da Explicação */}
        {open && (
           <div className="mt-6 pt-6 border-t border-white/5 animate-in fade-in slide-in-from-top-4 duration-500">
             {loading ? (
                <div className="py-4 flex flex-col items-center justify-center gap-4">
                   <Loader2 className="animate-spin text-primary-400" size={32} />
                   <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest animate-pulse">Consultando base técnica Groq...</p>
                </div>
             ) : (
                <div className="bg-primary-500/5 border border-primary-500/10 rounded-[1.5rem] p-6 md:p-8">
                   <div className="flex items-center gap-3 mb-4">
                      <BookOpen size={18} className="text-primary-400" />
                      <span className="text-xs font-black uppercase tracking-widest text-primary-400">Análise do Professor IA</span>
                   </div>
                   <div className="text-zinc-300 text-sm md:text-base leading-relaxed whitespace-pre-wrap">
                      {explanation}
                   </div>
                </div>
             )}
           </div>
        )}
      </div>

      {/* Footer simples de feedback */}
      <div className="px-8 py-4 bg-white/2 border-t border-white/5 flex items-center gap-2 text-zinc-600">
         <HelpCircle size={14} />
         <span className="text-[10px] font-bold uppercase tracking-widest">Dica: Clique no botão acima para aprender com este erro.</span>
      </div>
    </div>
  );
}
