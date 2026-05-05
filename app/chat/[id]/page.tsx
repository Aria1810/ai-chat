'use client';

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function ChatPage() {
  const params = useParams();
  const id = params?.id;

  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [model, setModel] = useState("gpt");

  const [liked, setLiked] = useState(false);
  const [favorited, setFavorited] = useState(false);
  const [character, setCharacter] = useState<any>(null);

  // =====================
  // 加载角色 + 数据
  // =====================
  useEffect(() => {
    if (!id) return;

    const load = async () => {
      // 角色信息
      const { data: char } = await supabase
        .from("characters")
        .select("*")
        .eq("id", id)
        .single();

      setCharacter(char);

      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const user_id = user.user.id;

      // 消息
      const { data: msgs } = await supabase
        .from("messages")
        .select("*")
        .eq("user_id", user_id)
        .eq("character_id", id)
        .order("created_at", { ascending: true });

      setMessages(
        (msgs || []).map((m) => ({
          role: m.role,
          text: m.content,
        }))
      );

      // like
      const { data: like } = await supabase
        .from("likes")
        .select("*")
        .eq("user_id", user_id)
        .eq("character_id", id)
        .maybeSingle();

      // fav
      const { data: fav } = await supabase
        .from("favorites")
        .select("*")
        .eq("user_id", user_id)
        .eq("character_id", id)
        .maybeSingle();

      setLiked(!!like);
      setFavorited(!!fav);
    };

    load();
  }, [id]);

  // =====================
  // 发送消息
  // =====================
  const send = async () => {
    if (!input.trim()) return;

    const userMsg = input;
    setInput("");

    const { data } = await supabase.auth.getUser();
    if (!data.user) return;

    const user_id = data.user.id;

    await supabase.from("messages").insert({
      user_id,
      character_id: id,
      role: "user",
      content: userMsg,
    });

    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: userMsg,
        model,
        role: id,
      }),
    });

    const dataAI = await res.json();

    await supabase.from("messages").insert({
      user_id,
      character_id: id,
      role: "ai",
      content: dataAI.reply || "...",
    });

    setMessages((prev) => [
      ...prev,
      { role: "ai", text: dataAI.reply || "..." },
    ]);
  };

  // =====================
  // like
  // =====================
  const toggleLike = async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) return;

    const user_id = data.user.id;

    if (liked) {
      await supabase
        .from("likes")
        .delete()
        .eq("user_id", user_id)
        .eq("character_id", id);
    } else {
      await supabase.from("likes").insert({
        user_id,
        character_id: id,
      });
    }

    setLiked(!liked);
  };

  // =====================
  // favorite
  // =====================
  const toggleFavorite = async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) return;

    const user_id = data.user.id;

    if (favorited) {
      await supabase
        .from("favorites")
        .delete()
        .eq("user_id", user_id)
        .eq("character_id", id);
    } else {
      await supabase.from("favorites").insert({
        user_id,
        character_id: id,
      });
    }

    setFavorited(!favorited);
  };

  if (!character) return <div className="p-4">加载中...</div>;

  return (
    <div className="h-screen flex flex-col bg-white">

      {/* 顶部 */}
      <div className="flex items-center gap-3 p-3 border-b">

        <img
          src={character.avatar}
          className="w-10 h-10 rounded-full object-cover"
        />

        <div className="flex-1">
          <div className="font-medium">{character.name}</div>
          <div className="text-xs text-gray-500">
            {character.description}
          </div>
        </div>

        <button onClick={toggleLike}>
          {liked ? "❤️" : "🤍"}
        </button>

        <button onClick={toggleFavorite}>
          {favorited ? "⭐" : "☆"}
        </button>

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

      {/* 输入 */}
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