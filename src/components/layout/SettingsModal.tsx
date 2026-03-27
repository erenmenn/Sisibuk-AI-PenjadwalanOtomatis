"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAppStore } from "@/lib/store";
import {
  X, User, Mail, Lock, Bell, Palette, Shield,
  Check, Eye, EyeOff, Loader2, ChevronRight, LogOut,
  Settings
} from "lucide-react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Tab = "profile" | "security" | "notifications" | "appearance";

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { user, updateUserName } = useAppStore();
  const [activeTab, setActiveTab] = useState<Tab>("profile");

  // Profile
  const [displayName, setDisplayName] = useState(user.name);
  const [userEmail, setUserEmail] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [nameSaved, setNameSaved] = useState(false);

  // Password
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [savingPass, setSavingPass] = useState(false);
  const [passMsg, setPassMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (user?.email) setUserEmail(user.email);
      });
      // eslint-disable-next-line
      setDisplayName(user.name);
    }
  }, [isOpen, user.name]);

  const handleSaveName = async () => {
    if (!displayName.trim()) return;
    setSavingName(true);
    updateUserName(displayName.trim());
    // Update Supabase user metadata too
    await supabase.auth.updateUser({ data: { name: displayName.trim() } });
    setSavingName(false);
    setNameSaved(true);
    setTimeout(() => setNameSaved(false), 2000);
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      setPassMsg({ type: "error", text: "Konfirmasi password tidak cocok." });
      return;
    }
    if (newPassword.length < 6) {
      setPassMsg({ type: "error", text: "Password minimal 6 karakter." });
      return;
    }
    setSavingPass(true);
    setPassMsg(null);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      setPassMsg({ type: "error", text: error.message });
    } else {
      setPassMsg({ type: "success", text: "Password berhasil diperbarui! ✅" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
    setSavingPass(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    onClose();
  };

  if (!isOpen) return null;

  const tabs: { id: Tab; icon: React.ElementType; label: string }[] = [
    { id: "profile", icon: User, label: "Profil" },
    { id: "security", icon: Shield, label: "Keamanan" },
    { id: "notifications", icon: Bell, label: "Notifikasi" },
    { id: "appearance", icon: Palette, label: "Tampilan" },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        {/* Modal */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in slide-in-from-bottom-4 duration-300">

          {/* Header */}
          <div className="flex items-center justify-between px-8 py-5 border-b border-[var(--color-border)] bg-gradient-to-r from-purple-50 to-pink-50">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Settings size={18} className="text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold font-syne text-[var(--color-text-primary)]">Pengaturan Aplikasi</h2>
                <p className="text-xs text-[var(--color-text-secondary)]">Kelola akun dan preferensi Anda</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl hover:bg-[var(--color-neutral)] flex items-center justify-center transition-colors text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex flex-1 overflow-hidden">
            {/* Left: Tab navigation */}
            <div className="w-48 border-r border-[var(--color-border)] py-4 flex flex-col shrink-0 bg-[var(--color-neutral)]/50">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-3 px-5 py-3 mx-2 rounded-xl text-sm font-semibold transition-all ${
                      isActive
                        ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md"
                        : "text-[var(--color-text-secondary)] hover:bg-[var(--color-neutral)] hover:text-[var(--color-text-primary)]"
                    }`}
                  >
                    <Icon size={16} />
                    {tab.label}
                  </button>
                );
              })}

              {/* Logout at bottom */}
              <div className="mt-auto px-2 pt-4 border-t border-[var(--color-border)] mx-2">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 w-full transition-colors"
                >
                  <LogOut size={16} />
                  Keluar Akun
                </button>
              </div>
            </div>

            {/* Right: Content */}
            <div className="flex-1 overflow-y-auto p-8">

              {/* ── PROFILE TAB ── */}
              {activeTab === "profile" && (
                <div className="flex flex-col gap-6">
                  <h3 className="text-base font-bold text-[var(--color-text-primary)] mb-2">Informasi Profil</h3>

                  {/* Avatar Placeholder */}
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl font-black font-syne shadow-lg">
                      {displayName.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-[var(--color-text-primary)]">{displayName}</p>
                      <p className="text-sm text-[var(--color-text-secondary)]">{userEmail}</p>
                      <p className="text-xs text-purple-500 font-semibold mt-0.5">Level {user.level} · {user.xp} XP</p>
                    </div>
                  </div>

                  {/* Email (readonly) */}
                  <div>
                    <label className="block text-sm font-semibold text-[var(--color-text-secondary)] mb-2 flex items-center gap-2">
                      <Mail size={14} /> Alamat Email
                    </label>
                    <div className="flex items-center gap-3 px-4 py-3 bg-[var(--color-neutral)] border border-[var(--color-border)] rounded-2xl">
                      <span className="text-[var(--color-text-primary)] text-sm flex-1">{userEmail || "Memuat..."}</span>
                      <span className="text-xs bg-green-100 text-green-600 font-semibold px-2 py-0.5 rounded-full">Terverifikasi</span>
                    </div>
                    <p className="text-xs text-[var(--color-text-secondary)] mt-1.5 ml-1">Email tidak bisa diubah langsung. Hubungi support jika diperlukan.</p>
                  </div>

                  {/* display name */}
                  <div>
                    <label className="block text-sm font-semibold text-[var(--color-text-secondary)] mb-2 flex items-center gap-2">
                      <User size={14} /> Nama Panggilan
                    </label>
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="flex-1 px-4 py-3 bg-[var(--color-neutral)] border border-[var(--color-border)] rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 transition-shadow"
                        placeholder="Nama panggilan Anda"
                      />
                      <button
                        onClick={handleSaveName}
                        disabled={savingName || displayName === user.name}
                        className="px-5 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl text-sm font-bold hover:shadow-md disabled:opacity-50 transition-all flex items-center gap-2 min-w-[90px] justify-center"
                      >
                        {savingName ? <Loader2 size={14} className="animate-spin" /> : nameSaved ? <><Check size={14} /> Tersimpan!</> : "Simpan"}
                      </button>
                    </div>
                  </div>

                  {/* Stats summary */}
                  <div className="grid grid-cols-3 gap-3 pt-2">
                    {[
                      { label: "Total XP", value: `${user.xp} XP`, color: "text-purple-600", bg: "bg-purple-50" },
                      { label: "Streak", value: `${user.streakDays} hari`, color: "text-orange-600", bg: "bg-orange-50" },
                      { label: "Badge", value: `${user.badges.length} badge`, color: "text-yellow-600", bg: "bg-yellow-50" },
                    ].map((stat) => (
                      <div key={stat.label} className={`${stat.bg} rounded-2xl p-4 text-center`}>
                        <p className={`text-lg font-black font-syne ${stat.color}`}>{stat.value}</p>
                        <p className="text-xs text-gray-500 mt-0.5 font-medium">{stat.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── SECURITY TAB ── */}
              {activeTab === "security" && (
                <div className="flex flex-col gap-6">
                  <h3 className="text-base font-bold text-[var(--color-text-primary)] mb-2">Keamanan Akun</h3>

                  {passMsg && (
                    <div className={`p-4 rounded-2xl text-sm font-semibold flex items-center gap-2 ${
                      passMsg.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-600 border border-red-200"
                    }`}>
                      {passMsg.text}
                    </div>
                  )}

                  <div className="bg-[var(--color-neutral)] rounded-2xl p-6 flex flex-col gap-5 border border-[var(--color-border)]">
                    <h4 className="font-bold text-sm text-[var(--color-text-primary)] flex items-center gap-2">
                      <Lock size={15} className="text-purple-500" /> Ganti Password
                    </h4>

                    <div>
                      <label className="text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5 block">Password Baru</label>
                      <div className="relative">
                        <input
                          type={showNew ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full px-4 py-3 pr-12 bg-white border border-[var(--color-border)] rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 transition-shadow"
                          placeholder="Minimal 6 karakter"
                        />
                        <button onClick={() => setShowNew(!showNew)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                          {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5 block">Konfirmasi Password Baru</label>
                      <div className="relative">
                        <input
                          type={showConfirm ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full px-4 py-3 pr-12 bg-white border border-[var(--color-border)] rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 transition-shadow"
                          placeholder="Ulangi password baru"
                        />
                        <button onClick={() => setShowConfirm(!showConfirm)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                          {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                      {newPassword && confirmPassword && newPassword !== confirmPassword && (
                        <p className="text-xs text-red-500 mt-1.5 ml-1">Password tidak cocok</p>
                      )}
                    </div>

                    <button
                      onClick={handleChangePassword}
                      disabled={savingPass || !newPassword || !confirmPassword}
                      className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl text-sm font-bold hover:shadow-md disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                    >
                      {savingPass ? <><Loader2 size={14} className="animate-spin" /> Memperbarui...</> : "Perbarui Password"}
                    </button>
                  </div>

                  {/* Account Info */}
                  <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
                    <p className="text-sm font-semibold text-blue-700 mb-1">🔐 Akun Anda Terlindungi</p>
                    <p className="text-xs text-blue-600 leading-relaxed">
                      Data Anda dienkripsi dan disimpan aman di server Supabase. Password tidak disimpan dalam bentuk teks biasa.
                    </p>
                  </div>
                </div>
              )}

              {/* ── NOTIFICATIONS TAB ── */}
              {activeTab === "notifications" && (
                <div className="flex flex-col gap-5">
                  <h3 className="text-base font-bold text-[var(--color-text-primary)] mb-2">Preferensi Notifikasi</h3>
                  {[
                    { label: "Notifikasi Email", desc: "Terima pengingat jadwal via email", key: "email" },
                    { label: "Push Notification", desc: "Notifikasi langsung di browser", key: "push" },
                    { label: "WhatsApp Reminder", desc: "Pengingat melalui WhatsApp (segera hadir)", key: "whatsapp", disabled: true },
                  ].map((item) => {
                    const val = user.notificationPrefs[item.key as keyof typeof user.notificationPrefs] as boolean;
                    return (
                      <div key={item.key} className="flex items-center justify-between p-5 bg-[var(--color-neutral)] rounded-2xl border border-[var(--color-border)]">
                        <div>
                          <p className="font-semibold text-sm text-[var(--color-text-primary)]">{item.label}</p>
                          <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">{item.desc}</p>
                        </div>
                        <div
                          className={`w-12 h-6 rounded-full transition-all relative cursor-pointer ${
                            item.disabled ? "opacity-40 cursor-not-allowed" : ""
                          } ${val && !item.disabled ? "bg-gradient-to-r from-purple-500 to-pink-500" : "bg-gray-200"}`}
                          onClick={() => {
                            if (!item.disabled) {
                              // Toggle would need store action — kept as visual for now
                            }
                          }}
                        >
                          <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${val && !item.disabled ? "translate-x-7" : "translate-x-1"}`} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* ── APPEARANCE TAB ── */}
              {activeTab === "appearance" && (
                <div className="flex flex-col gap-5">
                  <h3 className="text-base font-bold text-[var(--color-text-primary)] mb-2">Tampilan & Tema</h3>
                  <div className="bg-[var(--color-neutral)] border border-[var(--color-border)] rounded-2xl p-5">
                    <p className="font-semibold text-sm text-[var(--color-text-primary)] mb-1">Tema Warna</p>
                    <p className="text-xs text-[var(--color-text-secondary)] mb-4">Pilihan tema lebih banyak akan segera hadir 🎨</p>
                    <div className="flex gap-3">
                      {[
                        { name: "Ungu (Default)", from: "#7C3AED", to: "#EC4899" },
                        { name: "Biru Laut", from: "#2563EB", to: "#06B6D4" },
                        { name: "Hijau Hutan", from: "#059669", to: "#84CC16" },
                      ].map((theme) => (
                        <div key={theme.name} className="flex flex-col items-center gap-2">
                          <div
                            className="w-12 h-12 rounded-2xl shadow-md cursor-pointer ring-2 ring-transparent hover:ring-purple-400 transition-all"
                            style={{ background: `linear-gradient(135deg, ${theme.from}, ${theme.to})` }}
                          />
                          <span className="text-[10px] text-[var(--color-text-secondary)] font-medium text-center">{theme.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100 rounded-2xl p-5">
                    <p className="font-semibold text-sm text-purple-700 mb-1">✨ Versi Aplikasi</p>
                    <p className="text-xs text-purple-600">SISIBUK.AI v1.0 · Powered by LLaMA 3.3 via Groq + Supabase</p>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </>
  );
}
