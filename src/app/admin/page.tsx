"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { getUsers, getLogs, toggleUserBlock, toggleUserRole } from "./actions";
import { ArrowLeft, Globe, Loader2, Users, Activity, Shield, LayoutDashboard, FileText, Bell, LayoutGrid } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { AdminUser, ActivityLog, AdminStats } from "./types";
import { StatCards } from "./_components/StatCards";
import { UserTable } from "./_components/UserTable";
import { LogList } from "./_components/LogList";
import { AnalyticsTab } from "./_components/AnalyticsTab";
import { AnnouncementManager } from "./_components/AnnouncementManager";
import { EssayQueue } from "./_components/EssayQueue";
import { ContentManager } from "./_components/ContentManager";

const SUPER_ADMIN_EMAIL = "ciellolisboa023@gmail.com";

type AdminTab = "dashboard" | "users" | "content" | "essays" | "announcements" | "logs";

export default function AdminPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<AdminTab>("dashboard");
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
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, [loadData]);

  const isOnline = useCallback((lastSeen: string | Date | null) => {
    if (!lastSeen) return false;
    const lastSeenDate = new Date(lastSeen);
    const now = new Date();
    const diffInMinutes = (now.getTime() - lastSeenDate.getTime()) / 60000;
    return diffInMinutes < 2; // Online se visto no último 2 minutos
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

  const filteredAdmins = useMemo(() => {
    const s = search.toLowerCase();
    return users.filter(u => u.role === "ADMIN").filter(u => (u.email?.toLowerCase().includes(s)) || (u.name?.toLowerCase().includes(s)));
  }, [users, search]);

  const filteredStudents = useMemo(() => {
    const s = search.toLowerCase();
    return users.filter(u => u.role === "STUDENT").filter(u => (u.email?.toLowerCase().includes(s)) || (u.name?.toLowerCase().includes(s)));
  }, [users, search]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans pb-20">
      
      {/* Header Sticky e Moderno */}
      <div className="sticky top-0 z-50 bg-zinc-950/80 backdrop-blur-xl border-b border-white/5 py-4 px-6 md:px-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-3 text-primary-400 mb-1">
              <Globe size={18} className="animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">Command Center 2.0</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight flex items-center gap-4">
              Painel de Redação Sênior
            </h1>
          </div>

          <div className="flex items-center gap-3">
              <Link href="/dashboard" className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-white/10 transition-all">
                <ArrowLeft size={14} /> Sair
              </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-10 space-y-10">
        
        {/* Quick Stats Integration */}
        <StatCards stats={stats} />

        {/* Tab Selection */}
        <div className="flex flex-wrap items-center gap-1 bg-white/5 p-1 rounded-2xl border border-white/5 w-fit">
           {[
             { id: "dashboard", label: "Analytics", icon: LayoutDashboard },
             { id: "users", label: "Alunos", icon: Users },
             { id: "content", label: "Conteúdo", icon: LayoutGrid },
             { id: "essays", label: "Redações", icon: FileText },
             { id: "announcements", label: "Avisos", icon: Bell },
             { id: "logs", label: "Auditoria", icon: Shield }
           ].map(t => (
             <button 
               key={t.id}
               onClick={() => setTab(t.id as AdminTab)}
               className={cn(
                 "px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
                 tab === t.id ? "bg-primary-500 text-white shadow-lg shadow-primary-500/20" : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
               )}
             >
               <t.icon size={14} />
               {t.label}
             </button>
           ))}
        </div>

        {/* Dynamic Content Rendering */}
        <div className="min-h-[400px]">
          {loading && users.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center gap-4 text-zinc-500">
               <Loader2 className="animate-spin" size={32} />
               <span className="text-xs font-black uppercase tracking-widest text-primary-500/50">Sincronizando Sistemas...</span>
            </div>
          ) : (
            <>
              {tab === "dashboard" && <AnalyticsTab />}
              {tab === "users" && (
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
              )}
              {tab === "content" && <ContentManager />}
              {tab === "essays" && <EssayQueue />}
              {tab === "announcements" && <AnnouncementManager />}
              {tab === "logs" && <LogList logs={logs} loading={loading} />}
            </>
          )}
        </div>

        <div className="pt-10 border-t border-white/5 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-700">
           <Shield size={12} /> Console Administrativo Restrito — Projeto ENEM 2026
        </div>
      </div>
    </div>
  );
}
