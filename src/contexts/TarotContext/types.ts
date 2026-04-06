"use client";

import type { DecanAlchemyEntry } from "@/data/tarot/decanAlchemyMap";

export interface TarotElementalInfluences {
  Fire: number;
  Water: number;
  Earth: number;
  Air: number;
}

export interface TarotESMS {
  Spirit: number;
  Essence: number;
  Matter: number;
  Substance: number;
}

export interface TarotCard {
  name: string;
  suit?: string;
  majorArcana?: boolean;
  description?: string;
  planetaryInfluences?: Record<string, number>;
  /** ESMS quantities derived from the decan alchemy system */
  esms?: TarotESMS;
}

export interface TarotContextType {
  tarotCard: TarotCard | null;
  tarotElementalInfluences: TarotElementalInfluences;
  setTarotCard: (card: TarotCard | null) => void;
  setTarotElementalInfluences: (influences: TarotElementalInfluences) => void;
  /** Current decan alchemy info (sign, ruler, ESMS, etc.) */
  decanInfo?: DecanAlchemyEntry;
}
