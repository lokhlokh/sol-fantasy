"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, RotateCcw, SlidersHorizontal, Sparkles, TrendingDown } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { PlayerPortrait } from "@/components/PlayerPortrait";
import { positionLabels } from "@/data/labels";
import { playerMarketPriceStars, playerValueLabel, playerValueStars } from "@/data/playerValue";
import { players } from "@/data/players";
import { teams } from "@/data/teams";
import { calculateCurrentTeamValue } from "@/engine/budgetEngine";
import { recommendLineup } from "@/engine/aiCoach";
import { rosterErrorMessages, validateRoster } from "@/engine/rosterValidator";
import { initialBudgetStars } from "@/rules/rosterRules";
import { useLocalGameState } from "@/store/useLocalGameState";
import type { Lineup, Player, Position } from "@/types/domain";

const slotPositions: Position[] = ["C", "CENTER_INFIELD", "CENTER_INFIELD", "CORNER_INFIELD", "CORNER_INFIELD", "CF", "CORNER_OUTFIELD", "CORNER_OUTFIELD"];

function nextAvailable(ids: string[], blocked: string[] = []) {
  return ids.find((id) => !blocked.includes(id)) ?? "";
}

function roleLabel(playerId: string, roles: { captainId: string; viceCaptainId: string }) {
  if (playerId === roles.captainId) return "캡틴";
  if (playerId === roles.viceCaptainId) return "부캡틴";
  return "";
}

function slotLabel(position: Position, index: number) {
  const samePositionBefore = slotPositions.slice(0, index + 1).filter((item) => item === position).length;
  const total = slotPositions.filter((item) => item === position).length;
  return total > 1 ? `${positionLabels[position]} ${samePositionBefore}` : positionLabels[position];
}

function arrangeIdsForSlots(ids: string[]) {
  const remaining = [...ids];
  return slotPositions.map((position) => {
    const index = remaining.findIndex((id) => players.find((player) => player.id === id)?.primaryPosition === position);
    if (index < 0) return "";
    const [id] = remaining.splice(index, 1);
    return id;
  });
}

function playerScore(id: string) {
  const player = players.find((item) => item.id === id);
  return player ? playerValueStars(player) * 2 + player.recentForm : 0;
}

function fillOpenSlots(slotIds: string[], recommendedIds: string[]) {
  const used = new Set(slotIds.filter(Boolean));
  return slotIds.map((id, index) => {
    if (id) return id;
    const position = slotPositions[index];
    const recommended = recommendedIds.find((candidateId) => {
      const candidate = players.find((player) => player.id === candidateId);
      return candidate && candidate.primaryPosition === position && !used.has(candidate.id);
    });
    if (recommended) {
      used.add(recommended);
      return recommended;
    }
    const fallback = players.filter((player) => player.primaryPosition === position && !used.has(player.id)).sort((a, b) => playerValueStars(b) - playerValueStars(a))[0]?.id;
    if (fallback) used.add(fallback);
    return fallback ?? "";
  });
}

function mockInjuryForPlayer(player: Player, index: number) {
  const injuryPool = [
    { status: "햄스트링 통증", note: "최근 2경기 출전 제한 예상", severity: "주의" },
    { status: "손목 타박", note: "타격 컨디션 확인 필요", severity: "관리" },
    { status: "감기 몸살", note: "당일 선발 제외 가능성", severity: "질병" }
  ];
  if (index === 1) return injuryPool[0];
  const hash = player.id.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return hash % 13 === 0 ? injuryPool[hash % injuryPool.length] : null;
}

