"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { submitDailyChallenge, explainQuestion } from "../actions";
import { 
  Loader2, CheckCircle, ChevronRight, Trophy, 
  XCircle, HelpCircle, ChevronDown, Sparkles, BookOpen, Clock, Zap 
} from "lucide-react";
import { cn } from "@/lib/utils";

type Option = { id: string; text: string };

type QuestionProps = {
  id: string;
  text: string;
  options: Option[];
};

type ReviewData = {
  questionId: string;
  userOptionId: string;
  correct: boolean;
  correctOptionId: string;
};

// Componente individual de revisão de questão com Tirar Dúvidas com IA
function QuestionReview({ 
  question, 
  review, 
  index 
}: { 
  question: QuestionProps; 
  review: ReviewData; 
  index: number; 
}) {
  const [open, setOpen] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [loadingExplanation, setLoadingExplanation] = useState(false);

  const correctOption = question.options.find(o => o.id === review.correctOptionId);

  const handleExplain = async () => {
    if (explanation) { setOpen(o => !o); return; }
    setOpen(true);
    setLoadingExplanation(true);
    try {
      const res = await explainQuestion(
        question.text,
        question.options.map(o => o.text),
        correctOption?.text || ""
      );
      setExplanation(res.explanation);
    } catch {
      setExplanation("Não foi possível carregar a explicação. Tente novamente.");
    } finally {
      setLoadingExplanation(false);
    }
  };

  return (
    <div className={cn(
      "rounded-3xl border overflow-hidden transition-all",
      review.correct 
        ? "border-emerald-500/30 bg-emerald-500/5" 
        : "border-red-500/30 bg-red-500/5"
    )}>
      {/* Cabeçalho da questão */}
      <div className="p-6 md:p-8">
        <div className="flex items-start gap-4 mb-6">
          <div className={cn(
            "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-black text-sm",
            review.correct ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
          )}>
            {review.correct ? <CheckCircle size={20} /> : <XCircle size={20} />}
          </div>
          <div className="flex-1">
            <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-1">
              Questão {index + 1} — {review.correct ? "Acertou! ✅" : "Errou ❌"}
            </p>
            <p className="text-zinc-200 leading-relaxed text-sm md:text-base">{question.text}</p>
          </div>
        </div>

        {/* Alternativas com gabarito visual */}
        <div className="space-y-2 ml-14">
          {question.options.map((opt, optIndex) => {
            const isCorrect = opt.id === review.correctOptionId;
            const isUserAnswer = opt.id === review.userOptionId;
            const isWrong = isUserAnswer && !isCorrect;

            return (
              <div key={opt.id} className={cn(
                "flex gap-3 items-center px-4 py-3 rounded-xl text-sm transition-all",
                isCorrect ? "bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 font-bold" :
                isWrong   ? "bg-red-500/15 border border-red-500/40 text-red-300 line-through opacity-70" :
                            "bg-white/3 border border-white/5 text-zinc-500"
              )}>
                <span className={cn(
                  "flex-shrink-0 w-6 h-6 rounded-full border flex items-center justify-center text-xs font-black",
                  isCorrect ? "border-emerald-400 text-emerald-400" :
                  isWrong   ? "border-red-400 text-red-400" :
                              "border-zinc-700 text-zinc-600"
                )}>
                  {String.fromCharCode(65 + optIndex)}
                </span>
                {opt.text}
                {isCorrect && <span className="ml-auto text-xs text-emerald-500">← Correta</span>}
                {isWrong   && <span className="ml-auto text-xs text-red-400">← Sua resposta</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Botão Tirar Dúvidas com IA */}
      <div className="border-t border-white/5 px-6 md:px-8">
        <button
          onClick={handleExplain}
          className={cn(
            "w-full flex items-center gap-3 py-4 text-sm font-bold transition-all group",
            open ? "text-primary-400" : "text-zinc-400 hover:text-primary-400"
          )}
        >
          <Sparkles size={16} className={cn("transition-all", open && "text-primary-400 animate-pulse")} />
          Tirar Dúvidas com IA
          <ChevronDown size={16} className={cn("ml-auto transition-transform duration-300", open && "rotate-180")} />
        </button>

        {/* Painel de explicação expandível */}
        {open && (
          <div className="pb-6 animate-in fade-in slide-in-from-top-2 duration-300">
            {loadingExplanation ? (
              <div className="flex items-center gap-3 p-4 bg-primary-500/10 border border-primary-500/20 rounded-2xl text-primary-400">
                <Loader2 size={18} className="animate-spin flex-shrink-0" />
                <span className="text-sm">Professor IA analisando a questão...</span>
              </div>
            ) : explanation ? (
              <div className="p-5 bg-primary-500/10 border border-primary-500/20 rounded-2xl">
                <div className="flex items-center gap-2 mb-3">
                  <BookOpen size={16} className="text-primary-400" />
                  <span className="text-xs font-black uppercase tracking-widest text-primary-400">Explicação do Professor IA</span>
                </div>
                <div className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap">
                  {explanation}
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}

// Componente principal do Quiz
export function QuizInteractive({ 
  challengeId, 
  questions,
  alreadyCompleted = false,
  alreadyScore = null
}: { 
  challengeId: string;
  questions: QuestionProps[];
  alreadyCompleted?: boolean;
  alreadyScore?: number | null;
}) {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [finished, setFinished] = useState(alreadyCompleted);
  const [result, setResult] = useState<{
    score: number; 
    correctCount: number; 
    reviewData: ReviewData[];
  } | null>(
    alreadyCompleted && alreadyScore !== null 
      ? { score: alreadyScore, correctCount: alreadyScore / 20, reviewData: [] } 
      : null
  );

  const currentQuestion = questions[activeStep];
  const isQuestionAnswered = !!answers[currentQuestion?.id];
  const isLastStep = activeStep === questions.length - 1;
  const isAllAnswered = questions.length === Object.keys(answers).length;

  const handleSelect = (questionId: string, optionId: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionId }));
    if (showConfirm) setShowConfirm(false);
  };

  const handleNext = () => {
    if (activeStep < questions.length - 1) {
      setActiveStep(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Timer: 10 minutos para o desafio (600 segundos)
  const [timeLeft, setTimeLeft] = useState(600);
  const [timerActive, setTimerActive] = useState(!alreadyCompleted);
  const [showConfirm, setShowConfirm] = useState(false);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async () => {
    if (loading || finished) return;
    
    // Se não estiver confirmado, pede confirmação
    if (!showConfirm) {
      setShowConfirm(true);
      return;
    }

    try {
      setLoading(true);
      setTimerActive(false);
      setShowConfirm(false);
      const res = await submitDailyChallenge(challengeId, answers);
      const reviewData: ReviewData[] = res.reviewData || [];
      setResult({ score: res.score, correctCount: res.correctCount, reviewData });
      setFinished(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      alert("Erro ao enviar respostas. Tente novamente.");
      setLoading(false);
      setTimerActive(true);
    }
  };

  useEffect(() => {
    if (!timerActive || finished) return;
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, timerActive, finished]);

  // ─── Tela de Resultado + Revisão ──────────────────────────────────────────
  if (finished && result) {
    const pct = Math.round((result.correctCount / questions.length) * 100);
    
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        {/* Card de Pontuação */}
        <div className="glass p-10 rounded-[2rem] text-center border border-primary-500/20 shadow-2xl shadow-primary-500/10">
          <div className="inline-flex items-center justify-center p-5 bg-primary-500/20 rounded-full mb-5">
            <Trophy className="text-primary-400 w-14 h-14" />
          </div>
          <h2 className="text-4xl font-black mb-2">Simulado Finalizado!</h2>
          <p className="text-zinc-400 mb-8">
            Você acertou <strong className="text-white font-black">{result.correctCount}</strong> de {questions.length} questões ({pct}% de aproveitamento)
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <div className="bg-white/5 border border-white/10 rounded-2xl px-8 py-5">
              <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider block mb-1">XP Ganho</span>
              <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-purple-500">
                +{result.score} pts
              </span>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl px-8 py-5">
              <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider block mb-1">Aproveitamento</span>
              <span className={cn(
                "text-4xl font-black",
                pct >= 80 ? "text-emerald-400" : pct >= 60 ? "text-yellow-400" : "text-red-400"
              )}>
                {pct}%
              </span>
            </div>
          </div>

          <button 
            onClick={() => router.push("/dashboard")}
            className="px-10 py-4 bg-white text-black font-black rounded-2xl hover:bg-zinc-200 transition-all flex items-center justify-center mx-auto gap-2"
          >
            Voltar ao Painel <ChevronRight size={20} />
          </button>
        </div>

        {/* Revisão por Questão */}
        {result.reviewData.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 px-2">
              <HelpCircle size={18} className="text-primary-400" />
              <h3 className="text-lg font-black text-white">Revisão das Questões</h3>
              <span className="text-xs text-zinc-500">— Clique em "Tirar Dúvidas" em qualquer questão</span>
            </div>

            {questions.map((q, i) => {
              const rev = result.reviewData.find(r => r.questionId === q.id);
              if (!rev) return null;
              return (
                <QuestionReview key={q.id} question={q} review={rev} index={i} />
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // ─── Tela do Quiz em Andamento (Format Stepper) ──────────────────────────────────
  return (
    <div className="space-y-8 pb-24">
      {/* Indicador de Progresso */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
           <Zap className="text-primary-400 w-4 h-4" />
           <span className="text-xs font-black uppercase tracking-widest text-zinc-500">
             Questão {activeStep + 1} de {questions.length}
           </span>
        </div>
        <div className="flex gap-1">
          {questions.map((_, i) => (
            <div 
              key={i} 
              className={cn(
                "h-1 rounded-full transition-all",
                i === activeStep ? "w-8 bg-primary-500 shadow-[0_0_10px_var(--tw-shadow-color)] shadow-primary-500" : 
                i < activeStep ? "w-4 bg-emerald-500/50" : "w-4 bg-white/10"
              )} 
            />
          ))}
        </div>
      </div>

      {/* Card da Questão Atual */}
      <div className="animate-in fade-in slide-in-from-right-4 duration-500">
        <div className="glass p-5 md:p-12 rounded-[2.5rem] border border-white/5 relative overflow-hidden group">
          <h3 className="text-lg md:text-2xl font-bold mb-8 text-zinc-100 leading-relaxed relative z-10">
            {currentQuestion.text}
          </h3>
          
          <div className="space-y-2 relative z-10">
            {currentQuestion.options.map((opt, optIndex) => {
              const selected = answers[currentQuestion.id] === opt.id;
              
              return (
                <button
                  key={opt.id}
                  onClick={() => handleSelect(currentQuestion.id, opt.id)}
                  className={cn(
                    "w-full text-left p-4 md:p-6 rounded-2xl transition-all font-medium flex gap-3 md:gap-4 items-center group/opt",
                    selected 
                      ? "bg-primary-600/20 border-primary-500 shadow-xl shadow-primary-500/10 border-2" 
                      : "bg-white/2 border border-white/5 hover:bg-white/5 hover:border-white/10 text-zinc-400"
                  )}
                >
                  <div className={cn(
                    "w-7 h-7 md:w-8 md:h-8 rounded-xl border-2 flex items-center justify-center flex-shrink-0 transition-all font-black text-[10px] md:text-xs",
                    selected ? "border-primary-500 bg-primary-500 text-black" : "border-zinc-700 text-zinc-600 group-hover/opt:border-zinc-500"
                  )}>
                    {String.fromCharCode(65 + optIndex)}
                  </div>
                  <span className={cn("text-base", selected ? "text-white font-bold" : "")}>{opt.text}</span>
                  {selected && <CheckCircle size={20} className="ml-auto text-primary-500 animate-in zoom-in" />}
                </button>
              );
            })}
          </div>

          <div className="absolute top-0 right-0 p-8 opacity-5">
             <Sparkles size={120} />
          </div>
        </div>
      </div>

      {/* Barra Inferior de Navegação Sênior */}
      <div className="fixed bottom-0 inset-x-0 p-6 bg-gradient-to-t from-black via-black/90 to-transparent flex items-center justify-center gap-4 z-50">
        <div className="max-w-3xl w-full flex items-center justify-between gap-4">
          
          {/* Timer Display */}
          <div className="flex items-center gap-2 px-4 py-3 md:px-6 md:py-4 bg-zinc-900/50 backdrop-blur-xl border border-white/10 rounded-2xl">
            <Clock size={16} className={cn(timeLeft < 60 ? "text-red-400 animate-pulse" : "text-primary-400")} />
            <span className={cn("font-mono text-base md:text-lg font-black", timeLeft < 60 ? "text-red-400" : "text-white")}>
              {formatTime(timeLeft)}
            </span>
          </div>

          <div className="flex flex-1 gap-2 md:gap-3">
            <button
              onClick={handleBack}
              disabled={activeStep === 0}
              className="px-4 py-3 md:px-6 md:py-4 bg-white/5 border border-white/10 rounded-2xl font-bold text-xs md:text-base text-zinc-400 hover:text-white disabled:opacity-20 transition-all"
            >
              Anterior
            </button>

            {!isLastStep ? (
              <button
                onClick={handleNext}
                disabled={!isQuestionAnswered}
                className={cn(
                  "flex-1 px-4 py-4 md:px-8 md:py-5 rounded-2xl font-black text-xs md:text-lg transition-all flex items-center justify-center gap-2 md:gap-3",
                  isQuestionAnswered
                    ? "bg-primary-600 hover:bg-primary-500 text-white shadow-xl shadow-primary-500/20"
                    : "bg-zinc-800 text-zinc-500 border border-zinc-700 cursor-not-allowed opacity-50"
                )}
              >
                <span className="hidden sm:inline">Próxima Questão</span>
                <span className="sm:hidden">Próxima</span>
                <ChevronRight size={18} />
              </button>
            ) : (
              <button
                disabled={!isAllAnswered || loading}
                onClick={handleSubmit}
                className={cn(
                  "flex-1 px-4 py-4 md:px-8 md:py-5 rounded-2xl font-black text-xs md:text-lg transition-all flex items-center justify-center gap-2 md:gap-3",
                  showConfirm 
                    ? "bg-red-600 hover:bg-red-500 text-white shadow-xl shadow-red-500/40 animate-pulse"
                    : isAllAnswered && !loading
                      ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-xl shadow-emerald-500/40"
                      : "bg-zinc-800 text-zinc-500 border border-zinc-700 cursor-not-allowed opacity-50"
                )}
              >
                {loading ? (
                  <><Loader2 className="animate-spin w-4 h-4 md:w-5 md:h-5" /> <span className="hidden sm:inline">Corrigindo...</span></>
                ) : showConfirm ? (
                  "ENTREGAR"
                ) : (
                  <span className="text-[10px] md:text-lg">FINALIZAR</span>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
