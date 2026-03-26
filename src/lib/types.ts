// ============================================================
// jadwal.ai — Core Types
// ============================================================

export type IntentType =
  // Academic
  | "DEADLINE_SUBMIT"      // Kumpul tugas
  | "DEADLINE_PROPOSAL"    // Submit proposal/skripsi
  | "DEADLINE_REGISTER"    // Tutup pendaftaran
  | "EXAM"                 // Ujian / UTS / UAS
  | "STUDY_PLAN"           // Rencana belajar
  | "STUDY_SESSION"        // Sesi belajar aktif
  | "CLASS"                // Kuliah / kelas
  // Events & Meetings
  | "MEETING"              // Meeting umum
  | "WEBINAR"              // Zoom / webinar / pelatihan online
  | "TRAINING"             // Pelatihan / workshop offline
  | "COMPETITION"          // Lomba / hackathon / kompetisi
  // Health & Lifestyle
  | "WORKOUT"              // Gym / latihan fisik
  | "RUNNING"              // Lari / jogging
  | "SPORT"                // Olahraga lain
  // Info & Personal
  | "INFO"                 // Sekedar informasi / reminder
  | "PERSONAL"             // Aktivitas personal
  | "QUERY"                // Pertanyaan ke AI
  | "UNKNOWN";

export type Priority = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "DONE";
export type Action =
  | "CREATE_SCHEDULE"
  | "CREATE_STUDY_PLAN"
  | "QUERY_SCHEDULE"
  | "MARK_COMPLETE"
  | "NONE";
export type NotificationChannel = "email" | "push" | "whatsapp" | "in_app";

// ──────────────────────────────────────────────────────────────
// Schedule
// ──────────────────────────────────────────────────────────────
export interface Schedule {
  id: string;
  userId: string;
  title: string;
  type: IntentType;
  priority: Priority;
  deadlineAt: string | null; // ISO date string
  isCompleted: boolean;
  completedAt: string | null;
  isRecurring: boolean;
  notes: string;
  createdAt: string;
  createdVia: "chat" | "form";
  // For STUDY_PLAN
  studySessions?: StudySession[];
}

export interface StudySession {
  id: string;
  scheduleId: string;
  topicName: string;
  topicOrder: number;
  plannedAt: string; // ISO datetime string
  durationMinutes: number;
  isCompleted: boolean;
  completedAt: string | null;
}

// ──────────────────────────────────────────────────────────────
// Study Room (New Feature)
// ──────────────────────────────────────────────────────────────
export interface StudySource {
  id: string;
  title: string;              // e.g. "Catatan UTS Aljabar"
  subject: string;            // e.g. "Matematika Diskrit"
  description: string;
  url: string | null;
  fileType: "link" | "note" | "pdf" | "video";
  createdAt: string;
}

export interface StudyLog {
  id: string;
  scheduleId: string | null;  // optional link to a task
  subject: string;
  startedAt: string;          // ISO
  finishedAt: string | null;  // ISO, set when timer stops
  durationMinutes: number;    // 0 while running, set on stop
  topics: string[];           // topics covered
  notes: string;
}

// ──────────────────────────────────────────────────────────────
// Class Schedule (Sacred Time)
// ──────────────────────────────────────────────────────────────
export interface ClassSchedule {
  id: string;
  userId: string;
  subjectName: string;
  dayOfWeek: number; // 1=Senin, 7=Minggu
  startTime: string; // "HH:MM"
  endTime: string;   // "HH:MM"
  room?: string;     // e.g. "Ruang 3.2" or "Online"
  lecturer?: string; // e.g. "Dr. Budi"
  credits?: number;  // SKS
  color: string;
  isActive: boolean;
}

// ──────────────────────────────────────────────────────────────
// Reminder
// ──────────────────────────────────────────────────────────────
export interface Reminder {
  id: string;
  scheduleId: string;
  triggerAt: string;
  channel: NotificationChannel;
  status: "pending" | "sent" | "failed" | "skipped";
  sentAt: string | null;
}

// ──────────────────────────────────────────────────────────────
// Chat
// ──────────────────────────────────────────────────────────────
export interface ChatMessage {
  id: string;
  userId: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
  relatedScheduleId?: string;
  xpEarned?: number;
}

// ──────────────────────────────────────────────────────────────
// Gamification
// ──────────────────────────────────────────────────────────────
export interface Badge {
  id: string;
  emoji: string;
  name: string;
  description: string;
  earnedAt?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  xp: number;
  level: number;
  streakDays: number;
  streakLastDate: string | null;
  badges: Badge[];
  notificationPrefs: {
    email: boolean;
    push: boolean;
    whatsapp: boolean;
    doNotDisturbDays: number[];
    sendHour: number;
  };
}

// ──────────────────────────────────────────────────────────────
// Intent Classifier Output
// ──────────────────────────────────────────────────────────────
export interface IntentResult {
  intent: IntentType;
  action: Action;
  confidence: number;
  schedule: {
    title: string;
    deadline_date: string | null;
    deadline_time: string | null;
    priority: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
    topics: string[];
    duration_minutes: number | null;
  } | null;
  reply: string;
  needs_confirmation: boolean;
}

// ──────────────────────────────────────────────────────────────
// App State
// ──────────────────────────────────────────────────────────────
export type AppView = "dashboard" | "chat" | "calendar" | "schedules" | "study" | "profile" | "onboarding" | "detail";
export type LlmStatus = "online" | "rate_limited" | "offline" | "checking";

