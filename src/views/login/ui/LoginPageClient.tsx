"use client";

import { Header, Navigation, Footer } from "@/widgets/layout";
import { LoginForm, GoogleLoginButton } from "@/features/auth";

export default function LoginPageClient() {
  return (
    <div className="min-h-screen bg-surface">
      <Header />
      <Navigation />
      <main className="flex-1 flex items-start justify-center py-16">
        <div className="w-full max-w-[400px] mx-auto px-4">
          <h1 className="text-2xl font-bold text-on-surface text-center mb-8">
            로그인
          </h1>

          <LoginForm />

          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-divider" />
            <span className="text-sm text-on-surface-medium">또는</span>
            <div className="flex-1 h-px bg-divider" />
          </div>

          <GoogleLoginButton />
        </div>
      </main>
      <Footer />
    </div>
  );
}
