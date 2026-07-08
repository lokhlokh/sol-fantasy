import { PlayerPortrait } from "@/components/PlayerPortrait";
import { positionLabels } from "@/data/labels";
import { playerValueLabel } from "@/data/playerValue";
import { teams } from "@/data/teams";
import type { Player } from "@/types/domain";

export function PlayerCard({ player, active, onClick }: { player: Player; active?: boolean; onClick?: () => void }) {
  const team = teams.find((item) => item.id === player.teamId);

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full gap-3 rounded-lg border p-3 text-left transition ${active ? "border-sol bg-blue-50" : "border-slate-200 bg-white"}`}
    >
      <PlayerPortrait player={player} teamColor={team?.color ?? "#2563eb"} size="sm" />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-bold text-ink">{player.name}</p>
            <p className="text-xs text-slate-500">
              {team?.name ?? player.teamId} · {positionLabels[player.primaryPosition]}
            </p>
          </div>
          <span className="rounded-md bg-gold px-2 py-1 text-xs font-black text-ink">영입밸류 {player.priceStars}별</span>
        </div>
        <div className="mt-2 flex justify-between gap-3 text-xs text-slate-600">
          <span>최근감 {player.recentForm}</span>
          <span className="text-right">{playerValueLabel(player)}</span>
        </div>
      </div>
    </button>
  );
}
