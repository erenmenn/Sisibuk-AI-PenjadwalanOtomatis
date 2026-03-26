"use client";
import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { INTENT_LABELS, IntentType, ClassSchedule, PRIORITY_CONFIG } from "@/lib/types";
import {
  CheckCircle, Trash2, BarChart2, List, Filter, X, Plus, GraduationCap, Clock,
  Edit3, ToggleLeft, ToggleRight, BookOpen, Calendar, Users, Zap, Trophy, Target,
  ClipboardList, PenTool, MonitorPlay, Dumbbell, Star, CalendarDays, Activity
} from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { id } from "date-fns/locale";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";

/* ─── Helpers ─────────────────────────────────────────────── */
const DAY_NAMES = ["", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];
const DAY_SHORT = ["", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

const CLASS_COLORS = [
  "#7C3AED","#EC4899","#3B82F6","#10B981","#F97316",
  "#06B6D4","#EF4444","#84CC16","#F59E0B","#8B5CF6",
];

// Returns urgency badge config
const urg = (days: number | null, done: boolean) => {
  if (done) return { color: "#10B981", bg: "#D1FAE5", label: "Selesai ✅" };
  if (days === null) return { color: "#A78BFA", bg: "#EDE9FE", label: "Tanpa deadline" };
  if (days < 0) return { color: "#EF4444", bg: "#FEE2E2", label: "Terlewat!" };
  if (days === 0) return { color: "#F97316", bg: "#FFEDD5", label: "Hari ini!" };
  if (days <= 2) return { color: "#FBBF24", bg: "#FEF9C3", label: `${days} hr lagi` };
  if (days <= 7) return { color: "#10B981", bg: "#D1FAE5", label: `${days} hr lagi` };
  return { color: "#6B7280", bg: "#F3F4F6", label: `${days} hr lagi` };
};

type MainTab  = "list" | "class" | "chart";
type StatusFilter = "ALL" | "ACTIVE" | "DONE";

// Intent groups - now with better visual distinction
const INTENT_GROUPS = [
  {
    group: "Akademik",
    emoji: "🎓",
    color: "#7C3AED",
    bgLight: "#EDE9FE",
    description: "Kuliah, tugas, ujian",
    intents: ["DEADLINE_SUBMIT","DEADLINE_PROPOSAL","DEADLINE_REGISTER","EXAM","STUDY_PLAN","STUDY_SESSION","CLASS"] as IntentType[],
  },
  {
    group: "Event & Meeting",
    emoji: "📅",
    color: "#3B82F6",
    bgLight: "#DBEAFE",
    description: "Rapat, webinar, pelatihan",
    intents: ["MEETING","WEBINAR","TRAINING","COMPETITION"] as IntentType[],
  },
  {
    group: "Kesehatan",
    emoji: "💪",
    color: "#10B981",
    bgLight: "#D1FAE5",
    description: "Gym, lari, olahraga",
    intents: ["WORKOUT","RUNNING","SPORT"] as IntentType[],
  },
  {
    group: "Lainnya",
    emoji: "🌟",
    color: "#F97316",
    bgLight: "#FFEDD5",
    description: "Personal, info",
    intents: ["INFO","PERSONAL","UNKNOWN"] as IntentType[],
  },
];

const getElegantIcon = (type: string) => {
  const props = { size: 28, strokeWidth: 2.5, className: "text-white drop-shadow-md" };
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

// Visual distinction map — intent → shape style
const INTENT_STYLE: Record<string, { shape: string; label: string }> = {
  CLASS:             { shape: "rounded-full border-2 border-[#6C63FF] bg-[#6C63FF]/10 text-[#6C63FF]", label: "🏫 Kuliah" },
  EXAM:              { shape: "rounded-lg bg-[#8B5CF6] text-white", label: "✏️ Ujian" },
  DEADLINE_SUBMIT:   { shape: "rounded-lg bg-[#EF4444] text-white", label: "📋 Kumpul Tugas" },
  DEADLINE_PROPOSAL: { shape: "rounded-lg bg-[#F43F5E] text-white", label: "📄 Proposal" },
  DEADLINE_REGISTER: { shape: "rounded-lg bg-[#F97316] text-white", label: "📝 Pendaftaran" },
  STUDY_PLAN:        { shape: "rounded-lg border-2 border-dashed border-[#3B82F6] bg-[#3B82F6]/10 text-[#3B82F6]", label: "📚 Belajar" },
  STUDY_SESSION:     { shape: "rounded-lg border-2 border-dashed border-[#06B6D4] bg-[#06B6D4]/10 text-[#06B6D4]", label: "📖 Sesi Belajar" },
  MEETING:           { shape: "rounded-lg bg-[#F59E0B] text-white", label: "🤝 Meeting" },
  WEBINAR:           { shape: "rounded-lg bg-[#0EA5E9] text-white", label: "💻 Webinar" },
  TRAINING:          { shape: "rounded-lg bg-[#14B8A6] text-white", label: "🎓 Pelatihan" },
  COMPETITION:       { shape: "rounded-lg bg-[#EC4899] text-white", label: "🏆 Lomba" },
  WORKOUT:           { shape: "rounded-full border-2 border-[#10B981] bg-[#10B981]/10 text-[#10B981]", label: "💪 Workout" },
  RUNNING:           { shape: "rounded-full border-2 border-[#84CC16] bg-[#84CC16]/10 text-[#84CC16]", label: "🏃 Lari" },
  SPORT:             { shape: "rounded-full border-2 border-[#22D3EE] bg-[#22D3EE]/10 text-[#22D3EE]", label: "⚽ Olahraga" },
  INFO:              { shape: "rounded-lg border border-[#A78BFA] bg-[#A78BFA]/10 text-[#A78BFA]", label: "ℹ️ Info" },
  PERSONAL:          { shape: "rounded-lg border border-[#F472B6] bg-[#F472B6]/10 text-[#F472B6]", label: "🌟 Personal" },
  UNKNOWN:           { shape: "rounded-lg border border-gray-300 bg-gray-100 text-gray-500", label: "📌 Lainnya" },
  QUERY:             { shape: "rounded-lg border border-gray-300 bg-gray-100 text-gray-500", label: "❓ Query" },
};

const CTip = ({ active, payload, label }: any) =>
  active && payload?.length ? (
    <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-xl text-xs font-medium">
      <p className="font-bold mb-1">{label}</p>
      {payload.map((e: any, i: number) => <p key={i} style={{ color: e.color }}>● {e.name}: {e.value}</p>)}
    </div>
  ) : null;

const PTip = ({ active, payload }: any) =>
  active && payload?.length ? (
    <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-xl text-xs font-medium">
      <p className="font-bold mb-0.5" style={{ color: payload[0].payload.fill }}>{payload[0].name}</p>
      <p>{payload[0].value}</p>
    </div>
  ) : null;

/* ─── Add Class Form ─────────────────────────────────────── */
interface AddClassFormProps {
  onSave: (cls: Omit<ClassSchedule, "id" | "userId" | "isActive">) => void;
  onCancel: () => void;
  editing?: ClassSchedule;
}
function AddClassForm({ onSave, onCancel, editing }: AddClassFormProps) {
  const [name,     setName]     = useState(editing?.subjectName || "");
  const [day,      setDay]      = useState(editing?.dayOfWeek   || 1);
  const [start,    setStart]    = useState(editing?.startTime   || "08:00");
  const [end,      setEnd]      = useState(editing?.endTime     || "09:40");
  const [room,     setRoom]     = useState(editing?.room        || "");
  const [lecturer, setLecturer] = useState(editing?.lecturer    || "");
  const [credits,  setCredits]  = useState(editing?.credits     || 2);
  const [color,    setColor]    = useState(editing?.color       || CLASS_COLORS[0]);

  const canSave = name.trim().length > 0;
  const handleSave = () => {
    if (!canSave) return;
    onSave({ subjectName: name, dayOfWeek: day, startTime: start, endTime: end, room, lecturer, credits, color });
  };

  return (
    <div className="bg-white border border-[var(--color-border)] rounded-2xl p-6 shadow-md animate-in slide-in-from-top-2">
      <h3 className="text-base font-bold text-[var(--color-text-primary)] mb-5 flex items-center gap-2">
        <GraduationCap size={18} className="text-[#7C3AED]" />
        {editing ? "Edit Jadwal Kuliah" : "Tambah Jadwal Kuliah"}
      </h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-xs font-bold text-[var(--color-text-secondary)] mb-1 uppercase tracking-wider">Nama Mata Kuliah *</label>
          <input value={name} onChange={e => setName(e.target.value)}
            placeholder="Misal: Web Service, Sistem Cerdas..."
            className="w-full bg-[var(--color-neutral)] border border-[var(--color-border)] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#7C3AED] transition-colors" />
        </div>
        <div>
          <label className="block text-xs font-bold text-[var(--color-text-secondary)] mb-1 uppercase tracking-wider">Hari</label>
          <select value={day} onChange={e => setDay(Number(e.target.value))}
            className="w-full bg-[var(--color-neutral)] border border-[var(--color-border)] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#7C3AED] transition-colors">
            {DAY_NAMES.slice(1).map((d, i) => <option key={i+1} value={i+1}>{d}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-[var(--color-text-secondary)] mb-1 uppercase tracking-wider">SKS</label>
          <select value={credits} onChange={e => setCredits(Number(e.target.value))}
            className="w-full bg-[var(--color-neutral)] border border-[var(--color-border)] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#7C3AED] transition-colors">
            {[1,2,3,4].map(n => <option key={n} value={n}>{n} SKS</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-[var(--color-text-secondary)] mb-1 uppercase tracking-wider">Jam Mulai</label>
          <input type="time" value={start} onChange={e => setStart(e.target.value)}
            className="w-full bg-[var(--color-neutral)] border border-[var(--color-border)] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#7C3AED] transition-colors" />
        </div>
        <div>
          <label className="block text-xs font-bold text-[var(--color-text-secondary)] mb-1 uppercase tracking-wider">Jam Selesai</label>
          <input type="time" value={end} onChange={e => setEnd(e.target.value)}
            className="w-full bg-[var(--color-neutral)] border border-[var(--color-border)] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#7C3AED] transition-colors" />
        </div>
        <div>
          <label className="block text-xs font-bold text-[var(--color-text-secondary)] mb-1 uppercase tracking-wider">Ruangan</label>
          <input value={room} onChange={e => setRoom(e.target.value)} placeholder="Ruang 3.2 / Online"
            className="w-full bg-[var(--color-neutral)] border border-[var(--color-border)] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#7C3AED] transition-colors" />
        </div>
        <div>
          <label className="block text-xs font-bold text-[var(--color-text-secondary)] mb-1 uppercase tracking-wider">Dosen</label>
          <input value={lecturer} onChange={e => setLecturer(e.target.value)} placeholder="Dr. Budi Santoso"
            className="w-full bg-[var(--color-neutral)] border border-[var(--color-border)] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#7C3AED] transition-colors" />
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-bold text-[var(--color-text-secondary)] mb-2 uppercase tracking-wider">Warna Label</label>
          <div className="flex gap-2 flex-wrap">
            {CLASS_COLORS.map(c => (
              <button key={c} onClick={() => setColor(c)}
                className={`w-8 h-8 rounded-xl transition-all hover:scale-110 ${color === c ? "ring-2 ring-offset-2 ring-[#7C3AED] scale-110" : ""}`}
                style={{ backgroundColor: c }} />
            ))}
          </div>
        </div>
      </div>
      <div className="flex gap-2 mt-5 justify-end">
        <button onClick={onCancel} className="px-4 py-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors">Batal</button>
        <button onClick={handleSave} disabled={!canSave}
          className="px-6 py-2.5 bg-gradient-to-r from-[#7C3AED] to-[#EC4899] text-white rounded-xl text-sm font-bold disabled:opacity-40 hover:scale-[1.02] transition-all">
          {editing ? "Simpan" : "Tambahkan"}
        </button>
      </div>
    </div>
  );
}

/* ─── Class Table ─────────────────────────────────────────── */
function ClassTable() {
  const { classSchedules, addClass, removeClass } = useAppStore();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing]   = useState<ClassSchedule | null>(null);
  const [hideInactive, setHide] = useState(false);

  const active   = classSchedules.filter(c => c.isActive);
  const display  = hideInactive ? active : classSchedules;
  const totalSKS = active.reduce((a, c) => a + (c.credits || 0), 0);

  const byDay: Record<number, ClassSchedule[]> = {};
  for (let d = 1; d <= 7; d++) {
    byDay[d] = display.filter(c => c.dayOfWeek === d).sort((a, b) => a.startTime.localeCompare(b.startTime));
  }
  const activeDays = [1,2,3,4,5,6,7].filter(d => byDay[d].length > 0);

  const handleSave = (cls: Omit<ClassSchedule, "id" | "userId" | "isActive">) => {
    if (editing) removeClass(editing.id);
    addClass(cls);
    setShowForm(false);
    setEditing(null);
  };

  return (
    <div className="flex flex-col gap-5 max-w-5xl mx-auto">
      {/* TOP SUMMARY */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Mata Kuliah", value: active.length, icon: BookOpen, color: "#7C3AED", bg: "#EDE9FE" },
          { label: "Total SKS", value: totalSKS, icon: Zap, color: "#EC4899", bg: "#FCE7F3" },
          { label: "Hari Kuliah", value: activeDays.length, icon: Calendar, color: "#3B82F6", bg: "#DBEAFE" },
          { label: "Sesi/Minggu", value: active.length, icon: Clock, color: "#10B981", bg: "#D1FAE5" },
        ].map(s => (
          <div key={s.label} className="bg-white border border-[var(--color-border)] rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: s.bg }}>
              <s.icon size={18} style={{ color: s.color }} />
            </div>
            <div>
              <p className="text-xl font-black font-syne" style={{ color: s.color }}>{s.value}</p>
              <p className="text-[10px] text-[var(--color-text-secondary)] font-bold uppercase tracking-wide">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button onClick={() => setHide(v => !v)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all ${hideInactive ? "bg-[#EDE9FE] border-[#7C3AED] text-[#7C3AED]" : "bg-white border-[var(--color-border)] text-[var(--color-text-secondary)]"}`}>
            {hideInactive ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
            Aktif saja
          </button>
        </div>
        <button onClick={() => { setEditing(null); setShowForm(v => !v); }}
          className="bg-gradient-to-r from-[#7C3AED] to-[#EC4899] text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:scale-105 transition-all shadow-md">
          <Plus size={16} /> Tambah Kuliah
        </button>
      </div>

      {(showForm || editing) && (
        <AddClassForm
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditing(null); }}
          editing={editing || undefined}
        />
      )}

      {classSchedules.length === 0 && !showForm && (
        <div className="bg-white border-2 border-dashed border-[var(--color-border)] rounded-2xl p-12 text-center">
          <GraduationCap size={48} className="mx-auto mb-4 text-[var(--color-border)]" />
          <h3 className="font-bold text-[var(--color-text-primary)] mb-2">Belum ada jadwal kuliah</h3>
          <p className="text-sm text-[var(--color-text-secondary)] mb-4">Tambahkan jadwal kuliahmu!</p>
          <button onClick={() => setShowForm(true)} className="bg-gradient-to-r from-[#7C3AED] to-[#EC4899] text-white px-6 py-3 rounded-xl font-bold text-sm hover:scale-105 transition-all">
            + Tambah Pertama
          </button>
        </div>
      )}

      {/* Weekly bar */}
      {activeDays.length > 0 && (
        <div className="grid grid-cols-7 gap-2">
          {[1,2,3,4,5,6,7].map(d => {
            const cls = byDay[d];
            const isToday = new Date().getDay() === (d === 7 ? 0 : d);
            return (
              <div key={d} className={`rounded-xl p-2 text-center text-xs font-bold border ${isToday ? "border-[#7C3AED] bg-[#F3E8FF]" : "border-[var(--color-border)] bg-white"}`}>
                <p className={`text-[10px] uppercase tracking-wider mb-1 font-black ${isToday ? "text-[#7C3AED]" : "text-[var(--color-text-secondary)]"}`}>{DAY_SHORT[d]}</p>
                <p className={`text-lg font-black ${isToday ? "text-[#7C3AED]" : "text-[var(--color-text-primary)]"}`}>{cls.length}</p>
                <p className="text-[9px] text-[var(--color-text-secondary)]">kuliah</p>
              </div>
            );
          })}
        </div>
      )}

      {/* Table */}
      {activeDays.length > 0 && activeDays.map(d => (
        <div key={d} className="bg-white border border-[var(--color-border)] rounded-2xl overflow-hidden shadow-sm">
          <div className="px-5 py-3 bg-[var(--color-neutral)] border-b border-[var(--color-border)] flex items-center gap-2">
            <div className={`w-2 h-6 rounded-full ${new Date().getDay() === (d === 7 ? 0 : d) ? "bg-[#7C3AED]" : "bg-[var(--color-border)]"}`} />
            <h3 className={`font-black text-sm ${new Date().getDay() === (d === 7 ? 0 : d) ? "text-[#7C3AED]" : "text-[var(--color-text-primary)]"}`}>
              {DAY_NAMES[d]}
              {new Date().getDay() === (d === 7 ? 0 : d) && (
                <span className="ml-2 text-[10px] font-bold bg-[#7C3AED] text-white px-2 py-0.5 rounded-full">Hari ini</span>
              )}
            </h3>
            <span className="ml-auto text-xs text-[var(--color-text-secondary)] font-medium">{byDay[d].length} sesi</span>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)]">
                <th className="text-left px-5 py-2.5 text-[10px] font-black text-[var(--color-text-secondary)] uppercase tracking-wider w-8">#</th>
                <th className="text-left px-3 py-2.5 text-[10px] font-black text-[var(--color-text-secondary)] uppercase tracking-wider">Mata Kuliah</th>
                <th className="text-left px-3 py-2.5 text-[10px] font-black text-[var(--color-text-secondary)] uppercase tracking-wider w-36">
                  <div className="flex items-center gap-1"><Clock size={11} /> Jam</div>
                </th>
                <th className="text-left px-3 py-2.5 text-[10px] font-black text-[var(--color-text-secondary)] uppercase tracking-wider">Ruangan</th>
                <th className="text-left px-3 py-2.5 text-[10px] font-black text-[var(--color-text-secondary)] uppercase tracking-wider">Dosen</th>
                <th className="text-left px-3 py-2.5 text-[10px] font-black text-[var(--color-text-secondary)] uppercase tracking-wider w-16">SKS</th>
                <th className="px-3 py-2.5 w-20" />
              </tr>
            </thead>
            <tbody>
              {byDay[d].map((cls) => {
                const [sh, sm] = cls.startTime.split(":").map(Number);
                const [eh, em] = cls.endTime.split(":").map(Number);
                const dur = (eh * 60 + em) - (sh * 60 + sm);
                return (
                  <tr key={cls.id} className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-neutral)] transition-colors group">
                    <td className="px-5 py-3">
                      <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: cls.color }} />
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-black shrink-0 shadow-sm" style={{ backgroundColor: cls.color }}>
                          {cls.subjectName.substring(0,2).toUpperCase()}
                        </div>
                        <span className="font-bold text-[var(--color-text-primary)]">{cls.subjectName}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex flex-col">
                        <span className="font-mono font-bold text-[var(--color-text-primary)] text-xs">{cls.startTime} – {cls.endTime}</span>
                        <span className="text-[9px] text-[var(--color-text-secondary)] mt-0.5">{dur} menit</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-xs text-[var(--color-text-secondary)] font-medium">
                      {cls.room ? <span className="px-2 py-1 bg-[var(--color-neutral)] border border-[var(--color-border)] rounded-lg">{cls.room}</span> : "—"}
                    </td>
                    <td className="px-3 py-3 text-xs text-[var(--color-text-secondary)]">{cls.lecturer || "—"}</td>
                    <td className="px-3 py-3">
                      {cls.credits ? <span className="px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ backgroundColor: cls.color + "20", color: cls.color }}>{cls.credits} SKS</span> : "—"}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => { setEditing(cls); setShowForm(false); }}
                          className="w-7 h-7 rounded-lg bg-[var(--color-neutral)] text-[var(--color-text-secondary)] hover:text-[#7C3AED] flex items-center justify-center transition-all hover:scale-110">
                          <Edit3 size={12} />
                        </button>
                        <button onClick={() => removeClass(cls.id)}
                          className="w-7 h-7 rounded-lg bg-[var(--color-neutral)] text-[var(--color-text-secondary)] hover:text-[#EF4444] flex items-center justify-center transition-all hover:scale-110">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────── */
/*  Schedule Card — clearly shows intent type                   */
/* ──────────────────────────────────────────────────────────── */
function ScheduleCard({ sch, onComplete, onDelete }: {
  sch: any;
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const today = new Date();
  const intent = INTENT_LABELS[sch.type as IntentType] || INTENT_LABELS.UNKNOWN;
  const style  = INTENT_STYLE[sch.type] || INTENT_STYLE.UNKNOWN;
  const days   = sch.deadlineAt ? differenceInDays(new Date(sch.deadlineAt), today) : null;
  const u      = urg(sch.isCompleted ? null : days, sch.isCompleted);

  // Category groupinfo
  const grpInfo = INTENT_GROUPS.find(g => g.intents.includes(sch.type)) || INTENT_GROUPS[3];

  return (
    <div
      className={`relative glass-surface rounded-[2rem] overflow-hidden shadow-[0_8px_30px_rgba(31,38,135,0.07)] hover:shadow-[0_12px_40px_rgba(31,38,135,0.12)] transition-all hover:scale-[1.02] group border border-white/60 ${sch.isCompleted ? "opacity-60" : ""}`}
      style={{
        backgroundImage: `linear-gradient(135deg, ${grpInfo.color}15 0%, rgba(255,255,255,0.4) 100%)`
      }}
    >
      {/* Soft Top Glow instead of solid stripe */}
      <div className="absolute top-0 left-0 right-0 h-1 blur-sm" style={{ backgroundColor: grpInfo.color }} />
      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {/* Elegant thick icon box */}
            <div
              className={`w-14 h-14 rounded-[1.2rem] flex items-center justify-center shrink-0 shadow-[0_8px_16px_rgba(31,38,135,0.15),_inset_0_2px_4px_rgba(255,255,255,0.4)] border-2 border-white/50 group-hover:scale-110 group-hover:rotate-6 transition-transform`}
              style={{ backgroundColor: intent.color }}
            >
              {getElegantIcon(sch.type)}
            </div>
            <div className="flex-1 min-w-0 mt-0.5">
              <h3 className={`font-black text-lg leading-snug mb-2 drop-shadow-sm ${sch.isCompleted ? "line-through text-purple-900/50" : "text-purple-950"}`}>
                {sch.title}
              </h3>
              <div className="flex flex-wrap items-center gap-2">
                {/* INTENT BADGE — distinct shape per type */}
                <span className={`text-[10px] font-black px-3 py-1 bg-white/50 border border-white/40 shadow-sm rounded-full text-purple-900`}>
                  {style.label}
                </span>
                {/* CATEGORY badge */}
                <span className="text-[10px] font-black px-3 py-1 rounded-full border shadow-sm" style={{ borderColor: grpInfo.color + "60", color: grpInfo.color, backgroundColor: grpInfo.color + "20" }}>
                  {grpInfo.emoji} {grpInfo.group}
                </span>
                {sch.deadlineAt && (
                  <span className="text-[10px] text-purple-900 font-bold bg-white/40 border border-white/50 px-3 py-1 rounded-full">
                    📅 {format(new Date(sch.deadlineAt), "d MMM · HH:mm", { locale: id })}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-black px-4 py-2 rounded-xl whitespace-nowrap shadow-sm border border-white/50" style={{ backgroundColor: u.bg, color: u.color }}>{u.label}</span>
            <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
              {!sch.isCompleted && (
                <button onClick={() => onComplete(sch.id)}
                  className="w-10 h-10 rounded-xl bg-[#10B981] text-white flex items-center justify-center hover:scale-110 shadow-md transition-all">
                  <CheckCircle size={18} />
                </button>
              )}
              <button onClick={() => onDelete(sch.id)}
                className="w-10 h-10 rounded-xl bg-[#EF4444] text-white flex items-center justify-center hover:scale-110 shadow-md transition-all">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────── */
/*  Main SchedulesView                                          */
/* ──────────────────────────────────────────────────────────── */
export default function SchedulesView() {
  const { schedules, completeSchedule, deleteSchedule } = useAppStore();
  const [mainTab, setMainTab]   = useState<MainTab>("list");
  const [status, setStatus]     = useState<StatusFilter>("ALL");
  const [intentFilter, setIntentFilter] = useState<IntentType | null>(null);
  const [groupFilter, setGroupFilter]   = useState<string | null>(null);

  const today  = new Date();
  const active = schedules.filter(s => !s.isCompleted);
  const done   = schedules.filter(s => s.isCompleted);

  let display = status === "ACTIVE" ? active : status === "DONE" ? done : schedules;
  if (intentFilter) display = display.filter(s => s.type === intentFilter);
  else if (groupFilter) {
    const grp = INTENT_GROUPS.find(g => g.group === groupFilter);
    if (grp) display = display.filter(s => grp.intents.includes(s.type as IntentType));
  }

  const typeData = Object.entries(INTENT_LABELS)
    .filter(([k]) => k !== "QUERY")
    .map(([key, val]) => ({
      name: val.label, fill: val.color,
      total:   schedules.filter(s => s.type === key).length,
      selesai: schedules.filter(s => s.type === key && s.isCompleted).length,
    })).filter(d => d.total > 0);

  const pieData = [
    { name: "Selesai ✅", value: done.length,   fill: "#10B981" },
    { name: "Aktif 🔥",   value: active.length, fill: "#7C3AED" },
  ].filter(d => d.value > 0);

  const grpData = INTENT_GROUPS.map(g => ({
    name: g.emoji + " " + g.group,
    value: schedules.filter(s => g.intents.includes(s.type as IntentType)).length,
    fill: g.color,
  })).filter(d => d.value > 0);

  return (
    <div className="flex flex-col h-full bg-transparent overflow-hidden">

      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="bg-white/20 backdrop-blur-md border-b border-white/40 px-8 pt-6 pb-0 shrink-0 shadow-sm relative z-20">
        <div className="flex items-end justify-between mb-4">
          <div>
            <h1 className="text-3xl font-display font-black text-purple-950 drop-shadow-sm">Semua Jadwal</h1>
            <p className="text-sm font-bold text-purple-900 mt-1">{active.length} aktif · {done.length} selesai · {schedules.length} total</p>
          </div>
          {/* Category Summary badges */}
          <div className="flex gap-2">
            {INTENT_GROUPS.map(g => {
              const count = schedules.filter(s => g.intents.includes(s.type as IntentType) && !s.isCompleted).length;
              if (!count) return null;
              return (
                <div key={g.group} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold" style={{ borderColor: g.color + "40", color: g.color, backgroundColor: g.bgLight }}>
                  {g.emoji} {count}
                </div>
              );
            })}
          </div>
        </div>
        {/* Main tabs */}
        <div className="flex gap-0">
          {([
            { id: "list",  icon: List,    label: "Daftar Jadwal" },
            { id: "class", icon: GraduationCap, label: "Jadwal Kuliah" },
            { id: "chart", icon: BarChart2, label: "Diagram" },
          ] as const).map(t => (
            <button key={t.id} onClick={() => setMainTab(t.id)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-colors ${mainTab === t.id ? "border-[#7C3AED] text-[#7C3AED]" : "border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"}`}>
              <t.icon size={15} />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Filter bar (List tab only) ─────────────────────────────── */}
      {mainTab === "list" && (
        <div className="bg-white/20 backdrop-blur-sm border-b border-white/40 px-8 shrink-0 relative z-10 shadow-sm pt-2">
          {/* Status tabs */}
          <div className="flex gap-0 border-b border-[var(--color-border)]">
            {(["ALL","ACTIVE","DONE"] as const).map(t => (
              <button key={t} onClick={() => setStatus(t)}
                className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors ${status === t ? "border-[#7C3AED] text-[#7C3AED]" : "border-transparent text-[var(--color-text-secondary)]"}`}>
                {t === "ALL" ? `Semua (${schedules.length})` : t === "ACTIVE" ? `Aktif (${active.length})` : `Selesai (${done.length})`}
              </button>
            ))}
          </div>
          {/* Category filter chips */}
          <div className="flex items-center gap-2 flex-wrap py-3">
            <Filter size={13} className="text-[var(--color-text-secondary)] shrink-0" />
            {(intentFilter || groupFilter) && (
              <button onClick={() => { setIntentFilter(null); setGroupFilter(null); }}
                className="flex items-center gap-1 px-3 py-1.5 bg-red-50 border border-red-200 text-red-500 rounded-full text-xs font-bold hover:bg-red-100 transition-all">
                <X size={10} /> Reset
              </button>
            )}
            {INTENT_GROUPS.map(grp => {
              const count = schedules.filter(s => grp.intents.includes(s.type as IntentType)).length;
              if (!count) return null;
              const isA = groupFilter === grp.group && !intentFilter;
              return (
                <button key={grp.group}
                  onClick={() => { setGroupFilter(isA ? null : grp.group); setIntentFilter(null); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all"
                  style={isA
                    ? { backgroundColor: grp.color, color: "white", borderColor: grp.color }
                    : { backgroundColor: "white", color: grp.color, borderColor: grp.color + "60" }
                  }>
                  {grp.emoji} {grp.group}
                  <span className="px-1.5 rounded-full text-[9px] font-black" style={isA ? { backgroundColor: "rgba(255,255,255,0.25)" } : { backgroundColor: grp.bgLight }}>{count}</span>
                </button>
              );
            })}
          </div>
          {/* Sub-intent chips for selected group */}
          {groupFilter && !intentFilter && (
            <div className="flex gap-2 flex-wrap pb-3 pl-6">
              {INTENT_GROUPS.find(g => g.group === groupFilter)?.intents.map(ik => {
                const cfg = INTENT_LABELS[ik];
                const st  = INTENT_STYLE[ik] || INTENT_STYLE.UNKNOWN;
                const count = schedules.filter(s => s.type === ik).length;
                if (!count) return null;
                return (
                  <button key={ik} onClick={() => setIntentFilter(ik)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-white border border-[var(--color-border)] hover:scale-105 transition-all shadow-sm">
                    {cfg.emoji} {cfg.label}
                    <span className="bg-[var(--color-neutral)] px-1.5 rounded-full text-[9px] font-black text-[var(--color-text-secondary)]">{count}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Body ───────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-8 py-6">

        {mainTab === "class" && <ClassTable />}

        {mainTab === "chart" && (
          <div className="flex flex-col gap-6 max-w-5xl mx-auto">
            <div className="grid grid-cols-2 gap-6">
              <div className="glass-surface border border-white/60 rounded-3xl p-6 shadow-lg">
                <h3 className="text-xs font-black text-purple-900 uppercase tracking-wider mb-4">Status Overview</h3>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart><Pie data={pieData} cx="50%" cy="50%" innerRadius={48} outerRadius={72} paddingAngle={4} dataKey="value">
                    {pieData.map((e, i) => <Cell key={i} fill={e.fill} stroke="none" />)}
                  </Pie><Tooltip content={<PTip />} /><Legend iconType="circle" iconSize={8} wrapperStyle={{ fontWeight: 'bold' }} /></PieChart>
                </ResponsiveContainer>
              </div>
              <div className="glass-surface border border-white/60 rounded-3xl p-6 shadow-lg">
                <h3 className="text-xs font-black text-purple-900 uppercase tracking-wider mb-4">Per Kategori</h3>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart><Pie data={grpData} cx="50%" cy="50%" innerRadius={48} outerRadius={72} paddingAngle={4} dataKey="value">
                    {grpData.map((e, i) => <Cell key={i} fill={e.fill} stroke="none" />)}
                  </Pie><Tooltip content={<PTip />} /><Legend iconType="circle" iconSize={8} wrapperStyle={{ fontWeight: 'bold' }} /></PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            {typeData.length > 0 && (
              <div className="glass-surface border border-white/60 rounded-3xl p-6 shadow-lg">
                <h3 className="text-xs font-black text-purple-900 uppercase tracking-wider mb-4">Rincian per Tipe</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={typeData} margin={{ left: -24 }} barCategoryGap="35%">
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.3)" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#4C1D95", fontWeight: 800 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: "#4C1D95", fontWeight: 800 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CTip />} cursor={{ fill: "rgba(255,255,255,0.2)", radius: 6 }} />
                    <Bar dataKey="total" name="Total" fill="rgba(255,255,255,0.6)" radius={[8,8,0,0]} />
                    <Bar dataKey="selesai" name="Selesai" fill="#7C3AED" radius={[8,8,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}

        {mainTab === "list" && (
          <div className="flex flex-col gap-3 max-w-4xl mx-auto">
            {display.length === 0 && (
              <div className="bg-white border-2 border-dashed border-[var(--color-border)] rounded-2xl p-12 text-center text-[var(--color-text-secondary)]">
                <p className="text-4xl mb-3">📭</p>
                <p className="font-bold">Tidak ada jadwal</p>
                <p className="text-sm mt-1">Coba ubah filter atau tambah jadwal baru via Chat.</p>
              </div>
            )}
            {display.map(sch => (
              <ScheduleCard key={sch.id} sch={sch} onComplete={completeSchedule} onDelete={deleteSchedule} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
