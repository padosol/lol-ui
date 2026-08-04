import { Suspense } from "react";
import { CallbackPageClient } from "@/views/callback";

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-surface flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <CallbackPageClient />
    </Suspense>
  );
}
