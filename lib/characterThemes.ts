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
