"use client";

import { create } from "zustand";

import {
  Schedule,
  ClassSchedule,
  ChatMessage,
  User,
  StudySource,
  StudyLog,
  PendingStudyPlan,
  AppView,
  LlmStatus,
  LEVEL_CONFIG,
  ALL_BADGES,
} from "./types";
import { calculatePriority, generateReminders } from "./utils";

// ──────────────────────────────────────────────────────────────
// Default user
// ──────────────────────────────────────────────────────────────
const DEFAULT_USER: User = {
  id: "user-1",
  name: "Kamu",
  email: "user@jadwal.ai",
  xp: 0,
  level: 1,
  streakDays: 0,
  streakLastDate: null,
  badges: [],
  notificationPrefs: {
    email: true,
    push: true,
    whatsapp: false,
    doNotDisturbDays: [],
    sendHour: 7,
  },
};

// ──────────────────────────────────────────────────────────────
// Store interface
// ──────────────────────────────────────────────────────────────
interface AppStore {
  // State
  currentView: AppView;
  onboardingStep: number | null; // null = onboarding done
  selectedScheduleId: string | null;
  user: User;
  schedules: Schedule[];
  classSchedules: ClassSchedule[];
  studySources: StudySource[];
  studyLogs: StudyLog[];
  activeStudyLogId: string | null;
  pendingStudyPlan: PendingStudyPlan | null;  // multi-turn study planning state
  messages: ChatMessage[];
  isAiTyping: boolean;
  xpAnimation: number | null; // shows floating +XP
  llmStatus: LlmStatus;

  // Navigation
  setView: (view: AppView) => void;
  setSelectedSchedule: (id: string | null) => void;

  // Onboarding
  completeOnboarding: () => void;
  setOnboardingStep: (step: number | null) => void;

  // User
  updateUserName: (name: string) => void;
  addXP: (amount: number, reason: string) => void;
  checkAndUpdateStreak: () => void;

  // Schedules
  addSchedule: (schedule: Omit<Schedule, "id" | "userId" | "createdAt" | "isCompleted" | "completedAt" | "isRecurring" | "notes" | "priority">) => Schedule;
  completeSchedule: (id: string) => void;
  deleteSchedule: (id: string) => void;
  editSchedule: (id: string, updates: Partial<Schedule>) => void;
  completeStudySession: (scheduleId: string, sessionId: string) => void;

  // Study Room
  addStudySource: (source: Omit<StudySource, "id" | "createdAt">) => void;
  deleteStudySource: (id: string) => void;
  startStudyLog: (log: Omit<StudyLog, "id" | "startedAt" | "finishedAt" | "durationMinutes">) => string;
  stopStudyLog: (id: string) => void;
  deleteStudyLog: (id: string) => void;
  setPendingStudyPlan: (plan: PendingStudyPlan | null) => void;
  commitStudyPlan: (plan: PendingStudyPlan) => Schedule[];

  // Class Schedules
  addClass: (cls: Omit<ClassSchedule, "id" | "userId" | "isActive">) => void;
  removeClass: (id: string) => void;

  // Chat
  addMessage: (msg: Omit<ChatMessage, "id" | "createdAt" | "userId">) => void;
  clearChat: () => void;
  setIsAiTyping: (v: boolean) => void;
  clearXpAnimation: () => void;
  setLlmStatus: (status: LlmStatus) => void;
}

