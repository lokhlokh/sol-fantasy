import type { Position } from "@/types/domain";

export const requiredSlots: Record<Position, number> = {
  C: 1,
  CENTER_INFIELD: 2,
  CORNER_INFIELD: 2,
  CF: 1,
  CORNER_OUTFIELD: 2
};

export const rosterSize = 8;
export const minimumSeasonTeamPlayers = 3;
export const maxBudgetStars = 50;
