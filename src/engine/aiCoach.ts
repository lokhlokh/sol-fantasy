import type { Lineup, Player, Position, TeamId } from "@/types/domain";
import { requiredSlots } from "@/rules/rosterRules";
import { playerRecruitValueStars, playerValueStars } from "@/data/playerValue";
import { validateRoster } from "./rosterValidator";

export function recommendLineup(players: Player[], seasonTeamId: TeamId): { lineup: Lineup; explanations: string[] } {
  const picked: Player[] = [];
  const addBest = (position: Position, count: number, forceTeam = false) => {
    const candidates = players
      .filter((player) => player.primaryPosition === position && !picked.some((item) => item.id === player.id))
      .filter((player) => !forceTeam || player.teamId === seasonTeamId)
      .sort((a, b) => playerValueStars(b) / playerRecruitValueStars(b) - playerValueStars(a) / playerRecruitValueStars(a));
    picked.push(...candidates.slice(0, count));
  };

  addBest("C", 1, true);
  addBest("CENTER_INFIELD", 1, true);
  addBest("CORNER_INFIELD", 1, true);
  for (const [position, count] of Object.entries(requiredSlots) as [Position, number][]) {
    const current = picked.filter((player) => player.primaryPosition === position).length;
    addBest(position, count - current);
  }

  let sorted = [...picked].sort((a, b) => playerValueStars(b) - playerValueStars(a));
  let budget = sorted.reduce((sum, player) => sum + playerRecruitValueStars(player), 0);
  while (budget > 50) {
    const expensive = sorted
      .filter((player) => player.teamId !== seasonTeamId || sorted.filter((p) => p.teamId === seasonTeamId).length > 3)
      .sort((a, b) => playerRecruitValueStars(b) - playerRecruitValueStars(a))[0];
    const replacement = players
      .filter((player) => player.primaryPosition === expensive.primaryPosition && playerRecruitValueStars(player) <= 3 && !sorted.some((item) => item.id === player.id))
      .sort((a, b) => playerValueStars(b) - playerValueStars(a))[0];
    sorted = sorted.map((player) => (player.id === expensive.id ? replacement : player));
    budget = sorted.reduce((sum, player) => sum + playerRecruitValueStars(player), 0);
  }

  const hiddenGem = [...sorted].filter((player) => playerRecruitValueStars(player) <= 3).sort((a, b) => playerValueStars(b) - playerValueStars(a))[0];
  const byValue = [...sorted].filter((player) => player.id !== hiddenGem.id).sort((a, b) => playerValueStars(b) - playerValueStars(a));
  const lineup: Lineup = {
    seasonTeamId,
    playerIds: sorted.map((player) => player.id),
    captainId: byValue[0].id,
    viceCaptainId: byValue.find((player) => player.id !== byValue[0].id)?.id ?? sorted.find((player) => player.id !== hiddenGem.id && player.id !== byValue[0].id)?.id ?? hiddenGem.id,
    hiddenGemId: hiddenGem.id,
    strategyCardId: "POWER_HIT",
    teamMoundPick: seasonTeamId
  };

  const validation = validateRoster(lineup, players);
  if (!validation.valid) throw new Error(`AI produced invalid lineup: ${validation.errors.join(", ")}`);

  return {
    lineup,
    explanations: [
      `50성 예산 안에서 밸류 효율을 우선했습니다. 이 라인업은 ${validation.budget}성을 사용합니다.`,
      `${seasonTeamId} 선수 3명 이상을 포함해 시즌팀 조건을 충족했습니다.`,
      `${hiddenGem.name}은 영입밸류 ${playerRecruitValueStars(hiddenGem)}별이면서 밸류가 좋아 히든젬으로 추천했습니다.`
    ]
  };
}
