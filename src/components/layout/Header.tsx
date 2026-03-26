import { useAppStore } from "@/lib/store";
import { Flame, Menu, Zap } from "lucide-react";
import { LEVEL_CONFIG } from "@/lib/types";

export default function Header() {
  const { currentView, user, xpAnimation } = useAppStore();

  if (currentView === "onboarding" || currentView === "detail") return null;

  const currentLevelInfo = LEVEL_CONFIG.find((l) => l.level === user.level) || LEVEL_CONFIG[0];

  return (
    <header className="sticky top-0 w-full glass-panel z-50 flex items-center justify-between px-4 h-14 bg-[#16213E]/90">
      <div className="flex items-center gap-3">
        <button className="p-1 hover:bg-white/10 rounded-full transition-colors">
          <Menu className="w-5 h-5 text-gray-300" />
        </button>
        <span className="font-display font-bold text-lg tracking-wide text-white">
          jadwal<span className="text-[#6C63FF]">.ai</span>
        </span>
      </div>

      <div className="flex justify-end gap-3 items-center text-sm font-medium">
        <div className="flex items-center gap-1 bg-[#EF4444]/20 text-[#EF4444] px-2 py-1 rounded-full text-xs">
          <Flame className="w-4 h-4" />
          <span>{user.streakDays}</span>
        </div>
        <div className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded-full text-xs relative">
          <Zap className="w-4 h-4 text-[#FFB347]" />
          <span>Lv.{user.level}</span>
          
          {/* XP floating animation */}
          {xpAnimation !== null && (
            <div className="absolute -top-6 left-1/2 min-w-max -translate-x-1/2 animate-bounce flex items-center gap-1 text-[#22C55E] bg-[#22C55E]/20 px-2 py-0.5 rounded-full text-[10px] font-bold">
              +{xpAnimation} XP
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
