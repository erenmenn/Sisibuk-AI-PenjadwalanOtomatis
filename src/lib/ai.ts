// AI Service — jadwal.ai
// Uses Groq API (llama-3.3-70b-versatile) for intent classification + chat
// Falls back to rule-based parsing if API key not configured

import { IntentResult, IntentType, Schedule, ClassSchedule } from "./types";
import { checkConflicts, buildReversePlan, generateReminders, getDaysUntil } from "./utils";
import { useAppStore } from "./store";

// ──────────────────────────────────────────────────────────────
// System prompt for Groq
// ──────────────────────────────────────────────────────────────
function buildSystemPrompt(schedules: Schedule[]): string {
  const today = new Date().toISOString().split("T")[0];
  const activeSch = schedules.filter(s => !s.isCompleted).map(s => `- ${s.title} (${s.deadlineAt || "no date"})`).join("\n");
  
  return `Kamu adalah AI assistant produktivitas bernama "SISIBUK.AI".
Tugasmu: Pahami pesan user lalu balas dalam format JSON murni.

JSON SCHEMA:
{
  "intent": <salah satu: DEADLINE_SUBMIT, DEADLINE_REGISTER, EXAM, STUDY_PLAN, STUDY_SESSION, MEETING, CLASS, PERSONAL, RUNNING, SPORT, WORKOUT, QUERY, UNKNOWN>,
  "action": <salah satu: CREATE_SCHEDULE, CREATE_STUDY_PLAN, QUERY_SCHEDULE, NONE>,
  "confidence": <0.0 - 1.0>,
  "schedule": {
    "title": <judul singkat>,
    "deadline_date": <"YYYY-MM-DD" ATAU null jika tidak tahu. JANGAN TULIS KATA-KATA>,
    "deadline_time": <"HH:MM" ATAU "23:59">,
    "priority": <HIGH | MEDIUM | LOW>
  } ATAU null jika action adalah QUERY_SCHEDULE atau NONE,
  "reply": <balasan ramah ke user (bisa memberi tips jadwal, rangkuman, dll)>,
  "needs_confirmation": <bool>
}

ATURAN PENTING KATEGORI (INTENT):
- "lari", "maraton", "jogging" -> RUNNING
- "gym", "workout", "fitness" -> WORKOUT
- "futsal", "basket", "tanding", "olahraga" -> SPORT
- Jika user sekadar minta tips (misal "kapan hari baik melukis", "tips produktivitas"), atau tanya "jadwal minggu ini" -> intent: QUERY, action: NONE atau QUERY_SCHEDULE, schedule: null. Jawab dengan cerdas di field "reply".

WAKTU & TANGGAL SAAT INI: ${today}
- "besok" = +1 hari. "lusa" = +2 hari. "minggu depan" = +7 hari.
- JANGAN PERNAH mengisi deadline_date dengan string seperti "minggu depan". HARUS dan WAJIB format YYYY-MM-DD.
- Jika tanggal sama sekali tidak disebut, biarkan "deadline_date": null.

JADWAL AKTIF USER SAAT INI PADA DATABASE (Bantu jawab jika QUERY):
${activeSch || "Tidak ada jadwal aktif."}

PENTING: JANGAN KEMBALIKAN MARKDOWN ATAU TEKS LAIN, HANYA JSON MURNI!`;
}

