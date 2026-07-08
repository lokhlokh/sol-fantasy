import { describe, expect, it } from "vitest";
import type { Lineup, Player, TeamMoundResult } from "@/types/domain";
import { calculateHitterBaseScore, calculatePlayerStrategyBonus, calculateTeamMoundScore, scoreLineup } from "@/engine/scoringEngine";

const player: Player = {
  id: "KIA-01",
  name: "KIA Mock Player 01",
  teamId: "KIA",
  positions: ["C"],
  primaryPosition: "C",
  priceStars: 3,
  recentForm: 80,
  projectedScore: 20
};

const lineup: Lineup = {
  seasonTeamId: "KIA",
  playerIds: ["KIA-01", "KIA-02"],
  captainId: "KIA-01",
  viceCaptainId: "KIA-02",
  hiddenGemId: "KIA-02",
  strategyCardId: "POWER_HIT",
  teamMoundPick: "KIA"
};

const goldenStats = {
  singles: 1,
  doubles: 1,
  triples: 0,
  homeRuns: 1,
  rbi: 2,
  runs: 1,
  walks: 1,
  stolenBases: 0,
  hbp: 0,
  strikeouts: 1,
  played: true
};

describe("scoring engine golden cases", () => {
  it("calculates hitter base score", () => {
    expect(calculateHitterBaseScore(goldenStats)).toBe(23);
  });

  it("returns zero when player did not play", () => {
    expect(calculateHitterBaseScore({ ...goldenStats, played: false })).toBe(0);
  });

  it("doubles captain score", () => {
    const result = scoreLineup({
      lineup,
      players: [
        player,
        { ...player, id: "KIA-02", primaryPosition: "CENTER_INFIELD" }
      ],
      hitterStats: {
        "KIA-01": goldenStats,
        "KIA-02": { ...goldenStats, singles: 0, doubles: 0, homeRuns: 0, rbi: 10 }
      },
      moundResults: { KIA: { teamId: "KIA", winMargin: 0, isTie: true, errors: 0, runsAllowed: 3 } } as never
    });
    expect(result.playerBreakdowns[0].multiplier).toBe(2);
  });

  it("uses vice captain as 2x fallback when captain is out", () => {
    const result = scoreLineup({
      lineup,
      players: [
        player,
        { ...player, id: "KIA-02", primaryPosition: "CENTER_INFIELD" }
      ],
      hitterStats: {
        "KIA-01": { ...goldenStats, played: false },
        "KIA-02": { ...goldenStats, singles: 0, doubles: 0, homeRuns: 0, rbi: 10 }
      },
      moundResults: { KIA: { teamId: "KIA", winMargin: 0, isTie: true, errors: 0, runsAllowed: 3 } } as never
    });
    expect(result.playerBreakdowns[1].multiplier).toBe(2);
  });

  it("calculates hidden gem bonus", () => {
    const result = scoreLineup({
      lineup,
      players: [
        player,
        { ...player, id: "KIA-02", primaryPosition: "CENTER_INFIELD" }
      ],
      hitterStats: { "KIA-01": goldenStats, "KIA-02": { ...goldenStats, singles: 10, doubles: 0, homeRuns: 0 } },
      moundResults: { KIA: { teamId: "KIA", winMargin: 0, isTie: true, errors: 0, runsAllowed: 3 } } as never
    });
    expect(result.playerBreakdowns[1].hiddenGemBonus).toBe(10);
  });

  it("rounds hidden gem fractional bonus up", () => {
    const result = scoreLineup({
      lineup,
      players: [
        player,
        { ...player, id: "KIA-02", primaryPosition: "CENTER_INFIELD" }
      ],
      hitterStats: { "KIA-01": goldenStats, "KIA-02": { ...goldenStats, singles: 0, doubles: 1, homeRuns: 0, rbi: 0, runs: 0, walks: 0, strikeouts: 0 } },
      moundResults: { KIA: { teamId: "KIA", winMargin: 0, isTie: true, errors: 0, runsAllowed: 3 } } as never
    });
    expect(result.playerBreakdowns[1].hiddenGemBonus).toBe(2);
  });

  it("calculates power hit bonus", () => {
    expect(calculatePlayerStrategyBonus(player, { ...goldenStats, doubles: 1, homeRuns: 1 }, 23, lineup)).toBe(3);
  });

  it("calculates speed baseball bonus", () => {
    expect(calculatePlayerStrategyBonus(player, { ...goldenStats, stolenBases: 2 }, 23, { ...lineup, strategyCardId: "SPEED_BASEBALL" })).toBe(5);
  });

  it("calculates on base bonus", () => {
    expect(calculatePlayerStrategyBonus(player, { ...goldenStats, walks: 2, hbp: 1 }, 23, { ...lineup, strategyCardId: "ON_BASE" })).toBe(3);
  });

  it("calculates clutch day bonus", () => {
    expect(calculatePlayerStrategyBonus(player, { ...goldenStats, rbi: 4 }, 23, { ...lineup, strategyCardId: "CLUTCH_DAY" })).toBe(4);
  });

  it("rounds strategy fractional bonus up", () => {
    expect(calculatePlayerStrategyBonus(player, { ...goldenStats, doubles: 1, triples: 0, homeRuns: 0 }, 23, lineup)).toBe(1);
  });

  it("rounds vice captain fractional final score up", () => {
    const result = scoreLineup({
      lineup: { ...lineup, captainId: "KIA-01", viceCaptainId: "KIA-02", hiddenGemId: "KIA-01" },
      players: [
        player,
        { ...player, id: "KIA-02", primaryPosition: "CENTER_INFIELD" }
      ],
      hitterStats: {
        "KIA-01": { ...goldenStats, singles: 0, doubles: 0, homeRuns: 0, rbi: 0, runs: 0, walks: 0, strikeouts: 0 },
        "KIA-02": { ...goldenStats, singles: 1, doubles: 0, homeRuns: 0, rbi: 0, runs: 0, walks: 0, strikeouts: 0 }
      },
      moundResults: { KIA: { teamId: "KIA", winMargin: 0, isTie: true, errors: 0, runsAllowed: 3 } } as never
    });
    expect(result.playerBreakdowns[1].finalScore).toBe(5);
  });

  it("caps strategy bonus at 20", () => {
    const selected = Array.from({ length: 8 }, (_, index) => ({ ...player, id: `KIA-0${index}`, primaryPosition: "C" as const }));
    const result = scoreLineup({
      lineup: { ...lineup, playerIds: selected.map((item) => item.id), strategyCardId: "UNDERDOG" },
      players: selected,
      hitterStats: Object.fromEntries(selected.map((item) => [item.id, { ...goldenStats, singles: 10, homeRuns: 2 }])),
      moundResults: { KIA: { teamId: "KIA", winMargin: 0, isTie: true, errors: 0, runsAllowed: 3 } } as never
    });
    expect(result.strategyBonus).toBe(20);
  });

  it("scores big win clean low-runs mound result", () => {
    expect(calculateTeamMoundScore({ teamId: "KIA", winMargin: 5, isTie: false, errors: 0, runsAllowed: 2 })).toBe(75);
  });

  it("scores close win with errors", () => {
    expect(calculateTeamMoundScore({ teamId: "KIA", winMargin: 3, isTie: false, errors: 2, runsAllowed: 4 })).toBe(10);
  });

  it("scores loss with error and high runs", () => {
    expect(calculateTeamMoundScore({ teamId: "KIA", winMargin: -2, isTie: false, errors: 1, runsAllowed: 7 })).toBe(-20);
  });
});
