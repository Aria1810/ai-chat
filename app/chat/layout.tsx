export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen w-full bg-[#f6f7fb] text-black flex flex-col">
      {children}
    </div>
  );
}