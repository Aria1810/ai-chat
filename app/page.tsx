'use client';

import { useState, useEffect, useRef } from 'react';

export default function Home() {
  const [role, setRole] = useState("总裁")
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'ai', content: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 1. 自动滚动到底部功能
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [chatHistory]);

  // 2. 清空/新建对话功能
  const startNewChat = () => {
    if (confirm('确定要清空所有聊天记录吗？')) {
      setChatHistory([]);
      setMessage('');
    }
  };

  // 3. 发送消息功能
  const sendMessage = async () => {
    if (!message.trim() || loading) return;

    const userMsg = message;
    setMessage('');
    // 先把用户说的话存入历史
    setChatHistory(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: userMsg,
        role }),
      });
      
      const data = await res.json();
      const aiReply = data.reply || data.error || 'AI 暂时没响应';

      // 4. 模拟打字机效果：逐字加入历史记录
      simulateTyping(aiReply);
      
    } catch (error) {
      setChatHistory(prev => [...prev, { role: 'ai', content: '网络错误，请重试' }]);
    } finally {
      setLoading(false);
    }
  };

  // 打字机逻辑
  const simulateTyping = (text: string) => {
    let currentText = "";
    let index = 0;
    
    // 先占个位
    setChatHistory(prev => [...prev, { role: 'ai', content: '' }]);

    const interval = setInterval(() => {
      currentText += text[index];
      setChatHistory(prev => {
        const updated = [...prev];
        updated[updated.length - 1].content = currentText;
        return updated;
      });
      index++;
      if (index === text.length) clearInterval(interval);
    }, 30); // 30ms 出一个字，速度正合适
  };

  return (
    <div className="flex h-screen bg-[#0f172a] text-slate-200 font-sans">
      {/* 侧边栏 */}
      <div className="hidden md:flex w-64 bg-[#1e293b] flex-col border-r border-slate-700/50 shadow-2xl">
        <div className="p-6 border-b border-slate-700/50 font-bold text-xl tracking-tight text-white flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-tr from-blue-600 to-indigo-400 rounded-lg flex items-center justify-center text-sm shadow-lg">S</div>
          SomiChat
        </div>
        <div className="flex-1 p-4 space-y-4 overflow-y-auto">
          {/* 实际功能按钮：新建对话 */}
          <button 
            onClick={startNewChat}
            className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-blue-600/10 border border-blue-500/50 text-blue-400 text-sm font-medium hover:bg-blue-600 hover:text-white transition-all duration-300"
          >
            <span className="text-lg">+</span> 新建对话
          </button>
          <div className="text-[10px] text-slate-500 px-2 pt-4 uppercase font-bold tracking-[0.2em]">最近对话</div>
          <div className="px-3 py-2 text-sm text-slate-400 hover:text-white cursor-pointer truncate transition-colors">🚀 欢迎使用 SomiChat</div>
        </div>
      </div>

      {/* 主界面 */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {/* 顶部栏 */}
        <header className="z-10 backdrop-blur-xl bg-[#0f172a]/70 border-b border-slate-800/50 p-4 flex justify-between items-center shadow-sm">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-ping absolute"></div>
              <div className="w-2 h-2 bg-green-500 rounded-full relative"></div>
            </div>
            <span className="font-semibold text-slate-200">GPT-4 Turbo <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded ml-2 text-slate-400 font-normal">在线</span></span>
          </div>
          <button 
            onClick={startNewChat}
            className="text-[11px] font-bold text-slate-400 hover:text-red-400 transition-colors uppercase tracking-wider"
          >
            清空历史
          </button>
        </header>

        {/* 消息区域 */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-10 space-y-8 custom-scrollbar">
          {chatHistory.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center animate-in fade-in zoom-in duration-700">
              <div className="w-20 h-20 bg-blue-600/10 rounded-3xl flex items-center justify-center mb-6 border border-blue-500/20 shadow-inner">
                 <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
              </div>
              <h2 className="text-3xl font-extrabold text-white tracking-tight mb-2">今天有什么新鲜事？</h2>
              <p className="text-slate-400 text-sm max-w-xs leading-relaxed text-center">你的 AI 助手已准备就绪，支持代码编写、数据分析与创意方案。</p>
            </div>
          ) : (
            chatHistory.map((chat, index) => (
              <div key={index} className={`flex ${chat.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-4 duration-500`}>
                <div className={`max-w-[85%] md:max-w-[75%] p-5 rounded-[2rem] shadow-xl leading-relaxed ${
                  chat.role === 'user' 
                  ? 'bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-tr-none border border-blue-400/30' 
                  : 'bg-[#1e293b] border border-slate-700/50 text-slate-200 rounded-tl-none'
                }`}>
                  <div className="text-[15px] whitespace-pre-wrap">{chat.content}</div>
                </div>
              </div>
            ))
          )}

          {loading && !chatHistory[chatHistory.length-1]?.content && (
            <div className="flex justify-start items-center gap-3 text-slate-500 text-sm italic">
               <span className="flex gap-1">
                 <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></span>
                 <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                 <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
               </span>
               AI 正在思考...
            </div>
          )}
        </div>

        {/* 底部输入框 */}
        <footer className="p-6 md:p-10 bg-gradient-to-t from-[#0f172a] via-[#0f172a] to-transparent">
          <select onChange={(e) => setRole(e.target.value)}>
            <option value="总裁">总裁</option>
            <option value="温柔">温柔</option>
            <option value="毒舌">毒舌</option>
          </select>
          <div className="max-w-4xl mx-auto relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-[1.5rem] blur opacity-25 group-focus-within:opacity-50 transition duration-1000"></div>
            <div className="relative flex items-end bg-[#1e293b] rounded-[1.4rem] border border-slate-700 shadow-2xl p-2 pr-4 transition-all focus-within:border-blue-500/50">
              <textarea
                rows={1}
                className="flex-1 bg-transparent border-none px-4 py-3 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-0 resize-none max-h-48 text-[15px]"
                placeholder="发送消息..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
              />
              <button
                onClick={sendMessage}
                disabled={loading || !message.trim()}
                className="mb-1 p-3 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-xl transition-all duration-300 shadow-lg shadow-blue-900/20 active:scale-95"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
              </button>
            </div>
          </div>
          <div className="mt-4 text-center text-[10px] text-slate-600 font-medium tracking-[0.2em] uppercase">Built with Next.js & Tailwind</div>
        </footer>
      </div>
    </div>
  );
}
