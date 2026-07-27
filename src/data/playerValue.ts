import type { Player } from "@/types/domain";

export function playerValueStars(player: Player) {
  return Math.ceil(player.projectedScore);
}

export function playerRecruitValueStars(player: Player) {
  return player.priceStars;
}

export function playerMarketPriceAmountStars(player: Player) {
  return player.marketPriceStars ?? player.priceStars;
}

export function playerMarketPriceStars(player: Player) {
  return Math.floor(playerMarketPriceAmountStars(player));
}

export function playerValueLabel(player: Player) {
  return `밸류: ${playerValueStars(player)}별 · 장부 ${playerRecruitValueStars(player)}별 · 현재 ${playerMarketPriceStars(player)}별`;
}
