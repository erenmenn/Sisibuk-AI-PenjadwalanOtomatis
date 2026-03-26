import { useAppStore } from "@/lib/store";
import { MessageSquare, Calendar, ListTodo, Trophy } from "lucide-react";

export default function BottomNav() {
  const { currentView, setView } = useAppStore();

  if (currentView === "onboarding" || currentView === "detail") return null;

  const tabs = [
    { id: "chat", icon: MessageSquare, label: "Chat" },
    { id: "calendar", icon: Calendar, label: "Kalender" },
    { id: "schedules", icon: ListTodo, label: "Semua" },
    { id: "profile", icon: Trophy, label: "Profil" },
  ] as const;

  return (
    <nav className="absolute bottom-0 w-full glass-panel border-t border-[rgba(255,255,255,0.05)] bg-[rgba(22,33,62,0.85)] z-50">
      <div className="flex justify-around items-center h-16 px-2">
        {tabs.map((tab) => {
          const isActive = currentView === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setView(tab.id)}
              className={`flex flex-col items-center justify-center w-full h-full transition-all duration-300 ${
                isActive ? "text-[#6C63FF]" : "text-gray-400 hover:text-gray-200"
              }`}
            >
              <div className="relative">
                <Icon
                  size={isActive ? 24 : 22}
                  className={`transition-all duration-300 ${
                    isActive ? "drop-shadow-[0_0_8px_rgba(108,99,255,0.6)]" : ""
                  }`}
                />
              </div>
              <span
                className={`text-[10px] mt-1 font-medium transition-all ${
                  isActive ? "opacity-100" : "opacity-60"
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
