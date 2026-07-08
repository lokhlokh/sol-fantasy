import type { HitterDailyStats, Lineup, TeamId, TeamMoundResult } from "@/types/domain";
import { players } from "@/data/players";
import { teams } from "@/data/teams";
import { mockUsers } from "@/data/mockUsers";
import { recommendLineup } from "./aiCoach";
import { scoreLineup } from "./scoringEngine";

function random(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

export function simulateGames(seed = 20260707) {
  const rand = random(seed);
  const hitterStats: Record<string, HitterDailyStats> = {};
  for (const player of players) {
    hitterStats[player.id] = {
      singles: Math.floor(rand() * 3),
      doubles: rand() > 0.72 ? 1 : 0,
      triples: rand() > 0.94 ? 1 : 0,
      homeRuns: rand() > 0.86 ? 1 : 0,
      rbi: Math.floor(rand() * 4),
      runs: Math.floor(rand() * 3),
      walks: rand() > 0.62 ? 1 : 0,
      stolenBases: rand() > 0.86 ? 1 : 0,
      hbp: rand() > 0.95 ? 1 : 0,
      strikeouts: Math.floor(rand() * 3),
      played: rand() > 0.08
    };
  }

  const moundResults = Object.fromEntries(
    teams.map((team) => [
      team.id,
      {
        teamId: team.id,
        winMargin: Math.floor(rand() * 13) - 5,
        isTie: rand() > 0.91,
        errors: Math.floor(rand() * 3),
        runsAllowed: Math.floor(rand() * 9)
      }
    ])
  ) as Record<TeamId, TeamMoundResult>;

  return { hitterStats, moundResults };
}

export function simulateDailyBoard(lineup: Lineup, seed = 20260707) {
  const results = simulateGames(seed);
  const userScore = scoreLineup({ lineup, players, ...results });
  const ai = recommendLineup(players, lineup.seasonTeamId);
  const aiScore = scoreLineup({ lineup: ai.lineup, players, ...results });
  const league = mockUsers.map((user, index) => {
    const rec = recommendLineup(players, user.seasonTeamId);
    const score = scoreLineup({ lineup: { ...rec.lineup, strategyCardId: index % 2 ? "ON_BASE" : "POWER_HIT" }, players, ...results });
    return {
      id: user.id,
      nickname: user.nickname,
      score: Math.ceil(score.totalScore + index * 3),
      badges: index === 0 ? ["오늘의 감독"] : index % 2 ? ["AI 킬러"] : ["히든젬 사인"]
    };
  });
  return { ...results, userScore, aiLineup: ai.lineup, aiScore, league };
}
