"use client";

import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import { useState } from "react";

type Props = {
  challengeDates: Date[];
};

export function StudyCalendar({ challengeDates }: Props) {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  const daysInMonth = (month: number, year: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (month: number, year: number) => new Date(year, month, 1).getDay();

  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();
  const days = daysInMonth(month, year);
  const firstDay = firstDayOfMonth(month, year);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const isDayCompleted = (day: number) => {
    return challengeDates.some(date => 
      date.getDate() === day && 
      date.getMonth() === month && 
      date.getFullYear() === year
    );
  };

  const today = new Date();
  const isToday = (day: number) => 
    day === today.getDate() && 
    month === today.getMonth() && 
    year === today.getFullYear();

  return (
    <div className="glass p-6 rounded-[2rem] border-white/5">
      <div className="flex items-center justify-between mb-6 px-2">
        <h3 className="font-black text-white text-lg tracking-tight">
          {monthNames[month]} <span className="text-zinc-500 font-normal">{year}</span>
        </h3>
        <div className="flex gap-2">
          <button onClick={prevMonth} className="p-2 hover:bg-white/5 rounded-xl transition-colors text-zinc-400">
            <ChevronLeft size={20} />
          </button>
          <button onClick={nextMonth} className="p-2 hover:bg-white/5 rounded-xl transition-colors text-zinc-400">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {["D", "S", "T", "Q", "Q", "S", "S"].map(d => (
          <div key={d} className="text-center text-[10px] font-black text-zinc-600 py-2 uppercase tracking-widest">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}
        {Array.from({ length: days }).map((_, i) => {
          const day = i + 1;
          const completed = isDayCompleted(day);
          const current = isToday(day);

          return (
            <div 
              key={day} 
              className={cn(
                "aspect-square rounded-xl flex items-center justify-center text-xs font-bold transition-all relative group",
                completed 
                  ? "bg-primary-500/20 text-primary-400 border border-primary-500/30" 
                  : "hover:bg-white/5 text-zinc-500",
                current && !completed && "border border-zinc-700 bg-zinc-800/50 text-white"
              )}
            >
              {day}
              {completed && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary-500 rounded-full flex items-center justify-center border-2 border-black shadow-[0_0_10px_rgba(139,92,246,0.5)]">
                  <Check size={8} className="text-white" />
                </div>
              )}
              {current && (
                <div className="absolute bottom-1.5 w-1 h-1 bg-white rounded-full opacity-50" />
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-primary-500/20 border border-primary-500/30 rounded-md" />
          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Concluído</span>
        </div>
        <span className="text-[10px] text-zinc-600 font-bold italic">
          {challengeDates.filter(d => d.getMonth() === month && d.getFullYear() === year).length} dias ativos
        </span>
      </div>
    </div>
  );
}
