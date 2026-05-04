'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function Callback() {
  const router = useRouter();

  useEffect(() => {
    const finish = async () => {
      const { data } = await supabase.auth.getSession();

      if (data.session) {
        router.replace("/"); // ✅ 安全跳转
      } else {
        router.replace("/login");
      }
    };

    finish();
  }, [router]);

  return <div>登录中...</div>;
}
