import type { Position } from "@/types/domain";
import { positionLabels } from "@/data/labels";

export function LineupSlot({ label, count, need }: { label: Position; count: number; need: number }) {
  return (
    <div className={`rounded-md border px-2 py-2 text-center text-xs font-bold ${count === need ? "border-field bg-green-50" : "border-slate-200 bg-slate-50"}`}>
      {positionLabels[label]}
      <br />
      {count}/{need}
    </div>
  );
}
