"use client";

import { useState, useRef, useEffect } from "react";
import { Send, User, Bot, Loader2, BookOpen, ChevronLeft } from "lucide-react";
import { chatWithTeacher } from "../actions";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ChatPage({ params }: { params: { subject: string } }) {
  const router = useRouter();
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const subjectName = params.subject.charAt(0).toUpperCase() + params.subject.slice(1);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await chatWithTeacher(subjectName, input, messages);
      setMessages((prev) => [...prev, { role: "assistant", content: res.response }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Erro de conexão com o professor. Tente de novo!" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-180px)] max-w-4xl mx-auto glass rounded-[2rem] border-white/5 overflow-hidden shadow-2xl">
      {/* Header */}
      <header className="px-8 py-6 border-b border-white/5 bg-white/2 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-white/5 rounded-xl transition-colors text-zinc-400">
            <ChevronLeft size={20} />
          </button>
          <div>
             <h1 className="text-xl font-black text-white flex items-center gap-2">
                <BookOpen className="text-primary-400 w-5 h-5" />
                Professor de {subjectName} IA
             </h1>
             <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Sempre Online para te ajudar</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
           <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
           <span className="text-[10px] text-emerald-400 font-black uppercase">Ativo</span>
        </div>
      </header>

      {/* Messages area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-thin scrollbar-thumb-white/10"
      >
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-20 px-10">
            <div className="p-4 bg-primary-500/10 rounded-3xl border border-primary-500/20">
              <Bot size={40} className="text-primary-400" />
            </div>
            <h2 className="text-2xl font-black text-white">Fale com seu Professor</h2>
            <p className="text-zinc-500 text-sm max-w-sm">
              Tire dúvidas específicas sobre {subjectName}, peça explicações de fórmulas ou exercícios.
            </p>
            <div className="flex flex-wrap gap-2 justify-center pt-4">
               {["Me explique...", "Qual a fórmula de...", "Como cai no ENEM?"].map(hint => (
                  <button 
                    key={hint} 
                    onClick={() => setInput(hint)}
                    className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-zinc-400 hover:text-white hover:bg-white/10 transition-all"
                  >
                    {hint}
                  </button>
               ))}
            </div>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div 
            key={idx} 
            className={cn(
              "flex gap-4 group animate-in slide-in-from-bottom-2 duration-300",
              msg.role === "user" ? "flex-row-reverse" : ""
            )}
          >
            <div className={cn(
               "w-10 h-10 rounded-2xl flex-shrink-0 flex items-center justify-center border transition-all",
               msg.role === "user" ? "bg-zinc-900 border-white/10" : "bg-primary-500/20 border-primary-500/30 text-primary-400"
            )}>
              {msg.role === "user" ? <User size={20} className="text-zinc-500" /> : <Bot size={20} />}
            </div>
            <div className={cn(
               "max-w-[80%] px-5 py-4 rounded-3xl text-sm leading-relaxed",
               msg.role === "user" 
                  ? "bg-zinc-800 text-zinc-100 rounded-tr-none" 
                  : "bg-white/3 text-zinc-200 border border-white/5 rounded-tl-none"
            )}>
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-4 animate-pulse">
            <div className="w-10 h-10 rounded-2xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center">
               <Loader2 size={20} className="text-primary-400 animate-spin" />
            </div>
            <div className="bg-white/2 border border-white/5 px-5 py-4 rounded-3xl rounded-tl-none w-20" />
          </div>
        )}
      </div>

      {/* Input area */}
      <footer className="p-6 bg-white/2 border-t border-white/5">
        <div className="relative group">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder={`Sua dúvida sobre ${subjectName}...`}
            className="w-full bg-zinc-950/50 border border-white/10 focus:border-primary-500/50 focus:ring-4 focus:ring-primary-500/5 px-6 py-4 rounded-3xl text-sm transition-all outline-none pr-14"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-primary-600 hover:bg-primary-500 text-white rounded-2xl transition-all disabled:opacity-50 disabled:grayscale"
          >
            <Send size={18} />
          </button>
        </div>
      </footer>
    </div>
  );
}
