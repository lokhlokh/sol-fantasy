import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { PlayerPortrait } from "@/components/PlayerPortrait";
import { positionLabels } from "@/data/labels";
import { players } from "@/data/players";
import { teams } from "@/data/teams";
import { getCardLevel, getCardProgress, mockCardProgress, nextCardGoal } from "@/engine/cardEngine";

export function generateStaticParams() {
  return mockCardProgress.map((progress) => ({ playerId: progress.playerId }));
}

function HansotDetail({ playerId }: { playerId: string }) {
  const progress = getCardProgress(playerId);
  const player = players.find((item) => item.id === playerId);

  if (!progress || !player) notFound();

  const team = teams.find((item) => item.id === progress.joinedTeamId);
  const level = getCardLevel(progress);
  const starDelta = progress.currentStars - progress.joinedStars;
  const records = progress.records ?? [];

  return (
    <AppShell title="선수 카드">
      <div className="space-y-4">
        <Link href="/cards" className="inline-flex rounded-md border border-slate-200 px-3 py-2 text-sm font-bold">
          카드 목록으로
        </Link>

        <section className="rounded-lg bg-white p-3 shadow-soft">
          <PlayerPortrait player={player} teamColor={team?.color ?? "#2563eb"} />
          <p className="mt-3 text-center text-xs font-bold text-slate-500">실제 사진이 아닌 mock 전용 선수 일러스트입니다.</p>
        </section>

        <section className="rounded-lg border border-slate-200 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-slate-500">한솥밥 선수</p>
              <h2 className="text-2xl font-black">{player.name}</h2>
              <p className="font-semibold text-slate-600">
                {team?.name ?? progress.joinedTeamId} · {positionLabels[player.primaryPosition]}
              </p>
            </div>
            <span className="rounded-md bg-ink px-3 py-2 text-sm font-black text-white">Lv.{level}</span>
          </div>
        </section>

        <section className="grid grid-cols-2 gap-2">
          <div className="rounded-lg bg-blue-50 p-3">
            <p className="text-xs font-bold text-sol">우리 팀 영입 별수</p>
            <p className="text-3xl font-black">{progress.joinedStars}별</p>
            <p className="text-xs text-slate-500">{progress.joinedAt} 합류</p>
          </div>
          <div className="rounded-lg bg-green-50 p-3">
            <p className="text-xs font-bold text-field">현재 별수</p>
            <p className="text-3xl font-black">{progress.currentStars}별</p>
            <p className="text-xs text-slate-500">{starDelta >= 0 ? `+${starDelta}` : starDelta}별 성장</p>
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 p-4">
          <h3 className="font-black">우리 팀에서 뛴 기록</h3>
          <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
            <p className="rounded-md bg-slate-100 p-2">출장 {progress.appearances}경기</p>
            <p className="rounded-md bg-slate-100 p-2">캡틴 지정 {progress.captainCount}회</p>
            <p className="rounded-md bg-slate-100 p-2">안타 {progress.hitsForTeam}개</p>
            <p className="rounded-md bg-slate-100 p-2">홈런 {progress.homeRunsForTeam}개</p>
            <p className="rounded-md bg-slate-100 p-2">타점 {progress.rbiForTeam}점</p>
            <p className="rounded-md bg-slate-100 p-2">히든젬 적중 {progress.hiddenGemWins}회</p>
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 p-4">
          <div className="mb-3">
            <h3 className="font-black">나와 함께 만든 실제 기록</h3>
            <p className="mt-1 text-xs font-semibold text-slate-500">한솥밥 카드는 우리 팀에 합류한 뒤의 경기 기록과 보너스 이력을 함께 쌓습니다.</p>
          </div>
          {records.length > 0 ? (
            <div className="overflow-hidden rounded-lg border border-slate-200">
              <div className="grid grid-cols-[64px_54px_72px_50px_1fr] bg-slate-100 px-2 py-2 text-[11px] font-black text-slate-600">
                <span>날짜</span>
                <span>상대</span>
                <span className="text-right">타격</span>
                <span className="text-right">점수</span>
                <span className="text-right">기록</span>
              </div>
              <div className="max-h-[360px] overflow-auto">
                {records.map((record) => (
                  <div key={`${record.date}-${record.opponent}`} className="border-t border-slate-100 px-2 py-2">
                    <div className="grid grid-cols-[64px_54px_72px_50px_1fr] items-start text-[11px] font-bold text-ink">
                      <span>{record.date.slice(5).replace("-", ".")}</span>
                      <span>{record.opponent}</span>
                      <span className="text-right">
                        {record.hits}/{record.atBats}
                        {record.homeRuns > 0 ? ` · ${record.homeRuns}홈런` : ""}
                      </span>
                      <span className="text-right">{record.fantasyPoint}점</span>
                      <span className="text-right text-slate-600">{record.roleBonus ?? record.result}</span>
                    </div>
                    <p className="mt-1 text-[11px] font-semibold text-slate-500">
                      {record.result} · {record.rbi}타점 · {record.runs}득점 · {record.steals}도루 · {record.note}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="rounded-md bg-slate-50 p-3 text-sm font-semibold text-slate-500">아직 기록이 충분히 쌓이지 않았습니다.</p>
          )}
        </section>

        <section className="rounded-lg bg-gold p-4 text-ink">
          <p className="text-xs font-black">다음 성장 조건</p>
          <p className="mt-1 text-lg font-black">{nextCardGoal(progress)}</p>
          <p className="mt-2 text-sm font-semibold">
            최고 하루 기여도 {progress.bestDay}점 · 누적 기여도 {progress.totalContribution}점
          </p>
        </section>
      </div>
    </AppShell>
  );
}

export default async function CardDetailPage({ params }: { params: Promise<{ playerId: string }> }) {
  const { playerId } = await params;
  return <HansotDetail playerId={playerId} />;
}
