"use client";

import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { PlayerPortrait } from "@/components/PlayerPortrait";
import { getLegendCardsForTeam, type LegendCard } from "@/data/legendCards";
import { positionLabels } from "@/data/labels";
import { players } from "@/data/players";
import { teams } from "@/data/teams";
import { getCardLevel, mockCardProgress } from "@/engine/cardEngine";
import { useLocalGameState } from "@/store/useLocalGameState";
import type { TeamId } from "@/types/domain";

const legendCollectionRanking = {
  managerName: "홍길동",
  collected: 18,
  rank: 42,
  top30Cutline: 23,
  leaderCollected: 41,
};

const shinhanPopularCards = [
  {
    name: "신한카드 Mr.Life",
    benefit: "공과금, 편의점, 병원, 약국 생활영역 할인",
    tag: "생활비",
  },
  {
    name: "신한카드 Deep Dream",
    benefit: "자주 쓰는 영역을 자동으로 찾아 포인트 적립",
    tag: "포인트",
  },
  {
    name: "신한카드 B.Big",
    benefit: "대중교통, 택시, 커피, 통신요금 할인",
    tag: "교통",
  },
];

function teamOf(teamId: TeamId) {
  return teams.find((team) => team.id === teamId);
}

function LegendCollectionRankingCard() {
  const needForMediaDay = Math.max(legendCollectionRanking.top30Cutline - legendCollectionRanking.collected, 0);
  const progress = Math.min(Math.ceil((legendCollectionRanking.collected / legendCollectionRanking.top30Cutline) * 100), 100);

  return (
    <article className="rounded-lg border border-amber-300 bg-white p-3 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black text-amber-700">레전드 카드 수집랭킹</p>
          <h3 className="mt-1 text-xl font-black text-ink">
            {legendCollectionRanking.rank}위 {legendCollectionRanking.managerName} 단장
          </h3>
          <p className="mt-1 text-sm font-bold text-slate-600">
            현재 {legendCollectionRanking.collected}장 수집 · 1위 {legendCollectionRanking.leaderCollected}장
          </p>
        </div>
        <span className="rounded-md bg-amber-100 px-2 py-1 text-xs font-black text-amber-800">Top 30 초청</span>
      </div>
      <div className="mt-3">
        <div className="h-2 overflow-hidden rounded-full bg-amber-100">
          <div className="h-full rounded-full bg-amber-500" style={{ width: `${progress}%` }} />
        </div>
        <div className="mt-2 flex items-center justify-between text-xs font-bold text-slate-500">
          <span>내 수집 {legendCollectionRanking.collected}장</span>
          <span>초청권 기준 {legendCollectionRanking.top30Cutline}장</span>
        </div>
      </div>
      <p className="mt-3 rounded-md bg-amber-50 p-2 text-sm font-black text-amber-900">
        {needForMediaDay > 0
          ? `${legendCollectionRanking.managerName} 단장님은 ${needForMediaDay}장을 더 모으면 다음 시즌 미디어 데이 초청권에 도전할 수 있습니다.`
          : `${legendCollectionRanking.managerName} 단장님은 현재 다음 시즌 미디어 데이 초청권입니다.`}
      </p>
    </article>
  );
}

function LegendCardView({ card }: { card: LegendCard }) {
  const team = teamOf(card.player.teamId);

  return (
    <Link href={`/cards/${card.player.id}`} className="block rounded-lg border border-amber-200 bg-amber-50 p-3 transition hover:border-amber-400 hover:bg-amber-100">
      <div className="flex gap-3">
        <PlayerPortrait player={card.player} teamColor={team?.color ?? "#111827"} size="sm" />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-xs font-black text-amber-700">레전드 카드</p>
              <h3 className="text-lg font-black text-ink">{card.player.name}</h3>
              <p className="text-sm font-bold text-slate-600">{card.nickname}</p>
            </div>
            <span className="rounded-md bg-ink px-2 py-1 text-xs font-black text-white">LEGEND</span>
          </div>
          <p className="mt-2 text-xs font-bold text-slate-500">
            {team?.name ?? card.player.teamId} · {card.era}
          </p>
        </div>
      </div>
      <div className="mt-3 space-y-2 text-sm">
        <p className="rounded-md bg-white p-2 font-black text-ink">{card.record}</p>
        <p className="rounded-md bg-white p-2 font-bold text-amber-800">{card.trophy}</p>
        <p className="text-xs font-semibold leading-relaxed text-slate-600">{card.story}</p>
      </div>
      <p className="mt-3 text-right text-xs font-black text-amber-800">연도별 기록 보기</p>
    </Link>
  );
}

