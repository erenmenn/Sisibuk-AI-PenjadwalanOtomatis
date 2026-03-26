import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Sparkles, ArrowRight, Loader2 } from "lucide-react";

// Inline styles for the shooting star animation and glowing effects
const customStyles = `
  @keyframes shootingStar {
    0% {
      transform: translateX(0) translateY(0) rotate(-45deg) scale(1);
      opacity: 1;
    }
    100% {
      transform: translateX(-1500px) translateY(1500px) rotate(-45deg) scale(0.2);
      opacity: 0;
    }
  }

  .shooting-star {
    position: absolute;
    width: 120px;
    height: 2px;
    background: linear-gradient(90deg, rgba(255,255,255,0.8), transparent);
    border-radius: 50%;
    filter: drop-shadow(0 0 6px rgba(255,255,255,0.8));
    animation: shootingStar 4s linear infinite;
    pointer-events: none;
  }

  .shooting-star::before {
    content: '';
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 6px;
    height: 6px;
    background: white;
    border-radius: 50%;
    box-shadow: 0 0 12px 2px rgba(255, 255, 255, 0.9);
  }

  /* Different delays and positions for stars */
  .star-1 { top: 0%; left: 80%; animation-delay: 0s; animation-duration: 3s; }
  .star-2 { top: 10%; left: 100%; animation-delay: 1.2s; animation-duration: 4s; }
  .star-3 { top: -20%; left: 50%; animation-delay: 2.5s; animation-duration: 3.5s; }
  .star-4 { top: 30%; left: 120%; animation-delay: 0.8s; animation-duration: 4.5s; }
  .star-5 { top: -10%; left: 30%; animation-delay: 3s; animation-duration: 4s; }
  
  @keyframes blob-spin {
    0% { transform: rotate(0deg) scale(1); }
    50% { transform: rotate(180deg) scale(1.1); }
    100% { transform: rotate(360deg) scale(1); }
  }
  
  .animate-blob-spin {
    animation: blob-spin 20s infinite linear;
  }
`;

export default function LoginView({ onLoginSuccess }: { onLoginSuccess: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        onLoginSuccess();
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
            data: {
              name,
            }
          }
        });
        if (error) throw error;
        setErrorMsg(""); 
      setIsLogin(true);
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      setErrorMsg(error.message || "Terjadi kesalahan.");
    } else {
      setErrorMsg("Terjadi kesalahan.");
    }
  } finally {
    setLoading(false);
  }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden flex items-center justify-center bg-gray-900 selection:bg-pink-500/30">
      <style>{customStyles}</style>

      {/* Background Gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1a0b2e] via-[#4c1d63] to-[#7f1d4f] z-0" />
      
      {/* Animated Glowing Orbs */}
      <div className="absolute top-[10%] left-[20%] w-[500px] h-[500px] bg-purple-500/30 rounded-full blur-[120px] mix-blend-screen animate-blob-spin pointer-events-none z-0" />
      <div className="absolute bottom-[10%] right-[10%] w-[600px] h-[600px] bg-pink-500/20 rounded-full blur-[150px] mix-blend-screen animate-blob-spin pointer-events-none z-0" style={{ animationDirection: 'reverse', animationDuration: '25s' }} />

      {/* Shooting Stars Overlay */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="shooting-star star-1"></div>
        <div className="shooting-star star-2"></div>
        <div className="shooting-star star-3"></div>
        <div className="shooting-star star-4"></div>
        <div className="shooting-star star-5"></div>
      </div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 z-[1] opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      {/* Main Content Container */}
      <div className="relative z-10 w-full max-w-5xl flex flex-col md:flex-row items-center gap-12 px-6">
        
        {/* Left Side: Branding & Copy */}
        <div className="flex-1 text-white text-center md:text-left mb-8 md:mb-0">
          <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-6 shadow-[0_0_20px_rgba(236,72,153,0.3)]">
            <Sparkles className="w-4 h-4 text-pink-300 mr-2" />
            <span className="text-sm font-semibold text-pink-100 tracking-wide uppercase">AI-Powered Planning</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black font-syne tracking-tight mb-6 leading-[1.1]">
            <span className="text-white">Jadwal Anda,</span><br/>
            <span className="bg-gradient-to-r from-purple-300 via-pink-400 to-orange-400 bg-clip-text text-transparent">Lebih Cerdas.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-purple-100/80 max-w-lg mx-auto md:mx-0 font-medium leading-relaxed">
            MILKUN.AI menyusun, mengingatkan, dan beradaptasi dengan aktivitas Anda secara otomatis.
          </p>
        </div>

        {/* Right Side: Glassmorphism Login Card */}
        <div className="w-full max-w-[420px]">
          <div className="relative rounded-[2rem] p-[1px] bg-gradient-to-b from-white/20 to-white/0 overflow-hidden shadow-2xl shadow-purple-900/50">
            {/* Inner Glass Box */}
            <div className="bg-black/20 backdrop-blur-2xl px-8 py-10 rounded-[calc(2rem-1px)] h-full w-full">
              
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold font-syne text-white mb-2">
                  {isLogin ? "Selamat Datang" : "Mulai Perjalanan"}
                </h2>
                <p className="text-sm text-purple-200/70">
                  {isLogin ? "Masuk ke akun MILKUN.AI Anda" : "Buat akun pintar pertama Anda"}
                </p>
              </div>

              {errorMsg && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-200 p-3 rounded-xl mb-6 text-sm text-center flex justify-center items-center gap-2 backdrop-blur-md">
                   {errorMsg}
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                {!isLogin && (
                  <div>
                    <label className="text-sm font-semibold text-purple-100/90 mb-2 block ml-1">Nama Panggilan</label>
                    <div className="group relative">
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-5 py-3.5 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:border-pink-500/50 focus:bg-white/10 hover:bg-white/10 transition-all text-white placeholder-white/30"
                        placeholder="Contoh: Budi, Alice"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-sm font-semibold text-purple-100/90 mb-2 block ml-1">Email Address</label>
                  <div className="group relative">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-5 py-3.5 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:border-pink-500/50 focus:bg-white/10 hover:bg-white/10 transition-all text-white placeholder-white/30"
                      placeholder="nama@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-purple-100/90 mb-2 block ml-1">Password</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-5 py-3.5 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:border-pink-500/50 focus:bg-white/10 hover:bg-white/10 transition-all text-white placeholder-white/30"
                    placeholder="••••••••"
                    minLength={6}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl font-bold text-lg mt-4 hover:shadow-[0_0_20px_rgba(236,72,153,0.4)] transition-all overflow-hidden flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  <div className="absolute inset-0 bg-white/20 group-hover:translate-x-full -translate-x-full skew-x-12 transition-transform duration-500 ease-in-out" />
                  {loading ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Memproses...</>
                  ) : (
                    <>{isLogin ? "Masuk ke Dashboard" : "Daftar Akun"} <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></>
                  )}
                </button>
              </form>

              <div className="mt-8 text-center text-sm text-purple-200/50">
                {isLogin ? "Pengguna baru?" : "Sudah ahli?"}{" "}
                <button
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setErrorMsg("");
                  }}
                  className="text-pink-300 font-bold hover:text-pink-200 transition-colors"
                >
                  {isLogin ? "Daftar Sekarang" : "Masuk di Sini"}
                </button>
              </div>

            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}
