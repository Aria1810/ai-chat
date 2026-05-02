import { Suspense } from "react";
import ChatClient from "./ChatClient";

export default function Page() {
  return (
    <Suspense fallback={<div>loading...</div>}>
      <ChatClient />
    </Suspense>
  );
}
