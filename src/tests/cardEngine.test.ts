import { describe, expect, it } from "vitest";
import { getCardLevel, getHansotBonus, nextCardGoal, type HansotProgress } from "@/engine/cardEngine";

const progress = (overrides: Partial<HansotProgress>): HansotProgress => ({
  playerId: "x",
  joinedTeamId: "KIA",
  joinedAt: "2026-03-24",
  joinedStars: 2,
  currentStars: 4,
  appearances: 0,
  captainCount: 0,
  totalContribution: 0,
  bestDay: 0,
  hitsForTeam: 0,
  homeRunsForTeam: 0,
  rbiForTeam: 0,
  ...overrides
});

describe("card engine", () => {
  it("increases one level for every 20 appearances", () => {
    expect(getCardLevel(progress({ appearances: 20 }))).toBe(1);
    expect(getCardLevel(progress({ appearances: 40 }))).toBe(2);
  });

  it("does not use captain picks for the level", () => {
    expect(getCardLevel(progress({ appearances: 40, captainCount: 10 }))).toBe(2);
  });

  it("uses the card level as the per-game bonus", () => {
    expect(getHansotBonus("KIA-01")).toBe(1);
    expect(getHansotBonus("UNKNOWN")).toBe(0);
  });

  it("describes next goal", () => {
    expect(nextCardGoal(progress({ appearances: 20 }))).toContain("20회");
  });
});
