"use client";

import { useEffect, useState } from "react";
import { getTutorMessages } from "../actions";
import { Loader2, MessageSquare, User, Clock, Bot, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function TutorMessagesTab() {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const data = await getTutorMessages();
        setMessages(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filteredMessages = messages.filter(m => 
    m.content.toLowerCase().includes(search.toLowerCase()) ||
    m.user.name?.toLowerCase().includes(search.toLowerCase()) ||
    m.user.email?.toLowerCase().includes(search.toLowerCase())
  );

  // Agrupar por usuário
  const groupedMessages = filteredMessages.reduce((acc: any, curr: any) => {
    if (!acc[curr.userId]) {
      acc[curr.userId] = {
        user: curr.user,
        messages: []
      };
    }
    acc[curr.userId].messages.push(curr);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
        <Loader2 className="animate-spin mb-4" />
        <p className="text-xs font-black uppercase tracking-widest">Carregando Diálogos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
            <MessageSquare className="text-primary-500" />
            Interações com o Tutor
          </h2>
          <p className="text-xs text-zinc-500">Acompanhe o que os alunos estão perguntando ao Mestre ENEM.</p>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Pesquisar por conteúdo ou aluno..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-xs text-zinc-100 outline-none focus:border-primary-500/50 transition-all shadow-lg"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {Object.values(groupedMessages).map((group: any) => (
          <div key={group.user.email} className="bg-white/5 border border-white/5 rounded-2xl overflow-hidden shadow-xl">
            <div className="bg-white/5 p-4 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-500/20 border border-primary-500/20 flex items-center justify-center">
                  {group.user.image ? (
                    <img src={group.user.image} alt={group.user.name} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <User className="text-primary-500 w-5 h-5" />
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-100">{group.user.name || "Aluno sem Nome"}</h3>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest">{group.user.email}</p>
                </div>
              </div>
              <div className="text-[10px] font-black uppercase tracking-widest text-primary-500 bg-primary-500/10 px-3 py-1 rounded-full">
                {group.messages.length} Mensagens
              </div>
            </div>

            <div className="p-4 space-y-4 max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
              {group.messages.map((m: any) => (
                <div 
                  key={m.id} 
                  className={cn(
                    "flex flex-col max-w-[85%] space-y-1",
                    m.role === "user" ? "ml-auto items-end" : "mr-auto items-start"
                  )}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-tighter">
                      {m.role === "user" ? "Aluno" : "Tutor"}
                    </span>
                    <Clock className="w-2.5 h-2.5 text-zinc-700" />
                    <span className="text-[9px] text-zinc-700">
                      {format(new Date(m.createdAt), "HH:mm - dd/MM", { locale: ptBR })}
                    </span>
                  </div>
                  <div className={cn(
                    "px-3 py-2 rounded-2xl text-[12px] leading-relaxed shadow-sm",
                    m.role === "user" 
                      ? "bg-zinc-800 text-zinc-200 border border-white/5 rounded-tr-none" 
                      : "bg-primary-900/40 text-primary-100 border border-primary-500/20 rounded-tl-none backdrop-blur-sm"
                  )}>
                    {m.content}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {Object.keys(groupedMessages).length === 0 && (
          <div className="py-20 text-center text-zinc-600">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-10" />
            <p className="text-sm font-medium">Nenhuma mensagem encontrada nesta sessão.</p>
          </div>
        )}
      </div>
    </div>
  );
}
