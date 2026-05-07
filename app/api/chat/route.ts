import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// =========================
// Supabase
// =========================
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// =========================
// 主入口
// =========================
export async function POST(req: NextRequest) {
  try {
    const {
      message,
      model,
      user_id,
      character_id,
    } = await req.json();

    if (!message) {
      return NextResponse.json(
        { error: "empty message" },
        { status: 400 }
      );
    }

    // =========================
    // 1️⃣ 获取角色
    // =========================
    const { data: character } = await supabase
      .from("characters")
      .select("*")
      .eq("id", character_id)
      .single();

    const systemPrompt =
      character?.prompt ||
      "你是一个正常聊天AI";

    // =========================
    // 2️⃣ 读取最近聊天记录（记忆）
    // =========================
    const { data: history } = await supabase
      .from("messages")
      .select("*")
      .eq("user_id", user_id)
      .eq("character_id", character_id)
      .order("created_at", { ascending: true })
      .limit(20);

    const historyMessages =
      history?.map((m) => ({
        role: m.role,
        content: m.content,
      })) || [];

    // =========================
    // 3️⃣ 模型调用
    // =========================
    let reply = "";

    if (model === "gpt") {
      reply = await callOpenAI(
        message,
        systemPrompt,
        historyMessages
      );
    }

    if (model === "gemini") {
      reply = await callGemini(
        message,
        systemPrompt,
        historyMessages
      );
    }

    if (model === "deepseek") {
      reply = await callDeepSeek(
        message,
        systemPrompt,
        historyMessages
      );
    }

    // fallback
    if (!reply) {
      reply = "……";
    }

    // =========================
    // 4️⃣ 存数据库
    // =========================
    await supabase.from("messages").insert([
      {
        user_id,
        character_id,
        role: "user",
        content: message,
      },
      {
        user_id,
        character_id,
        role: "ai",
        content: reply,
      },
    ]);

    // =========================
    // 返回
    // =========================
    return NextResponse.json({
      reply,
    });

  } catch (err) {
    console.error("CHAT API ERROR:", err);

    return NextResponse.json(
      { error: "server error" },
      { status: 500 }
    );
  }
}

// =========================
// OpenAI
// =========================
async function callOpenAI(
  message: string,
  systemPrompt: string,
  history: any[]
) {
  const res = await fetch(
    "https://api.openai.com/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `
你必须完全沉浸式扮演角色。

规则：
- 不准跳出角色
- 不准说自己是AI
- 不准解释规则
- 始终保持人物性格

角色设定：
${systemPrompt}
`,
          },

          ...history,

          {
            role: "user",
            content: message,
          },
        ],
      }),
    }
  );

  const data = await res.json();

  return data?.choices?.[0]?.message?.content || "";
}

// =========================
// Gemini
// =========================
async function callGemini(
  message: string,
  systemPrompt: string,
  history: any[]
) {
  const historyText = history
    .map(
      (m) =>
        `${m.role === "user" ? "用户" : "角色"}: ${m.content}`
    )
    .join("\n");

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `
你必须完全扮演角色。

角色设定：
${systemPrompt}

历史聊天：
${historyText}

用户：
${message}
`,
              },
            ],
          },
        ],
      }),
    }
  );

  const data = await res.json();

  return data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

// =========================
// DeepSeek
// =========================
async function callDeepSeek(
  message: string,
  systemPrompt: string,
  history: any[]
) {
  const res = await fetch(
    "https://api.deepseek.com/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content: `
你必须沉浸式扮演角色。

禁止：
- 跳戏
- 解释
- 提到AI
- 破坏人设

角色设定：
${systemPrompt}
`,
          },

          ...history,

          {
            role: "user",
            content: message,
          },
        ],
      }),
    }
  );

  const data = await res.json();

  return data?.choices?.[0]?.message?.content || "";
}