import { SiteHeader } from "@/components/shared/site-header";
import { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#fffdf8]">
      <SiteHeader />
      <main className="flex min-h-[calc(100vh-64px)] items-center justify-center p-4">
        {children}
      </main>
    </div>
  );
}
