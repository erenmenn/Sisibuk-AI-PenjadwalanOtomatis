"use client";
import Image from "next/image";
import { useAppStore } from "@/lib/store";
import { INTENT_LABELS } from "@/lib/types";
import { format, isToday, differenceInDays } from "date-fns";
import { id } from "date-fns/locale";
import {
  MessageSquare, CalendarCheck, Flame, BookOpen,
  ClipboardList, PenTool, MonitorPlay, Dumbbell, Star, CalendarDays,
  Activity, Trophy, CheckCircle2, Clock, Info
} from "lucide-react";

// Helper for dynamic icons
const getIcon = (type: string) => {
  const p = { size: 16, strokeWidth: 2.5, className: "text-white" };
  if (type.includes("DEADLINE")) return <ClipboardList {...p} />;
  if (type.includes("EXAM"))     return <PenTool {...p} />;
  if (type.includes("STUDY") || type === "CLASS") return <BookOpen {...p} />;
  if (type === "WEBINAR" || type === "MEETING")   return <MonitorPlay {...p} />;
  if (type === "COMPETITION") return <Trophy {...p} />;
  if (type === "WORKOUT" || type === "SPORT")     return <Dumbbell {...p} />;
  if (type === "RUNNING")  return <Activity {...p} />;
  if (type === "PERSONAL") return <Star {...p} />;
  return <CalendarDays {...p} />;
};

// Helper for Mendatang badges
const dayBadge = (days: number | null) => {
  if (days === null) return { txt: "—",         cls: "bg-slate-100 text-slate-400" };
  if (days === 0)    return { txt: "Hari Ini!",  cls: "bg-red-500 text-white shadow-sm shadow-red-500/30" };
  if (days <= 2)     return { txt: `${days}h lagi`, cls: "bg-orange-500 text-white shadow-sm shadow-orange-500/30" };
  if (days <= 7)     return { txt: `${days}h lagi`, cls: "bg-orange-100 text-orange-600" };
  return               { txt: `${days}h lagi`, cls: "bg-indigo-100 text-indigo-600" };
};

