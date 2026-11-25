"use client";

/**
 * The ingredient section's quick recipe builder: ingredients and equipment in,
 * free matching recipes first, then a priced "Create with AI" button that sends
 * the same list to the recipe generator (owner ruling 2026-11-25).
 */
import { useState } from "react";
import { useRecipeBuilder } from "@/contexts/RecipeBuilderContext";
import { useUser } from "@/contexts/UserContext";
import { PANTRY_DIET_CHOICES, pantryDietOf, pantryRecipeRequest, type PantryDiet } from "@/lib/recipe-builder/pantryRecipeRequest";
import { PANTRY_DIETS, type PantryQuery } from "@/lib/validation/pantrySearchSchemas";
import { AiRecipeResult } from "./AiRecipeResult";
import { EquipmentPicker } from "./EquipmentPicker";
import styles from "./homeSearch.module.css";
import { IngredientPicker } from "./IngredientPicker";
import { PantryMatches } from "./PantryMatches";
import { useAiRecipe, type AiFailure } from "./useAiRecipe";
import type { JSX } from "react";

const VISITOR_COST = "Visitors get 2 AI recipes a day. Sign in for more.";
const MEMBER_COST = "Your first AI recipe each day is free; after that it costs ESMS (about 10 at the base rate, priced live to your chart, swapping other coins if one runs short).";

function profileRestrictions(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === "string") : [];
}

export function matchQuery(ingredients: readonly string[], diet: PantryDiet): PantryQuery {
  return { ingredients: [...ingredients], diet: PANTRY_DIETS.find((choice) => choice === diet) ?? null };
}

function Failure({ failure }: { failure: AiFailure }): JSX.Element {
  return (
    <p className={styles.note} role="alert">
      {failure.message}{" "}
      {failure.signIn && (
        <button type="button" className={styles.toggle} onClick={() => window.dispatchEvent(new Event("open-signin-modal"))}>
          Sign in
        </button>
      )}
    </p>
  );
}

function DietSelect({ diet, onChange }: { diet: PantryDiet; onChange: (diet: PantryDiet) => void }): JSX.Element {
  return (
    <select className={styles.select} aria-label="Diet" value={diet} onChange={(event) => onChange(pantryDietOf(event.target.value))}>
      {PANTRY_DIET_CHOICES.map((choice) => (
        <option key={choice.value} value={choice.value}>
          {choice.label}
        </option>
      ))}
    </select>
  );
}

export function IngredientRecipeBar(): JSX.Element {
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [equipment, setEquipment] = useState<string[]>([]);
  const [diet, setDiet] = useState<PantryDiet>("no-restrictions");
  const [query, setQuery] = useState<PantryQuery | null>(null);
  const { currentUser } = useUser();
  const { allergies } = useRecipeBuilder();
  const ai = useAiRecipe();
  const empty = ingredients.length === 0;
  const createWithAi = (): void => {
    ai.create(
      pantryRecipeRequest({ ingredients, equipment, diet, excluded: allergies, profileDiet: profileRestrictions(currentUser?.preferences?.dietaryRestrictions) }),
    );
  };
  return (
    <div className={styles.root}>
      <div className={styles.builder} role="group" aria-label="Build a recipe from what you have">
        <IngredientPicker chosen={ingredients} onChange={setIngredients} />
        <EquipmentPicker chosen={equipment} onChange={setEquipment} />
        <div className={styles.controls}>
          <DietSelect diet={diet} onChange={setDiet} />
          <button type="button" className={styles.primary} disabled={empty} onClick={() => setQuery(matchQuery(ingredients, diet))}>
            Find recipes
          </button>
          <button type="button" className={styles.secondary} disabled={empty || ai.loading} onClick={createWithAi}>
            {ai.loading ? "Writing your recipe…" : "Create a new recipe with AI"}
          </button>
        </div>
        <p className={styles.meta}>
          {currentUser ? MEMBER_COST : VISITOR_COST}
          {allergies.length > 0 ? ` AI will exclude your allergens: ${allergies.join(", ")}.` : ""}
        </p>
      </div>
      <div aria-live="polite" className={styles.results}>
        <PantryMatches query={query} />
        {ai.failure && <Failure failure={ai.failure} />}
        {ai.recipe && <AiRecipeResult recipe={ai.recipe} />}
      </div>
    </div>
  );
}
