"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { BudgetBar } from "@/components/BudgetBar";
import { PlayerPortrait } from "@/components/PlayerPortrait";
import { positionLabels } from "@/data/labels";
import { playerValueLabel, playerValueStars } from "@/data/playerValue";
import { players } from "@/data/players";
import { teams } from "@/data/teams";
import { recommendLineup } from "@/engine/aiCoach";
import { rosterErrorMessages, validateRoster } from "@/engine/rosterValidator";
import { useLocalGameState } from "@/store/useLocalGameState";
import type { Lineup, Player, Position } from "@/types/domain";

const slotPositions: Position[] = ["C", "CENTER_INFIELD", "CENTER_INFIELD", "CORNER_INFIELD", "CORNER_INFIELD", "CF", "CORNER_OUTFIELD", "CORNER_OUTFIELD"];

function nextAvailable(ids: string[], blocked: string[] = []) {
  return ids.find((id) => !blocked.includes(id)) ?? "";
}

function roleLabel(playerId: string, roles: { captainId: string; viceCaptainId: string; hiddenGemId: string }) {
  if (playerId === roles.captainId) return "캡틴";
  if (playerId === roles.viceCaptainId) return "부캡틴";
  if (playerId === roles.hiddenGemId) return "히든젬";
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

function BudgetTimeline({ selectedPlayers, max = 50 }: { selectedPlayers: Player[]; max?: number }) {
  const width = 340;
  const height = 120;
  const paddingX = 28;
  const paddingY = 18;
  const cumulative = selectedPlayers.reduce(
    (rows, player) => {
      const previous = rows[rows.length - 1]?.value ?? 0;
      return [...rows, { label: `${rows.length}차`, value: previous + player.priceStars }];
    },
    [{ label: "시작", value: 0 }] as Array<{ label: string; value: number }>
  );
  const rows = cumulative.length > 1 ? cumulative : [{ label: "시작", value: 0 }, { label: "현재", value: 0 }];
  const x = (index: number) => paddingX + (index * (width - paddingX * 2)) / Math.max(1, rows.length - 1);
  const y = (value: number) => height - paddingY - (Math.min(max, value) / max) * (height - paddingY * 2);
  const points = rows.map((row, index) => `${x(index)},${y(row.value)}`).join(" ");
  const currentBudget = rows[rows.length - 1]?.value ?? 0;

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-3">
      <div className="mb-2 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-black text-ink">시즌 예산 변화</h2>
          <p className="mt-1 text-xs font-semibold text-slate-500">선수 영입에 따른 누적 예산 흐름입니다.</p>
        </div>
        <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-black ${currentBudget > max ? "bg-red-50 text-red-700" : "bg-blue-50 text-sol"}`}>
          현재 {currentBudget}/{max}★
        </span>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="h-32 w-full">
        {[0, 25, 50].map((tick) => (
          <g key={tick}>
            <line x1={paddingX} x2={width - paddingX} y1={y(tick)} y2={y(tick)} stroke="#e2e8f0" strokeWidth="1" />
            <text x="2" y={y(tick) + 4} className="fill-slate-400 text-[10px] font-bold">
              {tick}
            </text>
          </g>
        ))}
        <polyline points={points} fill="none" stroke="#0f8b5f" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        {rows.map((row, index) => (
          <g key={`${row.label}-${index}`}>
            <circle cx={x(index)} cy={y(row.value)} r="4" fill="#0f8b5f" />
            {(index === 0 || index === rows.length - 1) && (
              <text x={x(index)} y={height - 2} textAnchor={index === 0 ? "start" : "end"} className="fill-slate-500 text-[10px] font-bold">
                {index === 0 ? "시즌 시작" : "현재"}
              </text>
            )}
          </g>
        ))}
      </svg>
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
  const [hiddenGemId, setHiddenGemId] = useState(state.lineup?.hiddenGemId ?? "");
  const [recruitSlot, setRecruitSlot] = useState<number | null>(null);
  const [clearedInjurySlots, setClearedInjurySlots] = useState<number[]>([]);

  const selected = slotPlayerIds.filter(Boolean);
  const selectedKey = selected.join("|");
  const selectedPlayers = useMemo(() => selected.map((id) => players.find((player) => player.id === id)).filter(Boolean) as Player[], [selectedKey]);
  const hiddenGemCandidates = selectedPlayers.filter((player) => player.priceStars <= 3);
  const hiddenGemCandidateKey = hiddenGemCandidates.map((player) => player.id).join("|");
  const selectedRoleCount = [captainId, viceCaptainId, hiddenGemId].filter(Boolean).length;
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

  useEffect(() => {
    setHiddenGemId((current) => {
      const candidateIds = hiddenGemCandidates.map((player) => player.id);
      if (candidateIds.includes(current) && current !== captainId && current !== viceCaptainId) return current;
      return nextAvailable(candidateIds, [captainId, viceCaptainId]);
    });
  }, [captainId, hiddenGemCandidateKey, viceCaptainId]);

  const baseLineup: Lineup = {
    seasonTeamId: seasonTeamId ?? "KIA",
    playerIds: selected,
    captainId,
    viceCaptainId,
    hiddenGemId,
    strategyCardId: state.strategyCardId ?? state.lineup?.strategyCardId ?? "POWER_HIT",
    bonusStrategyCardId: state.bonusStrategyCardId ?? state.lineup?.bonusStrategyCardId,
    teamMoundPick: state.teamMoundPick ?? state.lineup?.teamMoundPick ?? seasonTeamId ?? "KIA"
  };
  const validation = validateRoster(baseLineup, players);

  useEffect(() => {
    if (validation.valid) setLineup(baseLineup);
  }, [captainId, hiddenGemId, selectedKey, validation.valid, viceCaptainId]);

  if (!seasonTeamId) {
    return (
      <AppShell title="라인업">
        <Link href="/team-select" className="block rounded-lg bg-sol p-4 text-center font-black text-white">
          시즌팀 선택하기
        </Link>
      </AppShell>
    );
  }

  const applySlots = (nextIds: string[], roles?: Partial<Pick<Lineup, "captainId" | "viceCaptainId" | "hiddenGemId">>) => {
    const arranged = arrangeIdsForSlots(nextIds);
    const ids = arranged.filter(Boolean);
    const nextCaptainId = roles?.captainId && ids.includes(roles.captainId) ? roles.captainId : [...ids].sort((a, b) => playerScore(b) - playerScore(a))[0] ?? "";
    const nextViceCaptainId = roles?.viceCaptainId && ids.includes(roles.viceCaptainId) && roles.viceCaptainId !== nextCaptainId ? roles.viceCaptainId : nextAvailable(ids, [nextCaptainId]);
    const hiddenCandidates = ids.filter((id) => {
      const player = players.find((item) => item.id === id);
      return Boolean(player && player.priceStars <= 3);
    });
    const nextHiddenGemId =
      roles?.hiddenGemId && hiddenCandidates.includes(roles.hiddenGemId) && roles.hiddenGemId !== nextCaptainId && roles.hiddenGemId !== nextViceCaptainId
        ? roles.hiddenGemId
        : nextAvailable(hiddenCandidates, [nextCaptainId, nextViceCaptainId]);
    setSlotPlayerIds(arranged);
    setClearedInjurySlots([]);
    setCaptainId(nextCaptainId);
    setViceCaptainId(nextViceCaptainId);
    setHiddenGemId(nextHiddenGemId);
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
      hiddenGemId: keepIds.includes(hiddenGemId) ? hiddenGemId : undefined
    });
  };

  const restoreOriginal = () => {
    const lineup = originalLineup.current;
    if (!lineup) {
      setSlotPlayerIds(arrangeIdsForSlots([]));
      setClearedInjurySlots([]);
      setCaptainId("");
      setViceCaptainId("");
      setHiddenGemId("");
      return;
    }
    setSlotPlayerIds(arrangeIdsForSlots(lineup.playerIds));
    setClearedInjurySlots([]);
    setCaptainId(lineup.captainId);
    setViceCaptainId(lineup.viceCaptainId);
    setHiddenGemId(lineup.hiddenGemId);
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
        <section className="grid grid-cols-2 gap-2">
          <button type="button" onClick={() => applyAiRecommendation("full")} className="rounded-lg bg-ink p-3 text-sm font-black text-white">AI 추천 1 전면개편</button>
          <button type="button" onClick={() => applyAiRecommendation("medium")} className="rounded-lg bg-sol p-3 text-sm font-black text-white">AI 추천 2 중폭개편</button>
          <button type="button" onClick={() => applyAiRecommendation("light")} className="rounded-lg bg-field p-3 text-sm font-black text-white">AI 추천 3 부진자개편</button>
          <button type="button" onClick={restoreOriginal} className="rounded-lg border border-slate-200 bg-white p-3 text-sm font-black text-ink">원래로 되돌리기</button>
        </section>

        <BudgetBar used={validation.budget} />
        <BudgetTimeline selectedPlayers={selectedPlayers} />

        <section id="hidden-gem" className="rounded-lg border border-slate-200 p-3">
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
              const role = player ? roleLabel(player.id, { captainId, viceCaptainId, hiddenGemId }) : "";
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
                    <button type="button" onClick={() => setRecruitSlot(index)} className="w-full rounded-md border border-dashed border-slate-300 bg-white p-4 text-sm font-black text-slate-600">트레이드</button>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 p-3">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-black">캡틴 · 부캡틴 · 히든젬</h2>
            <span className="text-xs font-bold text-slate-500">{selectedRoleCount}/3명 선택</span>
          </div>
          <div className="grid gap-2">
            <label className="grid gap-1 text-sm font-bold">
              캡틴(포인트x2)
              <select className="rounded-md border border-slate-300 p-2 font-semibold" value={captainId} onChange={(event) => setCaptainId(event.target.value)}>
                <option value="">선택 필요</option>
                {selectedPlayers.map((player) => <option key={player.id} value={player.id}>{player.name} · {playerValueLabel(player)}</option>)}
              </select>
            </label>
            <label className="grid gap-1 text-sm font-bold">
              부캡틴(x1.5)
              <select className="rounded-md border border-slate-300 p-2 font-semibold" value={viceCaptainId} onChange={(event) => setViceCaptainId(event.target.value)}>
                <option value="">선택 필요</option>
                {selectedPlayers.filter((player) => player.id !== captainId).map((player) => <option key={player.id} value={player.id}>{player.name} · {playerValueLabel(player)}</option>)}
              </select>
            </label>
            <label className="grid gap-1 text-sm font-bold">
              히든젬(x2)
              <select className="rounded-md border border-slate-300 p-2 font-semibold" value={hiddenGemId} onChange={(event) => setHiddenGemId(event.target.value)}>
                <option value="">영입밸류 3별 이하 선수 선택</option>
                {hiddenGemCandidates.filter((player) => player.id !== captainId && player.id !== viceCaptainId).map((player) => <option key={player.id} value={player.id}>{player.name} · {playerValueLabel(player)}</option>)}
              </select>
            </label>
          </div>
          <p className="mt-3 text-xs font-semibold leading-relaxed text-slate-500">
            히든젬은 낮은 영입밸류 선수의 깜짝 활약을 노리는 선택으로, 영입밸류 2별 이하 선수만 가능
          </p>
        </section>

        {!validation.valid && <p className="rounded-lg bg-red-50 p-3 text-sm font-semibold text-red-700">{validation.errors.map((error) => rosterErrorMessages[error]).join(" ")}</p>}

        <section className="rounded-lg border border-slate-200 p-3">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h2 className="font-black">부상선수 현황</h2>
              <p className="text-xs font-semibold text-slate-500">우리팀 선수 중 질병, 상해, 부상 리스크가 있는 선수를 확인합니다.</p>
            </div>
            <span className="inline-flex min-w-10 shrink-0 items-center justify-center whitespace-nowrap rounded bg-red-50 px-2 py-1 text-xs font-black text-red-700">{injuredRows.length}명</span>
          </div>
          {injuredRows.length > 0 ? (
            <div className="grid gap-2">
              {injuredRows.map(({ player, injury, slotIndex }) => {
                const team = teams.find((item) => item.id === player.teamId);
                return (
                  <div key={`${player.id}-${slotIndex}`} className="flex items-center gap-3 rounded-lg bg-red-50 p-3">
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
            <p className="rounded-md bg-slate-50 p-3 text-sm font-semibold text-slate-600">현재 등록된 부상 선수는 없습니다.</p>
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
