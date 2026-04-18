"use client";

import Link from "next/link";
import React from "react";
import type { Recipe } from "@/types/recipe";

interface Props {
  recipe: Recipe;
}

/**
 * Deep-link into the recipe generator with this recipe's cuisine + top flavor
 * hints as a seed. The generator reads these from searchParams on mount and
 * pre-loads the builder context.
 */
export function RiffOnThisLink({ recipe }: Props) {
  const cuisine = recipe.cuisine?.trim();
  const flavors: string[] = [];

  const tb = recipe.flavorProfile?.tasteBalance;
  if (tb) {
    const pairs: Array<[string, number]> = [
      ["sweet", Number(tb.sweet ?? 0)],
      ["sour", Number(tb.sour ?? 0)],
      ["bitter", Number(tb.bitter ?? 0)],
      ["umami", Number(tb.umami ?? 0)],
    ];
    // Use "spicy" if any primary token implies heat; pick top 2 tastes otherwise.
    const primary = (recipe.flavorProfile?.primary ?? []).map((s) => s.toLowerCase());
    if (primary.some((p) => /spicy|hot|chili|pepper|heat/.test(p))) flavors.push("spicy");
    pairs
      .filter(([, v]) => v >= 0.5)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .forEach(([name]) => {
        if (!flavors.includes(name)) flavors.push(name);
      });
  }

  const params = new URLSearchParams();
  if (cuisine) params.set("seedCuisine", cuisine);
  if (flavors.length > 0) params.set("seedFlavors", flavors.join(","));
  if (recipe.name) params.set("seedFrom", recipe.name);

  const href = `/recipe-generator?${params.toString()}`;

  return (
    <Link
      href={href}
      className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium bg-indigo-500/15 border border-indigo-400/40 text-indigo-200 hover:bg-indigo-500/25 hover:text-indigo-100 transition-colors"
    >
      <span className="not-italic text-lg" aria-hidden>
        {"\u2728"}
      </span>
      Riff on this
    </Link>
  );
}