export interface PendingStudyPlan {
  topics: string[];       // e.g. ["RAG", "MCP", "AI Agent"]
  step: "ask_mode" | "ask_dates" | "done";
  mode?: "together" | "separate";
  dateMode?: "manual" | "random";
  assignedDates?: { topic: string; date: string }[];  // YYYY-MM-DD
}

export const LEVEL_CONFIG = [
  { level: 1, name: "Penjadwal Pemula", emoji: "🌱", xpRequired: 0 },
  { level: 2, name: "Mahasiswa Teratur", emoji: "📓", xpRequired: 200 },
  { level: 3, name: "Deadline Crusher", emoji: "💪", xpRequired: 500 },
  { level: 4, name: "Study Strategist", emoji: "🧠", xpRequired: 1000 },
  { level: 5, name: "Productivity Master", emoji: "⚡", xpRequired: 2000 },
  { level: 6, name: "Time Architect", emoji: "🏗️", xpRequired: 5000 },
  { level: 7, name: "Jadwal Legend", emoji: "🏆", xpRequired: 10000 },
];

export const ALL_BADGES: Badge[] = [
  { id: "first_blood", emoji: "🎯", name: "First Blood", description: "Selesaikan deadline pertama" },
  { id: "speed_runner", emoji: "⚡", name: "Speed Runner", description: "Selesaikan 5 jadwal 3+ hari sebelum deadline" },
  { id: "knowledge_seeker", emoji: "📚", name: "Knowledge Seeker", description: "Selesaikan 10 sesi belajar" },
  { id: "on_fire", emoji: "🔥", name: "On Fire", description: "Streak 7 hari" },
  { id: "unbreakable", emoji: "🛡️", name: "Unbreakable", description: "Streak 30 hari" },
  { id: "night_owl", emoji: "🌙", name: "Night Owl", description: "Selesaikan 5 jadwal setelah jam 22.00" },
  { id: "early_bird", emoji: "☀️", name: "Early Bird", description: "Selesaikan 5 jadwal sebelum jam 07.00" },
  { id: "overachiever", emoji: "🚀", name: "Overachiever", description: "3 minggu tanpa ada jadwal yang terlewat" },
  { id: "planner_pro", emoji: "🧠", name: "Planner Pro", description: "Gunakan Reverse Planner 10 kali" },
  { id: "chat_addict", emoji: "💬", name: "Chat Addict", description: "Kirim 100 pesan ke AI assistant" },
];

export const INTENT_LABELS: Record<IntentType, { label: string; color: string; emoji: string; group: string }> = {
  // Academic
  DEADLINE_SUBMIT:   { label: "Submit Tugas",     color: "#EF4444", emoji: "📋", group: "Akademik" },
  DEADLINE_PROPOSAL: { label: "Submit Proposal",  color: "#F43F5E", emoji: "📄", group: "Akademik" },
  DEADLINE_REGISTER: { label: "Tutup Pendaftaran",color: "#F97316", emoji: "📝", group: "Akademik" },
  EXAM:              { label: "Ujian/UTS/UAS",    color: "#8B5CF6", emoji: "✏️", group: "Akademik" },
  STUDY_PLAN:        { label: "Belajar",           color: "#3B82F6", emoji: "📚", group: "Akademik" },
  STUDY_SESSION:     { label: "Sesi Belajar",      color: "#06B6D4", emoji: "📖", group: "Akademik" },
  CLASS:             { label: "Kuliah",             color: "#6C63FF", emoji: "🏫", group: "Akademik" },
  // Events
  MEETING:           { label: "Meeting",           color: "#F59E0B", emoji: "🤝", group: "Event" },
  WEBINAR:           { label: "Zoom/Webinar",      color: "#0EA5E9", emoji: "💻", group: "Event" },
  TRAINING:          { label: "Pelatihan",          color: "#14B8A6", emoji: "🎓", group: "Event" },
  COMPETITION:       { label: "Lomba/Hackathon",   color: "#EC4899", emoji: "🏆", group: "Event" },
  // Health
  WORKOUT:           { label: "Gym/Workout",       color: "#10B981", emoji: "💪", group: "Kesehatan" },
  RUNNING:           { label: "Lari/Jogging",      color: "#84CC16", emoji: "🏃", group: "Kesehatan" },
  SPORT:             { label: "Olahraga",           color: "#22D3EE", emoji: "⚽", group: "Kesehatan" },
  // Info & Personal
  INFO:              { label: "Informasi",          color: "#A78BFA", emoji: "ℹ️", group: "Lainnya" },
  PERSONAL:          { label: "Personal",           color: "#F472B6", emoji: "🌟", group: "Lainnya" },
  QUERY:             { label: "Query",              color: "#6B7280", emoji: "❓", group: "Lainnya" },
  UNKNOWN:           { label: "Lainnya",            color: "#9CA3AF", emoji: "📌", group: "Lainnya" },
};

export const PRIORITY_CONFIG: Record<string, { label: string; color: string; bg: string; emoji: string }> = {
  CRITICAL: { label: "Kritis", color: "#EF4444", bg: "rgba(239,68,68,0.1)", emoji: "🔴" },
  HIGH: { label: "Tinggi", color: "#F97316", bg: "rgba(249,115,22,0.1)", emoji: "🟠" },
  MEDIUM: { label: "Sedang", color: "#F59E0B", bg: "rgba(245,158,11,0.1)", emoji: "🟡" },
  LOW: { label: "Rendah", color: "#22C55E", bg: "rgba(34,197,94,0.1)", emoji: "🟢" },
  DONE: { label: "Selesai", color: "#6B7280", bg: "rgba(107,114,128,0.1)", emoji: "⚫" },
};
