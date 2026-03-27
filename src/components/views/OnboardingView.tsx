import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { ArrowRight, Sparkles, GraduationCap } from "lucide-react";

export default function OnboardingView() {
  const { currentView, completeOnboarding, updateUserName, user } = useAppStore();
  const [step, setStep] = useState(1);
  const [name, setName] = useState(user.name === "Kamu" ? "" : user.name);

  if (currentView !== "onboarding") return null;

  const handleNext = () => {
    if (step === 1) {
      if (name.trim()) {
        updateUserName(name);
        setStep(2);
      }
    } else {
      completeOnboarding();
    }
  };

  return (
    <div className="flex-1 w-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed flex flex-col items-center justify-center p-6 relative overflow-hidden bg-[#1A1A2E]">
      
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#6C63FF] rounded-full mix-blend-screen filter blur-[100px] opacity-20 pointer-events-none"></div>

      <div className="glass-panel w-full max-w-sm rounded-[2rem] p-8 border-[rgba(255,255,255,0.1)] shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-10 relative flex flex-col items-center text-center">
        
        {step === 1 && (
          <div className="flex flex-col items-center w-full animate-in fade-in zoom-in duration-500">
            <div className="w-20 h-20 bg-gradient-to-br from-[#7C3AED] to-[#EC4899] rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(124,58,237,0.5)] mb-6 transform rotate-12">
               <Sparkles className="w-10 h-10 text-white" />
            </div>
            
            <h1 className="text-3xl font-display font-bold text-[var(--color-text-primary)] mb-2 tracking-wide">
              SISIBUK<span className="text-[#7C3AED]">.AI</span>
            </h1>
            <p className="text-sm font-medium text-gray-400 mb-8 whitespace-pre-line leading-relaxed">
              {"Ngobrol sama jadwal kamu.\nBiar aku yang ingat, kamu yang eksekusi."}
            </p>

            <div className="w-full relative form-group">
               <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Siapa namamu?"
                  className="w-full bg-[#16213E] border border-white/10 rounded-xl px-4 py-4 text-white placeholder:text-gray-500 focus:outline-none focus:border-[#6C63FF] transition-colors font-medium text-center shadow-inner"
                  onKeyDown={(e) => e.key === "Enter" && handleNext()}
               />
            </div>

            <button 
                onClick={handleNext}
                disabled={!name.trim()}
                className="mt-6 w-full py-4 bg-gradient-to-br from-[#7C3AED] to-[#4F46E5] disabled:from-gray-300 disabled:to-gray-300 text-white rounded-xl font-bold tracking-wider uppercase text-sm shadow-[0_0_20px_rgba(124,58,237,0.35)] disabled:shadow-none flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
                Mulai Setup <ArrowRight size={18} />
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col items-center w-full animate-in slide-in-from-right-8 fade-in duration-500">
             <div className="w-16 h-16 bg-[#3B82F6]/20 rounded-full flex items-center justify-center text-[#3B82F6] mb-4">
                <GraduationCap className="w-8 h-8" />
             </div>
             
             <h2 className="text-xl font-bold text-white mb-2 text-center">Hai, {name}! 👋</h2>
             <p className="text-xs text-gray-400 text-center mb-8 px-4 leading-relaxed">
                Sebelum mulai, aku mau kasih tau fitur rahasia: <br/>
                <strong className="text-white mt-2 block tracking-wide">JADWAL KULIAH (Sacred Time)</strong>
                Aku nggak akan pernah merekomendasikan jam belajar di saat kamu sedang kelas. Nanti tambahin jadwal kuliahmu di setting ya!
             </p>

             <button 
                onClick={handleNext}
                className="w-full py-4 bg-gradient-to-br from-[#7C3AED] to-[#4F46E5] hover:scale-[1.02] text-white rounded-xl font-bold tracking-wider uppercase text-sm shadow-[0_0_20px_rgba(124,58,237,0.4)] flex items-center justify-center transition-all"
            >
                Masuk ke Aplikasi
            </button>
          </div>
        )}

      </div>
      
    </div>
  );
}
