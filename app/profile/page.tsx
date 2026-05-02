'use client';

import { useState, useEffect } from "react";

export default function ProfilePage() {

  const [name, setName] = useState("未命名用户");
  const [uid, setUid] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);

  // 初始化
  useEffect(() => {
    const savedName = localStorage.getItem("user_name");
    const savedUid = localStorage.getItem("user_uid");
    const savedAvatar = localStorage.getItem("user_avatar");

    if (savedName) setName(savedName);
    if (savedAvatar) setAvatar(savedAvatar);

    if (savedUid) {
      setUid(savedUid);
    } else {
      const newUid = Math.random().toString(36).slice(2, 10);
      setUid(newUid);
      localStorage.setItem("user_uid", newUid);
    }
  }, []);

  // 改名字
  const saveName = () => {
    localStorage.setItem("user_name", name);
  };

  // 上传头像
  const handleAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setAvatar(base64);
      localStorage.setItem("user_avatar", base64);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen bg-white p-6">

      <div className="max-w-xl mx-auto">

        {/* 头像 */}
        <div className="flex items-center gap-4 mb-6">

          <label className="cursor-pointer">
            <div className="w-20 h-20 rounded-full bg-gray-200 overflow-hidden">
              {avatar && (
                <img src={avatar} className="w-full h-full object-cover" />
              )}
            </div>
            <input type="file" hidden onChange={handleAvatar} />
          </label>

          <div>
            <div className="text-sm text-gray-500">UID: {uid}</div>
          </div>

        </div>

        {/* 名字 */}
        <div className="mb-4">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border px-3 py-2 rounded w-full"
          />
          <button
            onClick={saveName}
            className="mt-2 px-4 py-2 bg-black text-white rounded"
          >
            保存名字
          </button>
        </div>

      </div>

    </div>
  );
}
