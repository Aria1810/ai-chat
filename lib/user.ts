import { supabase } from "./supabase";

// 获取或创建用户
export async function upsertUser(user: any) {

  const { data: existing } = await supabase
    .from("users")
    .select("*")
    .eq("auth_id", user.id)
    .single();

  // 已存在
  if (existing) return existing;

  // 不存在 → 创建
  const newUser = {
    auth_id: user.id,
    uid: Math.random().toString(36).slice(2, 10),
    name: "未命名用户",
    avatar: null,
  };

  const { data } = await supabase
    .from("users")
    .insert(newUser)
    .select()
    .single();

  return data;
}
