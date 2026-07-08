"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { playerValueLabel } from "@/data/playerValue";
import { players } from "@/data/players";
import { teams } from "@/data/teams";
import { calculateHitterBaseScore, calculatePlayerStrategyBonus, calculateTeamMoundScore } from "@/engine/scoringEngine";
import { strategyCards } from "@/rules/strategyCards";
import { useLocalGameState } from "@/store/useLocalGameState";
import type { HitterDailyStats, Lineup, Player, StrategyCardId, TeamId, TeamMoundResult } from "@/types/domain";

type ModalName = "manual" | "strategy" | "mound" | "hiddenGem" | null;

const strategyIds = Object.keys(strategyCards) as StrategyCardId[];
const teamIds = teams.map((team) => team.id);
const manualReadKey = "sol-fantasy-manual-read";

function hashText(text: string) {
  return text.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
}

function formatPastDate(daysAgo: number) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return new Intl.DateTimeFormat("ko-KR", { timeZone: "Asia/Seoul", month: "numeric", day: "numeric" }).format(date);
}

function todayLabel() {
  return new Intl.DateTimeFormat("ko-KR", { timeZone: "Asia/Seoul", month: "long", day: "numeric" }).format(new Date());
}

function opponentFor(teamId: TeamId, offset: number) {
  const index = Math.max(0, teamIds.indexOf(teamId));
  const opponentId = teamIds[(index + offset + 1) % teamIds.length];
  return teams.find((team) => team.id === opponentId) ?? teams[0];
}

function recentMoundGames(teamId: TeamId) {
  const base = hashText(teamId);
  return Array.from({ length: 5 }, (_, index) => {
    const daysAgo = index + 1;
    const opponent = opponentFor(teamId, daysAgo);
    const runsFor = ((base + index * 5) % 8) + 1;
    const runsAllowed = (base + index * 3) % 7;
    const errors = (base + index) % 3 === 0 ? 0 : (base + index) % 2;
    const result: TeamMoundResult = {
      teamId,
      winMargin: runsFor - runsAllowed,
      isTie: runsFor === runsAllowed,
      errors,
      runsAllowed
    };
    return { date: formatPastDate(daysAgo), opponent, runsFor, runsAllowed, errors, impact: calculateTeamMoundScore(result) };
  });
}

function recentPlayerGames(player: Player) {
  const base = hashText(player.id);
  return Array.from({ length: 5 }, (_, index) => {
    const daysAgo = index + 1;
    const opponent = opponentFor(player.teamId, daysAgo + index);
    const stats: HitterDailyStats = {
      singles: (base + index * 2) % 4,
      doubles: (base + index) % 5 === 0 ? 1 : 0,
      triples: (base + index) % 17 === 0 ? 1 : 0,
      homeRuns: (base + index) % 7 === 0 ? 1 : 0,
      rbi: (base + index * 3) % 4,
      runs: (base + index * 4) % 3,
      walks: (base + index) % 4 === 0 ? 1 : 0,
      stolenBases: (base + index) % 6 === 0 ? 1 : 0,
      hbp: (base + index) % 19 === 0 ? 1 : 0,
      strikeouts: (base + index * 2) % 3,
      played: (base + index) % 11 !== 0
    };
    return { date: formatPastDate(daysAgo), opponent, stats, score: Math.ceil(calculateHitterBaseScore(stats)) };
  });
}

