"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { teams } from "@/data/teams";
import { positionLabels } from "@/data/labels";
import { getCustomLegendProfile } from "@/data/customLegendProfiles";
import { useCustomLegendCards } from "@/store/useCustomLegendCards";

export default function CustomLegendCardPage() {
  const params = useParams<{ cardId: string }>();
  const { cards, ready } = useCustomLegendCards();
  const routeId = params.cardId;
  const decodedId = decodeURIComponent(routeId);
  const card = cards.find((item) => item.id === decodedId || encodeURIComponent(item.id) === routeId);

  if (!ready) {
    return <AppShell title="레전드 카드"><div className="rounded-lg bg-slate-50 p-6 text-center font-bold text-slate-600">카드를 불러오는 중입니다.</div></AppShell>;
  }

  if (!card) {
    return <AppShell title="레전드 카드"><div className="rounded-lg bg-slate-50 p-6 text-center"><p className="font-black">이 기기에 저장된 카드를 찾을 수 없습니다.</p><Link href="/cards" className="mt-4 inline-block rounded-md bg-ink px-4 py-3 text-sm font-black text-white">카드 목록으로</Link></div></AppShell>;
  }

  const team = teams.find((item) => item.id === card.teamId);
  const position = positionLabels[card.position as keyof typeof positionLabels] || card.position;
  const profile = getCustomLegendProfile(card);
  const gridStyle = { gridTemplateColumns: "54px repeat(7, minmax(0, 1fr))" };

  return (
    <AppShell title="레전드 카드">
      <div className="space-y-4">
        <Link href="/cards" className="inline-flex rounded-md border border-slate-200 px-3 py-2 text-sm font-bold">카드 목록으로</Link>

        <section className="rounded-lg bg-amber-50 p-3 shadow-soft">
          <img src={card.portraitImage || card.cardImage} alt={`${card.name} 레전드 카드`} className="aspect-[3/4] w-full rounded-lg object-cover" />
        </section>

        <section className="rounded-lg border border-amber-200 bg-white p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-black text-amber-700">{team?.shortName ?? card.teamId} 레전드</p>
              <h2 className="text-2xl font-black">{card.name}</h2>
              <p className="mt-1 font-bold text-slate-600">{card.nickname || position}</p>
              <p className="mt-1 text-sm font-semibold text-slate-500">{team?.name ?? card.teamId} · {position} · {profile.era}</p>
            </div>
            <span className="rounded-md bg-ink px-3 py-2 text-sm font-black text-white">LEGEND</span>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-2">
          <p className="rounded-lg bg-amber-50 p-3 text-sm font-black text-ink">{profile.record}</p>
          <p className="rounded-lg bg-amber-50 p-3 text-sm font-bold text-amber-800">{profile.trophy}</p>
          <p className="rounded-lg border border-slate-200 p-3 text-sm font-semibold leading-relaxed text-slate-600">{profile.story}</p>
        </section>

        <section className="rounded-lg border border-slate-200 p-4">
          <div className="mb-3">
            <h3 className="font-black">연도별 총 레코드</h3>
            <p className="mt-1 text-xs font-semibold text-slate-500">목업용 시즌 기록이며 레전드 카드 포맷 확인을 위해 제공됩니다.</p>
          </div>
          <div className="overflow-hidden rounded-lg border border-slate-200">
            <div className="grid bg-slate-100 px-2 py-2 text-[11px] font-black text-slate-600" style={gridStyle}>
              <span>연도</span>
              {profile.columns.map((column) => <span key={column} className="text-right">{column}</span>)}
            </div>
            <div className="max-h-[420px] overflow-auto">
              {profile.annualRecords.map((record) => (
                <div key={record.year} className="border-t border-slate-100">
                  <div className="grid px-2 py-2 text-[11px] font-bold text-ink" style={gridStyle}>
                    <span>{record.year}</span>
                    {record.values.map((value, index) => <span key={`${record.year}-${profile.columns[index]}`} className="text-right">{value}</span>)}
                  </div>
                  <p className="px-2 pb-2 text-[11px] font-semibold text-slate-500">{record.note}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
