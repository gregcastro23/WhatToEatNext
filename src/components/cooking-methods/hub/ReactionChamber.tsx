"use client";

/**
 * ReactionChamber — lazy-loads the existing EnhancedCookingMethodRecommender
 * (the full live analysis engine) below the Transmutation Hub fold.
 */
import dynamic from "next/dynamic";
import React from "react";

const EnhancedCookingMethodRecommender = dynamic(
  () => import("@/components/recommendations/EnhancedCookingMethodRecommender"),
  {
    loading: () => (
      <div className="ma-label flex min-h-[320px] items-center justify-center text-ma-outline">
        CHARGING_REACTION_CHAMBER…
      </div>
    ),
  },
);

export default function ReactionChamber() {
  return <EnhancedCookingMethodRecommender />;
}
