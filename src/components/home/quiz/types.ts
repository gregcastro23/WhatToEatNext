import type { ElementVector } from "@/utils/guestPalate";

export type { ElementVector, PalateElement } from "@/utils/guestPalate";
export type ESMSKey = "Spirit" | "Essence" | "Matter" | "Substance";
export type ESMSVector = Record<ESMSKey, number>;

/**
 * What the homepage hero knows about this visit, passed into the quiz.
 * LiveHero builds it from the local clock, the guest table, the session and
 * the sourced sky; callers may override any field.
 */
export interface QuizContext {
  timeOfDay: "morning" | "afternoon" | "evening" | "night";
  season: "spring" | "summer" | "autumn" | "winter";
  tableSize: number;
  tableGlyphs: string;
  elementalBias: ElementVector | null;
  isAuthenticated: boolean;
  planetaryHour?: string;
  lunarPhase?: string;
  zodiacSign?: string;
  weather?: { temperatureC: number; condition: string };
  planetaryPositions?: Record<string, string>;
  /** Measured planetary quantities. Never inferred from elementalBias. */
  planetaryESMS?: ESMSVector;
}

export const DEFAULT_QUIZ_CONTEXT: QuizContext = {
  timeOfDay: "evening",
  season: "autumn",
  tableSize: 1,
  tableGlyphs: "",
  elementalBias: null,
  isAuthenticated: false,
};
