"use client";

import { useState, useEffect } from "react";
import { Sparkles, Loader2, ArrowRight, CheckCircle2, Zap, Brain, Flame } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

type Difficulty = "facil" | "medio" | "dificil";

const DIFFICULTY_OPTIONS: { value: Difficulty; label: string; desc: string; icon: any; color: string }[] = [
  { value: "facil",   label: "Fácil",   desc: "Conceitos básicos da matéria", icon: Zap,   color: "text-emerald-400 border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20" },
  { value: "medio",   label: "Médio",   desc: "Nível padrão ENEM",            icon: Brain, color: "text-yellow-400 border-yellow-500/40 bg-yellow-500/10 hover:bg-yellow-500/20" },
  { value: "dificil", label: "Difícil", desc: "Alta dificuldade – TRI Pescoço", icon: Flame, color: "text-red-400 border-red-500/40 bg-red-500/10 hover:bg-red-500/20" },
];

export function DailyChallengeCard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [challenge, setChallenge] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [showDifficulty, setShowDifficulty] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>("medio");

  useEffect(() => {
    async function fetchChallenge() {
      try {
        const res = await fetch("/api/daily-challenge");
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Falha ao buscar desafio");
        setChallenge(data);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Erro desconhecido");
      } finally {
        setLoading(false);
      }
    }
    fetchChallenge();
  }, []);

  const handleStart = async () => {
    setGenerating(true);
    try {
      const res = await fetch(`/api/daily-challenge?difficulty=${selectedDifficulty}`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Erro ao gerar desafio");
      router.push(`/simulados/desafio/${data.id}`);
    } catch (err: any) {
      setError(err.message);
      setGenerating(false);
    }
  };

  if (error) {
    return <div className="bg-red-500/20 text-red-400 p-4 rounded-xl border border-red-500/30 text-sm">
      <strong className="block mb-1">Erro no Desafio Diário</strong>{error}
    </div>;
  }

  return (
    <div className="relative group overflow-hidden glass p-1 rounded-3xl border-primary-500/20 shadow-2xl shadow-primary-500/10">
      <div className="absolute inset-0 bg-gradient-to-r from-primary-600/20 via-primary-500/5 to-transparent opacity-50 transition-opacity duration-1000" />

      <div className="relative glass p-6 md:p-8 rounded-[1.4rem] bg-black/40 backdrop-blur-xl h-full border border-white/5">

        {/* ── Cabeçalho / Skeleton ── */}
        <div className={cn("flex flex-col md:flex-row items-center justify-between gap-6", (loading || generating) && "animate-pulse")}>
          <div className="flex-1 space-y-4 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
              <span className="px-3 py-1 bg-primary-500/10 text-primary-400 text-[10px] font-black uppercase tracking-[0.2em] rounded-full flex items-center gap-1.5 border border-primary-500/20">
                <Sparkles size={12} className="animate-pulse" />
                Mestre IA: Grok-2 Sênior
              </span>
            </div>
            
            {loading || generating ? (
              <div className="space-y-3">
                <div className="h-8 w-3/4 bg-white/5 rounded-xl mx-auto md:mx-0" />
                <div className="h-4 w-1/2 bg-white/5 rounded-lg mx-auto md:mx-0" />
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-black text-white">Desafio Diário Personalizado</h2>
                <p className="text-zinc-400 text-sm max-w-lg leading-relaxed">
                  {challenge?.isEnemOver
                    ? "O grande dia chegou! Nossa jornada de desafios diários se encerra aqui."
                    : challenge?.completed
                      ? "Você já concluiu o desafio de hoje. Amanhã tem mais!"
                      : showDifficulty
                        ? "Escolha a dificuldade e prepare-se para começar."
                        : "Seu simulado rápido gerado por IA está pronto. 5 questões inéditas te esperam!"}
                </p>
              </>
            )}
          </div>

          {/* ── Botão / Estado ── */}
          <div className="flex-shrink-0 w-full md:w-auto">
            {loading || generating ? (
              <div className="w-full md:w-48 h-14 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-center gap-3">
                 <Loader2 className="animate-spin text-primary-500" size={20} />
                 <span className="text-sm font-bold text-zinc-500">{generating ? "Gerando..." : "Carregando..."}</span>
              </div>
            ) : challenge?.isEnemOver ? (
              <div className="px-8 py-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold rounded-2xl flex items-center justify-center gap-3">
                <CheckCircle2 size={24} />
                <span>Jornada<br /><span className="text-xs font-normal text-emerald-500/60 uppercase font-black tracking-widest">Concluída</span></span>
              </div>
            ) : challenge?.completed ? (
              <div className="px-8 py-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold rounded-2xl flex items-center justify-center gap-3">
                <CheckCircle2 size={24} />
                <span>Concluído<br /><span className="text-xs font-normal text-emerald-500/60 uppercase font-black tracking-widest">Score: {challenge?.score}pts</span></span>
              </div>
            ) : !showDifficulty ? (
              <button
                onClick={() => setShowDifficulty(true)}
                className="w-full relative px-8 py-4 bg-primary-600 hover:bg-primary-500 text-white font-black rounded-2xl transition-all shadow-xl shadow-primary-600/20 active:scale-95 group/btn flex items-center justify-center gap-3 overflow-hidden"
              >
                <span className="relative z-10">Aceitar Desafio</span>
                <ArrowRight className="group-hover/btn:translate-x-1 transition-transform relative z-10" size={20} />
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300 ease-out" />
              </button>
            ) : null}
          </div>
        </div>

        {/* ── Seletor de Dificuldade (expande após clicar) ── */}
        {showDifficulty && !challenge?.completed && !challenge?.isEnemOver && (
          <div className="mt-6 border-t border-white/5 pt-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <p className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-4 text-center">Selecione a Dificuldade</p>

            <div className="grid grid-cols-3 gap-3 mb-5">
              {DIFFICULTY_OPTIONS.map(opt => {
                const Icon = opt.icon;
                const isSelected = selectedDifficulty === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => setSelectedDifficulty(opt.value)}
                    className={cn(
                      "flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all font-bold text-sm",
                      opt.color,
                      isSelected ? "ring-2 ring-offset-2 ring-offset-black scale-105" : "opacity-70 hover:opacity-100"
                    )}
                  >
                    <Icon size={22} />
                    <span>{opt.label}</span>
                    <span className="text-[10px] font-normal text-center leading-tight opacity-70">{opt.desc}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDifficulty(false)}
                className="flex-1 py-3 rounded-xl border border-white/10 text-zinc-400 hover:text-white text-sm font-bold transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleStart}
                disabled={generating}
                className="flex-[2] py-3 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-black text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {generating ? <><Loader2 size={16} className="animate-spin" /> Gerando...</> : <>Iniciar Simulado <ArrowRight size={16} /></>}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
