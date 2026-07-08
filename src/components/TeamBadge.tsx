import type { Team } from "@/types/domain";

export function TeamBadge({ team }: { team: Team }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-2 py-1 text-xs font-bold">
      <span className="h-3 w-3 rounded-full" style={{ background: team.color }} />
      {team.shortName}
    </span>
  );
}
