"use client";

import { useEffect, useMemo, useState } from "react";
import type { Lineup, StrategyCardId, TeamId } from "@/types/domain";

export type GameState = {
  fantasyTeamName?: string;
  managerNickname?: string;
  seasonTeamId?: TeamId;
  lineup?: Lineup;
  strategyCardId?: StrategyCardId;
  bonusStrategyCardId?: StrategyCardId;
  hasSolTransactionThisMonth?: boolean;
  solTransactionMonth?: string;
  teamMoundPick?: TeamId;
  seed: number;
};

const key = "sol-fantasy-mock-state";
function currentMonthKey() {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Seoul", year: "numeric", month: "2-digit" }).formatToParts(new Date());
  const year = parts.find((part) => part.type === "year")?.value ?? "";
  const month = parts.find((part) => part.type === "month")?.value ?? "";
  return `${year}-${month}`;
}

const defaultState: GameState = {
  fantasyTeamName: "AI킬러",
  managerNickname: "홍길동",
  hasSolTransactionThisMonth: false,
  solTransactionMonth: currentMonthKey(),
  seed: 20260707
};

function readStoredState(): GameState {
  if (typeof window === "undefined") return defaultState;

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return defaultState;

    const stored = JSON.parse(raw) as Partial<GameState> & { hasSolTransactionToday?: boolean };
    const month = currentMonthKey();
    const hasTransactionThisMonth = stored.solTransactionMonth
      ? stored.solTransactionMonth === month && Boolean(stored.hasSolTransactionThisMonth)
      : Boolean(stored.hasSolTransactionThisMonth ?? stored.hasSolTransactionToday);

    return {
      ...defaultState,
      ...stored,
      hasSolTransactionThisMonth: hasTransactionThisMonth,
      solTransactionMonth: month
    };
  } catch {
    return defaultState;
  }
}

function writeStoredState(state: GameState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(state));
}

export function useLocalGameState() {
  const [state, setState] = useState<GameState>(readStoredState);

  useEffect(() => {
    const syncStoredState = (event: StorageEvent) => {
      if (event.key === key) setState(readStoredState());
    };

    window.addEventListener("storage", syncStoredState);
    return () => window.removeEventListener("storage", syncStoredState);
  }, []);

  useEffect(() => {
    writeStoredState(state);
  }, [state]);

  const updateState = (updater: (current: GameState) => GameState) => {
    setState((current) => {
      const next = updater(current);
      writeStoredState(next);
      return next;
    });
  };

  return useMemo(
    () => ({
      state,
      setFantasyTeamName: (fantasyTeamName: string) => updateState((current) => ({ ...current, fantasyTeamName })),
      setManagerNickname: (managerNickname: string) => updateState((current) => ({ ...current, managerNickname })),
      setSeasonTeamId: (seasonTeamId: TeamId) => updateState((current) => ({ ...current, seasonTeamId })),
      setLineup: (lineup: Lineup) =>
        updateState((current) => {
          const strategyCardId = current.strategyCardId ?? lineup.strategyCardId;
          const bonusStrategyCardId = current.bonusStrategyCardId ?? lineup.bonusStrategyCardId;
          const teamMoundPick = current.teamMoundPick ?? lineup.teamMoundPick;
          return {
            ...current,
            strategyCardId,
            bonusStrategyCardId,
            teamMoundPick,
            lineup: { ...lineup, strategyCardId, bonusStrategyCardId, teamMoundPick }
          };
        }),
      setStrategy: (strategyCardId: StrategyCardId, teamMoundPick: TeamId) =>
        updateState((current) => ({
          ...current,
          strategyCardId,
          teamMoundPick,
          lineup: current.lineup ? { ...current.lineup, strategyCardId, teamMoundPick } : current.lineup
        })),
      setBonusStrategy: (bonusStrategyCardId: StrategyCardId) =>
        updateState((current) => ({
          ...current,
          bonusStrategyCardId,
          lineup: current.lineup ? { ...current.lineup, bonusStrategyCardId } : current.lineup
        })),
      setSolTransactionThisMonth: (hasSolTransactionThisMonth: boolean) =>
        updateState((current) => ({ ...current, hasSolTransactionThisMonth, solTransactionMonth: currentMonthKey() })),
      setSeed: (seed: number) => updateState((current) => ({ ...current, seed })),
      reset: () => updateState(() => defaultState)
    }),
    [state]
  );
}
