export interface ElementalProperties {
  Fire: number;
  Water: number;
  Air: number;
  Earth: number;
}

export interface ThermodynamicsResult {
  heat: number;
  entropy: number;
  reactivity: number;
  gregsEnergy: number;
  kalchm: number;
  monica: number | null;
}

export interface RecommendationRequest {
  ingredients: string[];
  dietaryRestrictions?: string[] | undefined;
  cuisinePreferences?: string[] | undefined;
}

export interface Recipe {
  id: string;
  name: string;
  url?: string | undefined;
}

export interface TokenRatesRequest {
  datetime?: string | undefined;
  location?: { latitude: number; longitude: number } | undefined;
  elemental?: ElementalProperties | undefined;
  esms?: { Spirit: number; Essence: number; Matter: number; Substance: number } | undefined;
}

export interface TokenRatesResult {
  Spirit: number;
  Essence: number;
  Matter: number;
  Substance: number;
  kalchm: number;
  /**
   * NULL when the rate endpoint has no elemental input.
   *
   * monica = −gregsEnergy / (reactivity · ln kalchm), and both gregsEnergy and
   * reactivity are functions of the four ELEMENTS. Elements come from SIGNS,
   * and this endpoint is given only a planetary HOUR — a ruling planet, no
   * sign. So monica is not derivable and the server says so rather than
   * substituting a literal (it used to return 1.0 unconditionally).
   *
   * `kalchm` is not in the same position: it is a function of the ESMS axes
   * alone, which the planetary hour does determine, so it is a real value.
   *
   * Handle the absence at the display layer. Do NOT `?? 1` it.
   */
  monica: number | null;
}

export interface RuneAgentRequest {
  datetime?: string | undefined;
  location?: { latitude: number; longitude: number } | undefined;
  context?: "cuisine" | "recipe" | "ingredient" | "cooking_method" | undefined;
  preferences?: {
    dietaryRestrictions?: string[] | undefined;
    cuisineTypes?: string[] | undefined;
    intensity?: "mild" | "moderate" | "intense" | undefined;
  } | undefined;
}

export interface RuneResult {
  symbol: string;
  name: string;
  meaning: string;
  influence: {
    elemental: ElementalProperties;
    energy: {
      Spirit: number;
      Essence: number;
      Matter: number;
      Substance: number;
    };
    guidance: string;
  };
}

export interface PlanetaryHourRequest {
  datetime?: string | undefined;
  location?: { latitude: number; longitude: number } | undefined;
}

export interface PlanetaryHourResult {
  planet: string;
  hourNumber?: number | undefined;
  isDaytime: boolean;
  start?: string | undefined;
  end?: string | undefined;
}
