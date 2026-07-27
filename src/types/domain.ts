export type TeamId =
  | "KIA"
  | "LG"
  | "DOOSAN"
  | "SAMSUNG"
  | "SSG"
  | "LOTTE"
  | "HANWHA"
  | "NC"
  | "KIWOOM"
  | "KT";

export type Position = "C" | "CENTER_INFIELD" | "CORNER_INFIELD" | "CF" | "CORNER_OUTFIELD";

export type Player = {
  id: string;
  name: string;
  teamId: TeamId;
  positions: Position[];
  primaryPosition: Position;
  /** 시즌 시작 시 영입한 장부 가격입니다. 라인업 영입 예산 계산에 사용합니다. */
  priceStars: number;
  /** 주간 시장 가격 변동이 반영된 현재 가격입니다. 0.5 단위 원본값을 보존합니다. */
  marketPriceStars?: number;
  recentForm: number;
  projectedScore: number;
  isRookie?: boolean;
};

export type HitterDailyStats = {
  singles: number;
  doubles: number;
  triples: number;
  homeRuns: number;
  rbi: number;
  runs: number;
  walks: number;
  stolenBases: number;
  hbp: number;
  strikeouts: number;
  played: boolean;
};

export type TeamMoundResult = {
  teamId: TeamId;
  winMargin: number;
  isTie: boolean;
  errors: number;
  runsAllowed: number;
};

export type StrategyCardId =
  | "POWER_HIT"
  | "SPEED_BASEBALL"
  | "ON_BASE"
  | "CLUTCH_DAY"
  | "UNDERDOG"
  | "TEAM_ALL_IN";

export type Lineup = {
  seasonTeamId: TeamId;
  playerIds: string[];
  captainId: string;
  viceCaptainId: string;
  strategyCardId: StrategyCardId;
  bonusStrategyCardId?: StrategyCardId;
  teamMoundPick: TeamId;
};

export type User = {
  id: string;
  nickname: string;
  seasonTeamId: TeamId;
  lineup?: Lineup;
};

export type Team = {
  id: TeamId;
  name: string;
  shortName: string;
  color: string;
};

export type PlayerScoreBreakdown = {
  playerId: string;
  baseScore: number;
  strategyBonus: number;
  multiplier: number;
  finalScore: number;
  played: boolean;
};
