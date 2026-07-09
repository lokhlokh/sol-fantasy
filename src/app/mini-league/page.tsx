"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { players } from "@/data/players";
import { teams } from "@/data/teams";
import { simulateDailyBoard } from "@/engine/simulator";
import { useLocalGameState } from "@/store/useLocalGameState";
import type { TeamId } from "@/types/domain";

type RankRow = {
  id: string;
  rank: number;
  nickname: string;
  score: number;
  note?: string;
  isMe?: boolean;
};

type RewardPeriod = "daily" | "monthly" | "season";

const managerName = "홍길동";
const defaultFriendLeagueName = "친구 미니리그";
const friendLeagueNameKey = "sol-fantasy-friend-league-name";

const etfTop3 = [
  { name: "SOL 미국S&P500", sales: "최근 5일간 매수 1위", note: "미국 대표지수에 분산 투자" },
  { name: "SOL 반도체소부장Fn", sales: "최근 5일간 매수 2위", note: "반도체 핵심 밸류체인 테마" },
  { name: "SOL 조선TOP3플러스", sales: "최근 5일간 매수 3위", note: "조선 대표주 중심 테마" }
];

const periodRewards: Record<
  RewardPeriod,
  {
    rewardText: string;
    rewardRank: number;
    rewardName: string;
    topRewardRank?: number;
    topRewardName?: string;
    base: number;
    topStep: number;
    tailStart: number;
    tailStep: number;
    myBonus: number;
    participantCount: number;
    note: string;
  }
> = {
  daily: {
    rewardText: "상위 50명에게 땡겨요 상품권을 수여합니다.",
    rewardRank: 50,
    rewardName: "땡겨요 상품권",
    base: 187,
    topStep: 9,
    tailStart: 168,
    tailStep: 1,
    myBonus: 0,
    participantCount: 180,
    note: "일간 보상권"
  },
  monthly: {
    rewardText: "Top 10에게 신한투자증권 주식매입 할인 쿠폰 10만원권을 수여하고, Top 100에게 레전드 카드를 지급합니다.",
    rewardRank: 100,
    rewardName: "레전드 카드",
    topRewardRank: 10,
    topRewardName: "주식매입 할인쿠폰",
    base: 4920,
    topStep: 137,
    tailStart: 4510,
    tailStep: 24,
    myBonus: 2810,
    participantCount: 130,
    note: "월간 보상권"
  },
  season: {
    rewardText: "Top3와 특별한 한분을 SOL 판타지리그 포스트 시즌 게임에 초대합니다.",
    rewardRank: 3,
    rewardName: "포스트시즌 SOL 판타지리그 좌석",
    base: 41800,
    topStep: 930,
    tailStart: 38900,
    tailStep: 410,
    myBonus: 28600,
    participantCount: 60,
    note: "시즌 보상권"
  }
};

const friendTrend = [
  { name: "홍길동", color: "#2563eb", ranks: [4, 4, 5, 4, 3, 4, 4, 3, 3, 4] },
  { name: "민지", color: "#dc2626", ranks: [2, 3, 3, 2, 2, 1, 2, 2, 1, 1] },
  { name: "도윤", color: "#16a34a", ranks: [3, 2, 2, 3, 4, 3, 3, 4, 2, 2] },
  { name: "서연", color: "#9333ea", ranks: [1, 1, 1, 1, 1, 2, 1, 1, 4, 3] },
  { name: "지훈", color: "#f59e0b", ranks: [5, 5, 4, 5, 5, 5, 5, 5, 5, 5] }
];

function teamShortName(teamId: TeamId) {
  return teams.find((team) => team.id === teamId)?.shortName ?? teamId;
}

function teamName(teamId: TeamId) {
  return teams.find((team) => team.id === teamId)?.name ?? teamId;
}

function teamColor(teamId: TeamId) {
  return teams.find((team) => team.id === teamId)?.color ?? "#111827";
}

function SeasonTeamName({ teamId }: { teamId: TeamId }) {
  return (
    <span className="font-black" style={{ color: teamColor(teamId) }}>
      {teamName(teamId)}
    </span>
  );
}

function competitorScore(period: RewardPeriod, rank: number) {
  const config = periodRewards[period];
  if (rank <= 3) return Math.ceil(config.base - (rank - 1) * config.topStep);
  return Math.max(1, Math.ceil(config.tailStart - (rank - 4) * config.tailStep));
}

