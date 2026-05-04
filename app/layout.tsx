import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased scroll-smooth`}
    >
      <body className="min-h-screen bg-[#050505] text-[#d4d4d4]">

        <main className="min-h-screen flex flex-col">
          {children}
        </main>

        {/* ⚠️ 已修复：不再影响点击 */}
        <div className="fixed inset-0 pointer-events-none border border-white/5 z-0" />

      </body>
    </html>
  );
}