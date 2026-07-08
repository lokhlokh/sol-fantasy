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
  hasSolTransactionToday?: boolean;
  teamMoundPick?: TeamId;
  seed: number;
};

const key = "sol-fantasy-mock-state";
const defaultState: GameState = { fantasyTeamName: "AI킬러", managerNickname: "홍길동", hasSolTransactionToday: false, seed: 20260707 };

function readStoredState(): GameState {
  if (typeof window === "undefined") return defaultState;

  try {
    const raw = window.localStorage.getItem(key);
    return raw ? { ...defaultState, ...JSON.parse(raw) } : defaultState;
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
      setSolTransactionToday: (hasSolTransactionToday: boolean) => updateState((current) => ({ ...current, hasSolTransactionToday })),
      setHiddenGem: (hiddenGemId: string) =>
        updateState((current) => ({
          ...current,
          lineup: current.lineup ? { ...current.lineup, hiddenGemId } : current.lineup
        })),
      setSeed: (seed: number) => updateState((current) => ({ ...current, seed })),
      reset: () => updateState(() => defaultState)
    }),
    [state]
  );
}
