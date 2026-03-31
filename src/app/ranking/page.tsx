import { Trophy, Star, Medal } from "lucide-react";
import { cn } from "@/lib/utils";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";

export default async function RankingPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const currentUserId = (session.user as any).id;

  // Buscar os top 10 usuários reais do banco de dados (Sênior: Integração de Dados Reais)
  const topUsers = await prisma.user.findMany({
    orderBy: { points: "desc" },
    take: 10,
    select: {
      id: true,
      name: true,
      image: true,
      points: true,
    }
  });

  // Mapear para o formato do pódio e lista
  const rankingItems = topUsers.map((u, i) => ({
    rank: i + 1,
    name: u.name || "Estudante Anônimo",
    points: u.points,
    avatar: u.image,
    initials: (u.name || "E").substring(0, 2).toUpperCase(),
    isMe: u.id === currentUserId
  }));

  const podium = rankingItems.slice(0, 3);
  const second = podium[1];
  const first = podium[0];
  const third = podium[2];
  const others = rankingItems.slice(3);

  return (
    <div className="space-y-12 pb-20 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <header className="text-center space-y-4 max-w-2xl mx-auto">
        <div className="flex items-center justify-center gap-2 text-primary-400 text-xs font-black uppercase tracking-[0.3em] mb-2">
            <Trophy size={14} /> Ciclo Mensal Ativo
        </div>
        <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-none">
          Elite do <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">Ranking</span>
        </h1>
        <p className="text-zinc-500 leading-relaxed text-sm md:text-base max-w-lg mx-auto">
          Os melhores estudantes da plataforma. Ganhe pontos concluindo matérias, simulados e desafios diários.
        </p>
      </header>

      {/* Podium Visualization */}
      <div className="flex flex-col md:flex-row items-end justify-center gap-8 md:gap-4 max-w-5xl mx-auto pt-16 px-4">
        {/* 2nd Place */}
        {second && (
          <div className="w-full md:w-72 glass p-8 rounded-t-[3rem] border-zinc-500/10 flex flex-col items-center gap-4 h-72 justify-end relative order-2 md:order-1 group hover:border-zinc-500/30 transition-all duration-500">
            <div className="absolute -top-10 flex flex-col items-center">
              <Medal className="text-zinc-400 mb-2 drop-shadow-[0_0_15px_rgba(161,161,170,0.3)]" size={56} />
              <div className="w-20 h-20 rounded-full bg-zinc-800 border-4 border-zinc-700 overflow-hidden shadow-2xl relative">
                {second.avatar ? (
                  <Image src={second.avatar} alt={second.name} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-black text-zinc-500 text-xl">{second.initials}</div>
                )}
                {second.isMe && <div className="absolute inset-0 border-2 border-primary-500 rounded-full animate-pulse" />}
              </div>
            </div>
            <div className="text-center">
              <div className="font-black text-white text-lg truncate w-48">{second.name}</div>
              <div className="text-zinc-400 text-sm font-bold uppercase tracking-widest">{second.points} Pts</div>
            </div>
            <div className="text-[10px] font-black text-zinc-500 tracking-[0.3em] bg-zinc-500/10 px-4 py-1.5 rounded-full">2º LUGAR</div>
          </div>
        )}

        {/* 1st Place */}
        {first && (
          <div className="w-full md:w-80 glass p-10 rounded-t-[4rem] border-yellow-500/20 bg-yellow-500/[0.03] flex flex-col items-center gap-4 h-96 justify-end relative order-1 md:order-2 shadow-[0_0_50px_rgba(234,179,8,0.1)] group hover:border-yellow-500/40 transition-all duration-700">
            <div className="absolute -top-16 flex flex-col items-center">
              <Trophy className="text-yellow-500 mb-4 animate-bounce drop-shadow-[0_0_20px_rgba(234,179,8,0.5)]" size={88} />
              <div className="w-24 h-24 rounded-full bg-yellow-500/20 border-4 border-yellow-500 overflow-hidden shadow-2xl relative flex items-center justify-center">
                {first.avatar ? (
                  <Image src={first.avatar} alt={first.name} fill className="object-cover" />
                ) : (
                  <div className="font-black text-yellow-500 text-3xl">{first.initials}</div>
                )}
                {first.isMe && <div className="absolute inset-0 border-2 border-white rounded-full animate-pulse" />}
              </div>
            </div>
            <div className="text-center">
              <div className="font-black text-white text-2xl truncate w-56 mb-1">{first.name}</div>
              <div className="text-yellow-500 text-base font-black uppercase tracking-wider">{first.points} Pts</div>
            </div>
            <div className="text-xs font-black text-yellow-500 tracking-[0.5em] bg-yellow-500/10 px-6 py-2 rounded-full mb-2">CAMPEÃO</div>
          </div>
        )}

        {/* 3rd Place */}
        {third && (
          <div className="w-full md:w-72 glass p-8 rounded-t-[3rem] border-orange-500/10 flex flex-col items-center gap-4 h-64 justify-end relative order-3 group hover:border-orange-500/30 transition-all duration-500">
            <div className="absolute -top-10 flex flex-col items-center">
              <Medal className="text-orange-700 mb-2 drop-shadow-[0_0_15px_rgba(194,65,12,0.3)]" size={48} />
              <div className="w-16 h-16 rounded-full bg-zinc-800 border-4 border-orange-900/30 overflow-hidden shadow-2xl relative">
                {third.avatar ? (
                  <Image src={third.avatar} alt={third.name} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-black text-orange-900 text-lg">{third.initials}</div>
                )}
                {third.isMe && <div className="absolute inset-0 border-2 border-primary-500 rounded-full animate-pulse" />}
              </div>
            </div>
            <div className="text-center">
              <div className="font-black text-white text-lg truncate w-44">{third.name}</div>
              <div className="text-zinc-500 text-sm font-bold uppercase tracking-widest">{third.points} Pts</div>
            </div>
            <div className="text-[10px] font-black text-orange-700 tracking-[0.3em] bg-orange-700/10 px-4 py-1.5 rounded-full">3º LUGAR</div>
          </div>
        )}
      </div>

      {/* Ranking List */}
      <section className="max-w-4xl mx-auto space-y-4 px-4">
        <div className="flex items-center justify-between px-6 mb-2">
            <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Colocação</span>
            <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest text-right">Pontuação Total</span>
        </div>
        
        {others.length > 0 ? (
          others.map((item) => (
            <div 
              key={item.rank} 
              className={cn(
                "glass p-5 rounded-[2rem] border-white/[0.03] flex items-center justify-between group hover:border-primary-500/20 hover:bg-primary-500/[0.02] transition-all duration-500",
                item.isMe ? "border-primary-500/40 bg-primary-500/[0.05] shadow-[0_10px_30_rgba(139,92,246,0.1)]" : ""
              )}
            >
              <div className="flex items-center gap-6">
                <span className={cn(
                  "w-8 text-center font-black text-lg",
                  item.isMe ? "text-primary-400" : "text-zinc-700"
                )}>
                  {item.rank < 10 ? `0${item.rank}` : item.rank}
                </span>
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-12 h-12 rounded-2xl overflow-hidden border border-white/5 flex items-center justify-center text-sm font-black transition-all",
                    item.isMe ? "bg-primary-500 text-white shadow-lg shadow-primary-500/20 scale-105" : "bg-zinc-900 text-zinc-500 group-hover:bg-zinc-800"
                  )}>
                    {item.avatar ? (
                      <Image src={item.avatar} alt={item.name} width={48} height={48} className="w-full h-full object-cover" />
                    ) : (
                      <span>{item.initials}</span>
                    )}
                  </div>
                  <div>
                    <div className="font-black text-zinc-100 flex items-center gap-2">
                      {item.name}
                      {item.isMe && (
                        <span className="text-[8px] bg-primary-500 text-white px-2 py-0.5 rounded-full uppercase tracking-[0.2em] font-black ring-4 ring-primary-500/20">Você</span>
                      )}
                    </div>
                    <div className="text-[10px] text-zinc-600 uppercase tracking-widest font-black">Ciclo Ativo • Mestre</div>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className={cn("text-xl font-black tracking-tight", item.isMe ? "text-primary-400" : "text-zinc-200")}>
                  {item.points.toLocaleString()}
                </div>
                <div className="text-[9px] text-zinc-600 font-black uppercase tracking-widest">Acumulados</div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-10 text-zinc-600 font-medium italic">
            Aguardando mais competidores de peso...
          </div>
        )}
      </section>

      {/* Help Section */}
      <footer className="max-w-2xl mx-auto px-4">
        <div className="glass p-8 rounded-[3rem] border-white/5 bg-gradient-to-br from-white/[0.02] to-transparent text-center">
            <div className="flex items-center justify-center gap-2 text-zinc-500 text-xs font-black uppercase tracking-[0.3em] mb-4">
                <Star size={14} className="text-yellow-500 fill-yellow-500/20" /> Jornada do Mestre
            </div>
            <h2 className="text-2xl font-black text-white mb-2 tracking-tight">Como subir de elo?</h2>
            <p className="text-zinc-500 text-sm leading-relaxed max-w-sm mx-auto mb-8 font-medium">
              Sua posição no ranking é determinada pelo seu <strong className="text-zinc-300">Total de Pontos</strong>. Você ganha pontos completando o plano de estudos diário (+50 XP) e finalizando simulados (+20 XP por acerto).
            </p>
            <Link href="/dashboard" className="inline-block px-10 py-4 bg-white text-black font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-zinc-200 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-white/5">
                Voltar aos Estudos
            </Link>
        </div>
      </footer>
    </div>
  );
}
