import type { ElementalAffinity } from "../types/alchemy";

// Add this utility function to ensure all ElementalAffinity objects have the required properties
export function formatElementalAffinity(input: unknown): ElementalAffinity {
  if (!input) {
    return {
      primary: "Fire",
      strength: 0.5,
      compatibility: { Fire: 1, Water: 0.3, Earth: 0.7, Air: 0.6 },
    }; // Default fallback
  }

  // If it's a string, create a simple object with primary
  if (typeof input === "string") {
    return {
      primary: input as "Fire" | "Water" | "Earth" | "Air",
      strength: 0.5,
      compatibility: { Fire: 1, Water: 0.3, Earth: 0.7, Air: 0.6 },
    };
  }

  const defaultCompatibility = { Fire: 1, Water: 0.3, Earth: 0.7, Air: 0.6 };

  if (typeof input !== "object" || input === null) {
    return {
      primary: "Fire",
      strength: 0.5,
      compatibility: defaultCompatibility,
    };
  }

  const inputData = input as Record<string, unknown>;
  const primary = (typeof inputData.primary === "string" ? inputData.primary : typeof inputData.element === "string" ? inputData.element : "Fire") as "Fire" | "Water" | "Earth" | "Air";
  const secondary = typeof inputData.secondary === "string" ? (inputData.secondary as "Fire" | "Water" | "Earth" | "Air") : undefined;
  const strength = typeof inputData.strength === "number" ? inputData.strength : 0.5;
  const compatibility = (typeof inputData.compatibility === "object" && inputData.compatibility !== null ? inputData.compatibility : defaultCompatibility) as Record<"Fire" | "Water" | "Earth" | "Air", number>;

  return {
    primary,
    secondary,
    strength,
    compatibility,
  };
}
