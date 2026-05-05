'use client';

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ProfilePage() {
  const [name, setName] = useState("");
  const [uid, setUid] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getUser();

      if (!data.user) return;

      setUid(data.user.id);
      setEmail(data.user.email || "");

      const { data: profile } = await supabase
        .from("users")
        .select("*")
        .eq("auth_id", data.user.id)
        .single();

      if (profile) {
        setName(profile.name || data.user.id.slice(0, 8));
        setAvatar(profile.avatar || null);
      }

      setLoading(false);
    };

    init();
  }, []);

  // 保存名字
  const saveName = async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) return;

    await supabase
      .from("users")
      .update({ name })
      .eq("auth_id", data.user.id);

    alert("已保存");
  };

  // 头像上传（base64简化版）
  const handleAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = async () => {
      const base64 = reader.result as string;
      setAvatar(base64);

      const { data } = await supabase.auth.getUser();
      if (!data.user) return;

      await supabase
        .from("users")
        .update({ avatar: base64 })
        .eq("auth_id", data.user.id);
    };

    reader.readAsDataURL(file);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f6f7fb]">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f7fb] flex justify-center items-center p-6">

      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6">

        {/* 头像 + 信息 */}
        <div className="flex flex-col items-center mb-6">

          <label className="cursor-pointer">
            <div className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden shadow-md">
              {avatar && (
                <img src={avatar} className="w-full h-full object-cover" />
              )}
            </div>
            <input type="file" hidden onChange={handleAvatar} />
          </label>

          <div className="mt-3 text-sm text-gray-500">
            UID: {uid.slice(0, 8)}
          </div>

          <div className="text-xs text-gray-400">
            {email}
          </div>

        </div>

        {/* 名字编辑 */}
        <div className="mb-4">

          <label className="text-sm text-gray-500">昵称</label>

          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full mt-1 px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-black/10"
            placeholder="你的名字"
          />

        </div>

        {/* 保存按钮 */}
        <button
          onClick={saveName}
          className="w-full bg-black text-white py-2 rounded-lg hover:opacity-90 transition"
        >
          保存
        </button>

        {/* 未来扩展区 */}
        <div className="mt-6 grid grid-cols-2 gap-3 text-sm">

          <div className="bg-gray-50 p-3 rounded-lg">
            ❤️ 点赞
            <div className="text-xs text-gray-400 mt-1">0</div>
          </div>

          <div className="bg-gray-50 p-3 rounded-lg">
            ⭐ 收藏
            <div className="text-xs text-gray-400 mt-1">0</div>
          </div>

          <div className="bg-gray-50 p-3 rounded-lg col-span-2">
            💰 余额
            <div className="text-xs text-gray-400 mt-1">0 coins</div>
          </div>

        </div>

      </div>

    </div>
  );
}