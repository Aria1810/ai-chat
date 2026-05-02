'use client';

import { useEffect } from "react";
import { useState } from "react";
import { useParams } from "next/navigation";

export default function ChatPage() {
  const params = useParams();
  const id = params?.id;

const [messages, setMessages] = useState<
  { role: "user" | "ai"; text: string }[]
>([]);

  const [input, setInput] = useState("");
  const [model, setModel] = useState("gpt");

  const send = async () => {
    if (!input.trim()) return;

    const userMsg = input;
    setInput("");
useEffect(() => {
  const saved = localStorage.getItem(`chat_${id}`);
  if (saved) {
    setMessages(JSON.parse(saved));
  }
}, [id]);



    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: userMsg,
        role: id,
        model: model,   // 👈 关键：模型回来了
      }),
    });

    const data = await res.json();

    setMessages((prev) => [
      ...prev,
      { role: "ai", text: data.reply || "..." },
    ]);
    const updated = [
  ...messages,
  { role: "user", text: userMsg },
  { role: "ai", text: data.reply },
];

localStorage.setItem(`chat_${id}`, JSON.stringify(updated));

  };

  return (
    <div className="h-screen flex flex-col bg-white">

      {/* 顶部 */}
      <div className="border-b p-3 flex justify-between items-center text-sm">

        <div>Chat #{id}</div>

        {/* 模型选择 */}
        <select
          value={model}
          onChange={(e) => setModel(e.target.value)}
          className="border px-2 py-1 rounded text-sm"
        >
          <option value="gpt">GPT</option>
          <option value="gemini">Gemini</option>
          <option value="deepseek">DeepSeek</option>
        </select>

      </div>

      {/* 消息区 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">

        {messages.map((m, i) => (
          <div
            key={i}
            className={`max-w-[70%] px-3 py-2 rounded-xl text-sm ${
              m.role === "user"
                ? "ml-auto bg-black text-white"
                : "mr-auto bg-white border"
            }`}
          >
            {m.text}
          </div>
        ))}

      </div>

      {/* 输入区 */}
      <div className="p-3 border-t flex gap-2">

        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 border rounded-lg px-3 py-2 text-sm"
          placeholder="输入消息..."
        />

        <button
          onClick={send}
          className="px-4 py-2 bg-black text-white rounded-lg text-sm"
        >
          发送
        </button>

      </div>

    </div>
  );
}
