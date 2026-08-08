'use client';

import { useEffect, useMemo, useRef, useState } from "react";

type Props = { content: string; className?: string; title?: string };

const HEIGHT_MESSAGE = "somichat-html-intro-height";

export default function CharacterHtmlIntro({ content, className = "", title = "作者介绍组件预览" }: Props) {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(48);
  const srcDoc = useMemo(() => {
    // Author-provided scripts are removed. This isolated script only reports document height.
    const safeContent = content.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");
    return `<style>html,body{margin:0;background:transparent!important;overflow:hidden}</style>${safeContent}<script>const sendHeight=()=>parent.postMessage({type:'${HEIGHT_MESSAGE}',height:Math.ceil(document.documentElement.scrollHeight)},'*');new ResizeObserver(sendHeight).observe(document.documentElement);addEventListener('load',sendHeight);setTimeout(sendHeight,80);<\/script>`;
  }, [content]);

  useEffect(() => {
    setHeight(48);
    const receiveHeight = (event: MessageEvent) => {
      if (event.source !== frameRef.current?.contentWindow || event.data?.type !== HEIGHT_MESSAGE) return;
      const nextHeight = Number(event.data.height);
      if (Number.isFinite(nextHeight)) setHeight(Math.max(1, Math.min(Math.ceil(nextHeight), 20000)));
    };
    window.addEventListener("message", receiveHeight);
    return () => window.removeEventListener("message", receiveHeight);
  }, [srcDoc]);

  if (!content.trim()) return null;
  return <iframe ref={frameRef} title={title} sandbox="allow-scripts" scrolling="no" srcDoc={srcDoc} style={{ height }} className={`block w-full border-0 bg-transparent ${className}`} />;
}
