export const unifiedIngredients = [
  {
    id: "tomato",
    name: "Tomato",
    category: "vegetables",
    elements: { Fire: 0.6, Water: 0.3, Earth: 0.1, Air: 0
    },
    alchemical: {
      Spirit: 0.6,
      Essence: 0.3,
      Matter: 0.1,
      Substance: 0
    },
    kalchm: 1.12,
    season: ["summer"]
  },
  {
    id: "basil",
    name: "Basil",
    category: "herbs",
    elements: { Fire: 0.4, Water: 0.1, Earth: 0.2, Air: 0.3
    },
    alchemical: {
      Spirit: 0.4,
      Essence: 0.1,
      Matter: 0.2,
      Substance: 0.3
    },
    kalchm: 0.89,
    season: ["summer"]
  },
  {
    id: "garlic",
    name: "Garlic",
    category: "herbs",
    elements: { Fire: 0.7, Water: 0, Earth: 0.3, Air: 0
    },
    alchemical: {
      Spirit: 0.7,
      Essence: 0,
      Matter: 0.3,
      Substance: 0
    },
    kalchm: 1.25,
    season: ["all"]
  },
  {
    id: "lemon",
    name: "Lemon",
    category: "fruits",
    elements: { Fire: 0.2, Water: 0.5, Earth: 0.1, Air: 0.2
    },
    alchemical: {
      Spirit: 0.2,
      Essence: 0.5,
      Matter: 0.1,
      Substance: 0.2
    },
    kalchm: 0.95,
    season: ["winter", "spring"]
  },
  {
    id: "olive_oil",
    name: "Olive Oil",
    category: "oils",
    elements: { Fire: 0.2, Water: 0, Earth: 0.7, Air: 0.1
    },
    alchemical: {
      Spirit: 0.2,
      Essence: 0,
      Matter: 0.7,
      Substance: 0.1
    },
    kalchm: 1.05,
    season: ["all"]
  }
];

export const getIngredientById = (id) => {
  return unifiedIngredients.find(ingredient => ingredient.id === id);
};

export const getIngredientsByCategory = (category) => {
  return unifiedIngredients.filter(ingredient => ingredient.category === category);
};

export const getIngredientsByElement = (element, threshold = 0.5) => {
  return unifiedIngredients.filter(ingredient => ingredient.elements[element] >= threshold);
};

export const getIngredientsByKalchmRange = (min, max) => {
  return unifiedIngredients.filter(ingredient => 
    ingredient.kalchm >= min && ingredient.kalchm <= max
  );
};

export const getIngredientsBySeason = (season) => {
  return unifiedIngredients.filter(ingredient => 
    ingredient.season.includes(season) || ingredient.season.includes("all")
  );
}; 