// src/utils/instacart/ingredientNormalizer.ts

export type IngredientCategory =
  | 'produce'
  | 'meat_seafood'
  | 'dairy_eggs'
  | 'pantry'
  | 'grains'
  | 'herbs_spices'
  | 'oils_condiments'
  | 'beverages'
  | 'other'

export interface NormalizedIngredient {
  name: string // clean searchable name for Instacart
  display_text: string // human-readable with quantity
  quantity?: string // IDP-supported quantity as string
  unit?: string // IDP-supported unit
  category: IngredientCategory
  usedInRecipes?: string[] // Track which recipes use this
}

// ============================================================
// QUANTITY CAP TABLE
// Max realistic quantities per unit for a weekly shop (4 people)
// Anything above these caps gets clamped
// ============================================================
const QUANTITY_CAPS: Record<string, number> = {
  clove: 12, // max 12 cloves garlic (1 head) — not 87
  bunch: 2, // max 2 bunches of any herb
  cup: 8, // max 8 cups of any dry ingredient
  lb: 5, // max 5 lbs of any single protein
  oz: 32, // max 32 oz = 2 lbs
  tsp: 4, // max 4 tsp of spice
  tbsp: 6, // max 6 tbsp of oil/sauce
  gallon: 1, // max 1 gallon of any liquid
  piece: 6, // max 6 pieces of whole vegetables
  each: 6,
  head: 2,
  bulb: 2,
}

// Special item caps by canonical name
export const WEEKLY_CAPS_FOR_4_PEOPLE: Record<string, { max: number, unit: string, displayUnit: string }> = {
  // Aromatics — used in every dish but you only need so much
  garlic: { max: 2, unit: 'head', displayUnit: 'heads' },
  onion: { max: 4, unit: 'each', displayUnit: 'onions' },
  ginger: { max: 1, unit: 'piece', displayUnit: 'piece' },
  
  // Fresh herbs — 1 bunch per herb type, max
  'fresh herbs': { max: 1, unit: 'bunch', displayUnit: 'bunch' },
  parsley: { max: 1, unit: 'bunch', displayUnit: 'bunch' },
  cilantro: { max: 1, unit: 'bunch', displayUnit: 'bunch' },
  thyme: { max: 1, unit: 'bunch', displayUnit: 'bunch' },
  basil: { max: 1, unit: 'bunch', displayUnit: 'bunch' },
  mint: { max: 1, unit: 'bunch', displayUnit: 'bunch' },
  
  // Oils — you have these, buy 1 if needed
  oil: { max: 1, unit: 'bottle', displayUnit: 'bottle' },
  'olive oil': { max: 1, unit: 'bottle', displayUnit: 'bottle' },
  'vegetable oil': { max: 1, unit: 'bottle', displayUnit: 'bottle' },
  'peanut oil': { max: 1, unit: 'bottle', displayUnit: 'bottle' },
  'sesame oil': { max: 1, unit: 'bottle', displayUnit: 'bottle' },
  
  // Grains — realistic weekly amount
  quinoa: { max: 2, unit: 'cup', displayUnit: 'cups' },
  rice: { max: 3, unit: 'cup', displayUnit: 'cups' },
  couscous: { max: 2, unit: 'cup', displayUnit: 'cups' },
}

// Category detection
function detectCategory(name: string): IngredientCategory {
  const n = name.toLowerCase();
  if (/beef|chicken|lamb|fish|shrimp|goat|pork|salmon|tuna|scallop|turkey/i.test(n)) return 'meat_seafood';
  if (/milk|egg|butter|cream|cheese|yogurt/i.test(n)) return 'dairy_eggs';
  if (/rice|quinoa|couscous|bread|flour|pasta|noodle|oat|cornmeal|tortilla/i.test(n)) return 'grains';
  if (/oil|vinegar|soy sauce|paste|ketchup|mustard|mayo|salsa/i.test(n)) return 'oils_condiments';
  if (/can|canned|broth|stock|bean|lentil|chickpea|sauce/i.test(n)) return 'pantry';
  if (/water|juice|soda|tea|coffee|wine|beer/i.test(n)) return 'beverages';
  if (/herb|spice|salt|pepper|cumin|coriander|paprika|chili|cayenne|turmeric|ginger|cinnamon|nutmeg|clove|cardamom|fennel|saffron|vanilla|bay leaf|oregano|basil|thyme|rosemary|sage|dill|parsley|cilantro|mint/i.test(n)) {
    // If it's a bunch of fresh herbs, it's produce. Otherwise herbs/spices
    if (/fresh|bunch/.test(n) && !/dried/i.test(n)) return 'produce';
    return 'herbs_spices';
  }
  // Produce as fallback for common veg/fruit
  if (/tomato|onion|garlic|lettuce|carrot|celery|potato|spinach|kale|cabbage|broccoli|cucumber|squash|mushroom|avocado|lemon|lime|orange|apple|banana|berry|mango/i.test(n)) return 'produce';
  return 'other';
}

