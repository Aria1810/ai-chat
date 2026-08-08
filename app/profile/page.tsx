'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ensureUserProfile } from "@/lib/user";

type CharacterCard = {
  id: string;
  name: string;
  avatar?: string | null;
  description?: string | null;
  tags?: string[] | null;
};

export default function ProfilePage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [uid, setUid] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [cards, setCards] = useState<CharacterCard[]>([]);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        router.push("/login");
        return;
      }

      setUid(data.user.id);
      setEmail(data.user.email || "");
      await ensureUserProfile(data.user);

      // 用户资料
      const { data: profile } = await supabase
        .from("users")
        .select("*")
        .eq("auth_id", data.user.id)
        .single();

      if (profile) {
        setName(
          profile.name ||
          data.user.email?.split("@")[0] ||
          "用户"
        );

        setAvatar(profile.avatar || null);
      }

      // 自己创建的角色
      const { data: myCards } = await supabase
        .from("characters")
        .select("*")
        .eq("owner_id", data.user.id)
        .order("created_at", { ascending: false });

      setCards((myCards as CharacterCard[] | null) || []);

      setLoading(false);
    };

    init();
  }, [router]);

  // 保存昵称
  const saveName = async () => {
    setSaving(true);
    setNotice("");

    const { data } = await supabase.auth.getUser();

    if (data.user) {
      const { error } = await supabase
        .from("users")
        .update({ name: name.trim() || data.user.email?.split("@")[0] || "未命名用户" })
        .eq("auth_id", data.user.id);
      setNotice(error ? `保存失败：${error.message}` : "昵称已保存。");
    }

    setTimeout(() => {
      setSaving(false);
    }, 600);
  };

  // 上传头像
  const handleAvatar = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;
    if (file.size > 1_500_000) { setNotice("头像请小于 1.5MB。"); return; }

    const reader = new FileReader();

    reader.onload = async () => {
      const base64 = reader.result as string;

      setAvatar(base64);

      const { data } = await supabase.auth.getUser();

      if (data.user) {
        const { error } = await supabase
          .from("users")
          .update({ avatar: base64 })
          .eq("auth_id", data.user.id);
        setNotice(error ? `头像保存失败：${error.message}` : "头像已保存。");
      }
    };

    reader.readAsDataURL(file);
  };

  const deleteCharacter = async (characterId: string, characterName: string) => {
    if (!window.confirm(`确定删除「${characterName}」吗？角色、评论和关联聊天记录将无法恢复。`)) return;
    setDeletingId(characterId);
    const { error } = await supabase.from("characters").delete().eq("id", characterId);
    setDeletingId(null);
    if (error) return setNotice(`删除失败：${error.message}`);
    setCards((current) => current.filter((card) => card.id !== characterId));
    setNotice("角色已删除。");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050508] flex items-center justify-center">
        <div className="text-white/30 tracking-[0.4em] text-xs animate-pulse uppercase">
          Loading_Profile
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page min-h-screen bg-[#050508] text-white overflow-hidden">

      {/* 背景 */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-200px] right-[-100px] w-[500px] h-[500px] bg-[#786BD4]/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-200px] left-[-100px] w-[400px] h-[400px] bg-blue-500/5 blur-[120px] rounded-full"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-16">

        {/* 顶部 */}
        <div className="flex flex-col lg:flex-row gap-16">

          {/* 左侧 */}
          <div className="w-full lg:w-[340px]">

            <div className="sticky top-10">

              {/* 头像 */}
              <div className="relative w-fit mx-auto lg:mx-0 group">

                <label className="cursor-pointer block relative">

                  <div className="absolute -inset-2 rounded-full bg-[#786BD4]/20 blur-xl opacity-0 group-hover:opacity-100 transition duration-700"></div>

                  <div className="relative w-40 h-40 rounded-full border border-white/10 overflow-hidden bg-[#111]">

                    {avatar ? (
                      <img
                        src={avatar}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/10 text-xs tracking-widest">
                        NO IMAGE
                      </div>
                    )}

                  </div>

                  <input
                    type="file"
                    hidden
                    onChange={handleAvatar}
                  />

                </label>

                <div className="absolute bottom-1 right-1 bg-[#786BD4] text-black text-[10px] px-3 py-1 rounded-full font-bold">
                  编辑头像
                </div>

              </div>

              {/* 信息 */}
              <div className="mt-10 space-y-6">

                <div>
                  <div className="text-[10px] uppercase tracking-[0.4em] text-white/20 mb-2">
                    用户ID
                  </div>

                  <div className="font-mono text-sm text-[#786BD4] break-all">
                    {uid}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] uppercase tracking-[0.4em] text-white/20 mb-2">
                    邮箱
                  </div>

                  <div className="text-sm text-white/60 break-all">
                    {email}
                  </div>
                </div>

                {/* 名字 */}
                <div>

                  <div className="text-[10px] uppercase tracking-[0.4em] text-white/20 mb-2">
                    昵称
                  </div>

                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-[#786BD4]/50 transition-all"
                    placeholder="输入昵称"
                  />

                </div>

                <button
                  onClick={saveName}
                  disabled={saving}
                  className="w-full h-12 rounded-2xl bg-white text-black font-bold hover:bg-[#786BD4] hover:text-white transition-all duration-500"
                >
                  {saving ? "保存中..." : "保存资料"}
                </button>

                {notice && <p className="text-sm text-[#c5bcff]" role="status">{notice}</p>}

              </div>

            </div>

          </div>

          {/* 右侧 */}
          <div className="flex-1">

            {/* 标题 */}
            <div className="flex items-end justify-between mb-10">

              <div>
                <div className="text-[10px] uppercase tracking-[0.5em] text-[#786BD4] mb-2 font-bold">
                  Character Archive
                </div>

                <div className="text-4xl font-black italic tracking-tight">
                  我创建的角色
                </div>
              </div>

              <div className="text-xs text-white/20 font-mono">
                COUNT : {cards.length}
              </div>

            </div>

            {/* 空状态 */}
            {cards.length === 0 ? (
              <div className="h-[320px] rounded-[32px] border border-dashed border-white/10 flex items-center justify-center bg-white/[0.02]">
                <div className="text-center">
                  <div className="text-white/20 tracking-[0.3em] text-xs uppercase">
                    No Character Found
                  </div>

                  <button
                    onClick={() => router.push("/create")}
                    className="mt-6 px-6 py-3 rounded-2xl bg-[#786BD4] text-white text-sm hover:scale-105 transition-all"
                  >
                    去创建角色
                  </button>
                </div>
              </div>
            ) : (

              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">

                {cards.map((c) => (

                  <div
                    key={c.id}
                    className="group rounded-[28px] overflow-hidden bg-[#0a0a0f] border border-white/5 hover:border-[#786BD4]/40 transition-all duration-700"
                  >

                    {/* 图片 */}
                    <div className="relative h-[320px] overflow-hidden">

                      <img
                        src={c.avatar || "/placeholder.png"}
                        className="w-full h-full object-cover group-hover:scale-110 transition duration-1000"
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent"></div>

                      {/* 标签 */}
                      <div className="absolute top-4 left-4 flex flex-wrap gap-2 max-w-[85%]">

                        {c.tags?.map((tag: string, i: number) => (
                          <div
                            key={i}
                            className="px-3 py-1 rounded-full bg-black/50 backdrop-blur-xl border border-white/10 text-[10px] text-white/80"
                          >
                            #{tag}
                          </div>
                        ))}

                      </div>

                      {/* 信息 */}
                      <div className="absolute bottom-0 left-0 p-6 w-full">

                        <div className="text-2xl font-black mb-2">
                          {c.name}
                        </div>

                        <div className="text-sm text-white/50 line-clamp-2">
                          {c.description}
                        </div>

                      </div>

                    </div>

                    {/* 按钮 */}
                    <div className="p-5 flex gap-3">

                      <button
                        onClick={() => router.push(`/chat/${c.id}`)}
                        className="flex-1 h-11 rounded-xl bg-white text-black text-sm font-semibold hover:bg-[#786BD4] hover:text-white transition-all"
                      >
                        进入聊天
                      </button>

                      <button
                        onClick={() => router.push(`/edit/${c.id}`)}
                        className="px-5 h-11 rounded-xl border border-white/10 text-sm hover:border-[#786BD4]/50 hover:text-[#786BD4] transition-all"
                      >
                        编辑
                      </button>

                      <button
                        onClick={() => deleteCharacter(c.id, c.name)}
                        disabled={deletingId === c.id}
                        className="px-4 h-11 rounded-xl border border-red-300/25 text-sm text-red-200 hover:bg-red-500/10 disabled:opacity-50 transition-all"
                      >
                        {deletingId === c.id ? "删除中..." : "删除"}
                      </button>

                    </div>

                  </div>

                ))}

              </div>

            )}

          </div>

        </div>

      </div>

    </div>
  );
}
