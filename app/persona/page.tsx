'use client';
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const fields = [
  ["display_name", "称呼", "希望角色如何称呼你"], ["gender", "性别", "可留空"], ["age", "年龄", "可留空"],
  ["background", "背景", "你的身份、经历或世界观"], ["personality", "性格", "性格特点、聊天习惯"], ["preferences", "偏好与边界", "喜欢的话题、避雷项、称呼偏好"],
] as const;
type Persona = Record<(typeof fields)[number][0], string>;
const empty = Object.fromEntries(fields.map(([key]) => [key, ""])) as Persona;

export default function PersonaPage() {
  const router = useRouter(); const [persona, setPersona] = useState<Persona>(empty); const [saving, setSaving] = useState(false); const [notice, setNotice] = useState("");
  useEffect(() => { (async () => { const { data: { user } } = await supabase.auth.getUser(); if (!user) return router.replace("/login"); const { data } = await supabase.from("user_personas").select("*").eq("user_id", user.id).maybeSingle(); if (data) setPersona({ ...empty, ...data }); })(); }, [router]);
  const save = async () => { setSaving(true); const { data: { user } } = await supabase.auth.getUser(); if (user) { const { error } = await supabase.from("user_personas").upsert({ user_id: user.id, ...persona, updated_at: new Date().toISOString() }); setNotice(error ? error.message : "已保存。聊天时会作为你的长期人设。") } setSaving(false); };
  return <main className="min-h-screen bg-[#050508] p-6 text-white"><section className="mx-auto max-w-3xl rounded-[28px] border border-white/10 bg-white/[.025] p-8"><p className="text-xs tracking-[.3em] text-[#a99cff]">USER PERSONA</p><h1 className="mt-2 text-3xl font-black">我的人设</h1><p className="mt-2 text-sm text-white/45">这些信息会与角色设定一起发送，帮助每段对话更贴近你。</p><div className="mt-8 grid gap-5 md:grid-cols-2">{fields.map(([key, label, hint]) => <label key={key} className={key === "background" || key === "personality" || key === "preferences" ? "md:col-span-2" : ""}><span className="text-sm">{label}</span>{key === "background" || key === "personality" || key === "preferences" ? <textarea value={persona[key]} onChange={e => setPersona({ ...persona, [key]: e.target.value })} placeholder={hint} className="mt-2 h-24 w-full rounded-xl border border-white/10 bg-black/25 p-3 outline-none focus:border-[#786BD4]" /> : <input value={persona[key]} onChange={e => setPersona({ ...persona, [key]: e.target.value })} placeholder={hint} className="mt-2 w-full rounded-xl border border-white/10 bg-black/25 p-3 outline-none focus:border-[#786BD4]" />}</label>)}</div>{notice && <p className="mt-4 text-sm text-[#c5bcff]">{notice}</p>}<button disabled={saving} onClick={save} className="mt-7 rounded-xl bg-white px-7 py-3 font-bold text-black hover:bg-[#a99cff]">{saving ? "保存中…" : "保存人设"}</button></section></main>;
}
