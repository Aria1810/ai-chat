console.log("API HIT")
import { NextRequest, NextResponse } from 'next/server';

// =====================
// 主入口
// =====================
export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();

    if (!message) {
      return NextResponse.json({ error: '消息不能为空' }, { status: 400 });
    }

    // ① OpenAI 优先
    const openai = await tryOpenAI(message);
    if (openai) {
      return NextResponse.json({ reply: openai, source: 'openai' });
    }

    // ② Gemini 备用
    const gemini = await tryGemini(message);
    if (gemini) {
      return NextResponse.json({ reply: gemini, source: 'gemini' });
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
async function tryOpenAI(message: string) {
  console.log("OPENAI CALLED")
  if (!process.env.OPENAI_API_KEY) return null;

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: message }],
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
async function tryGemini(message: string) {
  if (!process.env.GEMINI_API_KEY) return null;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: message }],
            },
          ],
        }),
      }
    );

    const data = await res.json();

    return data?.candidates?.[0]?.content?.parts?.[0]?.text || null;
  } catch (err) {
    console.log('Gemini failed');
    return null;
  }
}
