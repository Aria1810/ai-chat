'use client';

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

type ChatMessage = { role: "user" | "ai"; text: string };
type Character = { id: string; name: string; description?: string | null; avatar?: string | null };

export default function ChatPage() {
  const params = useParams();
  const id = params?.id;

  const scrollRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [model, setModel] = useState("gpt");
  const [liked, setLiked] = useState(false);
  const [favorited, setFavorited] = useState(false);
  const [character, setCharacter] = useState<Character | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const userRef = useRef<User | null>(null);

  // ======================
  // 初始化
  // ======================
  useEffect(() => {
    if (!id) return;

    const load = async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      userRef.current = user.user;

      const user_id = user.user.id;

      // 角色
      const { data: char } = await supabase
        .from("characters")
        .select("*")
        .eq("id", id)
        .single();

      setCharacter(char as Character | null);

      // 历史消息（记忆）
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

      // like / fav
      const { data: like } = await supabase
        .from("likes")
        .select("*")
        .eq("user_id", user_id)
        .eq("character_id", id)
        .maybeSingle();

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

  // 自动滚动
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  // ======================
  // 发送消息（核心修复）
  // ======================
  const send = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input;
    setInput("");
    setLoading(true);

    const user = userRef.current;
    if (!user) return;

    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;
    if (!token) {
      setError("登录已失效，请重新登录。");
      setLoading(false);
      return;
    }

    // 先显示用户消息
    setMessages((prev) => [
      ...prev,
      { role: "user", text: userMsg },
    ]);

    setError("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: userMsg,
          model,
          character_id: id,
        }),
      });

      const dataAI = await res.json();
      if (!res.ok || !dataAI.reply) {
        throw new Error(dataAI.error || "暂时无法获得回复，请稍后重试。");
      }

      setMessages((prev) => [...prev, { role: "ai", text: dataAI.reply }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "发送失败，请稍后重试。");
    } finally {
      setLoading(false);
    }
  };

  // ======================
  // like / fav（不变）
  // ======================
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
      await supabase
        .from("likes")
        .insert({ user_id, character_id: id });
    }

    setLiked(!liked);
  };

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
      await supabase
        .from("favorites")
        .insert({ user_id, character_id: id });
    }

    setFavorited(!favorited);
  };

  // ======================
  // loading
  // ======================
  if (!character)
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <div className="text-[10px] tracking-[0.5em] text-[#786BD4] animate-pulse uppercase">
          Initialize_Neural_Link
        </div>
      </div>
    );

  // ======================
  // UI（完全不动）
  // ======================
  return (
    <div className="h-screen flex flex-col bg-[#050508] text-white/90 font-sans">

      {/* 顶部 */}
      <header className="flex items-center gap-6 p-6 border-b border-white/5 bg-black/40 backdrop-blur-2xl z-20">
        <div className="relative group">
          <div className="absolute -inset-1 bg-[#786BD4] rounded-full blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
          <img src={character.avatar || "/placeholder.png"} alt="" className="relative w-12 h-12 rounded-full object-cover border border-white/10" />
        </div>

        <div className="flex-1">
          <div className="font-black text-lg uppercase">{character.name}</div>
          <div className="text-[9px] text-white/30 uppercase">
            {character.description}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button onClick={toggleLike}>{liked ? "✦" : "✧"}</button>
          <button onClick={toggleFavorite}>{favorited ? "◈" : "◇"}</button>

          <select value={model} onChange={(e) => setModel(e.target.value)}>
            <option value="gpt">GPT</option>
            <option value="gemini">Gemini</option>
            <option value="deepseek">DeepSeek</option>
          </select>
        </div>
      </header>

      {/* 消息区 */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-8">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className="max-w-[80%] px-6 py-4 rounded-2xl bg-white/5">
              {m.text}
            </div>
          </div>
        ))}

        {loading && (
          <div className="text-white/40">typing...</div>
        )}
        {error && <div className="text-sm text-red-300" role="alert">{error}</div>}
      </div>

      {/* 输入 */}
      <footer className="p-8 border-t border-white/5">
        <div className="flex gap-4">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" &&
              !e.shiftKey &&
              (e.preventDefault(), send())
            }
            className="flex-1 bg-white/5 p-4 rounded-2xl"
          />

          <button onClick={send} className="px-4 py-2 bg-white text-black rounded-xl">
            send
          </button>
        </div>
      </footer>

    </div>
  );
}
