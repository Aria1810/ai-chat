console.log("API HIT")
import { Content } from 'next/font/google';
import { NextRequest, NextResponse } from 'next/server';
import { text } from 'stream/consumers';

// =====================
// 主入口
// =====================
export async function POST(req: NextRequest) {
  try {
    const { message, model, role } = await req.json();
    const roles = {
      总裁:"你是一个冷淡强势的总裁,说话简短,有压迫感。",
      温柔:"你是一个温柔体贴的男友,说话轻柔,会关心人。",
      毒舌:"你是一个嘴很毒但实际上很心软的朋友。"
    }
   
    if (!message) {
      return NextResponse.json({ error: '消息不能为空' }, { status: 400 });
    }

    // ① OpenAI 优先
    if (model === "gpt") {
   const openai = await tryOpenAI(message, role);
   return NextResponse.json({ reply: openai, source: "openai" });
  }
    if (model === "gemini") {
  const gemini = await tryGemini(message, role);
  return NextResponse.json({ reply: gemini, source: "gemini" });
  }


    // ③ 兜底
    return NextResponse.json({
      reply: `你说的是：${message}`,
      source: 'mock',
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}

// =====================
// OpenAI
// =====================
async function tryOpenAI(message: string,role: string) {
  console.log("OPENAI CALLED")
  if (!process.env.OPENAI_API_KEY) return null;
  const roles = {
      总裁:"你是一个冷淡强势的总裁,说话简短,有压迫感。",
      温柔:"你是一个温柔体贴的男友,说话轻柔,会关心人。",
      毒舌:"你是一个嘴很毒但实际上很心软的朋友。"
    }

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ 
          role: "system",
          content: roles[role as keyof typeof roles] ||"正常聊天"},
          {role: "user", content: message }],
      }),
    });

    const data = await res.json();

    return data?.choices?.[0]?.message?.content || null;
  } catch (err) {
    console.log('OpenAI failed');
    return null;
  }
}

// =====================
// Gemini
// =====================
async function tryGemini(message: string,role:string) {
  if (!process.env.GEMINI_API_KEY) return null;
  const roles = {
      总裁:"你是一个冷淡强势的总裁,说话简短,有压迫感。",
      温柔:"你是一个温柔体贴的男友,说话轻柔,会关心人。",
      毒舌:"你是一个嘴很毒但实际上很心软的朋友。"
    }

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ 
                text: `${roles[role as keyof typeof roles]||"正常聊天"}\n\n用户说:${message}` }],
            },
          ],
        }),
      }
    );

    const text = await res.text();
console.log("GEMINI RAW RESPONSE:", text);
const data = JSON.parse(text);
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || null;
  } catch (err) {
    console.log('Gemini failed');
    return null;
  }
}
