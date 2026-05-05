'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function ChatListPage() {
  const router = useRouter();
  const [chats, setChats] = useState<any[]>([]);

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) return;

      const user_id = data.user.id;

      // 🔥 最近聊天 = messages join characters
      const { data: msgs } = await supabase
        .from("messages")
        .select("character_id, content, created_at, characters(name)")
        .eq("user_id", user_id)
        .order("created_at", { ascending: false });

      // 去重（每个角色只显示一条）
      const map = new Map();

      msgs?.forEach((m: any) => {
        if (!map.has(m.character_id)) {
          map.set(m.character_id, {
            id: m.character_id,
            name: m.characters?.name || "未知角色",
            last: m.content,
          });
        }
      });

      setChats(Array.from(map.values()));
    };

    init();
  }, []);

  return (
    <div className="min-h-screen bg-white">

      <div className="p-4 border-b font-medium">
        最近聊天
      </div>

      <div className="p-4 space-y-3">

        {chats.map((c) => (
          <div
            key={c.id}
            onClick={() => router.push(`/chat/${c.id}`)}
            className="flex items-center gap-3 p-3 border rounded-xl hover:bg-gray-50 cursor-pointer"
          >

            <div className="w-10 h-10 rounded-full bg-gray-200" />

            <div className="flex-1">
              <div className="font-medium">{c.name}</div>
              <div className="text-sm text-gray-500 truncate">
                {c.last}
              </div>
            </div>

          </div>
        ))}

      </div>

    </div>
  );
}