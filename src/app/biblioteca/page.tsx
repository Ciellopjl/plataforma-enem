"use client";

import { useState, useEffect } from "react";
import { 
  Book, Folder, FileText, Download, Bookmark, 
  Sparkles, ExternalLink, Brain, RefreshCw, 
  ChevronRight, ChevronLeft, LayoutGrid, List 
} from "lucide-react";
import { Button } from "@/components/ui/base-ui";
import { generateFlashcards, getResources } from "./actions";
import { cn } from "@/lib/utils";

type ResourceItem = {
  id: string;
  title: string;
  link: string;
  type: string;
  description: string | null;
  category: string | null;
};

type Flashcard = {
  front: string;
  back: string;
};

export default function BibliotecaPage() {
  const [tab, setTab] = useState<"materiais" | "flashcards">("materiais");
  const [materiais, setMateriais] = useState<ResourceItem[]>([]);
  const [loadingMateriais, setLoadingMateriais] = useState(true);
  
  // Flashcards state
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [loadingFlashcards, setLoadingFlashcards] = useState(false);
  const [cardIndex, setCardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [subject, setSubject] = useState("Matéria Geral");

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    setLoadingMateriais(true);
    try {
      const res = await getResources();
      setMateriais(res as any);
    } catch {
      console.error("Erro ao carregar materiais");
    } finally {
      setLoadingMateriais(false);
    }
  };

  const handleGenerateFlashcards = async (s: string) => {
    setSubject(s);
    setLoadingFlashcards(true);
    setFlashcards([]);
    setCardIndex(0);
    setFlipped(false);
    try {
      const res = await generateFlashcards(s);
      setFlashcards(res.flashcards);
      setTab("flashcards");
    } catch {
      alert("Erro ao carregar flashcards.");
    } finally {
      setLoadingFlashcards(false);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="border-b border-white/5 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-black text-white tracking-tight">Biblioteca & Flashcards</h1>
          <p className="text-zinc-400 max-w-xl">
            Acesse materiais teóricos ou use nossa IA para gerar flashcards de revisão rápida sobre qualquer assunto.
          </p>
        </div>
        <div className="flex p-1 bg-white/5 rounded-2xl border border-white/5">
           <button 
             onClick={() => setTab("materiais")}
             className={cn("px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all", tab === "materiais" ? "bg-white text-black shadow-xl" : "text-zinc-500 hover:text-zinc-300")}
           >
             Materiais
           </button>
           <button 
             onClick={() => setTab("flashcards")}
             className={cn("px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all", tab === "flashcards" ? "bg-white text-black shadow-xl" : "text-zinc-500 hover:text-zinc-300")}
           >
             Flashcards IA
           </button>
        </div>
      </header>

      {tab === "materiais" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Categorias Rápidas de IA */}
          <div className="col-span-full mb-4">
             <h3 className="text-sm font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                <Sparkles size={16} className="text-primary-400" />
                Gerar Flashcards de Revisão
             </h3>
             <div className="flex flex-wrap gap-2">
                {["Cinemática", "Ligações Químicas", "Revolução Francesa", "Logaritmos", "Ecologia", "Genética"].map(s => (
                   <button 
                     key={s} 
                     onClick={() => handleGenerateFlashcards(s)}
                     className="px-4 py-2 bg-primary-500/10 border border-primary-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest text-primary-400 hover:bg-primary-500/20 transition-all flex items-center gap-2"
                   >
                      <Brain size={14} /> {s}
                   </button>
                ))}
             </div>
          </div>

          {loadingMateriais ? (
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="glass p-8 h-64 rounded-[2rem] border-white/5 animate-pulse flex flex-col justify-center items-center">
                <div className="w-12 h-12 bg-white/10 rounded-full mb-4" />
                <div className="w-32 h-4 bg-white/10 rounded-full mb-2" />
                <div className="w-24 h-3 bg-white/10 rounded-full" />
              </div>
            ))
          ) : materiais.length > 0 ? (
            materiais.map((m: ResourceItem) => (
               <div key={m.id} className="glass p-8 rounded-[2rem] border-white/5 hover:border-emerald-500/20 transition-all group relative overflow-hidden flex flex-col h-full justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-6">
                      <Folder className="text-emerald-500 group-hover:scale-110 transition-transform" size={40} />
                      {m.category && (
                        <span className="text-[8px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-500 px-2 py-1 rounded">
                          {m.category}
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">{m.title}</h3>
                    <p className="text-zinc-500 text-xs mb-6 line-clamp-3">{m.description || "Pasta completa de materiais teóricos e simulados."}</p>
                  </div>
                  
                  <a href={m.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-400 hover:text-emerald-300 transition-colors mt-auto pt-4 border-t border-white/5">
                     Acessar Drive <ChevronRight size={14} />
                  </a>
                  
                  <div className="absolute top-0 right-0 p-4 opacity-5">
                     <FileText size={80} />
                  </div>
               </div>
            ))
          ) : (
            <div className="col-span-full py-20 text-center glass rounded-[2rem] border-dashed border-white/10 border-2">
               <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Nenhum drive cadastrado ainda.</p>
               <a href="https://drive.google.com/drive/u/0/folders/1vW_3eI2_9yLSdwksJRQ2NRMyUlzepbVE" target="_blank" className="text-primary-400 text-[10px] font-black uppercase mt-4 block">
                 Acessar Repositório Principal
               </a>
            </div>
          )}
        </div>
      ) : (
        <div className="max-w-2xl mx-auto space-y-8 py-10">
           {loadingFlashcards ? (
              <div className="flex flex-col items-center justify-center text-center py-20 space-y-4 animate-pulse">
                 <RefreshCw size={48} className="text-primary-400 animate-spin" />
                 <h2 className="text-2xl font-black text-white">Mentalizando Flashcards...</h2>
                 <p className="text-zinc-500 text-sm">Organizando os conceitos chave sobre {subject}.</p>
              </div>
           ) : flashcards.length > 0 ? (
              <div className="space-y-10">
                 {/* Card Display */}
                 <div 
                   onClick={() => setFlipped(!flipped)}
                   className="perspective-1000 w-full aspect-[4/3] cursor-pointer group"
                 >
                    <div className={cn(
                       "relative w-full h-full transition-all duration-700 preserve-3d shadow-2xl rounded-[3rem]",
                       flipped ? "rotate-y-180" : ""
                    )}>
                       {/* Front */}
                       <div className="absolute inset-0 backface-hidden glass rounded-[3rem] border-primary-500/20 bg-primary-500/5 flex flex-col items-center justify-center p-12 text-center">
                          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary-400 mb-6">Conceito • {subject}</span>
                          <h3 className="text-2xl md:text-3xl font-black text-white leading-tight">{flashcards[cardIndex].front}</h3>
                          <p className="mt-8 text-xs text-zinc-500 font-bold uppercase tracking-widest group-hover:animate-pulse">Clique para ver o Verso</p>
                       </div>
                       
                       {/* Back */}
                       <div className="absolute inset-0 backface-hidden glass rounded-[3rem] border-emerald-500/20 bg-emerald-500/5 flex flex-col items-center justify-center p-12 text-center rotate-y-180">
                          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400 mb-6">Explicação Técnica</span>
                          <p className="text-xl text-zinc-200 leading-relaxed font-medium">{flashcards[cardIndex].back}</p>
                          <p className="mt-8 text-xs text-zinc-500 font-bold uppercase tracking-widest">Clique para ver a Frente</p>
                       </div>
                    </div>
                 </div>

                 {/* Navigation */}
                 <div className="flex items-center justify-between px-4">
                    <button 
                       disabled={cardIndex === 0}
                       onClick={(e) => { e.stopPropagation(); setCardIndex((prev: number) => prev - 1); setFlipped(false); }}
                       className="p-4 rounded-2xl bg-white/5 border border-white/10 text-zinc-400 hover:text-white disabled:opacity-20 transition-all"
                    >
                       <ChevronLeft size={24} />
                    </button>
                    <div className="text-zinc-500 text-xs font-black tracking-widest uppercase">
                       {cardIndex + 1} / {flashcards.length} CARDS
                    </div>
                    <button 
                       disabled={cardIndex === flashcards.length - 1}
                       onClick={(e) => { e.stopPropagation(); setCardIndex((prev: number) => prev + 1); setFlipped(false); }}
                       className="p-4 rounded-2xl bg-white/5 border border-white/10 text-zinc-400 hover:text-white disabled:opacity-20 transition-all"
                    >
                       <ChevronRight size={24} />
                    </button>
                 </div>
              </div>
           ) : (
              <div className="text-center py-20 space-y-4 glass rounded-[3rem] border-white/5 border-dashed border-2">
                 <Brain size={48} className="text-zinc-800 mx-auto" />
                 <h2 className="text-xl font-black text-zinc-700 uppercase tracking-widest">Nada por aqui ainda</h2>
                 <p className="text-zinc-500 text-sm">Selecione uma matéria acima para gerar seus flashcards de revisão IA.</p>
              </div>
           )}
        </div>
      )}
    </div>
  );
}
