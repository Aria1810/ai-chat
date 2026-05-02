'use client';
import { useState, useEffect, useRef } from 'react';

export default function Home() {
  const [role, setRole] = useState("总裁");
  const [model, setModel] = useState("gpt");
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'ai', content: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [chatHistory]);

  const startNewChat = () => {
    if (confirm('Proceed with data obliteration? Historical neural traces will be lost.')) {
      setChatHistory([]);
      setMessage('');
    }
  };

  const simulateTyping = (text: string) => {
    let currentText = "";
    let index = 0;
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
    }, 20);
  };

  const sendMessage = async () => {
    if (!message.trim() || loading) return;
    const userMsg = message;
    setMessage('');
    setChatHistory(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, role, model }),
      });
      const data = await res.json();
      simulateTyping(data.reply || data.error || 'Interface timeout.');
    } catch (error) {
      setChatHistory(prev => [...prev, { role: 'ai', content: 'Connection severed. Check neural link.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#020203] text-[#a1a1aa] font-sans selection:bg-[#786BD4]/30">
      {/* 极简侧边栏 */}
      <aside className="hidden lg:flex w-20 hover:w-64 transition-all duration-500 bg-black border-r border-white/5 flex-col group overflow-hidden z-30">
        <div className="h-20 flex items-center px-6 border-b border-white/5">
          <div className="w-8 h-8 rounded-full border border-[#786BD4] flex items-center justify-center text-[#786BD4] font-black text-xs shadow-[0_0_15px_rgba(120,107,212,0.4)]">Σ</div>
          <span className="ml-6 text-white font-bold tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">ARCHITECT_S</span>
        </div>
        <div className="flex-1 p-4 space-y-8 mt-6">
          <button onClick={startNewChat} className="w-12 h-12 rounded-xl border border-white/10 flex items-center justify-center hover:bg-white/5 transition-colors group-hover:w-full group-hover:justify-start group-hover:px-4">
          <span className="text-white">+</span>
          <span className="ml-4 text-[10px] tracking-widest opacity-0 group-hover:opacity-100 whitespace-nowrap">INIT_PURGE</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat">
        {/* 悬浮顶栏 */}
        <header className="h-16 flex items-center justify-between px-10 border-b border-white/5 backdrop-blur-xl bg-black/40 z-20">
          <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-[#786BD4] animate-ping"></div>
          <span className="text-[10px] tracking-[0.3em] font-black text-white/50 uppercase">Neural Link Established</span>
          </div>
          <div className="h-4 w-px bg-white/10"></div>
          <div className="flex gap-4">
          <span className="text-[10px] font-bold px-2 py-1 bg-white/5 rounded border border-white/5 text-[#786BD4]">{model.toUpperCase()}</span>
          <span className="text-[10px] font-bold px-2 py-1 bg-white/5 rounded border border-white/5 text-white/40">{role}</span>
          </div>
          </div>
        </header>

        {/* 沉浸式消息流 */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-8 py-12 md:px-24 space-y-12 custom-scrollbar">
          {chatHistory.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center space-y-4">
          <div className="text-8xl font-black text-white/5 tracking-tighter italic select-none">ARCHITECTURE</div>
          <p className="text-[10px] tracking-[0.5em] text-white/20 uppercase">Waiting for input pulse...</p>
          </div>
          ) : (
          chatHistory.map((chat, i) => (
          <div key={i} className={`flex ${chat.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-700`}>
          <div className={`max-w-[85%] md:max-w-[70%] text-sm leading-relaxed ${
          chat.role === 'user' 
          ? 'text-white border-r-2 border-[#786BD4] pr-6 text-right' 
          : 'text-white/70 border-l-2 border-white/10 pl-6'
          }`}>
          <div className="whitespace-pre-wrap">{chat.content}</div>
          </div>
          </div>
          ))
          )}
        </div>

        {/* 极简操控台 */}
        <footer className="p-8 md:p-16">
          <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex gap-4 px-2">
          <div className="relative group">
          <select value={role} onChange={(e) => setRole(e.target.value)} className="appearance-none bg-transparent text-[10px] tracking-widest text-white/30 hover:text-[#786BD4] transition-colors uppercase border-none focus:ring-0 cursor-pointer">
          <option value="总裁">Persona: CEO</option>
          <option value="温柔">Persona: Gentle</option>
          <option value="毒舌">Persona: Sharp</option>
          </select>
          </div>
          <div className="relative group">
          <select value={model} onChange={(e) => setModel(e.target.value)} className="appearance-none bg-transparent text-[10px] tracking-widest text-white/30 hover:text-[#786BD4] transition-colors uppercase border-none focus:ring-0 cursor-pointer">
          <option value="gpt">Engine: GPT-4</option>
          <option value="gemini">Engine: Gemini</option>
          <option value="deepseek">Engine: deepseek</option>
          </select>
          </div>
          </div>
          
          <div className="relative group flex items-end border-b border-white/10 pb-4 focus-within:border-[#786BD4] transition-all duration-700">
          <textarea
          rows={1}
          className="flex-1 bg-transparent border-none px-2 text-white placeholder-white/10 focus:ring-0 resize-none text-base font-light"
          placeholder="Type your command..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())}
          />
          <button onClick={sendMessage} className="ml-4 p-2 text-white/20 hover:text-[#786BD4] transition-all">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17 8l4 4m0 0l-4 4m4-4H3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          </div>
          </div>
        </footer>
      </main>
    </div>
  );
}