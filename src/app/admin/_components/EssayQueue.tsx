"use client";

import { useEffect, useState } from "react";
import { getEssaysQueue, addTeacherFeedback } from "../actions/support";
import { Loader2, MessageSquare, CheckCircle2, User, FileEdit } from "lucide-react";
import { cn } from "@/lib/utils";

export function EssayQueue() {
  const [essays, setEssays] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEssay, setSelectedEssay] = useState<any>(null);
  const [feedback, setFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    const res = await getEssaysQueue();
    setEssays(res);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEssay) return;
    setSubmitting(true);
    try {
      await addTeacherFeedback(selectedEssay.id, feedback);
      setFeedback("");
      setSelectedEssay(null);
      load();
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader2 className="animate-spin mx-auto mt-20" />;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Fila de Redações */}
      <div className="space-y-4">
        <h3 className="text-sm font-black uppercase tracking-widest text-zinc-500 px-2">Fila de Revisão ({essays.length})</h3>
        
        {essays.length === 0 && (
          <div className="bg-white/5 border border-dashed border-white/10 rounded-3xl p-12 flex flex-col items-center justify-center gap-4 text-zinc-500 text-center">
            <CheckCircle2 size={48} className="opacity-20" />
            <p className="text-sm font-medium">Nenhuma redação aguardando revisão humana.</p>
          </div>
        )}

        <div className="space-y-3">
          {essays.map((e: any) => (
            <div 
              key={e.id} 
              onClick={() => {
                setSelectedEssay(e);
                setFeedback(e.teacherFeedback || "");
              }}
              className={cn(
                "bg-white/5 border rounded-2xl p-4 flex items-center justify-between gap-4 cursor-pointer transition-all hover:bg-white/[0.07]",
                selectedEssay?.id === e.id ? "border-primary-500 bg-primary-500/5" : "border-white/10"
              )}
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center overflow-hidden border border-white/10">
                  {e.user.image ? <img src={e.user.image} alt={e.user.name} /> : <User size={20} className="text-zinc-600" />}
                </div>
                <div className="space-y-0.5">
                  <p className="text-sm font-bold truncate max-w-[150px]">{e.title || "Redação sem título"}</p>
                  <p className="text-[10px] text-zinc-500 uppercase font-black">{e.user.name}</p>
                </div>
              </div>

              <div className="flex flex-col items-end gap-1">
                 <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase text-zinc-600">Nota IA:</span>
                    <span className="text-sm font-black text-primary-400">{e.score} pts</span>
                 </div>
                 {e.teacherFeedback ? (
                   <span className="flex items-center gap-1 text-[8px] font-black uppercase text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full"> Revisada </span>
                 ) : (
                   <span className="flex items-center gap-1 text-[8px] font-black uppercase text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full pulse"> Pendente </span>
                 )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Editor de Feedback */}
      <div className="bg-white/5 border border-white/10 rounded-3xl p-8 space-y-6 self-start min-h-[500px] flex flex-col">
        {selectedEssay ? (
          <>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-sm font-black uppercase tracking-widest text-primary-400">Feedback do Mentor</h3>
                <p className="text-xl font-bold line-clamp-1">{selectedEssay.title || "Sem título"}</p>
              </div>
              <FileEdit className="text-zinc-500" size={24} />
            </div>

            <div className="bg-zinc-900/50 rounded-2xl p-6 h-[250px] overflow-y-auto text-xs text-zinc-400 leading-relaxed border border-white/5 scrollbar-thin">
              <p className="font-black text-[10px] text-zinc-600 uppercase mb-4 sticky top-0 bg-zinc-900/50 py-1">Texto do Aluno:</p>
              {selectedEssay.content}
            </div>

            <form onSubmit={handleFeedbackSubmit} className="space-y-4 mt-auto">
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black text-zinc-500 px-1">Seu Feedback (Visível para o Aluno)</label>
                <textarea 
                  required
                  value={feedback}
                  onChange={e => setFeedback(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary-500/50 min-h-[120px]"
                  placeholder="Excelente coesão, mas cuidado com a competência 3..."
                />
              </div>

              <button 
                disabled={submitting}
                className="w-full py-4 bg-primary-600 hover:bg-primary-500 disabled:opacity-50 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all"
              >
                {submitting ? <Loader2 className="animate-spin" size={16} /> : <MessageSquare size={16} />}
                Salvar Feedback
              </button>
            </form>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center gap-4 text-zinc-600">
             <MessageSquare size={48} className="opacity-10" />
             <p className="text-sm font-medium">Selecione uma redação na fila para iniciar a revisão humana.</p>
          </div>
        )}
      </div>

    </div>
  );
}
