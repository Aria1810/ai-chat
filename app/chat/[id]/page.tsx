'use client';

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

type Message = { role: "user" | "ai"; text: string };
type Character = {
  id: string;
  name: string;
  description?: string | null;
  avatar?: string | null;
  opening_message?: string | null;
  chat_style?: string | null;
};

function safeTheme(style: string | null | undefined) {
  const value = style || "";
  if (/[{}<@]|url\s*\(/i.test(value)) return {};
  return Object.fromEntries(
    value
      .split(";")
      .map((item) => item.split(":"))
      .filter(([property, ...parts]) => property.trim() && parts.length)
      .map(([property, ...parts]) => [property.trim(), parts.join(":").trim()]),
  ) as React.CSSProperties;
}

function backgroundOverlay(style: React.CSSProperties) {
  const raw = style["--chat-background-opacity" as keyof React.CSSProperties];
  const value = typeof raw === "string" ? Number.parseFloat(raw) : 55;
  const opacity = Number.isFinite(value) ? Math.min(100, Math.max(0, value)) : 55;
  return (1 - opacity / 200).toFixed(2);
}

export default function ChatPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<User | null>(null);
  const [character, setCharacter] = useState<Character | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [model, setModel] = useState("gpt");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [liked, setLiked] = useState(false);
  const [favorited, setFavorited] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return router.replace("/login");
      userRef.current = user;

      const [{ data: char }, { data: rows }, { data: like }, { data: favorite }] = await Promise.all([
        supabase.from("characters").select("*").eq("id", id).single(),
        supabase.from("messages").select("role,content,conversation_id,created_at").eq("user_id", user.id).eq("character_id", id).order("created_at", { ascending: false }).limit(100),
        supabase.from("likes").select("*").eq("user_id", user.id).eq("character_id", id).maybeSingle(),
        supabase.from("favorites").select("*").eq("user_id", user.id).eq("character_id", id).maybeSingle(),
      ]);

      setCharacter(char as Character | null);
      const latestConversation = rows?.[0]?.conversation_id || null;
      setConversationId(latestConversation);
      setMessages((rows || []).filter((row) => (row.conversation_id || null) === latestConversation).reverse().map((row) => ({ role: row.role as Message["role"], text: row.content })));
      setLiked(Boolean(like));
      setFavorited(Boolean(favorite));
    })();
  }, [id, router]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const requestReply = async (message: string, regenerate = false) => {
    if (loading) return;
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return setError("登录已失效，请重新登录。");

    setLoading(true);
    setError("");
    if (regenerate) setMessages((items) => items.slice(0, -1));
    else {
      setMessages((items) => [...items, { role: "user", text: message }]);
      setInput("");
    }

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ message, model, character_id: id, conversation_id: conversationId, regenerate }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "生成失败");
      setMessages((items) => [...items, { role: "ai", text: data.reply }]);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "发送失败");
    } finally {
      setLoading(false);
    }
  };

  const regenerate = () => {
    const lastUserMessage = [...messages].reverse().find((message) => message.role === "user");
    if (lastUserMessage) void requestReply(lastUserMessage.text, true);
  };

  const newConversation = () => {
    setConversationId(crypto.randomUUID());
    setMessages([]);
    setError("");
  };

  const toggle = async (table: "likes" | "favorites", active: boolean, setActive: (value: boolean) => void) => {
    const user = userRef.current;
    if (!user) return;
    const query = active
      ? supabase.from(table).delete().eq("user_id", user.id).eq("character_id", id)
      : supabase.from(table).insert({ user_id: user.id, character_id: id });
    const { error: toggleError } = await query;
    if (toggleError) return setError(toggleError.message);
    setActive(!active);
  };

  if (!character) return <main className="grid h-screen place-items-center bg-[#050508] text-xs tracking-[.4em] text-[#a99cff]">INITIALIZING…</main>;

  const cardTheme = safeTheme(character.chat_style);
  const cover = character.avatar?.replace(/"/g, "\\\"");
  const overlay = backgroundOverlay(cardTheme);

  return (
    <main className="chat-shell character-chat-theme" style={{ ...cardTheme, backgroundColor: "#050508", backgroundImage: cover ? `linear-gradient(rgba(4, 6, 12, ${overlay}), rgba(4, 6, 12, ${overlay})), url("${cover}")` : undefined, backgroundPosition: "center", backgroundSize: "cover", backgroundAttachment: "fixed" }}>
      <header className="chat-header">
        <div className="chat-character">
          <img src={character.avatar || "/placeholder.png"} alt="" className="chat-character-avatar" />
          <div className="chat-character-copy">
            <h1>{character.name}</h1>
            <p>{character.description}</p>
          </div>
        </div>
        <div className="chat-toolbar">
          <label className="sr-only" htmlFor="chat-model">选择模型</label>
          <select id="chat-model" value={model} onChange={(event) => setModel(event.target.value)} className="chat-control chat-model">
            <option value="gpt">GPT-4o mini</option><option value="gemini">Gemini Flash</option><option value="deepseek">DeepSeek Chat</option>
          </select>
          <button onClick={() => void toggle("likes", liked, setLiked)} className="chat-control">{liked ? "✦ 已喜欢" : "✧ 喜欢"}</button>
          <button onClick={() => void toggle("favorites", favorited, setFavorited)} className="chat-control">{favorited ? "◇ 已收藏" : "◇ 收藏"}</button>
        </div>
      </header>

      <section className="chat-session-bar" aria-label="对话操作">
        <span className="chat-chip">当前模型：{model}</span>
        <button onClick={newConversation} className="chat-session-action">＋ 开启新对话</button>
        <button disabled={loading || !messages.some((message) => message.role === "ai")} onClick={regenerate} className="chat-session-action">↻ 重新生成</button>
      </section>

      <div ref={scrollRef} className="chat-scroll">
        <div className="chat-thread">
          {character.opening_message && <section className="chat-opening"><p>SCENE / 开场</p>{character.opening_message}</section>}
          {!messages.length && <p className="chat-empty">从这里开始你们的故事。</p>}
          {messages.map((message, index) => (
            <div key={index} className={`chat-message chat-message--${message.role}`}>
              <div className="chat-bubble">{message.text}</div>
            </div>
          ))}
          {loading && <div className="chat-thinking"><span><i /><i /><i /></span>{character.name} 正在组织回复…</div>}
          {error && <p role="alert" className="chat-error">{error}</p>}
        </div>
      </div>

      <footer className="chat-composer">
        <div className="chat-composer-inner">
          <textarea value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); if (input.trim()) void requestReply(input.trim()); } }} placeholder="输入消息，Enter 发送 / Shift + Enter 换行" className="chat-input" />
          <button disabled={loading || !input.trim()} onClick={() => void requestReply(input.trim())} className="chat-send">发送</button>
        </div>
      </footer>
    </main>
  );
}
