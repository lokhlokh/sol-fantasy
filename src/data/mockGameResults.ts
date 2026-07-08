import type { HitterDailyStats, TeamId, TeamMoundResult } from "@/types/domain";

export type MockGameResults = {
  hitterStats: Record<string, HitterDailyStats>;
  moundResults: Record<TeamId, TeamMoundResult>;
};

export const emptyStats: HitterDailyStats = {
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
  played: true
};
