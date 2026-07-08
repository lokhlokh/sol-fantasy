"use client";

import type { StrategyCardId } from "@/types/domain";
import { strategyCards } from "@/rules/strategyCards";

export function StrategyCardSelector({ value, onChange }: { value: StrategyCardId; onChange: (id: StrategyCardId) => void }) {
  return (
    <div className="grid gap-2">
      {Object.values(strategyCards).map((card) => (
        <button
          type="button"
          key={card.id}
          onClick={() => onChange(card.id)}
          className={`rounded-lg border p-3 text-left ${value === card.id ? "border-sol bg-blue-50" : "border-slate-200"}`}
        >
          <p className="font-black">{card.name}</p>
          <p className="text-sm text-slate-600">{card.description}</p>
        </button>
      ))}
    </div>
  );
}
