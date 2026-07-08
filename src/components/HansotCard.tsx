import Link from "next/link";
import { PlayerPortrait } from "@/components/PlayerPortrait";
import { positionLabels } from "@/data/labels";
import { players } from "@/data/players";
import { teams } from "@/data/teams";
import type { HansotProgress } from "@/engine/cardEngine";
import { getCardLevel, nextCardGoal } from "@/engine/cardEngine";

export function HansotCard({ progress }: { progress: HansotProgress }) {
  const player = players.find((item) => item.id === progress.playerId);
  const team = teams.find((item) => item.id === progress.joinedTeamId);
  const level = getCardLevel(progress);

  if (!player) return null;

  return (
    <Link href={`/cards/${progress.playerId}`} className="block rounded-lg border border-slate-200 bg-white p-4 transition hover:border-sol hover:bg-blue-50">
      <div className="flex gap-3">
        <PlayerPortrait player={player} teamColor={team?.color ?? "#2563eb"} size="sm" />
        <div className="min-w-0 flex-1">
          <div className="flex justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-slate-500">한솥밥 카드</p>
              <h3 className="text-lg font-black">{player.name}</h3>
              <p className="text-sm font-semibold text-slate-500">
                {team?.shortName} · {positionLabels[player.primaryPosition]}
              </p>
            </div>
            <span className="h-fit rounded-md bg-ink px-2 py-1 text-sm font-black text-white">Lv.{level}</span>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
            <p>출장 {progress.appearances}</p>
            <p>캡틴 {progress.captainCount}</p>
            <p>입단 {progress.joinedStars}★</p>
            <p>현재 {progress.currentStars}★</p>
          </div>
        </div>
      </div>
      <p className="mt-3 rounded-md bg-slate-100 p-2 text-sm font-semibold">{nextCardGoal(progress)}</p>
    </Link>
  );
}