function average(values: number[]) {
  return Math.ceil(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function playerFiveDayTotal(player: Player) {
  return recentPlayerGames(player).reduce((sum, game) => sum + game.score, 0);
}

function strategyFiveDayScore(strategyCardId: StrategyCardId, analysisPlayers: Player[], seasonTeamId: TeamId, moundTeamId: TeamId) {
  const lineup: Lineup = {
    seasonTeamId,
    playerIds: analysisPlayers.map((player) => player.id),
    captainId: analysisPlayers[0]?.id ?? "",
    viceCaptainId: analysisPlayers[1]?.id ?? "",
    hiddenGemId: analysisPlayers.find((player) => player.priceStars <= 3)?.id ?? analysisPlayers[0]?.id ?? "",
    strategyCardId,
    teamMoundPick: moundTeamId
  };

  return analysisPlayers.reduce(
    (total, player) =>
      total +
      recentPlayerGames(player).reduce((sum, game) => {
        const baseScore = calculateHitterBaseScore(game.stats);
        return sum + calculatePlayerStrategyBonus(player, game.stats, baseScore, lineup);
      }, 0),
    0
  );
}

function celebrationBadges(playerId: string, captainPickId?: string, hiddenGemPickId?: string, lineup?: Lineup) {
  const badges = [
    playerId === captainPickId ? "내 캡틴 적중" : "",
    playerId === lineup?.viceCaptainId ? "내 부캡틴 적중" : "",
    playerId === hiddenGemPickId ? "내 히든젬 적중" : ""
  ].filter(Boolean);
  return [...new Set(badges)];
}

function DugoutCard({ title, value, detail, testId, onOpen }: { title: string; value: string; detail: string; testId: string; onOpen: () => void }) {
  return (
    <section className="rounded-lg border border-slate-200 p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-bold text-slate-500">{title}</p>
          <p className="mt-1 truncate font-black text-ink">{value}</p>
          <p className="mt-1 text-sm font-semibold text-slate-600">{detail}</p>
        </div>
        <button type="button" data-testid={testId} onClick={onOpen} className="shrink-0 rounded-md bg-ink px-3 py-2 text-sm font-black text-white">
          선택
        </button>
      </div>
    </section>
  );
}

function StrategyStatusCard({
  strategyCard,
  bonusStrategy,
  hasSolTransaction,
  onOpen
}: {
  strategyCard: { name: string; description: string };
  bonusStrategy?: { name: string; description: string };
  hasSolTransaction: boolean;
  onOpen: () => void;
}) {
  return (
    <section className="rounded-lg border border-slate-200 p-3">
      <div className="mb-3 flex items-start justify-between gap-3">
        <p className="text-xs font-bold text-slate-500">오늘의 작전</p>
        <button type="button" data-testid="open-strategy-modal" onClick={onOpen} className="shrink-0 rounded-md bg-ink px-3 py-2 text-sm font-black text-white">
          선택
        </button>
      </div>

      <div className="divide-y divide-slate-200 overflow-hidden rounded-md border border-slate-100">
        <div className="bg-white p-3">
          <p className="text-xs font-bold text-slate-500">작전 1</p>
          <p className="mt-1 font-black text-ink">{strategyCard.name}</p>
          <p className="mt-1 text-sm font-semibold text-slate-600">{strategyCard.description}</p>
        </div>
        <div className={hasSolTransaction ? "bg-white p-3" : "bg-amber-50 p-3"}>
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-bold text-slate-500">작전 2</p>
            <span className={`rounded px-2 py-1 text-[10px] font-black ${hasSolTransaction ? "bg-blue-50 text-sol" : "bg-amber-100 text-amber-800"}`}>
              {hasSolTransaction ? "사용 가능" : "SOL 거래 필요"}
            </span>
          </div>
          <p className="mt-1 font-black text-ink">{hasSolTransaction ? bonusStrategy?.name ?? "선택 필요" : "오늘은 SOL 거래가 없었네요"}</p>
          <p className="mt-1 text-sm font-semibold text-slate-600">
            {hasSolTransaction ? bonusStrategy?.description ?? "작전 설정에서 두 번째 작전을 선택하세요." : "거래를 완료하면 작전을 하나 더 선택할 수 있습니다."}
          </p>
        </div>
      </div>
    </section>
  );
}

function ModalShell({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-40 flex items-end bg-black/45">
      <section className="max-h-[82vh] w-full overflow-auto rounded-t-xl bg-white p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-xl font-black">{title}</h2>
          <button type="button" onClick={onClose} className="rounded-md border border-slate-200 px-3 py-2 text-sm font-bold">
            닫기
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}

function InsightSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-lg border border-slate-200 p-3">
      <h2 className="mb-2 font-black">{title}</h2>
      {children}
    </section>
  );
}

function EtfAdBox() {
  return (
    <section className="rounded-lg border border-blue-100 bg-blue-50 p-3">
      <div className="mb-2 flex items-center justify-between gap-3">
        <h2 className="font-black text-ink">지난 5일간 최고 수익률 ETF</h2>
        <span className="rounded bg-white px-2 py-1 text-[10px] font-black text-sol">모의 광고</span>
      </div>
      <div className="rounded-md bg-white p-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-black">SOL 미국AI반도체 ETF</p>
            <p className="mt-1 text-xs font-semibold text-slate-500">지난 5일 수익률 +8%</p>
          </div>
          <span className="rounded bg-blue-50 px-2 py-1 text-xs font-black text-sol">ETF</span>
        </div>
        <p className="mt-2 text-xs font-semibold text-slate-500">모의 데이터입니다. 실제 투자 판단 전 상품 설명서와 위험 정보를 확인하세요.</p>
        <a href="https://www.shinhansec.com/" target="_blank" rel="noreferrer" className="mt-3 block rounded-md bg-sol p-3 text-center text-sm font-black text-white">
          신한투자증권에서 ETF 보기
        </a>
      </div>
    </section>
  );
}

function AiRecommendationBox({ coach, title, children }: { coach: string; title: string; children: ReactNode }) {
  return (
    <div className="mb-3 rounded-lg border border-blue-100 bg-blue-50 p-3">
      <div className="mb-1 flex items-center justify-between gap-3">
        <p className="text-xs font-black text-sol">{coach}</p>
        <span className="rounded bg-white px-2 py-1 text-[10px] font-black text-sol">추천</span>
      </div>
      <p className="font-black text-ink">{title}</p>
      <div className="mt-1 text-sm font-semibold text-slate-600">{children}</div>
    </div>
  );
}

function ManagerGuideCard({
  managerName,
  manualRead,
  lineupReady,
  hasSolTransaction,
  collectedCards,
  onOpen
}: {
  managerName: string;
  manualRead: boolean;
  lineupReady: boolean;
  hasSolTransaction: boolean;
  collectedCards: number;
  onOpen: () => void;
}) {
  if (!manualRead) {
    return (
      <button type="button" onClick={onOpen} className="w-full rounded-lg border border-blue-100 bg-blue-50 p-3 text-left">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-black text-sol">입문자 매뉴얼</p>
            <h2 className="mt-1 text-lg font-black text-ink">단장 취임을 축하합니다</h2>
            <p className="mt-1 text-sm font-semibold leading-relaxed text-slate-600">
              오늘의 작전, 마운드, 히든젬을 정하고 리그 랭킹과 친구 미니리그에서 보상에 도전하는 방법을 먼저 확인해 보세요.
            </p>
          </div>
          <span className="shrink-0 rounded-md bg-sol px-3 py-2 text-xs font-black text-white">시작</span>
        </div>
      </button>
    );
  }

  const achievements = [
    { label: "라인업 구성", done: lineupReady },
    { label: "SOL 작전권", done: hasSolTransaction },
    { label: "선수카드 수집", done: collectedCards > 0 },
  ];

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black text-sol">MY ROOM</p>
          <h2 className="mt-1 text-lg font-black text-ink">{managerName} 단장의 방</h2>
          <p className="mt-1 text-sm font-semibold text-slate-600">오늘의 운영 기록과 달성 현황을 모아둡니다.</p>
        </div>
        <button type="button" onClick={onOpen} className="shrink-0 rounded-md bg-ink px-3 py-2 text-xs font-black text-white">
          매뉴얼
        </button>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {achievements.map((item) => (
          <div key={item.label} className={`rounded-md p-2 text-center text-xs font-black ${item.done ? "bg-blue-50 text-sol" : "bg-slate-100 text-slate-500"}`}>
            <p>{item.done ? "완료" : "진행중"}</p>
            <p className="mt-1">{item.label}</p>
          </div>
        ))}
      </div>
      <button type="button" onClick={onOpen} className="mt-3 w-full rounded-md border border-slate-200 p-2 text-sm font-black text-ink">
        게임 운영방법 다시 보기
      </button>
    </section>
  );
}

