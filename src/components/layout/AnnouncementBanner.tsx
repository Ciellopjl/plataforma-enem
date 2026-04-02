"use client";

import { useEffect, useState } from "react";
import { getActiveAnnouncements } from "@/app/admin/actions/announcements";
import { Bell, X, Info, AlertTriangle, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export function AnnouncementBanner() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [closed, setClosed] = useState<string[]>([]);

  useEffect(() => {
    getActiveAnnouncements().then(setAnnouncements);
  }, []);

  const visibleAnnouncements = announcements.filter(a => !closed.includes(a.id));

  if (visibleAnnouncements.length === 0) return null;

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] w-full max-w-2xl px-4 space-y-2 pointer-events-none">
      {visibleAnnouncements.map((a) => (
        <div 
          key={a.id}
          className={cn(
            "pointer-events-auto flex items-center gap-4 p-4 rounded-2xl border shadow-2xl animate-in slide-in-from-top-4 duration-500",
            a.type === "info" && "bg-blue-600 border-blue-400 text-white",
            a.type === "warning" && "bg-amber-600 border-amber-400 text-white",
            a.type === "success" && "bg-emerald-600 border-emerald-400 text-white",
            a.type === "alert" && "bg-rose-600 border-rose-400 text-white shadow-rose-500/20"
          )}
        >
          <div className="shrink-0 p-2 bg-white/20 rounded-xl">
             {a.type === "info" && <Info size={18} />}
             {a.type === "warning" && <AlertTriangle size={18} />}
             {a.type === "success" && <CheckCircle size={18} />}
             {a.type === "alert" && <Bell size={18} />}
          </div>
          
          <div className="flex-1">
             <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Comunicado Oficial</p>
             <p className="text-sm font-bold leading-tight">{a.title}: <span className="font-medium opacity-90">{a.content}</span></p>
          </div>

          <button 
            onClick={() => setClosed([...closed, a.id])}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