// ──────────────────────────────────────────────────────────────
// Rule-based fallback parser
// ──────────────────────────────────────────────────────────────
function ruleBased(
  message: string,
  schedules: Schedule[],
  classSchedules: ClassSchedule[]
): IntentResult {
  const lower = message.toLowerCase();
  const today = new Date();

  // Query intent
  if (
    lower.includes("ada apa") ||
    lower.includes("minggu ini") ||
    lower.includes("hari ini") ||
    lower.includes("jadwal") && (lower.includes("lihat") || lower.includes("tampil") || lower.includes("cek"))
  ) {
    const active = schedules.filter((s) => !s.isCompleted).length;
    return {
      intent: "QUERY",
      action: "QUERY_SCHEDULE",
      confidence: 0.85,
      schedule: null,
      reply: active > 0
        ? `Kamu punya ${active} jadwal aktif sekarang. Cek tab "Semua Jadwal" untuk detail lengkapnya! 📋`
        : "Belum ada jadwal aktif nih! Yuk tambah jadwal pertamamu. Ketik deadline atau jadwal belajarmu sekarang 😊",
      needs_confirmation: false,
    };
  }

  // Extract date
  let deadline_date: string | null = null;
  const datePatterns = [
    // "2 april 2026" | "2 april" 
    /(\d{1,2})\s+(januari|februari|maret|april|mei|juni|juli|agustus|september|oktober|november|desember)(?:\s+(\d{4}))?/i,
  ];
  const months: Record<string, number> = {
    januari: 1, februari: 2, maret: 3, april: 4, mei: 5, juni: 6,
    juli: 7, agustus: 8, september: 9, oktober: 10, november: 11, desember: 12,
  };

  for (const pattern of datePatterns) {
    const match = lower.match(pattern);
    if (match) {
      const day = parseInt(match[1]);
      const month = months[match[2].toLowerCase()];
      const year = match[3] ? parseInt(match[3]) : today.getFullYear();
      const d = new Date(year, month - 1, day);
      deadline_date = d.toISOString().split("T")[0];
      break;
    }
  }

  // Relative dates (if not already found by datePatterns)
  if (!deadline_date) {
    if (lower.includes("besok")) {
      const d = new Date(today);
      d.setDate(d.getDate() + 1);
      deadline_date = d.toISOString().split("T")[0];
    } else if (lower.match(/tanggal\s+(\d+)/)) { // New regex for "tanggal X"
      const match = lower.match(/tanggal\s+(\d+)/);
      if (match) {
          const d = new Date();
          d.setDate(parseInt(match[1]));
          if (d < new Date()) d.setMonth(d.getMonth() + 1); // Assume next month if date is in the past
          deadline_date = d.toISOString().split("T")[0];
      }
    } else if (lower.includes("minggu depan")) {
      const d = new Date(today);
      d.setDate(d.getDate() + 7);
      deadline_date = d.toISOString().split("T")[0];
    } else if (lower.includes("lusa")) {
      const d = new Date(today);
      d.setDate(d.getDate() + 2);
      deadline_date = d.toISOString().split("T")[0];
    }
  }

  // Extract title
  let title = "Jadwal Baru";
  // Extracting action titles
  const actionWords = ["kumpul", "ada", "bikin", "ngerjain", "submit", "ikut", "pendaftaran", "tes", "ujian", "uts", "uas"];
  const words = message.split(" "); // Use original message for title extraction
  const actionIdx = words.findIndex(w => actionWords.some(a => w.toLowerCase().includes(a)));
  if (actionIdx !== -1 && actionIdx < words.length - 1) {
     // Take up to 5 words after the action word
     const extractedTitle = words.slice(actionIdx, actionIdx + 5).join(" ").replace(/(besok|nanti|tanggal|\d+|minggu|depan)/g, "").trim();
     if (extractedTitle) title = extractedTitle;
  }

  let intent: IntentType = "UNKNOWN";
  let priority: "HIGH" | "MEDIUM" | "LOW" = "MEDIUM";

  // Determine intent
  if (lower.includes("submit") || lower.includes("kumpul") || lower.includes("serahkan")) {
    intent = "DEADLINE_SUBMIT";
    const afterSubmit = message.match(/submit\s+(.+?)(?:\s+\d|\s+pada|\s+tanggal|$)/i);
    title = afterSubmit ? `Submit ${afterSubmit[1]}` : "Submit Dokumen";
  } else if (lower.includes("daftar") || lower.includes("pendaftaran") || lower.includes("registrasi")) {
    intent = "DEADLINE_REGISTER";
    title = "Pendaftaran";
  } else if (lower.includes("uts") || lower.includes("uas") || lower.includes("ujian") || lower.includes("exam") || lower.includes("test")) {
    intent = "EXAM";
    title = "Ujian";
  } else if (lower.includes("belajar") || lower.includes("pelajari") || lower.includes("materi") || lower.includes("topik")) {
    intent = "STUDY_PLAN";
    title = "Belajar";
  } else if (lower.includes("presentasi") || lower.includes("seminar") || lower.includes("sidang")) {
    intent = "MEETING";
    title = "Presentasi";
  } else if (lower.includes("kuliah") || lower.includes("kelas")) {
    intent = "CLASS";
    title = "Kuliah";
  } else if (lower.includes("lomba") || lower.includes("kompetisi") || lower.includes("hackathon")) {
    intent = "DEADLINE_SUBMIT";
    title = "Lomba";
  } else if (deadline_date) {
    intent = "DEADLINE_SUBMIT";
    title = "Jadwal";
  }

  // Priority
  if (deadline_date) {
    const days = getDaysUntil(deadline_date) ?? 99;
    priority = days <= 7 ? "HIGH" : days <= 14 ? "MEDIUM" : "LOW";
  }

  // Topics for STUDY_PLAN
  const topics: string[] = [];
  if (intent === "STUDY_PLAN") {
    const lines = message.split("\n");
    lines.forEach((line) => {
      const match = line.match(/^\d+[\.\)]\s*(.+)/);
      if (match) topics.push(match[1].trim());
    });
  }

  // Conflict check
  const conflicts = deadline_date ? checkConflicts(deadline_date, schedules) : [];

  // Build reply
  let reply = "";
  if (intent === "UNKNOWN" || !deadline_date) {
    reply = "Hmm, aku belum nangkep maksudnya 🤔 Bisa cerita lebih detail? Misalnya: \"submit proposal 15 april\" atau \"UTS algoritma minggu depan\"";
    return {
      intent: "UNKNOWN",
      action: "NONE",
      confidence: 0.3,
      schedule: null,
      reply,
      needs_confirmation: true,
    };
  }

  const reminders = generateReminders(intent, deadline_date);
  const reminderText = reminders
    .map((r) => `• ${new Date(r.date).toLocaleDateString("id-ID", { day: "numeric", month: "short" })} — ${r.label}`)
    .join("\n");

  reply = `Siap! Aku sudah catat:\n📋 **${title}** — ${new Date(deadline_date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}\n\nReminder otomatis:\n${reminderText}`;

  if (conflicts.length > 0) {
    reply += `\n\n⚠️ Heads up! Kamu sudah punya **${conflicts[0].title}** di sekitar tanggal yang sama. Mau aku bantu atur prioritasnya?`;
  } else if (intent === "DEADLINE_SUBMIT") {
    reply += `\n\nSudah mulai ngerjain? Kalau belum, aku bisa bantu buatkan jadwal pengerjaannya dari sekarang 💪`;
  }

  return {
    intent,
    action: intent === "STUDY_PLAN" ? "CREATE_STUDY_PLAN" : "CREATE_SCHEDULE",
    confidence: 0.8,
    schedule: {
      title,
      deadline_date,
      deadline_time: "23:59",
      priority,
      topics,
      duration_minutes: null,
    },
    reply,
    needs_confirmation: topics.length > 0 && !deadline_date,
  };
}

