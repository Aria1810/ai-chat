'use client';

type Props = { content: string; className?: string; title?: string };

export default function CharacterHtmlIntro({ content, className = "", title = "作者介绍组件预览" }: Props) {
  if (!content.trim()) return null;
  return <iframe title={title} sandbox="" srcDoc={`<style>html,body{background:transparent!important}</style>${content}`} className={`w-full rounded-2xl border border-white/10 bg-transparent ${className}`} />;
}
