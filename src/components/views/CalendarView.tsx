"use client";
import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { INTENT_LABELS } from "@/lib/types";
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval,
  isSameDay, isSameMonth, isToday, addMonths, subMonths,
  getDay
} from "date-fns";
import { id } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";

const DAY_NAMES = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

export default function CalendarView() {
  const { schedules, classSchedules, setView } = useAppStore();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selected, setSelected] = useState<Date | null>(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd   = endOfMonth(currentMonth);
  const days       = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startPad   = getDay(monthStart);

  const getEventsForDay = (day: Date) => {
    const schEvents = schedules
      .filter(s => s.deadlineAt && isSameDay(new Date(s.deadlineAt), day))
      .map(s => ({
        id: s.id,
        title: s.title,
        type: s.type,
        color: (INTENT_LABELS[s.type] || INTENT_LABELS.UNKNOWN).color,
        emoji: (INTENT_LABELS[s.type] || INTENT_LABELS.UNKNOWN).emoji,
        time: s.deadlineAt ? format(new Date(s.deadlineAt), "HH:mm") : null,
        isCompleted: s.isCompleted,
      }));

    const dayOfWeek = getDay(day) === 0 ? 7 : getDay(day);
    const clsEvents = classSchedules
      .filter(c => c.dayOfWeek === dayOfWeek && c.isActive)
      .map(c => ({
        id: c.id,
        title: c.subjectName,
        type: "CLASS" as const,
        color: c.color || "#7C3AED",
        emoji: "🏫",
        time: c.startTime,
        isCompleted: false,
      }));

    // Class first, then sorted by urgency
    return [...clsEvents, ...schEvents];
  };

  const selectedEvents = selected ? getEventsForDay(selected) : [];
  const monthEvents = schedules.filter(s => s.deadlineAt && isSameMonth(new Date(s.deadlineAt), currentMonth));

  // Legend config
  const LEGEND = [
    { label: "Kuliah", style: "border-l-[3px] border-blue-500 bg-blue-50 text-blue-800" },
    { label: "Deadline", style: "bg-red-500 text-white rounded" },
    { label: "Ujian ⚠️", style: "bg-purple-500 text-white rounded" },
    { label: "Belajar", style: "border border-dashed border-blue-400 text-blue-500 rounded" },
  ];

  return (
    <div className="flex h-full bg-transparent overflow-hidden rounded-3xl">

      {/* ─── Left: Calendar Grid ─── */}
      <div className="flex-1 flex flex-col overflow-hidden bg-white/20 backdrop-blur-md border-r border-white/40">

        {/* Month Nav + Legend */}
        <div className="flex items-center justify-between px-8 py-4 border-b border-white/40 shrink-0">
          <div>
            <h2 className="text-2xl font-display font-bold text-[var(--color-text-primary)]">
              {format(currentMonth, "MMMM", { locale: id })}
            </h2>
            <p className="text-sm text-[var(--color-text-secondary)]">{format(currentMonth, "yyyy")}</p>
          </div>

          {/* Visual legend */}
          <div className="hidden md:flex items-center gap-3 text-[9px] font-bold text-[var(--color-text-secondary)]">
            <span className="uppercase tracking-wider">Keterangan:</span>
            {/* CLASS */}
            <div className="flex items-center gap-1">
              <div className="h-3 w-4 rounded-sm flex overflow-hidden">
                <div className="w-1 bg-[#7C3AED]" />
                <div className="flex-1 bg-[#7C3AED]/15" />
              </div>
              <span className="text-[#7C3AED]">Kuliah</span>
            </div>
            {/* DEADLINE */}
            <div className="flex items-center gap-1">
              <div className="h-3 w-4 bg-[#EF4444] rounded-sm" />
              <span className="text-[#EF4444]">🔴 Deadline</span>
            </div>
            {/* EXAM */}
            <div className="flex items-center gap-1">
              <div className="h-3 w-4 bg-[#8B5CF6] rounded-sm" />
              <span className="text-[#8B5CF6]">⚠️ Ujian</span>
            </div>
            {/* STUDY */}
            <div className="flex items-center gap-1">
              <div className="h-3 w-4 rounded-sm border border-dashed border-[#3B82F6]" />
              <span className="text-[#3B82F6]">📚 Belajar</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="w-9 h-9 rounded-xl bg-[var(--color-neutral)] border border-[var(--color-border)] flex items-center justify-center hover:border-[#7C3AED] hover:text-[#7C3AED] transition-all">
              <ChevronLeft size={18} />
            </button>
            <button onClick={() => setCurrentMonth(new Date())}
              className="px-4 py-2 text-xs font-bold border border-[#7C3AED] text-[#7C3AED] hover:bg-[#7C3AED] hover:text-white rounded-xl transition-all">
              Hari Ini
            </button>
            <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="w-9 h-9 rounded-xl bg-[var(--color-neutral)] border border-[var(--color-border)] flex items-center justify-center hover:border-[#7C3AED] hover:text-[#7C3AED] transition-all">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Day Headers */}
        <div className="grid grid-cols-7 pb-2 shrink-0 px-4">
          {DAY_NAMES.map(d => (
            <div key={d} className="text-center text-[10px] font-black text-purple-900 uppercase tracking-widest opacity-80">
              {d}
            </div>
          ))}
        </div>

        {/* Calendar Grid - Borderless Gap Layout */}
        <div className="grid grid-cols-7 gap-2 flex-1 overflow-auto px-4 pb-4">
          {Array.from({ length: startPad }).map((_, i) => (
            <div key={`pad-${i}`} className="min-h-[100px] rounded-2xl bg-white/5 border border-white/10" />
          ))}

          {days.map(day => {
            const events   = getEventsForDay(day);
            const isSelected = selected && isSameDay(day, selected);
            const isCurrent  = isToday(day);

            return (
              <div
                key={day.toISOString()}
                onClick={() => setSelected(day)}
                className={`min-h-[100px] rounded-2xl p-2 cursor-pointer transition-all relative group backdrop-blur-[10px] shadow-sm border
                  ${isSelected ? "bg-white/40 border-white/60 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.8)] opacity-100 scale-[1.02] z-10" : "bg-white/20 border-white/30 hover:bg-white/30 opacity-90"}
                `}
              >
                {/* ── DOTS FOR CLASSES (TOP RIGHT) ── */}
                {events.filter(e => e.type === "CLASS").length > 0 && (
                  <div className="absolute top-2 right-2 flex gap-1 z-20">
                    {events.filter(e => e.type === "CLASS").map(cls => (
                      <div key={cls.id} title={`Kuliah: ${cls.title}\n⏰ ${cls.time || "Sesuai Jadwal"}`}
                        className="w-2.5 h-2.5 rounded-full shadow-[inset_0_2px_4px_rgba(255,255,255,0.8),_0_2px_6px_rgba(0,0,0,0.2)] cursor-help hover:scale-[2] transition-transform border border-white/60"
                        style={{ backgroundColor: cls.color }}
                      />
                    ))}
                  </div>
                )}

                {/* Day number */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-colors relative z-10
                  ${isCurrent ? "bg-gradient-to-br from-[#7C3AED] to-[#EC4899] text-white shadow-[0_4px_15px_rgba(124,58,237,0.5)] scale-110 border border-white/50" : isSelected ? "bg-purple-600/90 text-white shadow-md border border-white/40" : "text-purple-950 group-hover:text-[#7C3AED]"}
                `}>
                  {format(day, "d")}
                </div>

                {/* ── EVENT CHIPS (TASKS/EXAMS) ── */}
                <div className="flex flex-col gap-1 px-0.5 relative z-10 w-full mt-auto mb-0">
                  {/* TASKS/EXAMS/OTHER AS TINY PILLS */}
                  {events.filter(e => e.type !== "CLASS").slice(0, 3).map((ev) => {
                    const isExam  = ev.type === "EXAM";
                    return (
                      <div key={ev.id} title={ev.title}
                        className="text-[9px] font-black px-1.5 py-[3px] truncate leading-tight rounded-[6px] text-white flex items-center gap-1 transition-transform hover:scale-105 cursor-pointer border border-white/40 shadow-sm"
                        style={{
                          backgroundColor: ev.color,
                          backgroundImage: `linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(0,0,0,0) 100%)`,
                        }}
                      >
                         {isExam && <span className="text-[8px] shrink-0">⚠️</span>}
                         <span className="truncate drop-shadow-sm opacity-95">{ev.title}</span>
                      </div>
                    );
                  })}
                  
                  {/* OVERFLOW INDICATOR FOR TASKS */}
                  {events.filter(e => e.type !== "CLASS").length > 3 && (
                    <div className="text-[8px] font-black text-purple-800 bg-white/70 backdrop-blur-md rounded-full px-1.5 py-[2px] w-max border border-white/60 shadow-sm ml-0.5">
                      +{events.filter(e => e.type !== "CLASS").length - 3} Tugas
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── Right: Selected Day Detail ─── */}
      <div className="w-80 flex flex-col bg-white/30 backdrop-blur-lg overflow-hidden shrink-0 border-l border-white/50">
        <div className="px-6 pt-8 pb-6 border-b border-white/40">
          <p className="text-[10px] font-bold text-purple-800 uppercase tracking-wider">
            {selected ? format(selected, "EEEE", { locale: id }) : "Pilih tanggal"}
          </p>
          <div className="flex items-center gap-3">
            <h3 className="text-5xl font-display font-black text-purple-950 mt-1 drop-shadow-sm">
              {selected ? format(selected, "d") : "--"}
            </h3>
            {selected && isToday(selected) && (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#EC4899] flex items-center justify-center text-white shadow-lg text-lg animate-bounce">
                ✨
              </div>
            )}
          </div>
          <p className="text-sm text-purple-900 font-bold mt-1">
            {selected ? format(selected, "MMMM yyyy", { locale: id }) : ""}
          </p>
        </div>

        {/* Events for selected day */}
        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3">
          {selectedEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-purple-800/60 text-center">
              <p className="text-4xl mb-2 grayscale opacity-50">☀️</p>
              <p className="text-sm font-bold">Tidak ada jadwal</p>
            </div>
          ) : (
            selectedEvents.map(ev => {
              const isClass = ev.type === "CLASS";
              const isExam  = ev.type === "EXAM";
              const isDeadline = ["DEADLINE_SUBMIT","DEADLINE_PROPOSAL","DEADLINE_REGISTER"].includes(ev.type);
              const isStudy = ev.type === "STUDY_PLAN" || ev.type === "STUDY_SESSION";

              return (
                <div key={ev.id}
                  className={`rounded-2xl overflow-hidden glass-panel hover:scale-[1.02] transition-transform`}
                  style={{ 
                    borderLeft: `6px solid ${ev.color}`, 
                    background: `linear-gradient(90deg, ${ev.color}15 0%, rgba(255,255,255,0.4) 100%)` 
                  }}
                >
                  <div className="p-3 flex gap-3 items-center">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 shadow-[0_4px_12px_rgba(0,0,0,0.1)] border border-white/60"
                      style={{ 
                        backgroundColor: ev.color, 
                        backgroundImage: `linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(0,0,0,0) 100%)`,
                        color: "white" 
                      }}>
                      {isClass ? "🏫" : isExam ? "⚠️" : isDeadline ? "🔴" : ev.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-black text-purple-950 leading-tight line-clamp-2 drop-shadow-sm">{ev.title}</p>
                      {ev.time && <p className="text-[10px] text-purple-800 mt-1 font-bold">🕐 {ev.time}</p>}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Month summary strip */}
        <div className="border-t border-white/40 px-5 py-4 bg-white/20">
          <p className="text-[10px] font-black text-purple-900 uppercase tracking-widest mb-3">Bulan ini</p>
          <div className="flex gap-2 text-center">
            <div className="flex-1 glass-surface rounded-2xl py-2.5">
              <p className="text-xl font-black text-[#7C3AED] drop-shadow-sm">{monthEvents.length}</p>
              <p className="text-[9px] font-bold text-purple-800 uppercase mt-0.5">Total</p>
            </div>
            <div className="flex-1 glass-surface rounded-2xl py-2.5">
              <p className="text-xl font-black text-[#10B981] drop-shadow-sm">{monthEvents.filter(s=>s.isCompleted).length}</p>
              <p className="text-[9px] font-bold text-purple-800 uppercase mt-0.5">Selesai</p>
            </div>
            <div className="flex-1 glass-surface rounded-2xl py-2.5">
              <p className="text-xl font-black text-[#F97316] drop-shadow-sm">{monthEvents.filter(s=>!s.isCompleted).length}</p>
              <p className="text-[9px] font-bold text-purple-800 uppercase mt-0.5">Aktif</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
