import type { Metadata } from "next";
import { PasswordGate } from "@/components/PasswordGate";
import "./globals.css";

export const metadata: Metadata = {
  title: "SOL 판타지야구 Mock",
  description: "Mock 전용 판타지야구 프로토타입",
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
