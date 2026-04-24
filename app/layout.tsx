import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Closer AI — Proposal Intelligence",
  description: "Transform proposal writing into your most systematized, data-driven internal workflow.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
