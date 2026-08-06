'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState(""); const [confirm, setConfirm] = useState(""); const [notice, setNotice] = useState(""); const [loading, setLoading] = useState(false);
  useEffect(() => { supabase.auth.getSession().then(({ data }) => { if (!data.session) router.replace("/login"); }); }, [router]);
  const submit = async (event: React.FormEvent) => { event.preventDefault(); if (password.length < 6) return setNotice("密码至少需要 6 位。"); if (password !== confirm) return setNotice("两次输入的密码不一致。"); setLoading(true); const { error } = await supabase.auth.updateUser({ password }); setLoading(false); if (error) return setNotice(error.message); setNotice("密码已更新，正在返回首页…"); setTimeout(() => router.replace("/"), 800); };
  return <main className="grid min-h-screen place-items-center bg-[#020205] p-6 text-white"><form onSubmit={submit} className="w-full max-w-md rounded-[28px] border border-white/10 bg-white/[.03] p-8"><p className="text-xs tracking-[.35em] text-[#a99cff]">ACCOUNT RECOVERY</p><h1 className="mt-3 text-3xl font-black">设置新密码</h1><label className="mt-8 block text-sm">新密码<input required minLength={6} type="password" value={password} onChange={e => setPassword(e.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 p-3 outline-none focus:border-[#786BD4]" /></label><label className="mt-4 block text-sm">确认新密码<input required minLength={6} type="password" value={confirm} onChange={e => setConfirm(e.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 p-3 outline-none focus:border-[#786BD4]" /></label>{notice && <p className="mt-4 text-sm text-[#c5bcff]">{notice}</p>}<button disabled={loading} className="mt-7 w-full rounded-xl bg-white py-3 font-bold text-black hover:bg-[#a99cff]">{loading ? "更新中…" : "更新密码"}</button></form></main>;
}
