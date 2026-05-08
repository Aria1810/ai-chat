'use client';

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function EditCharacterPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;

  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [personality, setPersonality] = useState("");
  const [background, setBackground] = useState("");
  const [rules, setRules] = useState("");
  const [avatar, setAvatar] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("characters")
        .select("*")
        .eq("id", id)
        .single();

      if (!data) return;

      setName(data.name || "");
      setDescription(data.description || "");
      setPersonality(data.personality || "");
      setBackground(data.background || "");
      setRules(data.rules || "");
      setAvatar(data.avatar || "");
      setTags(data.tags || []);

      setLoading(false);
    };

    load();
  }, [id]);

  const save = async () => {
    await supabase
      .from("characters")
      .update({
        name,
        description,
        personality,
        background,
        rules,
        avatar,
        tags,
      })
      .eq("id", id);

    router.push("/profile");
  };

  const handleAvatar = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      setAvatar(reader.result as string);
    };

    reader.readAsDataURL(file);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050508] text-white p-8">
      <div className="max-w-2xl mx-auto space-y-6">

        <h1 className="text-3xl font-black">
          编辑角色
        </h1>

        <label className="block">
          <div className="mb-2 text-sm text-white/50">
            角色头像
          </div>

          <div className="w-40 aspect-[3/4] rounded-2xl overflow-hidden bg-white/5">
            {avatar && (
              <img
                src={avatar}
                className="w-full h-full object-cover"
              />
            )}
          </div>

          <input
            type="file"
            hidden
            onChange={handleAvatar}
          />
        </label>

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="角色名"
          className="w-full bg-white/5 p-4 rounded-xl"
        />

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="角色简介"
          className="w-full bg-white/5 p-4 rounded-xl h-24"
        />

        <textarea
          value={personality}
          onChange={(e) => setPersonality(e.target.value)}
          placeholder="性格设定"
          className="w-full bg-white/5 p-4 rounded-xl h-32"
        />

        <textarea
          value={background}
          onChange={(e) => setBackground(e.target.value)}
          placeholder="角色背景"
          className="w-full bg-white/5 p-4 rounded-xl h-32"
        />

        <textarea
          value={rules}
          onChange={(e) => setRules(e.target.value)}
          placeholder="输出规则"
          className="w-full bg-white/5 p-4 rounded-xl h-32"
        />

        {/* 标签 */}
        <div>
          <div className="flex flex-wrap gap-2 mb-3">
            {tags.map((tag, i) => (
              <div
                key={i}
                className="px-3 py-1 rounded-full bg-[#786BD4]/20 text-[#b7aaff] text-sm flex items-center gap-2"
              >
                #{tag}

                <button
                  onClick={() =>
                    setTags(tags.filter((_, idx) => idx !== i))
                  }
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          <input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && tagInput.trim()) {
                e.preventDefault();

                if (!tags.includes(tagInput.trim())) {
                  setTags([...tags, tagInput.trim()]);
                }

                setTagInput("");
              }
            }}
            placeholder="输入标签后回车"
            className="w-full bg-white/5 p-4 rounded-xl"
          />
        </div>

        <button
          onClick={save}
          className="w-full h-14 rounded-2xl bg-[#786BD4] font-bold"
        >
          保存修改
        </button>

      </div>
    </div>
  );
}