// Centralized culinary knowledge for alchm.kitchen
// Elements reinforce themselves per project rules; no opposites

export const elementToCulinaryQualities: Record<
  "Fire" | "Water" | "Earth" | "Air",
  string[]
> = {
  Fire: ["spicy", "grilled", "roasted", "smoked"],
  Water: ["cooling", "refreshing", "poached", "steamed"],
  Earth: ["grounding", "hearty", "braised", "baked"],
  Air: ["light", "whipped", "aerated", "crisp"],
};

export const elementPreferredMethods: Record<
  "Fire" | "Water" | "Earth" | "Air",
  string[]
> = {
  Fire: ["grilling", "searing", "roasting"],
  Water: ["steaming", "poaching", "sous-vide"],
  Earth: ["braising", "baking", "stewing"],
  Air: ["air-frying", "whipping", "dehydrating"],
};

export const cuisineElementHints: Record<
  string,
  Array<"Fire" | "Water" | "Earth" | "Air">
> = {
  Italian: ["Fire", "Earth"],
  Japanese: ["Water", "Air"],
  Mexican: ["Fire", "Earth"],
  Indian: ["Fire", "Earth"],
  French: ["Earth", "Air"],
};

export const dietaryAdjustmentsByElement: Record<
  "Fire" | "Water" | "Earth" | "Air",
  string[]
> = {
  Fire: ["cooling herbs (mint)", "hydrating components (cucumber, yogurt)"],
  Water: ["add warming spices (ginger)", "balance with roasted notes"],
  Earth: ["add acidity (lemon)", "use fresh herbs"],
  Air: ["add umami depth", "increase healthy fats for satiety"],
};
