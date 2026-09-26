import type { RecipeSource } from "@/types/recipe";
import type { JSX } from "react";

interface RecipeAttributionProps {
  source: RecipeSource | undefined;
}

/** "Adapted from <title> by <author> (<publisher>)" under the recipe description. */
export function RecipeAttribution({ source }: RecipeAttributionProps): JSX.Element | null {
  if (!source) return null;
  const byline = source.publisher === source.author ? source.author : `${source.author} (${source.publisher})`;
  return (
    <p className="mt-3 text-sm text-white/50">
      Adapted from{" "}
      <a
        href={source.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-amber-300/80 underline decoration-dotted underline-offset-4 hover:text-amber-200"
      >
        {source.title}
      </a>{" "}
      by {byline}
    </p>
  );
}
