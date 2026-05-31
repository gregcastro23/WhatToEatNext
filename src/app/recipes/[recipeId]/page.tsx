import { notFound } from "next/navigation";
import { LocalRecipeService } from "@/services/LocalRecipeService";
import { _recipeRecommender } from "@/services/recipeRecommendations";
import { sauceRecommender } from "@/services/sauceRecommender";
import RecipeClient from "./RecipeClient";
import type { Metadata } from "next";

export async function generateStaticParams() {
  if (process.env.ENABLE_RECIPE_STATIC_PARAMS !== "true") {
    return [];
  }

  const recipes = await LocalRecipeService.getAllRecipes();
  return recipes.map((recipe) => ({
    recipeId: String(recipe.id),
  }));
}

interface RecipePageProps {
  params: Promise<{ recipeId: string }>;
}

export async function generateMetadata({ params }: RecipePageProps): Promise<Metadata> {
  const { recipeId } = await params;
  const recipe = await LocalRecipeService.getRecipeById(recipeId).catch(() => null);

  if (!recipe) {
    return {
      title: "Recipe not found",
      robots: { index: false, follow: false },
    };
  }

  const recipeName = String(recipe.name ?? "Recipe");
  const description =
    typeof recipe.description === "string" && recipe.description.length > 0
      ? recipe.description.slice(0, 160)
      : `${recipeName} — a personalized cosmic recipe from Alchm Kitchen.`;
  const canonicalPath = `/recipes/${recipeId}`;
  const imageUrl =
    typeof (recipe as { image?: unknown }).image === "string"
      ? ((recipe as { image: string }).image)
      : "/alchm-icon-512.png";

  return {
    title: recipeName,
    description,
    alternates: { canonical: canonicalPath },
    openGraph: {
      type: "article",
      url: canonicalPath,
      title: recipeName,
      description,
      images: [{ url: imageUrl, alt: recipeName }],
    },
    twitter: {
      card: "summary_large_image",
      title: recipeName,
      description,
      images: [imageUrl],
    },
  };
}

function getCookingMethods(recipe: Record<string, unknown>): string[] {
  const raw = recipe.cookingMethods ?? recipe.cookingMethod;
  if (!raw) return [];
  const arr = Array.isArray(raw) ? raw : [raw];
  return arr
    .map((m) =>
      typeof m === "string"
        ? m
        : typeof m === "object" && m !== null && "name" in m
          ? String((m as { name: unknown }).name)
          : "",
    )
    .filter(Boolean);
}

/** Strip a leading "Step 3:" / "3." / "3)" enumerator from instruction text. */
function stripStepPrefix(text: string): string {
  return text.replace(/^\s*(?:step\s*)?\d+\s*[:.)]\s*/i, "").trim();
}

