'use client';


export interface TarotElementalInfluences {
  Fire: number;
  Water: number;
  Earth: number;
  Air: number;
}

export interface TarotCard {
  name: string;
  suit?: string;
  majorArcana?: boolean;
  description?: string;
  planetaryInfluences?: Record<string, number>;
}

export interface TarotContextType {
  tarotCard: TarotCard | null;
  tarotElementalInfluences: TarotElementalInfluences;
  setTarotCard: (card: TarotCard | null) => void;
  setTarotElementalInfluences: (influences: TarotElementalInfluences) => void;
} 