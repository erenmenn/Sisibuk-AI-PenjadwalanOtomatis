"use client";
import { useState, useEffect } from "react";
import { useAppStore } from "@/lib/store";
import { StudySource } from "@/lib/types";
import { INTENT_LABELS } from "@/lib/types";
import {
  BookOpen, Plus, Trash2, Play, Square, Link2, FileText, Video,
  File, Clock, Trophy, Timer, Zap, Globe, Hash, Calendar,
  ExternalLink, ChevronRight, CheckCircle, Sparkles, FolderHeart
} from "lucide-react";
import { format, isSameDay } from "date-fns";
import { id } from "date-fns/locale";

const FILE_TYPE_CONFIG = {
  link:  { icon: Globe,    color: "#3b82f6", bg: "#eff6ff", label: "Link" },
  note:  { icon: FileText, color: "#10b981", bg: "#ecfdf5", label: "Catatan" },
  pdf:   { icon: File,     color: "#f43f5e", bg: "#fff1f2", label: "PDF" },
  video: { icon: Video,    color: "#d946ef", bg: "#fdf4ff", label: "Video/YT" },
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
  return <span className="font-mono text-3xl font-black tracking-wider drop-shadow-md">{h}:{m}:{s}</span>;
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

  // Source form
  const [srcTitle, setSrcTitle] = useState("");
  const [srcSubject, setSrcSubject] = useState("");
  const [srcDesc, setSrcDesc] = useState("");
  const [srcUrl, setSrcUrl] = useState("");
  const [srcType, setSrcType] = useState<StudySource["fileType"]>("link");

  // Timer form
  const [timerSubject, setTimerSubject] = useState("");
  const [timerTopics, setTimerTopics] = useState("");

  const activeLog = studyLogs.find(l => l.id === activeStudyLogId);
  const totalMins = studyLogs.filter(l => l.finishedAt).reduce((a, l) => a + l.durationMinutes, 0);

  // Study-plan schedules (from AI)
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

  return (
    <div className="flex flex-col h-full w-full bg-transparent overflow-hidden">
      
      {/* Decorative background blobs specific to study room */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#c084fc]/10 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#34d399]/10 rounded-full blur-[80px] pointer-events-none" />

      {/* Header */}
      <div className="bg-white/40 backdrop-blur-md border-b border-white/60 px-8 pt-8 pb-0 shrink-0 relative z-10">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h1 className="text-3xl font-black text-[#1e1b4b] flex items-center gap-3">
              <span className="p-2 bg-gradient-to-br from-[#c084fc] to-[#a855f7] rounded-xl text-white shadow-lg"><BookOpen size={24}/></span>
              Study Room
            </h1>
            <p className="text-sm font-semibold text-purple-700 mt-2">Lacak waktu belajar, simpan materi, jadilah juara! 🏆</p>
          </div>
          {/* Stats Badges */}
          <div className="flex gap-4 mb-2">
            <div className="bg-gradient-to-br from-[#d946ef] to-[#ec4899] rounded-2xl px-5 py-3 text-white text-center shadow-[0_8px_16px_rgba(236,72,153,0.3)]">
              <p className="text-xl font-black drop-shadow-sm">{Math.floor(totalMins / 60)}j {totalMins % 60}m</p>
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-90">Total Belajar</p>
            </div>
            <div className="bg-gradient-to-br from-[#fbbf24] to-[#f59e0b] rounded-2xl px-5 py-3 text-white text-center shadow-[0_8px_16px_rgba(245,158,11,0.3)]">
              <p className="text-xl font-black drop-shadow-sm">{studyLogs.filter(l => l.finishedAt).length}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-90">Sesi Selesai</p>
            </div>
          </div>
        </div>

        {/* Fancy Tabs */}
        <div className="flex gap-2">
          {(["plan","timer","sources","history"] as const).map(t => {
            const labels = {
              plan: { text: "Rencana AI", emoji: "🗓️" },
              timer: { text: "Timer", emoji: "⏱️" },
              sources: { text: "Sumber", emoji: "📂" },
              history: { text: "Riwayat", emoji: "📊" }
            };
            return (
              <button key={t} onClick={() => setTab(t)}
                className={`px-6 py-3 text-sm font-bold transition-all relative rounded-t-2xl flex items-center gap-2 ${
                  tab === t 
                    ? "bg-white/70 text-[#7C3AED] shadow-[0_-4px_10px_rgba(0,0,0,0.03)] border-t border-x border-white/60 box-border border-b-0 h-[46px]" 
                    : "text-purple-500/80 hover:text-purple-700 hover:bg-white/30 h-[42px] translate-y-1 border border-transparent box-border"
                }`}>
                <span>{labels[t].emoji}</span> {labels[t].text}
                {t === "timer" && activeLog && <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-pink-500 animate-pulse shadow-[0_0_8px_rgba(236,72,153,0.8)]" />}
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-8 relative z-10 custom-scrollbar">

        {/* ── TAB: AI Study Plan ── */}
        {tab === "plan" && (
          <div className="max-w-4xl mx-auto flex flex-col gap-6">
            {studySchedules.length === 0 ? (
              <div className="bg-white/60 backdrop-blur-md border border-white border-dashed rounded-[2rem] p-14 text-center shadow-sm">
                <div className="w-20 h-20 bg-gradient-to-br from-[#c084fc] to-[#a855f7] rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-[0_10px_20px_rgba(168,85,247,0.3)]">
                  <Sparkles size={40} className="text-white" />
                </div>
                <h3 className="text-2xl font-black text-[#1e1b4b] mb-3">Belum ada rencana belajar</h3>
                <p className="text-sm font-medium text-purple-700 mb-8 max-w-sm mx-auto">
                  Chat dengan MILKUN.AI dan bilang:<br />
                  <span className="inline-block mt-2 font-bold px-4 py-2 bg-purple-100/80 rounded-xl text-purple-600">
                    &quot;aku mau belajar React dan AI!&quot;
                  </span>
                </p>
                <button onClick={() => useAppStore.getState().setView("chat")}
                  className="bg-gradient-to-br from-[#d946ef] to-[#ec4899] text-white px-8 py-4 rounded-full font-bold shadow-[0_8px_16px_rgba(236,72,153,0.3)] hover:-translate-y-1 transition-transform flex items-center gap-2 mx-auto text-sm">
                  Coba Ngobrol Sekarang <ChevronRight size={18} />
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-8">
                {/* Left: Today */}
                <section className="flex flex-col gap-4">
                  <h2 className="text-xs font-black text-purple-900 uppercase tracking-widest flex items-center gap-2">
                    <span className="text-lg">⚡</span> Belajar Hari Ini
                  </h2>
                  {todayStudy.length === 0 ? (
                    <div className="bg-white/60 rounded-[1.5rem] p-6 text-center text-purple-400 font-bold border border-white/50 text-sm">
                      Bebas tugas hari ini! 🎉
                    </div>
                  ) : (
                    todayStudy.map((sch, i) => {
                      const gradients = ["from-[#d946ef] to-[#ec4899]", "from-[#fbbf24] to-[#f59e0b]", "from-[#38bdf8] to-[#0ea5e9]"];
                      const grad = gradients[i % gradients.length];
                      return (
                        <div key={sch.id} className={`bg-gradient-to-r ${grad} rounded-[1.5rem] p-5 text-white shadow-lg hover:-translate-y-1 transition-transform`}>
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <p className="text-[9px] font-black uppercase opacity-80 mb-1 tracking-widest bg-white/20 inline-block px-2 py-0.5 rounded-full">Hari ini</p>
                              <h3 className="font-bold text-xl leading-snug drop-shadow-sm">{sch.title}</h3>
                            </div>
                            {sch.isCompleted && <CheckCircle className="text-white/80" fill="currentColor" />}
                          </div>
                          
                          <div className="flex justify-between items-end">
                            <span className="bg-white/20 px-3 py-1 rounded-lg text-xs font-black font-mono shadow-inner border border-white/30">
                              {sch.deadlineAt ? format(new Date(sch.deadlineAt), "HH:mm") : "--:--"}
                            </span>
                            {!sch.isCompleted && (
                              <button
                                onClick={() => { setTimerSubject(sch.title); setSelectedScheduleId(sch.id); setTab("timer"); }}
                                className="bg-white text-purple-700 px-4 py-2 rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-shadow flex items-center gap-1.5"
                              >
                                <Play size={14} fill="currentColor" /> Gas Belajar!
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </section>

                {/* Right: Upcoming */}
                <section className="flex flex-col gap-4">
                  <h2 className="text-xs font-black text-purple-900 uppercase tracking-widest flex items-center gap-2">
                    <span className="text-lg">📆</span> Daftar Antrean Belajar
                  </h2>
                  <div className="flex flex-col gap-3">
                    {upcomingStudy.length === 0 ? (
                      <div className="bg-white/60 rounded-[1.5rem] p-6 text-center text-purple-400 font-bold border border-white/50 text-sm">
                        Antrean kosong. Santai dulu! ☕
                      </div>
                    ) : (upcomingStudy.map((sch, i) => (
                      <div key={sch.id} className="bg-white/80 backdrop-blur-md rounded-[1.2rem] p-4 border border-white shadow-sm flex items-center justify-between hover:scale-[1.02] transition-transform">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-500 font-bold shrink-0">
                            {i+1}
                          </div>
                          <div>
                            <h4 className="font-bold text-sm text-[#1e1b4b] leading-tight mb-1">{sch.title}</h4>
                            <p className="text-xs text-purple-500 font-medium font-mono">
                              {sch.deadlineAt ? format(new Date(sch.deadlineAt), "d MMM | HH:mm", { locale: id }) : "-"}
                            </p>
                          </div>
                        </div>
                        {!sch.isCompleted && (
                           <button onClick={() => { setTimerSubject(sch.title); setSelectedScheduleId(sch.id); setTab("timer"); }}
                             className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center hover:bg-purple-600 hover:text-white transition-colors shrink-0">
                             <Play size={16} fill="currentColor" className="ml-0.5" />
                           </button>
                        )}
                      </div>
                    )))}
                  </div>
                </section>
              </div>
            )}
          </div>
        )}

        {/* ── TAB: Timer ── */}
        {tab === "timer" && (
          <div className="flex flex-col gap-5 max-w-xl mx-auto items-center justify-center h-full pb-10">
            {activeLog ? (
              <div className="bg-gradient-to-b from-[#d946ef] to-[#8b5cf6] rounded-[2.5rem] p-12 text-center text-white relative overflow-hidden shadow-[0_20px_40px_rgba(139,92,246,0.3)] w-full border border-white/30">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-white/10 -translate-y-1/2 translate-x-1/2 blur-3xl" />
                
                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-20 h-20 bg-white/20 backdrop-blur-md border border-white/40 rounded-3xl flex items-center justify-center mb-6 shadow-lg animate-bounce">
                    <Timer size={40} className="text-white drop-shadow-md" />
                  </div>
                  <p className="text-white/80 text-[10px] font-black uppercase tracking-widest mb-2 bg-white/10 px-3 py-1 rounded-full border border-white/20">Sedang Fokus Belajar</p>
                  <h2 className="text-2xl font-black mb-1 drop-shadow-sm">{activeLog.subject.replace("Belajar: ", "")}</h2>
                  {activeLog.topics.length > 0 && (
                    <p className="text-purple-100 text-sm mb-6 font-medium">{activeLog.topics.join("  •  ")}</p>
                  )}
                  
                  <div className="bg-black/20 px-8 py-5 rounded-[2rem] border-t border-white/10 shadow-inner mb-10 w-full">
                     <LiveTimer startedAt={activeLog.startedAt} />
                  </div>

                  <button onClick={handleStopAndComplete}
                    className="bg-white text-purple-700 px-8 py-4 rounded-full font-black text-sm shadow-[0_10px_20px_rgba(0,0,0,0.2)] hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
                    <Square size={16} fill="currentColor" /> SELESAI & SIMPAN XP
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white/80 backdrop-blur-md border border-white/80 rounded-[2.5rem] p-10 shadow-lg w-full">
                <div className="w-16 h-16 bg-gradient-to-tr from-[#38bdf8] to-[#818cf8] rounded-[1.2rem] mx-auto flex items-center justify-center mb-6 shadow-md -rotate-6">
                  <Clock size={32} className="text-white" />
                </div>
                <h2 className="text-2xl font-black text-center text-[#1e1b4b] mb-2">Mulai Sesi Fokus</h2>
                
                <div className="bg-green-50 text-green-700 px-4 py-2 rounded-xl text-xs font-bold text-center mb-8 mx-auto w-max border border-green-200">
                  ⚡ 2 XP didapat tiap 1 Menit!
                </div>

                <div className="flex flex-col gap-4">
                  {studySchedules.filter(s => !s.isCompleted).length > 0 && (
                    <div>
                      <label className="text-[10px] font-black text-purple-800 uppercase tracking-widest mb-1.5 block">Pilih Rencana AI (Opsional)</label>
                      <select
                        value={selectedScheduleId || ""}
                        onChange={e => {
                          const val = e.target.value;
                          setSelectedScheduleId(val || null);
                          if (val) {
                            const sch = schedules.find(s => s.id === val);
                            if (sch) setTimerSubject(sch.title);
                          }
                        }}
                        className="w-full bg-white border border-purple-200 rounded-2xl px-4 py-3.5 text-sm focus:outline-none focus:ring-4 focus:ring-purple-500/10 font-medium"
                      >
                        <option value="">-- Bebas (Independent Study) --</option>
                        {studySchedules.filter(s => !s.isCompleted).map(sch => (
                          <option key={sch.id} value={sch.id}>{sch.title}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  <div>
                    <label className="text-[10px] font-black text-purple-800 uppercase tracking-widest mb-1.5 block">Materi / Topik Utama *</label>
                    <input value={timerSubject} onChange={e => setTimerSubject(e.target.value)}
                      placeholder="Contoh: Kalkulus Dasar" className="w-full bg-white border border-purple-200 rounded-2xl px-4 py-3.5 text-sm focus:outline-none focus:ring-4 focus:ring-purple-500/10 font-bold" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-purple-800 uppercase tracking-widest mb-1.5 block">Target Sub-topik</label>
                    <input value={timerTopics} onChange={e => setTimerTopics(e.target.value)}
                      placeholder="Turunan, Integral, dll" className="w-full bg-white border border-purple-200 rounded-2xl px-4 py-3.5 text-sm focus:outline-none focus:ring-4 focus:ring-purple-500/10 font-medium" />
                  </div>
                </div>
                
                <button onClick={handleStartTimer} disabled={!timerSubject.trim()}
                  className="mt-8 w-full py-4 bg-gradient-to-r from-[#d946ef] to-[#ec4899] text-white rounded-2xl font-black text-sm shadow-[0_8px_20px_rgba(236,72,153,0.3)] hover:-translate-y-1 transition-transform disabled:opacity-50 disabled:transform-none">
                  ▶ START TIMER
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── TAB: Sources ── */}
        {tab === "sources" && (
          <div className="flex flex-col gap-6 max-w-4xl mx-auto">
            <div className="flex justify-between items-center bg-white/60 backdrop-blur-md px-6 py-4 rounded-2xl border border-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-xl text-white flex items-center justify-center shadow-sm">
                   <FolderHeart size={20}/>
                </div>
                <div>
                  <h2 className="text-sm font-black text-purple-900 uppercase tracking-widest">Gudang Materi</h2>
                  <p className="text-xs font-semibold text-purple-600">Simpan link, PDF, atau catatan</p>
                </div>
              </div>
              <button onClick={() => setShowAddSource(v => !v)}
                className="flex items-center gap-2 bg-[#8b5cf6] text-white px-5 py-2.5 rounded-full text-xs font-bold shadow-[0_4px_12px_rgba(139,92,246,0.3)] hover:scale-105 transition-transform">
                <Plus size={16} /> Materi Baru
              </button>
            </div>

            {showAddSource && (
              <div className="bg-white/90 backdrop-blur-md border border-white/60 rounded-[2rem] p-8 shadow-[0_10px_30px_rgba(0,0,0,0.05)] animate-in slide-in-from-top-4 relative">
                <h3 className="font-black text-xl text-[#1e1b4b] mb-6 border-b border-purple-100 pb-4">Tambah Sumber Belajar ✨</h3>
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="text-[10px] font-black text-purple-800 uppercase tracking-widest mb-1.5 block">Judul Materi *</label>
                    <input value={srcTitle} onChange={e => setSrcTitle(e.target.value)} placeholder="Catatan Chapter RAG" className="w-full bg-purple-50/50 border border-purple-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 font-bold text-[#1e1b4b]" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-purple-800 uppercase tracking-widest mb-1.5 block">Mata Kuliah *</label>
                    <input value={srcSubject} onChange={e => setSrcSubject(e.target.value)} placeholder="AI & ML" className="w-full bg-purple-50/50 border border-purple-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 font-bold text-[#1e1b4b]" />
                  </div>
                  <div className="col-span-2">
                    <label className="text-[10px] font-black text-purple-800 uppercase tracking-widest mb-1.5 block">Format Materi</label>
                    <div className="flex gap-3 flex-wrap">
                      {(["link","note","pdf","video"] as const).map(t => {
                        const cfg = FILE_TYPE_CONFIG[t];
                        return (
                          <button key={t} onClick={() => setSrcType(t)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border-2 transition-all ${srcType === t ? "shadow-md scale-105" : "border-transparent bg-gray-50 text-gray-400 hover:bg-gray-100"}`}
                            style={srcType === t ? { backgroundColor: cfg.bg, borderColor: cfg.color, color: cfg.color } : {}}>
                            <cfg.icon size={16} /> {cfg.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div className="col-span-2">
                    <label className="text-[10px] font-black text-purple-800 uppercase tracking-widest mb-1.5 block">Tautan URL (Opsional)</label>
                    <input value={srcUrl} onChange={e => setSrcUrl(e.target.value)} placeholder="https://..." className="w-full bg-purple-50/50 border border-purple-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" />
                  </div>
                  <div className="col-span-2">
                    <label className="text-[10px] font-black text-purple-800 uppercase tracking-widest mb-1.5 block">Catatan Pendek</label>
                    <textarea value={srcDesc} onChange={e => setSrcDesc(e.target.value)} placeholder="Materi ini bagus untuk persiapan UTS..." className="w-full bg-purple-50/50 border border-purple-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none h-20" />
                  </div>
                </div>
                <div className="flex gap-3 mt-6 justify-end items-center border-t border-purple-100 pt-6">
                  <button onClick={() => setShowAddSource(false)} className="px-5 py-2.5 text-sm font-bold text-gray-500 hover:text-gray-800">Batalkan</button>
                  <button onClick={handleAddSource} className="px-6 py-2.5 bg-[#10b981] text-white rounded-xl text-sm font-black shadow-[0_4px_12px_rgba(16,185,129,0.3)] hover:scale-105 transition-transform flex items-center gap-2">
                    Simpan Materi 🚀
                  </button>
                </div>
              </div>
            )}

            {studySources.length === 0 ? (
              <div className="text-center py-20 bg-white/40 backdrop-blur-sm rounded-[2rem] border border-dashed border-white">
                <div className="w-20 h-20 bg-white rounded-full mx-auto flex items-center justify-center mb-4 shadow-sm">
                   <BookOpen size={30} className="text-purple-300" />
                </div>
                <h3 className="text-lg font-bold text-purple-800 mb-1">Gudangmu masih kosong</h3>
                <p className="text-sm text-purple-600 font-medium">Masukan artikel, e-book, atau link youtube favoritmu.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-5">
                {studySources.map(src => {
                  const cfg = FILE_TYPE_CONFIG[src.fileType];
                  return (
                    <div key={src.id} className="bg-white/80 backdrop-blur-md border border-white rounded-[1.5rem] p-5 shadow-sm hover:shadow-md transition-all group hover:-translate-y-1">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-[1rem] flex items-center justify-center shrink-0 border border-white/50 shadow-inner" style={{ backgroundColor: cfg.bg }}>
                            <cfg.icon size={24} style={{ color: cfg.color }} />
                          </div>
                          <div>
                            <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md" style={{ backgroundColor: cfg.bg, color: cfg.color }}>{src.subject}</span>
                            <h3 className="font-bold text-[#1e1b4b] leading-tight mt-1.5 text-base">{src.title}</h3>
                          </div>
                        </div>
                        <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          {src.url && <a href={src.url} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 hover:bg-blue-500 hover:text-white transition-colors"><ExternalLink size={14} /></a>}
                          <button onClick={() => deleteStudySource(src.id)} className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-colors"><Trash2 size={14} /></button>
                        </div>
                      </div>
                      {src.description && <p className="text-sm text-gray-600 font-medium bg-gray-50/50 p-3 rounded-xl border border-gray-100 line-clamp-2">{src.description}</p>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── TAB: History ── */}
        {tab === "history" && (
          <div className="flex flex-col gap-5 max-w-3xl mx-auto">
            <h2 className="text-[11px] font-black text-purple-900 uppercase tracking-widest text-center mt-2 mb-4 bg-white/60 mx-auto px-6 py-2 rounded-full border border-white/80">📜 Rekam Jejak Belajarmu</h2>
            {studyLogs.length === 0 ? (
              <div className="text-center py-20 bg-white/40 backdrop-blur-sm rounded-[2rem] border border-dashed border-white">
                <Trophy size={40} className="mx-auto mb-3 text-amber-300" />
                <h3 className="text-lg font-bold text-purple-800 mb-1">Belum ada jejak</h3>
                <p className="text-sm text-purple-600 font-medium">Buka menu Timer dan mulai sesi pertama kamu!</p>
              </div>
            ) : (
              [...studyLogs].reverse().map(log => (
                <div key={log.id} className={`bg-white/80 backdrop-blur-md rounded-[1.5rem] p-5 flex items-center justify-between shadow-[0_4px_15px_rgba(0,0,0,0.02)] border border-white transition-all hover:scale-[1.01] ${!log.finishedAt ? "ring-2 ring-pink-400" : ""}`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-[1.2rem] flex items-center justify-center shrink-0 shadow-inner ${log.finishedAt ? "bg-gradient-to-br from-emerald-400 to-teal-500" : "bg-gradient-to-br from-pink-400 to-rose-500 animate-pulse"}`}>
                      {log.finishedAt ? <Trophy size={24} className="text-white drop-shadow-sm" /> : <Timer size={24} className="text-white drop-shadow-sm" />}
                    </div>
                    <div>
                      <h3 className="font-bold text-[#1e1b4b] text-lg">{log.subject.replace("Belajar: ", "")}</h3>
                      {log.topics.length > 0 && <p className="text-xs text-purple-500 font-semibold mt-0.5">{log.topics.join("  •  ")}</p>}
                      <p className="text-[10px] font-black text-gray-400 mt-1.5 uppercase tracking-widest">
                        {format(new Date(log.startedAt), "d MMM | HH:mm", { locale: id })}
                        {log.finishedAt && `  →  ${format(new Date(log.finishedAt), "HH:mm")}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {log.finishedAt ? (
                      <div className="text-right bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100">
                        <p className="text-xl font-black text-emerald-600">{log.durationMinutes}<span className="text-xs">m</span></p>
                        <p className="text-[10px] font-black text-emerald-500 uppercase">+{log.durationMinutes * 2} XP ✨</p>
                      </div>
                    ) : (
                      <div className="bg-pink-50 px-4 py-2 rounded-xl border border-pink-100">
                         <LiveTimer startedAt={log.startedAt} />
                      </div>
                    )}
                    {log.finishedAt && (
                      <button onClick={() => deleteStudyLog(log.id)} className="w-10 h-10 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 flex items-center justify-center transition-colors">
                        <Trash2 size={16} />
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
