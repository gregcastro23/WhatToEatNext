/**
 * Recipe-NFT content commitment + display metadata.
 *
 * `contentHash`, `computationHash`, and `ingredientCatalogRoot` are the three
 * bytes32 commitments the on-chain RecipeRegistry stores. They are derived
 * deterministically (stable, sorted-key JSON → keccak256) so the same recipe +
 * fingerprint always produces the same hashes — the immutable on-chain anchor.
 */

import { keccak256, stringToBytes, type Hex } from "viem";
import { ALCHM_RECIPE_LICENSE } from "./contract";
import type { MintableRecipe } from "./mintableRecipe";
import type { RecipeFingerprint } from "./types";

/** Schema version of the NFT content envelope (separate from the alchemical engine version). */
export const CONTENT_SCHEMA_VERSION = 1;

/** Deterministic JSON with recursively sorted object keys. */
function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  const obj = value as Record<string, unknown>;
  // Skip undefined-valued keys so optional/absent fields never destabilize the hash.
  const keys = Object.keys(obj).filter((k) => obj[k] !== undefined).sort();
  return `{${keys.map((k) => `${JSON.stringify(k)}:${stableStringify(obj[k])}`).join(",")}}`;
}

const hashOf = (value: unknown): Hex => keccak256(stringToBytes(stableStringify(value)));

/** The canonical content envelope — the full thing `contentHash` commits to. */
export function buildRecipeNftContent(
  recipe: MintableRecipe,
  fingerprint: RecipeFingerprint,
) {
  return {
    schemaVersion: CONTENT_SCHEMA_VERSION,
    engineVersion: fingerprint.engineVersion,
    id: recipe.id,
    title: recipe.title,
    short_description: recipe.short_description,
    category: recipe.category,
    cuisine: recipe.cuisine,
    difficulty: recipe.difficulty,
    yields: recipe.yields,
    total_time: recipe.total_time,
    ingredients: recipe.ingredients,
    steps: recipe.steps,
    elementalBalance: recipe.elementalBalance,
    nutrition: recipe.nutrition,
    astro_explanation: recipe.astro_explanation,
    // The alchemical fingerprint travels with the content.
    fingerprint,
    license: { name: ALCHM_RECIPE_LICENSE.name, version: ALCHM_RECIPE_LICENSE.version },
  };
}

export interface RecipeNftCommitments {
  /** keccak256 of the full content envelope. */
  contentHash: Hex;
  /** keccak256 of the deterministic computation commitment (engine + ESMS + physics). */
  computationHash: Hex;
  /** keccak256 of the sorted ingredient catalog (key + ESMS per ingredient). */
  ingredientCatalogRoot: Hex;
}

export function computeCommitments(
  recipe: MintableRecipe,
  fingerprint: RecipeFingerprint,
): RecipeNftCommitments {
  const content = buildRecipeNftContent(recipe, fingerprint);

  const computation = {
    engineVersion: fingerprint.engineVersion,
    aggregationMode: fingerprint.aggregationMode,
    elementalSource: fingerprint.elementalSource,
    totals: fingerprint.totals,
    aSharp: fingerprint.aSharp,
    elemental: fingerprint.elemental,
    physics: fingerprint.physics,
  };

  // Sorted by ingredient name so ordering never perturbs the root.
  const catalog = fingerprint.ingredients
    .map((i) => ({ name: i.name, key: i.key, esms: i.esms }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return {
    contentHash: hashOf(content),
    computationHash: hashOf(computation),
    ingredientCatalogRoot: hashOf(catalog),
  };
}

/** ERC-721 display metadata (the JSON a `metadataURI` should resolve to). */
export function buildMetadata(
  recipe: MintableRecipe,
  fingerprint: RecipeFingerprint,
  opts: { imageUrl?: string; externalUrl?: string } = {},
) {
  const { physics, totals, aSharp, elemental } = fingerprint;
  return {
    name: recipe.title,
    description: recipe.short_description,
    image: opts.imageUrl ?? "",
    external_url: opts.externalUrl ?? "",
    attributes: [
      { trait_type: "Cuisine", value: recipe.cuisine },
      { trait_type: "Category", value: recipe.category },
      { trait_type: "Difficulty", value: recipe.difficulty },
      { trait_type: "Recipe #", value: aSharp },
      { trait_type: "Spirit", value: totals.spirit },
      { trait_type: "Essence", value: totals.essence },
      { trait_type: "Matter", value: totals.matter },
      { trait_type: "Substance", value: totals.substance },
      { trait_type: "Fire", value: elemental.Fire },
      { trait_type: "Water", value: elemental.Water },
      { trait_type: "Earth", value: elemental.Earth },
      { trait_type: "Air", value: elemental.Air },
      { trait_type: "Kalchm", value: physics.kalchm },
      { trait_type: "Monica", value: physics.monica },
      { trait_type: "Heat", value: physics.heat },
      { trait_type: "Entropy", value: physics.entropy },
      { trait_type: "Reactivity", value: physics.reactivity },
      { trait_type: "Greg's Energy", value: physics.gregsEnergy },
      { trait_type: "License", value: ALCHM_RECIPE_LICENSE.name },
    ],
  };
}
