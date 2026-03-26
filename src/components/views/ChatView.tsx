"use client";
import { useState, useRef, useEffect } from "react";
import { useAppStore } from "@/lib/store";
import { Send, Sparkles, CheckCircle, Hash, ArrowRight } from "lucide-react";
import { format, addDays } from "date-fns";
import { id } from "date-fns/locale";
import ReactMarkdown from "react-markdown";
import { classifyIntent, generateDailyGreeting } from "@/lib/ai";
import { PendingStudyPlan, INTENT_LABELS } from "@/lib/types";

function extractStudyTopics(text: string): string[] | null {
  const lower = text.toLowerCase();
  const studyKw = ["belajar", "mau belajar", "pelajari", "study", "bahas", "kuasai", "mempelajari"];
  if (!studyKw.some(k => lower.includes(k))) return null;
  const after = text.replace(/^.*?(belajar|pelajari|study|bahas|kuasai|mempelajari)\s*/i, "");
  const parts = after
    .split(/[,，&]| dan | and | dengan | serta | sama | \+ /i)
    .map(p => p.replace(/(nanti|besok|tanggal|jam|mau|aku|saya|hari|ini|itu|yuk|yg|yang|dll|dkk).*$/gi, "").trim())
    .filter(p => p.length > 1 && p.length < 60);
  return parts.length >= 2 ? parts : null;
}

function StudyPlanCard({ plan, onCommit }: { plan: PendingStudyPlan; onCommit: () => void }) {
  const grads = ["grad-violet-pink", "grad-orange-yellow", "grad-blue-cyan", "grad-green-teal", "grad-red-rose"];
  if (plan.step !== "done" || !plan.assignedDates) return null;
  return (
    <div className="bg-white border border-[var(--color-border)] rounded-2xl overflow-hidden shadow-lg my-3 max-w-md">
      <div className="grad-violet-pink px-5 py-3 text-white flex items-center gap-2 text-sm font-bold">
        <Sparkles size={16} /> Rencana Belajar Tersusun! ✨
      </div>
      <div className="p-4 flex flex-col gap-2.5">
        {plan.assignedDates.map((item, i) => (
          <div key={i} className={`${grads[i % grads.length]} text-white rounded-xl px-4 py-3 flex items-center justify-between text-sm font-bold shadow-sm`}>
            <span className="flex items-center gap-2"><Hash size={13} /> {item.topic}</span>
            <span className="bg-white/25 px-3 py-1 rounded-lg font-mono text-xs">
              {format(new Date(item.date + "T00:00"), "EEE, d MMM", { locale: id })} · 09:00
            </span>
          </div>
        ))}
        <button onClick={onCommit}
          className="mt-1 w-full py-3 grad-violet-pink glow-violet text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:scale-[1.02] transition-all">
          <CheckCircle size={16} /> Simpan ke Study Room & Jadwal
        </button>
      </div>
    </div>
  );
}

function QuickReplies({ options, onSelect }: { options: { label: string; value: string }[]; onSelect: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2 mt-2 ml-12">
      {options.map(opt => (
        <button key={opt.value} onClick={() => onSelect(opt.value)}
          className="px-4 py-2 bg-white border-2 border-[#7C3AED] text-[#7C3AED] rounded-full text-sm font-bold hover:bg-[#7C3AED] hover:text-white transition-all active:scale-95 shadow-sm">
          {opt.label}
        </button>
      ))}
    </div>
  );
}

