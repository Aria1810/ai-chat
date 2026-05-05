'use client';

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { upsertUser } from "@/lib/user";

export default function Home() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [characters, setCharacters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.replace("/login");
        return;
      }
      await upsertUser(data.user);
      const { data: chars } = await supabase.from("characters").select("*");
      setCharacters(chars || []);
      setLoading(false);
    };
    init();
  }, [router]);

  return (
    <div className="min-h-screen flex bg-[#050508] text-white/90 font-sans selection:bg-[#786BD4]/30">
      
      {/* 极简磨砂导航 - SOMI_CORE ARCHITECTURE */}
      <aside className="hidden md:flex w-64 border-r border-white/5 bg-black/50 backdrop-blur-3xl flex-col p-8 gap-10 z-30">
        <div className="flex flex-col gap-2">
          <div className="text-2xl font-black italic tracking-tighter text-white">SOMICHAT</div>
          <div className="text-[9px] tracking-[0.4em] text-white/20 uppercase font-bold">Neural_Matrix_v4</div>
        </div>

        <nav className="flex flex-col gap-1">
          {[
          { label: "INDEX // 首页", path: "/" },
          { label: "CHAT // 聊天", path: "/chat" },
          { label: "CREATE // 创建", path: "/create" },
          { label: "PROFILE // 个人", path: "/profile" },
          { label: "RECHARGE // 充值", path: "/recharge" }
          ].map((item) => (
          <button
          key={item.path}
          onClick={() => router.push(item.path)}
          className="text-left py-3 px-4 text-[10px] tracking-widest text-white/40 hover:text-[#786BD4] hover:bg-white/5 rounded-lg transition-all duration-500 uppercase font-bold group"
          >
          <span className="group-hover:pl-2 transition-all">{item.label}</span>
          </button>
          ))}
        </nav>
      </aside>

      {/* 主沉浸区 */}
      <div className="flex-1 flex flex-col relative overflow-y-auto custom-scrollbar">
        
        {/* 背景光晕装饰 */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#786BD4]/10 blur-[120px] rounded-full -z-10 animate-pulse"></div>

        <div className="max-w-6xl mx-auto w-full p-8 md:p-16 space-y-12">
          
          {/* 搜索模态框 */}
          <div className="relative group max-w-2xl">
          <div className="absolute -inset-1 bg-gradient-to-r from-[#786BD4] to-blue-600 rounded-2xl blur opacity-10 group-focus-within:opacity-30 transition duration-1000"></div>
          <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search Subject ID / Signal..."
          className="relative w-full px-6 py-4 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-[#786BD4]/50 backdrop-blur-md transition-all placeholder:text-white/10"
          />
          </div>

          {/* 角色矩阵网格 */}
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {loading ? (
          [1,2,3,4].map(i => <div key={i} className="aspect-[3/4] bg-white/5 animate-pulse rounded-2xl"></div>)
          ) : (
          characters
          .filter((c) => c.name?.toLowerCase().includes(search.toLowerCase()))
          .map((c) => (
          <div
          key={c.id}
          onClick={() => router.push(`/chat/${c.id}`)}
          className="group relative cursor-pointer aspect-[3/4] rounded-2xl overflow-hidden bg-[#0a0a0f] border border-white/5 hover:border-[#786BD4]/50 transition-all duration-700"
          >
          {/* 图片容器 */}
          <div className="w-full h-full relative overflow-hidden">
          {c.avatar ? (
          <img src={c.avatar} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-60 group-hover:opacity-100" />
          ) : (
          <div className="w-full h-full flex items-center justify-center text-white/5 font-black italic text-4xl">NULL</div>
          )}
          {/* 底部信息遮罩 */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80"></div>
          <div className="absolute bottom-0 left-0 p-6 w-full transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
          <div className="text-xs text-[#786BD4] font-black tracking-widest mb-1 opacity-0 group-hover:opacity-100 transition-opacity uppercase">Initialize_Link</div>
          <div className="font-bold text-lg text-white mb-1">{c.name}</div>
          <div className="text-[10px] text-white/40 line-clamp-1 uppercase tracking-tighter">{c.description}</div>
          </div>
          </div>
          </div>
          ))
          )}

          {/* 创建入口卡片 */}
          <div 
          onClick={() => router.push("/create")}
          className="group aspect-[3/4] rounded-2xl border border-dashed border-white/10 flex flex-col items-center justify-center gap-4 hover:border-[#786BD4]/50 hover:bg-[#786BD4]/5 transition-all cursor-pointer"
          >
          <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center group-hover:border-[#786BD4] group-hover:text-[#786BD4] transition-all">
          <span className="text-2xl font-light">+</span>
          </div>
          <span className="text-[10px] tracking-[0.3em] text-white/20 group-hover:text-white transition-colors uppercase font-black">Create_Subject</span>
          </div>
          </div>
        </div>
      </div>

      {/* 极简手机导航 */}
      <div className="md:hidden fixed bottom-6 left-6 right-6 h-16 rounded-2xl border border-white/10 bg-black/80 backdrop-blur-2xl flex justify-around items-center z-50">
        {["首页", "聊天", "创建", "个人"].map((label, idx) => (
          <button key={idx} className="text-[10px] font-black tracking-widest text-white/40 hover:text-[#786BD4] uppercase transition-colors">{label}</button>
        ))}
      </div>

    </div>
  );
}