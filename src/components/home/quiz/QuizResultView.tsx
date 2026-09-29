"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useGroceryCart } from "@/contexts/GroceryCartContext";
import { useRecipeBuilder } from "@/contexts/RecipeBuilderContext";
import { useRecipeQueue } from "@/contexts/RecipeQueueContext";
import {
  buildQuizGenerationRequest,
  cosmicToQuizRecipe,
  generationErrorMessage,
  parseGeneratedQuizRecipe,
  validateGeneratedConstraints,
  quizFingerprint,
  quizToBuilder,
  quizToRecipe,
  recipeToCart,
  type QuizCosmicRecipe,
} from "./quizIntegrations";
import type { ESMSKey, PalateElement, QuizContext, QuizReading } from "./types";

const ELEMENTS: ReadonlyArray<{
  key: PalateElement;
  icon: string;
  color: string;
}> = [
  { key: "Fire", icon: "🔥", color: "#F87171" },
  { key: "Earth", icon: "🌿", color: "#34D399" },
  { key: "Air", icon: "☁", color: "#C084FC" },
  { key: "Water", icon: "💧", color: "#60A5FA" },
];
const ESMS: ReadonlyArray<{ key: ESMSKey; detail: string }> = [
  { key: "Spirit", detail: "Energy & contrast" },
  { key: "Essence", detail: "Aroma & character" },
  { key: "Matter", detail: "Texture & structure" },
  { key: "Substance", detail: "Depth & nourishment" },
];
const CACHE_KEY = "alchm:quiz-generated-recipe:v1";
const actionClass =
  "rounded-xl border border-[#c7a45c]/35 bg-[#c7a45c]/5 px-4 py-3 text-sm font-medium text-[#e6ca91] transition hover:bg-[#c7a45c]/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#e6ca91] disabled:cursor-not-allowed disabled:opacity-50";

export interface QuizResultViewProps {
  reading: QuizReading;
  context: QuizContext;
}

