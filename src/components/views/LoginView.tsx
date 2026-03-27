"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

/* ─── Keyframes & Styles ─────────────────────────────────────── */
const S = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .card-in {
    animation: fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }

  /* Inputs */
  .min-inp {
    width: 100%; 
    padding: 14px 16px;
    border: 1px solid rgba(0, 0, 0, 0.08); 
    border-radius: 12px;
    font-size: 14px; 
    font-family: 'Inter', sans-serif;
    color: #000; 
    background: rgba(255, 255, 255, 0.5);
    outline: none; 
    box-sizing: border-box;
    transition: all 0.3s ease;
  }
  .min-inp:focus {
    background: rgba(255, 255, 255, 0.9);
    border-color: rgba(232, 19, 43, 0.8);
    box-shadow: 0 0 0 4px rgba(232, 19, 43, 0.1);
  }
  .min-inp::placeholder { color: #999; }

  /* Submit button */
  .min-btn {
    width: 100%; 
    padding: 15px;
    border: none; 
    border-radius: 12px; 
    cursor: pointer;
    background: linear-gradient(135deg, #E8132B 0%, #B70F22 100%);
    color: #fff; 
    font-weight: 600; 
    font-size: 14px;
    font-family: 'Inter', sans-serif;
    box-shadow: 0 4px 14px rgba(232, 19, 43, 0.25);
    transition: all 0.2s ease;
  }
  .min-btn:hover  { 
    background: linear-gradient(135deg, #F01A35 0%, #C41226 100%); 
    box-shadow: 0 6px 20px rgba(232, 19, 43, 0.35);
    transform: translateY(-1px);
  }
  .min-btn:active { transform: scale(0.98) translateY(0); }
  .min-btn:disabled { opacity: 0.7; cursor: not-allowed; transform: none; box-shadow: none; }
`;

export default function LoginView({ onLoginSuccess }: { onLoginSuccess: () => void }) {
  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin]   = useState(true);
  const [loading, setLoading]   = useState(false);
  const [errorMsg, setErrorMsg]     = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setErrorMsg(""); setSuccessMsg("");
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        onLoginSuccess();
      } else {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: `${window.location.origin}/auth/callback`, data: { name } },
        });
        if (error) throw error;
        setSuccessMsg("Akun berhasil dibuat. Silakan cek email kamu.");
        setIsLogin(true);
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally { setLoading(false); }
  };

  return (
    <div style={{
      position: "relative", width: "100%", height: "100vh",
      overflow: "hidden", display: "flex",
      alignItems: "center", justifyContent: "center",
      backgroundImage: "url('/bg-login.png')",
      backgroundPosition: "left center",
      backgroundSize: "cover",
      backgroundRepeat: "no-repeat",
      backgroundColor: "#ffffff",
      fontFamily: "'Inter', sans-serif",
    }}>
      <style>{S}</style>

      {/* ══════════ CONTENT WRAPPER ══════════ */}
      <div style={{
        position: "relative", zIndex: 10,
        width: "100%", maxWidth: "1200px",
        display: "flex", alignItems: "center",
        justifyContent: "flex-end",
        padding: "0 48px",
      }}>

        {/* ════ RIGHT: Minimalist Login Card ════ */}
        <div className="card-in" style={{ width: "380px", flexShrink: 0 }}>
          <div style={{
            position: "relative",
            overflow: "hidden",
            background: "rgba(255, 255, 255, 0.7)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            borderRadius: "20px",
            padding: "40px",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.04)",
            border: "1px solid rgba(255, 255, 255, 0.6)",
          }}>
            {/* ── gradient accent bar top ── */}
            <div style={{
              position: "absolute", top: 0, left: 0, right: 0, height: "4px",
              background: "linear-gradient(90deg, #FF3000, #E8132B, #B70F22)",
            }}/>
            
            {/* Header */}
            <div style={{ marginBottom: "32px" }}>
              <h2 style={{
                margin: 0,
                fontWeight: 600,
                fontSize: "24px",
                color: "#111",
                letterSpacing: "-0.5px",
              }}>
                {isLogin ? "Masuk" : "Daftar"}
              </h2>
              <p style={{ margin: "8px 0 0", fontSize: "14px", color: "#666" }}>
                {isLogin ? "Kembali ke SISIBUK" : "Mulai atur jadwalmu dengan AI"}
              </p>
            </div>

            {/* Messages */}
            {errorMsg && (
              <div style={{
                marginBottom: "20px", padding: "12px",
                background: "rgba(255, 59, 48, 0.08)", border: "1px solid rgba(255, 59, 48, 0.2)",
                borderRadius: "10px", color: "#d32f2f",
                fontSize: "13px",
              }}>{errorMsg}</div>
            )}
            {successMsg && (
              <div style={{
                marginBottom: "20px", padding: "12px",
                background: "rgba(52, 199, 89, 0.08)", border: "1px solid rgba(52, 199, 89, 0.2)",
                borderRadius: "10px", color: "#2e7d32",
                fontSize: "13px",
              }}>{successMsg}</div>
            )}

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              
              {!isLogin && (
                <input className="min-inp" type="text" required value={name}
                  onChange={e => setName(e.target.value)} placeholder="Nama lengkap"/>
              )}

              <input className="min-inp" type="email" required value={email}
                onChange={e => setEmail(e.target.value)} placeholder="Alamat email"/>

              <input className="min-inp" type="password" required value={password}
                onChange={e => setPassword(e.target.value)} placeholder="Password" minLength={6}/>

              <button type="submit" disabled={loading} className="min-btn" style={{ marginTop: "8px" }}>
                {loading
                  ? <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                      <Loader2 size={16} className="animate-spin"/> Memproses...
                    </span>
                  : isLogin ? "Lanjutkan" : "Buat Akun"
                }
              </button>
            </form>

            {/* Footer / Toggle */}
            <div style={{ marginTop: "24px", textAlign: "center" }}>
              <p style={{ margin: 0, fontSize: "13.5px", color: "#666" }}>
                {isLogin ? "Belum punya akun? " : "Sudah punya akun? "}
                <button
                  type="button"
                  onClick={() => { setIsLogin(!isLogin); setErrorMsg(""); setSuccessMsg(""); }}
                  style={{
                    background: "none", border: "none", cursor: "pointer",
                    color: "#E8132B", fontWeight: 600, fontSize: "13.5px",
                    fontFamily: "inherit", padding: 0, textDecoration: "underline",
                    textUnderlineOffset: "4px"
                  }}
                >
                  {isLogin ? "Daftar sekarang" : "Masuk"}
                </button>
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
