import type { PlayerScoreBreakdown } from "@/types/domain";

export function ResultSummary({ total, aiTotal, rows }: { total: number; aiTotal: number; rows: PlayerScoreBreakdown[] }) {
  return (
    <div className="rounded-lg bg-ink p-4 text-white">
      <p className="text-sm text-blue-100">오늘은 당신의 감독 감각이 점수로 남았습니다.</p>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <div>
          <p className="text-xs text-blue-100">내 점수</p>
          <p className="text-3xl font-black">{total}</p>
        </div>
        <div>
          <p className="text-xs text-blue-100">AI 감독</p>
          <p className="text-3xl font-black">{aiTotal}</p>
        </div>
      </div>
      <p className="mt-3 text-sm text-blue-100">아래 상세에는 히든젬 보너스와 작전 카드 효과가 포함되어 있습니다.</p>
      <div className="mt-3 max-h-52 overflow-auto rounded-md bg-white/10">
        {rows.map((row) => (
          <div key={row.playerId} className="flex justify-between border-b border-white/10 px-3 py-2 text-sm last:border-b-0">
            <span>{row.playerId}</span>
            <span>{row.finalScore}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
