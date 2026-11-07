/**
 * @file src/lib/mcp/resourceCatalog.ts
 *
 * Static catalog definitions and reference payloads for MCP resources.
 */

export interface ResourceDefinition {
  uri: string;
  name: string;
  description: string;
  mimeType: string;
}

export interface ResourceTemplateDefinition {
  uriTemplate: string;
  name: string;
  description: string;
  mimeType: string;
}

export interface ResourceContents {
  uri: string;
  mimeType?: string;
  text?: string;
  blob?: string;
}

export {
  CULINARY_TECHNIQUES,
  type CulinaryTechniqueInfo,
} from "./techniqueData";

export const RESOURCE_TEMPLATES: ResourceTemplateDefinition[] = [
  {
    uriTemplate: "alchm://ingredients/{slug}",
    name: "Ingredient Reference & Alchemy",
    description:
      "Deep structured nutrition (macros per 100g), elemental/ESMS properties, season, flavor notes, and top culinary pairings by ingredient slug or alias.",
    mimeType: "application/json",
  },
  {
    uriTemplate: "alchm://recipes/{id}",
    name: "Full Structured Recipe Card",
    description:
      "Full Schema.org/Recipe JSON format with scaled ingredients, step timers, sensory checkpoints, thermal targets, and elemental summary by recipe ID or slug.",
    mimeType: "application/json",
  },
  {
    uriTemplate: "alchm://techniques/{slug}",
    name: "Culinary Technique & Thermal Guide",
    description:
      "Reference guide for core cooking methods (dry-brining, tempering, emulsification, searing, braising) with target temperatures, sensory cues, and failure modes.",
    mimeType: "application/json",
  },
];

export const RESOURCE_DEFINITIONS: ResourceDefinition[] = [
  {
    uri: "alchm://catalog/cuisines",
    name: "Supported Catalog Cuisines",
    description: "Standard culinary traditions and styles supported in WhatToEatNext",
    mimeType: "application/json",
  },
  {
    uri: "alchm://catalog/diets",
    name: "Supported Dietary Restrictions",
    description: "Standard dietary restrictions and allergen filter tags",
    mimeType: "application/json",
  },
  {
    uri: "alchm://ontology/esms",
    name: "ESMS Alchemical Ontology",
    description: "The 4-axis alchemical framework: Spirit, Essence, Matter, and Substance",
    mimeType: "application/json",
  },
  {
    uri: "alchm://roster/historical-agents",
    name: "71 Canonical Historical Masters",
    description: "Roster of historical culinary personas and their dietary philosophies",
    mimeType: "application/json",
  },
  {
    uri: "alchm://reference/tool-costs",
    name: "MCP Tool Token Costs",
    description: "Cost schedule of ESMS tokens for all MCP tools",
    mimeType: "application/json",
  },
  {
    uri: "alchm://account/allowance",
    name: "Current Account Allowance & ESMS Balance",
    description: "Live token balances and rate-limit tier for the calling agent or user",
    mimeType: "application/json",
  },
  {
    uri: "alchm://account/culinary-profile",
    name: "Caller Culinary Profile & Allergens",
    description:
      "Saved dietary restrictions, allergens, disliked ingredients, spice tolerance, and kitchen equipment for the authenticated account.",
    mimeType: "application/json",
  },
];

export const STATIC_RESOURCE_MAP: Record<string, unknown> = {
  "alchm://catalog/cuisines": {
    cuisines: [
      "American",
      "Chinese",
      "Ethiopian",
      "French",
      "Greek",
      "Indian",
      "Italian",
      "Japanese",
      "Korean",
      "Mediterranean",
      "Mexican",
      "Middle Eastern",
      "Nordic",
      "Spanish",
      "Thai",
      "Vietnamese",
    ],
    count: 16,
  },
  "alchm://catalog/diets": {
    dietaryRestrictions: [
      "Dairy-Free",
      "Gluten-Free",
      "Halal",
      "Keto",
      "Kosher",
      "Low-FODMAP",
      "Nut-Free",
      "Pescatarian",
      "Vegan",
      "Vegetarian",
    ],
    count: 10,
  },
  "alchm://ontology/esms": {
    framework: "ESMS Quad-Axial Alchemy",
    axes: {
      Spirit: {
        element: "Fire / Air",
        nature: "Expansive, dynamic, volatile",
        culinaryCorrespondence:
          "Aromatics, chiles, raw herbs, carbonation, high heat searing",
      },
      Essence: {
        element: "Water",
        nature: "Extractable, cohesive, resonant",
        culinaryCorrespondence:
          "Stocks, broths, reductions, aged vinegars, umami depth",
      },
      Matter: {
        element: "Earth",
        nature: "Structural, dense, grounding",
        culinaryCorrespondence:
          "Root vegetables, whole grains, bones, fiber, slow braises",
      },
      Substance: {
        element: "Water / Earth",
        nature: "Nourishing, sustaining, somatic yield",
        culinaryCorrespondence:
          "Healthy fats, proteins, caloric density, emulsified sauces",
      },
    },
  },
  "alchm://roster/historical-agents": {
    historicalMasters: [
      {
        slug: "leonardo-da-vinci",
        name: "Leonardo da Vinci",
        dietaryPhilosophy:
          "Strict vegetarian, renaissance botanist, water dynamics",
      },
      {
        slug: "hildegard-von-bingen",
        name: "Hildegard von Bingen",
        dietaryPhilosophy:
          "Medieval herbalist, viriditas, spelt and medicinal herbs",
      },
      {
        slug: "socrates",
        name: "Socrates",
        dietaryPhilosophy:
          "Athenian temperance, simple olives, bread, unadulterated greens",
      },
      {
        slug: "paracelsus",
        name: "Paracelsus",
        dietaryPhilosophy:
          "Spagyric medicine, mineral balance, thermal dosing",
      },
      {
        slug: "carl-jung",
        name: "Carl Jung",
        dietaryPhilosophy:
          "Archetypal psychological resonance, earthy Swiss sustenance",
      },
      {
        slug: "cleopatra",
        name: "Cleopatra VII",
        dietaryPhilosophy:
          "Alexandrian luxury, pomegranates, fermented honey, cooling herbs",
      },
      {
        slug: "isaac-newton",
        name: "Isaac Newton",
        dietaryPhilosophy:
          "Alchemical laboratory discipline, austere roasted grains",
      },
      {
        slug: "albert-einstein",
        name: "Albert Einstein",
        dietaryPhilosophy:
          "Vegetarian humanist, simplicity, pasta and vegetables",
      },
    ],
    totalCanonical: 71,
  },
  "alchm://reference/tool-costs": {
    unit: "ESMS tokens (divided equally across Spirit, Essence, Matter, Substance)",
    costs: {
      get_live_sky_transits: "Free (0 ESMS)",
      alchemize_ingredients: "Free (0 ESMS)",
      generate_cosmic_recipe: "10 ESMS total (2.5 per axis)",
      compute_synastry_overlay: "Free (0 ESMS)",
      get_transit_natal_overlay: "Free (0 ESMS)",
      compute_triplicate_synastry: "Free (0 ESMS)",
      create_evidence_snapshot: "10 ESMS total (2.5 per axis)",
      submit_recipe_reflection: "0.4 ESMS total (0.1 per axis)",
      get_user_allowance: "Free (0 ESMS)",
      substitute_ingredient: "Free (0 ESMS)",
      build_consolidated_grocery_list: "Free (0 ESMS)",
      what_to_cook_now: "10 ESMS total (2.5 per axis)",
      update_culinary_profile: "Free (0 ESMS)",
    },
  },
};

