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
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased scroll-smooth`}
    >
      <body className="min-h-full flex flex-col bg-[#050505] text-[#d4d4d4] selection:bg-[#ffffff20] selection:text-[#ffffff]">
        {/* Main Content Wrapper with specialized layout logic */}
        <main className="flex-1 flex flex-col relative overflow-x-hidden">
          {children}
        </main>
        
        {/* Global UI Overlay Patch */}
        <div className="fixed inset-0 pointer-events-none border-[1px] border-white/5 z-50" />
      </body>
    </html>
  );
}