function parseQuantityUnitName(raw: string): { quantity: number, unit: string, name: string } {
  // e.g. "1.5 lbs chicken breast", "2 apples", "1/2 cup sugar"
  const match = raw.trim().match(/^([\d./]+)\s+([A-Za-z]+)\s+(.+)$/);
  
  if (match) {
    const [, qtyRaw, rawUnit, name] = match;
    let quantity = parseFloat(qtyRaw);
    if (qtyRaw.includes('/')) {
      const [num, den] = qtyRaw.split('/');
      if (num && den && !isNaN(Number(num)) && !isNaN(Number(den))) {
        quantity = Number(num) / Number(den);
      }
    }
    if (isNaN(quantity)) quantity = 1;
    
    // Normalize unit a bit
    let unit = rawUnit.toLowerCase();
    if (unit === 'lbs') unit = 'lb';
    if (unit === 'ozs') unit = 'oz';
    if (unit === 'tbsp' || unit === 'tablespoon' || unit === 'tablespoons') unit = 'tbsp';
    if (unit === 'tsp' || unit === 'teaspoon' || unit === 'teaspoons') unit = 'tsp';
    if (unit === 'cups') unit = 'cup';
    if (unit === 'bunches') unit = 'bunch';
    if (unit === 'cloves') unit = 'clove';
    if (unit === 'gallons') unit = 'gallon';
    if (unit === 'heads') unit = 'head';
    if (unit === 'bulbs') unit = 'bulb';
    if (unit === 'pieces') unit = 'piece';

    return { quantity, unit, name: name.trim() };
  }

  // Fallback: Check if it starts with just a number
  const numMatch = raw.trim().match(/^([\d./]+)\s+(.+)$/);
  if (numMatch) {
    const [, qtyRaw, name] = numMatch;
    let quantity = parseFloat(qtyRaw);
    if (qtyRaw.includes('/')) {
      const [num, den] = qtyRaw.split('/');
      if (num && den && !isNaN(Number(num)) && !isNaN(Number(den))) {
        quantity = Number(num) / Number(den);
      }
    }
    if (isNaN(quantity)) quantity = 1;
    return { quantity, unit: 'each', name: name.trim() };
  }

  return { quantity: 1, unit: 'each', name: raw.trim() };
}

export function normalizeIngredient(raw: string): NormalizedIngredient {
  let text = raw.trim();

  // 1. Strip "or" alternatives → take first option
  if (text.includes(' or ')) {
    text = text.split(' or ')[0].trim();
  }

  // 2. Remove filler quality descriptors
  const fillers = ['extreme', 'highquality', 'high-quality', 'very', 'best quality', 'fresh or dried', 'fresh', 'dried'];
  fillers.forEach(f => {
    const regex = new RegExp(`\\b${f}\\b`, 'gi');
    text = text.replace(regex, '').replace(/\s+/g, ' ').trim();
  });

  // 3. Parse quantity and unit
  let { quantity, unit, name } = parseQuantityUnitName(text);

  // 4. Normalize unit to IDP-supported unit / consolidate
  if (unit === 'gallon' && !name.toLowerCase().includes('milk') && !name.toLowerCase().includes('water')) {
    quantity = quantity * 16;
    unit = 'cup';
  }

  // 5. Apply quantity cap based on general units
  if (QUANTITY_CAPS[unit] !== undefined) {
    if (quantity > QUANTITY_CAPS[unit]) {
      quantity = QUANTITY_CAPS[unit];
    }
  }

  // 6. Apply special cases (garlic, herbs, whole items)
  if (name.toLowerCase().includes('garlic') && unit === 'clove') {
    if (quantity > 8) {
      quantity = 1;
      unit = 'head';
    } else if (quantity > 3) {
      quantity = 1;
      unit = 'bulb';
    }
  }

  // 7. Round .0 decimals to integers
  quantity = Math.ceil(quantity);

  // Clean up name further for display
  name = name.trim();

  // 8. Detect category
  const category = detectCategory(name);

  // 9. Build display_text
  let display_text = `${quantity} ${unit} ${name}`;
  if (unit === 'each' || unit === 'piece' || unit === '') {
    display_text = `${quantity} ${name}`;
  }

  return {
    name,
    display_text,
    quantity: String(quantity),
    unit,
    category
  };
}

