'use client';

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ProfilePage() {
  const [name, setName] = useState("");
  const [uid, setUid] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [cards, setCards] = useState<any[]>([]);

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) return;

      setUid(data.user.id);
      setEmail(data.user.email || "");

      // 1️⃣ 用户信息
      const { data: profile } = await supabase
        .from("users")
        .select("*")
        .eq("auth_id", data.user.id)
        .single();

      if (profile) {
        setName(profile.name || data.user.email?.split("@")[0] || "user");
        setAvatar(profile.avatar || null);
      }

      // 2️⃣ 🔥 关键：加载自己创建的角色
      const { data: myCards } = await supabase
        .from("characters")
        .select("*")
        .eq("owner_id", data.user.id)
        .order("created_at", { ascending: false });

      setCards(myCards || []);

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

  // 头像
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
    return <div className="p-6 text-gray-500">加载中...</div>;
  }

  return (
    <div className="min-h-screen bg-[#f6f7fb] p-6">

      <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-6">

        {/* 左侧：个人信息 */}
        <div className="bg-white rounded-2xl shadow p-6">

          <div className="flex flex-col items-center">

            <label className="cursor-pointer">
              <div className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden">
                {avatar && (
                  <img src={avatar} className="w-full h-full object-cover" />
                )}
              </div>
              <input type="file" hidden onChange={handleAvatar} />
            </label>

            <div className="mt-2 text-xs text-gray-400">
              UID: {uid.slice(0, 8)}
            </div>

            <div className="text-xs text-gray-400">
              {email}
            </div>

          </div>

          <div className="mt-4">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="昵称"
            />

            <button
              onClick={saveName}
              className="w-full mt-2 bg-black text-white py-2 rounded-lg"
            >
              保存
            </button>
          </div>

        </div>

        {/* 右侧：我创建的角色 */}
        <div className="md:col-span-2">

          <div className="mb-3 font-semibold text-gray-700">
            我创建的角色
          </div>

          {cards.length === 0 ? (
            <div className="text-gray-400">还没有创建角色</div>
          ) : (
            <div className="grid grid-cols-2 gap-4">

              {cards.map((c) => (
                <div
                  key={c.id}
                  className="bg-white rounded-xl overflow-hidden shadow hover:shadow-md transition"
                >

                  <img
                    src={c.avatar || "/placeholder.png"}
                    className="w-full h-40 object-cover"
                  />

                  <div className="p-3">
                    <div className="font-medium">{c.name}</div>
                    <div className="text-xs text-gray-500 line-clamp-2">
                      {c.description}
                    </div>
                  </div>

                </div>
              ))}

            </div>
          )}

        </div>

      </div>

    </div>
  );
}