function rewardRows(teamId: TeamId, period: RewardPeriod, myScore: number): {
  top3: RankRow[];
  mine: RankRow;
  gap: number;
  rewardText: string;
  rewardName: string;
  rewardRank: number;
  topRewardName?: string;
  topRewardRank?: number;
  topRewardGap?: number;
} {
  const short = teamShortName(teamId);
  const config = periodRewards[period];
  const myPeriodScore = Math.ceil(myScore + config.myBonus);
  const competitors: RankRow[] = Array.from({ length: config.participantCount }, (_, index) => {
    const virtualRank = index + 1;
    return {
      id: `${period}-${virtualRank}`,
      rank: 0,
      nickname: `${short} 단장 ${virtualRank}`,
      score: competitorScore(period, virtualRank),
      note: virtualRank <= config.rewardRank ? config.note : undefined
    };
  });
  const ranked = [
    ...competitors,
    {
      id: "ME",
      rank: 0,
      nickname: managerName,
      score: myPeriodScore,
      note: "나의 랭킹",
      isMe: true
    }
  ]
    .sort((a, b) => b.score - a.score || (a.isMe ? -1 : 0) || a.nickname.localeCompare(b.nickname))
    .map((row, index) => ({ ...row, rank: index + 1 }));
  const mine = ranked.find((row) => row.isMe) ?? ranked[ranked.length - 1];
  const cutoff = ranked.filter((row) => !row.isMe)[config.rewardRank - 1]?.score ?? 0;
  const gap = mine.rank <= config.rewardRank ? 0 : Math.max(0, cutoff - mine.score + 1);
  const topRewardCutoff = config.topRewardRank ? ranked.filter((row) => !row.isMe)[config.topRewardRank - 1]?.score ?? 0 : 0;
  const topRewardGap = config.topRewardRank ? Math.max(0, topRewardCutoff - mine.score + 1) : undefined;

  return {
    top3: ranked.slice(0, 3),
    mine,
    gap,
    rewardText: config.rewardText,
    rewardName: config.rewardName,
    rewardRank: config.rewardRank,
    topRewardName: config.topRewardName,
    topRewardRank: config.topRewardRank,
    topRewardGap
  };
}

function friendRows(myScore: number): RankRow[] {
  return [
    { id: "ME", rank: 0, nickname: "홍길동", score: myScore, note: "나", isMe: true },
    { id: "f1", rank: 0, nickname: "민지 강공야구", score: Math.ceil(myScore + 23), note: "친구" },
    { id: "f2", rank: 0, nickname: "도윤 매직라인업", score: Math.ceil(myScore + 11), note: "친구" },
    { id: "f3", rank: 0, nickname: "서연 불펜장인", score: Math.ceil(myScore - 7), note: "친구" },
    { id: "f4", rank: 0, nickname: "지훈 히든젬", score: Math.ceil(myScore - 18), note: "친구" }
  ]
    .sort((a, b) => b.score - a.score)
    .map((row, index) => ({ ...row, rank: index + 1 }));
}

function gapText(
  mine: RankRow,
  gap: number,
  rewardRank: number,
  rewardName: string,
  topRewardName?: string,
  topRewardRank?: number,
  topRewardGap?: number,
  customGapMessage?: (gap: number, mine: RankRow) => ReactNode
) {
  if (gap > 0 && customGapMessage) return customGapMessage(gap, mine);
  const base =
    gap <= 0
      ? `${mine.rank}위 ${mine.nickname} 단장은 현재 ${rewardName} 보상권입니다.`
      : `${mine.rank}위 ${mine.nickname} 단장은 ${gap}점을 더 받으면 ${rewardName}을 받을 수 있습니다.`;
  if (!topRewardName || !topRewardRank || topRewardGap === undefined) return base;
  if (topRewardGap <= 0) return `${base} ${topRewardName}이 지급되는 Top ${topRewardRank}에도 진입했습니다.`;
  return `${base} ${topRewardName}이 지급되는 Top ${topRewardRank}까지는 ${topRewardGap}점이 더 필요합니다.`;
}

