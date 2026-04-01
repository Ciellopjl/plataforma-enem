"use client";

import { Search, Users, Shield, Ban, Loader2, ShieldCheck, Crown, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";
import { AdminUser } from "../types";
import Image from "next/image";

interface UserTableProps {
  students: AdminUser[];
  admins: AdminUser[];
  search: string;
  onSearchChange: (val: string) => void;
  onToggleBlock: (id: string) => Promise<void>;
  onToggleRole: (id: string) => Promise<void>;
  actionLoading: string | null;
  isOnline: (lastSeen: any) => boolean;
  SUPER_ADMIN_EMAIL: string;
}

export function UserTable({
  students,
  admins,
  search,
  onSearchChange,
  onToggleBlock,
  onToggleRole,
  actionLoading,
  isOnline,
  SUPER_ADMIN_EMAIL,
}: UserTableProps) {
  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Barra de Busca */}
      <div className="glass p-2 rounded-3xl border-white/5 bg-white/5 flex items-center gap-4 transition-all focus-within:bg-white/[0.08] focus-within:border-primary-500/20">
        <div className="flex-1 flex items-center gap-3 px-4">
          <Search size={18} className="text-zinc-500" />
          <input
            type="text"
            placeholder="Buscar por nome ou e-mail..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="bg-transparent border-none outline-none w-full py-4 text-sm font-medium placeholder:text-zinc-600"
          />
        </div>
      </div>

      {/* ─── SEÇÃO: ADMINISTRADORES ─── */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <ShieldCheck size={16} className="text-amber-400" />
          </div>
          <div>
            <h2 className="text-xs font-black uppercase tracking-widest text-amber-400">
              Administradores
            </h2>
            <p className="text-[10px] text-zinc-600 font-medium">{admins.length} membro(s) da equipe</p>
          </div>
          <div className="flex-1 h-px bg-amber-500/10 ml-2" />
        </div>

        <div className="glass rounded-[2rem] border border-amber-500/10 bg-amber-500/[0.02] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-amber-500/10 bg-amber-500/[0.03]">
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-amber-500/60">Administrador</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-amber-500/60">Status</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-amber-500/60">Acesso</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-amber-500/60 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-500/5">
                {admins.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-zinc-600 text-xs font-black uppercase tracking-widest italic">
                      Nenhum administrador encontrado
                    </td>
                  </tr>
                ) : (
                  admins.map((user) => (
                    <UserRow
                      key={user.id}
                      user={user}
                      onToggleBlock={onToggleBlock}
                      onToggleRole={onToggleRole}
                      actionLoading={actionLoading}
                      isOnline={isOnline}
                      SUPER_ADMIN_EMAIL={SUPER_ADMIN_EMAIL}
                      variant="admin"
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ─── SEÇÃO: ALUNOS ─── */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20">
            <UserRound size={16} className="text-purple-400" />
          </div>
          <div>
            <h2 className="text-xs font-black uppercase tracking-widest text-purple-400">
              Alunos
            </h2>
            <p className="text-[10px] text-zinc-600 font-medium">{students.length} aluno(s) cadastrado(s)</p>
          </div>
          <div className="flex-1 h-px bg-purple-500/10 ml-2" />
        </div>

        <div className="glass rounded-[2rem] border border-white/5 bg-white/[0.02] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.03]">
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-500">Aluno</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-500">Status</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-500">Acesso</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-500 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {students.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-4 text-zinc-600">
                        <Users size={48} className="opacity-10" />
                        <span className="text-xs font-black uppercase tracking-widest italic">
                          {/* Se a busca está ativa, mostrar msg diferente */}
                          Nenhum aluno encontrado
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  students.map((user) => (
                    <UserRow
                      key={user.id}
                      user={user}
                      onToggleBlock={onToggleBlock}
                      onToggleRole={onToggleRole}
                      actionLoading={actionLoading}
                      isOnline={isOnline}
                      SUPER_ADMIN_EMAIL={SUPER_ADMIN_EMAIL}
                      variant="student"
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}

// ─── UserRow ──────────────────────────────────────────────────────────────────
function UserRow({
  user,
  onToggleBlock,
  onToggleRole,
  actionLoading,
  isOnline,
  SUPER_ADMIN_EMAIL,
  variant,
}: {
  user: AdminUser;
  onToggleBlock: any;
  onToggleRole: any;
  actionLoading: string | null;
  isOnline: any;
  SUPER_ADMIN_EMAIL: string;
  variant: "admin" | "student";
}) {
  const online = isOnline(user.lastSeen);
  const isSuperAdmin = user.email === SUPER_ADMIN_EMAIL;
  const isLoading = actionLoading === user.id;

  const avatarStyle = online
    ? variant === "admin"
      ? "bg-amber-500/10 border-amber-500/30 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.12)]"
      : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]"
    : "bg-zinc-800/10 border-white/5 text-zinc-500 grayscale";

  return (
    <tr className="hover:bg-white/[0.02] transition-all group">
      {/* Coluna: Usuário */}
      <td className="px-6 py-5">
        <div className="flex items-center gap-4">
          <div className={cn("w-10 h-10 rounded-xl border overflow-hidden flex items-center justify-center font-black transition-all duration-500 text-sm relative", avatarStyle)}>
            {user.image ? (
               <Image src={user.image} alt={user.name || "Perfil"} fill className="object-cover" />
            ) : isSuperAdmin ? (
               <Crown size={16} />
            ) : (
               user.name?.[0]?.toUpperCase() || "?"
            )}
          </div>
          <div className="flex flex-col">
            <span className={cn(
              "text-sm font-bold transition-colors",
              variant === "admin" ? "text-amber-100 group-hover:text-amber-300" : "text-white group-hover:text-primary-400"
            )}>
              {user.name || "Sem Nome"}
            </span>
            <span className="text-[11px] text-zinc-500 italic opacity-60">{user.email}</span>
          </div>
        </div>
      </td>

      {/* Coluna: Status Online */}
      <td className="px-6 py-5">
        {online ? (
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]" />
            <span className="text-[10px] font-black tracking-widest text-emerald-400 uppercase">Online</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-zinc-600">
            <span className="w-2 h-2 bg-zinc-700 rounded-full" />
            <span className="text-[10px] font-black tracking-widest uppercase">
              Offline {user.lastSeen ? `(${new Date(user.lastSeen).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })})` : ""}
            </span>
          </div>
        )}
      </td>

      {/* Coluna: Badge de Acesso */}
      <td className="px-6 py-5">
        {isSuperAdmin ? (
          <span className="bg-primary-500/10 border border-primary-500/30 text-primary-400 text-[9px] font-black uppercase px-2.5 py-1 rounded-lg shadow-[0_0_15px_rgba(234,179,8,0.15)] animate-shimmer">
            SOBERANO 🔥
          </span>
        ) : user.isBlocked ? (
          <span className="text-red-500 text-[9px] font-black uppercase px-2.5 py-1 bg-red-500/10 border border-red-500/30 rounded-lg">
            Bloqueado
          </span>
        ) : variant === "admin" ? (
          <span className="text-amber-400 text-[9px] font-black uppercase px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 rounded-lg">
            Admin ⚙️
          </span>
        ) : (
          <span className="text-zinc-500 text-[9px] font-black uppercase px-2.5 py-1 bg-zinc-500/5 border border-white/5 rounded-lg">
            Aluno
          </span>
        )}
      </td>

      {/* Coluna: Ações */}
      <td className="px-6 py-5 text-right">
        <div className="flex items-center justify-end gap-2">
          {!isSuperAdmin ? (
            <>
              <button
                disabled={isLoading}
                onClick={() => onToggleRole(user.id)}
                title={variant === "admin" ? "Rebaixar para Aluno" : "Promover a Admin"}
                className={cn(
                  "p-2.5 rounded-xl border border-transparent transition-all active:scale-95 disabled:opacity-50",
                  variant === "admin"
                    ? "bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 hover:border-amber-500/20"
                    : "bg-white/5 hover:border-primary-500/20 hover:bg-primary-500/10 hover:text-primary-400"
                )}
              >
                {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Shield size={14} />}
              </button>
              <button
                disabled={isLoading}
                onClick={() => onToggleBlock(user.id)}
                title={user.isBlocked ? "Desbloquear" : "Bloquear"}
                className={cn(
                  "p-2.5 rounded-xl border border-transparent transition-all active:scale-95 disabled:opacity-50",
                  user.isBlocked
                    ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-500/20"
                    : "bg-red-500/10 text-red-500 hover:bg-red-500/20 hover:border-red-500/20"
                )}
              >
                {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Ban size={14} />}
              </button>
            </>
          ) : (
            <div className="text-[10px] font-black text-primary-500/40 uppercase tracking-widest px-4 italic animate-pulse">
              Protegido
            </div>
          )}
        </div>
      </td>
    </tr>
  );
}
