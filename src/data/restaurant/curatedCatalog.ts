/**
 * Curated restaurant templates and signature dishes.
 *
 * Provides high-reliability authentic restaurant fallbacks and quick dish
 * suggestions for dish reviews and Order It workflows.
 *
 * Pure data module — safe for both client and server components.
 *
 * @file src/data/restaurant/curatedCatalog.ts
 */

export interface CuratedRestaurantTemplate {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  reviewCount: number;
  price: string;
  signatureDishes: string[];
  latOffset: number;
  lngOffset: number;
}

export const CURATED_RESTAURANTS: CuratedRestaurantTemplate[] = [
  // Italian
  {
    id: "partner_alchm_trattoria",
    name: "Alchm Trattoria & Pizzeria",
    cuisine: "Italian",
    rating: 4.8,
    reviewCount: 342,
    price: "$$",
    signatureDishes: [
      "Fire Roasted Flatbread",
      "Golden Grain Bowl",
      "Truffle Cacio e Pepe",
      "Classic Tiramisu",
    ],
    latOffset: 0.003,
    lngOffset: -0.002,
  },
  {
    id: "curated_osteria_sole",
    name: "Osteria Del Sole",
    cuisine: "Italian",
    rating: 4.7,
    reviewCount: 198,
    price: "$$$",
    signatureDishes: [
      "Wild Mushroom Tagliatelle",
      "Veal Osso Buco",
      "Burrata Caprese",
    ],
    latOffset: -0.004,
    lngOffset: 0.005,
  },
  // Mexican
  {
    id: "partner_sol_taqueria",
    name: "Sol & Luna Cantina",
    cuisine: "Mexican",
    rating: 4.9,
    reviewCount: 421,
    price: "$$",
    signatureDishes: [
      "Birria de Res Tacos",
      "Enchiladas Mole Poblano",
      "Fire Roasted Flatbread",
      "Churros con Dulce",
    ],
    latOffset: 0.002,
    lngOffset: 0.004,
  },
  {
    id: "curated_oaxaca_hearth",
    name: "Oaxaca Hearth & Bar",
    cuisine: "Mexican",
    rating: 4.6,
    reviewCount: 156,
    price: "$$",
    signatureDishes: [
      "Carnitas Michoacanas",
      "Chiles Rellenos",
      "Fresh Guacamole & Chips",
    ],
    latOffset: -0.005,
    lngOffset: -0.003,
  },
  // Japanese
  {
    id: "partner_celestial_ramen",
    name: "Celestial Ramen House",
    cuisine: "Japanese",
    rating: 4.8,
    reviewCount: 512,
    price: "$$",
    signatureDishes: [
      "Rich Tonkotsu Ramen",
      "Black Garlic Shoyu Ramen",
      "Golden Grain Bowl",
      "Crispy Gyoza",
    ],
    latOffset: -0.002,
    lngOffset: -0.004,
  },
  {
    id: "curated_sushi_zen",
    name: "Sushi Zen & Robata",
    cuisine: "Japanese",
    rating: 4.9,
    reviewCount: 289,
    price: "$$$",
    signatureDishes: [
      "Omakase Nigiri Set",
      "Spicy Bluefin Tuna Roll",
      "Miso Glazed Black Cod",
    ],
    latOffset: 0.006,
    lngOffset: 0.001,
  },
  // Thai
  {
    id: "curated_golden_lotus_thai",
    name: "Golden Lotus Thai Cuisine",
    cuisine: "Thai",
    rating: 4.7,
    reviewCount: 215,
    price: "$$",
    signatureDishes: [
      "Traditional Pad Thai",
      "Green Coconut Curry",
      "Tom Yum Goong",
      "Mango Sticky Rice",
    ],
    latOffset: 0.004,
    lngOffset: -0.005,
  },
  // Indian
  {
    id: "curated_tandoori_flame",
    name: "Tandoori Flame & Spice",
    cuisine: "Indian",
    rating: 4.8,
    reviewCount: 310,
    price: "$$",
    signatureDishes: [
      "Butter Chicken Makhani",
      "Garlic Butter Naan",
      "Lamb Rogan Josh",
      "Paneer Tikka",
    ],
    latOffset: -0.003,
    lngOffset: 0.006,
  },
  // Mediterranean
  {
    id: "curated_olive_oregano",
    name: "Olive & Oregano Mediterranean",
    cuisine: "Mediterranean",
    rating: 4.7,
    reviewCount: 184,
    price: "$$",
    signatureDishes: [
      "Slow Roasted Lamb Shawarma",
      "Crisp Falafel Platter",
      "Creamy Hummus with Za'atar",
    ],
    latOffset: 0.005,
    lngOffset: 0.003,
  },
  // Chinese
  {
    id: "curated_imperial_wok",
    name: "Imperial Wok & Dim Sum",
    cuisine: "Chinese",
    rating: 4.7,
    reviewCount: 375,
    price: "$$",
    signatureDishes: [
      "Steamed Soup Dumplings (Xiao Long Bao)",
      "Szechuan Kung Pao Chicken",
      "Crispy Peking Duck",
    ],
    latOffset: -0.006,
    lngOffset: -0.002,
  },
  // Korean
  {
    id: "curated_seoul_fire",
    name: "Seoul Fire BBQ & Stone Bowl",
    cuisine: "Korean",
    rating: 4.8,
    reviewCount: 260,
    price: "$$",
    signatureDishes: [
      "Dolsot Bibimbap",
      "Soy-Garlic Korean Fried Chicken",
      "Galbi Short Ribs",
      "Kimchi Jjigae",
    ],
    latOffset: 0.001,
    lngOffset: -0.006,
  },
  // American
  {
    id: "curated_heritage_smokehouse",
    name: "Heritage Hearth & Grill",
    cuisine: "American",
    rating: 4.6,
    reviewCount: 420,
    price: "$$",
    signatureDishes: [
      "Smoked Angus Beef Brisket",
      "Double Smash Burger",
      "Truffle Mac & Cheese",
    ],
    latOffset: -0.001,
    lngOffset: 0.004,
  },
  // French
  {
    id: "curated_bistro_celeste",
    name: "Bistro Céleste",
    cuisine: "French",
    rating: 4.9,
    reviewCount: 175,
    price: "$$$",
    signatureDishes: [
      "Crisp Duck Confit",
      "Steak Frites with Béarnaise",
      "French Onion Soup Gratinée",
    ],
    latOffset: 0.003,
    lngOffset: 0.007,
  },
  // Vietnamese
  {
    id: "curated_pho_saigon",
    name: "Pho Saigon Heritage",
    cuisine: "Vietnamese",
    rating: 4.8,
    reviewCount: 330,
    price: "$",
    signatureDishes: [
      "24-Hour Beef Pho Bo",
      "Crisp Pork Belly Banh Mi",
      "Fresh Summer Shrimp Rolls",
    ],
    latOffset: -0.004,
    lngOffset: -0.005,
  },
  // Greek
  {
    id: "curated_delphi_meze",
    name: "Delphi Meze Tavern",
    cuisine: "Greek",
    rating: 4.7,
    reviewCount: 190,
    price: "$$",
    signatureDishes: [
      "Charcoal Grilled Souvlaki",
      "Baked Moussaka",
      "Spanakopita with Tzatziki",
    ],
    latOffset: 0.006,
    lngOffset: -0.001,
  },
];

/**
 * Returns suggested signature dishes for a given restaurant or cuisine.
 */
export function getSignatureDishes(
  restaurantName?: string,
  cuisine?: string,
): string[] {
  if (restaurantName) {
    const trimmed = restaurantName.toLowerCase();
    const curated = CURATED_RESTAURANTS.find(
      (r) =>
        trimmed.includes(r.name.toLowerCase()) ||
        r.name.toLowerCase().includes(trimmed),
    );
    if (curated && curated.signatureDishes.length > 0) {
      return curated.signatureDishes;
    }
  }

  const c = (cuisine ?? "").toLowerCase();
  for (const template of CURATED_RESTAURANTS) {
    if (c && template.cuisine.toLowerCase() === c) {
      return template.signatureDishes;
    }
  }

  return [
    "Chef's Signature Tasting",
    "Seasonal Market Bowl",
    "Hearth-Fired Flatbread",
    "House Daily Special",
  ];
}
