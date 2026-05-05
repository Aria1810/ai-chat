'use client';

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function CreateCharacter() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [persona, setPersona] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);

  // 🔥 上传图片（base64版，先跑通）
  const handleAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      setAvatar(reader.result as string);
    };

    reader.readAsDataURL(file);
  };

  const create = async () => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    const prompt = `
你是一个角色AI：

名字：${name}
外貌：${desc}
性格：${persona}

必须严格扮演角色
`;

    const { data, error } = await supabase
      .from("characters")
      .insert({
        name,
        description: desc,
        prompt,
        avatar, // 🔥 存进去
      })
      .select();

    if (error) {
      alert(error.message);
      return;
    }

    alert("创建成功");

    router.push("/");
  };

  return (
    <div className="p-6 max-w-xl mx-auto space-y-3">

      {/* 上传头像 */}
      <label className="block cursor-pointer">
        <div className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
          {avatar ? (
            <img src={avatar} className="w-full h-full object-cover" />
          ) : (
            <span className="text-xs text-gray-400">上传头像</span>
          )}
        </div>

        <input type="file" hidden onChange={handleAvatar} />
      </label>

      <input
        placeholder="角色名字"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="border p-2 w-full"
      />

      <input
        placeholder="外貌"
        value={desc}
        onChange={(e) => setDesc(e.target.value)}
        className="border p-2 w-full"
      />

      <textarea
        placeholder="性格"
        value={persona}
        onChange={(e) => setPersona(e.target.value)}
        className="border p-2 w-full h-32"
      />

      <button
        onClick={create}
        className="bg-black text-white px-4 py-2"
      >
        创建角色
      </button>

    </div>
  );
}