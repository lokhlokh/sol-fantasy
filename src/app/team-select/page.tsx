"use client";

import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { teams } from "@/data/teams";
import { useLocalGameState } from "@/store/useLocalGameState";

export default function TeamSelectPage() {
  const router = useRouter();
  const { state, setSeasonTeamId } = useLocalGameState();

  return (
    <AppShell title="시즌팀 선택">
      <div className="grid gap-3">
        {teams.map((team) => (
          <button
            key={team.id}
            type="button"
            onClick={() => {
              setSeasonTeamId(team.id);
              router.push("/");
            }}
            className={`flex items-center justify-between rounded-lg border p-4 text-left ${state.seasonTeamId === team.id ? "border-sol bg-blue-50" : "border-slate-200"}`}
          >
            <span>
              <strong>{team.name}</strong>
              <br />
              <span className="text-sm text-slate-500">라인업에 이 팀 선수 3명 이상 필요</span>
            </span>
            <span className="h-8 w-8 rounded-full" style={{ background: team.color }} />
          </button>
        ))}
      </div>
    </AppShell>
  );
}
