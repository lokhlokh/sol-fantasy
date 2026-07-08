"use client";

import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { players } from "@/data/players";
import { teams } from "@/data/teams";
import { recommendLineup } from "@/engine/aiCoach";
import { simulateGames } from "@/engine/simulator";
import { calculateHitterBaseScore, calculateTeamMoundScore, scoreLineup } from "@/engine/scoringEngine";
import { strategyCards } from "@/rules/strategyCards";
import { useLocalGameState } from "@/store/useLocalGameState";
import type { HitterDailyStats, Lineup, Player, PlayerScoreBreakdown, StrategyCardId, TeamId, TeamMoundResult } from "@/types/domain";

const emptyStats: HitterDailyStats = {
  singles: 0,
  doubles: 0,
  triples: 0,
  homeRuns: 0,
  rbi: 0,
  runs: 0,
  walks: 0,
  stolenBases: 0,
  hbp: 0,
  strikeouts: 0,
  played: false
};

const strategyRotation: StrategyCardId[] = ["POWER_HIT", "SPEED_BASEBALL", "ON_BASE", "CLUTCH_DAY", "UNDERDOG", "TEAM_ALL_IN"];

const solServiceTop3 = [
  { name: "SOL 오늘의 운세", note: "경기 보기 전 가볍게 보는 사주·운세 콘텐츠", cta: "운세 보기" },
  { name: "SOL 패밀리", note: "가족과 용돈, 모임, 생활비를 함께 관리하는 서비스", cta: "패밀리 만들기" },
  { name: "SOL 타로", note: "오늘의 선택을 재미있게 확인하는 짧은 타로 콘텐츠", cta: "타로 뽑기" }
];

function teamName(teamId: TeamId) {
  return teams.find((team) => team.id === teamId)?.name ?? teamId;
}

function teamShortName(teamId: TeamId) {
  return teams.find((team) => team.id === teamId)?.shortName ?? teamId;
}

function statLine(stats: HitterDailyStats) {
  if (!stats.played) return "출장 없음";
  const hits = stats.singles + stats.doubles + stats.triples + stats.homeRuns;
  return `${hits}안타, 홈런 ${stats.homeRuns}, 타점 ${stats.rbi}, 득점 ${stats.runs}, 볼넷 ${stats.walks}, 도루 ${stats.stolenBases}, 삼진 ${stats.strikeouts}`;
}

function signed(value: number) {
  return value > 0 ? `+${value}` : `${value}`;
}

function roleLabels(playerId: string, lineup: Lineup) {
  const labels: string[] = [];
  if (playerId === lineup.captainId) labels.push("캡틴");
  if (playerId === lineup.viceCaptainId) labels.push("부캡틴");
  if (playerId === lineup.hiddenGemId) labels.push("히든젬");
  return labels;
}

function roleInflation(row: PlayerScoreBreakdown) {
  const beforeRole = Math.ceil(row.baseScore + row.strategyBonus + row.hiddenGemBonus);
  return Math.max(0, row.finalScore - beforeRole);
}

function opponentFor(teamId: TeamId) {
  const index = teams.findIndex((team) => team.id === teamId);
  return teams[(index + 5) % teams.length];
}

function moundLine(result: TeamMoundResult) {
  const opponent = opponentFor(result.teamId);
  const ourRuns = result.isTie || result.winMargin >= 0 ? result.runsAllowed + Math.max(0, result.winMargin) : result.runsAllowed;
  const opponentRuns = result.isTie || result.winMargin <= 0 ? result.runsAllowed + Math.max(0, Math.abs(result.winMargin)) : result.runsAllowed;
  const outcome = result.isTie ? "무승부" : result.winMargin > 0 ? "승리" : "패배";
  return `상대 ${opponent.shortName}, ${ourRuns}:${opponentRuns} ${outcome} · 실책 ${result.errors}`;
}

function playerLookup(playerId: string) {
  return players.find((player) => player.id === playerId);
}

function baseScoreRow(player: Player, stats: HitterDailyStats) {
  return {
    player,
    stats,
    baseScore: calculateHitterBaseScore(stats)
  };
}

function contributorSummary(breakdowns: PlayerScoreBreakdown[]) {
  return [...breakdowns]
    .sort((a, b) => b.finalScore - a.finalScore)
    .slice(0, 3)
    .map((row) => {
      const player = playerLookup(row.playerId);
      if (!player) return `${row.playerId}(${row.finalScore}점)`;
      return `${player.name}(${row.finalScore}점)`;
    })
    .join(", ");
}

