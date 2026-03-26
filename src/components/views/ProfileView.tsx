import { useAppStore } from "@/lib/store";
import { ALL_BADGES, LEVEL_CONFIG, INTENT_LABELS, IntentType } from "@/lib/types";
import {
  Flame, Trophy, CheckCircle, Target, Zap, Star,
  BookOpen, Clock, TrendingUp, Award, Lock
} from "lucide-react";

export default function ProfileView() {
  const { user, schedules, studyLogs } = useAppStore();

  if (useAppStore.getState().currentView !== "profile") return null;

  const currentLevelInfo = LEVEL_CONFIG.find((l) => l.level === user.level) || LEVEL_CONFIG[0];
  const nextLevelInfo = LEVEL_CONFIG.find((l) => l.level === user.level + 1);
  const xpForCurrentLevel = currentLevelInfo.xpRequired;
  const xpForNextLevel = nextLevelInfo ? nextLevelInfo.xpRequired : currentLevelInfo.xpRequired;
  const xpGained = user.xp - xpForCurrentLevel;
  const xpNeeded = xpForNextLevel - xpForCurrentLevel;
  const xpProgress = nextLevelInfo ? Math.min(100, (xpGained / xpNeeded) * 100) : 100;

  const completedSchedules = schedules.filter(s => s.isCompleted);
  const activeSchedules = schedules.filter(s => !s.isCompleted);
  const totalStudyMinutes = studyLogs.reduce((acc, l) => acc + (l.durationMinutes || 0), 0);
  const totalStudyHours = Math.round(totalStudyMinutes / 60);
  const academicDone = completedSchedules.filter(s =>
    ["DEADLINE_SUBMIT","DEADLINE_PROPOSAL","EXAM","STUDY_PLAN","STUDY_SESSION"].includes(s.type)
  ).length;

  const quests = [
    { id: "q1", label: "🎯 Selesaikan 1 tugas",      done: completedSchedules.length >= 1,  progress: Math.min(1, completedSchedules.length),  total: 1,   xp: 50  },
    { id: "q2", label: "🔥 Streak 3 hari berturut",   done: user.streakDays >= 3,             progress: Math.min(3, user.streakDays),             total: 3,   xp: 75  },
    { id: "q3", label: "📚 Belajar 60 menit total",   done: totalStudyMinutes >= 60,          progress: Math.min(60, totalStudyMinutes),          total: 60,  xp: 100 },
    { id: "q4", label: "🏆 Kumpulkan 3 badge",        done: user.badges.length >= 3,          progress: Math.min(3, user.badges.length),          total: 3,   xp: 150 },
  ];

  return (
    <div className="flex-1 w-full overflow-y-auto custom-scrollbar pb-12" style={{
      background: "linear-gradient(160deg,#f0f4ff 0%,#f8f0ff 50%,#e8f4fd 100%)"
    }}>

      {/* ─── HERO BANNER ─── */}
      <div className="relative px-8 pt-8 pb-8 overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute -top-10 -right-10 w-72 h-72 rounded-full opacity-15 pointer-events-none"
          style={{ background: "radial-gradient(circle,#a855f7,transparent 70%)" }} />
        <div className="absolute -bottom-10 -left-10 w-60 h-60 rounded-full opacity-10 pointer-events-none"
          style={{ background: "radial-gradient(circle,#ec4899,transparent 70%)" }} />

        <div className="relative bg-white/80 border border-white rounded-3xl p-7 shadow-sm overflow-hidden">
          <div className="h-1 absolute top-0 left-0 right-0" style={{ background: "linear-gradient(90deg,#818cf8,#a855f7,#ec4899)" }} />

          <div className="flex items-center gap-5 mb-6">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center text-3xl font-black text-white shadow-xl shrink-0"
              style={{ background: "linear-gradient(135deg,#d946ef,#8b5cf6)" }}>
              {user.name.substring(0, 2).toUpperCase()}
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-0.5">
                {currentLevelInfo.emoji} Level {user.level} · {currentLevelInfo.name}
              </p>
              <h2 className="text-2xl font-black text-[#1e1b4b]">{user.name}</h2>
              <p className="text-sm text-purple-500 mt-0.5">
                {nextLevelInfo ? `${xpGained} / ${xpNeeded} XP ke level berikutnya` : "Level tertinggi! 🏆"}
              </p>
            </div>
            {/* XP chip */}
            <div className="text-center bg-gradient-to-br from-[#fbbf24] to-[#f59e0b] rounded-2xl px-5 py-3 text-white shadow-md shrink-0">
              <p className="text-2xl font-black leading-none">{user.xp}</p>
              <p className="text-[9px] font-bold uppercase tracking-widest opacity-90 mt-0.5">Total XP</p>
            </div>
          </div>

          {/* XP Progress Bar */}
          <div>
            <div className="flex justify-between text-[10px] font-bold text-purple-400 mb-1.5">
              <span>XP Progress</span>
              <span>{nextLevelInfo ? `Lv.${user.level + 1} di ${xpForNextLevel} XP` : "Max Level 🏆"}</span>
            </div>
            <div className="h-3 bg-purple-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-1000"
                style={{ width: `${xpProgress}%`, background: "linear-gradient(90deg,#a855f7,#ec4899)" }} />
            </div>
          </div>
        </div>
      </div>

      <div className="px-8 pb-8 flex flex-col gap-6 max-w-4xl mx-auto">

        {/* ─── Stats Grid ─── */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: "Hari Streak",    value: user.streakDays,           icon: Flame,       from: "#fb923c", to: "#f97316", sh: "rgba(249,115,22,.2)"   },
            { label: "Tugas Selesai",  value: completedSchedules.length, icon: CheckCircle, from: "#34d399", to: "#10b981", sh: "rgba(16,185,129,.2)"  },
            { label: "Jam Belajar",    value: totalStudyHours + "j",     icon: Clock,       from: "#38bdf8", to: "#0ea5e9", sh: "rgba(14,165,233,.2)"  },
            { label: "Badge",          value: user.badges.length,        icon: Trophy,      from: "#fbbf24", to: "#f59e0b", sh: "rgba(245,158,11,.2)"  },
          ].map(s => (
            <div key={s.label} className="bg-white/80 border border-white rounded-2xl p-5 flex flex-col items-center text-center shadow-sm hover:-translate-y-0.5 transition-transform">
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center mb-3 shadow-sm"
                style={{ background: `linear-gradient(135deg,${s.from},${s.to})`, boxShadow: `0 6px 16px ${s.sh}` }}>
                <s.icon size={20} className="text-white" />
              </div>
              <p className="text-2xl font-black" style={{ color: s.to }}>{s.value}</p>
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* ─── Activity Breakdown ─── */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Akademik Selesai",  value: academicDone,         icon: BookOpen,    from: "#818cf8", to: "#7c3aed" },
            { label: "Aktif Sekarang",    value: activeSchedules.length, icon: Target,   from: "#fb923c", to: "#f97316" },
            { label: "Total Sesi Belajar",value: studyLogs.length,     icon: TrendingUp,  from: "#38bdf8", to: "#0ea5e9" },
          ].map(s => (
            <div key={s.label} className="bg-white/80 border border-white rounded-2xl p-4 flex items-center gap-3 shadow-sm">
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
                style={{ background: `linear-gradient(135deg,${s.from},${s.to})` }}>
                <s.icon size={20} className="text-white" />
              </div>
              <div>
                <p className="text-xl font-black" style={{ color: s.to }}>{s.value}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ─── Daily Quests ─── */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-lg bg-purple-100 flex items-center justify-center">
              <Target size={13} className="text-purple-600" />
            </div>
            <h3 className="text-[11px] font-black text-purple-700 uppercase tracking-widest">Quest Aktif</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {quests.map(q => (
              <div key={q.id} className={`bg-white/80 border rounded-2xl p-4 shadow-sm transition-all ${q.done ? "border-emerald-200 bg-emerald-50/60" : "border-white"}`}>
                <div className="flex items-center justify-between mb-2.5">
                  <p className={`text-sm font-bold ${q.done ? "text-emerald-700" : "text-[#1e1b4b]"}`}>{q.label}</p>
                  <span className={`text-[10px] font-black px-2.5 py-1 rounded-full ${q.done ? "bg-emerald-200 text-emerald-700" : "bg-purple-100 text-purple-600"}`}>
                    +{q.xp} XP
                  </span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${(q.progress / q.total) * 100}%`,
                      background: q.done ? "linear-gradient(90deg,#34d399,#10b981)" : "linear-gradient(90deg,#a855f7,#ec4899)"
                    }} />
                </div>
                <p className="text-[10px] text-slate-400 mt-1.5 font-semibold">
                  {q.done ? "✅ Selesai!" : `${q.progress} / ${q.total}`}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ─── Badge Collection ─── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-amber-100 flex items-center justify-center">
                <Award size={13} className="text-amber-500" />
              </div>
              <h3 className="text-[11px] font-black text-purple-700 uppercase tracking-widest">Koleksi Badge</h3>
            </div>
            <p className="text-xs font-bold text-slate-400">{user.badges.length} / {ALL_BADGES.length} diperoleh</p>
          </div>
          <div className="grid grid-cols-5 gap-3">
            {ALL_BADGES.map((badge) => {
              const earned = user.badges.find(b => b.id === badge.id);
              return (
                <div key={badge.id} className="group relative">
                  <div className={`aspect-square rounded-2xl flex flex-col items-center justify-center p-3 text-center border transition-all ${
                    earned
                      ? "bg-gradient-to-br from-amber-50 to-yellow-100 border-yellow-200 shadow-sm"
                      : "bg-white/60 border-slate-100 opacity-50 grayscale"
                  }`}>
                    <span className="text-2xl mb-1">{badge.emoji}</span>
                    <p className={`text-[9px] font-bold leading-tight ${earned ? "text-yellow-800" : "text-slate-400"}`}>
                      {badge.name}
                    </p>
                    {!earned && <Lock size={9} className="mt-1 text-slate-300" />}
                  </div>
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-40 bg-[#1e1b4b] text-white rounded-2xl p-3 text-center scale-0 group-hover:scale-100 opacity-0 group-hover:opacity-100 transition-all z-30 pointer-events-none shadow-xl">
                    <p className="font-bold text-xs mb-0.5">{badge.name}</p>
                    <p className="text-[9px] text-purple-200 leading-snug">{badge.description}</p>
                    {earned && <p className="text-[9px] text-yellow-400 font-bold mt-1">✨ Diraih!</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ─── Level Roadmap ─── */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-lg bg-indigo-100 flex items-center justify-center">
              <Star size={13} className="text-indigo-500" />
            </div>
            <h3 className="text-[11px] font-black text-purple-700 uppercase tracking-widest">Peta Level</h3>
          </div>
          <div className="bg-white/80 border border-white rounded-2xl p-5 shadow-sm overflow-x-auto">
            <div className="flex items-center gap-0 min-w-max">
              {LEVEL_CONFIG.map((lv, idx) => {
                const isCurrentLevel = user.level === lv.level;
                const isPast = user.level > lv.level;
                return (
                  <div key={lv.level} className="flex items-center">
                    <div className={`flex flex-col items-center gap-1 px-3 transition-transform ${isCurrentLevel ? "scale-110" : ""}`}>
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xl border-2 shadow-sm ${
                        isPast
                          ? "border-transparent text-white"
                          : isCurrentLevel
                          ? "border-transparent shadow-lg"
                          : "bg-slate-100 border-slate-200 opacity-50"
                      }`} style={isPast
                        ? { background: "linear-gradient(135deg,#818cf8,#7c3aed)" }
                        : isCurrentLevel
                        ? { background: "linear-gradient(135deg,#a855f7,#ec4899)" }
                        : {}}>
                        {lv.emoji}
                      </div>
                      <p className={`text-[9px] font-bold text-center whitespace-nowrap ${
                        isCurrentLevel ? "text-purple-600" : isPast ? "text-emerald-500" : "text-slate-400"
                      }`}>{lv.name}</p>
                      <p className="text-[8px] text-slate-400">{lv.xpRequired} XP</p>
                    </div>
                    {idx < LEVEL_CONFIG.length - 1 && (
                      <div className="w-8 h-0.5 shrink-0 rounded-full"
                        style={{ backgroundColor: isPast ? "#818cf8" : "#e2e8f0" }} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
