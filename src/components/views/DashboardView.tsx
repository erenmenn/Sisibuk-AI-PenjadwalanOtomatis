"use client";
import { useAppStore } from "@/lib/store";
import { INTENT_LABELS } from "@/lib/types";
import { format, isToday, differenceInDays } from "date-fns";
import { id } from "date-fns/locale";
import {
  MessageSquare, CalendarCheck, ArrowRight, Flame, BookOpen,
  ClipboardList, PenTool, MonitorPlay, Dumbbell, Star, CalendarDays,
  Activity, Trophy, Zap, CheckCircle2, Clock
} from "lucide-react";

const getIcon = (type: string) => {
  const p = { size: 18, strokeWidth: 2.5, className: "text-white" };
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

const dayBadge = (days: number | null) => {
  if (days === null) return { txt: "—", cls: "bg-slate-100 text-slate-400" };
  if (days === 0)    return { txt: "Hari Ini!", cls: "bg-[#f43f5e] text-white" };
  if (days <= 2)     return { txt: `${days}h lagi`, cls: "bg-[#f97316] text-white" };
  if (days <= 7)     return { txt: `${days}h lagi`, cls: "bg-orange-100 text-orange-600" };
  return               { txt: `${days}h lagi`, cls: "bg-purple-100 text-purple-600" };
};

export default function DashboardView() {
  const { schedules, classSchedules, user, setView } = useAppStore();

  const today       = new Date();
  const dow         = today.getDay() === 0 ? 7 : today.getDay();
  const todayClass  = classSchedules.filter(c => c.dayOfWeek === dow && c.isActive);
  const todayDue    = schedules.filter(s => !s.isCompleted && s.deadlineAt && isToday(new Date(s.deadlineAt)));
  const upcoming    = schedules
    .filter(s => !s.isCompleted && s.deadlineAt)
    .sort((a, b) => new Date(a.deadlineAt!).getTime() - new Date(b.deadlineAt!).getTime())
    .slice(0, 5);

  const totalDone   = schedules.filter(s =>  s.isCompleted).length;
  const totalActive = schedules.filter(s => !s.isCompleted).length;

  return (
    <div className="flex-1 h-full overflow-y-auto custom-scrollbar" style={{
      background: "linear-gradient(165deg,#f6f8ff 0%,#f0edff 45%,#eef6ff 100%)"
    }}>

      {/* ════════════════════ HERO HEADER ════════════════════ */}
      <div className="relative px-8 pt-8 pb-0 overflow-hidden">
        {/* Decorative blob */}
        <div className="absolute -top-10 -right-10 w-72 h-72 rounded-full opacity-20 pointer-events-none"
          style={{ background: "radial-gradient(circle,#c084fc,transparent 70%)" }} />

        <div className="relative flex justify-between items-center">
          <div>
            <p className="text-[11px] font-black text-purple-400 uppercase tracking-widest mb-1">
              {format(today, "EEEE, d MMMM yyyy", { locale: id })}
            </p>
            <h1 className="text-[2.4rem] font-black leading-none text-[#1e1b4b]">
              Halo, <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#a855f7] to-[#ec4899]">{user.name}!</span> ✨
            </h1>
            <p className="mt-2 text-sm font-semibold text-purple-500/80">
              {totalActive > 0
                ? `${totalActive} agenda menunggu — fokus yuk!`
                : "Hari ini kosong. Waktunya istirahat atau tambah jadwal baru 🎉"}
            </p>
          </div>

          {/* Stat chips */}
          <div className="flex gap-3 shrink-0">
            {([
              { v: user.xp,        lbl: "Total XP",   g: ["#c084fc","#a855f7"], sh: "rgba(168,85,247,.3)" },
              { v: user.streakDays,lbl: "Streak",      g: ["#fb923c","#f97316"], sh: "rgba(249,115,22,.3)" },
              { v: totalDone,      lbl: "Selesai",     g: ["#34d399","#10b981"], sh: "rgba(16,185,129,.3)" },
            ] as const).map(s => (
              <div key={s.lbl}
                className="w-[90px] h-[90px] rounded-2xl flex flex-col items-center justify-center text-white hover:-translate-y-1 transition-transform shrink-0"
                style={{ background: `linear-gradient(135deg,${s.g[0]},${s.g[1]})`, boxShadow: `0 8px 20px ${s.sh}` }}>
                <p className="text-2xl font-black leading-none">{s.v}</p>
                <p className="text-[9px] font-bold uppercase tracking-widest mt-1 opacity-90">{s.lbl}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Thin divider */}
        <div className="mt-6 h-px bg-gradient-to-r from-transparent via-purple-200 to-transparent" />
      </div>

      {/* ════════════════════ BODY ════════════════════ */}
      <div className="px-8 py-6 flex gap-6">

        {/* ────── MAIN: 3 Focus Cards (left 2/3) ────── */}
        <div className="flex-1 flex flex-col gap-5 min-w-0">

          {/* ══ 1. KULIAH HARI INI — clean glass hero card ══ */}
          <div className="relative bg-white/80 border border-white rounded-3xl overflow-hidden shadow-[0_8px_32px_rgba(99,102,241,0.10)]">
            {/* Soft top accent bar */}
            <div className="h-1 w-full bg-gradient-to-r from-[#818cf8] via-[#a855f7] to-[#e879f9]" />

            <div className="p-6">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-xl bg-indigo-100 flex items-center justify-center">
                  <Clock size={15} className="text-indigo-500" />
                </div>
                <p className="text-[11px] font-black text-indigo-700 uppercase tracking-widest">Kuliah Hari Ini</p>
              </div>

              {todayClass.length === 0 ? (
                <p className="text-slate-400 font-semibold text-sm py-2">Tidak ada sesi kuliah hari ini.</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {todayClass.map(cls => (
                    <div key={cls.id} className="flex justify-between items-center bg-indigo-50/70 border border-indigo-100 rounded-2xl px-5 py-3.5">
                      <div>
                        <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-0.5">🔒 Sacred Time</p>
                        <h3 className="text-xl font-black text-[#1e1b4b]">{cls.subjectName}</h3>
                      </div>
                      <div className="bg-indigo-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-sm">
                        {cls.startTime} – {cls.endTime}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ══ 2. DEADLINE HARI INI + 3. MENDATANG side by side ══ */}
          <div className="grid grid-cols-2 gap-5">

            {/* ── 2. Deadline Hari Ini ── */}
            <div className="relative bg-white/80 border border-white rounded-3xl overflow-hidden shadow-[0_8px_24px_rgba(244,63,94,0.09)]">
              <div className="h-1 w-full bg-gradient-to-r from-[#fb7185] to-[#f43f5e]" />

              <div className="p-5">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-8 h-8 rounded-xl bg-rose-100 flex items-center justify-center">
                    <Flame size={15} className="text-rose-500" />
                  </div>
                  <p className="text-[11px] font-black text-rose-700 uppercase tracking-widest">Deadline Hari Ini</p>
                </div>

                {todayDue.length === 0 ? (
                  <div className="flex flex-col items-center py-5 gap-2">
                    <CheckCircle2 size={30} className="text-emerald-400" />
                    <p className="text-[#1e1b4b] font-black text-sm">Aman! Tidak ada.</p>
                    <p className="text-slate-400 text-[11px]">Nikmati harimu 🌸</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2.5">
                    {todayDue.map(sch => {
                      const intent = INTENT_LABELS[sch.type] || INTENT_LABELS.UNKNOWN;
                      return (
                        <div key={sch.id} className="flex items-center gap-3 bg-rose-50 border border-rose-100 rounded-2xl px-3 py-2.5">
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                            style={{ backgroundColor: intent.color }}>
                            {getIcon(sch.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-[#1e1b4b] text-sm leading-tight truncate">{sch.title}</p>
                            <p className="text-slate-400 text-[10px]">{intent.label}</p>
                          </div>
                          <span className="shrink-0 bg-rose-500 text-white text-[9px] font-black px-2.5 py-1 rounded-full">DUE!</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* ── 3. Mendatang ── */}
            <div className="relative bg-white/80 border border-white rounded-3xl overflow-hidden shadow-[0_8px_24px_rgba(139,92,246,0.09)]">
              <div className="h-1 w-full bg-gradient-to-r from-[#a78bfa] to-[#818cf8]" />
              <div className="px-5 pt-5 pb-0 flex items-center gap-2.5 mb-3">
                <div className="w-8 h-8 rounded-xl bg-violet-100 flex items-center justify-center">
                  <CalendarDays size={15} className="text-violet-500" />
                </div>
                <p className="text-[11px] font-black text-violet-700 uppercase tracking-widest">Mendatang</p>
              </div>

              <div className="px-5 pb-5 flex flex-col gap-2">
                {upcoming.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-purple-300 font-bold text-sm">Belum ada agenda</p>
                  </div>
                ) : (
                  upcoming.map(sch => {
                    const intent = INTENT_LABELS[sch.type] || INTENT_LABELS.UNKNOWN;
                    const days = sch.deadlineAt ? differenceInDays(new Date(sch.deadlineAt), today) : null;
                    const badge = dayBadge(days);
                    return (
                      <div key={sch.id}
                        className="group flex items-center gap-3 rounded-2xl px-3 py-2.5 hover:bg-purple-50/60 transition-colors">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform"
                          style={{ backgroundColor: intent.color }}>
                          {getIcon(sch.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-[#1e1b4b] text-sm leading-tight truncate">{sch.title}</p>
                          <p className="text-[10px] text-purple-400">
                            {sch.deadlineAt ? format(new Date(sch.deadlineAt), "d MMM", { locale: id }) : "—"}
                          </p>
                        </div>
                        <span className={`text-[10px] font-black px-2.5 py-1 rounded-full shrink-0 ${badge.cls}`}>
                          {badge.txt}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ────── SIDEBAR: Secondary features (right 1/3) ────── */}
        <div className="w-64 shrink-0 flex flex-col gap-5">

          {/* Quick Actions */}
          <div className="relative rounded-3xl p-5 overflow-hidden"
            style={{
              background: "rgba(255,255,255,0.55)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              border: "1px solid rgba(255,255,255,0.85)",
              boxShadow: "0 8px 32px rgba(99,102,241,0.08), inset 0 1px 0 rgba(255,255,255,0.9)"
            }}>
            <p className="text-[10px] font-black text-purple-700 uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <Zap size={12} className="text-[#a855f7]" /> Aksi Cepat
            </p>
            <div className="flex flex-col gap-2">
              {([
                { label: "Chat AI", sub: "Tambah jadwal", view: "chat",      icon: <MessageSquare size={14}/>, g: ["#d946ef","#a855f7"] },
                { label: "Jadwal",  sub: "Semua agenda",  view: "schedules", icon: <CalendarCheck  size={14}/>, g: ["#3b82f6","#06b6d4"] },
                { label: "Belajar", sub: "Study Room",    view: "study",     icon: <BookOpen        size={14}/>, g: ["#f59e0b","#f97316"] },
              ] as const).map(b => (
                <button key={b.view}
                  onClick={() => setView(b.view)}
                  className="group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-white hover:-translate-y-0.5 transition-all shadow-sm hover:shadow-md text-left"
                  style={{ background: `linear-gradient(135deg,${b.g[0]},${b.g[1]})` }}>
                  <div className="w-7 h-7 bg-white/20 rounded-xl flex items-center justify-center shrink-0">{b.icon}</div>
                  <div className="flex-1">
                    <p className="font-black text-sm leading-tight">{b.label}</p>
                    <p className="text-white/70 text-[10px]">{b.sub}</p>
                  </div>
                  <ArrowRight size={13} className="opacity-60 group-hover:opacity-100" />
                </button>
              ))}
            </div>
          </div>

          {/* Gamifikasi */}
          <div className="relative rounded-3xl p-5 overflow-hidden"
            style={{
              background: "rgba(255,255,255,0.55)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              border: "1px solid rgba(255,255,255,0.85)",
              boxShadow: "0 8px 32px rgba(99,102,241,0.08), inset 0 1px 0 rgba(255,255,255,0.9)"
            }}>
            <p className="text-[10px] font-black text-purple-700 uppercase tracking-widest mb-4 flex items-center gap-1.5">
              <Trophy size={12} className="text-[#a855f7]" /> Progres Kamu
            </p>

            {/* Avatar */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#d946ef] to-[#8b5cf6] text-white flex items-center justify-center font-black text-lg shadow-md">
                {user.name.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="font-black text-[#1e1b4b] text-sm">{user.name}</p>
                <p className="text-[10px] text-[#8b5cf6] font-bold uppercase">Lv {user.level}</p>
              </div>
            </div>

            {/* XP bar */}
            <div className="mb-4">
              <div className="flex justify-between text-[9px] font-bold text-purple-400 mb-1">
                <span>XP Progress</span><span>{user.xp} XP</span>
              </div>
              <div className="h-2 bg-purple-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-[#a855f7] to-[#ec4899] transition-all"
                  style={{ width: `${Math.min(100, user.xp % 100)}%` }} />
              </div>
            </div>

            {/* Mini stats */}
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { ico: <Flame size={12} className="text-orange-400"/>, v: user.streakDays, lbl: "Streak", bg: "bg-orange-50 border-orange-100", c: "text-orange-500" },
                { ico: <CheckCircle2 size={12} className="text-green-500"/>, v: totalDone, lbl: "Done", bg: "bg-green-50 border-green-100", c: "text-green-600" },
                { ico: <Trophy size={12} className="text-purple-500"/>, v: user.badges.length, lbl: "Badge", bg: "bg-purple-50 border-purple-100", c: "text-purple-600" },
              ].map(s => (
                <div key={s.lbl} className={`${s.bg} border rounded-xl py-2.5 flex flex-col items-center gap-0.5`}>
                  {s.ico}
                  <p className={`font-black text-sm leading-none ${s.c}`}>{s.v}</p>
                  <p className={`text-[8px] font-black uppercase ${s.c} opacity-70`}>{s.lbl}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
