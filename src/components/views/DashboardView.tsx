"use client";
import { useAppStore } from "@/lib/store";
import { INTENT_LABELS } from "@/lib/types";
import { format, isToday, differenceInDays } from "date-fns";
import { id } from "date-fns/locale";
import { 
  MessageSquare, CalendarCheck, ArrowRight, Flame, Zap, Trophy, Goal,
  ClipboardList, PenTool, MonitorPlay, Dumbbell, Star, CalendarDays, Activity, BookOpen
} from "lucide-react";

const getElegantIcon = (type: string) => {
  const props = { size: 22, strokeWidth: 2.5, className: "text-white drop-shadow-sm" };
  if (type.includes("DEADLINE")) return <ClipboardList {...props} />;
  if (type.includes("EXAM")) return <PenTool {...props} />;
  if (type.includes("STUDY") || type === "CLASS") return <BookOpen {...props} />;
  if (type === "WEBINAR" || type === "MEETING") return <MonitorPlay {...props} />;
  if (type === "COMPETITION") return <Trophy {...props} />;
  if (type === "WORKOUT" || type === "SPORT") return <Dumbbell {...props} />;
  if (type === "RUNNING") return <Activity {...props} />;
  if (type === "PERSONAL") return <Star {...props} />;
  return <CalendarDays {...props} />;
};

