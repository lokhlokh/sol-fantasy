export function MiniLeagueTable({ rows }: { rows: { nickname: string; score: number; badges: string[] }[] }) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200">
      {rows.map((row, index) => (
        <div key={row.nickname} className="grid grid-cols-[36px_1fr_72px] items-center gap-2 border-b border-slate-100 p-3 last:border-b-0">
          <span className="text-lg font-black text-sol">#{index + 1}</span>
          <div>
            <p className="font-bold">{row.nickname}</p>
            <p className="text-xs text-slate-500">{row.badges.join(" · ")}</p>
          </div>
          <span className="text-right font-black">{row.score}</span>
        </div>
      ))}
    </div>
  );
}
