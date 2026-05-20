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

export default async function RecipePage({ params }: RecipePageProps) {
  const { recipeId } = await params;

  const rawRecipe = await LocalRecipeService.getRecipeById(recipeId);

  if (!rawRecipe) {
    notFound();
  }

  const recipe = rawRecipe;

  const proteins = (recipe.ingredients || [])
    .filter((i) => i.category === "protein")
    .map((i) => i.name);
  const vegetables = (recipe.ingredients || [])
    .filter((i) => i.category === "vegetable")
    .map((i) => i.name);

  const cookingMethods = getCookingMethods(recipe);

  const recommendedSauces = await sauceRecommender.recommendSauce(recipe.cuisine ?? "", {
    protein: proteins[0],
    vegetable: vegetables[0],
    cookingMethod: cookingMethods[0],
  });

  const allRecipes = await LocalRecipeService.getAllRecipes();
  const recommendedRecipes = await _recipeRecommender.recommendSimilarRecipes(
    rawRecipe,
    allRecipes,
  );

  const recipeRecord = recipe as Record<string, unknown>;
  const ingredientList = Array.isArray(recipe.ingredients)
    ? recipe.ingredients
        .map((ing) =>
          typeof ing === "string"
            ? ing
            : ing && typeof ing === "object" && "name" in ing
              ? String((ing as { name: unknown }).name)
              : "",
        )
        .filter(Boolean)
    : [];
  const rawInstructions = recipeRecord.instructions ?? recipeRecord.steps;
  const instructionList = Array.isArray(rawInstructions)
    ? (rawInstructions as unknown[])
        .map((step) => (typeof step === "string" ? step : ""))
        .filter(Boolean)
    : [];

  const recipeJsonLd = {
    "@context": "https://schema.org",
    "@type": "Recipe",
    name: recipe.name,
    description: typeof recipe.description === "string" ? recipe.description : undefined,
    image:
      typeof recipeRecord.image === "string"
        ? [recipeRecord.image]
        : ["/alchm-icon-512.png"],
    recipeCuisine: recipe.cuisine,
    recipeCategory:
      typeof recipeRecord.mealType === "string" ? recipeRecord.mealType : undefined,
    recipeIngredient: ingredientList,
    recipeInstructions: instructionList.map((text) => ({
      "@type": "HowToStep",
      text,
    })),
    cookingMethod: cookingMethods.join(", ") || undefined,
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