function buildMockLineupForTeam(teamId: TeamId, index: number): Lineup {
  const recommended = recommendLineup(players, teamId).lineup;
  const moundTeam = teams[(teams.findIndex((team) => team.id === teamId) + index) % teams.length].id;
  return {
    ...recommended,
    strategyCardId: strategyRotation[index % strategyRotation.length],
    bonusStrategyCardId: index % 2 === 0 ? strategyRotation[(index + 2) % strategyRotation.length] : undefined,
    teamMoundPick: moundTeam
  };
}

export default function ResultPage() {
  const { state } = useLocalGameState();

  if (!state.lineup) {
    return (
      <AppShell title="스탯">
        <div className="space-y-3">
          <p className="rounded-lg border border-slate-200 p-4 text-sm font-bold text-slate-600">
            아직 정산할 라인업이 없습니다. 먼저 오늘 운용할 8명을 확정해 주세요.
          </p>
          <Link href="/lineup" className="block rounded-lg bg-sol p-4 text-center font-black text-white">
            라인업 구성하기
          </Link>
          <Link href="/" className="block rounded-lg bg-ink p-4 text-center font-black text-white">
            덕아웃으로 돌아가기
          </Link>
        </div>
      </AppShell>
    );
  }

  const effectiveLineup: Lineup = {
    ...state.lineup,
    bonusStrategyCardId: state.hasSolTransactionToday ? state.bonusStrategyCardId ?? state.lineup.bonusStrategyCardId : undefined
  };
  const game = simulateGames(state.seed);
  const score = scoreLineup({ lineup: effectiveLineup, players, ...game });
  const selectedIds = new Set(effectiveLineup.playerIds);
  const selectedPlayers = effectiveLineup.playerIds.map(playerLookup).filter(Boolean) as Player[];
  const rows = selectedPlayers.map((player) => ({
    player,
    stats: game.hitterStats[player.id] ?? emptyStats,
    breakdown: score.playerBreakdowns.find((row) => row.playerId === player.id)
  }));
  const strategyNames = [
    `작전1 ${strategyCards[effectiveLineup.strategyCardId].name}`,
    effectiveLineup.bonusStrategyCardId ? `작전2 ${strategyCards[effectiveLineup.bonusStrategyCardId].name}` : undefined
  ].filter(Boolean);
  const moundResult = game.moundResults[effectiveLineup.teamMoundPick];
  const moundScore = calculateTeamMoundScore(moundResult);
  const nonTeamTop10 = players
    .filter((player) => !selectedIds.has(player.id))
    .map((player) => baseScoreRow(player, game.hitterStats[player.id] ?? emptyStats))
    .sort((a, b) => b.baseScore - a.baseScore)
    .slice(0, 10);
  const userTeamName = state.fantasyTeamName && !state.fantasyTeamName.includes("?") ? state.fantasyTeamName : "AI킬러";
  const top3BySeasonTeam = teams.map((team) => {
    const mockUsers = Array.from({ length: 5 }, (_, index) => {
      const lineup = buildMockLineupForTeam(team.id, index);
      const userScore = scoreLineup({ lineup, players, ...game });
      return {
        id: `${team.id}-U${index + 1}`,
        nickname: `${teamShortName(team.id)} 덕아웃${index + 1}`,
        totalScore: Math.ceil(userScore.totalScore + index * 3),
        contributors: contributorSummary(userScore.playerBreakdowns)
      };
    });
    const withCurrentUser =
      team.id === effectiveLineup.seasonTeamId
        ? [
            ...mockUsers,
            {
              id: "ME",
              nickname: userTeamName,
              totalScore: score.totalScore,
              contributors: contributorSummary(score.playerBreakdowns)
            }
          ]
        : mockUsers;

    return {
      team,
      rows: withCurrentUser.sort((a, b) => b.totalScore - a.totalScore).slice(0, 3)
    };
  });

  return (
    <AppShell title="스탯">
      <div className="space-y-5">
        <section className="space-y-3 rounded-lg border border-slate-200 p-3">
          <div>
            <p className="text-xs font-black text-sol">어제 정산</p>
            <h2 className="text-lg font-black text-ink">우리팀 박스스탯</h2>
            <p className="mt-1 text-xs font-semibold text-slate-500">{strategyNames.join(" · ")}</p>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-md bg-slate-50 p-2">
              <p className="text-[11px] font-bold text-slate-500">타자 점수</p>
              <p className="text-lg font-black text-ink">{score.hittersScore}</p>
            </div>
            <div className="rounded-md bg-slate-50 p-2">
              <p className="text-[11px] font-bold text-slate-500">마운드</p>
              <p className="text-lg font-black text-ink">{score.moundScore}</p>
            </div>
            <div className="rounded-md bg-sol p-2 text-white">
              <p className="text-[11px] font-bold text-blue-100">총점</p>
              <p className="text-lg font-black">{score.totalScore}</p>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-slate-500">마운드 기록</p>
                <p className="font-black text-ink">{moundLine(moundResult)}</p>
                <p className="mt-1 text-xs font-semibold text-slate-600">선택 마운드: {teamShortName(effectiveLineup.teamMoundPick)}</p>
              </div>
              <p className="rounded-full bg-ink px-3 py-1 text-sm font-black text-white">{moundScore}점</p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full min-w-[720px] border-collapse text-left text-[11px]">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-2 py-2 font-black">선수</th>
                  <th className="px-2 py-2 font-black">기록</th>
                  <th className="px-2 py-2 text-right font-black">기본</th>
                  <th className="px-2 py-2 text-right font-black">작전</th>
                  <th className="px-2 py-2 text-right font-black">히든젬</th>
                  <th className="px-2 py-2 text-right font-black">역할</th>
                  <th className="px-2 py-2 text-right font-black">최종</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(({ player, stats, breakdown }) => {
                  if (!breakdown) return null;
                  const labels = roleLabels(player.id, effectiveLineup);
                  return (
                    <tr key={player.id} className="border-t border-slate-200 align-top">
                      <td className="w-36 px-2 py-2">
                        <p className="font-black text-ink">{player.name}</p>
                        <p className="font-semibold text-slate-500">{player.id}</p>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {labels.map((label) => (
                            <span key={label} className="rounded-full bg-blue-50 px-1.5 py-0.5 text-[10px] font-black text-sol">
                              {label}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-2 py-2 font-semibold leading-relaxed text-slate-600">{statLine(stats)}</td>
                      <td className="px-2 py-2 text-right font-black text-ink">{breakdown.baseScore}</td>
                      <td className="px-2 py-2 text-right font-black text-ink">{signed(breakdown.strategyBonus)}</td>
                      <td className="px-2 py-2 text-right font-black text-ink">{signed(breakdown.hiddenGemBonus)}</td>
                      <td className="px-2 py-2 text-right font-black text-ink">{signed(roleInflation(breakdown))}</td>
                      <td className="px-2 py-2 text-right font-black text-sol">{breakdown.finalScore}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section className="space-y-2">
          <div>
            <p className="text-xs font-black text-sol">리그 스탯</p>
            <h2 className="text-lg font-black text-ink">어제의 Top 10 플레이어</h2>
          </div>
          {nonTeamTop10.map(({ player, stats, baseScore }, index) => (
            <article key={player.id} className="rounded-lg border border-slate-200 p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-black text-slate-400">#{index + 1}</p>
                  <p className="font-black text-ink">{player.name}</p>
                  <p className="text-xs font-semibold text-slate-500">
                    {player.id} · {teamName(player.teamId)}
                  </p>
                  <p className="mt-1 text-xs font-semibold leading-relaxed text-slate-600">{statLine(stats)}</p>
                </div>
                <p className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-sm font-black text-ink">{baseScore}점</p>
              </div>
            </article>
          ))}
        </section>

        <section className="space-y-2">
          <div>
            <h2 className="text-lg font-black text-ink">시즌팀별 어제의 Top 3 단장</h2>
          </div>
          {top3BySeasonTeam.map(({ team, rows: teamRows }) => (
            <article key={team.id} className="rounded-lg border border-slate-200 p-3">
              <p className="mb-2 font-black text-ink">{team.name}</p>
              <div className="space-y-2">
                {teamRows.map((user, index) => (
                  <div key={user.id} className="rounded-md bg-slate-50 p-2">
                    <p className="text-sm font-black text-ink">
                      {index + 1}. {user.nickname}(ID: {user.id}) {user.totalScore}점
                    </p>
                    <p className="mt-1 text-[11px] font-bold leading-relaxed text-slate-600">수훈선수: {user.contributors}</p>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </section>

        <section className="space-y-2 rounded-lg border border-slate-200 p-3">
          <div>
            <p className="text-xs font-black text-sol">Super SOL</p>
            <h2 className="text-lg font-black text-ink">추천하는 서비스 Top 3</h2>
          </div>
          {solServiceTop3.map((service, index) => (
            <a key={service.name} href="#" className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 p-3">
              <div>
                <p className="text-xs font-black text-sol">#{index + 1}</p>
                <p className="font-black text-ink">{service.name}</p>
                <p className="mt-1 text-xs font-semibold text-slate-600">{service.note}</p>
              </div>
              <span className="shrink-0 rounded-full bg-ink px-3 py-1 text-xs font-black text-white">{service.cta}</span>
            </a>
          ))}
        </section>
      </div>
    </AppShell>
  );
}
