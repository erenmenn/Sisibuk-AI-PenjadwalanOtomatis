"use client";
import { useState, useEffect } from "react";
import { useAppStore } from "@/lib/store";
import { StudySource } from "@/lib/types";
import {
  BookOpen, Plus, Trash2, Play, Square, Link2, FileText, Video,
  File, Clock, Trophy, Timer, Zap, Globe,
  ExternalLink, ChevronRight, CheckCircle, Sparkles, FolderHeart, Flame,
  CalendarDays, LineChart
} from "lucide-react";
import { format, isSameDay } from "date-fns";
import { id } from "date-fns/locale";

const FILE_TYPE_CONFIG = {
  link:  { icon: Globe,    color: "#3b82f6", bg: "#eff6ff",  label: "Link" },
  note:  { icon: FileText, color: "#10b981", bg: "#ecfdf5",  label: "Catatan" },
  pdf:   { icon: File,     color: "#f43f5e", bg: "#fff1f2",  label: "PDF" },
  video: { icon: Video,    color: "#d946ef", bg: "#fdf4ff",  label: "Video/YT" },
};

function LiveTimer({ startedAt }: { startedAt: string }) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const f = () => setElapsed(Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000));
    f(); const i = setInterval(f, 1000); return () => clearInterval(i);
  }, [startedAt]);
  const h = String(Math.floor(elapsed / 3600)).padStart(2, "0");
  const m = String(Math.floor((elapsed % 3600) / 60)).padStart(2, "0");
  const s = String(elapsed % 60).padStart(2, "0");
  return <span className="font-mono text-4xl font-black tracking-widest">{h}:{m}:{s}</span>;
}

