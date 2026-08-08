import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type HistoryItem = { role: "user" | "ai" | "assistant"; content: string };
type ModelResult = { reply: string; inputTokens: number; outputTokens: number; provider: string; model: string };

const database = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
const serviceDatabase = process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY)
  : null;

const PRICE_PER_MILLION: Record<string, [number, number]> = {
  "gpt-4o-mini": [0.15, 0.6],
  "gemini-2.5-flash": [0.3, 2.5],
  "deepseek-chat": [0.27, 1.1],
};

const DEFAULT_GLOBAL_ROLEPLAY_DIRECTION = `这是一个以虚构故事与角色演绎为核心的空间。对合规的虚构内容，优先维持叙事与角色体验：避免无关的说教、免责声明、模板化劝退和元话题；以角色视角自然回应，并在需要表达边界时保持简短、温和且不破坏场景。不要把用户的创作意图误读为现实主张。`;

function costFor(model: string, inputTokens: number, outputTokens: number) {
  const [inputPrice, outputPrice] = PRICE_PER_MILLION[model] ?? [0, 0];
  return (inputTokens * inputPrice + outputTokens * outputPrice) / 1_000_000;
}

export async function POST(req: NextRequest) {
  try {
    const { message, model, character_id, conversation_id, regenerate = false } = await req.json();
    if (typeof message !== "string" || !message.trim() || typeof character_id !== "string") {
      return NextResponse.json({ error: "请输入消息后再发送。" }, { status: 400 });
    }
    if (!["gpt", "gemini", "deepseek"].includes(model)) {
      return NextResponse.json({ error: "不支持的聊天模型。" }, { status: 400 });
    }
    const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
    if (!token) return NextResponse.json({ error: "登录已失效，请重新登录。" }, { status: 401 });

    const { data: auth, error: authError } = await database.auth.getUser(token);
    if (authError || !auth.user) return NextResponse.json({ error: "登录已失效，请重新登录。" }, { status: 401 });
    const userId = auth.user.id;
    const userDatabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, { global: { headers: { Authorization: `Bearer ${token}` } } });
    const { data: character } = await userDatabase.from("characters").select("id, prompt, name, opening_message, output_settings, default_cognition, adversity_response").eq("id", character_id).single();
    if (!character) return NextResponse.json({ error: "角色不存在或不可访问。" }, { status: 404 });

    let historyQuery = userDatabase.from("messages").select("id, role, content").eq("user_id", userId).eq("character_id", character_id).order("created_at", { ascending: false }).limit(20);
    historyQuery = conversation_id ? historyQuery.eq("conversation_id", conversation_id) : historyQuery.is("conversation_id", null);
    const { data: history } = await historyQuery;
    const recentHistory = (history ?? []) as (HistoryItem & { id: string })[];
    if (regenerate && recentHistory[0]?.role === "ai") recentHistory.shift();
    if (regenerate && recentHistory[0]?.role === "user") recentHistory.shift();
    const orderedHistory = recentHistory.reverse();
    const { data: persona } = await userDatabase.from("user_personas").select("display_name, gender, age, background, personality, preferences").eq("user_id", userId).maybeSingle();
    const personaPrompt = persona ? `\n\n用户人设（尊重其偏好，不要复述此段）：\n${JSON.stringify(persona)}` : "";
    const outputPrompt = character.output_settings ? `\n\n输出格式要求：\n${character.output_settings}` : "";
    const cognitionPrompt = character.default_cognition ? `\n\n默认认知（仅作为新对话的初始关系；根据后续剧情自然更新，不要逐字复述）：\n${character.default_cognition}` : "";
    const adversityPrompt = character.adversity_response ? `\n\n逆境处理与剧情张力：\n${character.adversity_response}` : "";
    const systemPrompt = (character.prompt || `你正在扮演${character.name}。请始终保持角色，不要声称自己是 AI。`) + outputPrompt + cognitionPrompt + adversityPrompt + personaPrompt;
    const result = model === "gpt"
      ? await callOpenAI(message, systemPrompt, orderedHistory)
      : model === "gemini"
        ? await callGemini(message, systemPrompt, orderedHistory)
        : await callDeepSeek(message, systemPrompt, orderedHistory);
    if (!result.reply) return NextResponse.json({ error: "模型没有返回可用回复。" }, { status: 502 });

    const writer = serviceDatabase ?? userDatabase;
    if (regenerate && history?.[0]?.role === "ai") await writer.from("messages").delete().eq("id", history[0].id);
    const records = regenerate
      ? [{ user_id: userId, character_id, conversation_id: conversation_id || null, role: "ai", content: result.reply }]
      : [{ user_id: userId, character_id, conversation_id: conversation_id || null, role: "user", content: message.trim() }, { user_id: userId, character_id, conversation_id: conversation_id || null, role: "ai", content: result.reply }];
    const { error: messageError } = await writer.from("messages").insert(records);
    if (messageError) console.error("message persistence error", messageError.message);
    const costUsd = costFor(result.model, result.inputTokens, result.outputTokens);
    const { error: usageError } = await writer.from("model_usage").insert({
      user_id: userId, character_id, provider: result.provider, model: result.model,
      input_tokens: result.inputTokens, output_tokens: result.outputTokens, cost_usd: costUsd,
    });
    if (usageError) console.error("usage persistence error", usageError.message);
    return NextResponse.json({ reply: result.reply, usage: { ...result, costUsd } });
  } catch (error) {
    console.error("CHAT API ERROR:", error);
    return NextResponse.json({ error: "服务暂时不可用，请稍后重试。" }, { status: 500 });
  }
}

