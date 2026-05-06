/**
 * Amazon Fresh / Whole Foods Price Ledger & MOQ (Minimum Orderable Quantity)
 * 
 * This file tracks current market prices (estimated) and the minimum
 * unit size available on Amazon for each ingredient to prevent 
 * impractical orders (e.g., ordering 3 cloves of garlic).
 * 
 * Last Updated: May 6, 2026
 */

export interface AmazonLedgerEntry {
  asin: string;
  price: number;
  unit: string;      // e.g., "lb", "oz", "count", "head"
  minOrder: number;  // The smallest unit Amazon sells (usually 1)
  description: string;
}

export const amazonPriceLedger: Record<string, AmazonLedgerEntry> = {
  // ─── Vegetables ──────────────────────────────────────────────────────
  "carrot": {
    asin: "B0787Y4YCW",
    price: 1.29,
    unit: "lb",
    minOrder: 1,
    description: "Whole Carrots, 1lb bag"
  },
  "garlic": {
    asin: "B0787YSB1Y",
    price: 0.50,
    unit: "bulb",
    minOrder: 1,
    description: "Organic Garlic Bulb"
  },
  "onion": {
    asin: "B0787XCFMT",
    price: 1.05,
    unit: "lb",
    minOrder: 1,
    description: "Yellow Onion"
  },
  "potato": {
    asin: "B0787YC4M5",
    price: 4.99,
    unit: "bag",
    minOrder: 1,
    description: "Russet Potatoes, 5lb Bag"
  },
  "spinach": {
    asin: "B0787X7MJ5",
    price: 2.50,
    unit: "oz",
    minOrder: 1,
    description: "Organic Baby Spinach, 5oz"
  },
  "broccoli": {
    asin: "B0787XHMPJ",
    price: 1.99,
    unit: "head",
    minOrder: 1,
    description: "Fresh Broccoli Crown"
  },
  "ginger": {
    asin: "B07V5H2JNY",
    price: 1.50,
    unit: "unit",
    minOrder: 1,
    description: "Fresh Ginger Root, approx 0.25lb"
  },

  // ─── Proteins ────────────────────────────────────────────────────────
  "chicken thigh": {
    asin: "B07BHKP7Y5",
    price: 6.49,
    unit: "lb",
    minOrder: 1,
    description: "Organic Chicken Thighs, approx 1.5lb"
  },
  "egg": {
    asin: "B0787YC4M5",
    price: 4.29,
    unit: "dozen",
    minOrder: 1,
    description: "Large Grade A Brown Eggs, 12ct"
  },
  
  // ─── Dairy ───────────────────────────────────────────────────────────
  "milk": {
    asin: "B0787YC4M5",
    price: 3.89,
    unit: "gallon",
    minOrder: 1,
    description: "Whole Milk, 1 Gallon"
  },
  "butter": {
    asin: "B0787X7MJ5",
    price: 5.49,
    unit: "pack",
    minOrder: 1,
    description: "Unsalted Butter, 16oz (4 sticks)"
  }
};

/**
 * Get the standardized order quantity for an ingredient.
 * Ensures we don't order sub-unit quantities or Practical minimums.
 */
export function getStandardizedQuantity(ingredientName: string, requestedAmount: number): number {
  const normalized = ingredientName.toLowerCase().trim();
  const entry = amazonPriceLedger[normalized];
  
  if (!entry) return Math.max(1, Math.ceil(requestedAmount));

  // If the recipe asks for "0.1" of something, we still need to order at least the minOrder
  // If it asks for 1.5 and minOrder is 1, we order 2.
  return Math.max(entry.minOrder, Math.ceil(requestedAmount));
}
