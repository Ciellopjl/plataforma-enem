"use client";

import { useEffect, useState } from "react";
import { createAnnouncement, deleteAnnouncement, toggleAnnouncement, getActiveAnnouncements, getAllAnnouncements } from "../actions/announcements";
import { Loader2, Plus, Bell, Trash2, Power, PowerOff } from "lucide-react";
import { cn } from "@/lib/utils";

export function AnnouncementManager() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({ title: "", content: "", type: "info" });

  const load = async () => {
    try {
      const res = await getAllAnnouncements();
      setAnnouncements(res || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      await createAnnouncement(formData);
      setFormData({ title: "", content: "", type: "info" });
      load();
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza?")) return;
    await deleteAnnouncement(id);
    load();
  };

  const handleToggle = async (id: string) => {
    await toggleAnnouncement(id);
    load();
  };

  if (loading) return <Loader2 className="animate-spin mx-auto mt-20" />;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Formulário de Criação */}
      <div className="lg:col-span-1 bg-white/5 border border-white/10 rounded-3xl p-8 space-y-6 self-start">
        <div className="space-y-1">
          <h3 className="text-sm font-black uppercase tracking-widest text-primary-400">Novo Aviso</h3>
          <p className="text-xl font-bold">Comunicado Global</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-black text-zinc-500 px-1">Título do Banner</label>
            <input 
              required
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary-500/50"
              placeholder="Ex: Simulado Liberado!"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase font-black text-zinc-500 px-1">Mensagem (Conteúdo)</label>
            <textarea 
              required
              value={formData.content}
              onChange={e => setFormData({...formData, content: e.target.value})}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary-500/50 min-h-[100px]"
              placeholder="Descreva o que os alunos precisam saber..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase font-black text-zinc-500 px-1">Tipo de Alerta</label>
            <div className="grid grid-cols-2 gap-2">
               {["info", "warning", "success", "alert"].map(type => (
                 <button
                   key={type}
                   type="button"
                   onClick={() => setFormData({...formData, type})}
                   className={cn(
                     "px-3 py-2 rounded-xl text-[10px] font-black uppercase border transition-all",
                     formData.type === type 
                       ? "bg-primary-500 border-primary-400 text-white" 
                       : "bg-white/5 border-white/5 text-zinc-500 hover:bg-white/10"
                   )}
                 >
                   {type}
                 </button>
               ))}
            </div>
          </div>

          <button 
            disabled={creating}
            className="w-full py-4 bg-primary-600 hover:bg-primary-500 disabled:opacity-50 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(var(--primary-600),0.3)] mt-6"
          >
            {creating ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />}
            Publicar Agora
          </button>
        </form>
      </div>

      {/* Listagem de Avisos */}
      <div className="lg:col-span-2 space-y-4">
        <h3 className="text-sm font-black uppercase tracking-widest text-zinc-500 px-2">Avisos Ativos ({announcements.length})</h3>
        
        {announcements.length === 0 && (
          <div className="bg-white/5 border border-dashed border-white/10 rounded-3xl p-12 flex flex-col items-center justify-center gap-4 text-zinc-500 text-center">
            <Bell size={48} className="opacity-20" />
            <p className="text-sm font-medium">Nenhum aviso global ativo no momento.</p>
          </div>
        )}

        <div className="space-y-4">
          {announcements.map((a: any) => (
            <div key={a.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-white/[0.07] transition-all group">
              <div className="flex items-start gap-4">
                 <div className={cn(
                   "p-3 rounded-full shrink-0",
                   a.type === "info" && "bg-blue-500/20 text-blue-400",
                   a.type === "warning" && "bg-amber-500/20 text-amber-400",
                   a.type === "success" && "bg-emerald-500/20 text-emerald-400",
                   a.type === "alert" && "bg-rose-500/20 text-rose-400"
                 )}>
                   <Bell size={20} />
                 </div>
                 <div className="space-y-1">
                   <h4 className="font-bold">{a.title}</h4>
                   <p className="text-xs text-zinc-400 leading-relaxed">{a.content}</p>
                   <p className="text-[10px] text-zinc-600 font-bold uppercase mt-2">Criado em: {new Date(a.createdAt).toLocaleDateString()}</p>
                 </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button 
                  onClick={() => handleToggle(a.id)}
                  className={cn(
                    "p-3 rounded-xl transition-all",
                    a.isActive ? "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20" : "bg-zinc-800 text-zinc-500 hover:bg-zinc-700"
                  )}
                  title={a.isActive ? "Desativar" : "Ativar"}
                >
                  {a.isActive ? <Power size={18} /> : <PowerOff size={18} />}
                </button>
                <button 
                  onClick={() => handleDelete(a.id)}
                  className="p-3 bg-white/5 text-zinc-500 hover:bg-rose-500/20 hover:text-rose-500 rounded-xl transition-all"
                  title="Excluir"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