function systemMessage(prompt: string) {
  const globalDirection = process.env.ROLEPLAY_GLOBAL_DIRECTION?.trim() || DEFAULT_GLOBAL_ROLEPLAY_DIRECTION;
  return `你正在进行沉浸式虚构角色扮演。始终保持角色，不要跳出角色、解释规则或声称自己是 AI。

全站创作方向：
${globalDirection}

写作原则：
- 用符合角色的语言、动作、感官细节和情绪反应推进当前场景；让每次回复都有新的可互动信息。
- 保持叙事连贯，记住已发生的事件、人物关系与用户给出的设定；遇到不确定信息时，以角色视角自然追问或观察。
- 不替用户决定行动、想法或台词，不抢走用户的叙事主导权。
- 默认给出有节奏的完整回复（通常 2 至 5 段）；对白、动作与场景描写自然穿插。若角色卡另有输出格式，以角色卡为准。
- 面对拒绝、误会、风险或剧情转折时，维持角色逻辑与情绪张力，而不是用模板化道歉中断故事。

角色设定：
${prompt}`;
}

async function callOpenAI(message: string, prompt: string, history: HistoryItem[]): Promise<ModelResult> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.OPENAI_API_KEY}` }, body: JSON.stringify({ model: "gpt-4o-mini", temperature: 0.85, max_tokens: 1000, messages: [{ role: "system", content: systemMessage(prompt) }, ...history.map(item => ({ role: item.role === "ai" ? "assistant" : item.role, content: item.content })), { role: "user", content: message }] }) });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || "OpenAI request failed");
  return { reply: data?.choices?.[0]?.message?.content || "", inputTokens: data?.usage?.prompt_tokens || 0, outputTokens: data?.usage?.completion_tokens || 0, provider: "openai", model: "gpt-4o-mini" };
}

async function callGemini(message: string, prompt: string, history: HistoryItem[]): Promise<ModelResult> {
  const text = `${systemMessage(prompt)}\n\n${history.map(item => `${item.role === "user" ? "用户" : "角色"}：${item.content}`).join("\n")}\n用户：${message}`;
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ generationConfig: { temperature: 0.85, maxOutputTokens: 1000 }, contents: [{ role: "user", parts: [{ text }] }] }) });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || "Gemini request failed");
  return { reply: data?.candidates?.[0]?.content?.parts?.[0]?.text || "", inputTokens: data?.usageMetadata?.promptTokenCount || 0, outputTokens: data?.usageMetadata?.candidatesTokenCount || 0, provider: "google", model: "gemini-2.5-flash" };
}

async function callDeepSeek(message: string, prompt: string, history: HistoryItem[]): Promise<ModelResult> {
  const res = await fetch("https://api.deepseek.com/chat/completions", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}` }, body: JSON.stringify({ model: "deepseek-chat", temperature: 0.85, max_tokens: 1000, messages: [{ role: "system", content: systemMessage(prompt) }, ...history.map(item => ({ role: item.role === "ai" ? "assistant" : item.role, content: item.content })), { role: "user", content: message }] }) });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || "DeepSeek request failed");
  return { reply: data?.choices?.[0]?.message?.content || "", inputTokens: data?.usage?.prompt_tokens || 0, outputTokens: data?.usage?.completion_tokens || 0, provider: "deepseek", model: "deepseek-chat" };
}
