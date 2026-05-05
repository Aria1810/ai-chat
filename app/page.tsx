'use client';
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { upsertUser } from "@/lib/user";

export default function Home() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [characters, setCharacters] = useState<any[]>([]);

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) { router.replace("/login"); return; }
      await upsertUser(data.user);
      const { data: chars } = await supabase.from("characters").select("*");
      setCharacters(chars || []);
    };
    init();
  }, [router]);

  return (
    <div className="min-h-screen flex bg-[#050508] text-[#e4e4e7] font-sans selection:bg-[#786BD4]/30">
      <style>{`
        .glass-panel { background: rgba(15, 15, 20, 0.7); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.05); }
        .nav-link { position: relative; transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); }
        .nav-link::after { content: ''; position: absolute; left: 0; bottom: -2px; width: 0; height: 1px; background: #786BD4; transition: width 0.3s; }
        .nav-link:hover::after { width: 100%; }
        .char-card { transition: all 0.5s cubic-bezier(0.23, 1, 0.32, 1); }
        .char-card:hover { transform: translateY(-8px) scale(1.02); border-color: rgba(120, 107, 212, 0.4); box-shadow: 0 20px 40px -20px rgba(0,0,0,0.8); }
        .cyber-input { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); transition: all 0.3s; }
        .cyber-input:focus { border-color: #786BD4; background: rgba(120, 107, 212, 0.05); box-shadow: 0 0 20px rgba(120, 107, 212, 0.1); }
      `}</style>

      {/* 极简侧边导航 */}
      <aside className="hidden md:flex w-64 glass-panel flex-col p-8 gap-10 border-r border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-[#786BD4] rounded-sm rotate-45 flex items-center justify-center shadow-[0_0_15px_#786BD4]">
          <div className="w-2 h-2 bg-black rounded-full"></div>
          </div>
          <span className="text-xl font-black tracking-tighter italic">SOMICHAT</span>
        </div>

        <nav className="flex flex-col gap-6 text-[11px] tracking-[0.3em] uppercase text-white/40">
          <button onClick={() => router.push("/")} className="nav-link text-left hover:text-[#786BD4]">Index</button>
          <button onClick={() => router.push("/chat")} className="nav-link text-left hover:text-[#786BD4]">Neural_Link</button>
          <button onClick={() => router.push("/create")} className="nav-link text-left hover:text-[#786BD4]">Create_Subject</button>
          <button onClick={() => router.push("/profile")} className="nav-link text-left hover:text-[#786BD4]">User_Data</button>
          <button onClick={() => router.push("/recharge")} className="nav-link text-left hover:text-[#786BD4]">Energy_Refill</button>
        </nav>
      </aside>

      <main className="flex-1 overflow-y-auto p-12 bg-[radial-gradient(circle_at_top_right,rgba(120,107,212,0.05),transparent)]">
        {/* 搜索矩阵 */}
        <div className="max-w-6xl mx-auto mb-16 relative">
          <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search Subject ID / Neural Sequence..."
          className="cyber-input w-full px-8 py-5 rounded-2xl outline-none text-sm font-light tracking-wide"
          />
          <div className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] text-white/20 tracking-widest font-mono">SYS_FILTER_ON</div>
        </div>

        {/* 角色矩阵卡片区 */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {characters
          .filter((c) => c.name?.toLowerCase().includes(search.toLowerCase()))
          .map((c) => (
          <div
          key={c.id}
          onClick={() => router.push(`/chat/${c.id}`)}
          className="char-card glass-panel cursor-pointer rounded-3xl overflow-hidden group"
          >
          <div className="aspect-[4/5] relative overflow-hidden bg-[#0a0a0f]">
          {c.avatar ? (
          <img src={c.avatar} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100" />
          ) : (
          <div className="w-full h-full flex items-center justify-center text-white/5 text-4xl font-black italic">NO_DATA</div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#050508] via-transparent to-transparent opacity-60"></div>
          </div>

          <div className="p-6 space-y-2">
          <div className="flex justify-between items-center">
          <span className="font-bold text-lg tracking-tight group-hover:text-[#786BD4] transition-colors">{c.name}</span>
          <span className="text-[9px] text-white/20 font-mono">#{c.id.slice(0, 8)}</span>
          </div>
          <div className="text-xs text-white/40 line-clamp-2 font-light leading-relaxed">
          {c.description || "Neural description not initialized."}
          </div>
          </div>
          </div>
          ))}

          {/* 交互占位符 */}
          <div 
          onClick={() => router.push("/create")}
          className="char-card border-2 border-dashed border-white/5 rounded-3xl flex flex-col items-center justify-center aspect-[4/5] hover:bg-white/5 group transition-all"
          >
          <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center mb-4 group-hover:border-[#786BD4] transition-colors">
          <span className="text-2xl font-light text-white/20 group-hover:text-[#786BD4]">+</span>
          </div>
          <span className="text-[10px] tracking-[0.4em] text-white/20 group-hover:text-white/40">NEW_SUBJECT</span>
          </div>
        </div>
      </main>

      {/* 极简底部移动导航 */}
      <nav className="md:hidden fixed bottom-6 left-6 right-6 h-16 glass-panel rounded-2xl flex justify-around items-center text-[10px] tracking-widest uppercase z-50">
        <button onClick={() => router.push("/")} className="hover:text-[#786BD4]">Index</button>
        <button onClick={() => router.push("/chat")} className="hover:text-[#786BD4]">Link</button>
        <button onClick={() => router.push("/create")} className="hover:text-[#786BD4]">Create</button>
        <button onClick={() => router.push("/profile")} className="hover:text-[#786BD4]">Data</button>
      </nav>
    </div>
  );
}