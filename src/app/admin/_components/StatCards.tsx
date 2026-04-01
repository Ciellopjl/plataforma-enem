import { Users, Globe, Ban, Activity, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { AdminStats } from "../types";

interface StatCardProps {
  title: string;
  value: number;
  icon: any;
  color: string;
  description: string;
}

function StatCard({ title, value, icon: Icon, color, description }: StatCardProps) {
  return (
    <div className="glass p-6 rounded-3xl border-white/5 bg-white/5 hover:bg-white/[0.08] transition-all group">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{title}</p>
          <h3 className="text-3xl font-black tracking-tight">{value}</h3>
          <p className="text-[10px] text-zinc-600 font-medium italic">{description}</p>
        </div>
        <div className={cn("p-4 rounded-2xl", color)}>
          <Icon size={20} className="group-hover:scale-110 transition-transform" />
        </div>
      </div>
    </div>
  );
}

interface StatCardsProps {
  stats: AdminStats;
}

export function StatCards({ stats }: StatCardsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 animate-in fade-in slide-in-from-top-4 duration-700">
      <StatCard
        title="Alunos"
        value={stats.totalStudents}
        icon={Users}
        color="bg-purple-500/10 text-purple-400"
        description="Cadastrados na base"
      />
      <StatCard
        title="Admins"
        value={stats.totalAdmins}
        icon={ShieldCheck}
        color="bg-amber-500/10 text-amber-400"
        description="Membros da equipe"
      />
      <StatCard
        title="Online Agora"
        value={stats.online}
        icon={Globe}
        color="bg-emerald-500/10 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.1)]"
        description="Ativos nos últimos 2 min"
      />
      <StatCard
        title="Bloqueados"
        value={stats.blocked}
        icon={Ban}
        color="bg-red-500/10 text-red-400"
        description="Acesso restrito por admin"
      />
      <StatCard
        title="Atividades"
        value={stats.actionsToday}
        icon={Activity}
        color="bg-primary-500/10 text-primary-400"
        description="Ações registradas hoje"
      />
    </div>
  );
}
