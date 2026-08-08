export const CHARACTER_THEME_PRESETS = {
  "紫雾梦境": "background: radial-gradient(circle at top, #5b2b7b 0%, #170b25 42%, #050508 100%); --chat-accent: #e0aaff;",
  "赛博蓝图": "background: radial-gradient(circle at 85% 5%, #063a63 0%, #07131f 48%, #020508 100%); --chat-accent: #70d6ff;",
  "暮色玫瑰": "background: radial-gradient(circle at top, #6f1d3c 0%, #220913 46%, #080306 100%); --chat-accent: #ff9fbd;",
  "森林秘境": "background: radial-gradient(circle at 15% 5%, #1b5a47 0%, #071914 48%, #020806 100%); --chat-accent: #a8e6cf;",
} as const;

export const GLASS_CARD_TEMPLATE = `--chat-accent: #c7a7ff;
--chat-background-opacity: 58;
--chat-panel: rgba(245, 242, 255, 0.34);
--chat-ai-bubble: rgba(255, 255, 255, 0.82);
--chat-user-bubble: rgba(232, 242, 255, 0.86);`;

export const HTML_INTRO_TEMPLATES = {
  "角色档案": `<!doctype html><html><head><style>
body{margin:0;padding:20px;background:linear-gradient(135deg,#171321,#342553);color:#f7f2ff;font:14px/1.7 system-ui,sans-serif}.card{border:1px solid #ffffff2e;border-radius:18px;padding:20px;background:#ffffff12;box-shadow:0 16px 40px #0005}.eyebrow{font-size:10px;letter-spacing:.28em;color:#cdb6ff}.name{font:700 28px Georgia,serif;margin:8px 0}.line{height:1px;background:#ffffff2a;margin:16px 0}.tag{display:inline-block;padding:4px 9px;margin:3px;border:1px solid #ffffff35;border-radius:999px;color:#e3d8ff;font-size:11px}</style></head><body><article class="card"><div class="eyebrow">CHARACTER FILE / 01</div><h1 class="name">角色姓名</h1><p>用一句带情绪的文字，写下他/她最危险、最迷人的特质。</p><div class="line"></div><p><b>身份</b>　填写角色身份</p><p><b>秘密</b>　填写不愿被人知晓的过去</p><p><span class="tag">标签一</span><span class="tag">标签二</span><span class="tag">标签三</span></p></article></body></html>`,
  "NPC关系网": `<!doctype html><html><head><style>
body{margin:0;padding:18px;background:#0b1115;color:#dceaf0;font:13px/1.6 system-ui,sans-serif}.title{font:700 18px Georgia,serif;letter-spacing:.1em;color:#c3e9ff}.node{margin:12px 0;padding:13px 15px;border-left:3px solid #6ec8ef;border-radius:0 12px 12px 0;background:#ffffff0b}.node b{color:#fff;font-size:15px}.rel{display:block;color:#85b8cf;font-size:11px;letter-spacing:.12em}.node:nth-of-type(3){border-left-color:#e993ba}.node:nth-of-type(4){border-left-color:#c6a5ff}</style></head><body><div class="title">人物关系图谱</div><section class="node"><span class="rel">与你 / 主线角色</span><b>角色姓名</b><br>写下与主角的关系、矛盾或共同秘密。</section><section class="node"><span class="rel">盟友 / NPC</span><b>NPC 名称</b><br>一句介绍其立场与目的。</section><section class="node"><span class="rel">对手 / NPC</span><b>NPC 名称</b><br>一句介绍其与角色的冲突。</section></body></html>`,
  "世界观动态": `<!doctype html><html><head><style>
body{margin:0;padding:18px;background:#f4f0e8;color:#302a28;font:13px/1.65 system-ui,sans-serif}.phone{max-width:440px;margin:auto;border:1px solid #c9beb1;border-radius:18px;background:#fffaf3;box-shadow:0 10px 28px #4b35261f;overflow:hidden}.head{padding:15px 17px;background:#ead9c8;font-weight:800}.post{padding:16px;border-bottom:1px solid #eadfd5}.user{font-weight:800}.time{color:#917f74;font-size:11px}.meta{margin-top:10px;color:#8e655a;font-size:12px}</style></head><body><main class="phone"><div class="head">城中传闻 · 动态</div><article class="post"><div class="user">NPC 名称 <span class="time">· 刚刚</span></div><p>在这里写角色所在世界的一则动态、谣言或事件。</p><div class="meta">♡ 128　▢ 23　↗ 6</div></article><article class="post"><div class="user">匿名来信 <span class="time">· 昨日</span></div><p>也可以放入角色看见却没有回复的消息。</p><div class="meta">♡ 56　▢ 8　↗ 2</div></article></main></body></html>`,
} as const;

export function readStyleNumber(style: string, name: string, fallback: number) {
  const match = style.match(new RegExp(`${name}\\s*:\\s*([\\d.]+)`, "i"));
  const value = match ? Number.parseFloat(match[1]) : fallback;
  return Number.isFinite(value) ? Math.min(100, Math.max(0, value)) : fallback;
}

export function setStyleVariable(style: string, name: string, value: string | number) {
  const declaration = `${name}: ${value};`;
  const pattern = new RegExp(`${name}\\s*:\\s*[^;]+;?`, "i");
  return pattern.test(style) ? style.replace(pattern, declaration) : `${style.trim()}${style.trim() ? "\n" : ""}${declaration}`;
}
