import type { ReactNode } from "react";
import { SideNav } from "@/components/layout/side-nav";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background md:flex">
      <SideNav />
      <main className="w-full p-4 sm:p-8 max-w-7xl">{children}</main>
    </div>
  );
}
