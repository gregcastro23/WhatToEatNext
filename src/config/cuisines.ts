export interface CuisineProperties {
    name: string;
    elementalBalance: {
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
        elementalBalance: {
            Fire: 0.2,
            Water: 0.4,
            Air: 0.2,
            Earth: 0.2
        },
        description: "Balanced and refined, emphasizing seasonal ingredients and umami flavors",
        traditionalIngredients: ["dashi", "miso", "soy sauce", "rice", "seaweed"]
    },
    Chinese: {
        name: "Chinese",
        elementalBalance: {
            Fire: 0.3,
            Water: 0.2,
            Air: 0.2,
            Earth: 0.3
        },
        description: "Dynamic and diverse, focusing on the balance of yin and yang",
        traditionalIngredients: ["soy sauce", "ginger", "garlic", "rice wine", "five spice"]
    },
    Italian: {
        name: "Italian",
        elementalBalance: {
            Fire: 0.3,
            Water: 0.3,
            Air: 0.2,
            Earth: 0.2
        },
        description: "Fresh and passionate, celebrating regional ingredients",
        traditionalIngredients: ["olive oil", "tomatoes", "basil", "garlic", "pasta"]
    },
    Indian: {
        name: "Indian",
        elementalBalance: {
            Fire: 0.4,
            Water: 0.2,
            Air: 0.2,
            Earth: 0.2
        },
        description: "Rich and aromatic, built on complex spice combinations",
        traditionalIngredients: ["cumin", "turmeric", "cardamom", "rice", "lentils"]
    },
    Thai: {
        name: "Thai",
        elementalBalance: {
            Fire: 0.3,
            Water: 0.3,
            Air: 0.2,
            Earth: 0.2
        },
        description: "Harmonious blend of sweet, sour, salty, and spicy",
        traditionalIngredients: ["fish sauce", "coconut milk", "lemongrass", "chilies", "lime"]
    },
    Mexican: {
        name: "Mexican",
        elementalBalance: {
            Fire: 0.4,
            Water: 0.2,
            Air: 0.2,
            Earth: 0.2
        },
        description: "Bold and vibrant, with deep roots in ancient traditions",
        traditionalIngredients: ["chilies", "corn", "beans", "tomatoes", "lime"]
    },
    Mediterranean: {
        name: "Mediterranean",
        elementalBalance: {
            Fire: 0.2,
            Water: 0.3,
            Air: 0.3,
            Earth: 0.2
        },
        description: "Fresh and healthy, emphasizing olive oil and seafood",
        traditionalIngredients: ["olive oil", "garlic", "herbs", "tomatoes", "seafood"]
    },
    French: {
        name: "French",
        elementalBalance: {
            Fire: 0.2,
            Water: 0.3,
            Air: 0.3,
            Earth: 0.2
        },
        description: "Refined and technical, with emphasis on technique",
        traditionalIngredients: ["butter", "wine", "herbs", "cream", "shallots"]
    },
    Korean: {
        name: "Korean",
        elementalBalance: {
            Fire: 0.3,
            Water: 0.2,
            Air: 0.2,
            Earth: 0.3
        },
        description: "Bold and fermented flavors with balance of textures",
        traditionalIngredients: ["kimchi", "gochugaru", "sesame oil", "soy sauce", "garlic"]
    },
    Vietnamese: {
        name: "Vietnamese",
        elementalBalance: {
            Fire: 0.2,
            Water: 0.3,
            Air: 0.3,
            Earth: 0.2
        },
        description: "Fresh and light, with bright herbs and balanced flavors",
        traditionalIngredients: ["fish sauce", "rice noodles", "herbs", "lime", "chilies"]
    }
};

export const CUISINE_CATEGORIES = Object.keys(CUISINES); 