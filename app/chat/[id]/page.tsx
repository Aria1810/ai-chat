'use client';

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function ChatPage() {
  const params = useParams();
  const id = params?.id;
  const scrollRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [model, setModel] = useState("gpt");
  const [liked, setLiked] = useState(false);
  const [favorited, setFavorited] = useState(false);
  const [character, setCharacter] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      const { data: char } = await supabase.from("characters").select("*").eq("id", id).single();
      setCharacter(char);
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;
      const user_id = user.user.id;
      const { data: msgs } = await supabase.from("messages").select("*").eq("user_id", user_id).eq("character_id", id).order("created_at", { ascending: true });
      setMessages((msgs || []).map((m) => ({ role: m.role, text: m.content })));
      const { data: like } = await supabase.from("likes").select("*").eq("user_id", user_id).eq("character_id", id).maybeSingle();
      const { data: fav } = await supabase.from("favorites").select("*").eq("user_id", user_id).eq("character_id", id).maybeSingle();
      setLiked(!!like);
      setFavorited(!!fav);
    };
    load();
  }, [id]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input;
    setInput("");
    const { data } = await supabase.auth.getUser();
    if (!data.user) return;
    const user_id = data.user.id;

    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setLoading(true);

    await supabase.from("messages").insert({ user_id, character_id: id, role: "user", content: userMsg });

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: userMsg, model, role: id }),
    });

    const dataAI = await res.json();
    const aiReply = dataAI.reply || "SIGNAL_LOST_RETRYING...";

    await supabase.from("messages").insert({ user_id, character_id: id, role: "ai", content: aiReply });
    setMessages((prev) => [...prev, { role: "ai", text: aiReply }]);
    setLoading(false);
  };

  const toggleLike = async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) return;
    const user_id = data.user.id;
    if (liked) {
      await supabase.from("likes").delete().eq("user_id", user_id).eq("character_id", id);
    } else {
      await supabase.from("likes").insert({ user_id, character_id: id });
    }
    setLiked(!liked);
  };

  const toggleFavorite = async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) return;
    const user_id = data.user.id;
    if (favorited) {
      await supabase.from("favorites").delete().eq("user_id", user_id).eq("character_id", id);
    } else {
      await supabase.from("favorites").insert({ user_id, character_id: id });
    }
    setFavorited(!favorited);
  };

  if (!character) return (
    <div className="h-screen bg-black flex items-center justify-center">
      <div className="text-[10px] tracking-[0.5em] text-[#786BD4] animate-pulse uppercase">Initialize_Neural_Link</div>
    </div>
  );

  return (
    <div className="h-screen flex flex-col bg-[#050508] text-white/90 font-sans">
      {/* 顶部交互栏 */}
      <header className="flex items-center gap-6 p-6 border-b border-white/5 bg-black/40 backdrop-blur-2xl z-20">
        <div className="relative group">
          <div className="absolute -inset-1 bg-[#786BD4] rounded-full blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
          <img src={character.avatar} className="relative w-12 h-12 rounded-full object-cover border border-white/10" />
        </div>
        <div className="flex-1">
          <div className="font-black text-lg tracking-tight text-white uppercase">{character.name}</div>
          <div className="text-[9px] tracking-widest text-white/30 uppercase font-bold">{character.description}</div>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={toggleLike} className={`text-lg transition-all transform active:scale-125 ${liked ? "text-red-500 scale-110" : "text-white/20 hover:text-white"}`}>
          {liked ? "✦" : "✧"}
          </button>
          <button onClick={toggleFavorite} className={`text-lg transition-all transform active:scale-125 ${favorited ? "text-yellow-500 scale-110" : "text-white/20 hover:text-white"}`}>
          {favorited ? "◈" : "◇"}
          </button>
          <select value={model} onChange={(e) => setModel(e.target.value)} className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg text-[9px] font-black tracking-widest uppercase text-white/60 focus:outline-none focus:border-[#786BD4]/50">
          <option value="gpt">Engine: GPT</option>
          <option value="gemini">Engine: Gemini</option>
          <option value="deepseek">Engine: DeepSeek</option>
          </select>
        </div>
      </header>

      {/* 沉浸式流式消息 */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 md:p-12 space-y-8 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat custom-scrollbar">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-500`}>
          <div className={`max-w-[80%] md:max-w-[65%] text-sm leading-relaxed px-6 py-4 rounded-2xl ${
          m.role === "user"
          ? "bg-[#786BD4] text-black font-medium rounded-tr-none shadow-[0_0_20px_rgba(120,107,212,0.2)]"
          : "bg-white/5 text-white/80 border border-white/5 rounded-tl-none backdrop-blur-md"
          }`}>
          {m.text}
          </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
          <div className="bg-white/5 px-6 py-4 rounded-2xl rounded-tl-none border border-white/5">
          <div className="flex gap-1">
          <div className="w-1.5 h-1.5 bg-[#786BD4] rounded-full animate-bounce"></div>
          <div className="w-1.5 h-1.5 bg-[#786BD4] rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-1.5 h-1.5 bg-[#786BD4] rounded-full animate-bounce [animation-delay:-0.5s]"></div>
          </div>
          </div>
          </div>
        )}
      </div>

      {/* 极简操控输入台 */}
      <footer className="p-8 border-t border-white/5 bg-black/20 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto flex gap-6 items-end group">
          <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), send())}
          className="flex-1 bg-white/5 border-none px-6 py-4 rounded-2xl text-white placeholder-white/10 focus:ring-1 focus:ring-[#786BD4]/50 transition-all text-sm resize-none"
          placeholder="Pulse command here..."
          rows={1}
          />
          <button onClick={send} className="h-12 w-12 rounded-2xl bg-white text-black flex items-center justify-center hover:bg-[#786BD4] hover:text-white transition-all duration-500 shadow-xl active:scale-95">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>
      </footer>
    </div>
  );
}