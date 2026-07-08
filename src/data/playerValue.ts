import type { Player } from "@/types/domain";

export function playerValueStars(player: Player) {
  return Math.ceil(player.projectedScore);
}

export function playerRecruitValueStars(player: Player) {
  return player.priceStars;
}

export function playerValueLabel(player: Player) {
  return `밸류: ${playerValueStars(player)}별 (영입밸류: ${playerRecruitValueStars(player)}별)`;
}
