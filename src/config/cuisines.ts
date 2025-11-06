export interface CuisineProperties {
  name: string;
  elementalState: {
    Fire: number;
    Water: number;
    Air: number;
    Earth: number;
  };
  description: string;
  traditionalIngredients: string[];
}

export const CUISINES: Record<string, CuisineProperties> = {
  Japanese: {
    name: "Japanese",
    elementalState: {
      Fire: 0.2,
      Water: 0.4,
      Air: 0.2,
      Earth: 0.2,
    },
    description:
      "Balanced and refined, emphasizing seasonal ingredients and umami flavors",
    traditionalIngredients: ["dashi", "miso", "soy sauce", "rice", "seaweed"],
  },
  Chinese: {
    name: "Chinese",
    elementalState: {
      Fire: 0.3,
      Water: 0.2,
      Air: 0.2,
      Earth: 0.3,
    },
    description: "Dynamic and diverse, focusing on the balance of yin and yang",
    traditionalIngredients: [
      "soy sauce",
      "ginger",
      "garlic",
      "rice wine",
      "five spice",
    ],
  },
  Italian: {
    name: "Italian",
    elementalState: {
      Fire: 0.3,
      Water: 0.3,
      Air: 0.2,
      Earth: 0.2,
    },
    description: "Fresh and passionate, celebrating regional ingredients",
    traditionalIngredients: [
      "olive oil",
      "tomatoes",
      "basil",
      "garlic",
      "pasta",
    ],
  },
  Indian: {
    name: "Indian",
    elementalState: {
      Fire: 0.4,
      Water: 0.2,
      Air: 0.2,
      Earth: 0.2,
    },
    description: "Rich and aromatic, built on complex spice combinations",
    traditionalIngredients: [
      "cumin",
      "turmeric",
      "cardamom",
      "rice",
      "lentils",
    ],
  },
  Thai: {
    name: "Thai",
    elementalState: {
      Fire: 0.3,
      Water: 0.3,
      Air: 0.2,
      Earth: 0.2,
    },
    description: "Harmonious blend of sweet, sour, salty, and spicy",
    traditionalIngredients: [
      "fish sauce",
      "coconut milk",
      "lemongrass",
      "chilies",
      "lime",
    ],
  },
  Mexican: {
    name: "Mexican",
    elementalState: {
      Fire: 0.4,
      Water: 0.2,
      Air: 0.2,
      Earth: 0.2,
    },
    description: "Bold and vibrant, with deep roots in ancient traditions",
    traditionalIngredients: ["chilies", "corn", "beans", "tomatoes", "lime"],
  },
  Mediterranean: {
    name: "Mediterranean",
    elementalState: {
      Fire: 0.2,
      Water: 0.3,
      Air: 0.3,
      Earth: 0.2,
    },
    description: "Fresh and healthy, emphasizing olive oil and seafood",
    traditionalIngredients: [
      "olive oil",
      "garlic",
      "herbs",
      "tomatoes",
      "seafood",
    ],
  },
  French: {
    name: "French",
    elementalState: {
      Fire: 0.2,
      Water: 0.3,
      Air: 0.3,
      Earth: 0.2,
    },
    description: "Refined and technical, with emphasis on technique",
    traditionalIngredients: ["butter", "wine", "herbs", "cream", "shallots"],
  },
  Korean: {
    name: "Korean",
    elementalState: {
      Fire: 0.3,
      Water: 0.2,
      Air: 0.2,
      Earth: 0.3,
    },
    description: "Bold and fermented flavors with balance of textures",
    traditionalIngredients: [
      "kimchi",
      "gochugaru",
      "sesame oil",
      "soy sauce",
      "garlic",
    ],
  },
  Vietnamese: {
    name: "Vietnamese",
    elementalState: {
      Fire: 0.2,
      Water: 0.3,
      Air: 0.3,
      Earth: 0.2,
    },
    description: "Fresh and light, with bright herbs and balanced flavors",
    traditionalIngredients: [
      "fish sauce",
      "rice noodles",
      "herbs",
      "lime",
      "chilies",
    ],
  },
};

export const _CUISINE_CATEGORIES = Object.keys(CUISINES);