// ──────────────────────────────────────────────────────────────
// Store implementation
// ──────────────────────────────────────────────────────────────
export const useAppStore = create<AppStore>()((set, get) => ({
  currentView: "onboarding",
  onboardingStep: 0,
  selectedScheduleId: null,
  user: DEFAULT_USER,
  schedules: [],
  classSchedules: [],
  studySources: [],
  studyLogs: [],
  activeStudyLogId: null,
  pendingStudyPlan: null,
  messages: [],
  isAiTyping: false,
  xpAnimation: null,
  llmStatus: "checking",

  setView: (view) => set({ currentView: view }),
  setSelectedSchedule: (id) => set({ selectedScheduleId: id }),

  completeOnboarding: () =>
    set({ onboardingStep: null, currentView: "dashboard" }),
  setOnboardingStep: (step) => set({ onboardingStep: step }),

  updateUserName: (name) =>
    set((s) => ({ user: { ...s.user, name } })),

  addXP: (amount, reason) => {
    const { user } = get();
    const newXp = user.xp + amount;
        const newLevel = LEVEL_CONFIG.reduce(
          (acc, l) => (newXp >= l.xpRequired ? l.level : acc),
          1
        );
        set((s) => ({
          user: { ...s.user, xp: newXp, level: newLevel },
          xpAnimation: amount,
        }));
        // Auto-clear animation after 2s
        setTimeout(() => set({ xpAnimation: null }), 2000);
      },

      clearXpAnimation: () => set({ xpAnimation: null }),

      checkAndUpdateStreak: () => {
        const { user } = get();
        const today = new Date().toISOString().split("T")[0];
        if (user.streakLastDate === today) return;

        const yesterday = new Date(Date.now() - 86400000)
          .toISOString()
          .split("T")[0];

        let newStreak = user.streakLastDate === yesterday
          ? user.streakDays + 1
          : 1;

        set((s) => ({
          user: {
            ...s.user,
            streakDays: newStreak,
            streakLastDate: today,
          },
        }));

        get().addXP(5, "Login harian");
      },

      addSchedule: (scheduleData) => {
        const id = `sch-${Date.now()}`;
        const schedule: Schedule = {
          id,
          userId: "user-1",
          isCompleted: false,
          completedAt: null,
          isRecurring: false,
          notes: "",
          createdAt: new Date().toISOString(),
          priority: scheduleData.deadlineAt
            ? calculatePriority(scheduleData.deadlineAt)
            : "MEDIUM",
          ...scheduleData,
        };
        set((s) => ({ schedules: [...s.schedules, schedule] }));
        return schedule;
      },

      completeSchedule: (id) => {
        const { schedules, addXP } = get();
        const sch = schedules.find((s) => s.id === id);
        if (!sch || sch.isCompleted) return;

        const now = new Date();
        const deadlineDate = sch.deadlineAt ? new Date(sch.deadlineAt) : null;
        const isEarly =
          deadlineDate &&
          now < new Date(deadlineDate.getTime() - 3 * 24 * 60 * 60 * 1000);

        const xp = isEarly ? 75 : 50;
        addXP(xp, isEarly ? "Selesai lebih awal!" : "Jadwal selesai");

        // check first blood badge
        const { user } = get();
        const completedCount = schedules.filter(
          (s) => s.isCompleted && s.type !== "CLASS"
        ).length;
        const hasBadge = user.badges.some((b) => b.id === "first_blood");
        if (completedCount === 0 && !hasBadge) {
          const badge = ALL_BADGES.find((b) => b.id === "first_blood")!;
          set((s) => ({
            user: {
              ...s.user,
              badges: [...s.user.badges, { ...badge, earnedAt: new Date().toISOString() }],
            },
          }));
        }

        set((s) => ({
          schedules: s.schedules.map((sch) =>
            sch.id === id
              ? { ...sch, isCompleted: true, completedAt: now.toISOString(), priority: "DONE" }
              : sch
          ),
        }));

        get().checkAndUpdateStreak();
      },

      deleteSchedule: (id) =>
        set((s) => ({
          schedules: s.schedules.filter((sch) => sch.id !== id),
        })),

      editSchedule: (id, updates) =>
        set((s) => ({
          schedules: s.schedules.map((sch) =>
            sch.id === id ? { ...sch, ...updates } : sch
          ),
        })),

      completeStudySession: (scheduleId, sessionId) => {
        const { addXP } = get();
        set((s) => ({
          schedules: s.schedules.map((sch) => {
            if (sch.id !== scheduleId) return sch;
            const sessions = (sch.studySessions || []).map((sess) =>
              sess.id === sessionId
                ? { ...sess, isCompleted: true, completedAt: new Date().toISOString() }
                : sess
            );
            return { ...sch, studySessions: sessions };
          }),
        }));
        addXP(30, "Sesi belajar selesai");
      },

      addClass: (cls: Omit<ClassSchedule, "id" | "userId" | "isActive">) => {
        const id = `cls-${Date.now()}`;
        const classSchedule: ClassSchedule = {
          id,
          userId: "user-1",
          isActive: true,
          ...cls,
        };
        set((s) => ({ classSchedules: [...s.classSchedules, classSchedule] }));
      },

      removeClass: (id: string) =>
        set((s) => ({
          classSchedules: s.classSchedules.filter((c) => c.id !== id),
        })),

      // Study Room
      addStudySource: (data) => {
        const source: StudySource = {
          id: `src-${Date.now()}`,
          createdAt: new Date().toISOString(),
          ...data,
        };
        set((s) => ({ studySources: [...s.studySources, source] }));
      },
      deleteStudySource: (id) =>
        set((s) => ({ studySources: s.studySources.filter((src) => src.id !== id) })),

      startStudyLog: (data) => {
        const id = `log-${Date.now()}`;
        const log: StudyLog = {
          id,
          startedAt: new Date().toISOString(),
          finishedAt: null,
          durationMinutes: 0,
          ...data,
        };
        set((s) => ({ studyLogs: [...s.studyLogs, log], activeStudyLogId: id }));
        return id;
      },
      stopStudyLog: (id) => {
        const log = get().studyLogs.find((l) => l.id === id);
        if (!log) return;
        const finished = new Date();
        const durationMinutes = Math.round((finished.getTime() - new Date(log.startedAt).getTime()) / 60000);
        set((s) => ({
          studyLogs: s.studyLogs.map((l) =>
            l.id === id ? { ...l, finishedAt: finished.toISOString(), durationMinutes } : l
          ),
          activeStudyLogId: null,
        }));
        get().addXP(durationMinutes * 2, `Belajar ${durationMinutes} menit`);
      },
      deleteStudyLog: (id) =>
        set((s) => ({ studyLogs: s.studyLogs.filter((l) => l.id !== id) })),

      setPendingStudyPlan: (plan) => set({ pendingStudyPlan: plan }),

      commitStudyPlan: (plan) => {
        const newSchedules: Schedule[] = [];
        const { addSchedule, addXP } = get();
        if (plan.mode === "together") {
          const date = plan.assignedDates?.[0]?.date || null;
          const topicList = plan.topics.join(" + ");
          const sch = addSchedule({
            title: `Belajar: ${topicList}`,
            type: "STUDY_PLAN",
            createdVia: "chat",
            deadlineAt: date ? `${date}T09:00` : null,
          });
          newSchedules.push(sch);
        } else {
          plan.assignedDates?.forEach(({ topic, date }) => {
            const sch = addSchedule({
              title: `Belajar: ${topic}`,
              type: "STUDY_PLAN",
              createdVia: "chat",
              deadlineAt: `${date}T09:00`,
            });
            newSchedules.push(sch);
          });
        }
        addXP(newSchedules.length * 15, "Rencana belajar dibuat");
        set({ pendingStudyPlan: null });
        return newSchedules;
      },

      addMessage: (msg) => {
        const message: ChatMessage = {
          id: `msg-${Date.now()}-${Math.random()}`,
          userId: get().user.id,
          createdAt: new Date().toISOString(),
          ...msg,
        };
        set((s) => ({ messages: [...s.messages, message] }));
      },

    clearChat: () => set({ messages: [] }),
    setIsAiTyping: (v) => set({ isAiTyping: v }),
    setLlmStatus: (status) => set({ llmStatus: status }),
}));
