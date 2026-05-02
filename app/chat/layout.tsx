export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen w-full bg-black text-white flex flex-col">
      {children}
    </div>
  );
}
