import { supabase } from "./supabase";
import type { User } from "@supabase/supabase-js";

/** Creates the local profile once without overwriting a user's saved name/avatar. */
export async function ensureUserProfile(user: User) {
  const { data: existing, error: lookupError } = await supabase
    .from("users").select("*").eq("auth_id", user.id).maybeSingle();
  if (existing) return { data: existing, error: null };
  if (lookupError) return { data: null, error: lookupError };
  return supabase.from("users").insert({
    auth_id: user.id,
    uid: Math.random().toString(36).slice(2, 10),
    email: user.email,
    name: user.email?.split("@")[0] || "未命名用户",
    avatar: null,
  }).select().single();
}
