'use client';

import { useSearchParams } from "next/navigation";
import { useState } from "react";

const roles = {
  "1": "你是冷淡总裁",
  "2": "你是温柔学长",
  "3": "你是毒舌朋友"
} as const;

export default function ChatPage() {
  const params = useSearchParams();

  const id = (params.get("id") || "1") as keyof typeof roles;
  const rolePrompt = roles[id];

  const [msg, setMsg] = useState("");
  const [reply, setReply] = useState("");

  const send = async () => {
    const res = await fetch("/api/chat", {
      method: "POST",
      body: JSON.stringify({
        message: msg,
        role: id,
        model: "gpt"
      }),
    });

    const data = await res.json();
    setReply(data.reply);
  };

  return (
    <div>
      <h2>聊天页面</h2>

      <p>当前角色：{rolePrompt}</p>

      <input value={msg} onChange={(e) => setMsg(e.target.value)} />

      <button onClick={send}>发送</button>

      <div>{reply}</div>
    </div>
  );
}
