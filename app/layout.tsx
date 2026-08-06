import type { Metadata } from "next";
import "./globals.css";
import GlobalNav from "@/components/GlobalNav";

export const metadata: Metadata = {
  title: "Arch_Matrix // Grid System",
  description: "Reconstructed by Censy for Jiang Ling",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className="h-full antialiased scroll-smooth"
    >
      <body className="min-h-screen bg-[#050505] text-[#d4d4d4]">

        <main className="min-h-screen flex flex-col">
          {children}
          <GlobalNav />
        </main>

        {/* ⚠️ 已修复：不再影响点击 */}
        <div className="fixed inset-0 pointer-events-none border border-white/5 z-0" />

      </body>
    </html>
  );
}