export function QuizResultView({
  reading,
  context,
}: QuizResultViewProps): React.JSX.Element {
  const router = useRouter();
  const cart = useGroceryCart();
  const queue = useRecipeQueue();
  const builder = useRecipeBuilder();
  const fingerprint = quizFingerprint(reading, context);
  const [generated, setGenerated] = useState<QuizCosmicRecipe | null>(null);
  const [showGenerated, setShowGenerated] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [cartRecipeId, setCartRecipeId] = useState<string | null>(null);
  const request = useRef<AbortController | null>(null);
  const requestKey = useRef<string | null>(null);
  const cartLock = useRef<string | null>(null);
  const queueLock = useRef<string | null>(null);
  const latestReading = useRef(reading);
  useEffect(() => {
    latestReading.current = reading;
  }, [reading]);

  useEffect(() => {
    request.current?.abort();
    request.current = null;
    requestKey.current = null;
    cartLock.current = null;
    queueLock.current = null;
    setGenerated(null);
    setLoading(false);
    setError(null);
    setNotice(null);
    setCartRecipeId(null);
    setShowGenerated(true);
    try {
      const raw = sessionStorage.getItem(CACHE_KEY);
      const saved: unknown = raw ? JSON.parse(raw) : null;
      if (
        typeof saved === "object" &&
        saved !== null &&
        "fingerprint" in saved &&
        saved.fingerprint === fingerprint &&
        "recipe" in saved
      ) {
        const cached = parseGeneratedQuizRecipe(saved.recipe);
        validateGeneratedConstraints(cached, latestReading.current);
        setGenerated(cached);
      }
    } catch {
      // A stale or unavailable cache never prevents the original quiz meal.
    }
    return (): void => {
      request.current?.abort();
      request.current = null;
    };
  }, [fingerprint]);

  const activeGenerated = showGenerated ? generated : null;
  const recipe = useMemo(
    () =>
      activeGenerated
        ? cosmicToQuizRecipe(activeGenerated)
        : quizToRecipe(reading, context),
    [activeGenerated, reading, context],
  );
  const servings = recipe.numberOfServings ?? reading.preferences.servings;

  async function generateRecipe(): Promise<void> {
    if (request.current) return;
    const controller = new AbortController();
    request.current = controller;
    requestKey.current ??= `quiz-${fingerprint}-${crypto.randomUUID()}`;
    setLoading(true);
    setError(null);
    setNotice(null);
    try {
      const payload = buildQuizGenerationRequest(
        reading,
        context,
        requestKey.current,
      );
      const response = await fetch("/api/generate-cosmic-recipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
        signal: AbortSignal.any([
          controller.signal,
          AbortSignal.timeout(90_000),
        ]),
      });
      const data: unknown = await response.json();
      if (controller.signal.aborted || request.current !== controller) return;
      requestKey.current = null;
      if (!response.ok)
        throw new Error(generationErrorMessage(data, response.status));
      const parsed = parseGeneratedQuizRecipe(data);
      validateGeneratedConstraints(parsed, reading);
      setGenerated(parsed);
      setShowGenerated(true);
      setNotice(
        "Your AI recipe is ready. Shopping and saving now use this recipe.",
      );
      requestKey.current = null;
      try {
        sessionStorage.setItem(
          CACHE_KEY,
          JSON.stringify({ fingerprint, recipe: parsed }),
        );
      } catch {
        /* Storage is optional. */
      }
    } catch (caught) {
      if (!controller.signal.aborted && request.current === controller) {
        setError(
          caught instanceof Error
            ? caught.message
            : "Could not generate a recipe. Please try again.",
        );
      }
    } finally {
      if (request.current === controller) {
        request.current = null;
        setLoading(false);
      }
    }
  }

  function addToCart(): void {
    if (cartLock.current === recipe.id || cartRecipeId === recipe.id) {
      cart.open();
      return;
    }
    cartLock.current = recipe.id;
    const count = cart.addRecipe(recipeToCart(recipe), servings);
    setCartRecipeId(recipe.id);
    setNotice(
      `${count} ingredients added to your grocery cart for ${servings} ${servings === 1 ? "serving" : "servings"}.`,
    );
    cart.open();
  }

  function saveRecipe(): void {
    if (queueLock.current === recipe.id || queue.isInQueue(recipe.id)) return;
    queueLock.current = recipe.id;
    queue.addToQueue(recipe, {
      notes: `From your ${reading.dominant} + ${reading.secondary} preference reading.`,
    });
    setNotice(`${recipe.name} saved to your recipe queue.`);
  }

  function openBuilder(): void {
    if (!builder.isReady) return;
    builder.seedFromQuiz(quizToBuilder(reading, context));
    router.push("/recipe-builder");
  }

  return (
    <div className="space-y-7 text-[#ece7dc]">
      <section
        aria-labelledby="quiz-result-heading"
        className="overflow-hidden rounded-2xl border border-[#c7a45c]/30 bg-gradient-to-br from-[#c7a45c]/10 to-transparent"
      >
        <div className="border-b border-[#c7a45c]/15 p-5 sm:p-6">
          <div className="flex items-start gap-4">
            <span className="text-4xl" aria-hidden="true">
              {reading.meal.emoji}
            </span>
            <div>
              <p className="text-[10px] uppercase tracking-[0.22em] text-[#c7a45c]">
                {activeGenerated ? "Your AI recipe" : "A meal for this moment"}
              </p>
              <h2
                id="quiz-result-heading"
                tabIndex={-1}
                className="mt-1 font-serif text-2xl"
              >
                {recipe.name}
              </h2>
            </div>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-[#bcb7aa]">
            {recipe.description}
          </p>
          <p className="mt-3 text-xs text-[#d7bd82]">
            {recipe.cuisine} · {recipe.timeToMake} · Serves {servings} ·{" "}
            {recipe.cookingMethod?.join(", ")}
          </p>
          <p className="mt-2 text-xs text-[#979386]">
            {activeGenerated
              ? "AI recipe · review ingredient labels and substitutions"
              : reading.meal.dietaryMatch}
            {reading.preferences.excludedAllergens.length
              ? ` · Requested exclusions: ${reading.preferences.excludedAllergens.join(", ")}`
              : ""}
          </p>
          {generated && (
            <button
              type="button"
              onClick={() => setShowGenerated((value) => !value)}
              className="mt-3 text-xs text-[#e6ca91] underline underline-offset-4"
            >
              {showGenerated
                ? "View original quiz meal"
                : "View generated recipe"}
            </button>
          )}
        </div>
        <details className="p-5 sm:p-6">
          <summary className="cursor-pointer text-sm font-semibold text-[#d7bd82]">
            Ingredients & cooking steps
          </summary>
          <div className="mt-5 space-y-6">
            <div>
              <h4 className="text-sm font-semibold text-[#d7bd82]">
                Ingredients
              </h4>
              <ul className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                {recipe.ingredients.map((ingredient, index) => (
                  <li
                    key={`${ingredient.name}-${index}`}
                    className="flex gap-2"
                  >
                    <span className="text-[#c7a45c]" aria-hidden="true">
                      ·
                    </span>
                    <span>
                      {ingredient.amount} {ingredient.unit} {ingredient.name}
                      {ingredient.optional ? " (optional)" : ""}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-[#d7bd82]">
                Make it yours
              </h4>
              <ol className="mt-3 space-y-3">
                {recipe.instructions.map((instruction, index) => (
                  <li
                    key={index}
                    className="flex gap-3 text-sm leading-relaxed text-[#c9c4b9]"
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[#c7a45c]/30 text-xs text-[#d7bd82]">
                      {index + 1}
                    </span>
                    <span>{instruction}</span>
                  </li>
                ))}
              </ol>
            </div>
            {activeGenerated && (
              <div className="space-y-3 border-t border-white/10 pt-4 text-sm leading-relaxed text-[#bcb7aa]">
                <p>
                  <span className="text-[#d7bd82]">Finish & serve: </span>
                  {
                    activeGenerated.finishing_and_serving.garnish_and_plating
                  }{" "}
                  {activeGenerated.finishing_and_serving.doneness_cues}{" "}
                  {activeGenerated.finishing_and_serving.serving_suggestions}
                </p>
                <p>
                  <span className="text-[#d7bd82]">Storage: </span>
                  {activeGenerated.leftovers_and_storage.storage_instructions}
                </p>
                <p className="text-xs">
                  Estimated per serving: {activeGenerated.nutrition.calories}{" "}
                  kcal · {activeGenerated.nutrition.protein}g protein ·{" "}
                  {activeGenerated.nutrition.carbohydrates}g carbohydrates ·{" "}
                  {activeGenerated.nutrition.fat}g fat
                </p>
              </div>
            )}
          </div>
        </details>
      </section>

      <div className="grid gap-3 sm:grid-cols-2">
        <button type="button" className={actionClass} onClick={addToCart}>
          {cartRecipeId === recipe.id
            ? "Open grocery cart"
            : "Shop these ingredients"}
        </button>
        <button
          type="button"
          className={actionClass}
          onClick={saveRecipe}
          disabled={queue.isInQueue(recipe.id)}
        >
          {queue.isInQueue(recipe.id)
            ? "Saved to recipe queue"
            : "Save to recipe queue"}
        </button>
        <button
          type="button"
          className={actionClass}
          onClick={openBuilder}
          disabled={!builder.isReady}
        >
          Refine in recipe builder →
        </button>
        <button
          type="button"
          className={`${actionClass} bg-[#c7a45c]/15`}
          onClick={() => {
            void generateRecipe();
          }}
          disabled={loading}
          aria-busy={loading}
        >
          {loading
            ? "Creating your recipe…"
            : generated
              ? "Generate another AI recipe"
              : "Create a recipe with AI ✦"}
        </button>
      </div>
      <p className="text-center text-xs leading-relaxed text-[#979386]">
        AI generation uses the app’s demo allowance or your account’s ESMS
        pricing. It starts only when you choose it.
      </p>
      {loading && (
        <button
          type="button"
          className="mx-auto block text-xs text-[#d7bd82] underline underline-offset-4"
          onClick={() => {
            request.current?.abort();
            request.current = null;
            setLoading(false);
            setNotice(
              "Generation cancelled here. Your quiz meal remains available.",
            );
          }}
        >
          Cancel generation
        </button>
      )}
      {error && (
        <p
          role="alert"
          className="rounded-xl border border-red-400/25 bg-red-400/5 p-3 text-sm text-red-200"
        >
          {error}
        </p>
      )}
      <Link
        href={`/recipes?cuisine=${encodeURIComponent(reading.meal.cuisineSlug)}`}
        className={actionClass}
      >
        Explore more recipes →
      </Link>
      <details className="rounded-xl border border-white/10 p-4">
        <summary className="cursor-pointer text-sm text-[#d7bd82]">
          Explore your flavor & ESMS reading
        </summary>
        <div className="mt-5 space-y-6">
          <header className="text-center">
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#c7a45c]">
              Your elemental reading
            </p>
            <h2
              id="quiz-reading-heading"
              className="mt-3 font-serif text-3xl sm:text-4xl"
            >
              {reading.dominant} at heart.
              <br />
              <span className="text-[#d7bd82]">
                A little {reading.secondary} on the side.
              </span>
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-[#bcb7aa]">
              {reading.tunedDescription}
            </p>
          </header>

          <section
            aria-label="Elemental preference balance"
            className="rounded-2xl border border-white/10 bg-white/[0.025] p-5"
          >
            <h3 className="text-xs uppercase tracking-[0.18em] text-[#c7a45c]">
              Your flavor balance
            </h3>
            <div className="mt-4 space-y-4">
              {ELEMENTS.map(({ key, icon, color }) => (
                <div key={key}>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span>
                      <span aria-hidden="true">{icon}</span> {key}
                    </span>
                    <span style={{ color }}>
                      {Math.round(reading.pct[key])}%
                    </span>
                  </div>
                  <div
                    role="meter"
                    aria-label={`${key} preference`}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={Math.round(reading.pct[key])}
                    className="h-1.5 overflow-hidden rounded-full bg-white/10"
                  >
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${reading.pct[key]}%`,
                        backgroundColor: color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs leading-relaxed text-[#979386]">
              A blend of your answers and available table context. These
              percentages describe culinary preferences.
            </p>
          </section>

          <section aria-label="ESMS culinary preference points">
            <h3 className="text-xs uppercase tracking-[0.18em] text-[#c7a45c]">
              Four dimensions of your appetite
            </h3>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {ESMS.map(({ key, detail }) => (
                <div
                  key={key}
                  className="rounded-xl border border-[#c7a45c]/15 p-3 text-center"
                >
                  <p className="text-xs text-[#d7bd82]">{key}</p>
                  <p className="my-1 font-serif text-2xl">
                    {reading.esmsTotals[key]}
                    <span className="ml-1 font-sans text-[10px] text-[#979386]">
                      pts
                    </span>
                  </p>
                  <p className="text-[10px] text-[#979386]">{detail}</p>
                </div>
              ))}
            </div>
            <p className="mt-2 text-xs text-[#979386]">
              Choose the 20-question Deep Dive to explore all four dimensions.
              ESMS points come from your choices. They are separate from
              planetary measurements and token balances.
            </p>
          </section>
        </div>
      </details>
      <p
        role="status"
        aria-live="polite"
        className="text-center text-sm text-[#d7bd82]"
      >
        {notice}
      </p>
    </div>
  );
}
