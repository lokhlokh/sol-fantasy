import { describe, expect, it } from "vitest";
import { players } from "@/data/players";
import { recommendLineup } from "@/engine/aiCoach";
import { validateRoster } from "@/engine/rosterValidator";

describe("roster validator", () => {
  const valid = recommendLineup(players, "KIA").lineup;

  it("accepts AI lineup", () => {
    expect(validateRoster(valid, players).valid).toBe(true);
  });

  it("rejects budget exceeded", () => {
    const result = validateRoster({ ...valid, playerIds: players.slice(3, 11).map((player) => player.id) }, players);
    expect(result.errors).toContain("BUDGET_EXCEEDED");
  });

  it("rejects season team shortage", () => {
    const nonKia = players.filter((player) => player.teamId !== "KIA").slice(0, 8).map((player) => player.id);
    expect(validateRoster({ ...valid, playerIds: nonKia }, players).errors).toContain("SEASON_TEAM_MINIMUM_NOT_MET");
  });

  it("rejects duplicate player", () => {
    expect(validateRoster({ ...valid, playerIds: Array(8).fill(valid.playerIds[0]) }, players).errors).toContain("DUPLICATE_PLAYER");
  });

  it("rejects role conflict", () => {
    expect(validateRoster({ ...valid, viceCaptainId: valid.captainId }, players).errors).toContain("ROLE_CONFLICT");
  });
});
