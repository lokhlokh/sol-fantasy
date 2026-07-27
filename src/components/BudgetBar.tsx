export function BudgetBar({ used, currentValue = 50, max = 50 }: { used: number; currentValue?: number; max?: number }) {
  const pct = Math.min(100, (used / max) * 100);
  return (
    <div>
      <div className="mb-1 flex justify-between text-sm font-bold">
        <span>장부 예산</span>
        <span className={used > max ? "text-red-600" : "text-ink"}>{used}/{max}★</span>
      </div>
      <div className="h-2 rounded-full bg-slate-200">
        <div className={`h-2 rounded-full ${used > max ? "bg-red-500" : "bg-field"}`} style={{ width: `${pct}%` }} />
      </div>
      <div className="mt-2 flex items-center justify-between text-xs font-bold">
        <span className="text-slate-500">현재 보유 가치</span>
        <span className="text-sol">{currentValue}★</span>
      </div>
    </div>
  );
}
