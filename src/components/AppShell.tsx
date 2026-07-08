import type { ReactNode } from "react";
import Link from "next/link";
import { Home, Medal, PanelsTopLeft, Settings, Sparkles, Trophy } from "lucide-react";

const nav = [
  { href: "/", label: "덕아웃", icon: Home },
  { href: "/lineup", label: "라인업", icon: PanelsTopLeft },
  { href: "/result", label: "스탯", icon: Trophy },
  { href: "/mini-league", label: "리그 랭킹", icon: Medal },
  { href: "/cards", label: "선수카드", icon: Sparkles },
  { href: "/admin", label: "설정", icon: Settings }
];

export function AppShell({ title, children }: { title: ReactNode; children: ReactNode }) {
  return (
    <main className="mx-auto min-h-screen max-w-md bg-white pb-24 shadow-soft">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sol">SOL 판타지야구 Mock</p>
        <h1 className="text-xl font-black text-ink">{title}</h1>
      </header>
      <section className="px-4 py-4">{children}</section>
      <nav className="fixed bottom-0 left-1/2 z-20 grid w-full max-w-md -translate-x-1/2 grid-cols-6 border-t border-slate-200 bg-white">
        {nav.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} className="flex h-16 flex-col items-center justify-center gap-1 text-[10px] font-semibold text-slate-600">
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </main>
  );
}
