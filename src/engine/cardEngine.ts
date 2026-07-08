import type { TeamId } from "@/types/domain";

export type HansotGameRecord = {
  date: string;
  opponent: string;
  result: string;
  atBats: number;
  hits: number;
  homeRuns: number;
  rbi: number;
  runs: number;
  steals: number;
  fantasyPoint: number;
  roleBonus?: string;
  note: string;
};

export type HansotProgress = {
  playerId: string;
  joinedTeamId: TeamId;
  joinedAt: string;
  joinedStars: number;
  currentStars: number;
  appearances: number;
  captainCount: number;
  totalContribution: number;
  bestDay: number;
  hitsForTeam: number;
  homeRunsForTeam: number;
  rbiForTeam: number;
  hiddenGemWins: number;
  records?: HansotGameRecord[];
};

export function getCardLevel(progress: HansotProgress) {
  if (progress.captainCount >= 10) return 3;
  if (progress.appearances >= 50) return 2;
  if (progress.appearances >= 30) return 1;
  return 0;
}

export function nextCardGoal(progress: HansotProgress) {
  const level = getCardLevel(progress);
  if (level === 0) return `카드 발급까지 출장 ${30 - progress.appearances}회 남음`;
  if (level === 1) return `Lv.2까지 출장 ${50 - progress.appearances}회 남음`;
  if (level === 2) return `Lv.3까지 캡틴 지정 ${10 - progress.captainCount}회 남음`;
  return "최고 레벨 달성";
}