function FriendTrendChart() {
  const width = 328;
  const height = 150;
  const padding = 20;
  const x = (index: number) => padding + (index * (width - padding * 2)) / 9;
  const y = (rank: number) => padding + ((rank - 1) * (height - padding * 2)) / 4;

  return (
    <div className="rounded-lg border border-slate-200 p-3">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-black text-ink">지난 10일 랭킹 변화</p>
        <p className="text-[11px] font-bold text-slate-500">위로 갈수록 높은 랭킹</p>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="h-40 w-full">
        {[1, 2, 3, 4, 5].map((rank) => (
          <g key={rank}>
            <line x1={padding} x2={width - padding} y1={y(rank)} y2={y(rank)} stroke="#e2e8f0" strokeWidth="1" />
            <text x="2" y={y(rank) + 4} className="fill-slate-400 text-[10px] font-bold">
              {rank}
            </text>
          </g>
        ))}
        {friendTrend.map((line) => {
          const points = line.ranks.map((rank, index) => `${x(index)},${y(rank)}`).join(" ");
          return <polyline key={line.name} points={points} fill="none" stroke={line.color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />;
        })}
      </svg>
      <div className="grid grid-cols-2 gap-2">
        {friendTrend.map((line) => (
          <div key={line.name} className="flex items-center gap-2 text-xs font-bold text-slate-600">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: line.color }} />
            {line.name}
          </div>
        ))}
      </div>
    </div>
  );
}

