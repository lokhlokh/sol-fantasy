import type { Lineup, Player, Position } from "@/types/domain";
import { hiddenGemMaxPrice } from "@/rules/hiddenGemRules";
import { maxBudgetStars, minimumSeasonTeamPlayers, requiredSlots, rosterSize } from "@/rules/rosterRules";

export type RosterErrorCode =
  | "ROSTER_SIZE_INVALID"
  | "DUPLICATE_PLAYER"
  | "POSITION_REQUIREMENT_NOT_MET"
  | "BUDGET_EXCEEDED"
  | "SEASON_TEAM_MINIMUM_NOT_MET"
  | "ROLE_PLAYER_NOT_IN_LINEUP"
  | "ROLE_CONFLICT"
  | "HIDDEN_GEM_PRICE_TOO_HIGH";

export const rosterErrorMessages: Record<RosterErrorCode, string> = {
  ROSTER_SIZE_INVALID: "라인업은 정확히 8명이어야 합니다.",
  DUPLICATE_PLAYER: "같은 선수는 중복 선택할 수 없습니다.",
  POSITION_REQUIREMENT_NOT_MET: "포지션별 필요 인원이 맞지 않습니다.",
  BUDGET_EXCEEDED: "총 예산은 50성 이하여야 합니다.",
  SEASON_TEAM_MINIMUM_NOT_MET: "시즌팀 선수는 최소 3명 포함해야 합니다.",
  ROLE_PLAYER_NOT_IN_LINEUP: "캡틴, 부캡틴, 히든젬은 라인업 안에서 지정해야 합니다.",
  ROLE_CONFLICT: "캡틴, 부캡틴, 히든젬은 서로 다른 선수여야 합니다.",
  HIDDEN_GEM_PRICE_TOO_HIGH: "히든젬은 3성 이하 선수만 가능합니다."
};

export function validateRoster(lineup: Lineup, players: Player[]) {
  const selected = lineup.playerIds.map((id) => players.find((player) => player.id === id)).filter(Boolean) as Player[];
  const errors: RosterErrorCode[] = [];

  if (lineup.playerIds.length !== rosterSize) errors.push("ROSTER_SIZE_INVALID");
  if (new Set(lineup.playerIds).size !== lineup.playerIds.length) errors.push("DUPLICATE_PLAYER");

  const counts = Object.keys(requiredSlots).reduce((acc, position) => ({ ...acc, [position]: 0 }), {} as Record<Position, number>);
  for (const player of selected) counts[player.primaryPosition] += 1;
  if (Object.entries(requiredSlots).some(([position, count]) => counts[position as Position] !== count)) errors.push("POSITION_REQUIREMENT_NOT_MET");

  const budget = selected.reduce((sum, player) => sum + player.priceStars, 0);
  if (budget > maxBudgetStars) errors.push("BUDGET_EXCEEDED");

  const seasonTeamCount = selected.filter((player) => player.teamId === lineup.seasonTeamId).length;
  if (seasonTeamCount < minimumSeasonTeamPlayers) errors.push("SEASON_TEAM_MINIMUM_NOT_MET");

  const roleIds = [lineup.captainId, lineup.viceCaptainId, lineup.hiddenGemId];
  if (roleIds.some((id) => !lineup.playerIds.includes(id))) errors.push("ROLE_PLAYER_NOT_IN_LINEUP");
  if (new Set(roleIds).size !== roleIds.length) errors.push("ROLE_CONFLICT");

  const hiddenGem = selected.find((player) => player.id === lineup.hiddenGemId);
  if (hiddenGem && hiddenGem.priceStars > hiddenGemMaxPrice) errors.push("HIDDEN_GEM_PRICE_TOO_HIGH");

  return {
    valid: errors.length === 0,
    errors,
    budget,
    seasonTeamCount,
    selected
  };
}
