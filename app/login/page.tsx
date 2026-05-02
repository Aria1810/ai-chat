'use client';

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");

  const login = async () => {
    await supabase.auth.signInWithOtp({
      email: email,
    });
    alert("去邮箱点登录链接");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">

      <div className="p-6 border rounded-xl w-80">

        <h2 className="mb-4 text-lg font-semibold">登录</h2>

        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="邮箱"
          className="w-full border px-3 py-2 rounded mb-3"
        />

        <button
          onClick={login}
          className="w-full bg-black text-white py-2 rounded"
        >
          发送登录链接
        </button>

      </div>

    </div>
  );
}

