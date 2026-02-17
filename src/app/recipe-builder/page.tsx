"use client";

/**
 * Recipe Builder Page
 * Dedicated page for building recipes using ingredient search,
 * cuisine/method selection, and the generation pipeline.
 *
 * @file src/app/recipe-builder/page.tsx
 */

import React from "react";
import RecipeBuilderPanel from "@/components/recipe-builder/RecipeBuilderPanel";

export default function RecipeBuilderPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-orange-50">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <RecipeBuilderPanel />
      </div>
    </div>
  );
}
