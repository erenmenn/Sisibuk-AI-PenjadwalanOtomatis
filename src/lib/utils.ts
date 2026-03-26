import { Priority, Schedule, ClassSchedule, StudySession } from "./types";

// ──────────────────────────────────────────────────────────────
// Date helpers
// ──────────────────────────────────────────────────────────────
export function getDaysUntil(dateStr: string | null): number | null {
  if (!dateStr) return null;
  const deadline = new Date(dateStr);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  deadline.setHours(0, 0, 0, 0);
  return Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export function calculatePriority(deadlineAt: string): Priority {
  const days = getDaysUntil(deadlineAt);
  if (days === null) return "MEDIUM";
  if (days < 0) return "DONE";
  if (days <= 3) return "CRITICAL";
  if (days <= 7) return "HIGH";
  if (days <= 14) return "MEDIUM";
  return "LOW";
}

export function formatDate(dateStr: string | null): string {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return d.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatShortDate(dateStr: string | null): string {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatTime(dateStr: string | null): string {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
}

export function getTodayString(): string {
  return new Date().toISOString().split("T")[0];
}

export function getDayName(dayOfWeek: number): string {
  const days = ["", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];
  return days[dayOfWeek] || "";
}

export function getTodayDayOfWeek(): number {
  const day = new Date().getDay(); // 0=Sun
  return day === 0 ? 7 : day; // convert to 1=Mon, 7=Sun
}

export function getWeekRange(): { start: Date; end: Date } {
  const now = new Date();
  const day = now.getDay() || 7; // Mon=1...Sun=7
  const start = new Date(now);
  start.setDate(now.getDate() - day + 1);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

// ──────────────────────────────────────────────────────────────
// Reminder generation
// ──────────────────────────────────────────────────────────────
export type ReminderTemplate = { label: string; daysBeforeDeadline: number };

const REMINDER_TEMPLATES: Record<string, ReminderTemplate[]> = {
  DEADLINE_SUBMIT: [
    { label: "7 hari sebelum", daysBeforeDeadline: 7 },
    { label: "3 hari sebelum", daysBeforeDeadline: 3 },
    { label: "1 hari sebelum", daysBeforeDeadline: 1 },
    { label: "Hari H", daysBeforeDeadline: 0 },
  ],
  DEADLINE_REGISTER: [
    { label: "7 hari sebelum", daysBeforeDeadline: 7 },
    { label: "3 hari sebelum", daysBeforeDeadline: 3 },
    { label: "1 hari sebelum", daysBeforeDeadline: 1 },
    { label: "Hari H", daysBeforeDeadline: 0 },
  ],
  EXAM: [
    { label: "14 hari sebelum", daysBeforeDeadline: 14 },
    { label: "7 hari sebelum", daysBeforeDeadline: 7 },
    { label: "3 hari sebelum", daysBeforeDeadline: 3 },
    { label: "1 hari sebelum", daysBeforeDeadline: 1 },
  ],
  MEETING: [
    { label: "3 hari sebelum", daysBeforeDeadline: 3 },
    { label: "1 hari sebelum", daysBeforeDeadline: 1 },
    { label: "1 jam sebelum", daysBeforeDeadline: 0 },
  ],
  PERSONAL: [
    { label: "1 hari sebelum", daysBeforeDeadline: 1 },
  ],
};

export function generateReminders(type: string, deadlineAt: string | null) {
  if (!deadlineAt) return [];
  const templates = REMINDER_TEMPLATES[type] || REMINDER_TEMPLATES.DEADLINE_SUBMIT;
  const deadline = new Date(deadlineAt);
  return templates.map((t) => {
    const triggerDate = new Date(deadline);
    triggerDate.setDate(deadline.getDate() - t.daysBeforeDeadline);
    return {
      label: t.label,
      date: triggerDate.toISOString(),
      daysBeforeDeadline: t.daysBeforeDeadline,
    };
  });
}

// ──────────────────────────────────────────────────────────────
// Conflict checker
// ──────────────────────────────────────────────────────────────
export function checkConflicts(
  newDeadline: string,
  schedules: Schedule[]
): Schedule[] {
  const newDate = new Date(newDeadline);
  const threeDayWindow = 3 * 24 * 60 * 60 * 1000;

  return schedules.filter((sch) => {
    if (!sch.deadlineAt || sch.isCompleted) return false;
    const existing = new Date(sch.deadlineAt);
    return Math.abs(newDate.getTime() - existing.getTime()) <= threeDayWindow;
  });
}

// ──────────────────────────────────────────────────────────────
// Slot finder for Reverse Planner
// ──────────────────────────────────────────────────────────────
export interface TimeSlot {
  date: string; // YYYY-MM-DD
  startHour: number;
  endHour: number;
}

export function findAvailableSlots(
  classSchedules: ClassSchedule[],
  existingSchedules: Schedule[],
  fromDate: Date,
  toDate: Date,
  preferredHour: number = 19,
  durationHours: number = 1.5
): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const cursor = new Date(fromDate);

  while (cursor <= toDate) {
    const dayOfWeek = cursor.getDay() === 0 ? 7 : cursor.getDay();
    const dateStr = cursor.toISOString().split("T")[0];

    // Check if class conflicts at preferred hour
    const classBlocks = classSchedules.filter(
      (c) => c.dayOfWeek === dayOfWeek && c.isActive
    );
    const isBlocked = classBlocks.some((c) => {
      const classStart = parseInt(c.startTime.split(":")[0]);
      const classEnd = parseInt(c.endTime.split(":")[0]);
      return preferredHour >= classStart && preferredHour < classEnd;
    });

    // Check existing study sessions at that slot
    const existingAtSlot = existingSchedules.some((sch) => {
      if (!sch.deadlineAt) return false;
      const schDate = sch.deadlineAt.split("T")[0];
      return schDate === dateStr;
    });

    if (!isBlocked && !existingAtSlot) {
      slots.push({
        date: dateStr,
        startHour: preferredHour,
        endHour: preferredHour + durationHours,
      });
    }

    cursor.setDate(cursor.getDate() + 1);
  }

  return slots;
}

// ──────────────────────────────────────────────────────────────
// Reverse study planner
// ──────────────────────────────────────────────────────────────
export function buildReversePlan(
  topics: string[],
  deadlineDate: string,
  classSchedules: ClassSchedule[],
  existingSchedules: Schedule[],
  durationMinutes: number = 90,
  preferredHour: number = 19
): StudySession[] {
  const deadline = new Date(deadlineDate);
  const buffer = new Date(deadline);
  buffer.setDate(deadline.getDate() - 1); // leave 1 day buffer

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const slots = findAvailableSlots(
    classSchedules,
    existingSchedules,
    today,
    buffer,
    preferredHour,
    durationMinutes / 60
  );

  // Reserve last slot for review
  const reviewSlots = slots.length > 2 ? [slots[slots.length - 1]] : [];
  const studySlots = slots.length > 2 ? slots.slice(0, -1) : slots;

  const sessions: StudySession[] = [];

  topics.forEach((topic, idx) => {
    const slot = studySlots[idx % studySlots.length];
    if (!slot) return;

    const plannedAt = new Date(`${slot.date}T${String(slot.startHour).padStart(2, "0")}:00:00`);

    sessions.push({
      id: `sess-${Date.now()}-${idx}`,
      scheduleId: "",
      topicName: topic,
      topicOrder: idx + 1,
      plannedAt: plannedAt.toISOString(),
      durationMinutes,
      isCompleted: false,
      completedAt: null,
    });
  });

  // Add review session if slots available
  if (reviewSlots.length > 0) {
    const reviewSlot = reviewSlots[0];
    const plannedAt = new Date(
      `${reviewSlot.date}T${String(reviewSlot.startHour).padStart(2, "0")}:00:00`
    );
    sessions.push({
      id: `sess-${Date.now()}-review`,
      scheduleId: "",
      topicName: "Review & Latihan",
      topicOrder: topics.length + 1,
      plannedAt: plannedAt.toISOString(),
      durationMinutes: 60,
      isCompleted: false,
      completedAt: null,
    });
  }

  return sessions;
}

// ──────────────────────────────────────────────────────────────
// ID generator
// ──────────────────────────────────────────────────────────────
export function genId(): string {
  return Math.random().toString(36).slice(2, 10);
}

// ──────────────────────────────────────────────────────────────
// Greeting
// ──────────────────────────────────────────────────────────────
export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Selamat pagi";
  if (hour < 15) return "Selamat siang";
  if (hour < 18) return "Selamat sore";
  return "Selamat malam";
}
