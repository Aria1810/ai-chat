import Link from "next/link";

const cards = [
  { id: "1", name: "总裁男友", desc: "冷淡强势" },
  { id: "2", name: "温柔学长", desc: "治愈系" },
  { id: "3", name: "毒舌朋友", desc: "嘴狠心软" },
];

export default function Home() {
  return (
    <div style={{ padding: 20 }}>
      <h1>角色广场</h1>

      <div style={{ display: "flex", gap: 12 }}>
        {cards.map((c) => (
          <Link key={c.id} href={`/chat?id=${c.id}`}>
            <div style={{
              padding: 16,
              border: "1px solid #ccc",
              borderRadius: 12,
              cursor: "pointer"
            }}>
              <h3>{c.name}</h3>
              <p>{c.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
