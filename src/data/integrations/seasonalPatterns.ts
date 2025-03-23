import type { ElementalProperties, Season } from '@/types/alchemy';

export type SeasonalPattern = Record<string, number>;

export const seasonalPatterns: Record<Season, SeasonalPattern> = {
  spring: {
    "asparagus": 0.9,
    "peas": 0.85,
    "artichokes": 0.82,
    "rhubarb": 0.78,
    "radishes": 0.75,
    "spring_greens": 0.92,
    "fava_beans": 0.8,
    "morels": 0.87,
    "strawberries": 0.7,
    "new_potatoes": 0.76,
    elementalInfluence: 0.8
  },
  summer: {
    "tomatoes": 0.9,
    "corn": 0.85,
    "peaches": 0.88,
    "watermelon": 0.92,
    "berries": 0.87,
    "summer_squash": 0.82,
    "eggplant": 0.79,
    "bell_peppers": 0.84,
    "cucumbers": 0.86,
    "cherries": 0.88,
    elementalInfluence: 0.9
  },
  fall: {
    "apples": 0.9,
    "pumpkin": 0.95,
    "butternut_squash": 0.92,
    "sweet_potatoes": 0.87,
    "brussels_sprouts": 0.84,
    "cranberries": 0.82,
    "figs": 0.78,
    "grapes": 0.83,
    "mushrooms": 0.79,
    "pears": 0.88,
    elementalInfluence: 0.7
  },
  winter: {
    "citrus": 0.85,
    "kale": 0.8,
    "root_vegetables": 0.9,
    "pomegranates": 0.82,
    "winter_squash": 0.88,
    "persimmons": 0.76,
    "leeks": 0.79,
    "brussels_sprouts": 0.75,
    "turnips": 0.77,
    "cranberries": 0.72,
    elementalInfluence: 0.6
  },
  all: {
    "onions": 0.9,
    "garlic": 0.9,
    "carrots": 0.85,
    "potatoes": 0.87,
    "rice": 0.9,
    "eggs": 0.88,
    "beans": 0.86,
    "lentils": 0.87,
    "flour": 0.9,
    "olive_oil": 0.9,
    "chicken": 0.85,
    "salt": 0.95,
    "pepper": 0.95,
    "herbs": 0.8
  }
};

export default seasonalPatterns;