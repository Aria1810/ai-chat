'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type ChatPreview = {
  id: string;
  name: string;
  avatar?: string | null;
  desc?: string | null;
  last: string;
  time: string;
};

type MessageRow = {
  character_id: string;
  content: string;
  created_at: string;
  characters?: { name?: string | null; avatar?: string | null; description?: string | null } | null;
};
type FavoriteRow = { character_id: string; characters?: { name?: string | null; avatar?: string | null; description?: string | null } | null };

export default function ChatListPage() {
  const router = useRouter();
  const [chats, setChats] = useState<ChatPreview[]>([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<ChatPreview[]>([]);

  useEffect(() => {
    const init = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;
      const user_id = userData.user.id;

      const { data: msgs } = await supabase
        .from("messages")
        .select("character_id, content, created_at, characters(name, avatar, description)")
        .eq("user_id", user_id)
        .order("created_at", { ascending: false });

      const { data: favRows } = await supabase
        .from("favorites")
        .select("character_id, characters(name, avatar, description)")
        .eq("user_id", user_id);

      const uniqueThreads = new Map();
      (msgs as MessageRow[] | null)?.forEach((m) => {
        if (!uniqueThreads.has(m.character_id)) {
          uniqueThreads.set(m.character_id, {
          id: m.character_id,
          name: m.characters?.name || "ANONYMOUS_ENTITY",
          avatar: m.characters?.avatar,
          desc: m.characters?.description,
          last: m.content,
          time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          });
        }
      });

      setChats(Array.from(uniqueThreads.values()));
      setFavorites(((favRows as FavoriteRow[] | null) || []).map((fav) => ({
        id: fav.character_id,
        name: fav.characters?.name || "ANONYMOUS_ENTITY",
        avatar: fav.characters?.avatar,
        desc: fav.characters?.description,
        last: "已收藏的角色",
        time: "FAVORITE",
      })));
      setLoading(false);
    };
    init();
  }, []);

  return (
    <div className="min-h-screen bg-[#050508] text-white/90 selection:bg-[#786BD4]/30">
      
      {/* 沉浸式顶栏 */}
      <header className="sticky top-0 z-30 p-8 border-b border-white/5 bg-black/60 backdrop-blur-2xl">
        <div className="max-w-4xl mx-auto flex justify-between items-end">
          <div>
          <div className="text-[10px] tracking-[0.5em] text-[#786BD4] font-black uppercase mb-1">Thread_Archive</div>
          <h1 className="text-3xl font-black italic tracking-tighter uppercase">Recent_Pulse</h1>
          </div>
          <div className="text-[8px] font-mono text-white/20 tracking-widest uppercase pb-1">
          Active_Nodes: {chats.length}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 sm:p-8 space-y-8">
        {!loading && favorites.length > 0 && <section>
          <div className="mb-3 flex items-center justify-between"><div><p className="text-[10px] tracking-[.35em] text-[#a99cff]">FAVORITES</p><h2 className="mt-1 text-xl font-black">我的收藏</h2></div><span className="text-xs text-white/35">{favorites.length}</span></div>
          <div className="grid gap-3 sm:grid-cols-2">{favorites.map((c) => <button key={c.id} onClick={() => router.push(`/chat/${c.id}`)} className="flex items-center gap-3 rounded-2xl border border-[#786BD4]/25 bg-[#786BD4]/[.06] p-4 text-left hover:bg-[#786BD4]/[.12]"><img src={c.avatar || "/placeholder.png"} alt="" className="h-11 w-11 rounded-xl object-cover"/><span className="min-w-0"><b className="block truncate">{c.name}</b><small className="block truncate text-white/45">{c.desc || "已收藏角色"}</small></span></button>)}</div>
        </section>}
        <section>
        <div className="mb-3"><p className="text-[10px] tracking-[.35em] text-[#a99cff]">RECENTLY CHATTED</p><h2 className="mt-1 text-xl font-black">最近聊过</h2></div>
        {loading ? (
          <div className="py-20 text-center animate-pulse text-[10px] tracking-[0.3em] text-white/20">ACCESSING_CHANNELS...</div>
        ) : (
          chats.map((c) => (
          <div
          key={c.id}
          onClick={() => router.push(`/chat/${c.id}`)}
          className="group relative flex items-center gap-6 p-6 bg-white/[0.02] border border-white/5 rounded-[24px] hover:bg-[#786BD4]/5 hover:border-[#786BD4]/30 transition-all duration-500 cursor-pointer overflow-hidden"
          >
          {/* 悬停光效 */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#786BD4]/0 to-[#786BD4]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>

          <div className="relative">
          <div className="absolute -inset-1 bg-[#786BD4] rounded-full blur opacity-0 group-hover:opacity-30 transition duration-1000"></div>
          <img src={c.avatar || "/placeholder.png"} alt="" className="relative w-14 h-14 rounded-full object-cover border border-white/10 grayscale group-hover:grayscale-0 transition-all duration-700" />
          </div>

          <div className="flex-1 min-w-0">
          <div className="flex justify-between items-end mb-1">
          <h3 className="font-black text-sm tracking-wide uppercase">{c.name}</h3>
          <span className="text-[9px] font-mono text-white/10">{c.time}</span>
          </div>
          <p className="text-xs text-white/40 truncate font-light tracking-wide italic">
            &quot;{c.last}&quot;
          </p>
          </div>

          <div className="opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
          <svg className="w-5 h-5 text-[#786BD4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M9 5l7 7-7 7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          </div>
          </div>
          ))
        )}
        </section>
      </main>

      {/* 底部装饰层 */}
      <div className="fixed bottom-10 left-10 pointer-events-none select-none opacity-5">
        <div className="text-[120px] font-black italic tracking-tighter leading-none">THREADS</div>
      </div>
    </div>
  );
}