export default function DashboardView() {
  const { schedules, classSchedules, user, setView } = useAppStore();

  const today = new Date();
  const dayOfWeek = today.getDay() === 0 ? 7 : today.getDay();
  const todayClasses = classSchedules.filter(c => c.dayOfWeek === dayOfWeek && c.isActive);
  const todayDeadlines = schedules.filter(s => !s.isCompleted && s.deadlineAt && isToday(new Date(s.deadlineAt)));
  const upcomingDeadlines = schedules
    .filter(s => !s.isCompleted && s.deadlineAt)
    .sort((a, b) => new Date(a.deadlineAt!).getTime() - new Date(b.deadlineAt!).getTime())
    .slice(0, 4);

  const totalDone = schedules.filter(s => s.isCompleted).length;
  const totalActive = schedules.filter(s => !s.isCompleted).length;

  return (
    <div className="flex-1 h-full overflow-y-auto px-8 py-8 relative z-10 custom-scrollbar">
      
      {/* ── Top Header Section ── */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <p className="text-sm font-bold text-purple-900 uppercase tracking-widest mb-1 shadow-sm">
            {format(today, "EEEE, d MMMM yyyy", { locale: id })}
          </p>
          <h1 className="text-4xl font-black text-[#1E1B4B] mb-2 drop-shadow-sm flex items-center gap-2">
            Halo, <span className="text-[#8B5CF6]">{user.name}!</span> 👋
          </h1>
          <p className="text-sm font-medium text-purple-800">
            Kamu punya {totalActive} tugas aktif. Yuk kita selesaikan satu per satu!
          </p>
          <div className="flex gap-4 mt-6">
            <button
              onClick={() => setView("chat")}
              className="flex items-center gap-2 bg-gradient-to-r from-[#d946ef] to-[#ec4899] text-white px-6 py-3.5 rounded-[1.2rem] font-bold text-sm shadow-[0_8px_16px_rgba(236,72,153,0.3)] hover:scale-105 transition-transform"
            >
              <MessageSquare size={18} /> Cek Penjadwalan MILKUN.AI <ArrowRight size={16} />
            </button>
            <button
              onClick={() => setView("schedules")}
              className="flex items-center gap-2 bg-white text-purple-900 px-6 py-3.5 rounded-[1.2rem] font-bold text-sm shadow-[0_4px_10px_rgba(0,0,0,0.05)] hover:shadow-lg transition-transform hover:scale-105"
            >
              <CalendarCheck size={18} className="text-[#8B5CF6]" /> Lihat Semua Jadwal
            </button>
          </div>
        </div>

        {/* ── Top Right 3 Cards ── */}
        <div className="flex gap-4">
          <div className="bg-gradient-to-br from-[#d091fb] to-[#ab5bf9] rounded-[1.5rem] w-[100px] h-[100px] flex flex-col items-center justify-center text-white shadow-[0_12px_24px_rgba(168,85,247,0.4)] hover:-translate-y-1 transition-transform">
            <p className="text-3xl font-black">{user.xp}</p>
            <p className="text-[9px] uppercase font-bold tracking-widest opacity-90 mt-1">Total XP</p>
          </div>
          <div className="bg-gradient-to-br from-[#fcb323] to-[#f7940e] rounded-[1.5rem] w-[100px] h-[100px] flex flex-col items-center justify-center text-white shadow-[0_12px_24px_rgba(245,158,11,0.4)] hover:-translate-y-1 transition-transform">
            <p className="text-3xl font-black">{user.streakDays}</p>
            <p className="text-[9px] uppercase font-bold tracking-widest opacity-90 mt-1">Hari Streak</p>
          </div>
          <div className="bg-gradient-to-br from-[#30deb4] to-[#12b77a] rounded-[1.5rem] w-[100px] h-[100px] flex flex-col items-center justify-center text-white shadow-[0_12px_24px_rgba(16,185,129,0.4)] hover:-translate-y-1 transition-transform">
            <p className="text-3xl font-black">{totalDone}</p>
            <p className="text-[9px] uppercase font-bold tracking-widest opacity-90 mt-1">Selesai</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        
        {/* ── Left Column (2 spans) ── */}
        <div className="col-span-2 flex flex-col gap-6">
          
          {/* Kuliah Hari Ini */}
          <section>
            <h2 className="text-[11px] font-black text-purple-900 uppercase tracking-widest mb-3 flex items-center gap-2">
              📅 Kuliah Hari Ini
            </h2>
            <div className="bg-gradient-to-r from-[#d95df4] to-[#fb7cbc] rounded-[1.5rem] p-5 text-white shadow-[0_10px_25px_rgba(217,70,239,0.25)]">
              {todayClasses.length === 0 ? (
                <p className="font-bold text-sm">Tidak ada kuliah hari ini.</p>
              ) : (
                todayClasses.map(cls => (
                  <div key={cls.id} className="flex justify-between items-center">
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-widest opacity-80 flex items-center gap-1.5"><Goal size={12}/> Sacred Time</p>
                      <h3 className="text-xl font-bold mt-0.5">{cls.subjectName}</h3>
                    </div>
                    <div className="bg-white/25 border border-white/40 px-4 py-1.5 rounded-full text-sm font-bold shadow-sm">
                      {cls.startTime} - {cls.endTime}
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Deadline Hari Ini */}
          <section>
            <h2 className="text-[11px] font-black text-purple-900 uppercase tracking-widest mb-3 flex items-center gap-2">
              🔥 Deadline Hari Ini
            </h2>
            <div className="bg-gradient-to-r from-[#ff826a] to-[#ff5d66] rounded-[1.5rem] p-5 text-white shadow-[0_10px_25px_rgba(244,63,94,0.25)]">
              {todayDeadlines.length === 0 ? (
                <p className="font-bold text-sm">Wah, aman! Tidak ada deadline hari ini.</p>
              ) : (
                todayDeadlines.map(sch => {
                  const intent = INTENT_LABELS[sch.type] || INTENT_LABELS.UNKNOWN;
                  return (
                    <div key={sch.id} className="flex justify-between items-center">
                      <div className="flex gap-4 items-center">
                        <div className="w-12 h-12 rounded-[1rem] flex items-center justify-center shrink-0 shadow-[inset_0_2px_4px_rgba(255,255,255,0.4),_0_4px_12px_rgba(244,63,94,0.3)] border-2 border-white/50 bg-white/20 transition-transform">
                          {getElegantIcon(sch.type)}
                        </div>
                        <div>
                          <p className="text-[9px] font-bold uppercase tracking-widest opacity-80 mb-0.5 shadow-sm">{intent.label}</p>
                          <h3 className="text-xl font-bold shadow-sm leading-tight">{sch.title}</h3>
                        </div>
                      </div>
                      <div className="bg-white/25 border border-white/40 px-4 py-1.5 rounded-full text-sm font-bold shadow-sm">
                        HARI INI!
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>

          {/* Mendatang Section */}
          <section>
            <h2 className="text-[11px] font-black text-purple-900 uppercase tracking-widest mb-3 flex items-center gap-2 mt-2">
              📋 Mendatang
            </h2>
            <div className="flex flex-col gap-4">
              {upcomingDeadlines.length === 0 ? (
                <div className="bg-white/80 backdrop-blur-md rounded-[1.5rem] p-6 text-center font-bold text-purple-300 border border-white/60 shadow-sm">
                  Belum ada tugas mendesak.
                </div>
              ) : (
                upcomingDeadlines.map((sch, i) => {
                  const intent = INTENT_LABELS[sch.type] || INTENT_LABELS.UNKNOWN;
                  const days = sch.deadlineAt ? differenceInDays(new Date(sch.deadlineAt), today) : null;
                  return (
                    <div 
                      key={sch.id} 
                      className="relative rounded-[1.5rem] overflow-hidden shadow-[0_4px_20px_rgba(31,38,135,0.05)] hover:shadow-[0_8px_30px_rgba(31,38,135,0.1)] hover:-translate-y-0.5 transition-all group border border-white/60 bg-white/40 backdrop-blur-md"
                      style={{ backgroundImage: `linear-gradient(135deg, ${intent.color}15 0%, rgba(255,255,255,0.5) 100%)` }}
                    >
                      {/* Soft Top Glow instead of solid stripe */}
                      <div className="absolute top-0 left-0 right-0 h-1 blur-[2px]" style={{ backgroundColor: intent.color }} />
                      
                      <div className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          {/* Elegant thick icon box */}
                          <div 
                            className="w-12 h-12 rounded-[1rem] flex items-center justify-center shrink-0 shadow-[0_4px_12px_rgba(31,38,135,0.1),_inset_0_2px_4px_rgba(255,255,255,0.3)] border-2 border-white/50 group-hover:scale-110 group-hover:rotate-6 transition-transform" 
                            style={{ backgroundColor: intent.color }}
                          >
                            {getElegantIcon(sch.type)}
                          </div>
                          <div>
                            <h3 className="font-bold text-[#1e1b4b] text-base mb-1">{sch.title}</h3>
                            <div className="flex gap-2 items-center">
                              <span className="text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md bg-white border border-white/50 shadow-sm" style={{ color: intent.color }}>{intent.label}</span>
                              <span className="text-[10px] font-bold text-purple-500/80 uppercase tracking-widest px-2 py-1 bg-white/40 rounded-md">
                                {sch.deadlineAt ? format(new Date(sch.deadlineAt), "d MMM yyyy", { locale: id }) : "-"}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="shrink-0 text-right ml-4">
                          <p className="text-[9px] uppercase tracking-widest font-black text-purple-400 mb-0.5">SISA</p>
                          <p className={`font-black text-sm ${days === 0 ? "text-[#f43f5e] animate-pulse drop-shadow-sm" : "text-[#f97316]"}`}>
                            {days === 0 ? "HARI INI!" : days === null ? "-" : `${days} hari`}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>

        </div>

        {/* ── Right Column ── */}
        <div className="flex flex-col gap-6">
          
          {/* Aksi Cepat */}
          <section>
            <h2 className="text-[11px] font-black text-purple-900 uppercase tracking-widest mb-3 flex items-center gap-2">
               ⚡ Aksi Cepat
            </h2>
            <div className="flex flex-col gap-3">
              <button onClick={() => setView("chat")} className="w-full flex justify-between items-center text-white font-bold bg-gradient-to-r from-[#df5fdd] to-[#ff7fc5] rounded-[1.2rem] px-5 py-4 shadow-[0_8px_20px_rgba(236,72,153,0.25)] hover:-translate-y-0.5 transition-transform">
                <span className="flex items-center gap-2 text-sm drop-shadow-sm"><span className="text-lg">📝</span> Tambah jadwal baru</span>
                <ArrowRight size={16}/>
              </button>
              <button onClick={() => setView("study")} className="w-full flex justify-between items-center text-white font-bold bg-gradient-to-r from-[#fcb320] to-[#fd800a] rounded-[1.2rem] px-5 py-4 shadow-[0_8px_20px_rgba(245,158,11,0.25)] hover:-translate-y-0.5 transition-transform">
                <span className="flex items-center gap-2 text-sm drop-shadow-sm"><span className="text-lg">📚</span> Mulai sesi belajar</span>
                <ArrowRight size={16}/>
              </button>
              <button onClick={() => setView("calendar")} className="w-full flex justify-between items-center text-white font-bold bg-gradient-to-r from-[#21d0ff] to-[#04b5f4] rounded-[1.2rem] px-5 py-4 shadow-[0_8px_20px_rgba(14,165,233,0.25)] hover:-translate-y-0.5 transition-transform">
                <span className="flex items-center gap-2 text-sm drop-shadow-sm"><span className="text-lg">📅</span> Lihat kalender</span>
                <ArrowRight size={16}/>
              </button>
            </div>
          </section>

          {/* Gamifikasi */}
          <section>
            <h2 className="text-[11px] font-black text-purple-900 uppercase tracking-widest mb-3 flex items-center gap-2">
               🏆 Gamifikasi
            </h2>
            <div className="bg-white rounded-[1.5rem] p-6 shadow-sm border border-white/60">
              <div className="flex items-center gap-4 mb-5">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#d946ef] to-[#8b5cf6] text-white flex items-center justify-center text-lg font-bold shadow-[0_4px_12px_rgba(139,92,246,0.25)]">
                  {user.name.substring(0,2).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-[#1e1b4b] text-base leading-tight">{user.name}</h3>
                  <p className="text-[#8B5CF6] text-[10px] uppercase font-bold tracking-widest mt-0.5">Level {user.level}</p>
                </div>
              </div>

              <div className="flex justify-between items-end mb-1">
                <p className="font-bold text-[#1e1b4b] text-sm">{user.xp} XP</p>
              </div>
              
              <div className="w-full h-2.5 bg-purple-100 rounded-full overflow-hidden mb-6">
                <div className="h-full bg-gradient-to-r from-[#a855f7] to-[#ec4899] rounded-full" style={{ width: `${Math.min(100, (user.xp / 100) * 100)}%` }}></div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="bg-[#fefce8] rounded-xl py-2 flex flex-col items-center justify-center border border-yellow-100">
                   <p className="text-yellow-500 font-bold text-base mb-1"><Flame size={16}/></p>
                   <p className="text-[8px] font-black uppercase text-yellow-500 tracking-wider text-center">{user.streakDays}<br/>HARI</p>
                </div>
                <div className="bg-[#ecfdf5] rounded-xl py-2 flex flex-col items-center justify-center border border-green-100">
                   <p className="text-green-500 font-bold text-base mb-0.5">{totalDone}</p>
                   <p className="text-[8px] font-black uppercase text-green-500 tracking-wider text-center">SELESAI</p>
                </div>
                <div className="bg-[#faf5ff] rounded-xl py-2 flex flex-col items-center justify-center border border-purple-100">
                   <p className="text-[#a855f7] font-bold text-base mb-0.5">{user.badges.length}</p>
                   <p className="text-[8px] font-black uppercase text-[#a855f7] tracking-wider text-center">BADGE</p>
                </div>
              </div>

            </div>
          </section>

        </div>

      </div>
    </div>
  );
}