export default function DashboardView() {
  const { schedules, classSchedules, user, setView, completeSchedule } = useAppStore();

  const today      = new Date();
  const dow        = today.getDay() === 0 ? 7 : today.getDay();
  
  // Active classes today (To be pinned in Informasi)
  const todayClass = classSchedules.filter(c => c.dayOfWeek === dow && c.isActive);
  
  // All schedules today (Uncompleted)
  const todaySched = schedules.filter(s => !s.isCompleted && s.deadlineAt && isToday(new Date(s.deadlineAt)));
  
  // ALL incoming deadlines (Assignments, Tasks, Exams, Projects)
  const allDeadlines = schedules
    .filter(s => !s.isCompleted && s.deadlineAt)
    .filter(s => s.type.includes("ASSIGNMENT") || s.type.includes("TASK") || s.type.includes("DEADLINE") || s.type.includes("PROJECT"))
    .sort((a,b) => new Date(a.deadlineAt!).getTime() - new Date(b.deadlineAt!).getTime());

  // Informasi Buat Mu (Upcoming Info Intents - everything else)
  const infoIntents = ["EXAM", "WEBINAR", "MEETING", "CLASS", "STUDY", "EVENT", "PERSONAL", "WORKOUT", "RUNNING", "COMPETITION"];
  
  const upcomingInfo = schedules
    .filter(s => !s.isCompleted && s.deadlineAt)
    .filter(s => !isToday(new Date(s.deadlineAt!))) // Not happening today
    .filter(s => infoIntents.some(i => s.type.includes(i)))
    .sort((a, b) => new Date(a.deadlineAt!).getTime() - new Date(b.deadlineAt!).getTime())
    .slice(0, 5);

  const totalDone   = schedules.filter(s => s.isCompleted).length;

  return (
    <div className="flex-1 h-full overflow-y-auto custom-scrollbar bg-transparent pb-10">
      {/* ════════ HERO HEADER ════════ */}
      <div className="relative pt-6 px-8 flex flex-col md:flex-row gap-6 md:gap-8 items-end z-10 w-full">
        
        {/* Mascot + Floating Gamification */}
        <div className="shrink-0 relative flex flex-col justify-end items-center drop-shadow-[0_16px_32px_rgba(244,63,94,0.15)]" style={{ width: 440, height: 440, marginBottom: -10 }}>
          
          {/* Gepeng Floating Gamification Card (On Top of Mascot Layer) */}
          <div className="absolute top-[8%] left-1/2 -translate-x-1/2 z-50 flex items-center gap-6 bg-white/60 backdrop-blur-2xl px-6 py-3 rounded-[2rem] shadow-[0_12px_40px_rgba(244,63,94,0.15)] border border-white w-max hover:scale-105 transition-transform">
            {/* XP */}
            <div className="flex flex-col items-center justify-center">
              <p className="text-[26px] font-black text-transparent bg-clip-text bg-gradient-to-br from-red-600 to-rose-500 leading-none">{user.xp}</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-rose-400/80 mt-1">Total XP</p>
            </div>
            <div className="w-px h-8 bg-rose-200/50" />
            {/* Streak */}
            <div className="flex flex-col items-center justify-center">
              <p className="text-[26px] font-black text-transparent bg-clip-text bg-gradient-to-br from-orange-500 to-amber-500 leading-none">{user.streakDays}</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-orange-400/80 mt-1">Streak</p>
            </div>
            <div className="w-px h-8 bg-rose-200/50" />
            {/* Selesai */}
            <div className="flex flex-col items-center justify-center">
              <p className="text-[26px] font-black text-transparent bg-clip-text bg-gradient-to-br from-emerald-500 to-teal-500 leading-none">{totalDone}</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400/80 mt-1">Selesai</p>
            </div>
          </div>

          <Image 
            src="/mascot.png" 
            alt="Mascot" 
            fill 
            style={{ objectFit: "contain", objectPosition: "bottom" }} 
            priority
            className="pointer-events-none"
          />
        </div>

        {/* Halo & Jadwal Hari Ini Box */}
        <div className="flex-1 pb-4 min-w-0 w-full shrink-0">
          <p className="text-xs font-bold text-red-500 uppercase tracking-widest mb-1 opacity-90">
            {format(today, "EEEE, d MMMM yyyy", { locale: id })}
          </p>
          
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-2">
            <h1 className="text-[2.6rem] font-serif font-black text-[#1a1a1a] tracking-tight drop-shadow-sm">
              Halo, <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-rose-500 to-orange-500">{user.name}!</span>
            </h1>

            {/* Aksi Cepat Small Buttons next to Name */}
            <div className="flex items-center gap-2">
              <button onClick={() => setView("chat")} className="group flex items-center gap-2 bg-gradient-to-b from-white to-rose-50/50 hover:to-rose-100/60 text-rose-600 px-3 py-2 rounded-[14px] text-[11px] font-black uppercase tracking-wider transition-all border border-rose-100 shadow-[0_4px_16px_rgba(244,63,94,0.1)] hover:shadow-[0_6px_20px_rgba(244,63,94,0.15)] hover:-translate-y-0.5">
                <MessageSquare size={14} className="group-hover:scale-110 transition-transform" /> Tanya AI
              </button>
              <button onClick={() => setView("schedules")} className="group flex items-center gap-2 bg-gradient-to-b from-white to-blue-50/50 hover:to-blue-100/60 text-blue-600 px-3 py-2 rounded-[14px] text-[11px] font-black uppercase tracking-wider transition-all border border-blue-100 shadow-[0_4px_16px_rgba(59,130,246,0.1)] hover:shadow-[0_6px_20px_rgba(59,130,246,0.15)] hover:-translate-y-0.5">
                <CalendarCheck size={14} className="group-hover:scale-110 transition-transform" /> Jadwal
              </button>
              <button onClick={() => setView("study")} className="group flex items-center gap-2 bg-gradient-to-b from-white to-amber-50/50 hover:to-amber-100/60 text-amber-600 px-3 py-2 rounded-[14px] text-[11px] font-black uppercase tracking-wider transition-all border border-amber-100 shadow-[0_4px_16px_rgba(245,158,11,0.1)] hover:shadow-[0_6px_20px_rgba(245,158,11,0.15)] hover:-translate-y-0.5">
                <BookOpen size={14} className="group-hover:scale-110 transition-transform" /> Fokus
              </button>
            </div>
          </div>
          
          <p className="text-sm text-slate-500 font-medium mb-5">
            {todaySched.length > 0 ? `${todaySched.length} agenda menunggu hari ini.` : "Hari ini santai! Belum ada daftar kegiatan."}
          </p>

          {/* Jadwal Hari Ini Card with Glass Accent */}
          <div className="bg-gradient-to-br from-white/90 to-red-50/20 backdrop-blur-2xl border border-red-100/50 rounded-[24px] p-5 shadow-[0_12px_40px_rgba(244,63,94,0.06)] pr-4">
            <div className="flex items-center gap-2 mb-4 px-1">
              <CalendarCheck size={16} className="text-red-500" /> 
              <p className="text-[11px] font-black text-red-600 uppercase tracking-widest">Jadwal Hari Ini</p>
            </div>
            
            {/* Scrollable list */}
            <div className="overflow-y-auto custom-scrollbar pr-2 flex flex-col gap-2.5" style={{ maxHeight: "180px" }}>
              {todaySched.length === 0 ? (
                <p className="text-sm text-slate-400 py-4 px-2 font-medium">Bebas! Nikmati waktu harimu sekarang.</p>
              ) : (
                todaySched.map(sch => {
                  const intent = INTENT_LABELS[sch.type] || INTENT_LABELS.UNKNOWN;
                  return (
                    <div key={sch.id} className="flex gap-3 items-center bg-white/80 border border-red-50 hover:border-red-100 transition-colors rounded-2xl p-2.5 shadow-sm">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm" style={{ backgroundColor: intent.color }}>
                        {getIcon(sch.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-[#1a1a1a] truncate leading-tight">{sch.title}</p>
                        <p className="text-[10px] text-slate-400 font-semibold mt-0.5 uppercase tracking-wide">{intent.label}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="px-8 mt-5 relative z-10">
        <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
      </div>

      {/* ════════ BODY ════════ */}
      <div className="px-8 mt-6 grid grid-cols-1 lg:grid-cols-2 gap-8 items-start w-full relative z-10">
          
        {/* Fokus Tugas & Pendaftaran */}
        <div className="bg-gradient-to-br from-white/90 to-rose-50/30 backdrop-blur-2xl rounded-[32px] border border-rose-100/40 shadow-[0_12px_40px_rgba(244,63,94,0.06)] p-6">
          <div className="flex gap-2 items-center text-rose-500 mb-6 px-1">
            <Flame size={18} /> 
            <p className="text-xs font-black uppercase tracking-widest text-[#1a1a1a]">Mandatori & Deadline</p>
          </div>
          <div className="flex flex-col gap-3">
            {allDeadlines.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 bg-white/50 rounded-[24px] border border-dashed border-emerald-200">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-3">
                  <CheckCircle2 size={32} className="text-emerald-500 drop-shadow-sm" />
                </div>
                <p className="text-lg font-black text-[#1a1a1a]">Good job!</p>
                <p className="text-sm font-semibold text-slate-400 mt-1 max-w-[200px] text-center">
                  Keren banget kamu udah selesaikan semuanya.
                </p>
              </div>
            ) : (
              allDeadlines.map(sch => {
                const timeObj = sch.deadlineAt ? new Date(sch.deadlineAt) : null;
                const timeStr = timeObj ? format(timeObj, "HH:mm") : "";
                const isTimeSet = timeStr && timeStr !== "00:00";
                const isTd = timeObj ? isToday(timeObj) : false;
                const dBadge = dayBadge(timeObj ? differenceInDays(timeObj, today) : null);

                return (
                  <div key={sch.id} className="group flex gap-3.5 items-center bg-white/80 border border-rose-100 hover:border-rose-300 rounded-[20px] p-3 transition-colors shadow-[0_4px_16px_rgba(244,63,94,0.04)]">
                    {/* Checkbox button */}
                    <button 
                      onClick={(e) => { e.stopPropagation(); completeSchedule(sch.id); }}
                      className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2 border-rose-300 text-rose-500 hover:border-emerald-400 hover:text-emerald-500 hover:bg-emerald-50 transition-all mr-1 bg-white"
                      title="Tandai Selesai"
                    >
                      <CheckCircle2 size={24} className="opacity-100 transition-opacity" />
                    </button>

                    <div className="flex-1 min-w-0 pr-2">
                      <p className="font-bold text-[#1a1a1a] text-[15px] truncate">{sch.title}</p>
                      
                      <div className="flex items-center gap-2 mt-1 -ml-0.5">
                        <p className={`text-[10px] font-black uppercase tracking-widest ${isTd ? 'text-rose-500' : 'text-slate-400'}`}>
                          {isTd ? "HARI INI" : timeObj ? format(timeObj, "d MMM") : "TIDAK ADA DEADLINE"}
                        </p>
                        {isTimeSet && (
                          <>
                            <div className="w-1 h-1 rounded-full bg-rose-200" />
                            <p className="text-[10px] font-black text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded-md">{timeStr}</p>
                          </>
                        )}
                        {!isTd && dBadge.txt !== "—" && (
                          <span className={`${dBadge.cls} text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider ml-auto shadow-none`}>
                            {dBadge.txt}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Informasi Buat Mu (Replaces Segera Mendatang) */}
        <div className="bg-gradient-to-br from-white/90 to-violet-50/30 backdrop-blur-2xl rounded-[32px] border border-violet-100/40 shadow-[0_12px_40px_rgba(139,92,246,0.06)] p-6">
          <div className="flex gap-2 items-center text-violet-500 mb-6 px-1">
            <Info size={18} /> 
            <p className="text-xs font-black uppercase tracking-widest text-[#1a1a1a]">Informasi Buat Mu</p>
          </div>
          <div className="flex flex-col gap-3">
            
            {/* Pinned: Jadwal Kuliah Hari Ini */}
            {todayClass.map(cls => (
              <div key={cls.id} className="relative flex gap-4 items-center rounded-[20px] p-4 shadow-[0_8px_24px_rgba(244,63,94,0.3)] overflow-hidden text-white" 
                style={{ background: "linear-gradient(135deg, #FF3000, #f43f5e)" }}>
                {/* Glass sheen highlight */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 pointer-events-none" />
                <div className="relative w-10 h-10 flex items-center justify-center bg-white/20 rounded-xl backdrop-blur-sm shadow-inner shrink-0">
                  <Clock size={18} />
                </div>
                <div className="relative flex-1 min-w-0">
                  <p className="font-black text-[15px] truncate leading-tight drop-shadow-sm">{cls.subjectName}</p>
                  <p className="text-[10px] font-bold mt-1 text-white/90 uppercase tracking-widest">MULAI • {cls.startTime} - {cls.endTime}</p>
                </div>
                <span className="relative text-[10px] font-black px-3 py-1.5 rounded-[10px] bg-white/20 backdrop-blur-sm border border-white/20 shrink-0 shadow-sm">
                  KULIAH
                </span>
              </div>
            ))}

            {/* Upcoming Informations */}
            {upcomingInfo.length === 0 && todayClass.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 bg-white/40 rounded-[24px] border border-dashed border-violet-100">
                <p className="text-sm font-semibold text-violet-300">Belum ada info terbaru</p>
              </div>
            ) : (
              upcomingInfo.map(sch => {
                const intent = INTENT_LABELS[sch.type] || INTENT_LABELS.UNKNOWN;
                const timeObj = sch.deadlineAt ? new Date(sch.deadlineAt) : null;
                const days = timeObj ? differenceInDays(timeObj, today) : null;
                const badge = dayBadge(days);
                const timeStr = timeObj ? format(timeObj, "HH:mm") : "";
                const isTimeSet = timeStr && timeStr !== "00:00";
                
                return (
                  <div key={sch.id} className="group flex gap-3.5 items-center bg-white/90 border border-violet-50 hover:border-violet-200 p-3 rounded-[20px] transition-colors shadow-[0_4px_16px_rgba(139,92,246,0.03)] hover:shadow-[0_8px_24px_rgba(139,92,246,0.08)]">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-inner" style={{ backgroundColor: intent.color }}>
                      {getIcon(sch.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-[#1a1a1a] text-[15px] truncate leading-tight">{sch.title}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">{timeObj ? format(timeObj, "d MMM yyyy") : "—"}</p>
                        {isTimeSet && (
                          <>
                            <div className="w-1.5 h-1.5 rounded-full bg-violet-200" />
                            <p className="text-[11px] font-black text-violet-500 bg-violet-50 px-1.5 py-0.5 rounded-md">{timeStr}</p>
                          </>
                        )}
                      </div>
                    </div>
                    <span className={`text-[11px] font-black px-3 py-1.5 rounded-xl ${badge.cls} shrink-0 shadow-sm`}>{badge.txt}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