export default function StudyView() {
  const {
    schedules,
    studySources, addStudySource, deleteStudySource,
    studyLogs, startStudyLog, stopStudyLog, deleteStudyLog,
    activeStudyLogId, completeSchedule
  } = useAppStore();

  const [tab, setTab] = useState<"plan" | "sources" | "timer" | "history">("plan");
  const [showAddSource, setShowAddSource] = useState(false);
  const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(null);

  const [srcTitle, setSrcTitle] = useState("");
  const [srcSubject, setSrcSubject] = useState("");
  const [srcDesc, setSrcDesc] = useState("");
  const [srcUrl, setSrcUrl] = useState("");
  const [srcType, setSrcType] = useState<StudySource["fileType"]>("link");
  const [timerSubject, setTimerSubject] = useState("");
  const [timerTopics, setTimerTopics] = useState("");

  const activeLog = studyLogs.find(l => l.id === activeStudyLogId);
  const totalMins = studyLogs.filter(l => l.finishedAt).reduce((a, l) => a + l.durationMinutes, 0);

  const studySchedules = schedules.filter(s => s.type === "STUDY_PLAN" || s.type === "STUDY_SESSION");
  const today = new Date();
  const todayStudy = studySchedules.filter(s => s.deadlineAt && isSameDay(new Date(s.deadlineAt), today));
  const upcomingStudy = studySchedules.filter(s => !s.isCompleted && s.deadlineAt && !isSameDay(new Date(s.deadlineAt), today));

  const handleAddSource = () => {
    if (!srcTitle.trim() || !srcSubject.trim()) return;
    addStudySource({ title: srcTitle, subject: srcSubject, description: srcDesc, url: srcUrl || null, fileType: srcType });
    setSrcTitle(""); setSrcSubject(""); setSrcDesc(""); setSrcUrl(""); setSrcType("link");
    setShowAddSource(false);
  };

  const handleStartTimer = () => {
    if (!timerSubject.trim()) return;
    startStudyLog({
      scheduleId: selectedScheduleId,
      subject: timerSubject,
      topics: timerTopics.split(",").map(t => t.trim()).filter(Boolean),
      notes: "",
    });
    setTimerSubject(""); setTimerTopics(""); setSelectedScheduleId(null);
    setTab("timer");
  };

  const handleStopAndComplete = () => {
    if (!activeLog) return;
    stopStudyLog(activeLog.id);
    if (activeLog.scheduleId) completeSchedule(activeLog.scheduleId);
  };

  const TAB_ITEMS = [
    { key: "plan",    label: "Rencana AI", icon: CalendarDays },
    { key: "timer",   label: "Timer",      icon: Timer },
    { key: "sources", label: "Sumber",     icon: FolderHeart },
    { key: "history", label: "Riwayat",    icon: LineChart },
  ] as const;

  return (
    <div className="flex flex-col h-full w-full overflow-hidden" style={{
      background: "linear-gradient(160deg, rgba(255,255,255,0.4) 0%, rgba(245,235,255,0.3) 50%, rgba(230,240,255,0.4) 100%)"
    }}>

      {/* ── HEADER ── */}
      <div className="relative px-8 pt-8 pb-0 shrink-0 overflow-hidden">
        {/* Decorative */}
        <div className="absolute -top-8 -right-8 w-64 h-64 rounded-full opacity-15 pointer-events-none"
          style={{ background: "radial-gradient(circle,#a855f7,transparent 70%)" }} />

        <div className="relative flex items-end justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm"
                style={{ background: "linear-gradient(135deg,#818cf8,#a855f7)" }}>
                <BookOpen size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-[#1e1b4b] leading-none">Study Room</h1>
                <p className="text-xs font-semibold text-purple-500 mt-0.5">Lacak belajar, raih prestasi! 🏆</p>
              </div>
            </div>
          </div>

          {/* Stat pills */}
          <div className="flex gap-3 mb-1">
            <div className="bg-white/80 border border-white rounded-2xl px-5 py-2.5 flex items-center gap-2.5 shadow-sm">
              <div className="w-7 h-7 rounded-xl bg-purple-100 flex items-center justify-center">
                <Clock size={14} className="text-purple-500" />
              </div>
              <div>
                <p className="text-base font-black text-purple-700 leading-none">{Math.floor(totalMins/60)}j {totalMins%60}m</p>
                <p className="text-[9px] font-bold uppercase tracking-widest text-purple-400">Total Belajar</p>
              </div>
            </div>
            <div className="bg-white/80 border border-white rounded-2xl px-5 py-2.5 flex items-center gap-2.5 shadow-sm">
              <div className="w-7 h-7 rounded-xl bg-amber-100 flex items-center justify-center">
                <Trophy size={14} className="text-amber-500" />
              </div>
              <div>
                <p className="text-base font-black text-amber-600 leading-none">{studyLogs.filter(l => l.finishedAt).length}</p>
                <p className="text-[9px] font-bold uppercase tracking-widest text-amber-400">Sesi Selesai</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-1.5 z-10 relative px-4">
          {TAB_ITEMS.map(t => {
            const Icon = t.icon;
            return (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`relative px-5 py-3 text-sm font-bold transition-all rounded-t-2xl flex items-center gap-2.5 ${
                  tab === t.key
                    ? "bg-white/60 backdrop-blur-xl text-[#7c3aed] shadow-[0_-4px_10px_rgba(255,255,255,0.3)] border-t border-x border-white/80"
                    : "text-purple-500/70 hover:text-purple-700 hover:bg-white/40 translate-y-1"
                }`}>
                <Icon size={16} className={tab === t.key ? "text-purple-600" : "opacity-70"} /> {t.label}
                {t.key === "timer" && activeLog && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-pink-500 animate-pulse border border-white" />
                )}
              </button>
            );
          })}
        </div>

        <div className="h-px bg-gradient-to-r from-white/40 via-white/10 to-transparent" />
      </div>

      {/* ── CONTENT ── */}
      <div className="flex-1 overflow-y-auto px-8 py-6 custom-scrollbar">

        {/* ══ TAB: Rencana AI ══ */}
        {tab === "plan" && (
          <div className="max-w-4xl mx-auto flex flex-col gap-5">
            {studySchedules.length === 0 ? (
              <div className="bg-white/70 border border-white rounded-3xl p-14 text-center shadow-sm">
                <div className="w-20 h-20 mx-auto mb-5 rounded-3xl flex items-center justify-center shadow-md"
                  style={{ background: "linear-gradient(135deg,#c084fc,#a855f7)" }}>
                  <Sparkles size={36} className="text-white" />
                </div>
                <h3 className="text-xl font-black text-[#1e1b4b] mb-2">Belum ada rencana belajar</h3>
                <p className="text-sm text-purple-600 mb-6 max-w-xs mx-auto">
                  Chat dengan SISIBUK.AI dan bilang:<br />
                  <span className="inline-block mt-2 font-bold px-4 py-2 bg-purple-100 rounded-xl text-purple-700">
                    &quot;Aku mau belajar React dan AI!&quot;
                  </span>
                </p>
                <button onClick={() => useAppStore.getState().setView("chat")}
                  className="flex items-center gap-2 mx-auto px-6 py-3 text-white text-sm font-bold rounded-full shadow-md hover:-translate-y-0.5 transition-transform"
                  style={{ background: "linear-gradient(135deg,#d946ef,#a855f7)" }}>
                  Coba Ngobrol Sekarang <ChevronRight size={16} />
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-6">
                {/* Left: Today */}
                <section className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-pink-100 flex items-center justify-center">
                      <Zap size={12} className="text-pink-500" />
                    </div>
                    <h2 className="text-[11px] font-black text-pink-700 uppercase tracking-widest">⚡ Belajar Hari Ini</h2>
                  </div>

                  {todayStudy.length === 0 ? (
                    <div className="bg-white/70 border border-white rounded-2xl p-5 text-center">
                      <p className="text-purple-300 font-bold text-sm">Bebas tugas hari ini! 🎉</p>
                    </div>
                  ) : (
                    todayStudy.map((sch, i) => {
                      const colors = [
                        { from: "#818cf8", to: "#a855f7" },
                        { from: "#fb923c", to: "#f97316" },
                        { from: "#38bdf8", to: "#0ea5e9" },
                      ];
                      const c = colors[i % colors.length];
                      return (
                        <div key={sch.id} className="relative bg-white/80 border border-white rounded-2xl p-5 shadow-sm overflow-hidden hover:-translate-y-0.5 transition-transform">
                          <div className="h-1 absolute top-0 left-0 right-0 rounded-t-2xl"
                            style={{ background: `linear-gradient(90deg,${c.from},${c.to})` }} />
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full text-white"
                                style={{ background: `linear-gradient(135deg,${c.from},${c.to})` }}>Hari ini</span>
                              <h3 className="font-black text-[#1e1b4b] text-base mt-1.5 leading-snug">{sch.title}</h3>
                              <p className="text-xs text-purple-400 mt-0.5 font-mono">
                                {sch.deadlineAt ? format(new Date(sch.deadlineAt), "HH:mm") : "--:--"}
                              </p>
                            </div>
                            {sch.isCompleted
                              ? <CheckCircle size={24} className="text-emerald-400 shrink-0" fill="currentColor" />
                              : (
                                <button onClick={() => { setTimerSubject(sch.title); setSelectedScheduleId(sch.id); setTab("timer"); }}
                                  className="flex items-center gap-1.5 text-white text-xs font-bold px-3 py-2 rounded-xl shadow-sm hover:shadow-md transition hover:-translate-y-0.5"
                                  style={{ background: `linear-gradient(135deg,${c.from},${c.to})` }}>
                                  <Play size={12} fill="currentColor" /> Gas!
                                </button>
                              )
                            }
                          </div>
                        </div>
                      );
                    })
                  )}
                </section>

                {/* Right: Queue */}
                <section className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-indigo-100 flex items-center justify-center">
                      <Link2 size={12} className="text-indigo-500" />
                    </div>
                    <h2 className="text-[11px] font-black text-indigo-700 uppercase tracking-widest">📆 Antrean Belajar</h2>
                  </div>

                  <div className="flex flex-col gap-2.5">
                    {upcomingStudy.length === 0 ? (
                      <div className="bg-white/70 border border-white rounded-2xl p-5 text-center">
                        <p className="text-purple-300 font-bold text-sm">Antrean kosong. Santai dulu! ☕</p>
                      </div>
                    ) : (
                      upcomingStudy.map((sch, i) => (
                        <div key={sch.id} className="group flex items-center justify-between bg-white/80 border border-white rounded-2xl px-4 py-3 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-black text-sm shrink-0">
                              {i + 1}
                            </div>
                            <div>
                              <h4 className="font-bold text-sm text-[#1e1b4b]">{sch.title}</h4>
                              <p className="text-[10px] text-purple-400 font-mono">
                                {sch.deadlineAt ? format(new Date(sch.deadlineAt), "d MMM · HH:mm", { locale: id }) : "-"}
                              </p>
                            </div>
                          </div>
                          {!sch.isCompleted && (
                            <button onClick={() => { setTimerSubject(sch.title); setSelectedScheduleId(sch.id); setTab("timer"); }}
                              className="w-9 h-9 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center hover:bg-purple-600 hover:text-white transition-colors shrink-0">
                              <Play size={14} fill="currentColor" className="ml-0.5" />
                            </button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </section>
              </div>
            )}
          </div>
        )}

        {/* ══ TAB: Timer ══ */}
        {tab === "timer" && (
          <div className="flex flex-col w-full max-w-4xl mx-auto pt-4">
            {activeLog ? (
              /* Active session card */
              <div className="w-full rounded-[2.5rem] overflow-hidden shadow-[0_20px_60px_rgba(139,92,246,0.2)] bg-white/60 backdrop-blur-2xl border border-white/60">
                {/* Top gradient bar */}
                <div className="h-2 w-full" style={{ background: "linear-gradient(90deg,#818cf8,#a855f7,#ec4899)" }} />

                <div className="p-10 flex flex-col items-center justify-center text-center">
                  <div className="relative mb-6">
                    <div className="w-24 h-24 rounded-3xl flex items-center justify-center shadow-xl"
                      style={{ background: "linear-gradient(135deg,#818cf8,#a855f7,#ec4899)" }}>
                      <Timer size={44} className="text-white" />
                    </div>
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-pink-500 rounded-full border-2 border-white animate-pulse" />
                  </div>

                  <span className="text-[10px] font-black uppercase tracking-widest text-purple-600 bg-white/80 px-4 py-1.5 rounded-full mb-3 shadow-sm border border-purple-100">
                    Sedang Fokus Belajar
                  </span>
                  <h2 className="text-2xl font-black text-[#1e1b4b] mb-2">{activeLog.subject.replace("Belajar: ", "")}</h2>
                  {activeLog.topics.length > 0 && (
                    <p className="text-sm text-purple-500 mb-8 font-bold">{activeLog.topics.join("  •  ")}</p>
                  )}

                  <div className="w-full max-w-sm bg-white/50 border border-white rounded-3xl py-6 mb-8 shadow-inner">
                    <p className="text-indigo-400 text-[10px] font-black uppercase tracking-widest mb-2">Waktu Berjalan</p>
                    <LiveTimer startedAt={activeLog.startedAt} />
                  </div>

                  <button onClick={handleStopAndComplete}
                    className="w-full max-w-sm py-4 rounded-full font-black text-white shadow-[0_10px_25px_rgba(244,63,94,0.4)] hover:-translate-y-0.5 transition-transform flex items-center justify-center gap-2 border border-white/40"
                    style={{ background: "linear-gradient(135deg,#f43f5e,#f97316)" }}>
                    <Square size={16} fill="currentColor" /> SELESAI & SIMPAN XP
                  </button>
                </div>
              </div>
            ) : (
              /* Start form (Horizontal Glassmorphism Layout) */
              <div className="w-full flex flex-col md:flex-row bg-white/40 backdrop-blur-2xl border border-white/60 rounded-[2.5rem] shadow-lg overflow-hidden">
                
                {/* Left Side: Info & Hero */}
                <div className="flex-1 p-8 md:p-12 flex flex-col justify-center items-start text-left bg-gradient-to-br from-white/60 to-transparent border-r border-white/30">
                  <div className="w-16 h-16 rounded-2xl mb-6 flex items-center justify-center shadow-lg"
                    style={{ background: "linear-gradient(135deg,#38bdf8,#818cf8)" }}>
                    <Timer size={32} className="text-white" />
                  </div>
                  <h2 className="text-3xl font-black text-[#1e1b4b] font-syne mb-4">Mulai Sesi Fokus</h2>
                  <p className="text-sm text-purple-700/80 max-w-xs mb-8 leading-relaxed font-medium">
                    Siapkan dirimu, singkirkan gangguan, dan mulai fokus pada belajarmu. 
                  </p>
                  <div className="px-5 py-3 rounded-2xl text-xs font-black bg-emerald-100/80 text-emerald-700 border border-emerald-200 shadow-sm flex items-center gap-2">
                    <Sparkles size={16} className="text-emerald-500" /> +2 XP per menit fokus!
                  </div>
                </div>

                {/* Right Side: Inputs */}
                <div className="flex-[1.2] flex flex-col justify-center p-8 md:p-12 gap-5">
                  {studySchedules.filter(s => !s.isCompleted).length > 0 && (
                    <div>
                      <label className="text-[10px] font-black text-purple-700 uppercase tracking-widest mb-2 block ml-1">Pilih Rencana AI (Opsional)</label>
                      <select value={selectedScheduleId || ""} onChange={e => {
                        const val = e.target.value;
                        setSelectedScheduleId(val || null);
                        if (val) {
                          const sch = schedules.find(s => s.id === val);
                          if (sch) setTimerSubject(sch.title);
                        }
                      }} className="w-full bg-white/60 border border-white rounded-2xl px-5 py-4 text-sm font-semibold text-purple-900 focus:outline-none focus:ring-2 focus:ring-purple-400 shadow-sm transition-all focus:bg-white/90">
                        <option value="">-- Bebas (Independent Study) --</option>
                        {studySchedules.filter(s => !s.isCompleted).map(sch => (
                          <option key={sch.id} value={sch.id}>{sch.title}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  
                  <div>
                    <label className="text-[10px] font-black text-purple-700 uppercase tracking-widest mb-2 block ml-1">Materi / Topik Utama *</label>
                    <input value={timerSubject} onChange={e => setTimerSubject(e.target.value)}
                      placeholder="Contoh: Kalkulus Dasar"
                      className="w-full bg-white/60 border border-white rounded-2xl px-5 py-4 text-sm font-bold text-[#1e1b4b] focus:outline-none focus:ring-2 focus:ring-purple-400 shadow-sm transition-all focus:bg-white/90 placeholder-purple-300" />
                  </div>
                  
                  <div>
                    <label className="text-[10px] font-black text-purple-700 uppercase tracking-widest mb-2 block ml-1">Target Sub-topik (Opsional)</label>
                    <input value={timerTopics} onChange={e => setTimerTopics(e.target.value)}
                      placeholder="Contoh: Turunan, Integral, Latihan Soal..."
                      className="w-full bg-white/60 border border-white rounded-2xl px-5 py-4 text-sm font-semibold text-[#1e1b4b] focus:outline-none focus:ring-2 focus:ring-purple-400 shadow-sm transition-all focus:bg-white/90 placeholder-purple-300" />
                  </div>

                  <button onClick={handleStartTimer} disabled={!timerSubject.trim()}
                    className="mt-4 w-full py-4 rounded-2xl font-black text-white shadow-lg hover:-translate-y-0.5 transition-all outline-none border border-white/20 disabled:opacity-50 disabled:transform-none flex items-center justify-center gap-2"
                    style={{ background: "linear-gradient(135deg,#818cf8,#a855f7,#ec4899)" }}>
                    <Play size={16} fill="currentColor" /> MULAI TIMER SEKARANG
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══ TAB: Sources ══ */}
        {tab === "sources" && (
          <div className="flex flex-col gap-5 max-w-4xl mx-auto">
            {/* Toolbar */}
            <div className="flex justify-between items-center bg-white/80 border border-white rounded-2xl px-5 py-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg,#818cf8,#a855f7)" }}>
                  <FolderHeart size={18} className="text-white" />
                </div>
                <div>
                  <p className="font-black text-[#1e1b4b] text-sm">Gudang Materi</p>
                  <p className="text-[11px] text-purple-400 font-medium">Simpan link, PDF, atau catatan belajar</p>
                </div>
              </div>
              <button onClick={() => setShowAddSource(v => !v)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold text-white shadow-sm hover:-translate-y-0.5 transition-transform"
                style={{ background: "linear-gradient(135deg,#a855f7,#7c3aed)" }}>
                <Plus size={14} /> Materi Baru
              </button>
            </div>

            {/* Add form */}
            {showAddSource && (
              <div className="bg-white/90 border border-white rounded-3xl p-7 shadow-sm">
                <div className="h-1 -mx-7 -mt-7 mb-6 rounded-t-3xl" style={{ background: "linear-gradient(90deg,#818cf8,#a855f7,#ec4899)" }} />
                <h3 className="font-black text-lg text-[#1e1b4b] mb-5">Tambah Sumber Belajar ✨</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-purple-700 uppercase tracking-widest mb-1.5 block">Judul *</label>
                    <input value={srcTitle} onChange={e => setSrcTitle(e.target.value)} placeholder="Catatan Chapter RAG"
                      className="w-full bg-purple-50 border border-purple-200 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-purple-400" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-purple-700 uppercase tracking-widest mb-1.5 block">Mata Kuliah *</label>
                    <input value={srcSubject} onChange={e => setSrcSubject(e.target.value)} placeholder="AI & ML"
                      className="w-full bg-purple-50 border border-purple-200 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-purple-400" />
                  </div>
                  <div className="col-span-2">
                    <label className="text-[10px] font-black text-purple-700 uppercase tracking-widest mb-1.5 block">Format</label>
                    <div className="flex gap-2 flex-wrap">
                      {(["link","note","pdf","video"] as const).map(t => {
                        const cfg = FILE_TYPE_CONFIG[t];
                        return (
                          <button key={t} onClick={() => setSrcType(t)}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border-2 transition-all"
                            style={srcType === t
                              ? { backgroundColor: cfg.bg, borderColor: cfg.color, color: cfg.color }
                              : { backgroundColor: "#f9fafb", borderColor: "#f3f4f6", color: "#9ca3af" }}>
                            <cfg.icon size={14} /> {cfg.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div className="col-span-2">
                    <label className="text-[10px] font-black text-purple-700 uppercase tracking-widest mb-1.5 block">URL (Opsional)</label>
                    <input value={srcUrl} onChange={e => setSrcUrl(e.target.value)} placeholder="https://..."
                      className="w-full bg-purple-50 border border-purple-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" />
                  </div>
                  <div className="col-span-2">
                    <label className="text-[10px] font-black text-purple-700 uppercase tracking-widest mb-1.5 block">Catatan</label>
                    <textarea value={srcDesc} onChange={e => setSrcDesc(e.target.value)} placeholder="Deskripsi singkat..."
                      className="w-full bg-purple-50 border border-purple-200 rounded-xl px-4 py-3 text-sm resize-none h-20 focus:outline-none focus:ring-2 focus:ring-purple-400" />
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-5 pt-5 border-t border-purple-100">
                  <button onClick={() => setShowAddSource(false)} className="px-5 py-2.5 text-sm font-bold text-slate-400 hover:text-slate-700">Batal</button>
                  <button onClick={handleAddSource}
                    className="px-6 py-2.5 text-white text-sm font-black rounded-xl shadow-sm hover:-translate-y-0.5 transition-transform"
                    style={{ background: "linear-gradient(135deg,#10b981,#059669)" }}>
                    Simpan 🚀
                  </button>
                </div>
              </div>
            )}

            {/* Source cards */}
            {studySources.length === 0 ? (
              <div className="text-center py-16 bg-white/60 border border-dashed border-purple-200 rounded-3xl">
                <BookOpen size={32} className="mx-auto mb-3 text-purple-300" />
                <p className="font-black text-purple-700 mb-1">Gudangmu masih kosong</p>
                <p className="text-sm text-purple-400">Tambahkan artikel, e-book, atau link YouTube favoritmu.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {studySources.map(src => {
                  const cfg = FILE_TYPE_CONFIG[src.fileType];
                  return (
                    <div key={src.id} className="group bg-white/80 border border-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 overflow-hidden relative">
                      <div className="h-0.5 absolute top-0 left-0 right-0" style={{ backgroundColor: cfg.color }} />
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: cfg.bg }}>
                            <cfg.icon size={22} style={{ color: cfg.color }} />
                          </div>
                          <div>
                            <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md" style={{ backgroundColor: cfg.bg, color: cfg.color }}>{src.subject}</span>
                            <h3 className="font-bold text-[#1e1b4b] text-sm mt-1">{src.title}</h3>
                          </div>
                        </div>
                        <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          {src.url && <a href={src.url} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 hover:bg-blue-500 hover:text-white transition-colors"><ExternalLink size={13} /></a>}
                          <button onClick={() => deleteStudySource(src.id)} className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-red-400 hover:bg-red-500 hover:text-white transition-colors"><Trash2 size={13} /></button>
                        </div>
                      </div>
                      {src.description && <p className="text-xs text-slate-500 bg-slate-50 p-3 rounded-xl line-clamp-2">{src.description}</p>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ══ TAB: History ══ */}
        {tab === "history" && (
          <div className="flex flex-col gap-3 max-w-3xl mx-auto">
            <div className="flex items-center justify-center">
              <p className="text-[11px] font-black text-purple-700 uppercase tracking-widest bg-white/70 border border-white px-5 py-2 rounded-full shadow-sm">
                📜 Rekam Jejak Belajarmu
              </p>
            </div>

            {studyLogs.length === 0 ? (
              <div className="text-center py-16 bg-white/60 border border-dashed border-purple-200 rounded-3xl mt-2">
                <Trophy size={36} className="mx-auto mb-3 text-amber-300" />
                <p className="font-black text-purple-700 mb-1">Belum ada jejak</p>
                <p className="text-sm text-purple-400">Buka Timer dan mulai sesi pertamamu!</p>
              </div>
            ) : (
              [...studyLogs].reverse().map(log => (
                <div key={log.id} className={`group relative bg-white/80 border border-white rounded-2xl px-5 py-4 flex items-center justify-between shadow-sm hover:shadow-md transition-all overflow-hidden ${!log.finishedAt ? "ring-2 ring-pink-300" : ""}`}>
                  <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl"
                    style={{ background: log.finishedAt ? "linear-gradient(180deg,#34d399,#10b981)" : "linear-gradient(180deg,#f472b6,#f43f5e)" }} />

                  <div className="flex items-center gap-4 ml-3">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${log.finishedAt ? "" : "animate-pulse"}`}
                      style={{ background: log.finishedAt ? "linear-gradient(135deg,#34d399,#10b981)" : "linear-gradient(135deg,#f472b6,#f43f5e)" }}>
                      {log.finishedAt ? <Trophy size={22} className="text-white" /> : <Timer size={22} className="text-white" />}
                    </div>
                    <div>
                      <h3 className="font-bold text-[#1e1b4b] text-base">{log.subject.replace("Belajar: ", "")}</h3>
                      {log.topics.length > 0 && <p className="text-xs text-purple-400 mt-0.5">{log.topics.join("  •  ")}</p>}
                      <p className="text-[10px] text-slate-400 font-mono mt-1">
                        {format(new Date(log.startedAt), "d MMM · HH:mm", { locale: id })}
                        {log.finishedAt && ` → ${format(new Date(log.finishedAt), "HH:mm")}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {log.finishedAt ? (
                      <div className="text-right bg-emerald-50 border border-emerald-100 px-4 py-2 rounded-xl">
                        <p className="text-xl font-black text-emerald-600">{log.durationMinutes}<span className="text-xs">m</span></p>
                        <p className="text-[9px] font-black text-emerald-500 uppercase">+{log.durationMinutes * 2} XP</p>
                      </div>
                    ) : (
                      <div className="bg-pink-50 border border-pink-100 px-4 py-2 rounded-xl">
                        <LiveTimer startedAt={log.startedAt} />
                      </div>
                    )}
                    {log.finishedAt && (
                      <button onClick={() => deleteStudyLog(log.id)} className="w-9 h-9 rounded-full text-slate-300 hover:text-red-400 hover:bg-red-50 flex items-center justify-center transition-colors">
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
