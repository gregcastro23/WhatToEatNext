import RecipesPage from "./RecipesPageClient";
import type { Metadata } from "next";
import type { JSX } from "react";

/**
 * On the page rather than recipes/layout.tsx: /recipes/[recipeId] would
 * inherit a layout's canonical wherever it sets none (its not-found branch).
 */
export const metadata: Metadata = {
  alternates: { canonical: "/recipes" },
};

export default function RecipesRoute(): JSX.Element {
  return <RecipesPage />;
}
