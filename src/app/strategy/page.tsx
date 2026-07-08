"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { StrategyCardSelector } from "@/components/StrategyCardSelector";
import { teams } from "@/data/teams";
import { strategyCards } from "@/rules/strategyCards";
import { useLocalGameState } from "@/store/useLocalGameState";
import type { StrategyCardId, TeamId } from "@/types/domain";

export default function StrategyPage() {
  const router = useRouter();
  const { state, setStrategy } = useLocalGameState();
  const [card, setCard] = useState<StrategyCardId>(state.strategyCardId ?? state.lineup?.strategyCardId ?? "POWER_HIT");
  const [mound, setMound] = useState<TeamId>(state.teamMoundPick ?? state.lineup?.teamMoundPick ?? state.seasonTeamId ?? "KIA");
  const selectedTeam = teams.find((team) => team.id === mound);

  const saveStrategy = () => {
    setStrategy(card, mound);
    router.push(state.lineup ? "/result" : "/lineup");
  };

  return (
    <AppShell title="작전 설정">
      <div className="space-y-5">
        {!state.seasonTeamId && (
          <section className="rounded-lg bg-amber-50 p-3 text-sm font-semibold text-amber-800">
            시즌팀을 먼저 고르면 라인업, 작전, 마운드 선택이 자연스럽게 이어집니다.
            <Link href="/team-select" className="ml-2 underline">
              시즌팀 선택
            </Link>
          </section>
        )}

        <section className="rounded-lg border border-slate-200 p-3">
          <p className="text-xs font-bold text-slate-500">현재 선택</p>
          <p className="mt-1 text-lg font-black">{strategyCards[card].name}</p>
          <p className="text-sm text-slate-600">오늘의 마운드: {selectedTeam?.name ?? mound}</p>
        </section>

        <section id="strategy-card">
          <h2 className="mb-2 font-black">작전 카드</h2>
          <StrategyCardSelector value={card} onChange={setCard} />
        </section>

        <section id="mound">
          <h2 className="mb-2 font-black">오늘의 마운드</h2>
          <div className="grid grid-cols-2 gap-2">
            {teams.map((team) => (
              <button
                key={team.id}
                type="button"
                onClick={() => setMound(team.id)}
                className={`rounded-lg border p-3 text-left font-bold ${mound === team.id ? "border-sol bg-blue-50" : "border-slate-200"}`}
              >
                <span className="block">{team.name}</span>
                <span className="text-xs text-slate-500">마운드 점수 후보</span>
              </button>
            ))}
          </div>
        </section>

        <button type="button" onClick={saveStrategy} className="w-full rounded-lg bg-field p-4 font-black text-white">
          작전 저장하기
        </button>
      </div>
    </AppShell>
  );
}
