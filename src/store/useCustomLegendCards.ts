"use client";

import { useCallback, useEffect, useState } from "react";
import type { CustomLegendCard } from "@/types/legendMaker";

const STORAGE_KEY = "sol-fantasy-custom-legend-cards";
const CHANGE_EVENT = "sol-custom-legend-cards-change";

type FolderCardManifest = {
  cards?: Array<{
    id: string;
    name: string;
    team: string;
    position: string;
    style?: string;
    prompt?: string;
    createdAt?: string;
    sourceFile?: string;
    cardImageUrl: string;
    portraitImageUrl?: string;
  }>;
};

function readCards(): CustomLegendCard[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CustomLegendCard[]) : [];
  } catch {
    return [];
  }
}

function writeCards(cards: CustomLegendCard[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

async function readFolderCards(): Promise<CustomLegendCard[]> {
  try {
    const response = await fetch("/legend-packages/index.json", { cache: "no-store" });
    if (!response.ok) return [];
    const manifest = (await response.json()) as FolderCardManifest;
    return (manifest.cards ?? []).filter((item) => item.id && item.name && item.cardImageUrl).map((item) => ({
      id: item.id,
      name: item.name,
      teamId: item.team as CustomLegendCard["teamId"],
      position: item.position,
      nickname: "",
      style: item.style ?? "",
      prompt: item.prompt ?? "",
      cardImage: item.cardImageUrl,
      portraitImage: item.portraitImageUrl || item.cardImageUrl,
      createdAt: item.createdAt || new Date().toISOString(),
      source: "folder" as const,
      sourceFile: item.sourceFile,
    }));
  } catch {
    return [];
  }
}

function mergeCards(folderCards: CustomLegendCard[], localCards: CustomLegendCard[]) {
  const seen = new Set<string>();
  return [...folderCards, ...localCards].filter((card) => {
    if (seen.has(card.id)) return false;
    seen.add(card.id);
    return true;
  });
}

export function useCustomLegendCards() {
  const [cards, setCards] = useState<CustomLegendCard[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const sync = async () => {
      const next = mergeCards(await readFolderCards(), readCards());
      if (cancelled) return;
      setCards(next);
      setReady(true);
    };
    void sync();
    window.addEventListener("storage", sync);
    window.addEventListener(CHANGE_EVENT, sync);
    return () => {
      cancelled = true;
      window.removeEventListener("storage", sync);
      window.removeEventListener(CHANGE_EVENT, sync);
    };
  }, []);

  const saveCard = useCallback((card: CustomLegendCard) => {
    const next = [card, ...readCards().filter((item) => item.id !== card.id)];
    writeCards(next.slice(0, 12));
    setCards(next.slice(0, 12));
  }, []);

  const removeCard = useCallback((id: string) => {
    const next = readCards().filter((item) => item.id !== id);
    writeCards(next);
    setCards(next);
  }, []);

  return { cards, saveCard, removeCard, ready };
}