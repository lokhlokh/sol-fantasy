import type { HitterDailyStats, Lineup, Player, PlayerScoreBreakdown, StrategyCardId, TeamId, TeamMoundResult } from "@/types/domain";
import { hiddenGemBonusCap, hiddenGemBonusRate, hitterScoring, strategyBonusCap } from "@/rules/scoringRules";

export function calculateHitterBaseScore(stats: HitterDailyStats): number {
  if (!stats.played) return 0;
  return (
    stats.singles * hitterScoring.singles +
    stats.doubles * hitterScoring.doubles +
    stats.triples * hitterScoring.triples +
    stats.homeRuns * hitterScoring.homeRuns +
    stats.rbi * hitterScoring.rbi +
    stats.runs * hitterScoring.runs +
    stats.walks * hitterScoring.walks +
    stats.stolenBases * hitterScoring.stolenBases +
    stats.hbp * hitterScoring.hbp +
    stats.strikeouts * hitterScoring.strikeouts
  );
}

function calculateStrategyCardBonus(player: Player, stats: HitterDailyStats, baseScore: number, lineup: Lineup, strategyCardId: StrategyCardId): number {
  if (!stats.played) return 0;
  let rawBonus = 0;
  switch (strategyCardId) {
    case "POWER_HIT":
      rawBonus = (stats.doubles * 5 + stats.triples * 7 + stats.homeRuns * 10) * 0.2;
      break;
    case "SPEED_BASEBALL":
      rawBonus = stats.stolenBases * 5 * 0.5;
      break;
    case "ON_BASE":
      rawBonus = (stats.walks * 2 + stats.hbp * 2) * 0.5;
      break;
    case "CLUTCH_DAY":
      rawBonus = stats.rbi * 2 * 0.5;
      break;
    case "UNDERDOG":
      rawBonus = player.priceStars <= 5 ? baseScore * 0.2 : 0;
      break;
    case "TEAM_ALL_IN":
      rawBonus = player.teamId === lineup.seasonTeamId ? baseScore * 0.1 : 0;
      break;
  }
  return Math.ceil(rawBonus);
}

export function calculatePlayerStrategyBonus(player: Player, stats: HitterDailyStats, baseScore: number, lineup: Lineup): number {
  const primary = calculateStrategyCardBonus(player, stats, baseScore, lineup, lineup.strategyCardId);
  const bonus = lineup.bonusStrategyCardId ? calculateStrategyCardBonus(player, stats, baseScore, lineup, lineup.bonusStrategyCardId) : 0;
  return primary + bonus;
}

export function calculateHiddenGemBonus(playerId: string, baseScore: number, lineup: Lineup): number {
  if (playerId !== lineup.hiddenGemId) return 0;
  return Math.min(hiddenGemBonusCap, Math.ceil(Math.max(0, baseScore * hiddenGemBonusRate)));
}

export function calculateTeamMoundScore(result: TeamMoundResult): number {
  const outcome = result.isTie ? 10 : result.winMargin >= 5 ? 50 : result.winMargin > 0 ? 30 : 0;
  const defense = result.errors === 0 ? 10 : result.errors * -10;
  const runs = result.runsAllowed <= 2 ? 15 : result.runsAllowed >= 6 ? -10 : 0;
  return outcome + defense + runs;
}

export function scoreLineup(params: {
  lineup: Lineup;
  players: Player[];
  hitterStats: Record<string, HitterDailyStats>;
  moundResults: Record<TeamId, TeamMoundResult>;
}) {
  const selected = params.lineup.playerIds.map((id) => params.players.find((player) => player.id === id)).filter(Boolean) as Player[];
  let remainingStrategyCap = strategyBonusCap;
  const captainPlayed = params.hitterStats[params.lineup.captainId]?.played ?? false;

  const playerBreakdowns: PlayerScoreBreakdown[] = selected.map((player) => {
    const stats = params.hitterStats[player.id] ?? {
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
    const baseScore = calculateHitterBaseScore(stats);
    const rawStrategyBonus = calculatePlayerStrategyBonus(player, stats, baseScore, params.lineup);
    const strategyBonus = Math.min(remainingStrategyCap, rawStrategyBonus);
    remainingStrategyCap -= strategyBonus;
    const hiddenGemBonus = calculateHiddenGemBonus(player.id, baseScore, params.lineup);
    const multiplier =
      player.id === params.lineup.captainId ? 2 : player.id === params.lineup.viceCaptainId && !captainPlayed ? 2 : player.id === params.lineup.viceCaptainId ? 1.5 : 1;

    return {
      playerId: player.id,
      baseScore,
      strategyBonus,
      hiddenGemBonus,
      multiplier,
      finalScore: Math.ceil((baseScore + strategyBonus + hiddenGemBonus) * multiplier),
      played: stats.played
    };
  });

  const moundScore = calculateTeamMoundScore(params.moundResults[params.lineup.teamMoundPick]);
  const hittersScore = playerBreakdowns.reduce((sum, row) => sum + row.finalScore, 0);

  return {
    playerBreakdowns,
    moundScore,
    strategyBonus: playerBreakdowns.reduce((sum, row) => sum + row.strategyBonus, 0),
    hiddenGemBonus: playerBreakdowns.reduce((sum, row) => sum + row.hiddenGemBonus, 0),
    hittersScore,
    totalScore: Math.ceil(hittersScore + moundScore)
  };
}
