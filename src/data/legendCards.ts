import type { Player, TeamId } from "@/types/domain";

export type LegendAnnualRecord = {
  year: number;
  games: number;
  average: string;
  hits: number;
  homeRuns: number;
  rbi: number;
  steals: number;
  ops: string;
  note: string;
};

export type LegendCard = {
  player: Player;
  nickname: string;
  era: string;
  record: string;
  trophy: string;
  story: string;
  annualRecords: LegendAnnualRecord[];
};

export const legendCards: LegendCard[] = [
  {
    player: {
      id: "LEGEND-LG-01",
      name: "LG 전설타자 10",
      teamId: "LG",
      positions: ["CORNER_INFIELD"],
      primaryPosition: "CORNER_INFIELD",
      priceStars: 15,
      recentForm: 100,
      projectedScore: 30,
    },
    nickname: "잠실의 4번 타자",
    era: "2002-2018",
    record: "1,982경기 · 2,115안타 · 412홈런 · 1,378타점",
    trophy: "MVP 2회 · 골든글러브 7회",
    story: "LG의 중심타선을 오래 책임진 전설의 카드입니다. 선수 기간 전체의 누적 성적과 상징성을 중심으로 보여줍니다.",
    annualRecords: [
      { year: 2002, games: 96, average: ".278", hits: 91, homeRuns: 14, rbi: 48, steals: 2, ops: ".812", note: "1군 데뷔" },
      { year: 2003, games: 118, average: ".286", hits: 124, homeRuns: 18, rbi: 71, steals: 3, ops: ".844", note: "주전 도약" },
      { year: 2004, games: 126, average: ".302", hits: 151, homeRuns: 25, rbi: 89, steals: 4, ops: ".913", note: "첫 3할" },
      { year: 2005, games: 122, average: ".295", hits: 143, homeRuns: 27, rbi: 94, steals: 3, ops: ".927", note: "중심타선 고정" },
      { year: 2006, games: 128, average: ".311", hits: 161, homeRuns: 31, rbi: 105, steals: 5, ops: ".982", note: "100타점 돌파" },
      { year: 2007, games: 121, average: ".289", hits: 137, homeRuns: 22, rbi: 86, steals: 2, ops: ".875", note: "클러치 시즌" },
      { year: 2008, games: 130, average: ".318", hits: 172, homeRuns: 34, rbi: 118, steals: 4, ops: "1.021", note: "MVP" },
      { year: 2009, games: 133, average: ".304", hits: 166, homeRuns: 29, rbi: 101, steals: 3, ops: ".961", note: "골든글러브" },
      { year: 2010, games: 129, average: ".315", hits: 159, homeRuns: 38, rbi: 124, steals: 2, ops: "1.044", note: "홈런 커리어하이" },
      { year: 2011, games: 116, average: ".292", hits: 128, homeRuns: 21, rbi: 79, steals: 1, ops: ".881", note: "부상 복귀" },
      { year: 2012, games: 127, average: ".307", hits: 154, homeRuns: 30, rbi: 112, steals: 2, ops: ".973", note: "두 번째 MVP" },
      { year: 2013, games: 125, average: ".298", hits: 146, homeRuns: 24, rbi: 92, steals: 2, ops: ".902", note: "포스트시즌 견인" },
      { year: 2014, games: 119, average: ".284", hits: 132, homeRuns: 20, rbi: 81, steals: 1, ops: ".842", note: "베테랑 리더" },
      { year: 2015, games: 132, average: ".301", hits: 158, homeRuns: 28, rbi: 97, steals: 2, ops: ".931", note: "마지막 30홈런 도전" },
      { year: 2016, games: 121, average: ".276", hits: 124, homeRuns: 17, rbi: 68, steals: 1, ops: ".801", note: "대타 해결사" },
      { year: 2017, games: 109, average: ".269", hits: 103, homeRuns: 15, rbi: 61, steals: 0, ops: ".782", note: "후배 멘토" },
      { year: 2018, games: 53, average: ".251", hits: 46, homeRuns: 9, rbi: 52, steals: 0, ops: ".768", note: "은퇴 시즌" },
    ],
  },
  {
    player: {
      id: "LEGEND-LG-02",
      name: "LG 전설포수 27",
      teamId: "LG",
      positions: ["C"],
      primaryPosition: "C",
      priceStars: 15,
      recentForm: 96,
      projectedScore: 29,
    },
    nickname: "잠실의 안방마님",
    era: "2007-2022",
    record: "1,688경기 · 도루저지 35% · 포스트시즌 76경기",
    trophy: "골든글러브 4회 · 우승 포수",
    story: "LG 투수진의 리듬을 읽고, 한 번의 사인과 블로킹으로 경기 흐름을 지켜낸 리더십을 담았습니다.",
    annualRecords: [
      { year: 2007, games: 72, average: ".241", hits: 49, homeRuns: 4, rbi: 24, steals: 0, ops: ".654", note: "백업 포수 출발" },
      { year: 2008, games: 91, average: ".258", hits: 72, homeRuns: 7, rbi: 38, steals: 1, ops: ".721", note: "주전 경쟁" },
      { year: 2009, games: 108, average: ".263", hits: 94, homeRuns: 9, rbi: 46, steals: 0, ops: ".744", note: "주전 안착" },
      { year: 2010, games: 116, average: ".271", hits: 105, homeRuns: 12, rbi: 57, steals: 1, ops: ".782", note: "첫 두 자릿수 홈런" },
      { year: 2011, games: 121, average: ".266", hits: 111, homeRuns: 13, rbi: 62, steals: 0, ops: ".776", note: "도루저지 1위" },
      { year: 2012, games: 118, average: ".252", hits: 98, homeRuns: 10, rbi: 52, steals: 0, ops: ".731", note: "투수진 안정" },
      { year: 2013, games: 125, average: ".279", hits: 124, homeRuns: 15, rbi: 71, steals: 1, ops: ".821", note: "골든글러브" },
      { year: 2014, games: 119, average: ".268", hits: 108, homeRuns: 11, rbi: 59, steals: 0, ops: ".756", note: "가을야구 리드" },
      { year: 2015, games: 128, average: ".274", hits: 117, homeRuns: 14, rbi: 66, steals: 1, ops: ".798", note: "클럽하우스 리더" },
      { year: 2016, games: 124, average: ".281", hits: 121, homeRuns: 16, rbi: 73, steals: 0, ops: ".833", note: "커리어하이 타점" },
      { year: 2017, games: 113, average: ".259", hits: 95, homeRuns: 8, rbi: 48, steals: 0, ops: ".706", note: "젊은 투수 육성" },
      { year: 2018, games: 102, average: ".247", hits: 82, homeRuns: 6, rbi: 39, steals: 0, ops: ".681", note: "수비형 시즌" },
      { year: 2019, games: 111, average: ".264", hits: 91, homeRuns: 9, rbi: 44, steals: 0, ops: ".729", note: "포스트시즌 복귀" },
      { year: 2020, games: 104, average: ".251", hits: 83, homeRuns: 8, rbi: 43, steals: 0, ops: ".704", note: "베테랑 포수" },
      { year: 2021, games: 94, average: ".238", hits: 66, homeRuns: 5, rbi: 31, steals: 0, ops: ".652", note: "후배 포수 멘토" },
      { year: 2022, games: 42, average: ".229", hits: 30, homeRuns: 3, rbi: 17, steals: 0, ops: ".631", note: "은퇴 시즌" },
    ],
  },
  {
    player: {
      id: "LEGEND-LG-03",
      name: "LG 전설리드오프 33",
      teamId: "LG",
      positions: ["CF"],
      primaryPosition: "CF",
      priceStars: 15,
      recentForm: 98,
      projectedScore: 30,
    },
    nickname: "잠실의 리드오프",
    era: "2004-2019",
    record: "1,901경기 · 2,026안타 · 412도루 · 출루율 .392",
    trophy: "도루왕 3회 · 골든글러브 5회",
    story: "첫 타석부터 경기장을 흔들고, 빠른 발과 출루로 LG 야구의 공격 템포를 만든 순간들을 담았습니다.",
    annualRecords: [
      { year: 2004, games: 88, average: ".272", hits: 86, homeRuns: 2, rbi: 28, steals: 21, ops: ".721", note: "데뷔 시즌" },
      { year: 2005, games: 112, average: ".291", hits: 128, homeRuns: 4, rbi: 39, steals: 33, ops: ".764", note: "리드오프 안착" },
      { year: 2006, games: 126, average: ".305", hits: 158, homeRuns: 6, rbi: 52, steals: 41, ops: ".821", note: "첫 도루왕" },
      { year: 2007, games: 119, average: ".298", hits: 143, homeRuns: 5, rbi: 45, steals: 36, ops: ".793", note: "골든글러브" },
      { year: 2008, games: 131, average: ".316", hits: 171, homeRuns: 8, rbi: 61, steals: 44, ops: ".864", note: "최다안타 경쟁" },
      { year: 2009, games: 127, average: ".289", hits: 149, homeRuns: 7, rbi: 54, steals: 29, ops: ".778", note: "출루 머신" },
      { year: 2010, games: 133, average: ".321", hits: 184, homeRuns: 9, rbi: 67, steals: 48, ops: ".889", note: "두 번째 도루왕" },
      { year: 2011, games: 124, average: ".307", hits: 156, homeRuns: 6, rbi: 49, steals: 31, ops: ".824", note: "테이블세터 핵심" },
      { year: 2012, games: 129, average: ".295", hits: 152, homeRuns: 5, rbi: 47, steals: 27, ops: ".789", note: "견실한 시즌" },
      { year: 2013, games: 128, average: ".313", hits: 166, homeRuns: 7, rbi: 58, steals: 34, ops: ".848", note: "가을야구 선봉" },
      { year: 2014, games: 117, average: ".286", hits: 132, homeRuns: 4, rbi: 42, steals: 22, ops: ".746", note: "수비 리더" },
      { year: 2015, games: 125, average: ".302", hits: 154, homeRuns: 6, rbi: 50, steals: 28, ops: ".812", note: "세 번째 골든글러브" },
      { year: 2016, games: 120, average: ".279", hits: 130, homeRuns: 5, rbi: 41, steals: 19, ops: ".733", note: "베테랑 리드오프" },
      { year: 2017, games: 113, average: ".288", hits: 127, homeRuns: 4, rbi: 37, steals: 17, ops: ".751", note: "대수비 겸임" },
      { year: 2018, games: 101, average: ".267", hits: 98, homeRuns: 3, rbi: 31, steals: 14, ops: ".701", note: "후배 외야수 멘토" },
      { year: 2019, games: 48, average: ".254", hits: 34, homeRuns: 1, rbi: 11, steals: 8, ops: ".668", note: "은퇴 시즌" },
    ],
  },
];

