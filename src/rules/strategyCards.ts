import type { StrategyCardId } from "@/types/domain";

export const strategyCards: Record<StrategyCardId, { id: StrategyCardId; name: string; description: string }> = {
  POWER_HIT: { id: "POWER_HIT", name: "장타 노림수", description: "2루타, 3루타, 홈런 점수에 20% 보너스를 더합니다." },
  SPEED_BASEBALL: { id: "SPEED_BASEBALL", name: "발야구", description: "도루 점수에 50% 보너스를 더합니다." },
  ON_BASE: { id: "ON_BASE", name: "출루 야구", description: "볼넷과 몸에 맞는 공 점수에 50% 보너스를 더합니다." },
  CLUTCH_DAY: { id: "CLUTCH_DAY", name: "클러치 데이", description: "타점 점수에 50% 보너스를 더합니다." },
  UNDERDOG: { id: "UNDERDOG", name: "언더독", description: "영입밸류 5별 이하 선수의 기본 점수에 20% 보너스를 더합니다." },
  TEAM_ALL_IN: { id: "TEAM_ALL_IN", name: "응원팀 올인", description: "시즌팀 선수의 기본 점수에 10% 보너스를 더합니다." }
};