// ── Centered animated greeting ──────────────────────────────────
function WelcomeBanner({ name, onDismiss }: { name: string; onDismiss: () => void }) {
  const hour = new Date().getHours();
  const greet = hour < 10 ? "Selamat Pagi" : hour < 15 ? "Selamat Siang" : hour < 18 ? "Selamat Sore" : "Selamat Malam";
  const emoji = hour < 10 ? "🌅" : hour < 15 ? "☀️" : hour < 18 ? "🌤️" : "🌙";
  const day = format(new Date(), "EEEE, d MMMM yyyy", { locale: id });

  return (
    <div className="flex flex-col items-center justify-center flex-1 text-center px-8 py-12 animate-in fade-in duration-700">
      {/* Big animated icon */}
      <div className="w-20 h-20 grad-violet-pink glow-violet rounded-3xl flex items-center justify-center mb-6 shadow-[0_16px_40px_rgba(124,58,237,0.35)] animate-in zoom-in duration-500">
        <Sparkles size={36} className="text-white" />
      </div>

      <p className="text-sm font-bold text-[var(--color-text-secondary)] uppercase tracking-widest mb-2">{day}</p>

      <h1 className="text-3xl font-display font-black leading-tight mb-1">
        <span className="text-[var(--color-text-primary)]">{greet},</span>
      </h1>
      <h2 className="text-4xl font-display font-black bg-gradient-to-r from-[#7C3AED] via-[#EC4899] to-[#F97316] bg-clip-text text-transparent mb-4 leading-tight">
        {name}! {emoji}
      </h2>

      <p className="text-[var(--color-text-secondary)] text-sm max-w-xs leading-relaxed mb-8">
        Aku siap bantu atur jadwal, rencana belajar, dan reminder harian kamu. <strong className="text-[#7C3AED]">Mau mulai dari mana?</strong>
      </p>

      {/* Starter suggestions */}
      <div className="flex flex-col gap-2 w-full max-w-sm">
        {[
          { text: "📋  Tambah jadwal atau deadline", prompt: "aku ada tugas" },
          { text: "📚  Buat rencana belajar AI", prompt: "aku mau belajar RAG, MCP, dan AI Agent" },
          { text: "💪  Catat sesi olahraga", prompt: "besok pagi aku mau lari jam 6 pagi" },
        ].map(s => (
          <button key={s.prompt} onClick={onDismiss}
            className="group flex items-center justify-between px-4 py-3 bg-white border border-[var(--color-border)] rounded-xl hover:border-[#7C3AED] hover:bg-[#F3E8FF] transition-all text-sm font-medium text-[var(--color-text-primary)] shadow-sm">
            <span>{s.text}</span>
            <ArrowRight size={14} className="text-[var(--color-text-secondary)] group-hover:text-[#7C3AED] transition-colors" />
          </button>
        ))}
      </div>
    </div>
  );
}

