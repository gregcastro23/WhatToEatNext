// src/utils/nutrition.ts

// Helper to format nutrient names for display
export const formatNutrientName = (nutrient: string): string => {
  const nameMap: Record<string, string> = {
    vitaminC: "Vitamin C",
    vitaminD: "Vitamin D",
    calcium: "Calcium",
    iron: "Iron",
    magnesium: "Magnesium",
    potassium: "Potassium",
    zinc: "Zinc",
    folate: "Folate (B9)",
    // Add more as needed
  };
  return (
    nameMap[nutrient] ||
    nutrient
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase())
  );
};

// Helper to get nutrient unit
export const getNutrientUnit = (nutrient: string): string => {
  const unitMap: Record<string, string> = {
    vitaminC: "mg",
    vitaminD: "mcg", // Micrograms
    calcium: "mg",
    iron: "mg",
    magnesium: "mg",
    potassium: "mg",
    zinc: "mg",
    folate: "mcg",
    // Add more as needed
  };
  return unitMap[nutrient] || "unit";
};
