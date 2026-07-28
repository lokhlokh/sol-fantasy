import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
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
      <header className="sticky top-0 z-10 isolate overflow-hidden border-b border-blue-100 bg-gradient-to-br from-white via-blue-50 to-cyan-50 px-4 py-2.5 text-ink shadow-sm">
        <span className="absolute -right-10 -top-12 h-32 w-32 rounded-full bg-blue-100/70" aria-hidden="true" />
        <span className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-sol via-cyan-400 to-blue-100" aria-hidden="true" />
        <div className="relative flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-white bg-white shadow-sm [clip-path:polygon(4%_2%,96%_2%,96%_52%,50%_98%,4%_52%)]">
              <Image
                src="/brand/shinhan-sol-kbo-2026.png"
                alt="신한 SOL KBO 리그 2026"
                width={574}
                height={581}
                sizes="48px"
                priority
                className="h-full w-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <p className="truncate text-[11px] font-black tracking-tight text-sol">신한 SOL 판타지리그 2026</p>
              <h1 className="mt-0.5 truncate text-xl font-black tracking-tight text-ink">{title}</h1>
            </div>
          </div>
          <span className="shrink-0 rounded-full border border-blue-100 bg-white/80 px-2 py-1 text-[9px] font-black tracking-[0.12em] text-sol shadow-sm">LIVE</span>
        </div>
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
