"use client";

import { useEffect, useState } from "react";
import { getDashboardStats } from "../actions/analytics";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from "recharts";
import { Loader2, TrendingUp, Users, FileText, Zap, Award, Target, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

export function AnalyticsTab() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats().then(s => {
      setStats(s);
      setLoading(false);
    });
  }, []);

  if (loading) return (
    <div className="py-20 flex flex-col items-center justify-center gap-4 text-zinc-500">
      <Loader2 className="animate-spin" size={32} />
      <span className="text-xs font-black uppercase tracking-widest text-primary-500/50">Mineração de Dados Sênior...</span>
    </div>
  );

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* ─── FILEIRA 1: MÉTRICAS DE PERFORMANCE ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
         <MetricCard title="Média Redação" value={`${stats.avgEssayScore || 0} pts`} icon={PenTool} color="rose" />
         <MetricCard title="Quizzes / Inep" value={stats.totalQuizzes || 0} icon={Target} color="emerald" />
         <MetricCard title="Pontos Globais" value={stats.totalPoints.toLocaleString()} icon={Award} color="amber" />
         <MetricCard title="Total Alunos" value={stats.totalUsers} icon={Users} color="blue" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* ─── CRESCIMENTO VIRAL (2/3 width) ─── */}
        <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-3xl p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black uppercase tracking-widest text-primary-400">Escalabilidade</h3>
              <p className="text-2xl font-black">Novos Alunos (Histórico)</p>
            </div>
            <TrendingUp className="text-primary-500" size={32} />
          </div>

          <div className="h-[300px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.userGrowth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis dataKey="date" stroke="#ffffff20" fontSize={10} tickFormatter={(val) => val.split("-")[2]} />
                <YAxis stroke="#ffffff20" fontSize={10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#09090b", border: "1px solid #ffffff10", borderRadius: "16px" }}
                  labelStyle={{ color: "#a1a1aa", fontWeight: "black" }}
                />
                <Line 
                  type="stepAfter" 
                  dataKey="count" 
                  stroke="#3b82f6" 
                  strokeWidth={4} 
                  dot={{ fill: "#3b82f6", r: 4 }} 
                  activeDot={{ r: 8, stroke: "#3b82f6", strokeWidth: 2, fill: "#0c0a09" }}
                  animationDuration={2000}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ─── POPULARIDADE DE MATÉRIAS (1/3 width) ─── */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black uppercase tracking-widest text-emerald-400">Frequência</h3>
              <p className="text-2xl font-black">Áreas em Foco</p>
            </div>
            <BookOpen className="text-emerald-500" size={32} />
          </div>

          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.subjectStats} layout="vertical">
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" stroke="#ffffff40" fontSize={9} width={80} />
                <Tooltip 
                   cursor={{ fill: '#ffffff05' }}
                   contentStyle={{ backgroundColor: "#09090b", border: "1px solid #ffffff10", borderRadius: "12px" }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {stats.subjectStats.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color ? `#${entry.color}` : `var(--primary-500)`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* ─── MÉTRICAS RÁPIDAS (BANNERS) ─── */}
      <div className="bg-gradient-to-r from-primary-600/20 to-purple-600/20 border border-primary-500/30 p-8 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-8 group">
          <div className="space-y-2 text-center md:text-left">
             <div className="flex items-center justify-center md:justify-start gap-2 text-primary-400 animate-pulse">
                <Zap size={16} />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Sincronização Ativa</span>
             </div>
             <h4 className="text-3xl font-black">Engajamento Instantâneo</h4>
             <p className="text-zinc-500 text-sm font-medium">Atualmente temos <span className="text-white font-bold">{stats.onlineUsers} alunos</span> estudando na plataforma.</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
             <div className="bg-black/40 border border-white/5 p-6 rounded-3xl text-center group-hover:border-primary-500/30 transition-all">
                <p className="text-2xl font-black">{stats.totalEssays}</p>
                <p className="text-[9px] font-black uppercase text-zinc-500 tracking-widest mt-1">Redações</p>
             </div>
             <div className="bg-black/40 border border-white/5 p-6 rounded-3xl text-center group-hover:border-primary-500/30 transition-all">
                <p className="text-2xl font-black">+{Math.round((stats.onlineUsers / stats.totalUsers) * 100) || 0}%</p>
                <p className="text-[9px] font-black uppercase text-zinc-500 tracking-widest mt-1">Online</p>
             </div>
          </div>
      </div>

    </div>
  );
}

function MetricCard({ title, value, icon: Icon, color }: any) {
  const colors: any = {
    rose: "bg-rose-500/10 text-rose-500 border-rose-500/20",
    emerald: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    amber: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    blue: "bg-blue-500/10 text-blue-400 border-blue-500/20"
  };

  return (
    <div className={cn("p-6 rounded-3xl border flex flex-col gap-4 group hover:scale-[1.02] transition-all duration-300", colors[color])}>
       <div className="flex items-center justify-between">
          <Icon size={24} className="group-hover:rotate-12 transition-transform" />
          <div className="w-8 h-2 bg-white/10 rounded-full overflow-hidden">
             <div className="h-full bg-current w-1/3 animate-shimmer" />
          </div>
       </div>
       <div>
          <p className="text-[9px] font-black uppercase tracking-widest opacity-60 mb-1">{title}</p>
          <p className="text-2xl font-black text-white">{value}</p>
       </div>
    </div>
  );
}

function PenTool(props: any) {
  return (
    <svg 
      {...props} 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M12 19l7-7 3 3-7 7-3-3z"/>
      <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/>
      <path d="M2 2l7.586 7.586"/>
      <circle cx="11" cy="11" r="2"/>
    </svg>
  );
}
