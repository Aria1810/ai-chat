'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function Callback() {
  const router = useRouter();

 useEffect(() => {
  const finish = async () => {
    const { data, error } = await supabase.auth.getSession();

    console.log("session:", data, error);

    if (data.session) {
      router.replace("/");
    } else {
      router.replace("/login");
    }
  };

  finish();
}, [router]);

  return <div>登录中...</div>;
}
