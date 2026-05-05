'use client';
import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const login = async () => {
    if (!email || loading) return;
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({ email: email });
      if (!error) {
        setSent(true);
        setTimeout(() => setSent(false), 5000);
      }
    } catch (e) {
      console.error("Critical: Neural uplink destabilized.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020205] text-white/90 selection:bg-[#786BD4]/30 overflow-hidden">
      
      {/* 动态背景矩阵 */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#786BD4]/10 blur-[120px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/10 blur-[120px] rounded-full"></div>
        <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
      </div>

      <div className="relative w-full max-w-[420px] p-12 bg-black/40 backdrop-blur-3xl border border-white/5 rounded-[32px] shadow-2xl">
        
        <header className="mb-12 space-y-2">
          <div className="flex items-center gap-3 mb-4">
          <div className="w-2 h-8 bg-[#786BD4] rounded-full"></div>
          <h2 className="text-3xl font-black italic tracking-tighter uppercase">SomiChat</h2>
          </div>
          <p className="text-[10px] tracking-[0.4em] text-white/30 font-bold uppercase">System_Access_Protocol // v1.0.2</p>
        </header>

        <div className="space-y-8">
          <div className="relative group">
          <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter_Neural_Identifier..."
          className="w-full bg-transparent border-b border-white/10 py-4 text-sm font-light tracking-wide focus:outline-none focus:border-[#786BD4] transition-all duration-700 placeholder:text-white/5"
          type="email"
          />
          <div className="absolute bottom-0 left-0 w-0 h-px bg-[#786BD4] group-focus-within:w-full transition-all duration-1000"></div>
          </div>

          <button
          onClick={login}
          disabled={loading}
          className="w-full h-14 relative group overflow-hidden rounded-xl border border-white/10 bg-white text-black transition-all duration-500 hover:bg-[#786BD4] hover:text-white"
          >
          <div className="absolute inset-0 bg-[#786BD4] translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
          <span className="relative z-10 text-[10px] font-black tracking-[0.4em] uppercase">
          {loading ? "Synchronizing..." : "Initiate_Link"}
          </span>
          </button>

          <div className={`mt-6 text-[9px] tracking-widest leading-relaxed text-[#786BD4] font-mono transition-all duration-1000 ${sent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
          <span className="font-black mr-2">[COMPLETE]</span>
          Verification sequence transmitted to uplink. Check your comms.
          </div>
        </div>

        <footer className="mt-16 flex justify-between items-center opacity-20">
          <div className="text-[8px] tracking-widest font-mono">STATUS: STABLE</div>
          <div className="text-[8px] tracking-widest font-mono">NODE: CX-93</div>
        </footer>
      </div>

      {/* 装饰性侧边水印 */}
      <div className="fixed bottom-12 right-12 text-[120px] font-black italic text-white/5 pointer-events-none select-none tracking-tighter leading-none">
        GATE_01
      </div>
    </div>
  );
}