function ModalShell({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-40 flex items-end bg-black/45">
      <section className="max-h-[82vh] w-full overflow-auto rounded-t-xl bg-white p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-xl font-black text-ink">{title}</h2>
          <button type="button" onClick={onClose} className="rounded-md border border-slate-200 px-3 py-2 text-sm font-bold">
            닫기
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}

function FriendLeagueGuide({
  leagueName,
  onLeagueNameChange
}: {
  leagueName: string;
  onLeagueNameChange: (value: string) => void;
}) {
  const steps = [
    { title: "1. 친구 미니리그 만들기", body: "리그 이름을 정하고 초대할 친구 수를 선택합니다. 유효 참가자 5명 이상이면 보상 대상 리그가 됩니다." },
    { title: "2. 카톡으로 초대 링크 공유", body: "초대 링크를 복사해 카카오톡 단체방에 보내면 친구들이 바로 참가할 수 있습니다. 참가한 친구는 같은 날짜의 라인업 점수로 랭킹을 겨룹니다." },
    { title: "3. 친구끼리 즐기는 포인트", body: "누가 캡틴을 잘 골랐는지, 히든젬이 터졌는지, 어제보다 랭킹이 얼마나 올랐는지로 매일 가볍게 놀릴 거리와 복수전을 만들 수 있습니다." }
  ];

  return (
    <div className="space-y-3">
      <section className="rounded-lg border border-blue-100 bg-blue-50 p-3">
        <label className="grid gap-1 text-sm font-black text-ink">
          미니리그 이름
          <input
            value={leagueName}
            onChange={(event) => onLeagueNameChange(event.target.value)}
            className="rounded-md border border-blue-100 bg-white p-3 text-sm font-bold text-ink outline-none"
            placeholder={defaultFriendLeagueName}
          />
        </label>
        <p className="mt-2 text-xs font-semibold text-slate-600">특별한 이름을 정하기 전에는 기본 이름인 친구 미니리그로 표시됩니다.</p>
      </section>
      <section className="rounded-lg bg-blue-50 p-3">
        <p className="text-xs font-black text-sol">FRIEND LEAGUE</p>
        <p className="mt-1 text-sm font-semibold leading-relaxed text-slate-600">
          친구 미니리그는 지인끼리 같은 판타지 야구 점수를 비교하고, 하루 랭킹과 10일 랭킹 변화를 보며 경쟁하는 소규모 리그입니다.
        </p>
      </section>
      {steps.map((step) => (
        <section key={step.title} className="rounded-lg border border-slate-200 p-3">
          <h3 className="font-black text-ink">{step.title}</h3>
          <p className="mt-1 text-sm font-semibold leading-relaxed text-slate-600">{step.body}</p>
        </section>
      ))}
      <button type="button" className="w-full rounded-md bg-sol p-3 text-sm font-black text-white">
        카카오톡으로 친구 초대하기
      </button>
    </div>
  );
}

function FriendLeagueSection({ rows, leagueName, onOpenGuide }: { rows: RankRow[]; leagueName: string; onOpenGuide: () => void }) {
  return (
    <section className="rounded-lg border border-slate-200 p-3">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-ink">{leagueName || defaultFriendLeagueName}</h2>
          <p className="mt-1 text-xs font-semibold text-slate-500">일간 1위에게 SOL라이프 미니리그 보험쿠폰 1,000원을 수여합니다. 유효 참가자 5명 이상 리그가 대상입니다.</p>
        </div>
        <button type="button" onClick={onOpenGuide} className="shrink-0 rounded-md bg-ink px-3 py-2 text-xs font-black text-white">
          만드는 법
        </button>
      </div>
      <div className="space-y-2">
        {rows.map((row) => (
          <div key={row.id} className={`flex items-center justify-between rounded-md p-3 ${row.isMe ? "border border-sol bg-blue-50" : "bg-slate-50"}`}>
            <div>
              <p className="font-black text-ink">
                {row.rank}. {row.nickname}
              </p>
              <p className={`text-xs font-bold ${row.isMe ? "text-sol" : "text-slate-500"}`}>{row.note}</p>
            </div>
            <p className="text-sm font-black text-sol">{row.score}점</p>
          </div>
        ))}
      </div>
      <div className="mt-3">
        <FriendTrendChart />
      </div>
    </section>
  );
}

function RewardRankingSection({
  title,
  top3,
  mine,
  rewardText,
  rewardName,
  rewardRank,
  gap,
  topRewardName,
  topRewardRank,
  topRewardGap,
  customGapMessage
}: {
  title: ReactNode;
  top3: RankRow[];
  mine: RankRow;
  rewardText: ReactNode;
  rewardName: string;
  rewardRank: number;
  gap: number;
  topRewardName?: string;
  topRewardRank?: number;
  topRewardGap?: number;
  customGapMessage?: (gap: number, mine: RankRow) => ReactNode;
}) {
  return (
    <section className="rounded-lg border border-slate-200 p-3">
      <div className="mb-3">
        <h2 className="text-lg font-black text-ink">{title}</h2>
        <p className="mt-1 text-xs font-semibold text-slate-500">{rewardText}</p>
      </div>
      <div className="space-y-2">
        {top3.map((row) => (
          <div key={row.id} className={`flex items-center justify-between rounded-md p-3 ${row.isMe ? "border border-sol bg-blue-50" : "bg-slate-50"}`}>
            <div>
              <p className="font-black text-ink">
                {row.rank}. {row.nickname}
              </p>
              {row.note && <p className={`text-xs font-bold ${row.isMe ? "text-sol" : "text-slate-500"}`}>{row.note}</p>}
            </div>
            <p className="text-sm font-black text-sol">{row.score}점</p>
          </div>
        ))}
        {!top3.some((row) => row.isMe) && (
          <div className="mt-3 border-t border-dashed border-slate-300 pt-3">
            <div className="rounded-md border border-sol bg-blue-50 p-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-black text-ink">
                    {mine.rank}. {mine.nickname}
                  </p>
                  <p className="text-xs font-bold text-sol">{mine.note}</p>
                </div>
                <p className="text-sm font-black text-sol">{mine.score}점</p>
              </div>
              <p className="mt-2 text-xs font-black leading-relaxed text-ink">{gapText(mine, gap, rewardRank, rewardName, topRewardName, topRewardRank, topRewardGap, customGapMessage)}</p>
            </div>
          </div>
        )}
        {top3.some((row) => row.isMe) && (
          <p className="rounded-md bg-blue-50 p-3 text-xs font-black leading-relaxed text-ink">{gapText(mine, gap, rewardRank, rewardName, topRewardName, topRewardRank, topRewardGap, customGapMessage)}</p>
        )}
      </div>
    </section>
  );
}

function RisingStarSection({ teamId }: { teamId: TeamId }) {
  const short = teamShortName(teamId);
  const rows = players
    .filter((player) => player.teamId === teamId)
    .map((player, index) => ({
      player,
      picks: Math.ceil(1820 - index * 37 + player.recentForm * 3),
      growth: Math.ceil(12 + (player.recentForm % 18))
    }))
    .sort((a, b) => b.picks - a.picks)
    .slice(0, 3);

  return (
    <section className="rounded-lg border border-slate-200 p-3">
      <div className="mb-3">
        <h2 className="text-lg font-black text-ink">
          <SeasonTeamName teamId={teamId} /> 라이징 스타 랭킹
        </h2>
        <p className="mt-1 text-xs font-semibold text-slate-500">이번 달 가장 많이 선택된 {short} 선수 Top 3입니다.</p>
      </div>
      <div className="space-y-2">
        {rows.map(({ player, picks, growth }, index) => (
          <div key={player.id} className="flex items-center justify-between rounded-md bg-slate-50 p-3">
            <div>
              <p className="font-black text-ink">
                {index + 1}. {player.name}
              </p>
              <p className="text-xs font-bold text-slate-500">월간 선택 {picks.toLocaleString()}회 · 전월 대비 +{growth}%</p>
            </div>
            <p className="rounded-full bg-white px-2 py-1 text-xs font-black" style={{ color: teamColor(teamId) }}>
              {short}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function ShinhanEtfAdSection() {
  return (
    <section className="rounded-lg border border-slate-200 p-3">
      <div className="mb-3">
        <p className="text-xs font-black text-sol">신한투자증권</p>
        <h2 className="text-lg font-black text-ink">최근 5일간 최대매출 ETF 랭킹 Top 3</h2>
      </div>
      <div className="space-y-2">
        {etfTop3.map((etf, index) => (
          <a key={etf.name} href="https://www.shinhansec.com/" className="flex items-center justify-between gap-3 rounded-md bg-slate-50 p-3">
            <div>
              <p className="font-black text-ink">
                {index + 1}. {etf.name}
              </p>
              <p className="text-xs font-bold text-slate-500">{etf.sales} · {etf.note}</p>
            </div>
            <span className="shrink-0 rounded-full bg-ink px-3 py-1 text-xs font-black text-white">보러가기</span>
          </a>
        ))}
      </div>
    </section>
  );
}

export default function MiniLeaguePage() {
  const { state } = useLocalGameState();
  const [guideOpen, setGuideOpen] = useState(false);
  const [friendLeagueName, setFriendLeagueName] = useState(defaultFriendLeagueName);

  useEffect(() => {
    const savedName = window.localStorage.getItem(friendLeagueNameKey);
    if (savedName) setFriendLeagueName(savedName);
  }, []);

  const updateFriendLeagueName = (value: string) => {
    setFriendLeagueName(value);
    const trimmed = value.trim();
    if (trimmed) {
      window.localStorage.setItem(friendLeagueNameKey, trimmed);
    } else {
      window.localStorage.removeItem(friendLeagueNameKey);
    }
  };

  if (!state.lineup) {
    return (
      <AppShell title="리그 랭킹">
        <div className="space-y-3">
          <p className="rounded-lg border border-slate-200 p-4 text-sm font-bold text-slate-600">라인업을 확정하면 친구 미니리그와 시즌팀별 랭킹을 확인할 수 있습니다.</p>
          <Link href="/lineup" className="block rounded-lg bg-sol p-4 text-center font-black text-white">
            라인업 구성하기
          </Link>
        </div>
      </AppShell>
    );
  }

  const board = simulateDailyBoard(state.lineup, state.seed);
  const seasonTeamId = state.seasonTeamId ?? state.lineup.seasonTeamId;
  const friends = friendRows(board.userScore.totalScore);
  const daily = rewardRows(seasonTeamId, "daily", board.userScore.totalScore);
  const monthly = rewardRows(seasonTeamId, "monthly", board.userScore.totalScore);
  const season = rewardRows(seasonTeamId, "season", board.userScore.totalScore);

  return (
    <AppShell title="리그 랭킹">
      <div className="space-y-4">
        <FriendLeagueSection rows={friends} leagueName={friendLeagueName} onOpenGuide={() => setGuideOpen(true)} />
        <RewardRankingSection title={<><SeasonTeamName teamId={seasonTeamId} /> 일간 랭킹</>} {...daily} />
        <RewardRankingSection title={<><SeasonTeamName teamId={seasonTeamId} /> 월간 랭킹</>} {...monthly} />
        <RewardRankingSection
          title={<><SeasonTeamName teamId={seasonTeamId} /> 연간 랭킹</>}
          {...season}
          rewardText={
            <>
              <SeasonTeamName teamId={seasonTeamId} /> {season.rewardText} 최종 랭킹 1위 단장님은 <SeasonTeamName teamId={seasonTeamId} /> 스프링캠프 특별 게스트로 초청됩니다.
            </>
          }
          customGapMessage={(gap, mine) =>
            <>
              {mine.rank}위 {mine.nickname} 단장님은 {gap}점을 더 받으면 포스트시즌 SOL 판타지리그에 함께 합니다. 1위까지 올라서 스프링캠프에 동행하고 단장님의 야구 철학을 <SeasonTeamName teamId={seasonTeamId} />에게 직접 들려주세요.
            </>
          }
        />
        <RisingStarSection teamId={seasonTeamId} />
        <ShinhanEtfAdSection />
        <p className="rounded-lg bg-slate-50 p-3 text-xs font-semibold leading-relaxed text-slate-500">
          현재 시즌팀은 <SeasonTeamName teamId={seasonTeamId} />입니다. 보상 대상은 유효 라인업 제출, 중복 리그 제한, 상품별 사용 조건을 충족한 단장을 기준으로 확정됩니다.
        </p>
      </div>
      {guideOpen && (
        <ModalShell title="친구 미니리그 만드는 법" onClose={() => setGuideOpen(false)}>
          <FriendLeagueGuide leagueName={friendLeagueName} onLeagueNameChange={updateFriendLeagueName} />
        </ModalShell>
      )}
    </AppShell>
  );
}
