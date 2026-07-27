import type { Player } from "@/types/domain";
import { playerMarketPriceStars, playerRecruitValueStars } from "@/data/playerValue";
import { currentTeamValueFloorStars } from "@/rules/rosterRules";

/** 영입 당시 가격(장부 가격)의 합계입니다. 초기 예산 검증은 이 값으로 합니다. */
export function calculateLedgerCost(selectedPlayers: Player[]) {
  return selectedPlayers.reduce((sum, player) => sum + playerRecruitValueStars(player), 0);
}

/** 선수별 현재 시장 가격을 내림한 뒤 합산한 현재 보유 가치입니다. */
export function calculateCurrentMarketValue(selectedPlayers: Player[]) {
  return selectedPlayers.reduce((sum, player) => sum + playerMarketPriceStars(player), 0);
}

/** 팀 자산은 시장 가치 합계가 50보다 작을 때도 최소 50별로 표시합니다. */
export function calculateCurrentTeamValue(selectedPlayers: Player[], floor = currentTeamValueFloorStars) {
  return Math.max(floor, calculateCurrentMarketValue(selectedPlayers));
}
