import type { FeatureKey } from "./types";

/** How each feature reads in "why this dish" reasons and the craving profile. */
export const FEATURE_WORDS: Readonly<
  Record<FeatureKey, { label: string; high: string; low: string }>
> = {
  warmth: { label: "Warm", high: "is served hot", low: "is served cool" },
  spice: { label: "Chili heat", high: "carries real chili heat", low: "keeps the heat gentle" },
  richness: { label: "Rich", high: "is rich and indulgent", low: "stays light on fat" },
  crunch: { label: "Crunch", high: "has proper crunch", low: "skips the crunch" },
  tender: { label: "Tender", high: "is soft and slow-cooked", low: "keeps its bite" },
  brothy: { label: "Spoonable", high: "is a spoonable, brothy bowl", low: "isn't soupy" },
  fresh: { label: "Bright", high: "is bright with acid and herbs", low: "goes deep rather than bright" },
  umami: { label: "Savory", high: "is deeply savory", low: "keeps savory notes quiet" },
  sweet: { label: "Sweet", high: "leans sweet", low: "is firmly savory" },
  hearty: { label: "Hearty", high: "is properly filling", low: "eats light" },
  effort: { label: "Project", high: "is a cooking project", low: "comes together easily" },
  adventure: { label: "Adventurous", high: "uses unusual ingredients", low: "is a familiar classic" },
  smoky: { label: "Smoky", high: "has smoke and char", low: "skips the char" },
  aromatic: { label: "Aromatic", high: "is fragrant with spice", low: "keeps spices in the background" },
  handheld: { label: "Handheld", high: "is eaten with your hands", low: "is a knife-and-fork plate" },
  green: { label: "Veg-forward", high: "is packed with vegetables", low: "isn't about the vegetables" },
};

export const FAMILY_LABELS: Readonly<Record<string, string>> = {
  "east-asian": "East Asian",
  "southeast-asian": "Southeast Asian",
  "south-asian": "South Asian",
  "middle-eastern": "Middle Eastern",
  mediterranean: "Mediterranean & European",
  "eastern-european": "Eastern European",
  "latin-american": "Latin American",
  american: "American",
  african: "African",
  holistic: "Holistic & macrobiotic",
  fusion: "Fusion",
};

export function titleCase(value: string): string {
  return value.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

/** "Thai", "Middle Eastern", "Hsca" → "Holistic". Display name of a dish's cuisine. */
export function cuisineLabel(cuisine: string): string {
  return cuisine === "hsca" ? "Holistic" : titleCase(cuisine);
}

export function minutesLabel(minutes: number | null): string {
  if (minutes === null) return "time not stated";
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours} h ${rest} min` : `${hours} h`;
}
