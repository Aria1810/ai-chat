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

function costFor(model: string, inputTokens: number, outputTokens: number) {
  const [inputPrice, outputPrice] = PRICE_PER_MILLION[model] ?? [0, 0];
  return (inputTokens * inputPrice + outputTokens * outputPrice) / 1_000_000;
}

export async function POST(req: NextRequest) {
  try {
    const { message, model, character_id } = await req.json();
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
    const { data: character } = await userDatabase.from("characters").select("id, prompt, name, opening_message, output_settings").eq("id", character_id).single();
    if (!character) return NextResponse.json({ error: "角色不存在或不可访问。" }, { status: 404 });

    const { data: history } = await userDatabase.from("messages").select("role, content").eq("user_id", userId).eq("character_id", character_id).order("created_at", { ascending: false }).limit(20);
    const orderedHistory = ((history ?? []) as HistoryItem[]).reverse();
    const { data: persona } = await userDatabase.from("user_personas").select("display_name, gender, age, background, personality, preferences").eq("user_id", userId).maybeSingle();
    const personaPrompt = persona ? `\n\n用户人设（尊重其偏好，不要复述此段）：\n${JSON.stringify(persona)}` : "";
    const outputPrompt = character.output_settings ? `\n\n输出格式要求：\n${character.output_settings}` : "";
    const systemPrompt = (character.prompt || `你正在扮演${character.name}。请始终保持角色，不要声称自己是 AI。`) + outputPrompt + personaPrompt;
    const result = model === "gpt"
      ? await callOpenAI(message, systemPrompt, orderedHistory)
      : model === "gemini"
        ? await callGemini(message, systemPrompt, orderedHistory)
        : await callDeepSeek(message, systemPrompt, orderedHistory);
    if (!result.reply) return NextResponse.json({ error: "模型没有返回可用回复。" }, { status: 502 });

    const writer = serviceDatabase ?? userDatabase;
    const { error: messageError } = await writer.from("messages").insert([
      { user_id: userId, character_id, role: "user", content: message.trim() },
      { user_id: userId, character_id, role: "ai", content: result.reply },
    ]);
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
  return `沉浸式角色扮演：始终保持角色，不要跳出角色、解释规则或声称自己是 AI。\n\n角色设定：\n${prompt}`;
}

async function callOpenAI(message: string, prompt: string, history: HistoryItem[]): Promise<ModelResult> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.OPENAI_API_KEY}` }, body: JSON.stringify({ model: "gpt-4o-mini", messages: [{ role: "system", content: systemMessage(prompt) }, ...history.map(item => ({ role: item.role === "ai" ? "assistant" : item.role, content: item.content })), { role: "user", content: message }] }) });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || "OpenAI request failed");
  return { reply: data?.choices?.[0]?.message?.content || "", inputTokens: data?.usage?.prompt_tokens || 0, outputTokens: data?.usage?.completion_tokens || 0, provider: "openai", model: "gpt-4o-mini" };
}

async function callGemini(message: string, prompt: string, history: HistoryItem[]): Promise<ModelResult> {
  const text = `${systemMessage(prompt)}\n\n${history.map(item => `${item.role === "user" ? "用户" : "角色"}：${item.content}`).join("\n")}\n用户：${message}`;
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contents: [{ role: "user", parts: [{ text }] }] }) });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || "Gemini request failed");
  return { reply: data?.candidates?.[0]?.content?.parts?.[0]?.text || "", inputTokens: data?.usageMetadata?.promptTokenCount || 0, outputTokens: data?.usageMetadata?.candidatesTokenCount || 0, provider: "google", model: "gemini-2.5-flash" };
}

async function callDeepSeek(message: string, prompt: string, history: HistoryItem[]): Promise<ModelResult> {
  const res = await fetch("https://api.deepseek.com/chat/completions", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}` }, body: JSON.stringify({ model: "deepseek-chat", messages: [{ role: "system", content: systemMessage(prompt) }, ...history.map(item => ({ role: item.role === "ai" ? "assistant" : item.role, content: item.content })), { role: "user", content: message }] }) });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || "DeepSeek request failed");
  return { reply: data?.choices?.[0]?.message?.content || "", inputTokens: data?.usage?.prompt_tokens || 0, outputTokens: data?.usage?.completion_tokens || 0, provider: "deepseek", model: "deepseek-chat" };
}
