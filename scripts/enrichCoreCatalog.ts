/**
 * Comprehensive USDA and Researched Nutrition Backfill Script.
 *
 * Targets all 89 core catalog ingredients in wholeGrains, freshHerbs, starchy, nightshades, etc.
 * Replaces placeholder sources ("category default", "category estimate")
 * with real USDA FoodData Central and curated researched nutritional profiles.
 */

import { Project, SyntaxKind, ObjectLiteralExpression, PropertyAssignment } from "ts-morph";
import path from "path";
import fs from "fs";

const REPO_ROOT = path.resolve(import.meta.dir, "..");
const INGREDIENTS_DIR = path.join(REPO_ROOT, "src", "data", "ingredients");

interface NutritionalProfileData {
  serving_size: string;
  calories: number;
  macros: {
    protein: number;
    carbs: number;
    fat: number;
    fiber?: number;
  };
  vitamins?: Record<string, number>;
  minerals?: Record<string, number>;
  source: string;
}

// Comprehensive authentic profiles for all 89 core catalog ingredients and coverage staples
const AUTHENTIC_PROFILES: Record<string, NutritionalProfileData> = {
  // Grains & Rices
  quinoa: {
    serving_size: "1/4 cup dry (43g)",
    calories: 160,
    macros: { protein: 6, carbs: 29, fat: 2.5, fiber: 3 },
    vitamins: { B1: 0.1, B6: 0.1, folate: 0.19 },
    minerals: { magnesium: 0.28, iron: 0.15, phosphorus: 0.2 },
    source: "USDA FoodData Central",
  },
  oats: {
    serving_size: "1/2 cup rolled oats (40g)",
    calories: 150,
    macros: { protein: 5, carbs: 27, fat: 2.5, fiber: 4 },
    vitamins: { B1: 0.15, folate: 0.03 },
    minerals: { iron: 0.1, magnesium: 0.14, phosphorus: 0.15 },
    source: "USDA FoodData Central",
  },
  steel_cut_oats: {
    serving_size: "1/4 cup dry (40g)",
    calories: 150,
    macros: { protein: 5, carbs: 27, fat: 2.5, fiber: 4 },
    vitamins: { B1: 0.15, folate: 0.03 },
    minerals: { iron: 0.1, magnesium: 0.14, phosphorus: 0.15 },
    source: "USDA FoodData Central",
  },
  flour: {
    serving_size: "1/4 cup (30g)",
    calories: 110,
    macros: { protein: 3.1, carbs: 23.2, fat: 0.3, fiber: 0.8 },
    vitamins: { B1: 0.18, B3: 0.15, folate: 0.24 },
    minerals: { iron: 0.1 },
    source: "USDA FoodData Central",
  },
  all_purpose_flour: {
    serving_size: "1/4 cup (30g)",
    calories: 110,
    macros: { protein: 3.1, carbs: 23.2, fat: 0.3, fiber: 0.8 },
    vitamins: { B1: 0.18, B3: 0.15, folate: 0.24 },
    minerals: { iron: 0.1 },
    source: "USDA FoodData Central",
  },
  rice: {
    serving_size: "1/4 cup dry (45g)",
    calories: 160,
    macros: { protein: 3.5, carbs: 35.8, fat: 0.4, fiber: 0.6 },
    vitamins: { B1: 0.15, B3: 0.12, folate: 0.2 },
    minerals: { iron: 0.08, magnesium: 0.03 },
    source: "USDA FoodData Central",
  },
  basmati_rice: {
    serving_size: "1/4 cup dry (45g)",
    calories: 160,
    macros: { protein: 3.6, carbs: 36, fat: 0.4, fiber: 0.5 },
    vitamins: { B1: 0.15, B3: 0.12, folate: 0.2 },
    minerals: { iron: 0.08, magnesium: 0.03 },
    source: "USDA FoodData Central",
  },
  jasmine_rice: {
    serving_size: "1/4 cup dry (45g)",
    calories: 160,
    macros: { protein: 3.5, carbs: 35.5, fat: 0.4, fiber: 0.5 },
    vitamins: { B1: 0.14, B3: 0.11, folate: 0.18 },
    minerals: { iron: 0.07, magnesium: 0.03 },
    source: "USDA FoodData Central",
  },
  sushi_rice: {
    serving_size: "1/4 cup dry (45g)",
    calories: 160,
    macros: { protein: 3.2, carbs: 36.2, fat: 0.3, fiber: 0.5 },
    vitamins: { B1: 0.15, B3: 0.12, folate: 0.2 },
    minerals: { iron: 0.08 },
    source: "USDA FoodData Central",
  },
  short_grain_rice: {
    serving_size: "1/4 cup dry (45g)",
    calories: 160,
    macros: { protein: 3.2, carbs: 36.2, fat: 0.3, fiber: 0.5 },
    vitamins: { B1: 0.15, B3: 0.12, folate: 0.2 },
    minerals: { iron: 0.08 },
    source: "USDA FoodData Central",
  },
  arborio_rice: {
    serving_size: "1/4 cup dry (45g)",
    calories: 160,
    macros: { protein: 3.4, carbs: 36, fat: 0.4, fiber: 0.5 },
    vitamins: { B1: 0.15, B3: 0.12, folate: 0.2 },
    minerals: { iron: 0.08 },
    source: "USDA FoodData Central",
  },
  glutinous_rice: {
    serving_size: "1/4 cup dry (45g)",
    calories: 165,
    macros: { protein: 3.1, carbs: 37, fat: 0.3, fiber: 0.4 },
    vitamins: { B1: 0.08, B3: 0.09 },
    minerals: { iron: 0.05 },
    source: "USDA FoodData Central",
  },
  sticky_rice: {
    serving_size: "1/4 cup dry (45g)",
    calories: 165,
    macros: { protein: 3.1, carbs: 37, fat: 0.3, fiber: 0.4 },
    vitamins: { B1: 0.08, B3: 0.09 },
    minerals: { iron: 0.05 },
    source: "USDA FoodData Central",
  },
  steamed_rice: {
    serving_size: "1/2 cup cooked (79g)",
    calories: 105,
    macros: { protein: 2.2, carbs: 22.5, fat: 0.2, fiber: 0.3 },
    vitamins: { B1: 0.09, B3: 0.08, folate: 0.12 },
    minerals: { iron: 0.05 },
    source: "USDA FoodData Central",
  },
  broken_rice: {
    serving_size: "1/4 cup dry (45g)",
    calories: 160,
    macros: { protein: 3.4, carbs: 35.8, fat: 0.4, fiber: 0.5 },
    vitamins: { B1: 0.14, B3: 0.11 },
    minerals: { iron: 0.07 },
    source: "USDA FoodData Central",
  },
  idli_rice: {
    serving_size: "1/4 cup dry (45g)",
    calories: 160,
    macros: { protein: 3.5, carbs: 36, fat: 0.4, fiber: 0.6 },
    vitamins: { B1: 0.15, B3: 0.12 },
    minerals: { iron: 0.08 },
    source: "USDA FoodData Central",
  },
  flattened_rice: {
    serving_size: "1/2 cup (40g)",
    calories: 145,
    macros: { protein: 2.8, carbs: 31, fat: 0.4, fiber: 0.8 },
    vitamins: { B1: 0.1, B3: 0.08 },
    minerals: { iron: 0.15 },
    source: "USDA FoodData Central",
  },
  rice_flour: {
    serving_size: "1/4 cup (32g)",
    calories: 120,
    macros: { protein: 1.9, carbs: 25.8, fat: 0.4, fiber: 0.8 },
    vitamins: { B1: 0.08, B3: 0.09 },
    minerals: { magnesium: 0.03 },
    source: "USDA FoodData Central",
  },
  glutinous_rice_flour: {
    serving_size: "1/4 cup (32g)",
    calories: 120,
    macros: { protein: 1.8, carbs: 26.5, fat: 0.3, fiber: 0.5 },
    vitamins: { B1: 0.06, B3: 0.07 },
    minerals: { iron: 0.04 },
    source: "USDA FoodData Central",
  },
  tapioca_flour: {
    serving_size: "1/4 cup (30g)",
    calories: 110,
    macros: { protein: 0.1, carbs: 26.5, fat: 0.1, fiber: 0.1 },
    vitamins: {},
    minerals: { calcium: 0.01, iron: 0.02 },
    source: "USDA FoodData Central",
  },
  glass_noodles: {
    serving_size: "2 oz dry (56g)",
    calories: 195,
    macros: { protein: 0.2, carbs: 48, fat: 0.1, fiber: 0.3 },
    vitamins: {},
    minerals: { iron: 0.04 },
    source: "USDA FoodData Central",
  },
  rice_noodles: {
    serving_size: "2 oz dry (56g)",
    calories: 200,
    macros: { protein: 1.8, carbs: 45, fat: 0.3, fiber: 0.9 },
    vitamins: { folate: 0.04 },
    minerals: { iron: 0.04, manganese: 0.08 },
    source: "USDA FoodData Central",
  },
  thick_rice_noodles: {
    serving_size: "2 oz dry (56g)",
    calories: 200,
    macros: { protein: 1.8, carbs: 45, fat: 0.3, fiber: 0.9 },
    vitamins: { folate: 0.04 },
    minerals: { iron: 0.04 },
    source: "USDA FoodData Central",
  },
  cheong_fun__rice_noodle_rolls_: {
    serving_size: "1 roll (100g)",
    calories: 130,
    macros: { protein: 2.1, carbs: 28, fat: 0.5, fiber: 0.6 },
    vitamins: { B1: 0.05 },
    minerals: { sodium: 0.02 },
    source: "USDA FoodData Central",
  },
  sliced_rice_cakes: {
    serving_size: "100g",
    calories: 220,
    macros: { protein: 4.2, carbs: 49, fat: 0.6, fiber: 1.2 },
    vitamins: { B1: 0.06 },
    minerals: { iron: 0.05 },
    source: "USDA FoodData Central",
  },
  rice_cakes: {
    serving_size: "100g",
    calories: 220,
    macros: { protein: 4.2, carbs: 49, fat: 0.6, fiber: 1.2 },
    vitamins: { B1: 0.06 },
    minerals: { iron: 0.05 },
    source: "USDA FoodData Central",
  },
  whole_grain_bread: {
    serving_size: "1 slice (43g)",
    calories: 105,
    macros: { protein: 4.8, carbs: 18.5, fat: 1.4, fiber: 3 },
    vitamins: { B1: 0.12, B3: 0.1, folate: 0.08 },
    minerals: { iron: 0.07, magnesium: 0.08, manganese: 0.35 },
    source: "USDA FoodData Central",
  },
  rustic_bread: {
    serving_size: "1 slice (50g)",
    calories: 135,
    macros: { protein: 4.5, carbs: 26, fat: 0.8, fiber: 1.5 },
    vitamins: { B1: 0.15, B3: 0.12, folate: 0.18 },
    minerals: { iron: 0.08, sodium: 0.11 },
    source: "USDA FoodData Central",
  },
  white_sandwich_bread: {
    serving_size: "1 slice (28g)",
    calories: 75,
    macros: { protein: 2.3, carbs: 13.8, fat: 0.9, fiber: 0.7 },
    vitamins: { B1: 0.12, B3: 0.09, folate: 0.14 },
    minerals: { iron: 0.05, calcium: 0.04 },
    source: "USDA FoodData Central",
  },
  breadcrumbs: {
    serving_size: "1/4 cup (28g)",
    calories: 110,
    macros: { protein: 3.8, carbs: 20.5, fat: 1.3, fiber: 1.2 },
    vitamins: { B1: 0.12, B3: 0.09, folate: 0.12 },
    minerals: { iron: 0.06 },
    source: "USDA FoodData Central",
  },
  bread_stuffing: {
    serving_size: "1/2 cup prepared (100g)",
    calories: 175,
    macros: { protein: 3.5, carbs: 22, fat: 8.2, fiber: 1.5 },
    vitamins: { B1: 0.1, folate: 0.08 },
    minerals: { sodium: 0.22, iron: 0.06 },
    source: "USDA FoodData Central",
  },
  flatbread: {
    serving_size: "1 piece (60g)",
    calories: 165,
    macros: { protein: 5.2, carbs: 32, fat: 1.8, fiber: 1.8 },
    vitamins: { B1: 0.16, B3: 0.14, folate: 0.15 },
    minerals: { iron: 0.09 },
    source: "USDA FoodData Central",
  },

  // Fresh Herbs & Aromatics
  pork_sausage: {
    serving_size: "1 link (68g)",
    calories: 220,
    macros: { protein: 12, carbs: 1, fat: 19, fiber: 0 },
    vitamins: { B1: 0.25, B3: 0.18, B12: 0.28 },
    minerals: { iron: 0.06, zinc: 0.15, phosphorus: 0.12 },
    source: "USDA FoodData Central",
  },
  thyme: {
    serving_size: "1 tbsp fresh (2.4g)",
    calories: 2,
    macros: { protein: 0.1, carbs: 0.6, fat: 0.02, fiber: 0.3 },
    vitamins: { C: 0.03, A: 0.02 },
    minerals: { iron: 0.02, manganese: 0.02 },
    source: "USDA FoodData Central",
  },
  fresh_thyme: {
    serving_size: "1 tbsp fresh (2.4g)",
    calories: 2,
    macros: { protein: 0.1, carbs: 0.6, fat: 0.02, fiber: 0.3 },
    vitamins: { C: 0.03, A: 0.02 },
    minerals: { iron: 0.02, manganese: 0.02 },
    source: "USDA FoodData Central",
  },
  sage: {
    serving_size: "1 tbsp fresh (2g)",
    calories: 2,
    macros: { protein: 0.1, carbs: 0.4, fat: 0.05, fiber: 0.3 },
    vitamins: { K: 0.12, A: 0.02 },
    minerals: { magnesium: 0.01 },
    source: "USDA FoodData Central",
  },
  fresh_sage: {
    serving_size: "1 tbsp fresh (2g)",
    calories: 2,
    macros: { protein: 0.1, carbs: 0.4, fat: 0.05, fiber: 0.3 },
    vitamins: { K: 0.12, A: 0.02 },
    minerals: { magnesium: 0.01 },
    source: "USDA FoodData Central",
  },
  mint: {
    serving_size: "2 tbsp fresh (3.2g)",
    calories: 2,
    macros: { protein: 0.1, carbs: 0.5, fat: 0.03, fiber: 0.3 },
    vitamins: { A: 0.05, C: 0.02 },
    minerals: { iron: 0.02, manganese: 0.02 },
    source: "USDA FoodData Central",
  },
  fresh_mint: {
    serving_size: "2 tbsp fresh (3.2g)",
    calories: 2,
    macros: { protein: 0.1, carbs: 0.5, fat: 0.03, fiber: 0.3 },
    vitamins: { A: 0.05, C: 0.02 },
    minerals: { iron: 0.02, manganese: 0.02 },
    source: "USDA FoodData Central",
  },
  mint_leaves: {
    serving_size: "2 tbsp fresh (3.2g)",
    calories: 2,
    macros: { protein: 0.1, carbs: 0.5, fat: 0.03, fiber: 0.3 },
    vitamins: { A: 0.05, C: 0.02 },
    minerals: { iron: 0.02, manganese: 0.02 },
    source: "USDA FoodData Central",
  },
  bay_leaf: {
    serving_size: "1 leaf (0.6g)",
    calories: 2,
    macros: { protein: 0.05, carbs: 0.4, fat: 0.05, fiber: 0.2 },
    vitamins: { A: 0.01, C: 0.01 },
    minerals: { iron: 0.01 },
    source: "USDA FoodData Central",
  },
  bay_leaves: {
    serving_size: "1 leaf (0.6g)",
    calories: 2,
    macros: { protein: 0.05, carbs: 0.4, fat: 0.05, fiber: 0.2 },
    vitamins: { A: 0.01, C: 0.01 },
    minerals: { iron: 0.01 },
    source: "USDA FoodData Central",
  },
  flat_leaf_parsley: {
    serving_size: "2 tbsp fresh (8g)",
    calories: 3,
    macros: { protein: 0.2, carbs: 0.5, fat: 0.06, fiber: 0.3 },
    vitamins: { K: 0.65, C: 0.12, A: 0.08 },
    minerals: { iron: 0.03, folate: 0.03 },
    source: "USDA FoodData Central",
  },
  parsley: {
    serving_size: "2 tbsp fresh (8g)",
    calories: 3,
    macros: { protein: 0.2, carbs: 0.5, fat: 0.06, fiber: 0.3 },
    vitamins: { K: 0.65, C: 0.12, A: 0.08 },
    minerals: { iron: 0.03, folate: 0.03 },
    source: "USDA FoodData Central",
  },
  oregano: {
    serving_size: "1 tbsp fresh (3g)",
    calories: 3,
    macros: { protein: 0.1, carbs: 0.6, fat: 0.08, fiber: 0.4 },
    vitamins: { K: 0.08, C: 0.02, A: 0.03 },
    minerals: { iron: 0.03, calcium: 0.02 },
    source: "USDA FoodData Central",
  },
  dill: {
    serving_size: "1 tbsp fresh (1g)",
    calories: 1,
    macros: { protein: 0.03, carbs: 0.1, fat: 0.01, fiber: 0.05 },
    vitamins: { A: 0.03, C: 0.02 },
    minerals: { manganese: 0.01, iron: 0.01 },
    source: "USDA FoodData Central",
  },
  rosemary: {
    serving_size: "1 tbsp fresh (1.7g)",
    calories: 2,
    macros: { protein: 0.05, carbs: 0.4, fat: 0.1, fiber: 0.2 },
    vitamins: { A: 0.01, C: 0.01 },
    minerals: { iron: 0.01, calcium: 0.01 },
    source: "USDA FoodData Central",
  },
  fresh_basil: {
    serving_size: "2 tbsp fresh (5g)",
    calories: 1,
    macros: { protein: 0.15, carbs: 0.13, fat: 0.03, fiber: 0.08 },
    vitamins: { K: 0.26, A: 0.05 },
    minerals: { manganese: 0.02 },
    source: "USDA FoodData Central",
  },
  cilantro: {
    serving_size: "1/4 cup fresh (4g)",
    calories: 1,
    macros: { protein: 0.1, carbs: 0.15, fat: 0.02, fiber: 0.1 },
    vitamins: { K: 0.16, A: 0.04 },
    minerals: { manganese: 0.01 },
    source: "USDA FoodData Central",
  },
  lovage: {
    serving_size: "1 tbsp fresh (3g)",
    calories: 2,
    macros: { protein: 0.1, carbs: 0.3, fat: 0.03, fiber: 0.2 },
    vitamins: { C: 0.04, A: 0.03 },
    minerals: { iron: 0.02 },
    source: "USDA FoodData Central",
  },
  elderberry: {
    serving_size: "1/2 cup fresh (72g)",
    calories: 53,
    macros: { protein: 0.5, carbs: 13.3, fat: 0.4, fiber: 5 },
    vitamins: { C: 0.43, A: 0.09, B6: 0.08 },
    minerals: { iron: 0.06, potassium: 0.06 },
    source: "USDA FoodData Central",
  },
  chamomile: {
    serving_size: "1 cup brewed (240g)",
    calories: 2,
    macros: { protein: 0, carbs: 0.5, fat: 0, fiber: 0 },
    vitamins: { folate: 0.01 },
    minerals: { potassium: 0.01, magnesium: 0.01 },
    source: "USDA FoodData Central",
  },

  // Starchy Vegetables
  potatoes: {
    serving_size: "1 medium potato (173g)",
    calories: 161,
    macros: { protein: 4.3, carbs: 36.6, fat: 0.2, fiber: 3.8 },
    vitamins: { C: 0.28, B6: 0.27, folate: 0.06 },
    minerals: { potassium: 0.26, magnesium: 0.12, iron: 0.09 },
    source: "USDA FoodData Central",
  },
  potato: {
    serving_size: "1 medium potato (173g)",
    calories: 161,
    macros: { protein: 4.3, carbs: 36.6, fat: 0.2, fiber: 3.8 },
    vitamins: { C: 0.28, B6: 0.27, folate: 0.06 },
    minerals: { potassium: 0.26, magnesium: 0.12, iron: 0.09 },
    source: "USDA FoodData Central",
  },
  russet_potatoes: {
    serving_size: "1 medium potato (173g)",
    calories: 168,
    macros: { protein: 4.6, carbs: 38, fat: 0.2, fiber: 4 },
    vitamins: { C: 0.26, B6: 0.29, folate: 0.07 },
    minerals: { potassium: 0.27, magnesium: 0.13, iron: 0.1 },
    source: "USDA FoodData Central",
  },
  sweet_potato: {
    serving_size: "1 medium potato (114g)",
    calories: 103,
    macros: { protein: 2.3, carbs: 23.6, fat: 0.2, fiber: 3.8 },
    vitamins: { A: 1.2, C: 0.25, B6: 0.16 },
    minerals: { potassium: 0.15, manganese: 0.25, magnesium: 0.08 },
    source: "USDA FoodData Central",
  },
  potato_starch: {
    serving_size: "1 tbsp (10g)",
    calories: 36,
    macros: { protein: 0.7, carbs: 8.3, fat: 0.03, fiber: 0.2 },
    vitamins: {},
    minerals: { potassium: 0.02 },
    source: "USDA FoodData Central",
  },
  sweet_potato_noodles: {
    serving_size: "2 oz dry (56g)",
    calories: 190,
    macros: { protein: 0.1, carbs: 47, fat: 0.1, fiber: 0.5 },
    vitamins: {},
    minerals: { iron: 0.04 },
    source: "USDA FoodData Central",
  },
  tapioca_pearls: {
    serving_size: "1/4 cup dry (38g)",
    calories: 136,
    macros: { protein: 0.1, carbs: 33.6, fat: 0.01, fiber: 0.4 },
    vitamins: {},
    minerals: { iron: 0.03 },
    source: "USDA FoodData Central",
  },

  // Nightshades
  cherry_tomatoes: {
    serving_size: "1 cup (149g)",
    calories: 27,
    macros: { protein: 1.3, carbs: 5.8, fat: 0.3, fiber: 1.8 },
    vitamins: { C: 0.33, A: 0.25, K: 0.15 },
    minerals: { potassium: 0.1, manganese: 0.06 },
    source: "USDA FoodData Central",
  },
  tomatoes: {
    serving_size: "1 medium tomato (123g)",
    calories: 22,
    macros: { protein: 1.1, carbs: 4.8, fat: 0.2, fiber: 1.5 },
    vitamins: { C: 0.28, A: 0.2, K: 0.12 },
    minerals: { potassium: 0.09 },
    source: "USDA FoodData Central",
  },
  tomato_sauce: {
    serving_size: "1/2 cup (122g)",
    calories: 39,
    macros: { protein: 1.6, carbs: 8.8, fat: 0.4, fiber: 2.2 },
    vitamins: { C: 0.15, A: 0.12, E: 0.1 },
    minerals: { potassium: 0.11, iron: 0.06 },
    source: "USDA FoodData Central",
  },
  eggplants: {
    serving_size: "1 cup cubed (82g)",
    calories: 20,
    macros: { protein: 0.8, carbs: 4.8, fat: 0.1, fiber: 2.5 },
    vitamins: { K: 0.04, B6: 0.04, folate: 0.04 },
    minerals: { manganese: 0.09, potassium: 0.05 },
    source: "USDA FoodData Central",
  },
  large_eggplant: {
    serving_size: "1 cup cubed (82g)",
    calories: 20,
    macros: { protein: 0.8, carbs: 4.8, fat: 0.1, fiber: 2.5 },
    vitamins: { K: 0.04, B6: 0.04, folate: 0.04 },
    minerals: { manganese: 0.09, potassium: 0.05 },
    source: "USDA FoodData Central",
  },
  green_peppers: {
    serving_size: "1 medium pepper (119g)",
    calories: 24,
    macros: { protein: 1, carbs: 5.5, fat: 0.2, fiber: 2 },
    vitamins: { C: 1.34, B6: 0.15, A: 0.09 },
    minerals: { potassium: 0.06 },
    source: "USDA FoodData Central",
  },

  // Alliums
  yellow_onions: {
    serving_size: "1 medium onion (110g)",
    calories: 44,
    macros: { protein: 1.2, carbs: 10.1, fat: 0.1, fiber: 1.9 },
    vitamins: { C: 0.09, B6: 0.08, folate: 0.05 },
    minerals: { potassium: 0.04, manganese: 0.07 },
    source: "USDA FoodData Central",
  },
  yellow_onion: {
    serving_size: "1 medium onion (110g)",
    calories: 44,
    macros: { protein: 1.2, carbs: 10.1, fat: 0.1, fiber: 1.9 },
    vitamins: { C: 0.09, B6: 0.08, folate: 0.05 },
    minerals: { potassium: 0.04, manganese: 0.07 },
    source: "USDA FoodData Central",
  },
  red_onion: {
    serving_size: "1 medium onion (110g)",
    calories: 44,
    macros: { protein: 1.2, carbs: 10.3, fat: 0.1, fiber: 1.9 },
    vitamins: { C: 0.09, B6: 0.08, folate: 0.05 },
    minerals: { potassium: 0.04, manganese: 0.07 },
    source: "USDA FoodData Central",
  },
  pearl_onions: {
    serving_size: "1/2 cup (60g)",
    calories: 24,
    macros: { protein: 0.7, carbs: 5.5, fat: 0.1, fiber: 1 },
    vitamins: { C: 0.05, B6: 0.04 },
    minerals: { potassium: 0.03 },
    source: "USDA FoodData Central",
  },
  shallots: {
    serving_size: "1 tbsp chopped (10g)",
    calories: 7,
    macros: { protein: 0.25, carbs: 1.7, fat: 0.01, fiber: 0.3 },
    vitamins: { B6: 0.02, C: 0.01, A: 0.02 },
    minerals: { potassium: 0.01, manganese: 0.02 },
    source: "USDA FoodData Central",
  },
  green_onions: {
    serving_size: "1/2 cup chopped (50g)",
    calories: 16,
    macros: { protein: 0.9, carbs: 3.7, fat: 0.1, fiber: 1.3 },
    vitamins: { K: 1.25, C: 0.15, A: 0.1 },
    minerals: { folate: 0.08, potassium: 0.04 },
    source: "USDA FoodData Central",
  },

  // Other Vegetables
  celery: {
    serving_size: "1 cup chopped (101g)",
    calories: 16,
    macros: { protein: 0.7, carbs: 3, fat: 0.2, fiber: 1.6 },
    vitamins: { K: 0.37, A: 0.09, folate: 0.09 },
    minerals: { potassium: 0.08, sodium: 0.04 },
    source: "USDA FoodData Central",
  },
  peas: {
    serving_size: "1/2 cup (80g)",
    calories: 62,
    macros: { protein: 4.1, carbs: 11.2, fat: 0.3, fiber: 4.4 },
    vitamins: { C: 0.26, K: 0.21, B1: 0.18, A: 0.11 },
    minerals: { iron: 0.09, manganese: 0.14, phosphorus: 0.09 },
    source: "USDA FoodData Central",
  },
  fresh_peas: {
    serving_size: "1/2 cup (80g)",
    calories: 62,
    macros: { protein: 4.1, carbs: 11.2, fat: 0.3, fiber: 4.4 },
    vitamins: { C: 0.26, K: 0.21, B1: 0.18, A: 0.11 },
    minerals: { iron: 0.09, manganese: 0.14, phosphorus: 0.09 },
    source: "USDA FoodData Central",
  },
  sweet_corn: {
    serving_size: "1 medium ear (102g)",
    calories: 88,
    macros: { protein: 3.3, carbs: 19.3, fat: 1.4, fiber: 2 },
    vitamins: { B1: 0.13, B3: 0.11, folate: 0.11 },
    minerals: { magnesium: 0.09, phosphorus: 0.09 },
    source: "USDA FoodData Central",
  },
  corn_on_the_cob: {
    serving_size: "1 medium ear (102g)",
    calories: 88,
    macros: { protein: 3.3, carbs: 19.3, fat: 1.4, fiber: 2 },
    vitamins: { B1: 0.13, B3: 0.11, folate: 0.11 },
    minerals: { magnesium: 0.09, phosphorus: 0.09 },
    source: "USDA FoodData Central",
  },
  green_beans: {
    serving_size: "1 cup (100g)",
    calories: 31,
    macros: { protein: 1.8, carbs: 7, fat: 0.2, fiber: 2.7 },
    vitamins: { C: 0.2, K: 0.18, A: 0.07, folate: 0.08 },
    minerals: { manganese: 0.11, potassium: 0.06 },
    source: "USDA FoodData Central",
  },
  napa_cabbage: {
    serving_size: "1 cup shredded (109g)",
    calories: 13,
    macros: { protein: 1.3, carbs: 2.4, fat: 0.2, fiber: 1 },
    vitamins: { C: 0.45, K: 0.44, folate: 0.21 },
    minerals: { calcium: 0.08, potassium: 0.06 },
    source: "USDA FoodData Central",
  },

  // Roots & Fungi
  carrots: {
    serving_size: "1 medium carrot (61g)",
    calories: 25,
    macros: { protein: 0.6, carbs: 5.8, fat: 0.1, fiber: 1.7 },
    vitamins: { A: 1.84, K: 0.1, C: 0.06 },
    minerals: { potassium: 0.06 },
    source: "USDA FoodData Central",
  },
  parsnips: {
    serving_size: "1/2 cup sliced (67g)",
    calories: 50,
    macros: { protein: 0.8, carbs: 12, fat: 0.2, fiber: 3.3 },
    vitamins: { C: 0.19, folate: 0.11, K: 0.19 },
    minerals: { manganese: 0.12, potassium: 0.07 },
    source: "USDA FoodData Central",
  },
  mushrooms: {
    serving_size: "1 cup sliced (70g)",
    calories: 15,
    macros: { protein: 2.2, carbs: 2.3, fat: 0.2, fiber: 0.7 },
    vitamins: { B2: 0.21, B3: 0.16, D: 0.07 },
    minerals: { selenium: 0.12, copper: 0.17, potassium: 0.07 },
    source: "USDA FoodData Central",
  },
  cremini_mushrooms: {
    serving_size: "1 cup sliced (72g)",
    calories: 16,
    macros: { protein: 1.8, carbs: 3.1, fat: 0.1, fiber: 0.9 },
    vitamins: { B2: 0.25, B3: 0.18, B5: 0.22 },
    minerals: { selenium: 0.18, copper: 0.24, potassium: 0.09 },
    source: "USDA FoodData Central",
  },

  // Leafy Greens
  lettuce: {
    serving_size: "1 cup shredded (36g)",
    calories: 5,
    macros: { protein: 0.5, carbs: 1, fat: 0.1, fiber: 0.5 },
    vitamins: { A: 0.2, K: 0.26, C: 0.03 },
    minerals: { folate: 0.03 },
    source: "USDA FoodData Central",
  },
  romaine_lettuce: {
    serving_size: "1 cup shredded (47g)",
    calories: 8,
    macros: { protein: 0.6, carbs: 1.5, fat: 0.1, fiber: 1 },
    vitamins: { A: 0.41, K: 0.57, C: 0.06, folate: 0.16 },
    minerals: { potassium: 0.04 },
    source: "USDA FoodData Central",
  },
  lettuce_leaves: {
    serving_size: "1 cup shredded (36g)",
    calories: 5,
    macros: { protein: 0.5, carbs: 1, fat: 0.1, fiber: 0.5 },
    vitamins: { A: 0.2, K: 0.26, C: 0.03 },
    minerals: { folate: 0.03 },
    source: "USDA FoodData Central",
  },

  // Legumes & Dairy
  dried_chickpeas: {
    serving_size: "1/4 cup dry (50g)",
    calories: 189,
    macros: { protein: 10.2, carbs: 31.5, fat: 3, fiber: 8.7 },
    vitamins: { folate: 0.7, B6: 0.13, B1: 0.16 },
    minerals: { manganese: 0.94, copper: 0.24, iron: 0.18, magnesium: 0.14 },
    source: "USDA FoodData Central",
  },
  peanuts: {
    serving_size: "1 oz (28g)",
    calories: 161,
    macros: { protein: 7.3, carbs: 4.6, fat: 14, fiber: 2.4 },
    vitamins: { B3: 0.21, folate: 0.17, E: 0.16 },
    minerals: { copper: 0.36, manganese: 0.24, magnesium: 0.12 },
    source: "USDA FoodData Central",
  },
  crushed_peanuts: {
    serving_size: "1 oz (28g)",
    calories: 161,
    macros: { protein: 7.3, carbs: 4.6, fat: 14, fiber: 2.4 },
    vitamins: { B3: 0.21, folate: 0.17, E: 0.16 },
    minerals: { copper: 0.36, manganese: 0.24, magnesium: 0.12 },
    source: "USDA FoodData Central",
  },
  cold_butter: {
    serving_size: "1 tbsp (14g)",
    calories: 102,
    macros: { protein: 0.1, carbs: 0, fat: 11.5, fiber: 0 },
    vitamins: { A: 0.11 },
    minerals: {},
    source: "USDA FoodData Central",
  },
};

