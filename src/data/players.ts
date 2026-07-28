import type { Player, Position, TeamId } from "@/types/domain";
import { currentMockMarketWeek, weeklyMarketPriceStepStars } from "@/rules/marketRules";
import { teams } from "./teams";

// 2015년 통계청 인구주택총조사 기준 성씨 상위 25개와
// 2025년 전국 남자 출생신고 이름 상위 25개를 같은 순서로 결합합니다.
const commonKoreanSurnames = [
  "김",
  "이",
  "박",
  "최",
  "정",
  "강",
  "조",
  "윤",
  "장",
  "임",
  "한",
  "오",
  "서",
  "신",
  "권",
  "황",
  "안",
  "송",
  "전",
  "홍",
  "유",
  "고",
  "문",
  "양",
  "손"
] as const;

const commonKoreanNames = [
  "도윤",
  "이준",
  "하준",
  "시우",
  "도현",
  "서준",
  "선우",
  "이안",
  "태오",
  "은우",
  "도하",
  "수호",
  "이현",
  "우주",
  "지호",
  "유준",
  "은호",
  "윤우",
  "시윤",
  "주원",
  "연우",
  "우진",
  "예준",
  "지한",
  "이도"
] as const;

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
    const marketDirection = recentForm >= 67 ? 1 : recentForm <= 33 ? -1 : 0;
    const marketPriceStars = Math.max(1, priceStars + marketDirection * weeklyMarketPriceStepStars * currentMockMarketWeek);

    return {
      id: `${team.id}-${serial}`,
      name:
        commonKoreanSurnames[index] && commonKoreanNames[index]
          ? `${commonKoreanSurnames[index]}${commonKoreanNames[index]}`
          : `${team.shortName} 모의선수 ${serial}`,
      teamId: team.id as TeamId,
      positions: extraPosition(primaryPosition, index),
      primaryPosition,
      priceStars: Math.min(15, priceStars),
      marketPriceStars,
      recentForm,
      projectedScore: Math.min(30, projectedScore),
      isRookie: index % 8 === 0
    };
  })
);
