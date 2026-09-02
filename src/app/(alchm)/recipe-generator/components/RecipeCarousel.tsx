import React, { useState, useEffect, useRef } from "react";
import { FullRecipeCard } from "./FullRecipeCard";
import { getRecipeIdentity } from "./recipeHelpers";
import type { RecipeCarouselProps } from "./types";

const CarouselSkeleton: React.FC = () => (
  <div className="space-y-4">
    <div className="flex items-center justify-center gap-3 py-6">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-4 border-purple-200 border-t-purple-600 animate-spin" />
        <span className="absolute inset-0 flex items-center justify-center text-lg">&#x2728;</span>
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-700">Consulting the cosmos...</p>
        <p className="text-xs text-gray-400">Aligning planetary energies with your palate</p>
      </div>
    </div>
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-3/4 mb-3" />
      <div className="h-4 bg-gray-100 rounded w-1/3 mb-4" />
      <div className="grid grid-cols-4 gap-2 mb-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-12 bg-gray-100 rounded-lg" />
        ))}
      </div>
      <div className="space-y-2 mb-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-4 bg-gray-100 rounded w-full" />
        ))}
      </div>
      <div className="h-12 bg-gray-200 rounded-xl w-full" />
    </div>
  </div>
);

const CarouselHeader: React.FC<{
  total: number;
  currentIndex: number;
  isPersonalized: boolean;
  onPrev: () => void;
  onNext: () => void;
}> = ({ total, currentIndex, isPersonalized, onPrev, onNext }) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-3">
      <h3 className="text-lg font-bold text-gray-800">
        {total} Recipe{total !== 1 ? "s" : ""} Generated
      </h3>
      {isPersonalized && (
        <span className="px-2.5 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
          Personalized
        </span>
      )}
    </div>
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onPrev}
        disabled={currentIndex === 0}
        className="w-9 h-9 rounded-full bg-white shadow border border-gray-200 flex items-center justify-center text-gray-600 transition-all hover:bg-gray-50 hover:shadow-md disabled:opacity-30 disabled:cursor-not-allowed"
        aria-label="Previous recipe"
      >
        &#x2190;
      </button>
      <span className="text-sm font-semibold text-gray-500 min-w-[3rem] text-center">
        {currentIndex + 1} / {total}
      </span>
      <button
        type="button"
        onClick={onNext}
        disabled={currentIndex === total - 1}
        className="w-9 h-9 rounded-full bg-white shadow border border-gray-200 flex items-center justify-center text-gray-600 transition-all hover:bg-gray-50 hover:shadow-md disabled:opacity-30 disabled:cursor-not-allowed"
        aria-label="Next recipe"
      >
        &#x2192;
      </button>
    </div>
  </div>
);

const CarouselDots: React.FC<{
  total: number;
  currentIndex: number;
  onSelectIndex: (idx: number) => void;
}> = ({ total, currentIndex, onSelectIndex }) => {
  if (total <= 1) return null;
  return (
    <div className="flex justify-center gap-1.5 py-1">
      {Array.from({ length: total }).map((_, idx) => (
        <button
          key={idx}
          type="button"
          onClick={(): void => { onSelectIndex(idx); }}
          className={`rounded-full transition-all ${
            idx === currentIndex
              ? "w-7 h-2.5 bg-purple-500"
              : "w-2.5 h-2.5 bg-gray-300 hover:bg-gray-400"
          }`}
          aria-label={`Go to recipe ${idx + 1}`}
        />
      ))}
    </div>
  );
};

function useCarouselGestures(
  totalCount: number,
  setCurrentIndex: React.Dispatch<React.SetStateAction<number>>,
): {
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: () => void;
} {
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const onTouchStart = (e: React.TouchEvent): void => {
    touchStartX.current = e.targetTouches[0]?.clientX ?? null;
    touchEndX.current = null;
  };
  const onTouchMove = (e: React.TouchEvent): void => {
    touchEndX.current = e.targetTouches[0]?.clientX ?? null;
  };
  const onTouchEnd = (): void => {
    if (!touchStartX.current || !touchEndX.current) return;
    const dist = touchStartX.current - touchEndX.current;
    if (dist > 50) setCurrentIndex((i) => Math.min(totalCount - 1, i + 1));
    else if (dist < -50) setCurrentIndex((i) => Math.max(0, i - 1));
    touchStartX.current = null;
    touchEndX.current = null;
  };

  return { onTouchStart, onTouchMove, onTouchEnd };
}

function useCarouselKeyNav(
  totalCount: number,
  setCurrentIndex: React.Dispatch<React.SetStateAction<number>>,
): void {
  useEffect(() => {
    const handler = (e: KeyboardEvent): void => {
      if (totalCount === 0) return;
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        setCurrentIndex((i) => Math.max(0, i - 1));
      } else if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        setCurrentIndex((i) => Math.min(totalCount - 1, i + 1));
      }
    };
    window.addEventListener("keydown", handler);
    return (): void => { window.removeEventListener("keydown", handler); };
  }, [totalCount, setCurrentIndex]);
}

const EmptySuggestions: React.FC = () => (
  <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-12 text-center">
    <span className="text-5xl block mb-4">&#x1F30C;</span>
    <p className="font-bold text-gray-700 text-lg">No recipes found</p>
    <p className="text-sm text-gray-500 mt-1">Try adjusting your preferences or generate again</p>
  </div>
);

export const RecipeCarousel: React.FC<RecipeCarouselProps> = ({
  suggestions,
  isLoading,
  isPersonalized,
  onAddToPlanner,
  onSave,
  likedRecipeIds,
  savingRecipeIds,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const gestures = useCarouselGestures(suggestions.length, setCurrentIndex);
  useCarouselKeyNav(suggestions.length, setCurrentIndex);

  useEffect(() => {
    setCurrentIndex(0);
  }, [suggestions]);

  if (isLoading) return <CarouselSkeleton />;
  if (suggestions.length === 0) return <EmptySuggestions />;

  const current = suggestions[currentIndex];
  if (!current) return null;
  const currentRecipeKey = getRecipeIdentity(current.recipe);

  return (
    <div className="space-y-4" {...gestures}>
      <CarouselHeader
        total={suggestions.length}
        currentIndex={currentIndex}
        isPersonalized={isPersonalized}
        onPrev={(): void => { setCurrentIndex(Math.max(0, currentIndex - 1)); }}
        onNext={(): void => { setCurrentIndex(Math.min(suggestions.length - 1, currentIndex + 1)); }}
      />
      <FullRecipeCard
        recommendation={current}
        index={currentIndex}
        total={suggestions.length}
        isPersonalized={isPersonalized}
        onAddToPlanner={onAddToPlanner}
        onSave={onSave}
        isLiked={likedRecipeIds.has(currentRecipeKey)}
        isSaving={savingRecipeIds.has(currentRecipeKey)}
      />
      <CarouselDots total={suggestions.length} currentIndex={currentIndex} onSelectIndex={setCurrentIndex} />
      <p className="text-center text-xs text-gray-400">
        Swipe, use arrow keys, or click arrows to browse {suggestions.length} recipes
      </p>
    </div>
  );
};