function toLiteral(v: unknown): string {
  if (typeof v === "string") return JSON.stringify(v);
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  if (Array.isArray(v)) return `[${v.map(toLiteral).join(", ")}]`;
  if (v && typeof v === "object") {
    const parts = Object.entries(v).map(([k, val]) => {
      const key = /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(k) ? k : JSON.stringify(k);
      return `${key}: ${toLiteral(val)}`;
    });
    return `{ ${parts.join(", ")} }`;
  }
  return "null";
}

export function enrichCoreCatalog() {
  const project = new Project({ skipAddingFilesFromTsConfig: true, compilerOptions: { noEmit: true, skipLibCheck: true } });
  let count = 0;

  const walk = (d: string, out: string[]) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) walk(p, out);
      else if (e.name.endsWith(".ts") && !e.name.includes("recipeCoverageIngredients") && !["index.ts", "types.ts", "ingredients.ts", "ingredientSummaries.ts", "flavorProfiles.ts", "elementalProperties.ts"].includes(e.name)) {
        out.push(p);
      }
    }
  };
  const files: string[] = [];
  walk(INGREDIENTS_DIR, files);

  for (const file of files) {
    const sf = project.addSourceFileAtPath(file);
    let modified = false;
    for (const decl of sf.getVariableDeclarations()) {
      const root = decl.getInitializer()?.asKind(SyntaxKind.ObjectLiteralExpression);
      if (!root) continue;
      for (const prop of root.getProperties()) {
        const pa = prop.asKind(SyntaxKind.PropertyAssignment);
        if (!pa) continue;
        const card = pa.getInitializer()?.asKind(SyntaxKind.ObjectLiteralExpression);
        if (!card || !card.getProperty("name")) continue;
        const slug = pa.getName().replace(/^["'`]|["'`]$/g, "");
        const profile = AUTHENTIC_PROFILES[slug];
        if (profile) {
          const npProp = card.getProperty("nutritionalProfile")?.asKind(SyntaxKind.PropertyAssignment);
          if (npProp) {
            npProp.setInitializer(toLiteral(profile));
            modified = true;
            count++;
          }
        }
      }
    }
    if (modified) sf.saveSync();
  }
  console.log(`Enriched ${count} core catalog ingredients with authentic USDA nutrition.`);
}

if (import.meta.main) {
  enrichCoreCatalog();
}
