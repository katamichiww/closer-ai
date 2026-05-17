import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Twinkle AI — Signal Before Motion",
  description: "A focused decision and prioritization workspace for separating signal from noise.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
