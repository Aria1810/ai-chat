'use client';
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("");
  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setNotice(""); setLoading(true);
    const action = isRegistering
      ? supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${location.origin}/auth/callback` } })
      : supabase.auth.signInWithPassword({ email, password });
    const { data, error } = await action;
    setLoading(false);
    if (error) return setNotice(error.message);
    if (isRegistering && !data.session) return setNotice("账户已创建，请前往邮箱完成验证后登录。");
    router.replace("/");
  };
  return <main className="min-h-screen grid place-items-center bg-[#020205] p-6 text-white"><form onSubmit={submit} className="w-full max-w-md rounded-[28px] border border-white/10 bg-white/[.03] p-8 shadow-2xl"><p className="text-xs tracking-[.35em] text-[#a99cff]">SOMICHAT / ACCESS</p><h1 className="mt-3 text-3xl font-black">{isRegistering ? "创建账户" : "账号登录"}</h1><p className="mt-2 text-sm text-white/45">使用邮箱和密码进入你的角色宇宙。</p><label className="mt-8 block text-sm">邮箱<input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 p-3 outline-none focus:border-[#786BD4]" /></label><label className="mt-4 block text-sm">密码<input required minLength={6} type="password" value={password} onChange={e => setPassword(e.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 p-3 outline-none focus:border-[#786BD4]" /></label>{notice && <p role="alert" className="mt-4 text-sm text-[#c5bcff]">{notice}</p>}<button disabled={loading} className="mt-7 w-full rounded-xl bg-white py-3 font-bold text-black hover:bg-[#a99cff]">{loading ? "处理中…" : isRegistering ? "注册" : "登录"}</button><button type="button" onClick={() => { setIsRegistering(!isRegistering); setNotice(""); }} className="mt-5 w-full text-sm text-white/50 hover:text-white">{isRegistering ? "已有账户？去登录" : "没有账户？创建一个"}</button></form></main>;
}
