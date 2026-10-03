"use client";
import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import { useGroceryCart } from "@/contexts/GroceryCartContext";
import { readJson, safeReadJson } from "@/lib/api/json";
import type { Recipe } from "@/types/recipe";
import styles from "./quiz.module.css";
import {
  buildQuizGenerationRequest,
  cosmicToQuizRecipe,
  generationErrorMessage,
  parseGeneratedQuizRecipe,
  recipeToCart,
  servingsFor,
  validateGeneratedConstraints,
} from "./quizIntegrations";
import { useQuiz } from "./QuizProvider";
import type { QuizOutcome } from "./engine/result";
import type { QuizDish, QuizRules } from "./engine/types";
import type { QuizContext } from "./types";

const errorSchema = z.object({ message: z.string().optional(), error: z.string().optional() });

interface AiProps {
  dish: QuizDish;
  outcome: QuizOutcome;
  maxMinutes: number | null;
  loadBase: () => Promise<Recipe | null>;
}

interface AiGeneration {
  recipe: Recipe | null;
  loading: boolean;
  error: string | null;
  generate: () => void;
}

interface VariationRequest {
  dish: QuizDish;
  outcome: QuizOutcome;
  maxMinutes: number | null;
  rules: QuizRules;
  context: QuizContext;
  base: Recipe | null;
  idempotencyKey: string;
  signal: AbortSignal;
}

/** POSTs the brief to the existing generation route and validates the result. */
async function requestVariation(request: VariationRequest): Promise<Recipe> {
  const { dish, outcome, maxMinutes, rules, context, base } = request;
  const servings = servingsFor(outcome, context, base);
  const body = buildQuizGenerationRequest(dish, base, outcome, rules, { servings, maxMinutes }, request.idempotencyKey);
  const response = await fetch("/api/generate-cosmic-recipe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
    signal: AbortSignal.any([request.signal, AbortSignal.timeout(90_000)]),
  });
  if (!response.ok) {
    throw new Error(generationErrorMessage(await safeReadJson(response, null, errorSchema.parse), response.status));
  }
  const generated = await readJson(response, parseGeneratedQuizRecipe);
  validateGeneratedConstraints(generated, {
    dietaryStyle: rules.diet ?? "unrestricted",
    excludedAllergens: rules.allergens,
    maxMinutes,
    servings,
  });
  return cosmicToQuizRecipe(generated);
}

/**
 * One AI variation at a time: a request lock, abort on unmount or dish change,
 * a 90 s timeout, and an idempotency key kept across uncertain failures.
 */
function useAiGeneration({ dish, outcome, maxMinutes, loadBase }: AiProps): AiGeneration {
  const { state, context } = useQuiz();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const request = useRef<AbortController | null>(null);
  const idempotency = useRef<string | null>(null);
  useEffect(() => {
    setRecipe(null);
    setError(null);
    idempotency.current = null;
    return (): void => request.current?.abort();
  }, [dish.id]);
  const generate = (): void => {
    if (request.current) return;
    const controller = new AbortController();
    request.current = controller;
    const idempotencyKey = (idempotency.current ??= `quiz-${dish.id}-${crypto.randomUUID()}`);
    setLoading(true);
    setError(null);
    loadBase()
      .then((base) => requestVariation({ dish, outcome, maxMinutes, rules: state.rules, context, base, idempotencyKey, signal: controller.signal }))
      .then((generated) => {
        idempotency.current = null;
        setRecipe(generated);
      })
      .catch((caught: unknown) => {
        if (!controller.signal.aborted) setError(caught instanceof Error ? caught.message : "Could not generate a recipe.");
      })
      .finally(() => {
        if (request.current === controller) request.current = null;
        setLoading(false);
      });
  };
  return { recipe, loading, error, generate };
}

function AiRecipeCard({ recipe }: { recipe: Recipe }): React.JSX.Element {
  const cart = useGroceryCart();
  return (
    <details className={styles.aiRecipe} open>
      <summary>
        {recipe.name} · serves {recipe.numberOfServings ?? "?"} · {recipe.timeToMake}
      </summary>
      <ul>
        {recipe.ingredients.map((item, index) => (
          <li key={`${item.name}-${index}`}>
            {item.amount} {item.unit} {item.name}
          </li>
        ))}
      </ul>
      <ol>
        {recipe.instructions.map((step, index) => (
          <li key={index}>{step}</li>
        ))}
      </ol>
      <button type="button" className={styles.secondaryButton} onClick={() => cart.addRecipe(recipeToCart(recipe), recipe.numberOfServings ?? 1)}>
        🛒 Shop this version
      </button>
    </details>
  );
}

/** Explicit, opt-in AI variation of the matched dish via the existing generation route. */
export function QuizAiRecipe(props: AiProps): React.JSX.Element {
  const { recipe, loading, error, generate } = useAiGeneration(props);
  const label = loading ? "Writing your version…" : recipe ? "Write another version ✦" : `Make it mine: an AI take on ${props.dish.name} ✦`;
  return (
    <div className={styles.ai}>
      <button type="button" className={styles.aiButton} onClick={generate} disabled={loading} aria-busy={loading}>
        {label}
      </button>
      <p className={styles.fineprint}>
        Uses the app&apos;s demo allowance or your account&apos;s ESMS pricing, and only runs when you press it. Review
        ingredients for allergens.
      </p>
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
      {recipe && <AiRecipeCard recipe={recipe} />}
    </div>
  );
}
