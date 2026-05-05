import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// 🔥 服务端 Supabase（必须）
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { message, model, character_id } = await req.json();

    if (!message) {
      return NextResponse.json({ error: "empty message" }, { status: 400 });
    }

    // =========================
    // 1️⃣ 从数据库拿角色人格
    // =========================
    const { data: character } = await supabase
      .from("characters")
      .select("*")
      .eq("id", character_id)
      .single();

    const systemPrompt =
      character?.prompt ||
      "你是一个正常聊天AI，不要跳出角色";

    // =========================
    // 2️⃣ 路由模型
    // =========================
    if (model === "gpt") {
      const reply = await callOpenAI(message, systemPrompt);
      return NextResponse.json({ reply, source: "openai" });
    }

    if (model === "gemini") {
      const reply = await callGemini(message, systemPrompt);
      return NextResponse.json({ reply, source: "gemini" });
    }

    if (model === "deepseek") {
      const reply = await callDeepSeek(message, systemPrompt);
      return NextResponse.json({ reply, source: "deepseek" });
    }

    return NextResponse.json({ reply: message });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "server error" }, { status: 500 });
  }
}

async function callOpenAI(message: string, systemPrompt: string) {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
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
你是一个角色扮演AI，必须100%沉浸角色。

【强制规则】
- 不允许说你是AI
- 不允许解释规则
- 不允许跳出角色
- 不允许总结
- 永远保持人物性格一致

【角色设定】
${systemPrompt}

如果违反规则，你的回答必须重新生成直到符合角色。
`
  },
  {
    role: "user",
    content: message
  }
],
    }),
  });

  const data = await res.json();
  return data?.choices?.[0]?.message?.content || "";
}
async function callGemini(message: string, systemPrompt: string) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              {
               text: `
你必须完全扮演以下角色：

${systemPrompt}

规则：
- 不准解释
- 不准跳出角色
- 不准说AI
- 只用角色语气说话

用户说：${message}
`
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
async function callDeepSeek(message: string, systemPrompt: string) {
  const res = await fetch("https://api.deepseek.com/v1/chat/completions", {
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
你是角色扮演AI。

绝对规则：
1. 永远是角色
2. 不准解释
3. 不准说AI
4. 不准跳戏

角色设定：
${systemPrompt}
`
  },
  {
    role: "user",
    content: message
  }
],
    }),
  });

  const data = await res.json();
  return data?.choices?.[0]?.message?.content || "";
}