function BudgetTimeline({ selectedPlayers, ledgerCost, floor = initialBudgetStars }: { selectedPlayers: Player[]; ledgerCost: number; floor?: number }) {
  const width = 340;
  const height = 120;
  const paddingX = 28;
  const paddingY = 18;
  const currentTeamValue = calculateCurrentTeamValue(selectedPlayers, floor);
  const chartMax = Math.max(floor, Math.ceil(currentTeamValue / 10) * 10);
  const cumulative = selectedPlayers.reduce(
    (rows, player) => {
      const previous = rows[rows.length - 1]?.marketValue ?? 0;
      const marketValue = previous + playerMarketPriceStars(player);
      return [...rows, { label: `${rows.length}차`, marketValue, value: Math.max(floor, marketValue) }];
    },
    [{ label: "시작", marketValue: 0, value: floor }] as Array<{ label: string; marketValue: number; value: number }>
  );
  const rows = cumulative.length > 1 ? cumulative : [{ label: "시작", marketValue: 0, value: floor }, { label: "현재", marketValue: 0, value: floor }];
  const x = (index: number) => paddingX + (index * (width - paddingX * 2)) / Math.max(1, rows.length - 1);
  const y = (value: number) => height - paddingY - (Math.min(chartMax, value) / chartMax) * (height - paddingY * 2);
  const points = rows.map((row, index) => `${x(index)},${y(row.value)}`).join(" ");
  const currentBudget = rows[rows.length - 1]?.value ?? floor;
  const ticks = [0, Math.round(chartMax / 2), chartMax];

  return (
    <section className="relative isolate overflow-hidden rounded-xl border border-slate-900/10 bg-slate-950 p-4 text-white shadow-sm">
      <img
        src="/dugout/candidates/owner-skybox-v1.webp"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover object-[center_42%]"
      />
      <span className="absolute inset-0 bg-gradient-to-r from-slate-950/96 via-slate-950/84 to-slate-950/45" aria-hidden="true" />
      <span className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/35 to-slate-950/60" aria-hidden="true" />

      <div className="relative">
        <div className="mb-3 flex items-start justify-between gap-3 [text-shadow:0_1px_8px_rgba(0,0,0,0.6)]">
          <div>
            <p className="text-[10px] font-black tracking-[0.16em] text-blue-200">MY TEAM ASSET</p>
            <h2 className="mt-1 text-xl font-black tracking-tight">팀 가치 변화</h2>
          </div>
          <span className="shrink-0 rounded-full border border-white/20 bg-white/15 px-2.5 py-1 text-[10px] font-black text-blue-100 backdrop-blur-sm">시즌 기준 {floor}★</span>
        </div>

        <div className="mb-3 grid grid-cols-2 gap-2">
          <div className="rounded-lg border border-white/15 bg-slate-950/72 p-3 shadow-lg backdrop-blur-[2px]">
            <p className="text-[11px] font-bold text-slate-300">현재 남은 예산</p>
            <p className="mt-1 text-2xl font-black tracking-tight text-white">{Math.max(0, floor - ledgerCost)}★</p>
            <p className="mt-1 text-[10px] font-semibold text-slate-400">장부 기준 {ledgerCost}/{floor}★ 사용</p>
          </div>
          <div className="rounded-lg border border-blue-200/20 bg-blue-950/70 p-3 shadow-lg backdrop-blur-[2px]">
            <p className="text-[11px] font-bold text-blue-100">현재 팀의 자산 총액</p>
            <p className="mt-1 text-2xl font-black tracking-tight text-white">{currentBudget}★</p>
            <p className="mt-1 text-[10px] font-semibold text-blue-100">시장가 기준 · 최소 {floor}★</p>
          </div>
        </div>

        <div className="rounded-lg border border-white/15 bg-slate-950/68 p-3 shadow-lg backdrop-blur-[2px]">
          <div className="mb-2 flex items-start justify-between gap-3">
            <div>
              <h3 className="text-sm font-black text-white">현재 팀의 자산 변화</h3>
              <p className="mt-1 text-[11px] font-semibold leading-4 text-slate-300">선수별 현재 시장 가격을 내림해 합산합니다.</p>
            </div>
            <span className="shrink-0 rounded-full bg-white/15 px-2 py-1 text-[10px] font-black text-blue-100">현재 {currentBudget}★</span>
          </div>
          <svg viewBox={`0 0 ${width} ${height}`} className="h-32 w-full">
            {ticks.map((tick) => (
              <g key={tick}>
                <line x1={paddingX} x2={width - paddingX} y1={y(tick)} y2={y(tick)} stroke="#94a3b8" strokeOpacity="0.35" strokeWidth="1" />
                <text x="2" y={y(tick) + 4} className="fill-slate-300 text-[10px] font-bold">
                  {tick}
                </text>
              </g>
            ))}
            <polyline points={points} fill="none" stroke="#4ade80" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            {rows.map((row, index) => (
              <g key={`${row.label}-${index}`}>
                <circle cx={x(index)} cy={y(row.value)} r="4" fill="#86efac" />
                {(index === 0 || index === rows.length - 1) && (
                  <text x={x(index)} y={height - 2} textAnchor={index === 0 ? "start" : "end"} className="fill-slate-200 text-[10px] font-bold">
                    {index === 0 ? "시즌 시작" : "현재"}
                  </text>
                )}
              </g>
            ))}
          </svg>
        </div>
      </div>
    </section>
  );
}