function ManagerManual({ managerName, onComplete }: { managerName: string; onComplete: () => void }) {
  const steps = [
    { title: "1. 라인업을 구성합니다", body: "포수, 내야, 외야 슬롯에 8명을 채우고 캡틴, 부캡틴, 히든젬을 지정합니다. 부상 선수가 있으면 교체해서 점수 손실을 줄입니다." },
    { title: "2. 오늘의 작전을 선택합니다", body: "작전 1은 기본 선택이고, SOL 거래를 완료하면 작전을 하나 더 선택할 수 있습니다. AI 코치 추천을 참고해 보너스가 큰 작전을 고릅니다." },
    { title: "3. 오늘의 마운드를 고릅니다", body: "10개 팀의 오늘 상대와 지난 5일간 기록을 보고, 우리 점수에 가장 도움이 될 마운드를 선택합니다." },
    { title: "4. 히든젬으로 역전을 노립니다", body: "영입밸류가 낮지만 최근 기록이 좋은 선수를 히든젬으로 고르면 예상보다 큰 보너스를 얻을 수 있습니다." },
    { title: "5. 리그 랭킹과 친구 미니리그에 도전합니다", body: "일별, 월별, 시즌별 랭킹에서 상품을 노리고, 친구 미니리그에서는 순위 변화 그래프로 경쟁 흐름을 확인합니다." },
    { title: "6. 야구지식과 보상을 함께 겨룹니다", body: "선수 컨디션, 상대 팀, 작전 궁합을 읽는 야구지식이 좋은 라인업으로 이어지고, 좋은 라인업은 보상권에 가까워집니다." },
  ];

  return (
    <div className="space-y-3">
      <section className="rounded-lg bg-blue-50 p-3">
        <p className="text-xs font-black text-sol">WELCOME</p>
        <h3 className="mt-1 text-xl font-black text-ink">{managerName} 단장님, 취임을 축하합니다</h3>
        <p className="mt-2 text-sm font-semibold leading-relaxed text-slate-600">
          이 게임은 매일 KBO 데이터를 읽고 작전, 라인업, 마운드, 히든젬을 선택해 친구와 리그 단장들과 겨루는 판타지 야구 운영 게임입니다.
        </p>
      </section>

      {steps.map((step) => (
        <section key={step.title} className="rounded-lg border border-slate-200 p-3">
          <h4 className="font-black text-ink">{step.title}</h4>
          <p className="mt-1 text-sm font-semibold leading-relaxed text-slate-600">{step.body}</p>
        </section>
      ))}

      <section className="rounded-lg bg-amber-50 p-3">
        <p className="font-black text-ink">운영 팁</p>
        <p className="mt-1 text-sm font-semibold leading-relaxed text-slate-700">
          덕아웃에서 오늘의 방향을 정하고, 라인업에서 선수를 관리한 뒤, 스탯과 리그 랭킹으로 결과를 복기하면 다음 날 더 좋은 선택을 할 수 있습니다.
        </p>
      </section>

      <button type="button" onClick={onComplete} className="w-full rounded-lg bg-sol p-3 font-black text-white">
        매뉴얼 확인 완료
      </button>
    </div>
  );
}

