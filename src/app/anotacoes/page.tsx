"use client";

import { useState, useEffect } from "react";
import { Clock, Plus, Trash2, Loader2, StickyNote } from "lucide-react";
import { cn } from "@/lib/utils";

interface Note {
  id: string;
  content: string;
  createdAt: string;
}

export default function AnotacoesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchNotes = async () => {
    try {
      const res = await fetch("/api/notes");
      const data = await res.json();
      if (Array.isArray(data)) {
        setNotes(data);
      }
    } catch (error) {
      console.error("Erro ao carregar notas:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newNote }),
      });
      if (res.ok) {
        setNewNote("");
        fetchNotes();
      }
    } catch (error) {
      console.error("Erro ao adicionar nota:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteNote = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta anotação?")) return;
    
    try {
      const res = await fetch(`/api/notes?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setNotes(notes.filter((n) => n.id !== id));
      }
    } catch (error) {
      console.error("Erro ao deletar nota:", error);
    }
  };

  const formatRelativeTime = (dateString: string) => {
    const now = new Date();
    const noteDate = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - noteDate.getTime()) / 1000);

    if (diffInSeconds < 60) return "Agora mesmo";
    if (diffInSeconds < 3600) return `Há ${Math.floor(diffInSeconds / 60)} min`;
    if (diffInSeconds < 86400) return `Há ${Math.floor(diffInSeconds / 3600)}h`;
    return noteDate.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8 pt-4">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-[2rem] bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 shrink-0">
            <Clock size={32} />
          </div>
          <div className="space-y-1">
            <h1 className="text-4xl font-black text-white tracking-tight uppercase">Minhas Anotações</h1>
            <p className="text-zinc-500 font-medium tracking-tight">Onde você parou? O que planeja fazer agora?</p>
          </div>
        </div>
      </header>

      {/* Quick Add */}
      <section className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-sky-500/20 to-primary-500/20 rounded-[2.5rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
        <form onSubmit={handleAddNote} className="relative glass p-6 rounded-[2rem] border-white/5 flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Ex: Parei no módulo 3 de Matemática, questão 15..."
            className="flex-1 bg-transparent border-none text-white placeholder:text-zinc-600 focus:ring-0 text-base sm:text-lg selection:bg-sky-500/30"
          />
          <button
            type="submit"
            disabled={!newNote.trim() || isSubmitting}
            className={cn(
              "px-6 py-4 rounded-2xl bg-white text-black font-black transition-all flex items-center justify-center gap-2 hover:bg-sky-400 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:grayscale disabled:scale-100",
              isSubmitting && "animate-pulse"
            )}
          >
            {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} />}
            <span className="uppercase text-xs tracking-widest">Anotar</span>
          </button>
        </form>
      </section>

      {/* Notes List */}
      <section className="space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4 opacity-50">
            <Loader2 className="animate-spin text-sky-400" size={32} />
            <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Sincronizando Anotações...</p>
          </div>
        ) : notes.length === 0 ? (
          <div className="glass p-12 rounded-[2.5rem] border-dashed border-white/5 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-700">
              <StickyNote size={32} />
            </div>
            <div className="space-y-1">
              <p className="text-xl font-bold text-zinc-400">Nenhuma anotação ainda</p>
              <p className="text-zinc-600 text-sm max-w-xs mx-auto">Use o campo acima para registrar seu progresso e nunca mais se perder nos estudos.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {notes.map((note) => (
              <div 
                key={note.id}
                className="glass p-6 rounded-3xl border-white/5 hover:border-sky-500/20 transition-all group flex items-start justify-between gap-6 overflow-hidden relative"
              >
                <div className="flex items-start gap-4 flex-1">
                  <div className="mt-2.5 flex-shrink-0 w-2 h-2 rounded-full bg-sky-500 shadow-[0_0_8px_rgba(14,165,233,0.5)]" />
                  <div className="space-y-3">
                    <p className="text-lg text-zinc-200 font-medium leading-relaxed">{note.content}</p>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 bg-zinc-950/50 px-2 py-0.5 rounded-md border border-white/5">
                        {formatRelativeTime(note.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => handleDeleteNote(note.id)}
                  className="opacity-0 group-hover:opacity-100 p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 hover:bg-rose-500 hover:text-white transition-all shrink-0 self-center"
                  title="Excluir anotação"
                >
                  <Trash2 size={16} />
                </button>

                {/* Efeito sutil de luxo no hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-sky-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Footer / Tip */}
      <footer className="pt-10 flex justify-center">
         <div className="flex items-center gap-3 bg-zinc-950/50 px-6 py-3 rounded-full border border-white/5 group">
            <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] group-hover:text-sky-500 transition-colors">Dica Sênior:</span>
            <p className="text-xs text-zinc-500">Anotar onde parou ajuda a retomar o foco 40% mais rápido.</p>
         </div>
      </footer>
    </div>
  );
}
