"use client";

import { useState } from "react";
import { 
  PenTool, Send, Loader2, Sparkles, AlertTriangle, 
  CheckCircle2, Info, ChevronRight, BarChart, Shield,
  BookOpen, FileText, MessageSquare, Layout
} from "lucide-react";
import { calculateEssayScore, getEssayHistory } from "./actions";
import { cn } from "@/lib/utils";
import { useEffect } from "react";

type CorrectionResult = {
  id?: string;
  c1: { score: number; explanation: string };
  c2: { score: number; explanation: string };
  c3: { score: number; explanation: string };
  c4: { score: number; explanation: string };
  c5: { score: number; explanation: string };
  total: number;
  feedback: string;
  teacherFeedback?: string;
  structure?: {
    intro: string;
    dev: string;
    conc: string;
  };
  aiProbability: number;
  aiReason: string;
  content?: string;
  createdAt?: string;
};

export default function RedacaoPage() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CorrectionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<CorrectionResult[]>([]);
  const [view, setView] = useState<"editor" | "historico">("editor");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const data = await getEssayHistory();
      setHistory(data.map(e => ({
        id: e.id,
        content: e.content,
        total: e.score,
        feedback: e.feedback,
        teacherFeedback: (e as any).teacherFeedback || undefined,
        c1: { score: e.c1, explanation: "" },
        c2: { score: e.c2, explanation: "" },
        c3: { score: e.c3, explanation: "" },
        c4: { score: e.c4, explanation: "" },
        c5: { score: e.c5, explanation: "" },
        aiProbability: e.aiProbability,
        aiReason: e.aiReason,
        createdAt: e.createdAt.toISOString()
      })));
    } catch (err) {
      console.error("Erro ao carregar histórico");
    }
  };

  const handleCorrect = async () => {
    if (wordCount < 100) return;
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const data = await calculateEssayScore(text);
      setResult(data);
      fetchHistory(); // Atualizar histórico após correção
    } catch (err: any) {
      console.error("Erro na correção:", err);
      setError(err.message || "Ocorreu um erro inesperado. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const selectFromHistory = (essay: CorrectionResult) => {
    setResult(essay);
    setText(essay.content || "");
    setView("editor");
  };

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  const getScoreColor = (score: number) => {
    if (score >= 160) return "text-emerald-400 border-emerald-500/30 bg-emerald-500/10";
    if (score >= 120) return "text-yellow-400 border-yellow-500/30 bg-yellow-500/10";
    return "text-red-400 border-red-500/30 bg-red-500/10";
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="border-b border-white/5 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-primary-400 mb-2">
            <Sparkles size={20} className="fill-primary-400/20" />
            <span className="text-xs font-black uppercase tracking-widest">Inteligência Artificial</span>
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight mb-2">Editor de Redação</h1>
          <p className="text-zinc-400">
            Escreva ou cole sua redação abaixo para uma correção instantânea.
          </p>
        </div>
        <div className="flex p-1 bg-white/5 rounded-2xl border border-white/5 self-start md:self-auto">
           <button 
             onClick={() => setView("editor")}
             className={cn("px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all", view === "editor" ? "bg-white text-black shadow-xl" : "text-zinc-500")}>
             Nova Redação
           </button>
           <button 
             onClick={() => setView("historico")}
             className={cn("px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all", view === "historico" ? "bg-white text-black shadow-xl" : "text-zinc-500")}>
             Suas Redações ({history.length})
           </button>
        </div>
      </header>

      {view === "historico" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-right-4 duration-500">
           {history.length > 0 ? history.map((e) => (
             <div key={e.id} onClick={() => selectFromHistory(e)} className="glass p-8 rounded-[2rem] border-white/5 hover:border-primary-500/20 transition-all cursor-pointer group">
                <div className="flex justify-between items-start mb-4">
                   <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                      {new Date(e.createdAt!).toLocaleDateString()}
                   </div>
                   <div className="px-2 py-1 bg-primary-500/10 text-primary-400 text-xs font-black rounded-lg">
                      {e.total} pts
                   </div>
                </div>
                <h3 className="text-white font-bold mb-4 line-clamp-2">Redação em {new Date(e.createdAt!).toLocaleDateString()}</h3>
                <p className="text-zinc-500 text-[10px] uppercase font-black tracking-widest flex items-center gap-2 group-hover:text-primary-400 transition-colors">
                   Revisar Análise <ChevronRight size={14} />
                </p>
             </div>
           )) : (
             <div className="col-span-full py-20 text-center glass rounded-[2rem] border-dashed border-white/10 border-2">
                <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Ainda não há redações no histórico.</p>
             </div>
           )}
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-10 items-start animate-in fade-in slide-in-from-left-4 duration-500">
        {/* Lado do Editor */}
        <div className="space-y-6">
          <div className="glass p-8 rounded-[2rem] border-white/5 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3 text-white font-black uppercase text-xs tracking-widest">
                <PenTool size={18} className="text-primary-400" />
                Seu Texto
              </div>
              <div className={cn(
                "px-3 py-1 rounded-full text-[10px] font-black tracking-widest border",
                wordCount < 100 ? "text-zinc-500 border-white/10" : "text-emerald-400 border-emerald-500/20"
              )}>
                {wordCount} PALAVRAS
              </div>
            </div>

            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Comece sua redação aqui (mínimo 100 palavras)..."
              disabled={loading}
              className="w-full h-80 bg-zinc-950/30 border border-white/5 rounded-2xl p-6 text-zinc-200 text-sm leading-relaxed focus:border-primary-500/50 outline-none transition-all scrollbar-thin scrollbar-thumb-white/10 resize-none"
            />

            <div className="mt-6 flex flex-col sm:flex-row gap-4">
              <button
                disabled={wordCount < 100 || loading}
                onClick={handleCorrect}
                className={cn(
                  "flex-1 px-8 py-4 rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-3",
                  wordCount >= 100 && !loading
                    ? "bg-primary-600 hover:bg-primary-500 text-white shadow-xl shadow-primary-500/20"
                    : "bg-zinc-800 text-zinc-500 border border-zinc-700 opacity-50 cursor-not-allowed"
                )}
              >
                {loading ? (
                  <><Loader2 className="animate-spin" /> Corrigindo Redação IA...</>
                ) : (
                  <><BarChart /> Analisar pelas 5 Competências</>
                )}
              </button>
              <button 
                onClick={() => setText("")}
                className="px-6 py-4 rounded-2xl border border-white/5 text-zinc-400 font-bold hover:bg-white/5"
              >
                Limpar
              </button>
            </div>
            
            {wordCount < 100 && wordCount > 0 && (
              <div className="mt-4 flex items-center gap-2 text-yellow-500/80 text-[10px] font-bold uppercase tracking-widest justify-center">
                <AlertTriangle size={12} />
                Escreva pelo menos 100 palavras para uma análise confiável.
              </div>
            )}
          </div>
        </div>

        {/* Lado do Resultado */}
        <div className="space-y-6">
          {error && (
             <div className="glass p-10 rounded-[2rem] border-red-500/20 bg-red-500/5 flex flex-col items-center justify-center text-center py-20 border-2 animate-in zoom-in-95">
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
                   <AlertTriangle size={24} className="text-red-400" />
                </div>
                <h3 className="text-lg font-black text-red-200 mb-2">Falha na Análise</h3>
                <p className="text-zinc-400 max-w-xs text-xs mb-6">{error}</p>
                <button 
                  onClick={handleCorrect}
                  className="px-6 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 text-[10px] font-black uppercase tracking-widest rounded-xl border border-red-500/30 transition-all"
                >
                  Tentar Novamente
                </button>
             </div>
          )}

          {!result && !loading && !error && (
             <div className="glass p-10 rounded-[2rem] border-dashed border-white/10 flex flex-col items-center justify-center text-center py-40 border-2">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
                   <Info size={30} className="text-zinc-700" />
                </div>
                <h3 className="text-xl font-black text-zinc-700 mb-2">Pronto para a Nota 1000?</h3>
                <p className="text-zinc-500 max-w-xs text-sm">Sua correção detalhada aparecerá aqui logo após clicar no botão de análise.</p>
             </div>
          )}

          {loading && (
             <div className="glass p-10 rounded-[2rem] border-white/5 flex flex-col items-center justify-center text-center py-40 animate-pulse">
                <div className="w-20 h-20 bg-primary-500/10 rounded-full flex items-center justify-center mb-6">
                   <Loader2 size={32} className="text-primary-400 animate-spin" />
                </div>
                <h3 className="text-xl font-black text-primary-400 mb-2">Professor IA Avaliando</h3>
                <p className="text-zinc-500 max-w-xs text-sm">Analisando coesão, coerência, gramática e proposta de intervenção...</p>
             </div>
          )}

          {result && (
            <div className="space-y-6 animate-in zoom-in-95 duration-500">
              {/* Card de Pontuação Total */}
              <div className="glass p-8 rounded-[2rem] border-emerald-500/20 bg-emerald-500/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 text-6xl font-black text-emerald-500/10">
                   {result.total}
                </div>
                <div className="flex items-center gap-4 mb-2">
                    <CheckCircle2 size={24} className="text-emerald-400" />
                    <span className="text-xs font-black uppercase tracking-[0.2em] text-emerald-400/80">Nota Estimada Final</span>
                </div>
                <div className="text-6xl font-black text-white">{result.total} <span className="text-emerald-500/50 text-3xl">/ 1000</span></div>
                <p className="text-sm text-zinc-400 mt-4 leading-relaxed line-clamp-2 md:line-clamp-none">{result.feedback}</p>
              </div>

              {/* Feedback Humano (Sênior) */}
              {result.teacherFeedback && (
                <div className="glass p-6 rounded-3xl border border-primary-500/30 bg-primary-500/10 animate-in slide-in-from-left-4 duration-500">
                   <div className="flex items-center gap-3 mb-3">
                      <MessageSquare className="text-primary-400" size={20} />
                      <h3 className="text-xs font-black uppercase tracking-widest text-primary-400">Feedback do Mentor Humano</h3>
                   </div>
                   <p className="text-sm text-zinc-200 leading-relaxed italic">
                      "{result.teacherFeedback}"
                   </p>
                </div>
              )}

              {/* Detecção de IA */}
              <div className={cn(
                "glass p-6 rounded-3xl border transition-all",
                result.aiProbability > 70 ? "bg-red-500/10 border-red-500/30" : 
                result.aiProbability > 40 ? "bg-yellow-500/10 border-yellow-500/30" : 
                "bg-emerald-500/10 border-emerald-500/30"
              )}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Shield className={cn(
                      "w-5 h-5",
                      result.aiProbability > 70 ? "text-red-400" : 
                      result.aiProbability > 40 ? "text-yellow-400" : 
                      "text-emerald-400"
                    )} />
                    <span className="text-xs font-black uppercase tracking-widest text-white">Detecção de IA</span>
                  </div>
                  <div className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-black border",
                    result.aiProbability > 70 ? "text-red-400 border-red-500/40" : 
                    result.aiProbability > 40 ? "text-yellow-400 border-yellow-500/40" : 
                    "text-emerald-400 border-emerald-500/40"
                  )}>
                    {result.aiProbability}% PROBABILIDADE
                  </div>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed italic">
                  "{result.aiReason}"
                </p>
                {result.aiProbability > 70 && (
                  <div className="mt-4 p-3 bg-red-500/20 border border-red-500/40 rounded-xl flex items-center gap-3">
                    <AlertTriangle size={14} className="text-red-400" />
                    <span className="text-[10px] font-bold text-red-200 uppercase tracking-tighter">PADRÃO DE TEXTO ALTAMENTE ESTRUTURADO (ESTILO ACADÊMICO).</span>
                  </div>
                )}
              </div>

              {/* Análise de Estrutura (Sênior) */}
              {result.structure && (
                <div className="glass p-6 rounded-3xl border border-white/5 bg-white/5 space-y-4">
                   <div className="flex items-center gap-3 mb-2">
                     <Layout size={18} className="text-primary-400" />
                     <h3 className="text-xs font-black uppercase tracking-widest text-white">Análise de Estrutura</h3>
                   </div>
                   
                   <div className="space-y-3">
                      <div className="p-4 rounded-2xl bg-zinc-950/30 border border-white/5">
                        <div className="flex items-center gap-2 mb-1">
                          <BookOpen size={14} className="text-blue-400" />
                          <span className="text-[10px] font-black uppercase text-blue-400">Introdução & Tese</span>
                        </div>
                        <p className="text-[11px] text-zinc-400 leading-relaxed italic">"{result.structure.intro}"</p>
                      </div>

                      <div className="p-4 rounded-2xl bg-zinc-950/30 border border-white/5">
                        <div className="flex items-center gap-2 mb-1">
                          <FileText size={14} className="text-purple-400" />
                          <span className="text-[10px] font-black uppercase text-purple-400">Desenvolvimento & Argumentos</span>
                        </div>
                        <p className="text-[11px] text-zinc-400 leading-relaxed italic">"{result.structure.dev}"</p>
                      </div>

                      <div className="p-4 rounded-2xl bg-zinc-950/30 border border-white/5">
                        <div className="flex items-center gap-2 mb-1">
                          <MessageSquare size={14} className="text-emerald-400" />
                          <span className="text-[10px] font-black uppercase text-emerald-400">Conclusão (Proposta Inep)</span>
                        </div>
                        <p className="text-[11px] text-zinc-400 leading-relaxed italic">"{result.structure.conc}"</p>
                      </div>
                   </div>
                </div>
              )}

              {/* Grid de Competências */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4">
                {[
                  { id: "C1", label: "Domínio Gramatical", res: result.c1 },
                  { id: "C2", label: "Tema e Conceitos", res: result.c2 },
                  { id: "C3", label: "Organização", res: result.c3 },
                  { id: "C4", label: "Mecanismos de Coesão", res: result.c4 },
                  { id: "C5", label: "Proposta Intervenção", res: result.c5 },
                ].map((comp, i) => (
                  <div key={i} className="glass p-5 rounded-3xl border-white/5 hover:bg-white/5 transition-all">
                    <div className="flex items-center justify-between mb-4">
                       <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{comp.id}</span>
                       <div className={cn("px-2 py-1 rounded-lg text-xs font-black border", getScoreColor(comp.res.score))}>
                          {comp.res.score} pts
                       </div>
                    </div>
                    <h4 className="text-sm font-bold text-white mb-2">{comp.label}</h4>
                    <p className="text-[11px] text-zinc-500 leading-relaxed">{comp.res.explanation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      )}
    </div>
  );
}
