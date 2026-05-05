'use client';

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ProfilePage() {
  const [name, setName] = useState("");
  const [uid, setUid] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [cards, setCards] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) return;

      setUid(data.user.id);
      setEmail(data.user.email || "");

      const { data: profile } = await supabase
        .from("users")
        .select("*")
        .eq("auth_id", data.user.id)
        .single();

      if (profile) {
        setName(profile.name || data.user.email?.split("@")[0] || "SUBJECT_00");
        setAvatar(profile.avatar || null);
      }

      const { data: myCards } = await supabase
        .from("characters")
        .select("*")
        .eq("owner_id", data.user.id)
        .order("created_at", { ascending: false });

      setCards(myCards || []);
      setLoading(false);
    };
    init();
  }, []);

  const saveName = async () => {
    setSaving(true);
    const { data } = await supabase.auth.getUser();
    if (data.user) {
      await supabase
        .from("users")
        .update({ name })
        .eq("auth_id", data.user.id);
    }
    setTimeout(() => setSaving(false), 1000); // 模拟触觉反馈
  };

  const handleAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      setAvatar(base64);
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        await supabase
          .from("users")
          .update({ avatar: base64 })
          .eq("auth_id", data.user.id);
      }
    };
    reader.readAsDataURL(file);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-1 h-12 bg-[#786BD4] animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050508] text-white/90 selection:bg-[#786BD4]/30">
      <div className="max-w-6xl mx-auto px-6 py-20">
        
        {/* 系统装饰背景 */}
        <div className="fixed inset-0 pointer-events-none opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
        
        <div className="relative z-10 grid lg:grid-cols-12 gap-16">

          {/* 左侧：IDENTITY_NODE */}
          <div className="lg:col-span-4 space-y-10">
          <div className="relative group w-fit mx-auto lg:mx-0">
          <label className="cursor-pointer block">
          <div className="w-40 h-40 rounded-full border border-white/10 p-2 group-hover:border-[#786BD4]/50 transition-all duration-700">
          <div className="w-full h-full rounded-full bg-[#111] overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-700">
          {avatar ? (
          <img src={avatar} className="w-full h-full object-cover" />
          ) : (
          <div className="w-full h-full flex items-center justify-center text-[10px] tracking-widest text-white/10">NULL_IMG</div>
          )}
          </div>
          </div>
          <input type="file" hidden onChange={handleAvatar} />
          </label>
          <div className="absolute -bottom-2 -right-2 bg-[#786BD4] text-black text-[9px] font-black px-2 py-1 tracking-widest uppercase">Update</div>
          </div>

          <div className="space-y-6 pt-6">
          <div className="space-y-1">
          <div className="text-[10px] tracking-[0.4em] text-white/20 font-black uppercase">Subject_Identifier</div>
          <div className="text-sm font-mono text-[#786BD4] opacity-80">ID: {uid.slice(0, 16).toUpperCase()}</div>
          <div className="text-[10px] text-white/20 font-mono">{email}</div>
          </div>

          <div className="space-y-4">
          <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-transparent border-b border-white/10 py-3 text-xl font-light focus:outline-none focus:border-[#786BD4] transition-all placeholder:text-white/5"
          placeholder="Insert Alias..."
          />
          <button
          onClick={saveName}
          disabled={saving}
          className="w-full group relative overflow-hidden h-12 bg-white text-black text-[10px] font-black tracking-[0.3em] uppercase hover:bg-[#786BD4] hover:text-white transition-all duration-500"
          >
          <span className="relative z-10">{saving ? "Syncing..." : "Sync_Changes"}</span>
          </button>
          </div>
          </div>
          </div>

          {/* 右侧：NEURAL_ASSETS */}
          <div className="lg:col-span-8">
          <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-4">
          <div className="w-8 h-px bg-[#786BD4]"></div>
          <div className="text-[11px] font-black tracking-[0.5em] text-white/40 uppercase">My_Created_Protocols</div>
          </div>
          <div className="text-[10px] font-mono text-white/10">COUNT: {cards.length}</div>
          </div>

          {cards.length === 0 ? (
          <div className="h-64 flex items-center justify-center border border-dashed border-white/5 rounded-2xl">
          <div className="text-[10px] tracking-[0.3em] text-white/20 uppercase font-black">No_Assets_Found</div>
          </div>
          ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {cards.map((c) => (
          <div
          key={c.id}
          className="group relative bg-[#0a0a0f] border border-white/5 rounded-2xl overflow-hidden hover:border-[#786BD4]/30 transition-all duration-700"
          >
          <div className="h-48 overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-1000">
          <img
          src={c.avatar || "/placeholder.png"}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
          />
          </div>
          <div className="p-6">
          <div className="flex justify-between items-start mb-2">
          <div className="font-bold text-lg tracking-tight group-hover:text-[#786BD4] transition-colors">{c.name}</div>
          <div className="text-[8px] bg-white/5 px-2 py-0.5 text-white/30 uppercase">Active</div>
          </div>
          <div className="text-xs text-white/40 font-light line-clamp-2 leading-relaxed tracking-tight">
          {c.description}
          </div>
          </div>
          </div>
          ))}
          </div>
          )}
          </div>

        </div>
      </div>
    </div>
  );
}