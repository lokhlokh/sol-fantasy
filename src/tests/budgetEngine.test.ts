import { describe, expect, it } from "vitest";
import { players } from "@/data/players";
import { playerMarketPriceStars } from "@/data/playerValue";
import { calculateCurrentMarketValue, calculateCurrentTeamValue, calculateLedgerCost } from "@/engine/budgetEngine";

describe("budget and market value", () => {
  it("keeps ledger cost separate from current market value", () => {
    const player = { ...players[0], priceStars: 4, marketPriceStars: 18.5 };

    expect(calculateLedgerCost([player])).toBe(4);
    expect(calculateCurrentMarketValue([player])).toBe(18);
    expect(calculateCurrentTeamValue([player])).toBe(50);
  });

  it("floors half-star market prices when displaying and totaling", () => {
    const selected = [
      { ...players[0], marketPriceStars: 18.5 },
      { ...players[1], marketPriceStars: 19.5 },
      { ...players[2], marketPriceStars: 20.5 }
    ];

    expect(playerMarketPriceStars(selected[0])).toBe(18);
    expect(calculateCurrentMarketValue(selected)).toBe(57);
    expect(calculateCurrentTeamValue(selected)).toBe(57);
  });

  it("allows current market prices to exceed the season-start ceiling", () => {
    expect(Math.max(...players.map((player) => player.marketPriceStars ?? player.priceStars))).toBeGreaterThan(15);
  });
});
