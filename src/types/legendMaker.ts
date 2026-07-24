import type { Position, TeamId } from "@/types/domain";

export type CustomLegendCard = {
  id: string;
  name: string;
  teamId: TeamId;
  position: Position | string;
  startYear?: number;
  endYear?: number;
  nickname: string;
  style: string;
  prompt: string;
  cardImage: string;
  portraitImage?: string;
  createdAt: string;
  source?: "folder" | "local";
  sourceFile?: string;
};

export type LegendPromptInput = {
  name: string;
  teamId: TeamId;
  position: Position;
  startYear: number;
  endYear: number;
  handedness: string;
  face: string;
  build: string;
  playStyle: string;
  uniform: string;
  style: string;
  scene: string;
  mood: string;
  background: string;
};
