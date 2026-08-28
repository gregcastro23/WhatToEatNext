import type { ElementalItem } from "@/calculations/alchemicalTransformation";
import type { ElementalCharacter } from "@/constants/planetaryElements";
import type { Modality } from "@/data/ingredients/types";
import { determineIngredientModality } from "@/utils/ingredientUtils";

function normalizeElementalMap(map?: Record<ElementalCharacter, number>): Record<ElementalCharacter, number> {
  if (!map) return { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };
  const total = (map.Fire ?? 0) + (map.Water ?? 0) + (map.Earth ?? 0) + (map.Air ?? 0);
  if (total > 0) {
    return {
      Fire: (map.Fire ?? 0) / total,
      Water: (map.Water ?? 0) / total,
      Earth: (map.Earth ?? 0) / total,
      Air: (map.Air ?? 0) / total,
    };
  }
  return { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };
}

function computeCategoryElemental(category: string): Record<ElementalCharacter, number> {
  const props: Record<ElementalCharacter, number> = { Fire: 0, Water: 0, Earth: 0, Air: 0 };
  const cat = category.toLowerCase();
  if (cat.includes("vegetable")) { props.Earth += 0.5; props.Water += 0.3; }
  else if (cat.includes("fruit")) { props.Water += 0.4; props.Air += 0.3; }
  else if (cat.includes("protein") || cat.includes("meat")) { props.Fire += 0.4; props.Earth += 0.3; }
  else if (cat.includes("grain")) { props.Earth += 0.5; props.Air += 0.2; }
  else if (cat.includes("herb") || cat.includes("spice")) { props.Fire += 0.3; props.Air += 0.4; }
  return props;
}

function applyPlanetElementAdjustments(props: Record<ElementalCharacter, number>, planets: string[]): void {
  planets.forEach((p) => {
    switch (p.toLowerCase()) {
      case "sun": props.Fire += 0.2; break;
      case "moon": props.Water += 0.2; break;
      case "mercury": props.Air += 0.2; break;
      case "venus": props.Earth += 0.1; props.Water += 0.1; break;
      case "mars": props.Fire += 0.2; break;
      case "jupiter": props.Air += 0.1; props.Fire += 0.1; break;
      case "saturn": props.Earth += 0.2; break;
    }
  });
}

export function transformIngredientToElemental(
  key: string,
  ingredient: {
    name?: string;
    category?: string;
    elementalProperties?: Record<ElementalCharacter, number>;
    astrologicalProfile?: { rulingPlanets?: string[] };
    qualities?: string[];
    modality?: Modality;
  },
): ElementalItem {
  let elementalProps = ingredient.elementalProperties;
  if (!elementalProps) {
    const computed = computeCategoryElemental(ingredient.category ?? "");
    applyPlanetElementAdjustments(computed, ingredient.astrologicalProfile?.rulingPlanets ?? []);
    elementalProps = normalizeElementalMap(computed);
  }
  return {
    id: key,
    name: ingredient.name ?? key,
    elementalProperties: elementalProps,
    qualities: ingredient.qualities ?? [],
    modality: ingredient.modality,
  };
}

function computeMethodElementalRaw(name: string): Record<ElementalCharacter, number> {
  const raw: Record<ElementalCharacter, number> = { Fire: 0, Water: 0, Earth: 0, Air: 0 };
  if (name.includes("grill") || name.includes("roast") || name.includes("bake") || name.includes("broil") || name.includes("fry")) {
    raw.Fire += 0.6; raw.Air += 0.2;
  } else if (name.includes("steam") || name.includes("boil") || name.includes("poach") || name.includes("simmer")) {
    raw.Water += 0.6; raw.Air += 0.2;
  } else if (name.includes("saute") || name.includes("stir-fry")) {
    raw.Fire += 0.4; raw.Air += 0.4;
  } else if (name.includes("braise") || name.includes("stew")) {
    raw.Water += 0.4; raw.Earth += 0.4;
  } else if (name.includes("smoke") || name.includes("cure")) {
    raw.Air += 0.5; raw.Fire += 0.3;
  } else if (name.includes("ferment") || name.includes("pickle")) {
    raw.Water += 0.4; raw.Earth += 0.4;
  } else {
    raw.Fire += 0.3; raw.Earth += 0.3; raw.Water += 0.2; raw.Air += 0.2;
  }
  return raw;
}

export function transformMethodToElemental(
  key: string,
  method: { name?: string; elementalEffect?: Record<ElementalCharacter, number> },
): ElementalItem {
  let effect = method.elementalEffect;
  if (!effect) {
    const raw = computeMethodElementalRaw((method.name ?? key).toLowerCase());
    effect = normalizeElementalMap(raw);
  }
  return {
    id: key,
    name: method.name ?? key,
    elementalProperties: effect,
  };
}

export function transformCuisineToElemental(
  key: string,
  cuisine: { name?: string; elementalState?: Record<ElementalCharacter, number> },
): ElementalItem {
  let state = cuisine.elementalState;
  if (!state) {
    const raw: Record<ElementalCharacter, number> = { Fire: 0, Water: 0, Earth: 0, Air: 0 };
    const name = (cuisine.name ?? key).toLowerCase();
    if (name.includes("indian") || name.includes("thai") || name.includes("mexican") || name.includes("cajun")) {
      raw.Fire += 0.5; raw.Air += 0.2;
    } else if (name.includes("japanese") || name.includes("nordic") || name.includes("korean")) {
      raw.Water += 0.4; raw.Earth += 0.3; raw.Air += 0.2;
    } else if (name.includes("french") || name.includes("italian")) {
      raw.Earth += 0.4; raw.Fire += 0.3; raw.Water += 0.2;
    } else if (name.includes("mediter")) {
      raw.Earth += 0.3; raw.Air += 0.3; raw.Fire += 0.2;
    } else if (name.includes("greek") || name.includes("spanish")) {
      raw.Earth += 0.3; raw.Fire += 0.3; raw.Air += 0.2;
    } else {
      raw.Earth += 0.3; raw.Water += 0.3; raw.Fire += 0.2; raw.Air += 0.2;
    }
    state = normalizeElementalMap(raw);
  }
  return {
    id: key,
    name: cuisine.name ?? key,
    elementalProperties: state,
  };
}

export function filterIngredientsByModality(
  items: ElementalItem[],
  modalityFilter: Modality | "all",
): ElementalItem[] {
  if (modalityFilter === "all") return items;
  return items.filter((ing) => {
    const elementalProps = ing.elementalProperties;
    const rawQualities = ing.qualities;
    const qualities: string[] = Array.isArray(rawQualities) ? (rawQualities as string[]) : [];
    const itemModality = ing.modality;
    const modality: Modality = typeof itemModality === "string"
      ? (itemModality as Modality)
      : determineIngredientModality(qualities, elementalProps);
    return modality === modalityFilter;
  });
}
