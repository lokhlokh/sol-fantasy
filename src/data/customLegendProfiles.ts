import type { CustomLegendCard } from "@/types/legendMaker";

export type CustomLegendProfile = {
  era: string;
  record: string;
  trophy: string;
  story: string;
  columns: string[];
  annualRecords: Array<{ year: number; values: string[]; note: string }>;
};

const hitterColumns = ["경기", "타율", "안타", "홈런", "타점", "도루", "OPS"];
const pitcherColumns = ["경기", "승", "패", "ERA", "탈삼진", "이닝", "WHIP"];

const kimJaeBak: CustomLegendProfile = {
  era: "1982-1992",
  record: "1,102경기 · 972안타 · 284도루 · 통산 타율 .273",
  trophy: "골든글러브 5회 · 도루왕 1회",
  story: "빠른 판단과 정교한 수비, 과감한 주루로 내야의 흐름을 지배한 유격수 레전드 카드입니다.",
  columns: hitterColumns,
  annualRecords: [
    { year: 1982, values: ["71", ".267", "68", "5", "31", "18", ".721"], note: "프로 원년 주전 유격수" },
    { year: 1983, values: ["94", ".285", "101", "7", "43", "27", ".768"], note: "공수 핵심으로 도약" },
    { year: 1984, values: ["96", ".292", "109", "8", "48", "35", ".801"], note: "골든글러브 시즌" },
    { year: 1985, values: ["101", ".279", "104", "6", "41", "32", ".755"], note: "내야 수비 리더" },
    { year: 1986, values: ["103", ".301", "117", "9", "52", "39", ".836"], note: "커리어하이 타격" },
    { year: 1987, values: ["99", ".288", "108", "7", "46", "34", ".792"], note: "우승 경쟁 견인" },
  ],
};

const choiDongWon: CustomLegendProfile = {
  era: "1983-1990",
  record: "248경기 · 103승 · 74패 · 1,019탈삼진",
  trophy: "MVP 1회 · 골든글러브 4회",
  story: "강한 승부욕과 압도적인 완투 능력으로 마운드를 지배한 투수 레전드 카드입니다.",
  columns: pitcherColumns,
  annualRecords: [
    { year: 1983, values: ["38", "9", "16", "2.89", "148", "208.2", "1.18"], note: "프로 데뷔 시즌" },
    { year: 1984, values: ["51", "27", "13", "2.40", "223", "284.2", "1.08"], note: "한국시리즈의 전설" },
    { year: 1985, values: ["42", "20", "9", "1.92", "189", "225.0", "1.02"], note: "두 번째 20승" },
    { year: 1986, values: ["39", "19", "14", "2.81", "171", "267.0", "1.15"], note: "마운드의 중심" },
    { year: 1987, values: ["32", "14", "12", "3.21", "136", "196.1", "1.22"], note: "베테랑 에이스" },
    { year: 1988, values: ["24", "10", "7", "3.08", "102", "151.2", "1.19"], note: "통산 100승 돌파" },
  ],
};

export function getCustomLegendProfile(card: CustomLegendCard): CustomLegendProfile {
  if (card.name.includes("김재박")) return kimJaeBak;
  if (card.name.includes("최동원")) return choiDongWon;
  if (String(card.position).includes("투수")) {
    return {
      ...choiDongWon,
      record: "236경기 · 96승 · 68패 · 914탈삼진",
      story: `${card.name}의 강한 구위와 경기 운영 능력을 담은 투수 레전드 카드입니다.`,
    };
  }
  return {
    ...kimJaeBak,
    record: "1,086경기 · 1,024안타 · 126홈런 · 612타점",
    story: `${card.name}의 공수 활약과 상징적인 순간을 담은 야수 레전드 카드입니다.`,
  };
}
