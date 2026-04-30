'use client';

import { useState } from 'react';

export default function Home() {
  const [message, setMessage] = useState('');
  const [reply, setReply] = useState('');
  const [loading, setLoading] = useState(false);

 const sendMessage = async () => {
  if (!message.trim()) return;

  setLoading(true);
  setReply('');

  console.log("clicked");

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });

    console.log(res);

    const data = await res.json();
    setReply(data.reply || data.error || '出错了');
  } catch (error) {
    setReply('网络错误，请重试');
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">AI 聊天</h1>
        
        <div className="mb-4">
          <textarea
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            placeholder="输入你的消息..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>
        
        <button
          className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition disabled:bg-gray-400"
          onClick={sendMessage}
          disabled={loading}
        >
          {loading ? '思考中...' : '发送'}
        </button>
        
        {reply && (
          <div className="mt-6 p-4 bg-white border border-gray-200 rounded-lg">
            <p className="text-gray-700">{reply}</p>
          </div>
        )}
      </div>
    </div>
  );
}
