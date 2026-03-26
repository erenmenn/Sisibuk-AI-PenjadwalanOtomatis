"use client";

import { useAppStore } from "@/lib/store";
import Sidebar from "@/components/layout/Sidebar";
import ChatView from "@/components/views/ChatView";
import CalendarView from "@/components/views/CalendarView";
import SchedulesView from "@/components/views/SchedulesView";
import ProfileView from "@/components/views/ProfileView";
import OnboardingView from "@/components/views/OnboardingView";
import StudyView from "@/components/views/StudyView";
import DashboardView from "@/components/views/DashboardView";
import LoginView from "@/components/views/LoginView";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

import { Session } from "@supabase/supabase-js";

export default function Home() {
  const { currentView } = useAppStore();
  const [session, setSession] = useState<Session | null>(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const fetchUserData = async (userId: string) => {
    try {
      const { data } = await supabase
        .from("user_data")
        .select("state")
        .eq("user_id", userId)
        .single();

      if (data?.state) {
        // Returning user: restore their cloud state
        useAppStore.setState({
          ...data.state,
          currentView: data.state.currentView === "onboarding" ? "dashboard" : data.state.currentView,
        });
      } else {
        // New user: set name from Supabase metadata, skip onboarding
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.user_metadata?.name) {
          useAppStore.getState().updateUserName(user.user_metadata.name);
        }
        useAppStore.getState().completeOnboarding();
      }
    } catch (e) {
      console.log("Error fetching user data:", e);
    }
  };

  useEffect(() => {
    // Clear old localStorage data that might interfere
    if (typeof window !== "undefined") {
      localStorage.removeItem("milkun-ai-store");
    }

    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchUserData(session.user.id);
      }
      setLoadingSession(false);
    });

    // Listen to Auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      if (newSession) {
        fetchUserData(newSession.user.id);
      } else {
        // On logout, reset store to default blank state
        useAppStore.setState({
          currentView: "onboarding",
          onboardingStep: 0,
          user: {
            id: "user-1",
            name: "Kamu",
            email: "",
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
          },
          schedules: [],
          classSchedules: [],
          studySources: [],
          studyLogs: [],
          messages: [],
        });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Sync state changes to Supabase cloud automatically (debounced 2s)
  useEffect(() => {
    if (!session?.user?.id) return;

    let timeout: NodeJS.Timeout;
    const unsub = useAppStore.subscribe((state) => {
      clearTimeout(timeout);
      timeout = setTimeout(async () => {
        const stateToSave = {
          user: state.user,
          schedules: state.schedules,
          classSchedules: state.classSchedules,
          studySources: state.studySources,
          studyLogs: state.studyLogs,
          messages: state.messages,
          onboardingStep: state.onboardingStep,
          currentView: state.currentView,
        };

        await supabase.from("user_data").upsert(
          { user_id: session.user.id, state: stateToSave },
          { onConflict: "user_id" }
        );
      }, 2000);
    });

    return () => unsub();
  }, [session]);

  // Loading screen (matches the purple/pink theme)
  if (loadingSession) {
    return (
      <div
        className="w-full h-screen flex flex-col items-center justify-center gap-3"
        style={{ background: "linear-gradient(135deg, #1a0b2e, #4c1d63, #7f1d4f)" }}
      >
        <div className="w-8 h-8 border-2 border-white/20 border-t-pink-400 rounded-full animate-spin" />
        <p className="text-white/60 text-sm font-medium">Memuat MILKUN.AI...</p>
      </div>
    );
  }

  // Not logged in → Show beautiful Login Page
  if (!session) {
    return <LoginView onLoginSuccess={() => {}} />;
  }

  // Logged in but new user hasn't completed onboarding
  if (currentView === "onboarding") {
    return <OnboardingView />;
  }

  // Main App
  return (
    <div className="flex w-full h-[100dvh] bg-transparent text-purple-950 relative overflow-hidden font-sans">
      
      {/* Dynamic Background identical to the design */}
      <div className="absolute inset-0 bg-transparent pointer-events-none z-0" />
      
      {/* Floating 3D elements in BG */}
      <div className="absolute top-[10%] left-[8%] w-8 h-8 opacity-70 rotate-12 drop-shadow-[0_0_15px_rgba(255,255,255,0.8)] filter contrast-125 text-3xl select-none">✨</div>
      <div className="absolute top-[18%] right-[12%] w-10 h-10 opacity-60 rotate-45 drop-shadow-[0_0_15px_rgba(255,255,255,0.8)] text-4xl select-none">✧</div>
      <div className="absolute bottom-[20%] left-[25%] w-6 h-6 opacity-80 -rotate-12 drop-shadow-[0_0_15px_rgba(255,255,255,0.8)] text-4xl select-none text-yellow-300">✦</div>
      <div className="absolute bottom-[10%] right-[30%] w-12 h-12 rounded-full bg-yellow-400/20 blur-2xl blur-3xl" />
      <div className="absolute top-[30%] left-[45%] w-12 h-12 rounded-full bg-pink-400/20 blur-3xl opacity-50" />

      {/* Main Container - Fully separated panels like playing cards on a table! */}
      <div className="flex w-full h-full p-2 sm:p-5 relative z-10 gap-5 max-w-[1920px] mx-auto overflow-visible items-stretch">
        <Sidebar />
        
        {/* Main Workspace Frame (middle + right panels) */}
        <div className="flex-1 flex overflow-hidden glass-surface m-5 ml-0 mb-5 mt-5 rounded-[2.5rem] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.6),_0_20px_40px_rgba(31,38,135,0.1)] backdrop-blur-3xl relative !bg-white/10">
          <main className="flex-1 overflow-hidden relative">
            {currentView === "dashboard" && <DashboardView />}
            {currentView === "chat" && <ChatView />}
            {currentView === "calendar" && <CalendarView />}
            {currentView === "schedules" && <SchedulesView />}
            {currentView === "study" && <StudyView />}
            {currentView === "profile" && <ProfileView />}
          </main>
        </div>
      </div>
    </div>
  );
}