// ──────────────────────────────────────────────────────────────
// Main classify function
// ──────────────────────────────────────────────────────────────
export async function classifyIntent(
  userMessage: string,
  schedules: Schedule[],
  classSchedules: ClassSchedule[],
  conversationHistory: Array<{ role: "user" | "assistant"; content: string }> = []
): Promise<IntentResult> {
  // Try Groq API if key is available
  const apiKey = process.env.NEXT_PUBLIC_GROQ_API_KEY;

  if (apiKey && apiKey !== "YOUR_GROQ_API_KEY") {
    try {
      const messages = [
        ...conversationHistory.slice(-6),
        { role: "user" as const, content: userMessage },
      ];

      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: buildSystemPrompt(schedules) },
            ...messages,
          ],
          temperature: 0.1,
          max_tokens: 800,
          response_format: { type: "json_object" },
        }),
      });

      if (response.ok) {
        useAppStore.getState().setLlmStatus("online");
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content ?? "{}";
        const parsed = JSON.parse(content) as IntentResult;
        return parsed;
      } else if (response.status === 429) {
        useAppStore.getState().setLlmStatus("rate_limited");
      } else {
        useAppStore.getState().setLlmStatus("offline");
      }
    } catch (err) {
      console.warn("Groq API failed, falling back to rule-based:", err);
      useAppStore.getState().setLlmStatus("offline");
    }
  } else {
      useAppStore.getState().setLlmStatus("offline");
  }

  // Fallback to rule-based parser
  return ruleBased(userMessage, schedules, classSchedules);
}

// ──────────────────────────────────────────────────────────────
// Generate daily greeting from AI
// ──────────────────────────────────────────────────────────────
export function generateDailyGreeting(
  userName: string,
  schedules: Schedule[],
  classSchedules: ClassSchedule[]
): string {
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Selamat pagi" : hour < 15 ? "Selamat siang" : hour < 18 ? "Selamat sore" : "Selamat malam";

  const today = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const todayDayOfWeek = new Date().getDay() === 0 ? 7 : new Date().getDay();
  const todayClasses = classSchedules.filter(
    (c) => c.dayOfWeek === todayDayOfWeek && c.isActive
  );

  const urgentSchedules = schedules
    .filter((s) => !s.isCompleted && s.deadlineAt)
    .sort((a, b) => new Date(a.deadlineAt!).getTime() - new Date(b.deadlineAt!).getTime())
    .slice(0, 3);

  let message = `${greeting}, **${userName}**! ☀️\n_${today}_\n\n`;

  if (urgentSchedules.length > 0 || todayClasses.length > 0) {
    message += "Ini rangkuman hari ini:\n";

    todayClasses.forEach((cls) => {
      message += `\n🏫 **${cls.subjectName}** ${cls.startTime}–${cls.endTime} (tidak bisa diganggu)`;
    });

    urgentSchedules.forEach((sch) => {
      const days = getDaysUntil(sch.deadlineAt);
      const urgency =
        days === 0 ? "🔴 **HARI INI!**" : days === 1 ? "🔴 besok" : days !== null && days <= 3 ? `🟠 ${days} hari lagi` : `🟡 ${days} hari lagi`;
      message += `\n📋 **${sch.title}** — ${urgency}`;
    });

    message += "\n\nMau mulai dari mana? 😊";
  } else {
    message +=
      "Hari ini kamu bebas! Tidak ada deadline mendesak 🎉\n\nAda jadwal baru yang mau ditambahkan?";
  }

  return message;
}
