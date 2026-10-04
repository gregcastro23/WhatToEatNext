"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useGroceryCart } from "@/contexts/GroceryCartContext";
import { useRecipeBuilder } from "@/contexts/RecipeBuilderContext";
import { useRecipeQueue } from "@/contexts/RecipeQueueContext";
import type { Recipe } from "@/types/recipe";
import styles from "./quiz.module.css";
import { QuizAiRecipe } from "./QuizAiRecipe";
import { loadQuizDishRecipe } from "./quizCatalogClient";
import { quizToBuilder, recipeToCart, servingsFor } from "./quizIntegrations";
import { useQuiz } from "./QuizProvider";
import type { QuizOutcome } from "./engine/result";
import type { QuizDish } from "./engine/types";

interface ActionProps {
  dish: QuizDish;
  outcome: QuizOutcome;
  maxMinutes: number | null;
}

/** Loads the dish's full recipe on first use; remembers it per dish. */
function useDishRecipe(dish: QuizDish): { load: () => Promise<Recipe | null>; error: string | null } {
  const [error, setError] = useState<string | null>(null);
  const load = async (): Promise<Recipe | null> => {
    setError(null);
    try {
      return await loadQuizDishRecipe(dish.id);
    } catch {
      setError("We couldn't load this recipe's ingredients. Please try again.");
      return null;
    }
  };
  return { load, error };
}

interface ResultActions {
  shop: () => void;
  save: () => void;
  refine: () => void;
  load: () => Promise<Recipe | null>;
  busy: boolean;
  message: { text: string; isError: boolean } | null;
}

function useResultActions({ dish, outcome, maxMinutes }: ActionProps): ResultActions {
  const router = useRouter();
  const { state, context } = useQuiz();
  const cart = useGroceryCart();
  const queue = useRecipeQueue();
  const builder = useRecipeBuilder();
  const { load, error } = useDishRecipe(dish);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const run = (task: (recipe: Recipe) => void): void => {
    setBusy(true);
    load()
      .then((recipe) => {
        if (recipe) task(recipe);
      })
      .finally(() => setBusy(false))
      .catch(() => undefined);
  };
  const shop = (): void =>
    run((recipe) => {
      const servings = servingsFor(outcome, context, recipe);
      const count = cart.addRecipe(recipeToCart(recipe), servings);
      setNotice(`${count} ingredients added for ${servings} ${servings === 1 ? "serving" : "servings"}.`);
      cart.open();
    });
  const save = (): void =>
    run((recipe) => {
      if (!queue.isInQueue(recipe.id)) queue.addToQueue(recipe, { notes: "Picked by the homepage quiz." });
      setNotice(`${recipe.name} is in your recipe queue.`);
    });
  const refine = (): void =>
    run((recipe) => {
      builder.seedFromQuiz(quizToBuilder(dish, recipe, outcome, state.rules, context, maxMinutes));
      router.push("/recipe-builder");
    });
  const text = error ?? notice;
  return { shop, save, refine, load, busy, message: text ? { text, isError: error !== null } : null };
}

export function QuizResultActions(props: ActionProps): React.JSX.Element {
  const { dish, outcome, maxMinutes } = props;
  const queue = useRecipeQueue();
  const builder = useRecipeBuilder();
  const { shop, save, refine, load, busy, message } = useResultActions(props);
  const saved = queue.isInQueue(dish.id);
  return (
    <div className={styles.actions}>
      <Link href={`/recipes/${encodeURIComponent(dish.id)}`} className={styles.primaryButton}>
        Open the full recipe →
      </Link>
      <div className={styles.actionGrid}>
        <button type="button" className={styles.secondaryButton} onClick={shop} disabled={busy}>
          🛒 Shop the ingredients
        </button>
        <button type="button" className={styles.secondaryButton} onClick={save} disabled={busy || saved}>
          {saved ? "✓ Saved" : "🔖 Save for later"}
        </button>
        <button type="button" className={styles.secondaryButton} onClick={refine} disabled={busy || !builder.isReady}>
          🧪 Refine in the recipe builder
        </button>
      </div>
      <QuizAiRecipe dish={dish} outcome={outcome} maxMinutes={maxMinutes} loadBase={load} />
      {message && (
        <p className={message.isError ? styles.error : styles.noticeLine} role={message.isError ? "alert" : "status"}>
          {message.text}
        </p>
      )}
    </div>
  );
}
