'use client';

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { ensureUserProfile } from "@/lib/user";

type Character = {
  id: string;
  name?: string | null;
  description?: string | null;
  tags?: string[] | null;
  avatar?: string | null;
};

/* =========================
   用户初始化函数（单独放）
========================= */
async function upsertUser(user: User) {
  if (!user) return;

  const { error } = await ensureUserProfile(user);

  if (error) {
    console.error("upsertUser error:", error.message);
  }
}

export default function Home() {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
     const { data } = await supabase.auth.getUser();
console.log("USER CHECK:", data);

      if (!data.user) {
        router.replace("/login");
        return;
      }

      await upsertUser(data.user);

      const { data: chars } = await supabase
        .from("characters")
        .select("*")
        .eq("approval_status", "approved")
        .eq("is_published", true)
        .order("created_at", { ascending: false });

      setCharacters((chars as Character[] | null) || []);
      setLoading(false);
    };

    init();
  }, [router]);

  return (
    <div className="min-h-screen flex bg-[#050508] text-white/90 font-sans selection:bg-[#786BD4]/30 overflow-hidden">

      {/* 👇 下面你的UI完全不动 */}

      {/* 左侧导航 */}
      <aside className="hidden md:flex w-64 border-r border-white/5 bg-black/50 backdrop-blur-3xl flex-col p-8 gap-10 z-30">

        <div className="flex flex-col gap-2">
          <div className="text-2xl font-black italic tracking-tighter text-white">
            SOMICHAT
          </div>

          <div className="text-[9px] tracking-[0.4em] text-white/20 uppercase font-bold">
            Neural_Matrix_v4
          </div>
        </div>

        <nav className="flex flex-col gap-1">

          {[
            { label: "INDEX // 首页", path: "/" },
            { label: "CHAT // 聊天", path: "/chat" },
            { label: "CREATE // 创建", path: "/create" },
            { label: "PROFILE // 个人", path: "/profile" },
            { label: "PERSONA // 人设", path: "/persona" },
            { label: "RECHARGE // 充值", path: "/recharge" },
          ].map((item) => (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className="text-left py-3 px-4 text-[10px] tracking-widest text-white/40 hover:text-[#786BD4] hover:bg-white/5 rounded-xl transition-all duration-500 uppercase font-bold group"
            >
              <span className="group-hover:pl-2 transition-all">
                {item.label}
              </span>
            </button>
          ))}

        </nav>

      </aside>

      {/* 主区域 */}
      <div className="flex-1 overflow-y-auto custom-scrollbar relative">

        {/* 背景光效 */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#786BD4]/10 blur-[120px] rounded-full -z-10"></div>

        <div className="max-w-7xl mx-auto p-8 md:p-14 space-y-12">

          {/* 顶部 */}
          <div className="space-y-6">

            <div>
              <div className="text-[10px] tracking-[0.5em] uppercase text-[#786BD4] font-black mb-2">
                Neural Character Hub
              </div>

              <h1 className="text-5xl font-black tracking-tight italic">
                Discover Entities
              </h1>
            </div>

            {/* 搜索 */}
            <div className="relative group max-w-2xl">

              <div className="absolute -inset-1 bg-gradient-to-r from-[#786BD4] to-blue-500 rounded-2xl blur opacity-10 group-focus-within:opacity-30 transition duration-1000"></div>

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="搜索角色 / 标签 / 人设..."
                className="relative w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-[#786BD4]/50 backdrop-blur-md transition-all placeholder:text-white/10"
              />

            </div>

          </div>

          {/* 卡片区 */}
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">

            {loading ? (
              [1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="aspect-[3/4] bg-white/5 animate-pulse rounded-3xl"
                />
              ))
            ) : (
              <>
                {characters
                  .filter((c) =>
                    c.name?.toLowerCase().includes(search.toLowerCase()) ||
                    c.description?.toLowerCase().includes(search.toLowerCase()) ||
                    c.tags?.some((tag: string) =>
                      tag.toLowerCase().includes(search.toLowerCase())
                    )
                  )
                  .map((c) => (
                    <div
                      key={c.id}
                      onClick={() => router.push(`/character/${c.id}`)}
                      className="
                      group
                      relative
                      cursor-pointer
                      aspect-[3/4]
                      rounded-3xl
                      overflow-hidden
                      bg-[#0a0a0f]
                      border
                      border-white/5
                      hover:border-[#786BD4]/50
                      transition-all
                      duration-700
                      hover:-translate-y-2
                      hover:shadow-[0_0_50px_rgba(120,107,212,0.15)]
                      "
                    >

                      {/* 图片 */}
                      <div className="w-full h-full relative overflow-hidden">

                        {c.avatar ? (
                          <img
                            src={c.avatar}
                            className="
                            w-full
                            h-full
                            object-cover
                            transition-all
                            duration-1000
                            group-hover:scale-110
                            opacity-70
                            group-hover:opacity-100
                            "
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white/10 font-black text-5xl italic">
                            NULL
                          </div>
                        )}

                        {/* 遮罩 */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent"></div>

                        {/* hover 光 */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-1000 bg-[#786BD4]/10"></div>

                        {/* 内容 */}
                        <div className="absolute bottom-0 left-0 p-6 w-full transform translate-y-2 group-hover:translate-y-0 transition-all duration-500">

                          <div className="text-[10px] text-[#786BD4] font-black tracking-[0.3em] mb-2 uppercase opacity-0 group-hover:opacity-100 transition duration-700">
                            Initialize_Link
                          </div>

                          <div className="font-black text-xl text-white mb-2 tracking-tight">
                            {c.name}
                          </div>

                          {/* 标签 */}
                          <div className="flex flex-wrap gap-2 mb-3">

                            {c.tags?.slice(0, 3).map((tag: string, index: number) => (
                              <div
                                key={index}
                                className="
                                px-2 py-1
                                rounded-full
                                bg-white/10
                                backdrop-blur-md
                                border
                                border-white/10
                                text-[9px]
                                tracking-wide
                                text-white/70
                                "
                              >
                                #{tag}
                              </div>
                            ))}

                          </div>

                          {/* 描述 */}
                          <div className="text-[11px] text-white/40 line-clamp-2 leading-relaxed">
                            {c.description}
                          </div>

                        </div>

                      </div>

                    </div>
                  ))}

                {/* 创建卡 */}
                <div
                  onClick={() => router.push("/create")}
                  className="
                  group
                  aspect-[3/4]
                  rounded-3xl
                  border
                  border-dashed
                  border-white/10
                  flex
                  flex-col
                  items-center
                  justify-center
                  gap-5
                  hover:border-[#786BD4]/50
                  hover:bg-[#786BD4]/5
                  transition-all
                  cursor-pointer
                  "
                >

                  <div className="w-14 h-14 rounded-full border border-white/10 flex items-center justify-center group-hover:border-[#786BD4] group-hover:text-[#786BD4] transition-all">
                    <span className="text-3xl font-light">
                      +
                    </span>
                  </div>

                  <div className="text-[10px] tracking-[0.3em] uppercase text-white/20 font-black group-hover:text-white transition-all">
                    Create Character
                  </div>

                </div>
              </>
            )}

          </div>

        </div>

      </div>

      {/* 手机导航 */}
      <div className="md:hidden fixed bottom-6 left-6 right-6 h-16 rounded-2xl border border-white/10 bg-black/80 backdrop-blur-2xl flex justify-around items-center z-50">

        {[
          { label: "首页", path: "/" },
          { label: "聊天", path: "/chat" },
          { label: "创建", path: "/create" },
          { label: "个人", path: "/profile" },
        ].map((item) => (
          <button
            key={item.path}
            onClick={() => router.push(item.path)}
            className="text-[10px] font-black tracking-widest text-white/40 hover:text-[#786BD4] uppercase transition-colors"
          >
            {item.label}
          </button>
        ))}

      </div>

    </div>
  );
}