// Canonical name mapper for deduplication
function getCanonicalName(name: string): string {
  let n = name.toLowerCase();
  // Remove descriptors like "large", "small", "medium", "yellow", "red", "green", "lean", "ground"
  const adjectives = ['large', 'small', 'medium', 'yellow', 'red', 'green', 'lean', 'ground', 'boneless', 'skinless', 'fresh', 'dried', 'chopped', 'diced', 'minced', 'sliced'];
  adjectives.forEach(adj => {
    const regex = new RegExp(`\\b${adj}\\b`, 'gi');
    n = n.replace(regex, '').replace(/\s+/g, ' ').trim();
  });
  
  if (n.includes('onion')) return 'onion';
  if (n.includes('garlic')) return 'garlic';
  if (n.includes('chicken breast')) return 'chicken breast';
  if (n.includes('beef')) return 'beef';
  if (n.includes('shrimp')) return 'shrimp';
  if (n.includes('herb')) return 'fresh herbs';
  
  return n;
}

export function deduplicateIngredients(
  items: NormalizedIngredient[]
): NormalizedIngredient[] {
  const groups = new Map<string, {
    canonicalName: string;
    originalNames: string[];
    totalQuantity: number;
    unit: string;
    category: IngredientCategory;
    recipes: Set<string>;
    itemRefs: NormalizedIngredient[];
  }>();

  items.forEach(item => {
    const canonicalName = getCanonicalName(item.name);
    
    // Grouping logic: group by canonical name and unit category (e.g. weight vs volume vs count)
    // To keep it simple, just group by canonicalName and unit.
    const key = `${canonicalName}-${item.unit}`;
    
    if (!groups.has(key)) {
      groups.set(key, {
        canonicalName,
        originalNames: [item.name],
        totalQuantity: Number(item.quantity || 1),
        unit: item.unit || 'each',
        category: item.category,
        recipes: new Set(item.usedInRecipes || []),
        itemRefs: [item]
      });
    } else {
      const g = groups.get(key)!;
      g.originalNames.push(item.name);
      g.totalQuantity += Number(item.quantity || 1);
      if (item.usedInRecipes) {
        item.usedInRecipes.forEach(r => g.recipes.add(r));
      }
      g.itemRefs.push(item);
    }
  });

  const deduplicated: NormalizedIngredient[] = [];

  for (const [, group] of groups.entries()) {
    let finalQty = group.totalQuantity;
    let finalUnit = group.unit;
    let finalName = group.originalNames[0]; // pick first original name as base

    // Special protein deduplication
    // If it's a protein, we don't sum all quantities if it's across multiple meals
    // We treat each meal's protein separately or show "for X meals"
    if (group.category === 'meat_seafood') {
      const mealCount = group.recipes.size || 1;
      if (mealCount > 1) {
        // e.g. "chicken breast (for 3 meals, ~1 lb each)"
        // We override the display text and set quantity to mealCount if they are buying 'packs'
        finalQty = mealCount; // roughly 1 pack per meal
        finalUnit = 'pack';
        finalName = `${group.canonicalName} (for ${mealCount} meals)`;
      }
    }

    // Apply strict caps after merging
    const capInfo = WEEKLY_CAPS_FOR_4_PEOPLE[group.canonicalName];
    if (capInfo) {
      if (finalQty > capInfo.max) {
        finalQty = capInfo.max;
        finalUnit = capInfo.unit;
      } else {
        // Convert to display unit if needed
        if (finalUnit !== capInfo.unit && (group.canonicalName === 'garlic' || group.canonicalName === 'onion' || group.canonicalName === 'fresh herbs')) {
          finalUnit = capInfo.unit;
        }
      }
    } else if (QUANTITY_CAPS[finalUnit] !== undefined) {
      if (finalQty > QUANTITY_CAPS[finalUnit]) {
        finalQty = QUANTITY_CAPS[finalUnit];
      }
    }

    // Special Garlic formatting
    if (group.canonicalName === 'garlic' && finalUnit === 'clove') {
      if (finalQty > 8) {
        finalQty = 1;
        finalUnit = 'head';
      } else if (finalQty > 3) {
        finalQty = 1;
        finalUnit = 'bulb';
      }
    }

    finalQty = Math.ceil(finalQty);

    let display_text = `${finalQty} ${finalUnit} ${finalName}`;
    if (finalUnit === 'each' || finalUnit === 'piece' || finalUnit === 'pack' || finalUnit === '') {
      display_text = `${finalQty} ${finalName}`;
    }

    deduplicated.push({
      name: finalName,
      display_text,
      quantity: String(finalQty),
      unit: finalUnit,
      category: group.category,
      usedInRecipes: Array.from(group.recipes)
    });
  }

  // Sort by category then name
  return deduplicated.sort((a, b) => {
    if (a.category !== b.category) return a.category.localeCompare(b.category);
    return a.name.localeCompare(b.name);
  });
}

export function normalizeIngredientList(
  rawItems: Array<{ text: string; recipes?: string[] }>
): NormalizedIngredient[] {
  const normalized = rawItems.map(item => {
    const norm = normalizeIngredient(item.text);
    norm.usedInRecipes = item.recipes;
    return norm;
  });
  return deduplicateIngredients(normalized);
}
