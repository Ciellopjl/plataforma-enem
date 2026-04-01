import { Activity, Clock, User, FileText, Layout, LogIn } from "lucide-react";
import { cn } from "@/lib/utils";
import { ActivityLog } from "../types";

interface LogListProps {
  logs: ActivityLog[];
  loading?: boolean;
}

const getLogIcon = (action: string) => {
  const a = action.toLowerCase();
  if (a.includes("login") || a.includes("entrou")) return <LogIn size={18} />;
  if (a.includes("redação") || a.includes("essay")) return <FileText size={18} />;
  if (a.includes("quiz") || a.includes("exame")) return <Layout size={18} />;
  return <Activity size={18} />;
};

export function LogList({ logs, loading }: LogListProps) {
  if (logs.length === 0) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-4 text-zinc-700 animate-in fade-in duration-700">
         <Activity size={64} className="opacity-10" />
         <span className="text-xs font-black uppercase tracking-widest italic">Aguardando sinais de atividade...</span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 animate-in slide-in-from-right-4 duration-700">
       {logs.map((log) => (
         <div key={log.id} className="glass p-5 rounded-2xl border-white/5 bg-white/5 flex items-start gap-5 hover:bg-white/[0.08] hover:border-emerald-500/20 transition-all group">
            <div className={cn(
              "p-3 rounded-xl transition-all group-hover:scale-110 duration-300",
              log.action.toLowerCase().includes("redação") ? "bg-primary-500/10 text-primary-400" : "bg-emerald-500/10 text-emerald-400"
            )}>
               {getLogIcon(log.action)}
            </div>
            
            <div className="flex-1 space-y-2">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors whitespace-nowrap">
                      {log.action}
                    </span>
                    <span className="text-[10px] bg-white/5 text-zinc-500 px-2 py-0.5 rounded border border-white/5 font-bold uppercase tracking-tighter">
                      LOG-ID:{log.id.slice(-4)}
                    </span>
                  </div>
                  <span className="text-[10px] text-zinc-600 font-bold flex items-center gap-1.5 whitespace-nowrap bg-black/40 px-3 py-1 rounded-full border border-white/5">
                     <Clock size={10} /> {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
               </div>

               <div className="flex items-center gap-2 text-[11px] text-zinc-500 bg-black/20 p-2 rounded-lg border border-white/5">
                  {log.user?.image ? (
                    <img src={log.user.image} alt="Avatar" className="w-4 h-4 rounded-full object-cover border border-white/10" />
                  ) : (
                    <User size={12} className="text-zinc-700" />
                  )}
                  <span className="font-black text-zinc-300">{log.user?.name || "Usuário Anonimizado"}</span>
                  <span className="opacity-20">|</span>
                  <span className="text-zinc-600 truncate max-w-[150px] md:max-w-none">{log.user?.email}</span>
               </div>

               {log.details && (
                 <p className="text-[10px] bg-black/60 p-3 rounded-xl text-zinc-400 border border-white/5 italic leading-relaxed shadow-inner">
                   {log.details}
                 </p>
               )}
            </div>
         </div>
       ))}
    </div>
  );
}
