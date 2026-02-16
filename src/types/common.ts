// Common types used across the application
export type { Season } from "@/constants/seasons";
export type ZodiacSignType =
  | "aries"
  | "taurus"
  | "gemini"
  | "cancer"
  | "leo"
  | "virgo"
  | "libra"
  | "scorpio"
  | "sagittarius"
  | "capricorn"
  | "aquarius"
  | "pisces";
export interface PlanetaryAlignment {
  Sun: string;
  Moon: string;
  Mercury: string;
  Venus: string;
  Mars: string;
  Jupiter: string;
  Saturn: string;
  Uranus: string;
  Neptune: string;
  Pluto: string;
  Ascendant?: string;
}

export type TimeOfDay = "morning" | "afternoon" | "evening" | "night";
export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

// Common interfaces used across recommendation and filtering utilities
export interface ScoredItem {
  score: number;
  [key: string]: unknown;
}

export interface ElementalData {
  Fire: number;
  Water: number;
  Earth: number;
  Air: number;
  [key: string]: unknown;
}