function HansotStoryCard({ playerId }: { playerId: string }) {
  const progress = mockCardProgress.find((item) => item.playerId === playerId);
  const player = players.find((item) => item.id === playerId);

  if (!progress || !player) return null;

  const team = teamOf(progress.joinedTeamId);
  const level = getCardLevel(progress);
  const starDelta = progress.currentStars - progress.joinedStars;

  return (
    <Link href={`/cards/${player.id}`} className="block rounded-lg border border-slate-200 bg-white p-3 transition hover:border-sol hover:bg-blue-50">
      <div className="flex gap-3">
        <PlayerPortrait player={player} teamColor={team?.color ?? "#2563eb"} size="sm" />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-xs font-black text-sol">한솥밥 카드</p>
              <h3 className="text-lg font-black text-ink">{player.name}</h3>
              <p className="text-sm font-semibold text-slate-500">
                {team?.shortName} · {positionLabels[player.primaryPosition]}
              </p>
            </div>
            <span className="rounded-md bg-ink px-2 py-1 text-xs font-black text-white">Lv.{level}</span>
          </div>
          <p className="mt-2 text-xs font-semibold leading-relaxed text-slate-600">
            우리 팀에서 {progress.appearances}경기, {progress.hitsForTeam}안타, {progress.homeRunsForTeam}홈런을 함께 만들었습니다.
          </p>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs font-bold">
        <div className="rounded-md bg-slate-50 p-2">
          <p className="text-slate-500">영입 가치</p>
          <p className="text-ink">{progress.joinedStars}별</p>
        </div>
        <div className="rounded-md bg-slate-50 p-2">
          <p className="text-slate-500">현재 가치</p>
          <p className="text-ink">{progress.currentStars}별</p>
        </div>
        <div className="rounded-md bg-blue-50 p-2">
          <p className="text-sol">성장</p>
          <p className="text-sol">+{starDelta}별</p>
        </div>
      </div>
      <p className="mt-3 rounded-md bg-slate-100 p-2 text-xs font-semibold text-slate-600">
        캡틴 {progress.captainCount}회 · 히든젬 적중 {progress.hiddenGemWins}회 · 누적 기여 {progress.totalContribution}점
      </p>
    </Link>
  );
}

function ShinhanCardAdSection() {
  return (
    <section className="rounded-lg border border-blue-100 bg-blue-50 p-3">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black text-sol">모의 광고</p>
          <h2 className="text-lg font-black text-ink">
            카드의 레전드 <span className="text-sol">신한카드</span>의 Top 3
          </h2>
          <p className="mt-1 text-sm font-semibold text-slate-600">야구도 카드도, 레전드와 함께하세요.</p>
        </div>
        <span className="rounded-md bg-white px-2 py-1 text-[10px] font-black text-sol">Shinhan Card</span>
      </div>
      <div className="space-y-2">
        {shinhanPopularCards.map((card, index) => (
          <div key={card.name} className="rounded-md bg-white p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-black text-slate-500">인기 {index + 1}위</p>
                <p className="mt-1 font-black text-ink">{card.name}</p>
                <p className="mt-1 text-xs font-semibold leading-relaxed text-slate-600">{card.benefit}</p>
              </div>
              <span className="shrink-0 rounded bg-blue-50 px-2 py-1 text-xs font-black text-sol">{card.tag}</span>
            </div>
          </div>
        ))}
      </div>
      <a href="https://www.shinhancard.com/" target="_blank" rel="noreferrer" className="mt-3 block rounded-md bg-sol p-3 text-center text-sm font-black text-white">
        신한카드 혜택 보러가기
      </a>
    </section>
  );
}

export default function CardsPage() {
  const { state } = useLocalGameState();
  const legendCards = getLegendCardsForTeam(state.seasonTeamId ?? "LG");

  return (
    <AppShell title="선수카드">
      <div className="space-y-5">
        <section className="space-y-3">
          <div>
            <p className="text-xs font-black text-amber-700">커리어 전체를 기념합니다</p>
            <h2 className="text-xl font-black text-ink">레전드 카드</h2>
            <p className="mt-1 text-sm font-semibold text-slate-600">
              레전드 카드는 선택한 시즌팀의 전설적인 선수들로 지급됩니다. 카드를 누르면 선수 기간 전체 기록을 연도별로 볼 수 있습니다.
            </p>
          </div>
          <LegendCollectionRankingCard />
          <div className="space-y-3">
            {legendCards.map((card) => (
              <LegendCardView key={card.player.id} card={card} />
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <div>
            <p className="text-xs font-black text-sol">우리 팀에서 함께 커집니다</p>
            <h2 className="text-xl font-black text-ink">한솥밥 카드</h2>
            <p className="mt-1 text-sm font-semibold text-slate-600">
              한솥밥 카드는 나와 우리 팀에서 뛴 기록, 역할, 가치 상승을 중심으로 성장합니다.
            </p>
          </div>
          <div className="space-y-3">
            {mockCardProgress.map((progress) => (
              <HansotStoryCard key={progress.playerId} playerId={progress.playerId} />
            ))}
          </div>
        </section>

        <ShinhanCardAdSection />
      </div>
    </AppShell>
  );
}
