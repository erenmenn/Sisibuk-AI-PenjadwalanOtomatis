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
import {
  ChevronLeft, ChevronRight, Clock, CheckCircle2,
  CalendarDays, Circle
} from "lucide-react";

const DAY_NAMES = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

export default function CalendarView() {
  const { schedules, classSchedules } = useAppStore();
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
        label: (INTENT_LABELS[s.type] || INTENT_LABELS.UNKNOWN).label,
        time: s.deadlineAt ? format(new Date(s.deadlineAt), "HH:mm") : null,
        isCompleted: s.isCompleted,
        isClass: false,
      }));

    const dayOfWeek = getDay(day) === 0 ? 7 : getDay(day);
    const clsEvents = classSchedules
      .filter(c => c.dayOfWeek === dayOfWeek && c.isActive)
      .map(c => ({
        id: c.id,
        title: c.subjectName,
        type: "CLASS" as const,
        color: c.color || "#6C63FF",
        label: "Kuliah",
        time: c.startTime,
        isCompleted: false,
        isClass: true,
      }));

    return [...clsEvents, ...schEvents];
  };

  const selectedEvents = selected ? getEventsForDay(selected) : [];
  const monthEvents = schedules.filter(s => s.deadlineAt && isSameMonth(new Date(s.deadlineAt), currentMonth));

  return (
    <div className="flex h-full bg-transparent overflow-hidden rounded-3xl">

      {/* ─── Left: Calendar Grid ─── */}
      <div className="flex-1 flex flex-col overflow-hidden bg-white/20 backdrop-blur-md border-r border-white/30">

        {/* Header: Month + Navigation only */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-white/30 shrink-0">
          <div>
            <h2 className="text-2xl font-black text-[#1a1a2e] tracking-tight leading-none">
              {format(currentMonth, "MMMM", { locale: id })}
            </h2>
            <p className="text-xs font-bold text-slate-400 mt-0.5 tracking-widest">
              {format(currentMonth, "yyyy")}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="w-9 h-9 rounded-xl bg-white/60 border border-white/80 flex items-center justify-center text-slate-500 hover:text-rose-500 hover:border-rose-200 hover:bg-rose-50/50 transition-all shadow-sm"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setCurrentMonth(new Date())}
              className="px-4 py-2 text-[11px] font-black border border-rose-200 text-rose-500 hover:bg-rose-500 hover:text-white rounded-xl transition-all tracking-wide"
            >
              Hari Ini
            </button>
            <button
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="w-9 h-9 rounded-xl bg-white/60 border border-white/80 flex items-center justify-center text-slate-500 hover:text-rose-500 hover:border-rose-200 hover:bg-rose-50/50 transition-all shadow-sm"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Day Headers */}
        <div className="grid grid-cols-7 px-4 pt-3 pb-1 shrink-0">
          {DAY_NAMES.map(d => (
            <div key={d} className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
              {d}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1.5 flex-1 overflow-auto px-4 pb-4 pt-1">
          {Array.from({ length: startPad }).map((_, i) => (
            <div key={`pad-${i}`} className="min-h-[90px] rounded-2xl bg-white/5" />
          ))}

          {days.map(day => {
            const events     = getEventsForDay(day);
            const clsEvents  = events.filter(e => e.isClass);
            const schEvents  = events.filter(e => !e.isClass);
            const isSelected = selected && isSameDay(day, selected);
            const isCurrent  = isToday(day);
            const maxPills   = 2;
            const overflow   = schEvents.length - maxPills;

            return (
              <div
                key={day.toISOString()}
                onClick={() => setSelected(day)}
                className={`min-h-[90px] rounded-2xl p-2 cursor-pointer transition-all relative group flex flex-col border
                  ${isSelected
                    ? "bg-white/60 border-rose-200 shadow-[0_4px_20px_rgba(244,63,94,0.12)] scale-[1.02] z-10"
                    : "bg-white/20 border-white/30 hover:bg-white/35 hover:border-white/50"
                  }
                `}
              >
                {/* Class dots — top right */}
                {clsEvents.length > 0 && (
                  <div className="absolute top-2 right-2 flex gap-0.5 flex-wrap justify-end max-w-[40px]">
                    {clsEvents.slice(0, 4).map(cls => (
                      <div
                        key={cls.id}
                        title={cls.title}
                        className="w-2 h-2 rounded-full border border-white/70 shadow-sm"
                        style={{ backgroundColor: cls.color }}
                      />
                    ))}
                  </div>
                )}

                {/* Day number */}
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0 transition-all
                  ${isCurrent
                    ? "bg-gradient-to-br from-rose-500 to-orange-400 text-white shadow-[0_4px_14px_rgba(244,63,94,0.4)]"
                    : isSelected
                    ? "bg-rose-100 text-rose-600"
                    : "text-slate-700 group-hover:text-rose-500"
                  }
                `}>
                  {format(day, "d")}
                </div>

                {/* Event pills */}
                <div className="flex flex-col gap-0.5 mt-1.5 flex-1">
                  {schEvents.slice(0, maxPills).map(ev => (
                    <div
                      key={ev.id}
                      title={ev.title}
                      className={`text-[8.5px] font-bold px-1.5 py-[2px] truncate rounded-[5px] leading-tight text-white transition-all
                        ${ev.isCompleted ? "opacity-40 line-through" : ""}
                      `}
                      style={{ backgroundColor: ev.color }}
                    >
                      {ev.title}
                    </div>
                  ))}

                  {overflow > 0 && (
                    <div className="text-[8px] font-black text-slate-500 px-1 mt-0.5">
                      +{overflow} lainnya
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── Right Panel ─── */}
      <div className="w-[280px] flex flex-col bg-white/30 backdrop-blur-xl shrink-0 border-l border-white/40 overflow-hidden">

        {/* Selected date header */}
        <div className="px-6 pt-7 pb-5 border-b border-white/30 shrink-0">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
            {selected ? format(selected, "EEEE", { locale: id }) : "Pilih tanggal"}
          </p>
          <div className="flex items-end gap-3">
            <p className="text-[52px] font-black text-[#1a1a2e] leading-none">
              {selected ? format(selected, "d") : "--"}
            </p>
            {selected && isToday(selected) && (
              <span className="text-[11px] font-black text-rose-500 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-full mb-2">
                Hari Ini
              </span>
            )}
          </div>
          <p className="text-xs font-bold text-slate-400 mt-1">
            {selected ? format(selected, "MMMM yyyy", { locale: id }) : ""}
          </p>
        </div>

        {/* Events list */}
        <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-2 custom-scrollbar">
          {selectedEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-36 text-center">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                <CalendarDays size={20} className="text-slate-300" />
              </div>
              <p className="text-sm font-bold text-slate-400">Tidak ada jadwal</p>
              <p className="text-xs text-slate-300 mt-0.5">Hari ini bebas!</p>
            </div>
          ) : (
            selectedEvents.map(ev => {
              const isClass    = ev.isClass;
              const isDone     = ev.isCompleted;

              return (
                <div
                  key={ev.id}
                  className={`rounded-[16px] overflow-hidden border transition-all hover:shadow-md
                    ${isDone ? "opacity-50" : ""}
                  `}
                  style={{
                    borderColor: `${ev.color}30`,
                    background: `linear-gradient(135deg, ${ev.color}10 0%, rgba(255,255,255,0.6) 100%)`,
                  }}
                >
                  <div className="flex items-center gap-3 px-3.5 py-3">
                    {/* Color bar */}
                    <div
                      className="w-1 self-stretch rounded-full shrink-0"
                      style={{ backgroundColor: ev.color }}
                    />

                    <div className="flex-1 min-w-0">
                      <p className={`text-[12px] font-bold text-[#1a1a2e] leading-tight truncate
                        ${isDone ? "line-through" : ""}
                      `}>
                        {ev.title}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span
                          className="text-[9px] font-black px-1.5 py-0.5 rounded-full"
                          style={{ color: ev.color, backgroundColor: `${ev.color}15` }}
                        >
                          {ev.label}
                        </span>
                        {ev.time && ev.time !== "00:00" && (
                          <span className="flex items-center gap-0.5 text-[9px] font-bold text-slate-400">
                            <Clock size={9} />
                            {ev.time}
                          </span>
                        )}
                      </div>
                    </div>

                    {isDone ? (
                      <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                    ) : (
                      <Circle size={14} className="text-slate-200 shrink-0" />
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Month summary */}
        <div className="border-t border-white/40 px-4 py-4 bg-white/20 shrink-0">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
            Bulan Ini
          </p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { val: monthEvents.length,                        label: "Total",   color: "text-violet-600", bg: "bg-violet-50" },
              { val: monthEvents.filter(s=>s.isCompleted).length, label: "Selesai", color: "text-emerald-600", bg: "bg-emerald-50" },
              { val: monthEvents.filter(s=>!s.isCompleted).length, label: "Aktif",  color: "text-rose-600",    bg: "bg-rose-50" },
            ].map(({ val, label, color, bg }) => (
              <div key={label} className={`${bg} rounded-2xl py-3 text-center`}>
                <p className={`text-xl font-black ${color}`}>{val}</p>
                <p className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
