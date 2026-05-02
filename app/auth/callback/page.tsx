'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function Callback() {
  const router = useRouter();

  useEffect(() => {
    const finish = async () => {
      await supabase.auth.getSession();
      router.push("/");
    };

    finish();
  }, []);

  return <div>登录中...</div>;
}
