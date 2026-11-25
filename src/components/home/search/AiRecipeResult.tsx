"use client";

/** A generated recipe, shown in place with a way to shop its ingredients. */
import { useState } from "react";
import { cosmicToQuizRecipe, recipeToCart } from "@/components/home/quiz/quizIntegrations";
import { useGroceryCart } from "@/contexts/GroceryCartContext";
import styles from "./homeSearch.module.css";
import type { AiRecipe } from "./useAiRecipe";
import type { JSX } from "react";

function IngredientList({ recipe }: { recipe: AiRecipe }): JSX.Element {
  return (
    <ul>
      {recipe.ingredients.map((item, at) => (
        <li key={`${at}-${item.name}`}>
          {[item.quantity, item.unit, item.name].filter(Boolean).join(" ")}
          {item.optional ? " (optional)" : ""}
        </li>
      ))}
    </ul>
  );
}

function StepList({ recipe }: { recipe: AiRecipe }): JSX.Element {
  return (
    <ol>
      {recipe.steps.map((step) => (
        <li key={step.step_number}>
          {step.instruction}
          {step.tips.length > 0 && <div className={styles.meta}>{step.tips.join(" · ")}</div>}
        </li>
      ))}
    </ol>
  );
}

export function AiRecipeResult({ recipe }: { recipe: AiRecipe }): JSX.Element {
  const cart = useGroceryCart();
  const [added, setAdded] = useState<string | null>(null);
  const addToCart = (): void => {
    const shoppable = cosmicToQuizRecipe(recipe);
    cart.addRecipe(recipeToCart(shoppable), shoppable.numberOfServings ?? 1);
    setAdded(recipe.id);
  };
  return (
    <article className={styles.card}>
      <header className={styles.cardHead}>
        <h3 className={styles.cardTitle}>{recipe.title}</h3>
        <span className={styles.meta}>
          Written by AI · serves {recipe.yields} · {recipe.total_time} min
        </span>
      </header>
      <p className={styles.status}>{recipe.short_description}</p>
      <div className={styles.detail}>
        <div className={styles.subhead}>Ingredients</div>
        <IngredientList recipe={recipe} />
        <div className={styles.subhead}>Method</div>
        <StepList recipe={recipe} />
        <p>
          <strong>Done when:</strong> {recipe.finishing_and_serving.doneness_cues}
        </p>
        <p>
          <strong>Leftovers:</strong> {recipe.leftovers_and_storage.storage_instructions}
        </p>
      </div>
      <p className={styles.meta}>Check food safety temperatures and allergens yourself; AI recipes are not kitchen tested.</p>
      <div className={styles.controls}>
        <button type="button" className={styles.secondary} disabled={added === recipe.id} onClick={addToCart}>
          {added === recipe.id ? "Added to grocery cart" : "Add ingredients to grocery cart"}
        </button>
      </div>
    </article>
  );
}
