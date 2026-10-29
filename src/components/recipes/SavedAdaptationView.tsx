"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useGroceryCart } from "@/contexts/GroceryCartContext";
import type { SavedAdaptation } from "@/lib/recipes/savedAdaptationSchemas";
import { recomputeSavedVersionReadings } from "@/utils/dietaryAdaptation";
import type { JSX } from "react";

interface VersionProps {
  version: SavedAdaptation;
}
interface ViewProps extends VersionProps {
  publication: "published" | "not-published" | "unknown";
}

function Ingredients({ version }: VersionProps): JSX.Element {
  const { addRecipe, open } = useGroceryCart();
  const { recipe, id } = version;
  const servings = recipe.numberOfServings ?? recipe.servingSize;
  const addToCart = (): void => {
    if (servings === undefined) return;
    addRecipe(
      {
        id,
        name: recipe.name,
        baseServings: servings,
        ingredients: recipe.ingredients,
      },
      servings,
    );
    open();
  };
  return (
    <section aria-label="Edited ingredients">
      <h2 className="text-lg font-semibold">
        Ingredients{" "}
        {servings
          ? `· ${servings} servings`
          : "· authored batch; serving count unavailable"}
      </h2>
      <ul>
        {recipe.ingredients.map((ingredient, index) => (
          <li key={index}>
            {ingredient.amount} {ingredient.unit} {ingredient.name}
          </li>
        ))}
      </ul>
      <button
        type="button"
        disabled={servings === undefined}
        onClick={addToCart}
        className="mt-3 rounded border px-3 py-2 disabled:opacity-50"
      >
        Add saved version ingredients to cart
      </button>
      {servings === undefined && (
        <p className="text-sm">
          Cart unavailable because the saved batch serving count is unknown.
        </p>
      )}
    </section>
  );
}

function Coverage({ version }: VersionProps): JSX.Element {
  const { verification } = version.receipt;
  return (
    <div className="space-y-2">
      <p>
        Text screening:{" "}
        {verification.verified
          ? "all requested text checks completed"
          : "partial; some checks remain unavailable"}
        . This does not certify food safety or allergen absence.
      </p>
      <p>
        Evaluated restrictions:{" "}
        {verification.evaluatedRestrictions.join(", ") || "none"}.
      </p>
      <p>
        Unevaluated restrictions:{" "}
        {verification.unevaluatedRestrictions.join(", ") || "none reported"}.
      </p>
      <p>
        Unresolved ingredients:{" "}
        {verification.unresolvedIngredients.join(", ") || "none reported"}.
      </p>
      <p>
        Not checked: {verification.notChecked.join(", ") || "none reported"}.
      </p>
      <p>ESMS and planetary scores are unavailable for this edited version.</p>
    </div>
  );
}

function Receipt({ version }: VersionProps): JSX.Element {
  return (
    <section aria-label="Adaptation receipt" className="space-y-2 text-sm">
      <h2 className="text-lg font-semibold">What changed</h2>
      <ul>
        {version.receipt.changes.ingredients.map((change) => (
          <li key={change.index}>
            {change.from.name} → {change.to.name} ({change.to.amount}{" "}
            {change.to.unit})
          </li>
        ))}
      </ul>
      <p>
        {version.receipt.changes.instructions.length} preparation step(s)
        edited.
      </p>
      <p>
        Chart basis: saved agent placements (
        {version.receipt.basis.chart.source}); preferences: saved agent profile.
      </p>
      <Coverage version={version} />
    </section>
  );
}

function Readings({ version }: VersionProps): JSX.Element {
  const readings = useMemo(
    () =>
      recomputeSavedVersionReadings({
        ingredients: version.recipe.ingredients,
        ...(version.recipe.numberOfServings !== undefined
          ? { numberOfServings: version.recipe.numberOfServings }
          : {}),
        ...(version.recipe.servingSize !== undefined
          ? { servingSize: version.recipe.servingSize }
          : {}),
      }),
    [version.recipe],
  );
  const nutrition = readings.nutritionPerServing;
  const elements = readings.elementalProperties;
  return (
    <section aria-label="Saved version readings" className="space-y-2 text-sm">
      <h2 className="text-lg font-semibold">Readings from edited ingredients</h2>
      <p>Estimates from the current ingredient catalog. These are calculated when viewed and are separate from the saved adaptation receipt.</p>
      {nutrition ? (
        <p>
          Nutrition per serving: {Math.round(nutrition.calories)} kcal · Protein {nutrition.protein.toFixed(1)} g · Carbs {nutrition.carbs.toFixed(1)} g · Fat {nutrition.fat.toFixed(1)} g · Fiber {nutrition.fiber.toFixed(1)} g.
        </p>
      ) : (
        <p>Nutrition unavailable: a known serving count and sufficient ingredient quantity data are required.</p>
      )}
      {elements ? (
        <p>Elements: {Object.entries(elements).map(([element, value]) => `${element} ${Math.round(value * 100)}%`).join(" · ")}.</p>
      ) : (
        <p>Elemental reading unavailable: catalog coverage is incomplete.</p>
      )}
    </section>
  );
}

function Bibliography({ version }: VersionProps): JSX.Element | null {
  const { adaptedFrom } = version.recipe;
  if (!adaptedFrom) return null;
  return (
    <p className="text-sm">
      Bibliographic source:{" "}
      <a href={adaptedFrom.url} className="underline">
        {adaptedFrom.title}
      </a>{" "}
      by {adaptedFrom.author}. This credit is separate from the adaptation
      receipt.
    </p>
  );
}

export function SavedAdaptationView({
  version,
  publication,
}: ViewProps): JSX.Element {
  const { recipe } = version;
  return (
    <main className="mx-auto max-w-3xl space-y-6 px-4 py-10 text-white">
      <p className="text-sm text-purple-200">
        Saved adaptation · {version.receipt.actor.name}
      </p>
      <h1 className="text-2xl font-bold">{recipe.name}</h1>
      <Link
        href={`/recipes/${encodeURIComponent(version.receipt.original.id)}`}
        className="text-sm underline"
      >
        Original: {version.receipt.original.name}
      </Link>
      <p className="text-sm text-white/70">{version.receipt.explanation}</p>
      <p>
        {publication === "published"
          ? "Adapted action published to the activity feed."
          : publication === "unknown"
            ? "Saved version available; feed publication is unknown."
            : "Saved version available; no feed publication was confirmed."}
      </p>
      <Ingredients version={version} />
      <section aria-label="Edited instructions">
        <h2 className="text-lg font-semibold">Instructions</h2>
        <ol className="list-inside list-decimal space-y-2">
          {recipe.instructions.map((instruction, index) => (
            <li key={index}>{instruction}</li>
          ))}
        </ol>
      </section>
      <Readings version={version} />
      <Receipt version={version} />
      <Bibliography version={version} />
    </main>
  );
}
