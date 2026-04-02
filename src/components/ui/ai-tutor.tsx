"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, User, Sparkles, Camera, Image as ImageIcon, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

type Message = {
  role: "user" | "model";
  content: string;
  image?: string;
};

export function AiTutor() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "model", content: "Olá! Sou seu tutor digital. Estou aqui para tornar seus estudos mais leves e produtivos. O que vamos aprender hoje? ✨" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
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
    if ((!input.trim() && !selectedImage) || isLoading) return;

    const currentImage = selectedImage;
    const userMessage: Message = { 
      role: "user", 
      content: input || "Analisando imagem...",
      image: currentImage || undefined
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setSelectedImage(null);
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
          context: pathname,
          image: currentImage, // Enviando a imagem base64
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) {
      alert("A imagem é muito grande. Use fotos de até 4MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed bottom-32 right-4 md:bottom-6 md:right-6 z-50">
      {/* Botão flutuante */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-primary-600 hover:bg-primary-500 text-white p-4 rounded-full shadow-2xl hover:shadow-primary-500/40 transition-all hover:scale-110 flex items-center justify-center group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          <MessageCircle className="w-6 h-6 transition-transform group-hover:rotate-12" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-zinc-950 shadow-sm" />
        </button>
      )}

      {/* Janela do Chat */}
      {isOpen && (
        <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/5 w-[90vw] md:w-[380px] h-[75vh] md:h-[550px] rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 slide-in-from-bottom-10 duration-500 ease-out">
          {/* Header Minimalista */}
          <div className="p-5 flex items-center justify-between border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="bg-gradient-to-tr from-primary-600 to-primary-400 p-2 rounded-2xl shadow-lg shadow-primary-600/20">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-zinc-900" />
              </div>
              <div>
                <h3 className="text-zinc-100 font-semibold text-sm tracking-tight">Tutor Inteligente</h3>
                <p className="text-zinc-500 text-[10px] uppercase tracking-widest font-medium">Pronto para ajudar</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="bg-zinc-800/50 hover:bg-zinc-700/50 text-zinc-400 hover:text-white p-2 rounded-xl transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-6 scrollbar-hide">
            {messages.map((m, i) => (
              <div
                key={i}
                className={cn(
                  "flex items-end gap-2 animate-in fade-in slide-in-from-bottom-2 duration-500",
                  m.role === "user" ? "flex-reverse justify-end" : "justify-start"
                )}
              >
                {m.role === "model" && (
                  <div className="w-7 h-7 bg-zinc-800 rounded-xl flex items-center justify-center flex-shrink-0 border border-white/5 mb-1">
                    <Bot className="w-4 h-4 text-primary-400" />
                  </div>
                )}
                
                <div
                  className={cn(
                    "max-w-[80%] flex flex-col gap-2",
                    m.role === "user" ? "items-end" : "items-start"
                  )}
                >
                  {m.image && (
                    <img 
                      src={m.image} 
                      alt="Anexo" 
                      className="max-w-full h-auto rounded-xl border border-white/10 shadow-sm animate-in zoom-in duration-300"
                    />
                  )}
                  {m.content && (
                    <div
                      className={cn(
                        "px-4 py-3 text-[13.5px] leading-relaxed shadow-sm",
                        m.role === "user"
                          ? "bg-primary-600 text-white rounded-[1.2rem] rounded-br-[0.2rem] font-medium"
                          : "bg-zinc-800/80 text-zinc-100 rounded-[1.2rem] rounded-bl-[0.2rem] border border-white/5 backdrop-blur-sm"
                      )}
                    >
                      {m.content}
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex items-end gap-2">
                <div className="w-7 h-7 bg-zinc-800 rounded-xl flex items-center justify-center animate-pulse">
                  <Bot className="w-4 h-4 text-primary-400" />
                </div>
                <div className="bg-zinc-800/50 border border-white/5 text-zinc-400 rounded-[1.2rem] rounded-bl-[0.2rem] px-4 py-3 flex gap-1.5 items-center">
                  <span className="w-1 h-1 rounded-full bg-primary-500 animate-[bounce_1s_infinite_0ms]"></span>
                  <span className="w-1 h-1 rounded-full bg-primary-500 animate-[bounce_1s_infinite_200ms]"></span>
                  <span className="w-1 h-1 rounded-full bg-primary-500 animate-[bounce_1s_infinite_400ms]"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSubmit} className="p-4 bg-zinc-900/40 border-t border-white/5 backdrop-blur-md">
            {/* Preview da Imagem */}
            {selectedImage && (
              <div className="mb-3 relative inline-block animate-in zoom-in duration-200">
                <img 
                  src={selectedImage} 
                  alt="Preview" 
                  className="w-20 h-20 object-cover rounded-xl border-2 border-primary-500/50 shadow-lg shadow-primary-500/20"
                />
                <button
                  type="button"
                  onClick={() => setSelectedImage(null)}
                  className="absolute -top-2 -right-2 bg-zinc-900 text-white p-1 rounded-full border border-white/10 hover:bg-red-500 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}

            <div className="relative group transition-all duration-300">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={selectedImage ? "O que você quer saber sobre essa foto?" : "Como posso te ajudar agora?"}
                className="w-full bg-zinc-800/40 backdrop-blur-sm border border-white/5 hover:border-white/10 rounded-2xl py-3.5 pl-12 pr-14 text-sm text-zinc-100 placeholder-zinc-500 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500/40 outline-none transition-all shadow-inner"
                disabled={isLoading}
              />
              
              {/* Botão de Foto */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-primary-400 transition-colors"
              >
                <Camera className="w-5 h-5" />
              </button>
              
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageUpload} 
                accept="image/*" 
                className="hidden" 
              />

              <button
                type="submit"
                disabled={(!input.trim() && !selectedImage) || isLoading}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-primary-600 text-white rounded-xl hover:bg-primary-500 disabled:opacity-30 disabled:grayscale transition-all shadow-lg shadow-primary-600/20 active:scale-95"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[10px] text-zinc-600 text-center mt-2 font-medium">Equipe ENEM 2026 • Segurança Ativa</p>
          </form>
        </div>
      )}
    </div>
  );
}
