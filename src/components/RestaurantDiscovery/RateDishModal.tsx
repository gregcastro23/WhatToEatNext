"use client";

/**
 * RateDishModal — Rate a dish and comment on it from any restaurant.
 *
 * Connects the "Order It" tree to dish evaluation, comments, mood capture,
 * and Food Diary tracking with planetary alignment.
 *
 * @file src/components/RestaurantDiscovery/RateDishModal.tsx
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { useToast } from "@/components/ToastProvider";
import { getSignatureDishes } from "@/data/restaurant/curatedCatalog";
import {
  extractIngredientsClient,
  DISH_FEATURE_CHIPS,
} from "@/data/restaurant/menuAlchemyLexicon";
import { readJson } from "@/lib/api/json";
import type { MoodTag } from "@/types/foodDiary";

export interface RateDishModalProps {
  restaurant: {
    id: string;
    name: string;
    cuisine?: string;
    address?: string;
  };
  initialDishName?: string;
  orderId?: string;
  onClose: () => void;
  onSuccess?: () => void;
}

interface CommunityReview {
  id: string;
  dish_name: string;
  user_name: string | null;
  rating: number;
  comment: string | null;
  mood_tags: string[];
  liked_ingredients?: string[] | null;
  dish_features?: string[] | null;
  elemental_resonance?: string | null;
  would_eat_again: boolean | null;
  created_at: string;
}

const CommunityReviewsResponseSchema = z.object({
  reviews: z
    .array(
      z.custom<CommunityReview>((v) => typeof v === "object" && v !== null),
    )
    .optional(),
});

const SimpleRateDishResponseSchema = z.object({
  success: z.boolean().optional(),
  error: z.string().optional(),
  message: z.string().optional(),
}).nullable();

const MOOD_OPTIONS: Array<{
  tag: MoodTag;
  label: string;
  emoji: string;
}> = [
  { tag: "energized", label: "Energized", emoji: "⚡" },
  { tag: "satisfied", label: "Satisfied", emoji: "😊" },
  { tag: "content", label: "Content", emoji: "💖" },
  { tag: "focused", label: "Focused", emoji: "🎯" },
  { tag: "tired", label: "Tired", emoji: "😴" },
  { tag: "bloated", label: "Bloated", emoji: "🎈" },
  { tag: "sluggish", label: "Sluggish", emoji: "🐌" },
  { tag: "craving_more", label: "Want More", emoji: "➕" },
];

export function RateDishModal({
  restaurant,
  initialDishName = "",
  orderId,
  onClose,
  onSuccess,
}: RateDishModalProps) {
  const [dishName, setDishName] = useState(initialDishName);
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [selectedMoods, setSelectedMoods] = useState<MoodTag[]>(["satisfied"]);
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [customIngredient, setCustomIngredient] = useState("");
  const [wouldEatAgain, setWouldEatAgain] = useState<boolean | null>(true);
  const [addToDiary, setAddToDiary] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [communityReviews, setCommunityReviews] = useState<CommunityReview[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  const { showToast } = useToast();

  const suggestedDishes = getSignatureDishes(
    restaurant.name,
    restaurant.cuisine,
  );

  const candidateIngredients = useMemo(() => {
    const text = `${dishName} ${suggestedDishes.join(" ")}`;
    return extractIngredientsClient(dishName, text);
  }, [dishName, suggestedDishes]);

  // Fetch past reviews for this restaurant
  useEffect(() => {
    if (!restaurant.id) return;
    let active = true;
    setLoadingReviews(true);
    void fetch(`/api/restaurants/rate-dish?restaurantId=${encodeURIComponent(restaurant.id)}`)
      .then(async (res) => {
        if (!res.ok) return;
        const data = await readJson(res, {
          parse: CommunityReviewsResponseSchema.parse,
        });
        if (active && Array.isArray(data.reviews)) {
          setCommunityReviews(data.reviews);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoadingReviews(false);
      });

    return () => {
      active = false;
    };
  }, [restaurant.id]);

  const toggleMood = (tag: MoodTag) => {
    setSelectedMoods((prev) =>
      prev.includes(tag) ? prev.filter((m) => m !== tag) : [...prev, tag],
    );
  };

  const activeRating = hoverRating ?? rating;

  const ratingLabel = (r: number): string => {
    if (r >= 5) return "✦ Transcendent (5.0)";
    if (r >= 4.5) return "✦ Outstanding (4.5)";
    if (r >= 4) return "✦ Great (4.0)";
    if (r >= 3.5) return "✦ Very Good (3.5)";
    if (r >= 3) return "✦ Good (3.0)";
    if (r >= 2.5) return "✦ Fair (2.5)";
    if (r >= 2) return "✦ Subpar (2.0)";
    return "✦ Needs Improvement (1.0)";
  };

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const trimmedDish = dishName.trim();
      if (!trimmedDish) {
        showToast("Please enter or pick a dish name.", "error");
        return;
      }

      setIsSubmitting(true);
      try {
        const res = await fetch("/api/restaurants/rate-dish", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            restaurantId: restaurant.id,
            restaurantName: restaurant.name,
            dishName: trimmedDish,
            rating,
            comment: comment.trim() || undefined,
            moodTags: selectedMoods,
            likedIngredients: selectedIngredients.length > 0 ? selectedIngredients : undefined,
            dishFeatures: selectedFeatures.length > 0 ? selectedFeatures : undefined,
            wouldEatAgain: wouldEatAgain ?? undefined,
            addToDiary,
            orderId: orderId ?? undefined,
          }),
        });

        const data = await readJson(res, {
          parse: SimpleRateDishResponseSchema.parse,
        }).catch(() => null);

        if (!res.ok || !data?.success) {
          throw new Error(data?.error || "Failed to submit dish rating.");
        }

        showToast(
          `Rated ${trimmedDish} at ${restaurant.name}!`,
          "success",
        );
        if (onSuccess) onSuccess();
        onClose();
      } catch (err) {
        showToast(
          err instanceof Error ? err.message : "Error rating dish.",
          "error",
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      dishName,
      restaurant,
      rating,
      comment,
      selectedMoods,
      selectedIngredients,
      selectedFeatures,
      wouldEatAgain,
      addToDiary,
      orderId,
      showToast,
      onSuccess,
      onClose,
    ],
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="rate-dish-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn"
    >
      <div className="relative w-full max-w-lg max-h-[92vh] flex flex-col rounded-3xl border border-white/10 bg-gradient-to-br from-[#0e0c16] via-[#14101e] to-[#0c0a14] text-white shadow-2xl shadow-purple-900/40 overflow-hidden">
        {/* Glow */}
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="relative z-10 flex items-start justify-between p-6 pb-4 border-b border-white/10">
          <div>
            <div className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-purple-300">
              <span aria-hidden>✦</span> Rate & Comment
            </div>
            <h2 id="rate-dish-title" className="text-xl font-black text-white mt-0.5 truncate">
              {restaurant.name}
            </h2>
            <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-white/50">
              {restaurant.cuisine && (
                <span className="rounded-full bg-purple-500/15 border border-purple-400/30 px-2 py-0.5 text-purple-200 font-bold">
                  {restaurant.cuisine}
                </span>
              )}
              {restaurant.address && (
                <span className="truncate max-w-[260px]">{restaurant.address}</span>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-white/40 hover:text-white rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="relative z-10 flex-1 overflow-y-auto p-6 space-y-6">
          <form id="rate-dish-form" onSubmit={handleSubmit} className="space-y-5">
            {/* Dish Name */}
            <div>
              <label
                htmlFor="dish-name"
                className="block text-xs font-bold uppercase tracking-wider text-white/70 mb-1.5"
              >
                What dish did you have? <span className="text-rose-400">*</span>
              </label>
              <input
                id="dish-name"
                type="text"
                value={dishName}
                onChange={(e) => setDishName(e.target.value)}
                placeholder="e.g. Cacio e Pepe, Birria Tacos..."
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition-all"
                required
              />

              {/* Suggestions */}
              {suggestedDishes.length > 0 && (
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] text-white/40 uppercase tracking-wider font-semibold mr-1">
                    Suggestions:
                  </span>
                  {suggestedDishes.map((dish) => (
                    <button
                      key={dish}
                      type="button"
                      onClick={() => setDishName(dish)}
                      className={`text-[11px] px-2.5 py-1 rounded-full border transition-all ${
                        dishName === dish
                          ? "bg-purple-500/25 border-purple-400 text-purple-200 font-bold"
                          : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      {dish}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Star Rating */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-white/70">
                  Dish Rating
                </span>
                <span className="text-xs font-bold text-amber-300">
                  {ratingLabel(activeRating)}
                </span>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-2xl bg-white/[0.04] border border-white/10">
                {[1, 2, 3, 4, 5].map((starIndex) => {
                  const filled = activeRating >= starIndex;
                  const half = activeRating >= starIndex - 0.5 && activeRating < starIndex;
                  return (
                    <button
                      key={starIndex}
                      type="button"
                      aria-label={`Rate ${starIndex} stars`}
                      onClick={() => setRating(starIndex)}
                      onMouseEnter={() => setHoverRating(starIndex)}
                      onMouseLeave={() => setHoverRating(null)}
                      className="text-2xl transition-transform hover:scale-125 select-none focus:outline-none"
                    >
                      <span
                        className={
                          filled
                            ? "text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]"
                            : half
                              ? "text-amber-300"
                              : "text-white/20"
                        }
                      >
                        {filled ? "★" : half ? "⯨" : "☆"}
                      </span>
                    </button>
                  );
                })}
                <span className="text-sm font-black text-amber-300 ml-2">
                  {activeRating.toFixed(1)}
                </span>
              </div>
            </div>

            {/* Ingredients Liked Most */}
            <div className="space-y-1.5">
              <span className="block text-xs font-bold uppercase tracking-wider text-emerald-300">
                🌿 Ingredients you liked most
              </span>
              {candidateIngredients.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-1.5">
                  {candidateIngredients.map((ing) => {
                    const selected = selectedIngredients.includes(ing);
                    return (
                      <button
                        key={ing}
                        type="button"
                        onClick={() =>
                          setSelectedIngredients((prev) =>
                            selected ? prev.filter((x) => x !== ing) : [...prev, ing],
                          )
                        }
                        className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                          selected
                            ? "bg-emerald-500/25 border-emerald-400 text-emerald-200 font-bold shadow-sm shadow-emerald-950"
                            : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        {selected ? "✓ " : "+ "}{ing}
                      </button>
                    );
                  })}
                </div>
              )}
              {/* Custom ingredient input & chip list */}
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={customIngredient}
                  onChange={(e) => setCustomIngredient(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && customIngredient.trim()) {
                      e.preventDefault();
                      const val = customIngredient.trim();
                      if (!selectedIngredients.includes(val)) {
                        setSelectedIngredients((prev) => [...prev, val]);
                      }
                      setCustomIngredient("");
                    }
                  }}
                  placeholder="Add custom ingredient you loved (e.g. Black Truffle, Crispy Chili)..."
                  className="flex-1 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 text-xs focus:outline-none focus:border-emerald-400"
                />
                <button
                  type="button"
                  onClick={() => {
                    const val = customIngredient.trim();
                    if (val && !selectedIngredients.includes(val)) {
                      setSelectedIngredients((prev) => [...prev, val]);
                      setCustomIngredient("");
                    }
                  }}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600/30 border border-emerald-400/40 text-emerald-200 text-xs font-bold hover:bg-emerald-600/50 transition-colors"
                >
                  + Add
                </button>
              </div>
              {selectedIngredients.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] uppercase font-bold text-emerald-400/70">Selected:</span>
                  {selectedIngredients.map((ing) => (
                    <span
                      key={ing}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 text-[11px]"
                    >
                      {ing}
                      <button
                        type="button"
                        onClick={() => setSelectedIngredients((prev) => prev.filter((x) => x !== ing))}
                        className="hover:text-white text-emerald-300 ml-0.5"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Dish Features & Textures */}
            <div className="space-y-1.5">
              <span className="block text-xs font-bold uppercase tracking-wider text-purple-300">
                ✨ Dish features &amp; textures
              </span>
              <div className="flex flex-wrap gap-1.5">
                {DISH_FEATURE_CHIPS.map((feat) => {
                  const selected = selectedFeatures.includes(feat);
                  return (
                    <button
                      key={feat}
                      type="button"
                      onClick={() =>
                        setSelectedFeatures((prev) =>
                          selected ? prev.filter((x) => x !== feat) : [...prev, feat],
                        )
                      }
                      className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                        selected
                          ? "bg-purple-500/25 border-purple-400 text-purple-200 font-bold shadow-sm shadow-purple-950"
                          : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      {selected ? "✓ " : ""}{feat}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Comment */}
            <div>
              <label
                htmlFor="dish-comment"
                className="block text-xs font-bold uppercase tracking-wider text-white/70 mb-1.5"
              >
                Review & Comments
              </label>
              <textarea
                id="dish-comment"
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="What made this dish special? (Flavor balance, texture, seasoning, warmth...)"
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 text-xs focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition-all leading-relaxed"
                maxLength={1000}
              />
            </div>

            {/* Mood Tags */}
            <div>
              <span className="block text-xs font-bold uppercase tracking-wider text-white/70 mb-2">
                How did this food make you feel?
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {MOOD_OPTIONS.map((mood) => {
                  const selected = selectedMoods.includes(mood.tag);
                  return (
                    <button
                      key={mood.tag}
                      type="button"
                      onClick={() => toggleMood(mood.tag)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
                        selected
                          ? "bg-purple-500/25 border-purple-400/50 text-purple-200 shadow-sm shadow-purple-900/30"
                          : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <span aria-hidden>{mood.emoji}</span>
                      <span>{mood.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Would order again & Save to diary */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/10">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white/80">Order again?</span>
                <div className="inline-flex rounded-lg border border-white/10 bg-white/5 p-0.5">
                  <button
                    type="button"
                    onClick={() => setWouldEatAgain(true)}
                    className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                      wouldEatAgain === true
                        ? "bg-emerald-500 text-white shadow-sm"
                        : "text-white/60 hover:text-white"
                    }`}
                  >
                    Yes 👍
                  </button>
                  <button
                    type="button"
                    onClick={() => setWouldEatAgain(false)}
                    className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                      wouldEatAgain === false
                        ? "bg-rose-500 text-white shadow-sm"
                        : "text-white/60 hover:text-white"
                    }`}
                  >
                    No 👎
                  </button>
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={addToDiary}
                  onChange={(e) => setAddToDiary(e.target.checked)}
                  className="rounded border-white/20 bg-white/10 text-purple-600 focus:ring-purple-500 focus:ring-offset-0"
                />
                <span className="text-xs text-white/80 font-medium">
                  Log to Food Diary
                </span>
              </label>
            </div>
          </form>

          {/* Past Community Reviews */}
          {communityReviews.length > 0 && (
            <div className="pt-4 border-t border-white/10">
              <h3 className="text-xs font-black uppercase tracking-wider text-purple-300 mb-3 flex items-center gap-2">
                <span>✦</span> Community Dish Ratings ({communityReviews.length})
              </h3>
              <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                {communityReviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-3 rounded-xl bg-white/[0.04] border border-white/5 text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-sm">
                        {rev.dish_name}
                      </span>
                      <span className="text-amber-300 font-bold">
                        ★ {rev.rating.toFixed(1)}
                      </span>
                    </div>
                    {rev.comment && (
                      <p className="text-white/70 italic text-[11px] leading-relaxed">
                        &ldquo;{rev.comment}&rdquo;
                      </p>
                    )}
                    {rev.liked_ingredients && rev.liked_ingredients.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1 pt-0.5">
                        <span className="text-[10px] text-emerald-300 font-bold">🌿 Loved:</span>
                        {rev.liked_ingredients.map((ing) => (
                          <span
                            key={ing}
                            className="rounded-full bg-emerald-500/15 border border-emerald-400/30 px-1.5 py-0.2 text-[9px] text-emerald-200 font-medium"
                          >
                            {ing}
                          </span>
                        ))}
                      </div>
                    )}
                    {rev.dish_features && rev.dish_features.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1">
                        <span className="text-[10px] text-purple-300 font-bold">✨ Notes:</span>
                        {rev.dish_features.map((feat) => (
                          <span
                            key={feat}
                            className="rounded-full bg-purple-500/15 border border-purple-400/30 px-1.5 py-0.2 text-[9px] text-purple-200 font-medium"
                          >
                            {feat}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center justify-between text-[10px] text-white/40">
                      <span>By {rev.user_name || "Alchemist"}</span>
                      {rev.would_eat_again !== null && (
                        <span>
                          {rev.would_eat_again ? "Would order again ✓" : "Would not re-order"}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {loadingReviews && (
            <p className="text-[11px] text-white/40 text-center animate-pulse">
              Loading dish reviews...
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="relative z-10 flex items-center justify-end gap-3 p-6 pt-4 border-t border-white/10 bg-black/40">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2.5 rounded-xl border border-white/10 text-white/70 hover:text-white hover:bg-white/5 text-xs font-bold transition-all disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="rate-dish-form"
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-purple-900/40 hover:brightness-110 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <span className="animate-spin inline-block">⟳</span>
                Saving Rating...
              </>
            ) : (
              <>
                <span>✦</span>
                Submit Dish Rating
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default RateDishModal;
