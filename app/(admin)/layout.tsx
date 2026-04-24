import type { ReactNode } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { requireAuthenticatedUser } from "@/lib/auth/guards";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  await requireAuthenticatedUser();
  return <AppShell>{children}</AppShell>;
}
