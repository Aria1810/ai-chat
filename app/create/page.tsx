'use client';

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { CHARACTER_THEME_PRESETS, GLASS_CARD_TEMPLATE, HTML_INTRO_TEMPLATES, readStyleNumber, setStyleVariable } from "@/lib/characterThemes";
import CharacterHtmlIntro from "@/components/CharacterHtmlIntro";
import CharacterPreviewModal from "@/components/CharacterPreviewModal";
import { useRouter } from "next/navigation";

export default function CreateCharacter() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [story, setStory] = useState("");
  const [persona, setPersona] = useState("");
  const [rules, setRules] = useState("");
 const [tags, setTags] = useState<string[]>([]);
const [tagInput, setTagInput] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [coverUrl, setCoverUrl] = useState("");
  const [openingMessage, setOpeningMessage] = useState("");
  const [outputSettings, setOutputSettings] = useState("");
  const [chatStyle, setChatStyle] = useState("");
  const [authorIntroHtml, setAuthorIntroHtml] = useState("");
  const [defaultCognition, setDefaultCognition] = useState("");
  const [adversityResponse, setAdversityResponse] = useState("");
  const [authorNote, setAuthorNote] = useState("");
  const [isPublished, setIsPublished] = useState(true);
  const [creating, setCreating] = useState(false);
  const [previewing, setPreviewing] = useState(false);

  // 上传头像
  const handleAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      setAvatar(reader.result as string);
    };

    reader.readAsDataURL(file);
  };

  // 创建角色
  const create = async () => {
    if (!name || creating) return;

    setCreating(true);

    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) return;

    // 🔥 真正给AI用的人设prompt
    const fullPrompt = `
你现在必须完全扮演以下角色。

【角色名字】
${name}

【角色描述】
${desc}

【角色背景 / 身世】
${story}

【角色性格】
${persona}

【输出规则】
${rules}

【强制要求】
- 不允许说自己是AI
- 不允许跳出角色
- 不允许解释规则
- 永远保持角色性格一致
- 使用符合角色的语气
`;

    const { error } = await supabase
      .from("characters")
      .insert({
  name,
  description: desc,
  persona,
  story,
  rules,
  prompt: fullPrompt,
  avatar,
  cover_url: coverUrl || null,
  opening_message: openingMessage || null,
  output_settings: outputSettings || null,
  is_published: isPublished,
  approval_status: "pending",
  chat_style: chatStyle,
  author_intro_html: authorIntroHtml || null,
  default_cognition: defaultCognition || null,
  adversity_response: adversityResponse || null,
  author_note: authorNote || null,
  owner_id: userData.user.id,
  tags: tags
    .map((t) => t.trim())
    .filter(Boolean),
});

    if (error) {
      console.error(error.message);
      setCreating(false);
      return;
    }

    router.push("/");
  };

  return (
    <div className="min-h-screen bg-[#020205] text-white/90 flex items-center justify-center p-6 overflow-hidden">

      <div className="relative w-full max-w-5xl bg-black/40 backdrop-blur-3xl border border-white/5 rounded-[40px] p-10 overflow-hidden">

        {/* 背景光 */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#786BD4]/10 blur-[120px] rounded-full"></div>

        {/* 标题 */}
        <header className="mb-10 relative z-10">
          <div className="text-[10px] tracking-[0.5em] text-[#786BD4] font-black uppercase mb-2">
            Character Creation
          </div>

          <h1 className="text-4xl font-black tracking-tight italic">
            创建角色
          </h1>

          <p className="text-sm text-white/30 mt-3">
            创建属于你的 AI 人物设定、背景与人格
          </p>
        </header>

        <div className="grid lg:grid-cols-[320px_1fr] gap-12">

          {/* 左边头像 */}
          <div>

            <label className="group relative block w-[280px] h-[380px] mx-auto cursor-pointer">

              <div className="absolute inset-0 rounded-[32px] border border-white/10 overflow-hidden bg-[#0b0b10]">

                {avatar ? (
                  <img
                    src={avatar}
                    className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-white/20">

                    <div className="text-5xl mb-4">+</div>

                    <div className="text-xs tracking-[0.3em] uppercase">
                      上传角色图片
                    </div>

                  </div>
                )}

              </div>

              <input type="file" hidden onChange={handleAvatar} />

            </label>

            <div className="mt-5 text-center text-xs text-white/20">
              建议使用竖图 / 人物图
            </div>

          </div>

          {/* 右边输入 */}
          <div className="space-y-6">

            {/* 名字 */}
            <div>
              <div className="text-sm text-white/40 mb-2">
                角色名字
              </div>

              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="例如：沈妄"
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-[#786BD4]"
              />
            </div>

            {/* 标签 */}
            <div>
  <div className="text-sm text-white/40 mb-2">
    标签
  </div>
  <div className="flex flex-wrap gap-2 p-3 rounded-2xl bg-white/5 border border-white/10 min-h-[60px]">

    {tags.map((tag, index) => (
      <div
        key={index}
        className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#786BD4]/20 border border-[#786BD4]/30 text-xs"
      >
        #{tag}

        <button
          onClick={() => {
            setTags(tags.filter((_, i) => i !== index));
          }}
          className="text-white/40 hover:text-red-400"
        >
          ×
        </button>
      </div>
    ))}

    <input
      value={tagInput}
      onChange={(e) => setTagInput(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === ",") {
          e.preventDefault();

          const value = tagInput.trim();

          if (!value) return;

          if (!tags.includes(value)) {
            setTags([...tags, value]);
          }

          setTagInput("");
        }
      }}
      placeholder="输入标签后回车..."
      className="bg-transparent outline-none text-sm flex-1 min-w-[120px]"
    />

  </div>
</div>

            {/* 描述 */}
            <div>
              <div className="text-sm text-white/40 mb-2">
                角色描述
              </div>

              <textarea
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="外貌、身份、职业、气质..."
                className="w-full h-28 bg-white/5 border border-white/10 rounded-2xl p-5 text-sm resize-none focus:outline-none focus:border-[#786BD4]"
              />
            </div>

            {/* 身世 */}
            <div>
              <div className="text-sm text-white/40 mb-2">
                角色背景 / 身世
              </div>

              <textarea
                value={story}
                onChange={(e) => setStory(e.target.value)}
                placeholder="角色经历、过去、成长环境..."
                className="w-full h-36 bg-white/5 border border-white/10 rounded-2xl p-5 text-sm resize-none focus:outline-none focus:border-[#786BD4]"
              />
            </div>

            {/* 性格 */}
            <div>
              <div className="text-sm text-white/40 mb-2">
                性格设定
              </div>

              <textarea
                value={persona}
                onChange={(e) => setPersona(e.target.value)}
                placeholder="冷淡、偏执、占有欲强、嘴硬心软..."
                className="w-full h-32 bg-white/5 border border-white/10 rounded-2xl p-5 text-sm resize-none focus:outline-none focus:border-[#786BD4]"
              />
            </div>

            {/* 输出规则 */}
            <div>
              <div className="text-sm text-white/40 mb-2">
                输出规则
              </div>

              <textarea
                value={rules}
                onChange={(e) => setRules(e.target.value)}
                placeholder="例如：不许跳出角色、说话简短、带压迫感..."
                className="w-full h-28 bg-white/5 border border-white/10 rounded-2xl p-5 text-sm resize-none focus:outline-none focus:border-[#786BD4]"
              />
            </div>

            <div>
              <div className="text-sm text-white/40 mb-2">封面图链接（可选）</div>
              <input value={coverUrl} onChange={(e) => setCoverUrl(e.target.value)} placeholder="https://..." className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm" />
            </div>
            <div>
              <div className="text-sm text-white/40 mb-2">开场白</div>
              <textarea value={openingMessage} onChange={(e) => setOpeningMessage(e.target.value)} placeholder="角色初次见面时说的话" className="w-full h-24 bg-white/5 border border-white/10 rounded-2xl p-5 text-sm" />
            </div>
            <div>
              <div className="text-sm text-white/40 mb-2">输出风格 / 格式</div>
              <textarea value={outputSettings} onChange={(e) => setOutputSettings(e.target.value)} placeholder="例如：每次不超过三段，动作使用 *斜体*" className="w-full h-24 bg-white/5 border border-white/10 rounded-2xl p-5 text-sm" />
            </div>
            <div><div className="text-sm text-white/40 mb-2">默认认知</div><textarea value={defaultCognition} onChange={(e)=>setDefaultCognition(e.target.value)} placeholder="角色初次见到用户时，默认如何称呼、认定用户的身份、关系距离与既有印象。" className="w-full h-28 rounded-2xl border border-white/10 bg-white/5 p-5 text-sm" /><p className="mt-2 text-xs text-white/30">会作为每段新对话的初始关系设定；用户后续行为可以改变它。</p></div>
            <div><div className="text-sm text-white/40 mb-2">逆境处理 / 剧情张力</div><textarea value={adversityResponse} onChange={(e)=>setAdversityResponse(e.target.value)} placeholder="角色面对拒绝、危险、误会、失控或情绪冲突时的独特反应。" className="w-full h-28 rounded-2xl border border-white/10 bg-white/5 p-5 text-sm" /><p className="mt-2 text-xs text-white/30">会让模型在冲突中保持角色逻辑并推动剧情，而不是机械道歉或跳出角色。</p></div>
            <div><div className="text-sm text-white/40 mb-2">作者说明</div><textarea value={authorNote} onChange={(e)=>setAuthorNote(e.target.value)} placeholder="写给玩家的玩法提示、避雷、推荐模型或补充说明（不会发送给 AI）。" className="w-full h-24 rounded-2xl border border-white/10 bg-white/5 p-5 text-sm" /></div>
            <label className="flex items-center gap-3 text-sm text-white/70"><input type="checkbox" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} />公开发布（关闭后仅自己可见）</label>
            <div><div className="text-sm text-white/40 mb-2">聊天主题 CSS</div><div className="mb-3 flex flex-wrap gap-2"><button type="button" onClick={()=>setChatStyle(GLASS_CARD_TEMPLATE)} className="rounded-full border border-[#a99cff]/50 bg-[#786BD4]/15 px-3 py-1.5 text-xs text-[#d8d2ff]">默认玻璃模板</button>{Object.entries(CHARACTER_THEME_PRESETS).map(([label,value])=><button type="button" key={label} onClick={()=>setChatStyle(value)} className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white/75 hover:border-[#a99cff]">{label}</button>)}</div><label className="mb-3 block text-sm text-white/60">背景图可见度：{readStyleNumber(chatStyle,"--chat-background-opacity",55)}%<input type="range" min="0" max="100" value={readStyleNumber(chatStyle,"--chat-background-opacity",55)} onChange={(e)=>setChatStyle(setStyleVariable(chatStyle,"--chat-background-opacity",e.target.value))} className="mt-2 block w-full accent-[#a99cff]" /><span className="text-xs text-white/30">数值越低，角色图片越暗。</span></label><textarea value={chatStyle} onChange={(e) => setChatStyle(e.target.value)} placeholder="--chat-accent: #e0aaff; --chat-background-opacity: 58;" className="w-full h-32 bg-white/5 border border-white/10 rounded-2xl p-5 text-sm" /><p className="mt-2 text-xs text-white/30">默认以角色头像作为背景图。选择模板或写入 --chat-accent、--chat-panel 等样式声明，只应用到该角色的聊天页。</p></div>
            <div><div className="text-sm text-white/40 mb-2">作者介绍组件（HTML）</div><p className="mb-3 text-xs text-white/30">可制作角色档案、人物关系、NPC 卡片与世界观动态。HTML 会在独立沙盒中显示，脚本不会运行。</p><div className="mb-3 flex flex-wrap gap-2">{Object.entries(HTML_INTRO_TEMPLATES).map(([label,value])=><button type="button" key={label} onClick={()=>setAuthorIntroHtml(value)} className="rounded-full border border-[#a99cff]/35 bg-[#786BD4]/10 px-3 py-1.5 text-xs text-[#ddd7ff] hover:bg-[#786BD4]/25">套用{label}</button>)}</div><textarea value={authorIntroHtml} onChange={(e)=>setAuthorIntroHtml(e.target.value)} placeholder={'<style>body{padding:18px;font-family:serif}</style>\n<h2>角色档案</h2>\n<p>在这里介绍世界观、NPC 与人物关系。</p>'} className="h-56 w-full rounded-2xl border border-white/10 bg-black/25 p-5 font-mono text-xs outline-none focus:border-[#a99cff]" /><CharacterHtmlIntro content={authorIntroHtml} className="mt-4 h-64" /></div>
            {/* 按钮 */}
            <button type="button" onClick={() => setPreviewing(true)} className="w-full rounded-2xl border border-[#a99cff]/45 bg-[#786BD4]/10 py-3 text-sm font-bold text-[#ddd7ff] transition hover:bg-[#786BD4]/25">预览角色详情与聊天效果</button>
            <button
              onClick={create}
              disabled={creating}
              className="w-full h-14 rounded-2xl bg-white text-black font-bold tracking-[0.2em] uppercase hover:bg-[#786BD4] hover:text-white transition-all duration-500"
            >
              {creating ? "创建中..." : "创建角色"}
            </button>

          </div>

        </div>

      </div>
      {previewing && <CharacterPreviewModal onClose={() => setPreviewing(false)} character={{ name, description: desc, avatar, cover: coverUrl, tags, opening: openingMessage, story, authorHtml: authorIntroHtml }} />}
    </div>
  );
}
