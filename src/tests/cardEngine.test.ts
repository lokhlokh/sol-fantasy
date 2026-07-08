import { describe, expect, it } from "vitest";
import { getCardLevel, nextCardGoal, type HansotProgress } from "@/engine/cardEngine";

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
  hiddenGemWins: 0,
  ...overrides
});

describe("card engine", () => {
  it("issues level 1 at 30 appearances", () => {
    expect(getCardLevel(progress({ appearances: 30 }))).toBe(1);
  });

  it("levels to 2 at 50 appearances", () => {
    expect(getCardLevel(progress({ appearances: 50 }))).toBe(2);
  });

  it("levels to 3 at 10 captain picks", () => {
    expect(getCardLevel(progress({ appearances: 50, captainCount: 10 }))).toBe(3);
  });

  it("describes next goal", () => {
    expect(nextCardGoal(progress({ appearances: 20 }))).toContain("10회");
  });
});
