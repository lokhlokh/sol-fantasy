import { describe, expect, it } from "vitest";
import { players } from "@/data/players";
import { recommendLineup } from "@/engine/aiCoach";
import { validateRoster } from "@/engine/rosterValidator";

describe("AI coach", () => {
  it("returns deterministic valid recommendation", () => {
    const a = recommendLineup(players, "LG");
    const b = recommendLineup(players, "LG");
    expect(a.lineup).toEqual(b.lineup);
    expect(validateRoster(a.lineup, players).valid).toBe(true);
  });

  it("returns three explanations", () => {
    expect(recommendLineup(players, "KT").explanations).toHaveLength(3);
  });
});