const legendTeamNames: Record<TeamId, { shortName: string; fullName: string }> = {
  KIA: { shortName: "KIA", fullName: "KIA 모의 타이거즈" },
  LG: { shortName: "LG", fullName: "LG 모의 트윈스" },
  DOOSAN: { shortName: "DS", fullName: "두산 모의 베어스" },
  SAMSUNG: { shortName: "SS", fullName: "삼성 모의 라이온즈" },
  SSG: { shortName: "SG", fullName: "SSG 모의 랜더스" },
  LOTTE: { shortName: "LT", fullName: "롯데 모의 자이언츠" },
  HANWHA: { shortName: "HW", fullName: "한화 모의 이글스" },
  NC: { shortName: "NC", fullName: "NC 모의 다이노스" },
  KIWOOM: { shortName: "KW", fullName: "키움 모의 히어로즈" },
  KT: { shortName: "KT", fullName: "KT 모의 위즈" },
};

const legendProfiles = [
  {
    suffix: "01",
    name: "전설타자 10",
    nickname: "잠실의 4번 타자",
    story: "중심타선을 오래 책임진 전설의 카드입니다. 선수 기간 전체의 누적 성적과 상징성을 중심으로 보여줍니다.",
  },
  {
    suffix: "02",
    name: "전설포수 27",
    nickname: "안방의 지휘자",
    story: "투수진의 리듬을 읽고, 한 번의 사인과 블로킹으로 경기 흐름을 지켜낸 리더십을 담았습니다.",
  },
  {
    suffix: "03",
    name: "전설리드오프 33",
    nickname: "1번 타자의 심장",
    story: "첫 타석부터 경기장을 흔들고, 빠른 발과 출루로 팀 공격의 템포를 만든 순간들을 담았습니다.",
  },
];

export function getLegendCardsForTeam(teamId: TeamId) {
  const team = legendTeamNames[teamId];

  return legendCards.map((card, index) => {
    const profile = legendProfiles[index];
    return {
      ...card,
      player: {
        ...card.player,
        id: `LEGEND-${teamId}-${profile.suffix}`,
        name: `${team.shortName} ${profile.name}`,
        teamId,
      },
      nickname: profile.nickname,
      story: `${team.fullName}의 ${profile.story}`,
    };
  });
}

export function findLegendCardById(playerId: string) {
  const match = playerId.match(/^LEGEND-([A-Z]+)-0[1-3]$/);
  if (!match) return undefined;
  return getLegendCardsForTeam(match[1] as TeamId).find((card) => card.player.id === playerId);
}

export function legendCardStaticParams() {
  return (Object.keys(legendTeamNames) as TeamId[]).flatMap((teamId) => getLegendCardsForTeam(teamId).map((card) => ({ playerId: card.player.id })));
}