/** Parse a leading integer ("80", "80 minutes") into a minute count. */
function toMinutes(value: unknown): number {
  const match = String(value ?? "").match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

/** Format a minute count as an ISO-8601 duration ("PT1H20M"). */
function isoDuration(minutes: number): string | undefined {
  if (!minutes || minutes <= 0) return undefined;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const out = `PT${h ? `${h}H` : ""}${m ? `${m}M` : ""}`;
  return out === "PT" ? undefined : out;
}

export default async function RecipePage({ params }: RecipePageProps) {
  const { recipeId } = await params;

  const rawRecipe = await LocalRecipeService.getRecipeById(recipeId);

  if (!rawRecipe) {
    notFound();
  }

  const recipe = rawRecipe;

  const cookingMethods = getCookingMethods(recipe);

  // Non-essential enrichment. A recommender failure (e.g. a catalog recipe with
  // missing fields) must never 500 the page — the recipe itself always renders.
  let recommendedSauces: Awaited<
    ReturnType<typeof sauceRecommender.recommendSauce>
  > = [];
  let recommendedRecipes: Awaited<
    ReturnType<typeof _recipeRecommender.recommendSimilarRecipes>
  > = [];
  try {
    const proteins = (recipe.ingredients || [])
      .filter((i) => i.category === "protein")
      .map((i) => i.name);
    const vegetables = (recipe.ingredients || [])
      .filter((i) => i.category === "vegetable")
      .map((i) => i.name);

    recommendedSauces = await sauceRecommender.recommendSauce(recipe.cuisine ?? "", {
      protein: proteins[0],
      vegetable: vegetables[0],
      cookingMethod: cookingMethods[0],
    });

    const allRecipes = await LocalRecipeService.getAllRecipes();
    recommendedRecipes = await _recipeRecommender.recommendSimilarRecipes(
      rawRecipe,
      allRecipes,
    );
  } catch (err) {
    console.error(
      `[recipes/${recipeId}] enrichment (sauces/similar recipes) failed; rendering recipe without recommendations:`,
      err,
    );
  }

  const recipeRecord = recipe as Record<string, unknown>;
  // Build "3 cups all-purpose flour"-shaped strings for schema.org/Recipe.
  const ingredientList = Array.isArray(recipe.ingredients)
    ? recipe.ingredients
        .map((ing) => {
          if (typeof ing === "string") return ing;
          if (!ing || typeof ing !== "object" || !("name" in ing)) return "";
          const i = ing as {
            name?: unknown;
            amount?: unknown;
            unit?: unknown;
          };
          const parts = [
            i.amount != null && i.amount !== ""
              ? String(i.amount).trim()
              : "",
            typeof i.unit === "string" ? i.unit.trim() : "",
            typeof i.name === "string" ? i.name.trim() : "",
          ].filter(Boolean);
          return parts.join(" ");
        })
        .filter(Boolean)
    : [];
  const rawInstructions = recipeRecord.instructions ?? recipeRecord.steps;
  const instructionList = Array.isArray(rawInstructions)
    ? (rawInstructions as unknown[])
        .map((step) => (typeof step === "string" ? stripStepPrefix(step) : ""))
        .filter(Boolean)
    : [];

  const prepMinutes = toMinutes(
    recipeRecord.prepTime ?? recipeRecord.prepTimeMinutes,
  );
  const cookMinutes = toMinutes(
    recipeRecord.cookTime ?? recipeRecord.cookTimeMinutes,
  );
  const totalMinutes =
    toMinutes(recipeRecord.totalTime ?? recipeRecord.timeToMake) ||
    prepMinutes + cookMinutes;
  const servings = recipe.numberOfServings ?? recipe.servingSize;
  const nutrition = recipe.nutrition as
    | Record<string, unknown>
    | undefined;
  const mealTypeForCategory = Array.isArray(recipe.mealType)
    ? recipe.mealType[0]
    : typeof recipe.mealType === "string"
      ? recipe.mealType
      : undefined;
  const keywordParts = [
    recipe.cuisine,
    ...(Array.isArray(recipe.mealType) ? recipe.mealType : []),
    ...(Array.isArray(recipe.season) ? recipe.season : []),
  ].filter((v): v is string => typeof v === "string" && v.length > 0);

  const recipeJsonLd = {
    "@context": "https://schema.org",
    "@type": "Recipe",
    name: recipe.name,
    description:
      typeof recipe.description === "string" ? recipe.description : undefined,
    image:
      typeof recipeRecord.image === "string" && recipeRecord.image.length > 0
        ? [recipeRecord.image]
        : ["/alchm-icon-512.png"],
    recipeCuisine: recipe.cuisine,
    recipeCategory: mealTypeForCategory,
    recipeYield: servings != null ? `${servings} servings` : undefined,
    prepTime: isoDuration(prepMinutes),
    cookTime: isoDuration(cookMinutes),
    totalTime: isoDuration(totalMinutes),
    keywords: keywordParts.length > 0 ? keywordParts.join(", ") : undefined,
    recipeIngredient: ingredientList,
    recipeInstructions: instructionList.map((text) => ({
      "@type": "HowToStep",
      text,
    })),
    cookingMethod: cookingMethods.join(", ") || undefined,
    nutrition:
      nutrition && typeof nutrition.calories === "number" && nutrition.calories > 0
        ? {
            "@type": "NutritionInformation",
            calories: `${Math.round(nutrition.calories)} calories`,
            proteinContent:
              typeof nutrition.protein === "number"
                ? `${Math.round(nutrition.protein)} g`
                : undefined,
            carbohydrateContent:
              typeof nutrition.carbs === "number"
                ? `${Math.round(nutrition.carbs)} g`
                : undefined,
            fatContent:
              typeof nutrition.fat === "number"
                ? `${Math.round(nutrition.fat)} g`
                : undefined,
            fiberContent:
              typeof nutrition.fiber === "number"
                ? `${Math.round(nutrition.fiber)} g`
                : undefined,
            sodiumContent:
              typeof nutrition.sodium === "number"
                ? `${Math.round(nutrition.sodium)} mg`
                : undefined,
            sugarContent:
              typeof nutrition.sugar === "number"
                ? `${Math.round(nutrition.sugar)} g`
                : undefined,
          }
        : undefined,
  };

  return (
    <>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(recipeJsonLd) }}
      />
      <RecipeClient
        recipe={recipe}
        recommendedSauces={recommendedSauces}
        recommendedRecipes={recommendedRecipes}
      />
    </>
  );
}
