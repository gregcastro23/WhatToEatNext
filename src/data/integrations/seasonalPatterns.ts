import type { _, Season } from "@/types/alchemy";

export interface SeasonalPattern {
  [key: string]: number | TarotInfluences;
}

export interface TarotCardInfluence {
  element: string;
  effect: number;
  ingredients: string[];
  cookingMethod: string;
}

export interface TarotInfluences {
  [cardKey: string]: TarotCardInfluence | string;
  dominant_element: string;
  secondary_element: string;
}

export const seasonalPatterns: Record<Season, SeasonalPattern> = {
  spring: {
    asparagus: 0.9,
    peas: 0.85,
    artichokes: 0.82,
    rhubarb: 0.78,
    radishes: 0.75,
    spring_greens: 0.92,
    fava_beans: 0.8,
    morels: 0.87,
    strawberries: 0.7,
    new_potatoes: 0.76,
    elementalInfluence: 0.8,
    tarotInfluences: {
      "2_of_wands": {
        element: "Fire",
        effect: 0.85,
        ingredients: ["radishes", "spring_greens"],
        cookingMethod: "grilling",
      },
      "3_of_wands": {
        element: "Fire",
        effect: 0.8,
        ingredients: ["asparagus", "morels"],
        cookingMethod: "roasting",
      },
      "4_of_wands": {
        element: "Fire",
        effect: 0.75,
        ingredients: ["strawberries", "new_potatoes"],
        cookingMethod: "baking",
      },
      "5_of_pentacles": {
        element: "Earth",
        effect: 0.7,
        ingredients: ["rhubarb", "fava_beans"],
        cookingMethod: "slow_cooking",
      },
      dominant_element: "Fire",
      secondary_element: "Air",
    },
  },
  summer: {
    tomatoes: 0.9,
    corn: 0.85,
    peaches: 0.88,
    watermelon: 0.92,
    berries: 0.87,
    summer_squash: 0.82,
    eggplant: 0.79,
    bell_peppers: 0.84,
    cucumbers: 0.86,
    cherries: 0.88,
    elementalInfluence: 0.9,
    tarotInfluences: {
      "2_of_cups": {
        element: "Water",
        effect: 0.85,
        ingredients: ["watermelon", "cucumbers"],
        cookingMethod: "raw",
      },
      "3_of_cups": {
        element: "Water",
        effect: 0.9,
        ingredients: ["berries", "peaches"],
        cookingMethod: "preserving",
      },
      "5_of_wands": {
        element: "Fire",
        effect: 0.85,
        ingredients: ["tomatoes", "bell_peppers"],
        cookingMethod: "grilling",
      },
      "6_of_wands": {
        element: "Fire",
        effect: 0.8,
        ingredients: ["corn", "summer_squash"],
        cookingMethod: "roasting",
      },
      dominant_element: "Fire",
      secondary_element: "Water",
    },
  },
  autumn: {
    apples: 0.9,
    pumpkin: 0.95,
    butternut_squash: 0.92,
    sweet_potatoes: 0.87,
    brussels_sprouts: 0.84,
    cranberries: 0.82,
    figs: 0.78,
    grapes: 0.83,
    mushrooms: 0.79,
    pears: 0.88,
    elementalInfluence: 0.7,
    tarotInfluences: {
      "2_of_swords": {
        element: "Air",
        effect: 0.7,
        ingredients: ["apples", "pears"],
        cookingMethod: "baking",
      },
      "5_of_cups": {
        element: "Water",
        effect: 0.75,
        ingredients: ["cranberries", "figs"],
        cookingMethod: "poaching",
      },
      "6_of_cups": {
        element: "Water",
        effect: 0.8,
        ingredients: ["pumpkin", "sweet_potatoes"],
        cookingMethod: "roasting",
      },
      "8_of_wands": {
        element: "Fire",
        effect: 0.65,
        ingredients: ["grapes", "mushrooms"],
        cookingMethod: "quick_cooking",
      },
      dominant_element: "Earth",
      secondary_element: "Water",
    },
  },
  fall: {
    apples: 0.9,
    pumpkin: 0.95,
    butternut_squash: 0.92,
    sweet_potatoes: 0.87,
    brussels_sprouts: 0.84,
    cranberries: 0.82,
    figs: 0.78,
    grapes: 0.83,
    mushrooms: 0.79,
    pears: 0.88,
    elementalInfluence: 0.7,
    tarotInfluences: {
      "2_of_swords": {
        element: "Air",
        effect: 0.7,
        ingredients: ["apples", "pears"],
        cookingMethod: "baking",
      },
      "5_of_cups": {
        element: "Water",
        effect: 0.75,
        ingredients: ["cranberries", "figs"],
        cookingMethod: "poaching",
      },
      "6_of_cups": {
        element: "Water",
        effect: 0.8,
        ingredients: ["pumpkin", "sweet_potatoes"],
        cookingMethod: "roasting",
      },
      "8_of_wands": {
        element: "Fire",
        effect: 0.65,
        ingredients: ["grapes", "mushrooms"],
        cookingMethod: "quick_cooking",
      },
      dominant_element: "Earth",
      secondary_element: "Water",
    },
  },
  winter: {
    citrus: 0.85,
    kale: 0.8,
    root_vegetables: 0.9,
    pomegranates: 0.82,
    winter_squash: 0.88,
    persimmons: 0.76,
    leeks: 0.79,
    brussels_sprouts: 0.75,
    turnips: 0.77,
    cranberries: 0.72,
    elementalInfluence: 0.6,
    tarotInfluences: {
      "2_of_pentacles": {
        element: "Earth",
        effect: 0.75,
        ingredients: ["root_vegetables", "winter_squash"],
        cookingMethod: "slow_cooking",
      },
      "3_of_pentacles": {
        element: "Earth",
        effect: 0.8,
        ingredients: ["kale", "leeks"],
        cookingMethod: "braising",
      },
      "8_of_cups": {
        element: "Water",
        effect: 0.7,
        ingredients: ["citrus", "pomegranates"],
        cookingMethod: "poaching",
      },
      "9_of_cups": {
        element: "Water",
        effect: 0.85,
        ingredients: ["persimmons", "cranberries"],
        cookingMethod: "baking",
      },
      dominant_element: "Water",
      secondary_element: "Earth",
    },
  },
  all: {
    onions: 0.9,
    garlic: 0.9,
    carrots: 0.85,
    potatoes: 0.87,
    rice: 0.9,
    eggs: 0.88,
    beans: 0.86,
    lentils: 0.87,
    flour: 0.9,
    olive_oil: 0.9,
    chicken: 0.85,
    salt: 0.95,
    pepper: 0.95,
    herbs: 0.8,
    tarotInfluences: {
      ace_of_wands: {
        element: "Fire",
        effect: 0.9,
        ingredients: ["garlic", "pepper"],
        cookingMethod: "high_heat",
      },
      ace_of_cups: {
        element: "Water",
        effect: 0.9,
        ingredients: ["eggs", "rice"],
        cookingMethod: "simmering",
      },
      ace_of_swords: {
        element: "Air",
        effect: 0.9,
        ingredients: ["herbs", "olive_oil"],
        cookingMethod: "infusing",
      },
      ace_of_pentacles: {
        element: "Earth",
        effect: 0.9,
        ingredients: ["potatoes", "beans"],
        cookingMethod: "roasting",
      },
      dominant_element: "balanced",
      secondary_element: "balanced",
    },
  },
};

export function getTarotInfluenceForSeason(
  season: Season,
): TarotInfluences | Record<string, never> {
  const influences = seasonalPatterns[season].tarotInfluences;
  return (influences as TarotInfluences) || {};
}

export function getSeasonalIngredientsByTarotCard(
  season: Season,
  cardKey: string,
): string[] {
  const influence = (
    seasonalPatterns[season].tarotInfluences as TarotInfluences
  )[cardKey] as TarotCardInfluence;
  return influence.ingredients || [];
}

export function getRecommendedCookingMethodByTarotCard(
  season: Season,
  cardKey: string,
): string {
  const influence = (
    seasonalPatterns[season].tarotInfluences as TarotInfluences
  )[cardKey] as TarotCardInfluence;
  return influence.cookingMethod || "";
}

export default seasonalPatterns;
