"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, User, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

type Message = {
  role: "user" | "model";
  content: string;
};

export function AiTutor() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "model", content: "Olá! Sou o Mestre ENEM, seu tutor de IA. Como posso te ajudar hoje?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Esconder tutor durante simulados (Modo Foco) - Movido para garantir que todos os hooks acima carreguem
  const isFocusMode = pathname.startsWith("/simulados/desafio/");
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  if (isFocusMode) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage]
            .filter((_, i) => i !== 0 || messages[0].role !== "model")
            .map((m) => ({
              role: m.role,
              content: m.content,
            })),
          context: pathname, // Sênior: Enviando o contexto da página para a IA
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || "Erro na resposta da API");
      }

      const data = await response.json();
      
      setMessages((prev) => [
        ...prev,
        { role: "model", content: data.text || "Desculpe, não consegui processar isso." }
      ]);
    } catch (error: any) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        { 
          role: "model", 
          content: `⚠️ Erro de Conexão: ${error.message}. Por favor, verifique se a chave no .env é válida e se você tem cota disponível no Google AI Studio.` 
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-32 right-4 md:bottom-6 md:right-6 z-50">
      {/* Botão flutuante */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-primary-600 hover:bg-primary-500 text-white p-4 rounded-full shadow-lg hover:shadow-primary-500/50 transition-all hover:scale-105 flex items-center justify-center animate-bounce-slow"
        >
          <Sparkles className="w-6 h-6 mr-2" />
          <span className="font-bold">Mestre IA</span>
        </button>
      )}

      {/* Janela do Chat */}
      {isOpen && (
        <div className="bg-zinc-950/95 backdrop-blur-md border border-white/10 w-[90vw] md:w-[350px] lg:w-[400px] h-[70vh] md:h-[500px] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300">
          {/* Header */}
          <div className="bg-primary-600/20 border-b border-primary-500/20 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-primary-600 p-2 rounded-xl">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-bold text-sm">Mestre ENEM 🤖</h3>
                <p className="text-primary-400 text-xs text-green-400 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                  Online
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Mensagens */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((m, i) => (
              <div
                key={i}
                className={cn(
                  "flex max-w-[85%] rounded-2xl px-4 py-3 text-sm animate-in fade-in duration-300",
                  m.role === "user"
                    ? "bg-primary-600 text-white ml-auto rounded-tr-sm"
                    : "bg-zinc-800 text-zinc-200 mr-auto rounded-tl-sm border border-zinc-700"
                )}
              >
                {m.content}
              </div>
            ))}
            {isLoading && (
              <div className="bg-zinc-800 text-zinc-400 mr-auto flex max-w-[85%] rounded-2xl px-4 py-3 text-sm rounded-tl-sm border border-zinc-700 items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce [animation-delay:0.4s]"></span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSubmit} className="p-3 border-t border-white/10 bg-zinc-900/50">
            <div className="relative flex items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Pergunte sobre matemática, redação..."
                className="w-full bg-zinc-800 border-none rounded-full py-3 pl-4 pr-12 text-sm text-white placeholder-zinc-500 focus:ring-1 focus:ring-primary-500 outline-none"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="absolute right-2 p-1.5 bg-primary-600 text-white rounded-full hover:bg-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