export default function ChatView() {
  const {
    messages, addMessage, isAiTyping, setIsAiTyping, schedules,
    classSchedules, addSchedule, addXP, user, currentView,
    pendingStudyPlan, setPendingStudyPlan, commitStudyPlan, setView
  } = useAppStore();
  const [input, setInput] = useState("");
  const [waitingForDates, setWaitingForDates] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, isAiTyping]);
  useEffect(() => {
    if (messages.length > 0) setShowWelcome(false);
  }, [messages.length]);

  const handleQuickReply = async (value: string) => {
    const plan = useAppStore.getState().pendingStudyPlan;
    if (!plan) return;
    addMessage({ role: "user", content: value });
    if (plan.step === "ask_mode") {
      const isTogether = value.toLowerCase().includes("bersamaan");
      const updated: PendingStudyPlan = { ...plan, step: "ask_dates", mode: isTogether ? "together" : "separate" };
      setPendingStudyPlan(updated);
      addMessage({ role: "assistant", content: isTogether
        ? `Oke! Semua topik dipelajari **bersamaan** 📚\n\nKapan mau mulai? Ketik tanggalnya atau tulis **"random"** biar aku tentukan.`
        : `Sip! Setiap topik dijadwalkan **terpisah** 🗂️\n\nMau aku atur tanggalnya **random** (mulai besok)? Atau kamu mau input sendiri?\n\n${plan.topics.map((t, i) => `${i + 1}. **${t}**`).join("\n")}`
      });
    } else if (plan.step === "ask_dates") {
      const dates = plan.topics.map((topic, i) => ({ topic, date: format(addDays(new Date(), i + 1), "yyyy-MM-dd") }));
      setPendingStudyPlan({ ...plan, assignedDates: dates, dateMode: "random", step: "done" });
      addMessage({ role: "assistant", content: `Sudah aku susun jadwal belajarnya! 🎯 Konfirmasi di bawah ya:`, relatedScheduleId: "pending" });
    }
  };

  const handleCommitPlan = () => {
    const plan = useAppStore.getState().pendingStudyPlan;
    if (!plan) return;
    const saved = commitStudyPlan(plan);
    addMessage({ role: "assistant", content: `✅ **${saved.length} jadwal belajar** sudah disimpan!\n\nYuk ke **Study Room** untuk lihat rencana lengkap dan tambahkan sumber belajar (PDF, YouTube, dll)! 🚀` });
    setTimeout(() => setView("study"), 1500);
  };

  const handleSend = async () => {
    if (!input.trim() || isAiTyping) return;
    const userMsg = input.trim();
    setInput("");
    setShowWelcome(false);
    addMessage({ role: "user", content: userMsg });

    const plan = useAppStore.getState().pendingStudyPlan;
    if (waitingForDates && plan) {
      setWaitingForDates(false);
      const dates = plan.topics.map((t, i) => ({ topic: t, date: format(addDays(new Date(), i + 1), "yyyy-MM-dd") }));
      setPendingStudyPlan({ ...plan, assignedDates: dates, step: "done" });
      addMessage({ role: "assistant", content: "Oke catat! Berikut rencana belajarmu:" });
      return;
    }

    setIsAiTyping(true);
    try {
      const topics = extractStudyTopics(userMsg);
      if (topics && topics.length >= 2) {
        setPendingStudyPlan({ topics, step: "ask_mode" });
        addMessage({ role: "assistant", content: `Keren! Kamu mau belajar **${topics.length} topik** 🧠\n\n${topics.map((t, i) => `${i+1}. **${t}**`).join("\n")}\n\nMau dipelajari **bersamaan di satu waktu** atau masing-masing di **hari berbeda**?` });
        setIsAiTyping(false); return;
      }
      const result = await classifyIntent(userMsg, schedules, classSchedules);
      if (result.intent === "UNKNOWN" || !result.schedule) {
        addMessage({ role: "assistant", content: `Hmm, belum nangkep 🤔 Coba ceritakan lebih detail:\n\n- *"Besok ada kuliah jam 8"*\n- *"Kumpul tugas SI Jumat malam"*\n- *"Besok pagi lari jam 6"*\n- *"Aku mau belajar RAG, MCP, dan AI Agent"*` });
      } else {
        const newSch = addSchedule({ title: result.schedule.title, type: result.intent, createdVia: "chat", deadlineAt: result.schedule.deadline_date ? `${result.schedule.deadline_date}T${result.schedule.deadline_time || "23:59"}` : null });
        addXP(10, "Tambah jadwal");
        const intent = INTENT_LABELS[result.intent];
        const dateStr = result.schedule.deadline_date ? format(new Date(result.schedule.deadline_date), "EEEE, d MMMM yyyy", { locale: id }) : "Belum ada tenggat";
        addMessage({ role: "assistant", content: `${intent.emoji} **${result.schedule.title}** sudah dicatat!\n\n📅 ${dateStr}\n🏷️ *${intent.label}*\n\n**+10 XP** 🎉`, relatedScheduleId: newSch.id, xpEarned: 10 });
      }
    } catch { addMessage({ role: "assistant", content: "Koneksi ke LLaMA lagi bermasalah 😵 Coba lagi!" }); }
    finally { setIsAiTyping(false); }
  };

  const lastMsg = messages[messages.length - 1];
  const showQR = pendingStudyPlan && lastMsg?.role === "assistant";
  const qrOptions = pendingStudyPlan?.step === "ask_mode"
    ? [{ label: "📦 Bersamaan", value: "bersamaan" }, { label: "📅 Terpisah per topik", value: "terpisah" }]
    : pendingStudyPlan?.step === "ask_dates" && pendingStudyPlan.mode === "separate"
    ? [{ label: "🎲 Random (otomatis)", value: "random" }, { label: "✏️ Input sendiri", value: "manual" }]
    : [];

  return (
    <div className="flex flex-col h-full bg-transparent overflow-hidden">

      {/* Urgency Banner */}
      {schedules.some(s => !s.isCompleted && s.priority === "CRITICAL") && (
        <div className="grad-red-rose text-white px-6 py-2 text-xs font-bold flex items-center gap-2 shrink-0">
          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />Ada jadwal KRITIS!
        </div>
      )}

      {/* Messages / Welcome */}
      <div className="flex-1 overflow-y-auto flex flex-col">
        {showWelcome && messages.length === 0 ? (
          <WelcomeBanner name={user.name} onDismiss={() => setShowWelcome(false)} />
        ) : (
          <div className="px-6 py-6 flex flex-col gap-4">
            {messages.map(msg => (
              <div key={msg.id}>
                <div className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2`}>
                  {msg.role === "assistant" && (
                    <div className="w-10 h-10 rounded-2xl grad-violet-pink flex items-center justify-center text-white mr-3 shrink-0 shadow-[0_8px_16px_rgba(124,58,237,0.3)] border border-white/50">
                      <Sparkles size={18} />
                    </div>
                  )}
                  <div className={`max-w-[78%] rounded-3xl px-5 py-4 shadow-sm ${
                    msg.role === "user"
                      ? "bg-gradient-to-br from-[#7C3AED] to-[#EC4899] text-white rounded-tr-sm shadow-[0_8px_24px_rgba(124,58,237,0.4)] border border-white/20"
                      : "glass-surface rounded-tl-sm text-purple-950 border border-white/60 shadow-[0_8px_32px_rgba(31,38,135,0.05)]"
                  }`}>
                    <div className={`prose prose-sm max-w-none leading-relaxed prose-p:my-0.5 font-medium ${msg.role === "user" ? "prose-invert" : ""}`}>
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                    {msg.xpEarned && (
                      <span className="mt-2 inline-block bg-[#10B981] text-white shadow-[0_0_12px_rgba(16,185,129,0.8)] text-[10px] font-black px-2.5 py-1 rounded-full border border-white/40">+{msg.xpEarned} XP ✨</span>
                    )}
                  </div>
                </div>
                {/* Study Plan Card */}
                {msg.role === "assistant" && pendingStudyPlan?.step === "done" && msg === messages[messages.length - 1] && (
                  <div className="ml-12 mt-2">
                    <StudyPlanCard plan={pendingStudyPlan} onCommit={handleCommitPlan} />
                  </div>
                )}
              </div>
            ))}

            {showQR && qrOptions.length > 0 && <QuickReplies options={qrOptions} onSelect={handleQuickReply} />}

            {isAiTyping && (
              <div className="flex items-end animate-in fade-in">
                <div className="w-10 h-10 rounded-2xl grad-violet-pink flex items-center justify-center text-white mr-3 shrink-0 shadow-[0_8px_16px_rgba(124,58,237,0.3)] border border-white/50">
                  <Sparkles size={18} />
                </div>
                <div className="glass-surface rounded-3xl rounded-tl-sm p-5 flex gap-1.5 shadow-sm border border-white/60">
                  <div className="w-2 h-2 bg-[#7C3AED] rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <div className="w-2 h-2 bg-[#7C3AED] rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <div className="w-2 h-2 bg-[#7C3AED] rounded-full animate-bounce" />
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="bg-white/20 backdrop-blur-xl px-6 py-5 border-t border-white/40 shrink-0 shadow-[0_-10px_40px_rgba(31,38,135,0.05)] rounded-br-[3rem] -mb-1 -mr-1">
        <div className="flex items-center gap-3 bg-white/40 shadow-inner px-2 py-1.5 rounded-full border border-white/60 focus-within:border-white focus-within:ring-4 focus-within:ring-white/30 transition-all">
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder={showWelcome ? "Ketik pesan atau pilih saran di atas..." : "Ketik tugas atau tanya ke MILKUN.AI..."}
            className="flex-1 bg-transparent px-5 py-3 text-sm text-purple-950 placeholder:text-purple-800 focus:outline-none font-bold placeholder:font-bold" />
          <button onClick={handleSend} disabled={!input.trim() || isAiTyping}
            className="w-12 h-12 rounded-full grad-violet-pink shadow-[0_4px_15px_rgba(124,58,237,0.5)] text-white flex items-center justify-center shrink-0 disabled:opacity-40 disabled:shadow-none transition-all hover:scale-110 active:scale-95 border border-white/40">
            <Send size={20} className="ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
}
