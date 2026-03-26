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

  // Group completed by category
  const academicDone = completedSchedules.filter(s =>
    ["DEADLINE_SUBMIT","DEADLINE_PROPOSAL","EXAM","STUDY_PLAN","STUDY_SESSION"].includes(s.type)
  ).length;

  // "Quests" — mini-challenges
  const quests = [
    {
      id: "q1",
      label: "🎯 Selesaikan 1 tugas",
      done: completedSchedules.length >= 1,
      progress: Math.min(1, completedSchedules.length),
      total: 1,
      xp: 50,
    },
    {
      id: "q2",
      label: "🔥 Streak 3 hari berturut",
      done: user.streakDays >= 3,
      progress: Math.min(3, user.streakDays),
      total: 3,
      xp: 75,
    },
    {
      id: "q3",
      label: "📚 Belajar 60 menit total",
      done: totalStudyMinutes >= 60,
      progress: Math.min(60, totalStudyMinutes),
      total: 60,
      xp: 100,
    },
    {
      id: "q4",
      label: "🏆 Kumpulkan 3 badge",
      done: user.badges.length >= 3,
      progress: Math.min(3, user.badges.length),
      total: 3,
      xp: 150,
    },
  ];

  return (
    <div className="flex-1 w-full overflow-y-auto pb-12">

      {/* ── Hero Card ── */}
      <div className="relative bg-gradient-to-br from-[#4C1D95] via-[#7C3AED] to-[#EC4899] px-8 pt-10 pb-8 overflow-hidden">
        {/* BG decorations */}
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white/5 translate-y-1/3 -translate-x-1/4 pointer-events-none" />

        <div className="relative flex items-center gap-5 mb-6">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-2xl bg-white/20 border-2 border-white/30 flex items-center justify-center text-3xl font-black text-white font-syne shadow-xl shrink-0">
            {user.name.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="text-white/70 text-xs font-bold uppercase tracking-widest">{currentLevelInfo.emoji} Level {user.level}</p>
            <h2 className="text-2xl font-black text-white font-syne leading-tight">{user.name}</h2>
            <p className="text-purple-200 text-sm font-semibold">{currentLevelInfo.name}</p>
          </div>
          {/* XP badge top right */}
          <div className="ml-auto text-center">
            <div className="bg-white/15 border border-white/20 rounded-2xl px-5 py-3 backdrop-blur-sm">
              <p className="text-2xl font-black text-yellow-300 font-syne">{user.xp}</p>
              <p className="text-[10px] text-white/60 font-bold uppercase tracking-widest">Total XP</p>
            </div>
          </div>
        </div>

        {/* XP Progress Bar */}
        <div>
          <div className="flex justify-between text-xs text-white/70 font-bold mb-2">
            <span>{user.xp} XP</span>
            <span>{nextLevelInfo ? `${xpForNextLevel} XP untuk Lv.${user.level + 1}` : "Max Level 🏆"}</span>
          </div>
          <div className="h-3 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-yellow-300 to-orange-400 rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(253,224,71,0.6)]"
              style={{ width: `${xpProgress}%` }}
            />
          </div>
          <p className="text-[10px] text-white/50 mt-1.5 text-right">
            {nextLevelInfo ? `${xpGained} / ${xpNeeded} XP hingga level berikutnya` : "Level tertinggi telah dicapai!"}
          </p>
        </div>
      </div>

      <div className="px-8 py-6 max-w-4xl mx-auto flex flex-col gap-6">

        {/* ── Stats Grid ── */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: "Hari Streak", value: user.streakDays, icon: Flame, color: "#EF4444", bg: "#FEE2E2", suffix: "🔥" },
            { label: "Tugas Selesai", value: completedSchedules.length, icon: CheckCircle, color: "#10B981", bg: "#D1FAE5" },
            { label: "Jam Belajar", value: totalStudyHours, icon: Clock, color: "#3B82F6", bg: "#DBEAFE", suffix: "j" },
            { label: "Badge", value: user.badges.length, icon: Trophy, color: "#F59E0B", bg: "#FEF9C3" },
          ].map(s => (
            <div key={s.label} className="bg-white border border-[var(--color-border)] rounded-2xl p-4 text-center shadow-sm hover:shadow-md transition-all">
              <div className="w-10 h-10 rounded-xl mx-auto mb-2 flex items-center justify-center" style={{ backgroundColor: s.bg }}>
                <s.icon size={20} style={{ color: s.color }} />
              </div>
              <p className="text-2xl font-black font-syne" style={{ color: s.color }}>
                {s.value}{s.suffix || ""}
              </p>
              <p className="text-[10px] text-[var(--color-text-secondary)] font-bold uppercase tracking-wide mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* ── Activity Breakdown ── */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Akademik Selesai", value: academicDone, color: "#7C3AED", bg: "#EDE9FE", icon: BookOpen },
            { label: "Aktif Sekarang", value: activeSchedules.length, color: "#F97316", bg: "#FFEDD5", icon: Target },
            { label: "Total Sesi Belajar", value: studyLogs.length, color: "#06B6D4", bg: "#CFFAFE", icon: TrendingUp },
          ].map(s => (
            <div key={s.label} className="bg-white border border-[var(--color-border)] rounded-2xl p-4 flex items-center gap-3 shadow-sm">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: s.bg }}>
                <s.icon size={20} style={{ color: s.color }} />
              </div>
              <div>
                <p className="text-xl font-black font-syne" style={{ color: s.color }}>{s.value}</p>
                <p className="text-[10px] text-[var(--color-text-secondary)] font-bold">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Daily Quests ── */}
        <div>
          <h3 className="text-sm font-black text-[var(--color-text-primary)] uppercase tracking-wider mb-3 flex items-center gap-2">
            <Target size={16} className="text-[#7C3AED]" />
            Quest Aktif
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {quests.map(q => (
              <div key={q.id} className={`bg-white border rounded-2xl p-4 shadow-sm transition-all ${q.done ? "border-green-200 bg-green-50" : "border-[var(--color-border)]"}`}>
                <div className="flex items-center justify-between mb-2">
                  <p className={`text-sm font-bold ${q.done ? "text-green-700" : "text-[var(--color-text-primary)]"}`}>{q.label}</p>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${q.done ? "bg-green-200 text-green-700" : "bg-purple-100 text-purple-600"}`}>
                    +{q.xp} XP
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${q.done ? "bg-green-500" : "bg-gradient-to-r from-purple-500 to-pink-500"}`}
                    style={{ width: `${(q.progress / q.total) * 100}%` }}
                  />
                </div>
                <p className="text-[10px] text-[var(--color-text-secondary)] mt-1.5">
                  {q.done ? "✅ Selesai!" : `${q.progress} / ${q.total}`}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Badge Collection ── */}
        <div>
          <h3 className="text-sm font-black text-[var(--color-text-primary)] uppercase tracking-wider mb-3 flex items-center justify-between">
            <span className="flex items-center gap-2"><Award size={16} className="text-[#F59E0B]" /> Koleksi Badge</span>
            <span className="text-xs font-bold text-[var(--color-text-secondary)] normal-case">{user.badges.length} / {ALL_BADGES.length} diperoleh</span>
          </h3>
          <div className="grid grid-cols-5 gap-3">
            {ALL_BADGES.map((badge) => {
              const earned = user.badges.find(b => b.id === badge.id);
              return (
                <div key={badge.id} className="group relative">
                  <div className={`aspect-square rounded-2xl flex flex-col items-center justify-center p-3 text-center transition-all cursor-default border ${
                    earned
                      ? "bg-gradient-to-br from-amber-100 to-yellow-200 border-yellow-300 shadow-md shadow-yellow-100"
                      : "bg-[var(--color-neutral)] border-[var(--color-border)] opacity-50 grayscale"
                  }`}>
                    <span className="text-2xl mb-1">{badge.emoji}</span>
                    <p className={`text-[9px] font-bold leading-tight text-center ${earned ? "text-yellow-800" : "text-[var(--color-text-secondary)]"}`}>
                      {badge.name}
                    </p>
                    {!earned && <Lock size={10} className="mt-1 text-gray-400" />}
                  </div>
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-40 bg-gray-900 text-white rounded-xl p-2.5 text-center scale-0 group-hover:scale-100 opacity-0 group-hover:opacity-100 transition-all z-30 pointer-events-none shadow-xl">
                    <p className="font-bold text-xs mb-0.5">{badge.name}</p>
                    <p className="text-[9px] text-gray-300 leading-snug">{badge.description}</p>
                    {earned && <p className="text-[9px] text-yellow-400 font-bold mt-1">✨ Diraih!</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Level Roadmap ── */}
        <div>
          <h3 className="text-sm font-black text-[var(--color-text-primary)] uppercase tracking-wider mb-3 flex items-center gap-2">
            <Star size={16} className="text-[#7C3AED]" />
            Peta Level
          </h3>
          <div className="bg-white border border-[var(--color-border)] rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-0 overflow-x-auto pb-2">
              {LEVEL_CONFIG.map((lv, idx) => {
                const isCurrentLevel = user.level === lv.level;
                const isPast = user.level > lv.level;
                return (
                  <div key={lv.level} className="flex items-center">
                    <div className={`flex flex-col items-center gap-1 px-3 ${isCurrentLevel ? "scale-110" : ""} transition-transform`}>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl border-2 ${
                        isPast ? "bg-[#7C3AED] border-[#7C3AED]" :
                        isCurrentLevel ? "bg-gradient-to-br from-[#7C3AED] to-[#EC4899] border-transparent shadow-lg shadow-purple-200" :
                        "bg-[var(--color-neutral)] border-[var(--color-border)] opacity-50"
                      }`}>
                        {lv.emoji}
                      </div>
                      <p className={`text-[9px] font-bold text-center whitespace-nowrap ${
                        isCurrentLevel ? "text-[#7C3AED]" : isPast ? "text-[#10B981]" : "text-[var(--color-text-secondary)]"
                      }`}>{lv.name}</p>
                      <p className="text-[8px] text-[var(--color-text-secondary)]">{lv.xpRequired} XP</p>
                    </div>
                    {idx < LEVEL_CONFIG.length - 1 && (
                      <div className={`w-8 h-0.5 shrink-0 ${isPast ? "bg-[#7C3AED]" : "bg-[var(--color-border)]"}`} />
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
