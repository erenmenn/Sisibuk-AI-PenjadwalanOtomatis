import { useState } from "react";
import { useAppStore } from "@/lib/store";
import {
  MessageSquare, Calendar, ListTodo, Trophy, Flame, Zap,
  BookOpen, Loader2, LayoutDashboard, Sparkles, ChevronRight,
  Settings
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { LEVEL_CONFIG } from "@/lib/types";
import SettingsModal from "./SettingsModal";

export default function Sidebar() {
  const { currentView, setView, user, llmStatus, xpAnimation } = useAppStore();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const tabs = [
    { id: "dashboard", icon: LayoutDashboard, label: "Dashboard",           color: "#7C3AED" },
    { id: "chat",      icon: MessageSquare,   label: "Chat MILKUN.AI",      color: "#EC4899" },
    { id: "calendar",  icon: Calendar,        label: "Kalender",            color: "#3B82F6" },
    { id: "schedules", icon: ListTodo,         label: "Semua Jadwal",        color: "#F97316" },
    { id: "study",     icon: BookOpen,         label: "Study Room",          color: "#10B981" },
    { id: "profile",   icon: Trophy,           label: "Profil & XP",         color: "#F59E0B" },
  ] as const;

  const currentLevelInfo = LEVEL_CONFIG.find(l => l.level === user.level) || LEVEL_CONFIG[0];
  const nextLevel = LEVEL_CONFIG.find(l => l.level === user.level + 1);
  const xpProgress = nextLevel ? Math.min(100, ((user.xp - (LEVEL_CONFIG[user.level - 1]?.xpRequired || 0)) / (nextLevel.xpRequired - (LEVEL_CONFIG[user.level - 1]?.xpRequired || 0))) * 100) : 100;

  const isOnline = llmStatus === "online";
  const isChecking = llmStatus === "checking";
  const isRateLimited = llmStatus === "rate_limited";
  const statusDot = isOnline ? "bg-[#10B981] shadow-[0_0_6px_#10B981]" : isChecking ? "bg-[#F59E0B] shadow-[0_0_6px_#F59E0B]" : "bg-[#EF4444] shadow-[0_0_6px_#EF4444] animate-pulse";
  const statusText = isOnline ? "Model Aktif" : isRateLimited ? "Rate Limit" : isChecking ? "Menghubungkan..." : "Offline";
  const statusColor = isOnline ? "text-[#10B981]" : isChecking ? "text-[#F59E0B]" : "text-[#EF4444]";

  return (
    <>
    <aside className="w-[280px] h-full flex flex-col bg-transparent overflow-visible relative border-none z-50">

      {/* ── Mascot Image overlapping top with CSS Background Removal ── */}
      <div className="absolute -top-24 -right-14 w-60 h-60 opacity-100 pointer-events-none z-50 pointer-events-none select-none">
        <img src="/mascot.png" alt="Mascot" className="w-full h-full object-contain mix-blend-multiply opacity-90 contrast-125" />
      </div>

      <div className="flex flex-col h-full relative z-10 bg-white/30 backdrop-blur-[40px] m-5 mr-0 rounded-[2.5rem] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.7),_0_20px_40px_rgba(31,38,135,0.1)] overflow-hidden">

        {/* Brand */}
        <div className="px-5 pt-6 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#EC4899] flex items-center justify-center shadow-[0_4px_12px_rgba(124,58,237,0.4)] shrink-0">
              <Sparkles size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-base font-display font-black tracking-tight leading-none">
                <span className="text-[var(--color-text-primary)]">MILKUN</span><span className="bg-gradient-to-r from-[#7C3AED] to-[#EC4899] bg-clip-text text-transparent">.AI</span>
              </h1>
              <p className="text-[9px] font-bold text-[var(--color-text-secondary)] uppercase tracking-widest mt-0.5">Smart Scheduler</p>
            </div>
          </div>
        </div>

        {/* User Card */}
        <div className="mx-4 mb-5">
          <div className="bg-gradient-to-br from-[#7C3AED] to-[#4F46E5] rounded-2xl p-4 text-white relative overflow-hidden shadow-[0_8px_24px_rgba(124,58,237,0.35)]">
            {/* blob */}
            <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-white/10 pointer-events-none" />
            <div className="absolute -bottom-3 -left-2 w-14 h-14 rounded-full bg-white/5 pointer-events-none" />
            
            <div className="flex items-center gap-3 relative z-10 mb-3">
              <div className="w-11 h-11 rounded-full bg-white/25 border-2 border-white/40 flex items-center justify-center font-black font-display text-sm shadow-inner shrink-0">
                {user.name.substring(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-sm truncate leading-tight">{user.name}</p>
                <p className="text-[10px] text-purple-200 font-bold mt-0.5">
                  {currentLevelInfo.emoji} Lv.{user.level} · {currentLevelInfo.name}
                </p>
              </div>
            </div>

            {/* XP Bar */}
            <div className="relative z-10">
              <div className="flex justify-between text-[9px] font-bold text-purple-200 mb-1.5">
                <span>{user.xp} XP</span>
                {nextLevel && <span>→ {nextLevel.xpRequired} XP</span>}
              </div>
              <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-white rounded-full transition-all duration-700" style={{ width: `${xpProgress}%` }} />
              </div>
            </div>

            {/* Stats row */}
            <div className="flex gap-3 mt-3 pt-3 border-t border-white/20 relative z-10">
              <div className="flex items-center gap-1 text-xs font-bold text-orange-200">
                <Flame size={13} /> <span>{user.streakDays}</span>
                <span className="text-[9px] text-white/50 font-normal">hari</span>
              </div>
              <div className="relative flex items-center gap-1 text-xs font-bold text-yellow-200">
                <Zap size={13} /> <span>{user.xp}</span>
                <span className="text-[9px] text-white/50 font-normal">XP</span>
                {xpAnimation !== null && (
                  <div className="absolute -top-8 -right-1 bg-[#10B981] text-white px-2 py-0.5 rounded-full text-[9px] font-bold animate-bounce z-50 whitespace-nowrap">
                    +{xpAnimation} XP 🎉
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-blue-200">
                <Trophy size={13} /> <span>{user.badges.length}</span>
                <span className="text-[9px] text-white/50 font-normal">badge</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 flex flex-col gap-0.5 overflow-y-auto">
          <p className="text-[9px] font-black text-[var(--color-text-secondary)] uppercase tracking-widest px-2 mb-2">Menu</p>
          {tabs.map(tab => {
            const isActive = currentView === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setView(tab.id)}
                className={`group flex items-center gap-3 w-full px-3 py-2.5 rounded-xl transition-all duration-150 text-left relative overflow-hidden ${
                  isActive
                    ? "bg-white shadow-sm"
                    : "hover:bg-white/60 text-[var(--color-text-secondary)]"
                }`}
              >
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full" style={{ backgroundColor: tab.color }} />
                )}
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all ${isActive ? "shadow-sm" : "bg-transparent group-hover:bg-white/80"}`}
                  style={isActive ? { backgroundColor: tab.color + "15", color: tab.color } : { color: "#9CA3AF" }}
                >
                  <Icon size={17} style={isActive ? { color: tab.color } : {}} />
                </div>
                <span
                  className={`text-sm font-bold tracking-tight transition-colors ${isActive ? "" : "text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)]"}`}
                  style={isActive ? { color: tab.color } : {}}
                >
                  {tab.label}
                </span>
                {isActive && <ChevronRight size={14} className="ml-auto opacity-40" style={{ color: tab.color }} />}
              </button>
            );
          })}
        </nav>

        {/* LLM Status */}
        <div className="mx-4 mt-2">
          <div className="bg-white/40 backdrop-blur-md rounded-xl px-3 py-2.5 flex items-center gap-2.5 shadow-inner border border-white/60">
            <div className="relative flex items-center justify-center shrink-0">
              <div className={`w-2 h-2 rounded-full ${statusDot}`} />
              {isChecking && <Loader2 size={14} className="absolute text-[#F59E0B] animate-spin" />}
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-[9px] font-black text-purple-900 uppercase tracking-widest truncate">LLaMA 3.3 · Groq</span>
              <span className={`text-[10px] font-bold truncate ${statusColor}`}>{statusText}</span>
            </div>
          </div>
        </div>

        {/* Bottom: Settings & Logout row */}
        <div className="px-4 pb-5 pt-3 flex items-center gap-2">
          <button
            onClick={() => setSettingsOpen(true)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/40 border border-white/60 text-purple-900 hover:text-purple-600 hover:bg-white/70 transition-all text-xs font-bold group shadow-inner"
          >
            <Settings size={14} className="group-hover:rotate-45 transition-transform duration-300" />
            Pengaturan
          </button>
          <button
            onClick={async () => await supabase.auth.signOut()}
            className="py-2.5 px-3 rounded-xl bg-red-100/50 border border-red-200/50 text-red-500 hover:bg-red-200 transition-colors text-xs font-bold shadow-inner"
            title="Keluar"
          >
            Keluar
          </button>
        </div>
      </div>
    </aside>

      {/* Settings Modal */}
      <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  );
}
