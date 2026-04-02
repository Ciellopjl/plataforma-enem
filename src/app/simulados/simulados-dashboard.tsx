"use client";
import React, { useState } from "react";
import { ClipboardList, Target, TrendingUp, Sparkles, Wand2, Globe, Brain, Zap, FlaskConical, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/base-ui";
import { QuizViewer } from "../materias/quiz-viewer";
import { cn } from "@/lib/utils";

interface SimuladosDashboardProps {
  initialSimulados: any[];
}

export function SimuladosDashboard({ initialSimulados }: SimuladosDashboardProps) {
  const [view, setView] = useState<"list" | "quiz">("list");
  const [activeSimulado, setActiveSimulado] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedArea, setSelectedArea] = useState<string | null>(null);

  const areas = [
    { name: "Linguagens", icon: Globe, color: "text-orange-500", bg: "bg-orange-500/10", border: "border-orange-500/20" },
    { name: "Humanas", icon: Brain, color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20" },
    { name: "Natureza", icon: FlaskConical, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
    { name: "Matemática", icon: Zap, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20" },
  ];

  const handleGenerateSimulado = async (area: string) => {
    setIsGenerating(true);
    setSelectedArea(area);
    try {
      const res = await fetch("/api/generate-area-simulado", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ area })
      });
      const data = await res.json();
      
      if (data.quiz) {
        setActiveSimulado(data.quiz);
        setView("quiz");
      } else {
        alert("Erro ao forjar simulado: " + (data.error || "Tente novamente."));
      }
    } catch (e) {
      console.error(e);
      alert("Erro de conexão ao gerar simulado multidisciplinar.");
    } finally {
      setIsGenerating(false);
    }
  };

  if (view === "quiz" && activeSimulado) {
    return (
      <div className="space-y-6">
        <button 
           onClick={() => setView("list")} 
           className="text-zinc-500 hover:text-white transition-colors flex items-center gap-2 mb-4"
        >
          <ChevronRight className="rotate-180" size={20} /> Voltar aos Simulados
        </button>
        <QuizViewer 
          quiz={activeSimulado} 
          isFinal={false} 
          onBack={() => setView("list")} 
        />
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-20 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <header className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400 text-xs font-black uppercase tracking-widest mb-2">
          <Sparkles size={14} /> Inteligência Artificial Sênior
        </div>
        <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight">
          Treine sua <span className="text-primary-500 text-glow">Aprovação</span>
        </h1>
        <p className="text-zinc-500 max-w-lg mx-auto leading-relaxed">
          Simulados dinâmicos baseados no seu currículo real. Escolha uma área e a IA gerará um exame exclusivo para você.
        </p>
      </header>

      {/* 🔮 SEÇÃO IA: GERADOR DE SIMULADOS */}
      <section className="glass rounded-[3.5rem] p-8 md:p-12 border-white/5 bg-gradient-to-br from-primary-500/5 via-transparent to-transparent relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 blur-[120px] -z-10" />
        
        <div className="flex items-center gap-3 mb-10">
          <Wand2 className="text-primary-400" />
          <h2 className="text-2xl font-black text-white">Forjar Simulado com IA</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {areas.map((area) => (
            <button
              key={area.name}
              disabled={isGenerating}
              onClick={() => handleGenerateSimulado(area.name)}
              className={cn(
                "group p-6 rounded-[2.5rem] bg-zinc-900/50 border border-white/5 hover:border-white/10 transition-all text-left flex flex-col justify-between h-56 relative overflow-hidden hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50",
                isGenerating && selectedArea === area.name && "border-primary-500/50"
              )}
            >
              <div className={cn("p-4 rounded-2xl w-fit transition-transform group-hover:scale-110 group-hover:rotate-6 shadow-xl shadow-black/20", area.bg)}>
                <area.icon className={area.color} size={32} />
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-white mb-1">{area.name}</h3>
                <p className="text-zinc-500 text-xs leading-relaxed font-medium">15 Questões TRI baseadas nos seus materiais.</p>
              </div>

              {isGenerating && selectedArea === area.name ? (
                 <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-20 flex flex-col items-center justify-center text-center p-4">
                    <Zap className="text-primary-400 animate-pulse mb-2" size={32} />
                    <span className="text-[10px] font-black text-white uppercase tracking-tighter">Gerando questões exclusivas...</span>
                 </div>
              ) : (
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ChevronRight className="text-zinc-600" size={24} />
                </div>
              )}
            </button>
          ))}
        </div>
      </section>

      {/* 📚 SEÇÃO: SIMULADOS OFICIAIS (LEGACY) */}
      <div className="space-y-6">
          <div className="flex items-center gap-3 px-4">
            <ClipboardList className="text-zinc-500" size={20} />
            <h2 className="text-xl font-bold text-zinc-300">Banco de Simulados Oficiais</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {initialSimulados.length > 0 ? initialSimulados.map((simu: any) => (
              <div key={simu.id} className="glass p-8 rounded-[2.5rem] border-white/[0.05] hover:border-zinc-700 transition-all flex flex-col justify-between h-full bg-zinc-900/20 group">
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-zinc-100 leading-tight group-hover:text-primary-400 transition-colors">{simu.title}</h3>
                  <p className="text-zinc-500 text-sm leading-relaxed line-clamp-2">{simu.description}</p>
                </div>
                
                <div className="mt-8 pt-6 border-t border-white/[0.03]">
                  <a href={simu.link} target="_blank" rel="noopener noreferrer">
                    <Button variant="secondary" className="w-full py-4 text-[10px] font-black uppercase tracking-widest gap-2 bg-zinc-800 hover:bg-zinc-700">
                      Ver Material Externo
                    </Button>
                  </a>
                </div>
              </div>
            )) : (
                <div className="col-span-full text-center py-24 glass rounded-[3rem] text-zinc-600 border-dashed">
                  Nenhum material cadastrado no banco de reserva.
                </div>
            )}
          </div>
      </div>

      {/* 📈 INFO STATS */}
      <section className="glass rounded-[3.5rem] p-10 border-emerald-500/10 bg-emerald-500/[0.02]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center text-center">
            <div className="space-y-2">
                <Target className="text-emerald-500 mx-auto" size={32} />
                <div className="text-2xl font-black text-white">Treino TRI</div>
                <p className="text-zinc-500 text-xs">Simuladores com algoritmos de dificuldade real.</p>
            </div>
            <div className="space-y-2 border-y md:border-y-0 md:border-x border-white/5 py-8 md:py-0">
                <TrendingUp className="text-primary-500 mx-auto" size={32} />
                <div className="text-2xl font-black text-white">Ranking Global</div>
                <p className="text-zinc-500 text-xs">Simulados IA também contam pontos no ranking.</p>
            </div>
            <div className="px-6">
                <span className="text-xs font-bold text-zinc-600 block mb-3 uppercase tracking-widest">Sugerido para hoje:</span>
                <Button onClick={() => handleGenerateSimulado("Natureza")} variant="secondary" className="w-full py-6 text-sm font-bold bg-zinc-800 hover:bg-zinc-700">
                    Sugerir Simulado Aleatório
                </Button>
            </div>
        </div>
      </section>
    </div>
  );
}
