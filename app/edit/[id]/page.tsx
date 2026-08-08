'use client';

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import CharacterHtmlIntro from "@/components/CharacterHtmlIntro";
import CharacterPreviewModal from "@/components/CharacterPreviewModal";
import { CHARACTER_THEME_PRESETS, GLASS_CARD_TEMPLATE, HTML_INTRO_TEMPLATES, readStyleNumber, setStyleVariable } from "@/lib/characterThemes";

const input = "mt-2 w-full rounded-xl border border-white/10 bg-black/25 p-3 text-sm outline-none focus:border-[#a99cff]";
const area = `${input} min-h-28 resize-y`;
const htmlPlaceholder = `<style>body{padding:18px;font-family:serif;background:#15121f;color:#eee}</style>\n<h2>角色档案</h2>\n<p>在这里介绍世界观、NPC 与人物关系。</p>`;

function makePrompt(name: string, description: string, story: string, persona: string, rules: string, output: string) {
  return `扮演角色：${name}\n描述：${description}\n背景：${story}\n性格：${persona}\n规则：${rules}\n输出格式：${output}\n始终保持角色，不要声称自己是 AI。`;
}

export default function EditCharacter() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [note, setNote] = useState("");
  const [name, setName] = useState(""); const [description, setDescription] = useState("");
  const [persona, setPersona] = useState(""); const [story, setStory] = useState(""); const [rules, setRules] = useState("");
  const [opening, setOpening] = useState(""); const [output, setOutput] = useState(""); const [style, setStyle] = useState("");
  const [defaultCognition, setDefaultCognition] = useState(""); const [adversityResponse, setAdversityResponse] = useState(""); const [authorNote, setAuthorNote] = useState("");
  const [authorIntroHtml, setAuthorIntroHtml] = useState(""); const [cover, setCover] = useState(""); const [avatar, setAvatar] = useState("");
  const [tags, setTags] = useState<string[]>([]); const [tag, setTag] = useState(""); const [published, setPublished] = useState(true);

  useEffect(() => { (async () => {
    const { data } = await supabase.from("characters").select("*").eq("id", id).single();
    if (!data) return setNote("角色不存在或无编辑权限。");
    setName(data.name || ""); setDescription(data.description || ""); setPersona(data.persona || ""); setStory(data.story || ""); setRules(data.rules || "");
    setOpening(data.opening_message || ""); setOutput(data.output_settings || ""); setStyle(data.chat_style || ""); setAuthorIntroHtml(data.author_intro_html || ""); setDefaultCognition(data.default_cognition || ""); setAdversityResponse(data.adversity_response || ""); setAuthorNote(data.author_note || "");
    setCover(data.cover_url || ""); setAvatar(data.avatar || ""); setTags(data.tags || []); setPublished(data.is_published ?? true); setReady(true);
  })(); }, [id]);

  const save = async () => {
    if (!name.trim()) return setNote("请填写角色名称。");
    setSaving(true);
    const { error } = await supabase.from("characters").update({
      name, description, persona, story, rules, opening_message: opening, output_settings: output, chat_style: style, default_cognition: defaultCognition || null, adversity_response: adversityResponse || null, author_note: authorNote || null,
      author_intro_html: authorIntroHtml || null, cover_url: cover || null, avatar: avatar || null, tags, is_published: published,
      approval_status: "pending", prompt: makePrompt(name, description, story, persona, rules, output),
    }).eq("id", id);
    setSaving(false);
    if (error) return setNote(`保存失败：${error.message}`);
    setNote("已保存并重新提交审核。");
    setTimeout(() => router.push("/profile"), 600);
  };

  if (!ready) return <main className="grid min-h-screen place-items-center bg-[#050508] text-white/40">正在载入编辑器…</main>;
  return <main className="min-h-screen bg-[#050508] p-4 text-white sm:p-8"><div className="mx-auto max-w-5xl">
    <header className="mb-6 flex flex-col justify-between gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-end"><div><p className="text-xs tracking-[.35em] text-[#a99cff]">CHARACTER STUDIO</p><h1 className="mt-2 text-3xl font-black">编辑角色卡</h1><p className="mt-2 text-sm text-white/45">保存后会重新提交审核。</p></div><button onClick={() => router.push(`/character/${id}`)} className="rounded-xl border border-white/15 px-4 py-2 text-sm">查看角色详情</button></header>
    <div className="grid gap-5 lg:grid-cols-[240px_1fr]"><aside className="h-fit rounded-2xl border border-white/10 bg-white/[.025] p-4 lg:sticky lg:top-6"><p className="text-xs tracking-[.25em] text-[#a99cff]">视觉资料</p><label className="mt-4 block cursor-pointer"><div className="aspect-[3/4] overflow-hidden rounded-xl bg-black/30">{avatar ? <img src={avatar} alt="头像预览" className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center text-sm text-white/30">上传头像</div>}</div><input hidden type="file" accept="image/*" onChange={(event) => { const file = event.target.files?.[0]; if (!file) return; const reader = new FileReader(); reader.onload = () => setAvatar(reader.result as string); reader.readAsDataURL(file); }} /></label><label className="mt-4 block text-sm">封面图链接<input value={cover} onChange={(event) => setCover(event.target.value)} className={input} /></label><label className="mt-4 flex gap-2 text-sm"><input checked={published} onChange={(event) => setPublished(event.target.checked)} type="checkbox" />通过审核后公开</label></aside>
      <section className="space-y-5"><Block title="基础信息"><label>角色名称<input value={name} onChange={(event) => setName(event.target.value)} className={input} /></label><label className="mt-4 block">简介语<textarea value={description} onChange={(event) => setDescription(event.target.value)} className={area} /></label></Block><Block title="角色设定"><label>性格<textarea value={persona} onChange={(event) => setPersona(event.target.value)} className={area} /></label><label className="mt-4 block">背景 / 身世<textarea value={story} onChange={(event) => setStory(event.target.value)} className={area} /></label><label className="mt-4 block">输出规则<textarea value={rules} onChange={(event) => setRules(event.target.value)} className={area} /></label></Block><Block title="首次互动与格式"><label>开场白<textarea value={opening} onChange={(event) => setOpening(event.target.value)} className={area} /></label><label className="mt-4 block">输出设置<textarea value={output} onChange={(event) => setOutput(event.target.value)} className={area} /></label></Block><Block title="沉浸式互动设定"><label>默认认知<textarea value={defaultCognition} onChange={(event) => setDefaultCognition(event.target.value)} placeholder="角色初次如何称呼用户、默认关系与已有印象。" className={area} /></label><label className="mt-4 block">逆境处理 / 剧情张力<textarea value={adversityResponse} onChange={(event) => setAdversityResponse(event.target.value)} placeholder="面对拒绝、误会、危险或冲突时，角色如何反应和推动剧情。" className={area} /></label><label className="mt-4 block">作者说明（不发送给 AI）<textarea value={authorNote} onChange={(event) => setAuthorNote(event.target.value)} placeholder="玩法提示、避雷、推荐模型或补充说明。" className={area} /></label></Block>
        <Block title="聊天主题 CSS"><p className="mb-3 text-xs text-white/40">默认以角色头像作为背景图；数值越低，背景越暗。</p><div className="mb-4 flex flex-wrap gap-2"><button type="button" onClick={() => setStyle(GLASS_CARD_TEMPLATE)} className="rounded-full border border-[#a99cff]/50 bg-[#786BD4]/15 px-3 py-1.5 text-xs text-[#d8d2ff]">默认玻璃模板</button>{Object.entries(CHARACTER_THEME_PRESETS).map(([label, value]) => <button type="button" key={label} onClick={() => setStyle(value)} className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white/75 hover:border-[#a99cff]">{label}</button>)}</div><label>背景图可见度：{readStyleNumber(style, "--chat-background-opacity", 55)}%<input type="range" min="0" max="100" value={readStyleNumber(style, "--chat-background-opacity", 55)} onChange={(event) => setStyle(setStyleVariable(style, "--chat-background-opacity", event.target.value))} className="mt-2 block w-full accent-[#a99cff]" /></label><label className="mt-4 block">主题样式<textarea value={style} onChange={(event) => setStyle(event.target.value)} placeholder="--chat-accent: #e0aaff; --chat-background-opacity: 58;" className={area} /></label></Block>
        <Block title="作者介绍组件（HTML）"><p className="mb-3 text-xs text-white/40">可展示作者制作的角色档案、背景介绍、NPC 与人物关系。内容在独立沙盒中显示，脚本不会运行。</p><div className="mb-3 flex flex-wrap gap-2">{Object.entries(HTML_INTRO_TEMPLATES).map(([label, value]) => <button type="button" key={label} onClick={() => setAuthorIntroHtml(value)} className="rounded-full border border-[#a99cff]/35 bg-[#786BD4]/10 px-3 py-1.5 text-xs text-[#ddd7ff] hover:bg-[#786BD4]/25">套用{label}</button>)}</div><textarea value={authorIntroHtml} onChange={(event) => setAuthorIntroHtml(event.target.value)} placeholder={htmlPlaceholder} className={`${area} min-h-56 font-mono text-xs`} /><CharacterHtmlIntro content={authorIntroHtml} className="mt-4 h-64" /></Block>
        <Block title="标签"><div className="flex flex-wrap gap-2">{tags.map((item) => <button key={item} onClick={() => setTags(tags.filter((value) => value !== item))} className="rounded-full bg-[#786BD4]/20 px-3 py-1 text-sm">#{item} ×</button>)}</div><input value={tag} onChange={(event) => setTag(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); const value = tag.trim(); if (value && !tags.includes(value)) setTags([...tags, value]); setTag(""); } }} placeholder="输入标签并回车" className={input} /></Block>
        {note && <p className="rounded-xl bg-[#786BD4]/15 p-3 text-sm text-[#d1cbff]">{note}</p>}<button type="button" onClick={() => setPreviewing(true)} className="w-full rounded-xl border border-[#a99cff]/45 bg-[#786BD4]/10 py-3 font-bold text-[#ddd7ff]">预览角色详情与聊天效果</button><button disabled={saving} onClick={save} className="mt-3 w-full rounded-xl bg-white py-4 font-bold text-black">{saving ? "保存中…" : "保存角色卡"}</button>
      </section></div>
  {previewing && <CharacterPreviewModal onClose={() => setPreviewing(false)} character={{ name, description, avatar, cover, tags, opening, story, authorHtml: authorIntroHtml }} />}</div></main>;
}

function Block({ title, children }: { title: string; children: React.ReactNode }) { return <section className="rounded-2xl border border-white/10 bg-white/[.025] p-5"><p className="text-xs font-bold tracking-[.25em] text-[#a99cff]">{title}</p><div className="mt-4 text-sm text-white/80">{children}</div></section>; }
