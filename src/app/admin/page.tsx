"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { getUsers, getLogs, toggleUserBlock, toggleUserRole } from "./actions";
import { ArrowLeft, Globe, Loader2, Users, Activity, Shield } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { AdminUser, ActivityLog, AdminStats } from "./types";
import { StatCards } from "./_components/StatCards";
import { UserTable } from "./_components/UserTable";
import { LogList } from "./_components/LogList";

const SUPER_ADMIN_EMAIL = "ciellolisboa023@gmail.com";

export default function AdminPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"users" | "logs" | "tasks">("users");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [usersData, logsData] = await Promise.all([getUsers(), getLogs()]);
      setUsers(usersData as AdminUser[]);
      setLogs(logsData as ActivityLog[]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    // Refresh automático ultra-rápido (3 segundos) para efeito Real-Time
    const interval = setInterval(loadData, 3000);
    return () => clearInterval(interval);
  }, [loadData]);

  const isOnline = useCallback((lastSeen: string | Date | null) => {
    if (!lastSeen) return false;
    const lastSeenDate = new Date(lastSeen);
    const now = new Date();
    const diffInMinutes = (now.getTime() - lastSeenDate.getTime()) / 60000;
    return diffInMinutes < 1; // Online se visto no último 1 minuto
  }, []);

  const handleToggleBlock = async (userId: string) => {
    setActionLoading(userId);
    try {
      await toggleUserBlock(userId);
      await loadData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleRole = async (userId: string) => {
    setActionLoading(userId);
    try {
      await toggleUserRole(userId);
      await loadData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  // Separação Sênior: Admins vs Alunos ⚡
  const filteredAdmins = useMemo(() => {
    const s = search.toLowerCase();
    return users
      .filter(u => u.role === "ADMIN")
      .filter(u =>
        (u.email?.toLowerCase().includes(s)) ||
        (u.name?.toLowerCase().includes(s))
      );
  }, [users, search]);

  const filteredStudents = useMemo(() => {
    const s = search.toLowerCase();
    return users
      .filter(u => u.role === "STUDENT")
      .filter(u =>
        (u.email?.toLowerCase().includes(s)) ||
        (u.name?.toLowerCase().includes(s))
      );
  }, [users, search]);

  // Stats Otimizadas ⚡
  const stats = useMemo<AdminStats>(() => {
    const todayStr = new Date().toDateString();
    return {
      totalStudents: users.filter(u => u.role === "STUDENT").length,
      totalAdmins:   users.filter(u => u.role === "ADMIN").length,
      online:        users.filter(u => isOnline(u.lastSeen)).length,
      blocked:       users.filter(u => u.isBlocked).length,
      actionsToday:  logs.filter(l => new Date(l.createdAt).toDateString() === todayStr).length,
    };
  }, [users, logs, isOnline]);

  const taskLogs = useMemo(() => logs.filter(l => 
    l.action.includes("Aula") || 
    l.action.includes("Material") || 
    l.action.includes("Quiz") || 
    l.action.includes("Desafio") || 
    l.action.includes("Redação") || 
    l.action.includes("Exame")
  ), [logs]);

  const systemLogs = useMemo(() => logs.filter(l => 
    !l.action.includes("Aula") && 
    !l.action.includes("Material") && 
    !l.action.includes("Quiz") && 
    !l.action.includes("Desafio") && 
    !l.action.includes("Redação") && 
    !l.action.includes("Exame")
  ), [logs]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-4 md:p-10 font-sans">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Header Master */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-3 text-primary-400 mb-2">
              <Globe size={24} className="animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">Global Monitoring System</span>
            </div>
            <h1 className="text-4xl font-black tracking-tight flex items-center gap-4">
              Centro de Comando
            </h1>
          </div>

          <div className="flex items-center gap-3">
             <Link 
               href="/dashboard"
               className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-sm font-bold flex items-center gap-2 hover:bg-white/10 transition-all"
             >
               <ArrowLeft size={16} /> Dashboard
             </Link>
          </div>
        </div>

        {/* Dashboard de Estatísticas Sênior */}
        <StatCards stats={stats} />

        {/* Sistema de Abas Futurista */}
        <div className="flex flex-wrap items-center gap-2 border-b border-white/5 pb-0">
           <button 
             onClick={() => setTab("users")}
             className={cn(
               "px-6 py-4 text-xs font-black uppercase tracking-widest transition-all relative",
               tab === "users" ? "text-primary-400" : "text-zinc-600 hover:text-zinc-400"
             )}
           >
             <div className="flex items-center gap-2">
               <Users size={16} /> Alunos
             </div>
             {tab === "users" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500 shadow-[0_0_10px_rgba(var(--primary-500),0.5)]" />}
           </button>
           <button 
             onClick={() => setTab("tasks")}
             className={cn(
               "px-6 py-4 text-xs font-black uppercase tracking-widest transition-all relative",
               tab === "tasks" ? "text-purple-400" : "text-zinc-600 hover:text-zinc-400"
             )}
           >
             <div className="flex items-center gap-2">
               <Activity size={16} /> Progresso (Tarefas)
             </div>
             {tab === "tasks" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]" />}
           </button>
           <button 
             onClick={() => setTab("logs")}
             className={cn(
               "px-6 py-4 text-xs font-black uppercase tracking-widest transition-all relative",
               tab === "logs" ? "text-emerald-400" : "text-zinc-600 hover:text-zinc-400"
             )}
           >
             <div className="flex items-center gap-2">
               <Shield size={16} /> Logs Gerais
             </div>
             {tab === "logs" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 shadow-[0_0_10px_rgba(var(--emerald-500),0.5)]" />}
           </button>
        </div>

        {/* Console Content: Delegação Sênior */}
        {loading && users.length === 0 ? (
           <div className="py-20 flex flex-col items-center justify-center gap-4 text-zinc-500">
              <Loader2 className="animate-spin" size={32} />
              <span className="text-xs font-black uppercase tracking-widest text-primary-500/50">Carregando Centro de Comando...</span>
           </div>
        ) : tab === "users" ? (
           <UserTable
             admins={filteredAdmins}
             students={filteredStudents}
             search={search}
             onSearchChange={setSearch}
             onToggleBlock={handleToggleBlock}
             onToggleRole={handleToggleRole}
             actionLoading={actionLoading}
             isOnline={isOnline}
             SUPER_ADMIN_EMAIL={SUPER_ADMIN_EMAIL}
           />
        ) : tab === "tasks" ? (
           <LogList logs={taskLogs} loading={loading} />
        ) : (
           <LogList logs={systemLogs} loading={loading} />
        )}

        {/* Console Footer */}
        <div className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-700">
           <Shield size={12} /> Console Administrativo Restrito
        </div>

      </div>
    </div>
  );
}