export default function HomePage() {
  const { state, setStrategy, setBonusStrategy, setSolTransactionToday, setHiddenGem } = useLocalGameState();
  const [modal, setModal] = useState<ModalName>(null);
  const [manualRead, setManualRead] = useState(false);
  const team = teams.find((item) => item.id === state.seasonTeamId);
  const fantasyTeamName = state.fantasyTeamName ?? "AI킬러";
  const managerId = state.managerNickname ?? "홍길동";
  const seasonTeamId = state.seasonTeamId ?? "KIA";
  const strategyCardId = state.strategyCardId ?? state.lineup?.strategyCardId ?? "POWER_HIT";
  const moundTeamId = state.teamMoundPick ?? state.lineup?.teamMoundPick ?? state.seasonTeamId ?? "KIA";
  const moundTeam = teams.find((item) => item.id === moundTeamId);
  const todayOpponent = opponentFor(moundTeamId, 0);
  const strategyCard = strategyCards[strategyCardId];
  const bonusStrategy = state.bonusStrategyCardId ? strategyCards[state.bonusStrategyCardId] : undefined;
  const hasSolTransaction = Boolean(state.hasSolTransactionToday);
  const selectedPlayers = (state.lineup?.playerIds ?? []).map((id) => players.find((player) => player.id === id)).filter(Boolean) as Player[];
  const analysisPlayers = selectedPlayers.length > 0 ? selectedPlayers : players.filter((player) => player.teamId === seasonTeamId).slice(0, 8);
  const hiddenGem = players.find((player) => player.id === state.lineup?.hiddenGemId);
  const hiddenGemCandidates = selectedPlayers.filter((player) => player.priceStars <= 3 && player.id !== state.lineup?.captainId && player.id !== state.lineup?.viceCaptainId);
  const strategyRankings = strategyIds
    .map((id) => ({ id, score: strategyFiveDayScore(id, analysisPlayers, seasonTeamId, moundTeamId) }))
    .sort((a, b) => b.score - a.score);
  const aiStrategyOne = strategyRankings[0];
  const aiStrategyTwo = strategyRankings.find((row) => row.id !== aiStrategyOne?.id);
  const moundRankings = teams
    .map((item) => {
      const recent = recentMoundGames(item.id);
      return { team: item, avgImpact: average(recent.map((game) => game.impact)), todayOpponent: opponentFor(item.id, 0) };
    })
    .sort((a, b) => b.avgImpact - a.avgImpact);
  const aiMound = moundRankings[0];
  const topPlayers = [...analysisPlayers]
    .map((player) => ({ player, total: playerFiveDayTotal(player), games: recentPlayerGames(player) }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 3);
  const aiHiddenGem = hiddenGemCandidates
    .map((player) => ({ player, avgScore: average(recentPlayerGames(player).map((game) => game.score)) }))
    .sort((a, b) => b.avgScore - a.avgScore)[0];
  const worstPlayer = [...analysisPlayers]
    .map((player) => ({ player, total: playerFiveDayTotal(player), games: recentPlayerGames(player) }))
    .sort((a, b) => a.total - b.total)[0];
  const celebrationCaptainId = topPlayers[0]?.player.id ?? state.lineup?.captainId;
  const celebrationHiddenGemId = topPlayers.find(({ player }) => player.id !== celebrationCaptainId && player.priceStars <= 3)?.player.id ?? topPlayers.find(({ player }) => player.id !== celebrationCaptainId)?.player.id ?? state.lineup?.hiddenGemId;

  useEffect(() => {
    setManualRead(window.localStorage.getItem(manualReadKey) === "done");
  }, []);

  const completeManual = () => {
    window.localStorage.setItem(manualReadKey, "done");
    setManualRead(true);
    setModal(null);
  };

  const title = (
    <span className="flex flex-wrap items-center gap-2">
      <span>{todayLabel()}</span>
      {team && (
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-black text-white" style={{ background: team.color }}>
          {team.shortName}
        </span>
      )}
      <span>
        {fantasyTeamName}의 덕아웃
        <span className="ml-1 text-sm font-black text-slate-600">(단장: {managerId})</span>
      </span>
    </span>
  );

  return (
    <AppShell title={title}>
      <div className="space-y-3">
        <ManagerGuideCard
          managerName={managerId}
          manualRead={manualRead}
          lineupReady={Boolean(state.lineup)}
          hasSolTransaction={hasSolTransaction}
          collectedCards={3}
          onOpen={() => setModal("manual")}
        />
        <StrategyStatusCard strategyCard={strategyCard} bonusStrategy={bonusStrategy} hasSolTransaction={hasSolTransaction} onOpen={() => setModal("strategy")} />
        <DugoutCard title="오늘의 마운드" value={moundTeam?.name ?? "마운드 미설정"} detail={`오늘 상대: ${todayOpponent.name}. 지난 5일간 기록을 보고 선택하세요.`} testId="open-mound-modal" onOpen={() => setModal("mound")} />
        <DugoutCard
          title="오늘의 히든젬"
          value={hiddenGem?.name ?? "히든젬 미설정"}
          detail={hiddenGem ? playerValueLabel(hiddenGem) : "후보의 지난 5일간 기록을 보고 지정하세요."}
          testId="open-hidden-gem-modal"
          onOpen={() => setModal("hiddenGem")}
        />

        <div className="pt-2">
          <p className="mb-2 text-xs font-black uppercase tracking-[0.16em] text-sol">지난 5일 분석</p>
          <div className="space-y-3">
            <InsightSection title="최고의 작전">
              <div className="grid gap-2">
                {strategyRankings.slice(0, 2).map((row, index) => (
                  <div key={row.id} className="flex items-center justify-between gap-3 rounded-md bg-slate-50 p-3 text-sm">
                    <div>
                      <p className="text-xs font-bold text-slate-500">작전 {index + 1} 후보</p>
                      <p className="font-black">{strategyCards[row.id].name}</p>
                    </div>
                    <span className="rounded bg-white px-2 py-1 text-xs font-black">{row.score}점</span>
                  </div>
                ))}
              </div>
              <p className="mt-2 text-xs font-semibold text-slate-500">현재 라인업 기준으로 지난 5일간 작전 보너스를 합산했습니다.</p>
            </InsightSection>

            <InsightSection title="Top 3 수훈선수">
              <div className="grid gap-2">
                {topPlayers.map(({ player, total, games }, index) => {
                  const badges = celebrationBadges(player.id, celebrationCaptainId, celebrationHiddenGemId, state.lineup);
                  return (
                    <div key={player.id} className="rounded-md bg-slate-50 p-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate font-black">
                            {index + 1}. {player.name}
                          </p>
                          {badges.length > 0 && (
                            <div className="mt-1 flex flex-wrap gap-1">
                              {badges.map((badge) => (
                                <span key={badge} className="rounded bg-sol px-2 py-0.5 text-[10px] font-black text-white">
                                  {badge}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <span className="rounded bg-white px-2 py-1 text-xs font-black">{total}점</span>
                      </div>
                      <p className="mt-1 text-xs font-semibold text-slate-500">{games.map((game) => `${game.date} ${game.score}점`).join(" · ")}</p>
                    </div>
                  );
                })}
              </div>
            </InsightSection>

            {worstPlayer && (
              <InsightSection title="기여가 부족한 선수">
                <div className="rounded-md bg-red-50 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-black text-red-900">{worstPlayer.player.name}</p>
                    <span className="rounded bg-white px-2 py-1 text-xs font-black text-red-700">{worstPlayer.total}점</span>
                  </div>
                  <p className="mt-1 text-xs font-semibold text-red-700">{worstPlayer.games.map((game) => `${game.date} ${game.score}점`).join(" · ")}</p>
                </div>
              </InsightSection>
            )}
            <EtfAdBox />
          </div>
        </div>

        {modal === "manual" && (
          <ModalShell title={manualRead ? `${managerId} 단장의 매뉴얼` : "단장 취임 매뉴얼"} onClose={() => setModal(null)}>
            <ManagerManual managerName={managerId} onComplete={completeManual} />
          </ModalShell>
        )}

        {modal === "strategy" && (
          <ModalShell title="오늘의 작전 설정" onClose={() => setModal(null)}>
            <div className="space-y-4">
              <AiRecommendationBox coach="AI 수석코치 추천" title={`작전 1은 ${strategyCards[aiStrategyOne?.id ?? strategyCardId].name}`}>
                <p>지난 5일 기준 보너스 효율을 우선했습니다.</p>
              </AiRecommendationBox>
              <AiRecommendationBox coach="AI 타격코치 추천" title={`작전 2 후보는 ${aiStrategyTwo ? strategyCards[aiStrategyTwo.id].name : "추가 분석 필요"}`}>
                <p>SOL 거래가 있으면 두 번째 작전으로 선택할 수 있습니다.</p>
              </AiRecommendationBox>
              <section>
                <p className="mb-2 text-sm font-black">작전 1</p>
                <div className="grid gap-2">
                  {strategyIds.map((id) => (
                    <button key={id} type="button" onClick={() => setStrategy(id, moundTeamId)} className={`rounded-lg border p-3 text-left ${strategyCardId === id ? "border-sol bg-blue-50" : "border-slate-200"}`}>
                      <p className="font-black">{strategyCards[id].name}</p>
                      <p className="text-sm text-slate-600">{strategyCards[id].description}</p>
                    </button>
                  ))}
                </div>
              </section>

              <section className="rounded-lg border border-slate-200 p-3">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <p className="text-sm font-black">작전 2</p>
                  <span className={`rounded px-2 py-1 text-xs font-black ${hasSolTransaction ? "bg-blue-50 text-sol" : "bg-slate-100 text-slate-500"}`}>{hasSolTransaction ? "SOL 거래 확인" : "잠김"}</span>
                </div>
                {hasSolTransaction ? (
                  <div className="grid gap-2">
                    {strategyIds.map((id) => (
                      <button key={id} type="button" onClick={() => setBonusStrategy(id)} className={`rounded-lg border p-3 text-left ${state.bonusStrategyCardId === id ? "border-sol bg-blue-50" : "border-slate-200"}`}>
                        <p className="font-black">{strategyCards[id].name}</p>
                        <p className="text-sm text-slate-600">{strategyCards[id].description}</p>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-slate-600">오늘은 SOL 거래가 없었네요. SOL 거래를 완료하면 작전을 하나 더 선택할 수 있습니다.</p>
                    <button type="button" onClick={() => setSolTransactionToday(true)} className="w-full rounded-lg bg-sol p-3 font-black text-white">
                      지금 SOL 거래하고 작전 2 열기
                    </button>
                  </div>
                )}
              </section>
            </div>
          </ModalShell>
        )}

        {modal === "mound" && (
          <ModalShell title="오늘의 마운드 설정" onClose={() => setModal(null)}>
            <AiRecommendationBox coach="AI 투수코치 추천" title={`${aiMound?.team.name ?? "추천 팀 분석 중"}`}>
              오늘 상대는 {aiMound?.todayOpponent.name ?? "확인 중"}이고, 지난 5일 평균 영향도는 {aiMound?.avgImpact ?? 0}점입니다.
            </AiRecommendationBox>
            <div className="grid gap-2">
              {teams.map((item) => {
                const recent = recentMoundGames(item.id);
                const avgImpact = average(recent.map((game) => game.impact));
                const opponentToday = opponentFor(item.id, 0);
                return (
                  <button key={item.id} type="button" onClick={() => setStrategy(strategyCardId, item.id)} className={`rounded-lg border p-3 text-left ${moundTeamId === item.id ? "border-sol bg-blue-50" : "border-slate-200"}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-black text-white" style={{ background: item.color }}>
                            {item.shortName}
                          </span>
                          <p className="truncate font-black">{item.name}</p>
                        </div>
                        <p className="mt-1 text-xs font-semibold text-slate-500">오늘 상대: {opponentToday.name}</p>
                      </div>
                      <span className="shrink-0 rounded bg-slate-100 px-2 py-1 text-xs font-black">평균 {avgImpact}점</span>
                    </div>
                    <p className="mt-3 text-xs font-black text-slate-500">지난 5일간 기록</p>
                    <div className="mt-2 grid gap-1 text-xs font-semibold text-slate-600">
                      {recent.map((game) => (
                        <div key={`${item.id}-${game.date}-${game.opponent.id}`} className="grid grid-cols-[54px_1fr_44px] gap-2 rounded bg-slate-50 p-2">
                          <span>{game.date}</span>
                          <span className="truncate">vs {game.opponent.name} · {game.runsFor}:{game.runsAllowed}</span>
                          <span className="text-right font-black">{game.impact}점</span>
                        </div>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </ModalShell>
        )}

        {modal === "hiddenGem" && (
          <ModalShell title="히든젬 추천 선수의 지난 5일간 기록" onClose={() => setModal(null)}>
            {!state.lineup ? (
              <div className="space-y-3 rounded-lg bg-amber-50 p-3 text-sm font-semibold text-amber-800">
                <p>라인업을 먼저 구성하면 히든젬 후보를 비교할 수 있습니다.</p>
                <Link href="/lineup" className="block rounded-md bg-ink p-3 text-center font-black text-white">
                  라인업 구성하기
                </Link>
              </div>
            ) : (
              <div className="grid gap-2">
                {aiHiddenGem && (
                  <AiRecommendationBox coach="AI 2군감독 추천" title={`${aiHiddenGem.player.name}`}>
                    영입밸류 3별 이하 후보 중 지난 5일 평균 {aiHiddenGem.avgScore}점으로 가장 안정적인 히든젬 후보입니다.
                  </AiRecommendationBox>
                )}
                {hiddenGemCandidates.map((player) => {
                  const recent = recentPlayerGames(player);
                  const avgScore = average(recent.map((game) => game.score));
                  return (
                    <button key={player.id} type="button" onClick={() => setHiddenGem(player.id)} className={`rounded-lg border p-3 text-left ${hiddenGem?.id === player.id ? "border-sol bg-blue-50" : "border-slate-200"}`}>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-black">{player.name}</p>
                          <p className="text-xs font-semibold text-slate-500">{playerValueLabel(player)}</p>
                        </div>
                        <span className="rounded bg-slate-100 px-2 py-1 text-xs font-black">5일 평균 {avgScore}점</span>
                      </div>
                      <p className="mt-3 text-xs font-black text-slate-500">지난 5일간 기록</p>
                      <div className="mt-2 grid gap-1 text-xs font-semibold text-slate-600">
                        {recent.map((game) => (
                          <div key={`${player.id}-${game.date}-${game.opponent.id}`} className="grid grid-cols-[54px_1fr_44px] gap-2 rounded bg-slate-50 p-2">
                            <span>{game.date}</span>
                            <span className="truncate">
                              vs {game.opponent.name} · {game.stats.singles + game.stats.doubles + game.stats.triples + game.stats.homeRuns}안 {game.stats.homeRuns}홈 {game.stats.rbi}타점
                            </span>
                            <span className="text-right font-black">{game.score}점</span>
                          </div>
                        ))}
                      </div>
                    </button>
                  );
                })}
                {hiddenGemCandidates.length === 0 && <p className="rounded-lg bg-slate-50 p-3 text-sm font-semibold text-slate-600">현재 라인업에는 교체 가능한 영입밸류 3별 이하 후보가 없습니다.</p>}
              </div>
            )}
          </ModalShell>
        )}
      </div>
    </AppShell>
  );
}
