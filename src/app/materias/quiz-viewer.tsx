"use client";

import { useState, useTransition, useEffect } from "react";
import { Check, X, ArrowRight, Award, Trophy, RotateCcw, GraduationCap, ChevronLeft, Flame, PenTool, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/base-ui";
import { submitQuizResult, submitFinalExam } from "./actions";

interface QuizViewerProps {
  quiz: any;
  isFinal?: boolean;
  onBack: () => void;
  onBasicPassed?: () => void;
  onFinalPassed?: () => void;
}

export function QuizViewer({ quiz, isFinal = false, onBack, onBasicPassed, onFinalPassed }: QuizViewerProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  
  const [showResults, setShowResults] = useState(false);
  const [showEssayStep, setShowEssayStep] = useState(false);
  const [essayText, setEssayText] = useState("");
  const [essayFeedback, setEssayFeedback] = useState<any>(null);
  const [totalPointsEarned, setTotalPointsEarned] = useState<number | null>(null);

  const [isPending, startTransition] = useTransition();

  // Timer de 15 Minutos (900 Segundos)
  const [timeLeft, setTimeLeft] = useState(15 * 60);

  useEffect(() => {
    if (!isFinal || showResults || isPending) return;
    
    if (timeLeft <= 0) {
      alert("Tempo esgotado! Seu exame está sendo avaliado automaticamente com o que foi respondido.");
      const text = essayText.trim().length > 0 ? essayText : "Em branco. O aluno não enviou texto antes do tempo esgotar.";
      finishFlow(score, text);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    
    return () => clearInterval(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, isFinal, showResults, isPending]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;

  const handleSelect = (optionId: string) => {
    if (isAnswered) return;
    setSelectedOptionId(optionId);
  };

  const handleConfirm = () => {
    if (!selectedOptionId) return;
    const isCorrect = selectedOptionId === currentQuestion.correctOptionId;
    if (isCorrect) setScore(prev => prev + 1);
    setIsAnswered(true);
  };

  const finishFlow = (finalScore: number, finalEssayText?: string) => {
    setShowResults(true);
    startTransition(async () => {
      if (isFinal && quiz.hasEssay && finalEssayText !== undefined) {
        const result = await submitFinalExam(quiz.id, finalScore, finalEssayText);
        if (result.success) {
          setEssayFeedback(result.aiFeedback);
          setTotalPointsEarned(result.totalPointsEarned || 0);
          if (onFinalPassed) onFinalPassed();
        } else {
          alert("Erro ao enviar prova final: " + result.error);
        }
      } else {
        await submitQuizResult(quiz.id, finalScore);
        const isPerfect = finalScore >= quiz.questions.length;

        if (isFinal && isPerfect && onFinalPassed) {
          onFinalPassed();
        } else if (!isFinal && isPerfect && onBasicPassed) {
          onBasicPassed();
        }
      }
    });
  };

  const handleNext = () => {
    const currentIsCorrect = selectedOptionId === currentQuestion.correctOptionId;
    const finalScore = score + (currentIsCorrect ? 1 : 0);
    
    if (isLastQuestion) {
      if (isFinal && quiz.hasEssay && !showEssayStep) {
        setScore(finalScore); // Update score visually for essay step
        setShowEssayStep(true);
      } else {
        finishFlow(finalScore);
      }
    } else {
      if (!isAnswered && selectedOptionId) {
          // just in case they click next before confirming, finish answer
          setIsAnswered(true);
          return;
      }
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOptionId(null);
      setIsAnswered(false);
    }
  };

  const submitEssay = () => {
    const textLines = essayText.split(/\r*\n/).length;

    if (textLines < 7) {
      alert(`A redação precisa ter no mínimo 7 linhas (atualmente tem ${textLines}). Produza mais conteúdo.`);
      return;
    }
    if (textLines > 30) {
      alert(`A redação não pode ultrapassar 30 linhas (atualmente tem ${textLines}). Resuma seu texto.`);
      return;
    }

    const confirmed = window.confirm("Tem certeza que deseja entregar a Redação e encerrar o Exame Final agora? O cálculo de pontos será feio em seguida.");
    if (!confirmed) return;

    finishFlow(score, essayText);
  };

  if (showResults) {
    const finalScore = score;
    const maxQs = quiz.questions.length;
    const objPercentage = Math.round((finalScore / maxQs) * 100);
    const perfectObj = objPercentage === 100;
    const passed = isFinal ? true : objPercentage >= 70; // In final exam with essay, any grade completes the attempt

    return (
      <div className="space-y-6 animate-in fade-in zoom-in-95 duration-700">
        <div className={cn(
          "p-6 md:p-12 rounded-[3.5rem] text-center space-y-8 relative overflow-hidden",
          isFinal ? "glass border border-rose-500/20" : "glass"
        )}>
          <div className={cn(
            "absolute inset-0 -z-10",
            isFinal ? "bg-gradient-to-b from-rose-500/10 to-transparent" : "bg-gradient-to-b from-primary-500/10 to-transparent"
          )} />

          <div className={cn(
            "inline-flex p-6 rounded-full mb-4",
            isFinal ? "bg-rose-500/20 text-rose-400 animate-bounce" :
            passed ? "bg-primary-500/20 text-primary-400 animate-bounce" :
            "bg-zinc-800 text-zinc-400"
          )}>
            {isFinal ? <GraduationCap size={64} /> : passed ? <Trophy size={64} /> : <Award size={64} />}
          </div>

          <div className="space-y-4">
            {isFinal ? (
              <>
                <h2 className="text-4xl font-black text-white">
                  Exame Final Concluído!
                </h2>
                {!essayFeedback && isPending ? (
                  <p className="text-zinc-400 text-lg animate-pulse">O Mestre ENEM 70B está analisando sua redação com rigor cirúrgico...</p>
                ) : (
                  <p className="text-emerald-400 text-lg font-bold">Resumo da sua Avaliação Sênior</p>
                )}
              </>
            ) : (
              <>
                <h2 className="text-4xl font-black text-white">
                  {perfectObj ? "🔥 Perfeito!" : passed ? "Muito Bem!" : "Quase lá!"}
                </h2>
                <p className="text-zinc-500 text-lg">
                  {perfectObj
                    ? "Desafio Básico zerado! A Prova Final foi desbloqueada."
                    : passed
                    ? "Bom resultado! Mas você precisa de 100% para desbloquear a Prova Final."
                    : "Revise o conteúdo e tente novamente para desbloquear a Prova Final."}
                </p>
              </>
            )}
          </div>

          {/* Resultado das Questões Objetivas */}
          <div className="flex justify-center gap-12">
            <div className="text-center">
              <div className={cn(
                "text-5xl font-black",
                isFinal ? "text-rose-400" : "text-primary-500"
              )}>{finalScore}</div>
              <div className="text-xs text-zinc-500 uppercase tracking-widest font-bold">Acertos / {maxQs}</div>
            </div>
            {!isFinal && (
              <div className="text-center">
                <div className={cn(
                  "text-5xl font-black",
                  perfectObj ? "text-emerald-400" : passed ? "text-white" : "text-rose-400"
                )}>{objPercentage}%</div>
                <div className="text-xs text-zinc-500 uppercase tracking-widest font-bold">Aproveitamento</div>
              </div>
            )}
          </div>

          {/* Resultado da Redação (Se aplicável) */}
          {essayFeedback && (
            <div className="bg-black/20 p-6 rounded-3xl border border-white/5 space-y-4 text-left">
              <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <PenTool className="text-rose-400" /> Nota da Redação: <span className="text-rose-400">{essayFeedback.score}/250</span>
                </h3>
                <div className="glass px-4 py-2 rounded-xl border-amber-500/20 text-amber-400 font-bold">
                  Total de Pontos Ganhos: +{totalPointsEarned} Pts!
                </div>
              </div>

              <div className="space-y-4 pt-2">
                <div>
                  <h4 className="text-xs text-zinc-500 uppercase font-bold tracking-widest mb-1">Feedback do Especialista IA</h4>
                  <p className="text-zinc-300 italic">"{essayFeedback.feedback}"</p>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-5 gap-2 pt-4">
                  {[
                    { c: 1, label: "Domínio", v: essayFeedback.c1 },
                    { c: 2, label: "Tema", v: essayFeedback.c2 },
                    { c: 3, label: "Argumentação", v: essayFeedback.c3 },
                    { c: 4, label: "Coesão", v: essayFeedback.c4 },
                    { c: 5, label: "Proposta", v: essayFeedback.c5 },
                  ].map((comp) => (
                    <div key={comp.c} className="bg-white/5 p-3 rounded-2xl flex flex-col justify-center items-center text-center">
                      <span className="text-[10px] text-zinc-400 uppercase font-bold">{comp.label}</span>
                      <span className="text-lg font-bold text-white mt-1">{comp.v}/50</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {!isFinal && perfectObj && (
            <div className="flex items-center justify-center gap-3 py-4 px-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
              <Trophy className="text-emerald-400" size={20} />
              <span className="text-emerald-300 font-bold">Prova Final de Certificação desbloqueada! Volte à trilha.</span>
            </div>
          )}

          <div className="pt-8 flex justify-center">
            <Button onClick={onBack} variant={isFinal && essayFeedback ? "primary" : "secondary"} size="lg" className="rounded-2xl w-full max-w-sm">
              Voltar à Trilha
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ETAPA: REDAÇÃO
  if (showEssayStep) {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-600">
        <div className="flex justify-between items-center px-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-rose-400 text-xs font-black uppercase tracking-widest mb-0.5">
              <GraduationCap size={14} />
              Fase 2: Redação Argumentativa
            </div>
            {isFinal && !showResults && (
              <div className={cn("text-xs font-mono font-black border px-2 py-1 rounded-lg flex items-center gap-1.5 ml-2", timeLeft < 60 ? "bg-red-500/20 text-red-400 border-red-500/50 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.5)]" : "bg-black/50 text-rose-400 border-rose-500/20")}>
                <Clock size={12} />
                {formatTime(timeLeft)}
              </div>
            )}
          </div>
          <div className="text-sm font-bold text-emerald-400 border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 rounded-xl">
            {score} Acertos Objetivos
          </div>
        </div>

        <div className="glass p-8 md:p-12 rounded-[3rem] space-y-8 border-white/5 relative border border-rose-500/10">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-rose-500 to-transparent opacity-40" />

          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-white flex items-center gap-3">
              <PenTool className="text-rose-400" />
              Proposta de Redação
            </h3>
            <div className="bg-black/30 p-6 rounded-3xl border border-white/5 text-zinc-300 font-medium leading-relaxed whitespace-pre-line">
              {quiz.essayPrompt}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-2">Sua Dissertação</label>
            <textarea
              value={essayText}
              onChange={(e) => setEssayText(e.target.value)}
              placeholder="Digite seu texto dissertativo argumentativo aqui..."
              className="w-full bg-black/40 border border-white/10 rounded-3xl p-6 min-h-[300px] text-zinc-100 focus:outline-none focus:ring-2 focus:ring-rose-500/50 resize-y transition-shadow font-medium leading-relaxed"
            />
            <div className="flex justify-end text-xs text-zinc-500 mt-2 px-2 font-medium">
              {essayText.split(/\r*\n/).length} linhas | (Mínimo: 7, Máximo: 30)
            </div>
          </div>

          <div className="pt-6 flex justify-end">
            <Button
              onClick={submitEssay}
              variant="primary"
              size="lg"
              className="px-10 rounded-2xl bg-rose-600 hover:bg-rose-500"
              isLoading={isPending}
            >
              Entregar Exame Final
              <Check size={20} className="ml-2" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ETAPA: MÚLTIPLA ESCOLHA
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-600">
      <div className="flex justify-between items-center px-4">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="text-zinc-500 hover:text-white transition-colors">
            <ChevronLeft size={20} />
          </button>
          <div>
            {isFinal && (
              <div className="flex items-center gap-2 text-rose-400 text-xs font-black uppercase tracking-widest mb-0.5">
                <GraduationCap size={14} /> FASE 1: OBJETIVAS
              </div>
            )}
            <div className="text-sm font-bold text-zinc-500">
              Questão {currentQuestionIndex + 1} de {quiz.questions.length}
            </div>
            {isFinal && !showResults && (
              <div className={cn("text-xs font-mono font-black border px-2 py-1 rounded-lg flex items-center gap-1.5 mt-1", timeLeft < 60 ? "bg-red-500/20 text-red-400 border-red-500/50 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.5)]" : "bg-black/50 text-rose-400 border-rose-500/20")}>
                <Clock size={12} />
                {formatTime(timeLeft)}
              </div>
            )}
          </div>
        </div>
        <div className={cn("h-2 w-48 bg-zinc-900 rounded-full overflow-hidden")}>
          <div
            className={cn(
              "h-full transition-all duration-500",
              isFinal ? "bg-rose-500" : "bg-primary-500"
            )}
            style={{ width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%` }}
          />
        </div>
      </div>

      <div className={cn(
        "p-8 md:p-12 rounded-[3rem] space-y-10 border-white/5 relative",
        isFinal ? "glass border border-rose-500/10" : "glass"
      )}>
        {isFinal && (
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-rose-500 to-transparent opacity-40" />
        )}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 blur-[80px] -z-10" />

        <h3 className="text-2xl font-bold text-white leading-relaxed">
          {currentQuestion.text}
        </h3>

        <div className="grid grid-cols-1 gap-4">
          {currentQuestion.options.map((option: any, i: number) => (
            <button
              key={option.id}
              onClick={() => handleSelect(option.id)}
              disabled={isAnswered}
              className={cn(
                "group p-6 rounded-3xl border text-left transition-all duration-300 relative overflow-hidden",
                selectedOptionId === option.id
                  ? (isAnswered
                      ? (option.id === currentQuestion.correctOptionId
                          ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400"
                          : "bg-rose-500/20 border-rose-500/50 text-rose-400")
                      : "bg-primary-500/20 border-primary-500/50 text-primary-400 scale-[1.02] shadow-xl shadow-primary-500/10")
                  : (isAnswered && option.id === currentQuestion.correctOptionId
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                      : "bg-white/5 border-white/5 text-zinc-400 hover:bg-white/10 hover:border-white/10 hover:text-white")
              )}
            >
              <div className="flex items-center gap-4 relative z-10">
                <div className={cn(
                  "w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm transition-colors",
                  selectedOptionId === option.id ? "bg-primary-500 text-white" : "bg-zinc-800 text-zinc-500 group-hover:bg-zinc-700"
                )}>
                  {String.fromCharCode(65 + i)}
                </div>
                <span className="flex-1 font-medium">{option.text}</span>
                {isAnswered && option.id === currentQuestion.correctOptionId && <Check className="text-emerald-400" size={24} />}
                {isAnswered && selectedOptionId === option.id && option.id !== currentQuestion.correctOptionId && <X className="text-rose-400" size={24} />}
              </div>
            </button>
          ))}
        </div>

        <div className="pt-6 flex justify-end">
          {!isAnswered ? (
            <Button
              onClick={handleConfirm}
              disabled={!selectedOptionId}
              variant="primary"
              size="lg"
              className={cn("px-10 rounded-2xl", isFinal && "bg-rose-600 hover:bg-rose-500")}
            >
              Confirmar Resposta
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              variant="primary"
              size="lg"
              className={cn(
                "px-10 rounded-2xl",
                isFinal ? "bg-rose-600 hover:bg-rose-500" : "bg-emerald-600 hover:bg-emerald-500"
              )}
              isLoading={isPending && isLastQuestion && !quiz.hasEssay}
            >
              {isLastQuestion ? (isFinal && quiz.hasEssay ? "Avançar p/ Redação" : "Finalizar Desafio") : "Próxima Questão"}
              <ArrowRight size={20} className="ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
