import { useState } from "react";
import { useAppStore } from "@/lib/store";
import {
  MessageSquare, Calendar, ListTodo, Trophy, Flame, Zap,
  BookOpen, Loader2, LayoutDashboard, Sparkles, ChevronRight,
  Settings, UserCircle
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { LEVEL_CONFIG } from "@/lib/types";
import SettingsModal from "./SettingsModal";
import Image from "next/image";

export default function Sidebar() {
  const { currentView, setView, user, llmStatus, xpAnimation } = useAppStore();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const tabs = [
    { id: "dashboard", icon: LayoutDashboard, label: "Beranda",        color: "#f43f5e", bg: "bg-rose-50" },
    { id: "chat",      icon: MessageSquare,   label: "Tanya SISIBUK",  color: "#8b5cf6", bg: "bg-violet-50" },
    { id: "calendar",  icon: Calendar,        label: "Kalender",       color: "#3b82f6", bg: "bg-blue-50" },
    { id: "schedules", icon: ListTodo,        label: "Semua Tugas",    color: "#f97316", bg: "bg-orange-50" },
    { id: "study",     icon: BookOpen,        label: "Ruang Fokus",    color: "#10b981", bg: "bg-emerald-50" },
    { id: "profile",   icon: UserCircle,      label: "Profil & XP",    color: "#f59e0b", bg: "bg-amber-50" },
  ] as const;

  const currentLevelInfo = LEVEL_CONFIG.find(l => l.level === user.level) || LEVEL_CONFIG[0];
  const nextLevel = LEVEL_CONFIG.find(l => l.level === user.level + 1);
  const xpProgress = nextLevel ? Math.min(100, ((user.xp - (LEVEL_CONFIG[user.level - 1]?.xpRequired || 0)) / (nextLevel.xpRequired - (LEVEL_CONFIG[user.level - 1]?.xpRequired || 0))) * 100) : 100;

  const isOnline = llmStatus === "online";
  const isChecking = llmStatus === "checking";
  const isRateLimited = llmStatus === "rate_limited";
  const statusDot = isOnline ? "bg-emerald-400 shadow-[0_0_8px_#34d399]" : isChecking ? "bg-amber-400 shadow-[0_0_8px_#fbbf24]" : "bg-rose-400 shadow-[0_0_8px_#fb7185] animate-pulse";
  const statusText = isOnline ? "Siap Membantu" : isRateLimited ? "Rate Limit" : isChecking ? "Menghubungkan..." : "Tidur";
  const statusColor = isOnline ? "text-emerald-500" : isChecking ? "text-amber-500" : "text-rose-500";

  return (
    <>
    <aside className="w-[280px] h-full flex flex-col bg-transparent overflow-visible relative border-none z-50">

      <div className="flex flex-col h-full relative z-10 bg-white/70 backdrop-blur-[40px] m-5 mr-0 rounded-[2.5rem] shadow-[inset_0_0_0_1px_rgba(255,255,255,1),_0_20px_40px_rgba(244,63,94,0.05)] overflow-hidden border border-rose-50/50">

        {/* Brand */}
        <div className="px-6 pt-7 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-rose-400 to-red-500 flex items-center justify-center shadow-[0_8px_16px_rgba(244,63,94,0.3)] shrink-0 border border-rose-300 relative overflow-hidden">
               <div className="absolute inset-0 bg-white/20 top-0 h-1/2 rounded-b-full blur-[2px]" />
               <Sparkles size={20} className="text-white relative z-10" />
            </div>
            <div>
              <h1 className="text-[18px] font-black tracking-tighter leading-none">
                <span className="text-[#1a1a1a]">SISIBUK</span><span className="text-transparent bg-clip-text bg-gradient-to-br from-rose-500 to-red-600">.AI</span>
              </h1>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Asisten Jadwal Cerdas</p>
            </div>
          </div>
        </div>

        {/* User Card */}
        <div className="mx-5 mb-6">
          <div className="bg-gradient-to-br from-rose-50 to-orange-50/50 rounded-[24px] p-4 text-[#1a1a1a] relative overflow-hidden shadow-inner border border-rose-100/50">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-rose-200/40 to-transparent rounded-bl-full pointer-events-none" />
            
            <div className="flex items-center gap-3 relative z-10 mb-3">
              <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-rose-400 to-orange-400 flex items-center justify-center font-black text-white shadow-[0_4px_12px_rgba(244,63,94,0.3)] shrink-0 border-2 border-white">
                {user.name.substring(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-[13px] truncate leading-tight text-slate-800">{user.name}</p>
                <p className="text-[10px] text-rose-500 font-black tracking-wide mt-0.5 uppercase">
                  {currentLevelInfo.emoji} Lv.{user.level} · {currentLevelInfo.name}
                </p>
              </div>
            </div>

            {/* XP Bar */}
            <div className="relative z-10 bg-white/60 p-2.5 rounded-[16px] border border-white">
              <div className="flex justify-between text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                <span className="text-rose-600">{user.xp} XP</span>
                {nextLevel && <span>→ {nextLevel.xpRequired} XP</span>}
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                <div className="h-full bg-gradient-to-r from-rose-400 to-orange-400 rounded-full transition-all duration-700 relative" style={{ width: `${xpProgress}%` }}>
                  <div className="absolute inset-0 bg-white/20 w-full h-1/2" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 flex flex-col gap-1 overflow-y-auto">
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest px-3 mb-2">Menu Utama</p>
          {tabs.map(tab => {
            const isActive = currentView === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setView(tab.id)}
                className={`group flex items-center gap-3 w-full px-3 py-2.5 rounded-[20px] transition-all duration-300 text-left relative overflow-hidden ${
                  isActive
                    ? "bg-white shadow-[0_4px_16px_rgba(0,0,0,0.03)] border border-slate-100"
                    : "hover:bg-slate-50/80 border border-transparent"
                }`}
              >
                {/* Cute active marker */}
                {isActive && (
                  <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1.5 h-6 rounded-full" style={{ backgroundColor: tab.color }} />
                )}
                <div
                  className={`w-9 h-9 rounded-[14px] flex items-center justify-center shrink-0 transition-transform duration-300 ${isActive ? "scale-110 shadow-sm" : "group-hover:scale-110 group-hover:bg-white border border-transparent group-hover:border-slate-100 group-hover:shadow-sm"}`}
                  style={isActive ? { backgroundColor: tab.color, color: "#fff" } : { backgroundColor: "transparent", color: "#94a3b8" }}
                >
                  <Icon size={17} style={!isActive ? { color: tab.color } : {}} />
                </div>
                <span
                  className={`text-[13px] font-bold tracking-tight transition-colors ${isActive ? "text-[#1a1a1a]" : "text-slate-500 group-hover:text-slate-700"}`}
                >
                  {tab.label}
                </span>
                {isActive && <ChevronRight size={14} className="ml-auto opacity-30 text-slate-800" />}
              </button>
            );
          })}
        </nav>

        {/* LLM Status Cute */}
        <div className="mx-5 md:mt-4">
          <div className="bg-gradient-to-br from-slate-50 to-white backdrop-blur-md rounded-[20px] p-3 flex items-center gap-3 shadow-sm border border-slate-100 relative overflow-hidden group hover:border-slate-200 transition-colors">
            
            <div className="w-10 h-10 rounded-[14px] bg-slate-100 flex items-center justify-center relative shadow-inner overflow-hidden shrink-0 border border-slate-200">
               {isChecking && <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex justify-center items-center"><Loader2 size={16} className="text-amber-500 animate-spin" /></div>}
               {!isChecking && <div className={`w-4 h-4 rounded-full ${isOnline ? 'bg-emerald-400' : 'bg-rose-400'}`} />}
            </div>
            
            <div className="flex flex-col min-w-0 flex-1 justify-center">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-[11px] font-black text-slate-700 tracking-tight">Si Manis</span>
                <div className={`w-1.5 h-1.5 rounded-full ${statusDot}`} />
              </div>
              <span className={`text-[9px] font-bold tracking-wider uppercase ${statusColor}`}>{statusText}</span>
            </div>
            
          </div>
        </div>

        {/* Bottom: Settings & Logout row */}
        <div className="px-5 pb-6 pt-5 flex items-center gap-2">
          <button
            onClick={() => setSettingsOpen(true)}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-[18px] bg-slate-50 border border-slate-100 text-slate-500 hover:text-slate-800 hover:bg-white hover:shadow-sm transition-all text-xs font-bold group"
          >
            <Settings size={14} className="group-hover:rotate-90 transition-transform duration-500" />
            Pengaturan
          </button>
          <button
            onClick={async () => await supabase.auth.signOut()}
            className="w-11 h-11 flex items-center justify-center rounded-[18px] bg-red-50 border border-red-100 text-red-500 hover:bg-red-500 hover:text-white transition-all text-xs font-bold group"
            title="Keluar"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4 translate-x-[2px] group-hover:translate-x-[4px] transition-transform">
               <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
            </svg>
          </button>
        </div>
      </div>
    </aside>

      {/* Settings Modal */}
      <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  );
}
