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

      if (!data.user) {
        router.replace("/login");
        return;
      }

      await upsertUser(data.user);

      // 🔥 关键：拉角色数据
      const { data: chars } = await supabase
        .from("characters")
        .select("*");

      setCharacters(chars || []);
    };

    init();
  }, [router]);

  return (
    <div className="min-h-screen flex bg-[#f6f7fb] text-black">

      {/* 左侧导航 */}
      <div className="hidden md:flex w-56 border-r bg-white/80 backdrop-blur-xl flex-col p-5 gap-3">

        <div className="text-xl font-bold mb-4">AI Matrix</div>

        <button onClick={() => router.push("/")} className="text-left hover:bg-gray-100 p-2 rounded">
          首页
        </button>

        <button onClick={() => router.push("/chat")} className="text-left hover:bg-gray-100 p-2 rounded">
          聊天
        </button>

        <button onClick={() => router.push("/create")} className="text-left hover:bg-gray-100 p-2 rounded">
          创建角色
        </button>

        <button onClick={() => router.push("/profile")} className="text-left hover:bg-gray-100 p-2 rounded">
          个人
        </button>

        <button onClick={() => router.push("/recharge")} className="text-left hover:bg-gray-100 p-2 rounded">
          充值
        </button>

      </div>

      {/* 主内容 */}
      <div className="flex-1 p-6">

        {/* 搜索 */}
        <div className="max-w-5xl mx-auto mb-6">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索角色 / 对话..."
            className="w-full px-4 py-3 rounded-xl border bg-white shadow-sm outline-none focus:ring-2 focus:ring-black/10"
          />
        </div>

        {/* 卡片区 */}
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-3 gap-5">

          {characters
            .filter((c) =>
              c.name?.toLowerCase().includes(search.toLowerCase())
            )
            .map((c) => (
              <div
                key={c.id}
                onClick={() => router.push(`/chat/${c.id}`)}
                className="cursor-pointer rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >

                {/* 图片 */}
                <div className="aspect-[3/4] bg-gray-200 flex items-center justify-center overflow-hidden">
  {c.avatar ? (
    <img src={c.avatar} className="w-full h-full object-cover" />
  ) : (
    <span className="text-gray-400">No Image</span>
  )}
</div>

                {/* 信息 */}
                <div className="p-3">
                  <div className="font-semibold">{c.name}</div>
                  <div className="text-sm text-gray-500">
                    {c.description}
                  </div>
                </div>

              </div>
            ))}

          {/* 空卡 */}
          <div className="rounded-2xl border border-dashed flex items-center justify-center text-gray-400 aspect-[3/4] hover:bg-gray-50 cursor-pointer">
            + 创建角色
          </div>

        </div>

      </div>

      {/* 手机导航 */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 border-t bg-white flex justify-around p-3 text-sm">
        <button onClick={() => router.push("/")}>首页</button>
        <button onClick={() => router.push("/chat")}>聊天</button>
        <button onClick={() => router.push("/create")}>创建</button>
        <button onClick={() => router.push("/profile")}>个人</button>
      </div>

    </div>
  );
}