export const mockCardProgress: HansotProgress[] = [
  {
    playerId: "KIA-01",
    joinedTeamId: "KIA",
    joinedAt: "2026-03-24",
    joinedStars: 2,
    currentStars: 4,
    appearances: 34,
    captainCount: 2,
    totalContribution: 412,
    bestDay: 48,
    hitsForTeam: 42,
    homeRunsForTeam: 6,
    rbiForTeam: 28,
    hiddenGemWins: 5,
    records: [
      { date: "2026-04-01", opponent: "LG", result: "7:4 승", atBats: 4, hits: 2, homeRuns: 1, rbi: 3, runs: 2, steals: 0, fantasyPoint: 31, roleBonus: "히든젬", note: "첫 히든젬 적중" },
      { date: "2026-04-07", opponent: "DOOSAN", result: "5:6 패", atBats: 5, hits: 2, homeRuns: 0, rbi: 1, runs: 1, steals: 1, fantasyPoint: 18, note: "멀티히트" },
      { date: "2026-04-13", opponent: "SAMSUNG", result: "8:2 승", atBats: 4, hits: 3, homeRuns: 1, rbi: 4, runs: 2, steals: 0, fantasyPoint: 42, roleBonus: "캡틴", note: "우리 팀 최고 기여" },
      { date: "2026-04-21", opponent: "SSG", result: "3:1 승", atBats: 3, hits: 1, homeRuns: 0, rbi: 1, runs: 0, steals: 0, fantasyPoint: 11, note: "결승타" },
      { date: "2026-05-02", opponent: "KT", result: "6:5 승", atBats: 4, hits: 2, homeRuns: 1, rbi: 2, runs: 1, steals: 0, fantasyPoint: 29, roleBonus: "히든젬", note: "9회 역전 홈런" },
      { date: "2026-05-18", opponent: "LOTTE", result: "4:4 무", atBats: 4, hits: 1, homeRuns: 0, rbi: 0, runs: 1, steals: 1, fantasyPoint: 12, note: "동점 득점" }
    ]
  },
  {
    playerId: "LG-04",
    joinedTeamId: "LG",
    joinedAt: "2026-04-02",
    joinedStars: 5,
    currentStars: 8,
    appearances: 57,
    captainCount: 4,
    totalContribution: 621,
    bestDay: 55,
    hitsForTeam: 71,
    homeRunsForTeam: 9,
    rbiForTeam: 46,
    hiddenGemWins: 3,
    records: [
      { date: "2026-04-02", opponent: "KIWOOM", result: "9:3 승", atBats: 5, hits: 3, homeRuns: 1, rbi: 4, runs: 2, steals: 0, fantasyPoint: 44, roleBonus: "캡틴", note: "영입 첫날 대폭발" },
      { date: "2026-04-09", opponent: "NC", result: "4:2 승", atBats: 4, hits: 2, homeRuns: 0, rbi: 1, runs: 1, steals: 0, fantasyPoint: 17, note: "찬스 연결" },
      { date: "2026-04-17", opponent: "KIA", result: "6:7 패", atBats: 5, hits: 2, homeRuns: 1, rbi: 3, runs: 1, steals: 0, fantasyPoint: 33, roleBonus: "부캡틴", note: "추격 3점포" },
      { date: "2026-04-29", opponent: "SSG", result: "8:4 승", atBats: 4, hits: 4, homeRuns: 0, rbi: 2, runs: 3, steals: 1, fantasyPoint: 39, note: "4안타 경기" },
      { date: "2026-05-11", opponent: "DOOSAN", result: "5:1 승", atBats: 3, hits: 1, homeRuns: 1, rbi: 2, runs: 2, steals: 0, fantasyPoint: 30, roleBonus: "캡틴", note: "초반 흐름 장악" },
      { date: "2026-05-26", opponent: "KT", result: "3:5 패", atBats: 4, hits: 1, homeRuns: 0, rbi: 0, runs: 1, steals: 0, fantasyPoint: 9, note: "연속 출루 유지" },
      { date: "2026-06-04", opponent: "SAMSUNG", result: "10:6 승", atBats: 5, hits: 3, homeRuns: 2, rbi: 5, runs: 2, steals: 0, fantasyPoint: 55, roleBonus: "캡틴", note: "최고 하루 기여도" }
    ]
  },
  {
    playerId: "KT-19",
    joinedTeamId: "KT",
    joinedAt: "2026-04-18",
    joinedStars: 2,
    currentStars: 9,
    appearances: 71,
    captainCount: 12,
    totalContribution: 810,
    bestDay: 66,
    hitsForTeam: 88,
    homeRunsForTeam: 15,
    rbiForTeam: 62,
    hiddenGemWins: 11,
    records: [
      { date: "2026-04-18", opponent: "HANWHA", result: "6:2 승", atBats: 4, hits: 2, homeRuns: 1, rbi: 3, runs: 1, steals: 0, fantasyPoint: 34, roleBonus: "히든젬", note: "영입 후 첫 홈런" },
      { date: "2026-04-25", opponent: "LG", result: "7:8 패", atBats: 5, hits: 3, homeRuns: 0, rbi: 2, runs: 2, steals: 1, fantasyPoint: 31, note: "끝까지 추격" },
      { date: "2026-05-03", opponent: "NC", result: "9:5 승", atBats: 4, hits: 2, homeRuns: 2, rbi: 5, runs: 3, steals: 0, fantasyPoint: 58, roleBonus: "캡틴", note: "멀티홈런" },
      { date: "2026-05-14", opponent: "KIA", result: "4:1 승", atBats: 3, hits: 1, homeRuns: 0, rbi: 1, runs: 1, steals: 2, fantasyPoint: 24, roleBonus: "히든젬", note: "발로 만든 점수" },
      { date: "2026-05-28", opponent: "LOTTE", result: "11:3 승", atBats: 5, hits: 4, homeRuns: 1, rbi: 4, runs: 3, steals: 1, fantasyPoint: 66, roleBonus: "캡틴", note: "최고 하루 기여도" },
      { date: "2026-06-08", opponent: "SSG", result: "2:3 패", atBats: 4, hits: 1, homeRuns: 0, rbi: 0, runs: 0, steals: 1, fantasyPoint: 10, note: "도루 보너스" },
      { date: "2026-06-21", opponent: "DOOSAN", result: "7:4 승", atBats: 4, hits: 2, homeRuns: 1, rbi: 3, runs: 2, steals: 0, fantasyPoint: 37, roleBonus: "히든젬", note: "보상권 진입 견인" }
    ]
  }
];

export function getCardProgress(playerId: string) {
  return mockCardProgress.find((progress) => progress.playerId === playerId);
}
