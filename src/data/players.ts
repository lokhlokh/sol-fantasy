import type { Player, Position, TeamId } from "@/types/domain";
import { teams } from "./teams";

const positionPlan: Position[] = [
  "C",
  "C",
  "C",
  "CENTER_INFIELD",
  "CENTER_INFIELD",
  "CENTER_INFIELD",
  "CENTER_INFIELD",
  "CENTER_INFIELD",
  "CENTER_INFIELD",
  "CORNER_INFIELD",
  "CORNER_INFIELD",
  "CORNER_INFIELD",
  "CORNER_INFIELD",
  "CORNER_INFIELD",
  "CORNER_INFIELD",
  "CF",
  "CF",
  "CF",
  "CORNER_OUTFIELD",
  "CORNER_OUTFIELD",
  "CORNER_OUTFIELD",
  "CORNER_OUTFIELD",
  "CORNER_OUTFIELD",
  "CORNER_OUTFIELD",
  "CORNER_OUTFIELD"
];

const extraPosition = (primary: Position, index: number): Position[] => {
  if (index % 7 !== 0) return [primary];
  if (primary === "CENTER_INFIELD") return [primary, "CORNER_INFIELD"];
  if (primary === "CORNER_INFIELD") return [primary, "CENTER_INFIELD"];
  if (primary === "CF") return [primary, "CORNER_OUTFIELD"];
  if (primary === "CORNER_OUTFIELD") return [primary, "CF"];
  return [primary, "CORNER_INFIELD"];
};

export const players: Player[] = teams.flatMap((team, teamIndex) =>
  positionPlan.map((primaryPosition, index) => {
    const serial = String(index + 1).padStart(2, "0");
    const cheapCycle = index % 5 === 0 ? 2 : index % 9 === 0 ? 3 : 0;
    const priceStars = cheapCycle || (((teamIndex * 4 + index * 3) % 13) + 3);
    const recentForm = (teamIndex * 17 + index * 11) % 101;
    const projectedScore = Math.ceil(8 + recentForm / 6 + (16 - priceStars) * 0.45);

    return {
      id: `${team.id}-${serial}`,
      name: `${team.shortName} 모의선수 ${serial}`,
      teamId: team.id as TeamId,
      positions: extraPosition(primaryPosition, index),
      primaryPosition,
      priceStars: Math.min(15, priceStars),
      recentForm,
      projectedScore: Math.min(30, projectedScore),
      isRookie: index % 8 === 0
    };
  })
);
