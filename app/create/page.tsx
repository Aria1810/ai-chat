'use client';

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function CreateCharacter() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [persona, setPersona] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const handleAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setAvatar(reader.result as string);
    reader.readAsDataURL(file);
  };

  const create = async () => {
    if (!name || creating) return;
    setCreating(true);
    
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    /* 优化后的神经网络指引逻辑 */
    const structuredPrompt = {
      identity: name,
      visual_aspect: desc,
      core_temperament: persona,
      directive: "Strict_Roleplay_Mode_Active",
      protocol_level: "Alpha_01"
    };

    const { error } = await supabase
      .from("characters")
      .insert({
        name,
        description: desc,
        prompt: JSON.stringify(structuredPrompt),
        avatar,
        owner_id: userData.user.id
      });

    if (error) {
      console.error("Link_Failed:", error.message);
      setCreating(false);
      return;
    }

    router.push("/");
  };

  return (
    <div className="min-h-screen bg-[#020205] text-white/90 selection:bg-[#786BD4]/30 flex items-center justify-center p-6">
      
      <div className="relative w-full max-w-2xl bg-black/40 backdrop-blur-3xl border border-white/5 rounded-[40px] p-12 overflow-hidden">
        
        {/* 背景装饰 */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#786BD4]/10 blur-[80px] rounded-full"></div>

        <header className="mb-12">
          <div className="text-[10px] tracking-[0.5em] text-[#786BD4] font-black uppercase mb-2">Node_Initialization</div>
          <h1 className="text-3xl font-black italic tracking-tighter uppercase">Create_Entity</h1>
        </header>

        <div className="grid md:grid-cols-2 gap-12">
          
          {/* 视觉载体上传 */}
          <div className="space-y-6">
          <label className="group relative block w-48 h-48 mx-auto cursor-pointer">
          <div className="absolute inset-0 border-2 border-dashed border-white/10 rounded-full group-hover:border-[#786BD4]/50 transition-all duration-700 animate-[spin_10s_linear_infinite]"></div>
          <div className="absolute inset-2 rounded-full bg-[#111] overflow-hidden grayscale hover:grayscale-0 transition-all duration-700">
          {avatar ? (
          <img src={avatar} className="w-full h-full object-cover scale-110" />
          ) : (
          <div className="w-full h-full flex items-center justify-center">
          <span className="text-[10px] tracking-widest text-white/20 font-bold uppercase">Upload_Visual</span>
          </div>
          )}
          </div>
          <input type="file" hidden onChange={handleAvatar} />
          </label>
          <p className="text-center text-[9px] text-white/20 font-mono tracking-widest uppercase">Resolution: Optimized_600px</p>
          </div>

          {/* 属性注入区 */}
          <div className="space-y-6">
          <div className="space-y-4">
          <input
          placeholder="Identity_Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-transparent border-b border-white/10 py-3 text-sm focus:outline-none focus:border-[#786BD4] transition-all placeholder:text-white/5"
          />
          <input
          placeholder="Physical_Description"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          className="w-full bg-transparent border-b border-white/10 py-3 text-sm focus:outline-none focus:border-[#786BD4] transition-all placeholder:text-white/5"
          />
          <textarea
          placeholder="Psychological_Persona"
          value={persona}
          onChange={(e) => setPersona(e.target.value)}
          className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 h-32 text-sm focus:outline-none focus:border-[#786BD4]/50 transition-all placeholder:text-white/5 resize-none"
          />
          </div>

          <button
          onClick={create}
          disabled={creating}
          className="w-full group relative h-14 overflow-hidden rounded-2xl bg-white text-black transition-all duration-500 hover:bg-[#786BD4] hover:text-white"
          >
          <div className="absolute inset-0 bg-[#786BD4] translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
          <span className="relative z-10 text-[10px] font-black tracking-[0.4em] uppercase">
          {creating ? "Transmitting..." : "Initialize_Entity"}
          </span>
          </button>
          </div>

        </div>

        <div className="mt-12 pt-8 border-t border-white/5 text-right">
          <span className="text-[8px] font-mono text-white/10 tracking-[0.3em]">C_PROTOCOL // SUBJECT_GENESIS</span>
        </div>

      </div>

    </div>
  );
}