export default function LineupPage() {
  const { state, setLineup } = useLocalGameState();
  const seasonTeamId = state.seasonTeamId;
  const originalLineup = useRef(state.lineup);
  const [slotPlayerIds, setSlotPlayerIds] = useState<string[]>(arrangeIdsForSlots(state.lineup?.playerIds ?? []));
  const [captainId, setCaptainId] = useState(state.lineup?.captainId ?? "");
  const [viceCaptainId, setViceCaptainId] = useState(state.lineup?.viceCaptainId ?? "");
  const [recruitSlot, setRecruitSlot] = useState<number | null>(null);
  const [clearedInjurySlots, setClearedInjurySlots] = useState<number[]>([]);

  const selected = slotPlayerIds.filter(Boolean);
  const selectedKey = selected.join("|");
  const selectedPlayers = useMemo(() => selected.map((id) => players.find((player) => player.id === id)).filter(Boolean) as Player[], [selectedKey]);
  const selectedRoleCount = [captainId, viceCaptainId].filter(Boolean).length;
  const selectedTeam = teams.find((team) => team.id === seasonTeamId);
  const fantasyTeamName = state.fantasyTeamName ?? "AI킬러";
  const injuredRows = slotPlayerIds
    .map((id, slotIndex) => {
      const player = players.find((item) => item.id === id);
      const injury = player ? mockInjuryForPlayer(player, slotIndex) : null;
      return player && injury && !clearedInjurySlots.includes(slotIndex) ? { player, injury, slotIndex } : null;
    })
    .filter(Boolean) as Array<{ player: Player; injury: { status: string; note: string; severity: string }; slotIndex: number }>;

  useEffect(() => {
    setCaptainId((current) => (selected.includes(current) ? current : selected[0] ?? ""));
  }, [selectedKey]);

  useEffect(() => {
    setViceCaptainId((current) => {
      if (selected.includes(current) && current !== captainId) return current;
      return nextAvailable(selected, [captainId]);
    });
  }, [captainId, selectedKey]);

  const baseLineup: Lineup = {
    seasonTeamId: seasonTeamId ?? "KIA",
    playerIds: selected,
    captainId,
    viceCaptainId,
    strategyCardId: state.strategyCardId ?? state.lineup?.strategyCardId ?? "POWER_HIT",
    bonusStrategyCardId: state.bonusStrategyCardId ?? state.lineup?.bonusStrategyCardId,
    teamMoundPick: state.teamMoundPick ?? state.lineup?.teamMoundPick ?? seasonTeamId ?? "KIA"
  };
  const validation = validateRoster(baseLineup, players);

  useEffect(() => {
    if (validation.valid) setLineup(baseLineup);
  }, [captainId, selectedKey, validation.valid, viceCaptainId]);

  if (!seasonTeamId) {
    return (
      <AppShell title="라인업">
        <Link href="/team-select" className="block rounded-lg bg-sol p-4 text-center font-black text-white">
          시즌팀 선택하기
        </Link>
      </AppShell>
    );
  }

  const applySlots = (nextIds: string[], roles?: Partial<Pick<Lineup, "captainId" | "viceCaptainId">>) => {
    const arranged = arrangeIdsForSlots(nextIds);
    const ids = arranged.filter(Boolean);
    const nextCaptainId = roles?.captainId && ids.includes(roles.captainId) ? roles.captainId : [...ids].sort((a, b) => playerScore(b) - playerScore(a))[0] ?? "";
    const nextViceCaptainId = roles?.viceCaptainId && ids.includes(roles.viceCaptainId) && roles.viceCaptainId !== nextCaptainId ? roles.viceCaptainId : nextAvailable(ids, [nextCaptainId]);
    setSlotPlayerIds(arranged);
    setClearedInjurySlots([]);
    setCaptainId(nextCaptainId);
    setViceCaptainId(nextViceCaptainId);
  };

  const applyAiRecommendation = (mode: "full" | "medium" | "light") => {
    const rec = recommendLineup(players, seasonTeamId);
    const recommendedIds = arrangeIdsForSlots(rec.lineup.playerIds).filter(Boolean);
    if (mode === "full" || selected.length < 8) {
      applySlots(recommendedIds, rec.lineup);
      return;
    }
    const keepCount = mode === "medium" ? 3 : 6;
    const keepIds = [...selected].sort((a, b) => playerScore(b) - playerScore(a)).slice(0, keepCount);
    const nextSlots = arrangeIdsForSlots(selected).map((id) => (keepIds.includes(id) ? id : ""));
    applySlots(fillOpenSlots(nextSlots, recommendedIds), {
      captainId: keepIds.includes(captainId) ? captainId : undefined,
      viceCaptainId: keepIds.includes(viceCaptainId) ? viceCaptainId : undefined,
    });
  };

  const restoreOriginal = () => {
    const lineup = originalLineup.current;
    if (!lineup) {
      setSlotPlayerIds(arrangeIdsForSlots([]));
      setClearedInjurySlots([]);
      setCaptainId("");
      setViceCaptainId("");
      return;
    }
    setSlotPlayerIds(arrangeIdsForSlots(lineup.playerIds));
    setClearedInjurySlots([]);
    setCaptainId(lineup.captainId);
    setViceCaptainId(lineup.viceCaptainId);
    setLineup(lineup);
  };

  const recruitPlayer = (slotIndex: number, playerId: string) => {
    const currentPlayerId = slotPlayerIds[slotIndex];
    const currentPlayer = players.find((item) => item.id === currentPlayerId);
    const currentInjury = currentPlayer ? mockInjuryForPlayer(currentPlayer, slotIndex) : null;
    setSlotPlayerIds((current) => current.map((id, index) => (index === slotIndex ? playerId : id === playerId ? "" : id)));
    if (currentInjury && currentPlayerId !== playerId) {
      setClearedInjurySlots((current) => [...new Set([...current, slotIndex])]);
    }
    setRecruitSlot(null);
  };

  const recruitingPosition = recruitSlot === null ? null : slotPositions[recruitSlot];
  const isReplacingInjuredPlayer = recruitSlot !== null && injuredRows.some((row) => row.slotIndex === recruitSlot);
  const recruitCandidates =
    recruitSlot === null
      ? []
      : players
          .filter((player) => player.primaryPosition === recruitingPosition)
          .filter((player) => !isReplacingInjuredPlayer || player.id !== slotPlayerIds[recruitSlot])
          .filter((player) => !selected.includes(player.id) || slotPlayerIds[recruitSlot] === player.id)
          .sort((a, b) => Number(b.teamId === seasonTeamId) - Number(a.teamId === seasonTeamId) || playerValueStars(b) - playerValueStars(a));
  const injuredTradeRow = recruitSlot === null ? undefined : injuredRows.find((row) => row.slotIndex === recruitSlot);
  const aiTrainerPick = isReplacingInjuredPlayer ? recruitCandidates[0] : undefined;

  return (
    <AppShell title="라인업 구성">
      <div className="space-y-4">
        <section className="relative isolate overflow-hidden rounded-xl border border-slate-900/10 bg-slate-950 p-4 text-white shadow-sm">
          <img
            src="/dugout/strategy-coaches-wall-v1.webp"
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover object-[center_42%]"
          />
          <span className="absolute inset-0 bg-gradient-to-r from-slate-950/96 via-slate-950/82 to-slate-950/35" aria-hidden="true" />
          <span className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/25 to-slate-950/55" aria-hidden="true" />

          <div className="relative">
            <div className="mb-4 [text-shadow:0_1px_8px_rgba(0,0,0,0.55)]">
              <p className="text-[10px] font-black tracking-[0.16em] text-blue-200">AI DUGOUT · LINEUP LAB</p>
              <h2 className="text-xl font-black tracking-tight">추천 라인업</h2>
            </div>

            <div className="grid gap-2">
              <button
                type="button"
                aria-label="AI 추천 1 전면개편"
                onClick={() => applyAiRecommendation("full")}
                className="group flex items-center gap-3 rounded-lg border border-white/15 bg-slate-950/78 p-3 text-left shadow-lg backdrop-blur-[2px] transition hover:-translate-y-0.5 hover:border-white/35 hover:bg-slate-900/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 active:translate-y-0"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-slate-950 shadow-md"><Sparkles size={18} /></span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-black">전면개편</span>
                    <span className="rounded bg-white/15 px-1.5 py-0.5 text-[10px] font-black text-blue-100">가장 과감하게</span>
                  </span>
                  <span className="mt-1 block text-xs font-semibold text-slate-300">라인업 전체를 AI 최적 조합으로 교체</span>
                </span>
                <ArrowRight className="shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-white" size={17} />
              </button>

              <button
                type="button"
                aria-label="AI 추천 2 중폭개편"
                onClick={() => applyAiRecommendation("medium")}
                className="group flex items-center gap-3 rounded-lg border border-blue-200/25 bg-blue-700/75 p-3 text-left shadow-lg backdrop-blur-[2px] transition hover:-translate-y-0.5 hover:border-blue-100/55 hover:bg-blue-600/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-100 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 active:translate-y-0"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-800 shadow-md"><SlidersHorizontal size={18} /></span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-black">중폭개편</span>
                    <span className="rounded bg-white/15 px-1.5 py-0.5 text-[10px] font-black text-blue-100">밸런스형</span>
                  </span>
                  <span className="mt-1 block text-xs font-semibold text-blue-100">기여도 TOP 3 선수만 유지하고 라인업을 최적화</span>
                </span>
                <ArrowRight className="shrink-0 text-blue-100 transition group-hover:translate-x-0.5 group-hover:text-white" size={17} />
              </button>

              <button
                type="button"
                aria-label="AI 추천 3 부진자개편"
                onClick={() => applyAiRecommendation("light")}
                className="group flex items-center gap-3 rounded-lg border border-emerald-200/25 bg-emerald-700/75 p-3 text-left shadow-lg backdrop-blur-[2px] transition hover:-translate-y-0.5 hover:border-emerald-100/55 hover:bg-emerald-600/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-100 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 active:translate-y-0"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800 shadow-md"><TrendingDown size={18} /></span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-black">부진자개편</span>
                    <span className="rounded bg-white/15 px-1.5 py-0.5 text-[10px] font-black text-emerald-100">컨디션 회복</span>
                  </span>
                  <span className="mt-1 block text-xs font-semibold text-emerald-100">부상 및 저기여 선수만 교체</span>
                </span>
                <ArrowRight className="shrink-0 text-emerald-100 transition group-hover:translate-x-0.5 group-hover:text-white" size={17} />
              </button>
            </div>

            <button
              type="button"
              aria-label="원래로 되돌리기"
              onClick={restoreOriginal}
              className="mt-3 inline-flex items-center gap-1.5 rounded-md border border-white/20 bg-white/10 px-3 py-2 text-xs font-black text-slate-200 transition hover:border-white/40 hover:bg-white/15 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              <RotateCcw size={13} />
              최근 저장 라인업 복원
            </button>
          </div>
        </section>

        <BudgetTimeline selectedPlayers={selectedPlayers} ledgerCost={validation.budget} />

        <section id="lineup-players" className="rounded-lg border border-slate-200 p-3">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h2 className="font-black">{fantasyTeamName}</h2>
              <p className="text-xs font-semibold text-slate-500">시즌팀 {selectedTeam?.name ?? seasonTeamId} 선수 3명 이상 필요</p>
            </div>
            <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-black">{selected.length}/8명</span>
          </div>

          <div className="grid gap-2">
            {slotPositions.map((position, index) => {
              const player = players.find((item) => item.id === slotPlayerIds[index]);
              const team = player ? teams.find((item) => item.id === player.teamId) : undefined;
              const role = player ? roleLabel(player.id, { captainId, viceCaptainId }) : "";
              const isSeasonTeam = Boolean(player && player.teamId === seasonTeamId);
              return (
                <div key={`${position}-${index}`} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-sm font-black">{slotLabel(position, index)}</p>
                    {isSeasonTeam && <span className="rounded bg-gold px-2 py-1 text-[10px] font-black text-ink">시즌팀</span>}
                  </div>
                  {player ? (
                    <div className="flex items-center gap-3">
                      <PlayerPortrait player={player} teamColor={team?.color ?? "#2563eb"} size="sm" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-sm font-black">{player.name}</p>
                          {role && <span className="rounded bg-sol px-1.5 py-0.5 text-[10px] font-black text-white">{role}</span>}
                        </div>
                        <p className="text-xs font-semibold text-slate-500">{team?.name ?? player.teamId} · {playerValueLabel(player)}</p>
                      </div>
                      <button type="button" onClick={() => setRecruitSlot(index)} className="rounded-md bg-ink px-3 py-2 text-xs font-black text-white">트레이드</button>
                    </div>
                  ) : (
                    <button type="button" onClick={() => setRecruitSlot(index)} className="w-full rounded-md border border-dashed border-slate-300 bg-white p-4 text-sm font-black text-slate-600">선택</button>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <section className="relative isolate overflow-hidden rounded-xl border border-slate-900/10 bg-slate-950 p-4 text-white shadow-sm">
          <img
            src="/dugout/strategy-table-v1.webp"
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover object-[center_48%]"
          />
          <span className="absolute inset-0 bg-gradient-to-r from-slate-950/96 via-slate-950/82 to-slate-950/35" aria-hidden="true" />
          <span className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/25 to-slate-950/55" aria-hidden="true" />

          <div className="relative">
            <div className="mb-3 flex items-center justify-between gap-3 [text-shadow:0_1px_8px_rgba(0,0,0,0.6)]">
              <div>
                <p className="text-[10px] font-black tracking-[0.16em] text-blue-200">CAPTAIN'S BOARD</p>
                <h2 className="mt-1 font-black">캡틴 · 부캡틴</h2>
              </div>
              <span className="rounded-full border border-white/20 bg-white/15 px-2.5 py-1 text-xs font-black text-blue-100 backdrop-blur-sm">{selectedRoleCount}/2명 선택</span>
            </div>
            <div className="grid gap-2">
              <label className="grid gap-1 text-sm font-bold text-slate-100">
                캡틴(포인트x2)
                <select className="rounded-md border border-white/20 bg-slate-950/75 p-2 font-semibold text-white shadow-lg backdrop-blur-sm" value={captainId} onChange={(event) => setCaptainId(event.target.value)}>
                  <option value="">선택 필요</option>
                  {selectedPlayers.map((player) => <option key={player.id} value={player.id}>{player.name} · {playerValueLabel(player)}</option>)}
                </select>
              </label>
              <label className="grid gap-1 text-sm font-bold text-slate-100">
                부캡틴(포인트x1.5)
                <select className="rounded-md border border-white/20 bg-slate-950/75 p-2 font-semibold text-white shadow-lg backdrop-blur-sm" value={viceCaptainId} onChange={(event) => setViceCaptainId(event.target.value)}>
                  <option value="">선택 필요</option>
                  {selectedPlayers.filter((player) => player.id !== captainId).map((player) => <option key={player.id} value={player.id}>{player.name} · {playerValueLabel(player)}</option>)}
                </select>
              </label>
            </div>
          </div>
        </section>

        {!validation.valid && <p className="rounded-lg bg-red-50 p-3 text-sm font-semibold text-red-700">{validation.errors.map((error) => rosterErrorMessages[error]).join(" ")}</p>}

        <section className="relative isolate overflow-hidden rounded-xl border border-slate-900/10 bg-slate-950 p-4 text-white shadow-sm">
          <img
            src="/dugout/trainer-rehab-v1.webp"
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover object-[center_58%]"
          />
          <span className="absolute inset-0 bg-gradient-to-r from-slate-950/96 via-slate-950/82 to-red-950/45" aria-hidden="true" />
          <span className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/30 to-slate-950/55" aria-hidden="true" />

          <div className="relative">
            <div className="mb-3 flex items-center justify-between gap-3 [text-shadow:0_1px_8px_rgba(0,0,0,0.6)]">
              <div>
                <p className="text-[10px] font-black tracking-[0.16em] text-red-200">TRAINER'S REPORT</p>
                <h2 className="mt-1 font-black">부상선수 현황</h2>
                <p className="mt-1 text-xs font-semibold text-slate-200">부상으로 출전이 어려운 선수를 확인하고 교체합니다.</p>
              </div>
              <span className="inline-flex min-w-10 shrink-0 items-center justify-center whitespace-nowrap rounded bg-red-200 px-2 py-1 text-xs font-black text-red-950">{injuredRows.length}명</span>
            </div>
          {injuredRows.length > 0 ? (
            <div className="grid gap-2">
              {injuredRows.map(({ player, injury, slotIndex }) => {
                const team = teams.find((item) => item.id === player.teamId);
                return (
                  <div key={`${player.id}-${slotIndex}`} className="flex items-center gap-3 rounded-lg border border-red-200/70 bg-red-50 p-3 text-ink shadow-lg">
                    <PlayerPortrait player={player} teamColor={team?.color ?? "#2563eb"} size="sm" />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-sm font-black text-red-950">{player.name}</p>
                        <span className="rounded bg-white px-2 py-0.5 text-[10px] font-black text-red-700">{injury.severity}</span>
                      </div>
                      <p className="text-xs font-semibold text-red-700">{injury.status} · {injury.note}</p>
                    </div>
                    <button type="button" onClick={() => setRecruitSlot(slotIndex)} className="rounded-md bg-red-700 px-3 py-2 text-xs font-black text-white">트레이드</button>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="rounded-md border border-white/15 bg-slate-950/70 p-3 text-sm font-semibold text-slate-200">현재 등록된 부상 선수는 없습니다.</p>
          )}
          <div className="mt-3 rounded-lg border border-blue-100 bg-blue-50 p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-black text-ink">
                  라이프 트레이너 <span className="text-sol">신한라이프</span>와 질병·상해·부상에 대비하세요
                </p>
                <p className="mt-1 text-xs font-semibold text-slate-600">모의 광고입니다. 보장 내용과 가입 조건은 상품 설명서를 확인하세요.</p>
              </div>
              <span className="inline-flex h-7 min-w-[44px] shrink-0 items-center justify-center whitespace-nowrap rounded bg-white px-3 text-xs font-black leading-none text-sol [text-orientation:mixed] [writing-mode:horizontal-tb]">보험</span>
            </div>
            <a href="https://www.shinhanlife.co.kr/" target="_blank" rel="noreferrer" className="mt-3 block rounded-md bg-sol p-3 text-center text-sm font-black text-white">신한라이프 보험 상품 보기</a>
          </div>
          </div>
        </section>

        {recruitSlot !== null && recruitingPosition && (
          <div className="fixed inset-0 z-40 flex items-end bg-black/45">
            <section className="max-h-[78vh] w-full overflow-auto rounded-t-xl bg-white p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold text-slate-500">트레이드</p>
                  <h3 className="text-xl font-black">{slotLabel(recruitingPosition, recruitSlot)}</h3>
                </div>
                <button type="button" onClick={() => setRecruitSlot(null)} className="rounded-md border border-slate-200 px-3 py-2 text-sm font-bold">닫기</button>
              </div>
              {injuredTradeRow && aiTrainerPick && (
                <div className="mb-3 rounded-lg border border-red-100 bg-red-50 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-black text-red-700">AI 트레이너 추천</p>
                      <p className="mt-1 text-sm font-black text-red-950">
                        {injuredTradeRow.player.name}은 {injuredTradeRow.injury.status} 이슈가 있어 오늘은 트레이드를 권장합니다.
                      </p>
                    </div>
                    <button type="button" onClick={() => recruitPlayer(recruitSlot, aiTrainerPick.id)} className="shrink-0 rounded-md bg-red-700 px-3 py-2 text-xs font-black text-white">
                      의견반영
                    </button>
                  </div>
                  <p className="mt-1 text-xs font-semibold leading-relaxed text-red-700">
                    추천 대체 선수는 {aiTrainerPick.name}입니다. 같은 {positionLabels[aiTrainerPick.primaryPosition]} 포지션이고 {playerValueLabel(aiTrainerPick)}라 라인업 균형을 유지하기 좋습니다.
                  </p>
                </div>
              )}
              <div className="grid gap-2">
                {recruitCandidates.map((player) => {
                  const team = teams.find((item) => item.id === player.teamId);
                  const isSeasonTeam = player.teamId === seasonTeamId;
                  return (
                    <button key={player.id} type="button" onClick={() => recruitPlayer(recruitSlot, player.id)} className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 text-left">
                      <PlayerPortrait player={player} teamColor={team?.color ?? "#2563eb"} size="sm" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate font-black">{player.name}</p>
                          {isSeasonTeam && <span className="rounded bg-gold px-2 py-0.5 text-[10px] font-black text-ink">시즌팀</span>}
                        </div>
                        <p className="text-xs font-semibold text-slate-500">{team?.name ?? player.teamId} · {positionLabels[player.primaryPosition]} · {playerValueLabel(player)}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          </div>
        )}
      </div>
    </AppShell>
  );
}
