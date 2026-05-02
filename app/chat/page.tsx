'use client';

import { useRouter } from "next/navigation";

export default function ChatListPage() {
  const router = useRouter();

  const chats = [
    { id: 1, name: "冷淡总裁", last: "我不喜欢重复问题。" },
    { id: 2, name: "温柔学长", last: "今天还好吗？" },
    { id: 3, name: "毒舌朋友", last: "你这逻辑有点离谱。" },
  ];

  return (
    <div className="min-h-screen bg-white">

      {/* 顶部 */}
      <div className="p-4 border-b font-medium">
        最近聊天
      </div>

      {/* 列表 */}
      <div className="p-4 space-y-3">

        {chats.map((c) => (
          <div
            key={c.id}
            onClick={() => router.push(`/chat/${c.id}`)}
            className="flex items-center gap-3 p-3 border rounded-xl hover:bg-gray-50 cursor-pointer"
          >

            {/* 头像占位 */}
            <div className="w-12 h-12 rounded-full bg-gray-200" />

            {/* 内容 */}
            <div className="flex-1">
              <div className="font-medium">{c.name}</div>
              <div className="text-sm text-gray-500 truncate">
                {c.last}
              </div>
            </div>

          </div>
        ))}

      </div>

      {/* 底部按钮（创建新聊天） */}
      <div className="fixed bottom-5 right-5">
        <button
          onClick={() => router.push("/")}
          className="bg-black text-white px-4 py-2 rounded-full text-sm"
        >
          + 新聊天
        </button>
      </div>

    </div>
  );
}

