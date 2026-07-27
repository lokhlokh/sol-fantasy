import type { Metadata } from "next";
import { PasswordGate } from "@/components/PasswordGate";
import "./globals.css";

export const metadata: Metadata = {
  title: "신한 SOL 판타지리그 2026",
  description: "신한 SOL 판타지리그 2026",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <PasswordGate>{children}</PasswordGate>
      </body>
    </html>
  );
}
