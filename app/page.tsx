'use client';

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { upsertUser } from "@/lib/user";

export default function Home() {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const cards = [
    { id: 1, title: "冷淡总裁", desc: "强势 / 简短 / 压迫感" },
    { id: 2, title: "温柔学长", desc: "体贴 / 安抚 / 轻声" },
    { id: 3, title: "毒舌朋友", desc: "嘴毒但心软" },
  ];

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      const { data } = await supabase.auth.getUser();

      if (!mounted) return;

      if (!data.user) {
        router.replace("/login"); // ✅ 不用 push
        return;
      }

      await upsertUser(data.user);
    };

    init();

    return () => {
      mounted = false;
    };
  }, [router]);

  return (
    <div className="min-h-screen flex bg-white text-black">

      {/* 左侧导航 */}
      <div className="hidden md:flex w-48 border-r flex-col p-4 gap-3">
        <button onClick={() => router.push("/")}>首页</button>
        <button onClick={() => router.push("/chat")}>聊天</button>
        <button onClick={() => router.push("/create")}>创建角色</button>
        <button onClick={() => router.push("/profile")}>个人</button>
        <button onClick={() => router.push("/recharge")}>充值</button>
      </div>

      {/* 主内容 */}
      <div className="flex-1 p-6">

        <div className="max-w-4xl mx-auto mb-6">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索角色 / 对话..."
            className="w-full px-4 py-3 rounded-xl border bg-gray-50 outline-none"
          />
        </div>

        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-3 gap-4">

          {cards.map((c) => (
            <div
              key={c.id}
              onClick={() => router.push(`/chat/${c.id}`)}
              className="cursor-pointer rounded-2xl border hover:shadow-md transition bg-white overflow-hidden"
            >
              <div className="aspect-[3/4] bg-gray-200 flex items-center justify-center text-gray-400">
                Image
              </div>

              <div className="p-3">
                <div className="font-semibold">{c.title}</div>
                <div className="text-sm text-gray-500">{c.desc}</div>
              </div>
            </div>
          ))}

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