export function BudgetBar({ used, max = 50 }: { used: number; max?: number }) {
  const pct = Math.min(100, (used / max) * 100);
  return (
    <div>
      <div className="mb-1 flex justify-between text-sm font-bold">
        <span>예산</span>
        <span className={used > max ? "text-red-600" : "text-ink"}>{used}/{max}★</span>
      </div>
      <div className="h-2 rounded-full bg-slate-200">
        <div className={`h-2 rounded-full ${used > max ? "bg-red-500" : "bg-field"}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
