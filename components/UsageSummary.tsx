'use client';

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Usage = { id: string; model: string; input_tokens: number; output_tokens: number; cost_usd: number; created_at: string; characters?: { name?: string } | null };

export default function UsageSummary() {
  const [rows, setRows] = useState<Usage[]>([]);
  useEffect(() => { (async () => { const { data: { user } } = await supabase.auth.getUser(); if (!user) return; const { data } = await supabase.from("model_usage").select("*, characters(name)").order("created_at", { ascending: false }).limit(20); setRows((data ?? []) as Usage[]); })(); }, []);
  const input = rows.reduce((sum, row) => sum + row.input_tokens, 0); const output = rows.reduce((sum, row) => sum + row.output_tokens, 0); const cost = rows.reduce((sum, row) => sum + Number(row.cost_usd), 0);
  return <section className="mb-12 rounded-[28px] border border-white/10 bg-white/[.025] p-6"><div className="flex items-end justify-between"><div><p className="text-[10px] font-bold tracking-[.35em] text-[#a99cff]">API USAGE</p><h2 className="mt-2 text-2xl font-black">用量与成本</h2></div><span className="text-xs text-white/35">最近 {rows.length} 条</span></div><div className="mt-5 grid gap-3 sm:grid-cols-3">{[["输入 Tokens", input.toLocaleString()], ["输出 Tokens", output.toLocaleString()], ["预估成本", `$${cost.toFixed(6)}`]].map(([label, value]) => <div key={label} className="rounded-2xl border border-white/10 bg-black/20 p-4"><p className="text-xs text-white/45">{label}</p><p className="mt-2 text-xl font-bold">{value}</p></div>)}</div>{rows.length > 0 && <div className="mt-5 space-y-2">{rows.slice(0, 5).map((row) => <div key={row.id} className="flex items-center justify-between gap-3 rounded-xl border border-white/[.06] px-4 py-3 text-xs"><span className="min-w-0 truncate text-white/70">{row.characters?.name || "已删除角色"} · {row.model}</span><span className="shrink-0 text-white/40">{(row.input_tokens + row.output_tokens).toLocaleString()} tokens · ${Number(row.cost_usd).toFixed(6)}</span></div>)}</div>}</section>;
}
