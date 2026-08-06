'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function Callback() {
  const router = useRouter();
  useEffect(() => {
    let mounted = true;
    const finish = async () => {
      const url = new URL(window.location.href);
      const code = url.searchParams.get("code");
      if (code) await supabase.auth.exchangeCodeForSession(code);
      const recovery = url.hash.includes("type=recovery") || url.searchParams.get("type") === "recovery";
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      router.replace(data.session && recovery ? "/reset-password" : data.session ? "/" : "/login");
    };
    finish();
    const { data: subscription } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") router.replace("/reset-password");
    });
    return () => { mounted = false; subscription.subscription.unsubscribe(); };
  }, [router]);
  return <main className="grid min-h-screen place-items-center bg-[#050508] text-white/60">正在验证安全链接…</main>;
}
