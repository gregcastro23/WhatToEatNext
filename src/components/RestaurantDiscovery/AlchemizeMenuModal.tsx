"use client";

/**
 * AlchemizeMenuModal
 *
 * Visualizes the full culinary alchemy of a restaurant:
 * - Elemental signature (Fire, Water, Earth, Air breakdown & kitchen archetype)
 * - Signature ingredient taxonomy
 * - Deconstructed dish catalog with ingredients, techniques, and textures
 * - URL & Menu text ingestion engine to alchemize external menus
 * - One-click dish rating and ingredient commenting
 *
 * @file src/components/RestaurantDiscovery/AlchemizeMenuModal.tsx
 */

import { useEffect, useState } from "react";
import { useToast } from "@/components/ToastProvider";
import type {
  AlchemizedRestaurantMenu,
  ElementType,
} from "@/services/restaurantMenuAlchemyService";
import { RateDishModal } from "./RateDishModal";

export interface AlchemizeMenuModalProps {
  restaurant: {
    id: string;
    name: string;
    cuisine?: string;
    websiteUrl?: string;
  };
  onClose: () => void;
}

const ELEMENT_STYLES: Record<
  ElementType,
  { emoji: string; label: string; chipClass: string; bgClass: string; borderClass: string }
> = {
  Fire: {
    emoji: "🔥",
    label: "Fire",
    chipClass: "bg-rose-500/15 text-rose-200 border-rose-400/30",
    bgClass: "bg-rose-500",
    borderClass: "border-rose-400/40",
  },
  Water: {
    emoji: "💧",
    label: "Water",
    chipClass: "bg-sky-500/15 text-sky-200 border-sky-400/30",
    bgClass: "bg-sky-400",
    borderClass: "border-sky-400/40",
  },
  Earth: {
    emoji: "🌿",
    label: "Earth",
    chipClass: "bg-emerald-500/15 text-emerald-200 border-emerald-400/30",
    bgClass: "bg-emerald-500",
    borderClass: "border-emerald-400/40",
  },
  Air: {
    emoji: "💨",
    label: "Air",
    chipClass: "bg-purple-500/15 text-purple-200 border-purple-400/30",
    bgClass: "bg-purple-400",
    borderClass: "border-purple-400/40",
  },
};

export function AlchemizeMenuModal({
  restaurant,
  onClose,
}: AlchemizeMenuModalProps) {
  const { showToast } = useToast();
  const [menu, setMenu] = useState<AlchemizedRestaurantMenu | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"dishes" | "ingest">("dishes");
  const [customUrl, setCustomUrl] = useState(restaurant.websiteUrl || "");
  const [customText, setCustomText] = useState("");
  const [isIngesting, setIsIngesting] = useState(false);
  const [selectedRatingDish, setSelectedRatingDish] = useState<string | null>(null);

  // Fetch or load alchemized menu
  useEffect(() => {
    let active = true;
    setLoading(true);

    const params = new URLSearchParams({ restaurantId: restaurant.id });
    if (restaurant.websiteUrl) params.set("url", restaurant.websiteUrl);

    fetch(`/api/restaurants/alchemize-menu?${params.toString()}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (active && data?.success && data.menu) {
          setMenu(data.menu);
        }
      })
      .catch(() => {
        // network or server error handled gracefully
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [restaurant.id, restaurant.websiteUrl]);

  // Handle on-demand URL or text ingestion
  async function handleIngestMenu(e: React.FormEvent) {
    e.preventDefault();
    if (!customUrl.trim() && !customText.trim()) {
      showToast("Please enter a website URL or paste a menu.", "error");
      return;
    }

    setIsIngesting(true);
    try {
      const res = await fetch("/api/restaurants/alchemize-menu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantId: restaurant.id,
          restaurantName: restaurant.name,
          url: customUrl.trim() || undefined,
          menuText: customText.trim() || undefined,
          refresh: true,
        }),
      });

      if (!res.ok) throw new Error("Failed to alchemize menu.");
      const data = await res.json();
      if (data.success && data.menu) {
        setMenu(data.menu);
        setActiveTab("dishes");
        showToast("Menu successfully alchemized!", "success");
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Menu alchemy failed", "error");
    } finally {
      setIsIngesting(false);
    }
  }

  const sig = menu?.elementalSignature;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="alchemize-menu-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto"
    >
      <div className="relative w-full max-w-4xl my-8 rounded-3xl border border-white/10 bg-[#0d0d16] text-white p-6 sm:p-8 shadow-2xl shadow-purple-950/40">
        {/* Ambient Cosmic Lights */}
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-purple-600/15 rounded-full blur-[90px] pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-amber-500/15 rounded-full blur-[90px] pointer-events-none" />

        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-5">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-purple-500/20 to-amber-500/20 border border-purple-400/30 text-purple-200 text-[10px] font-black uppercase tracking-widest mb-2">
                <span>✦</span> Menu Alchemical Blueprint
              </div>
              <h2 id="alchemize-menu-title" className="text-xl sm:text-2xl font-black text-white">
                {restaurant.name}
              </h2>
              <p className="text-xs text-white/60 mt-1 max-w-xl">
                Deconstructed ingredient taxonomy, culinary techniques, and elemental constitution.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full bg-white/5 p-2 text-white/60 hover:bg-white/10 hover:text-white transition-colors"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 mt-5 border-b border-white/5 pb-3">
            <button
              type="button"
              onClick={() => setActiveTab("dishes")}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                activeTab === "dishes"
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-900/30"
                  : "bg-white/5 text-white/60 hover:text-white hover:bg-white/10"
              }`}
            >
              🍽️ Alchemized Dishes ({menu?.dishes.length ?? 0})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("ingest")}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                activeTab === "ingest"
                  ? "bg-amber-500 text-stone-950 font-black shadow-lg shadow-amber-900/30"
                  : "bg-white/5 text-white/60 hover:text-white hover:bg-white/10"
              }`}
            >
              ⚡ Ingest / Scrape Website Menu
            </button>
          </div>

          {loading ? (
            <div className="py-20 text-center space-y-3">
              <div className="text-3xl animate-bounce">🔮</div>
              <p className="text-sm font-semibold text-purple-200">
                Alchemizing restaurant menu &amp; extracting ingredients...
              </p>
            </div>
          ) : activeTab === "dishes" ? (
            <div className="mt-6 space-y-6">
              {/* Elemental Signature Banner */}
              {sig && (
                <div className="rounded-2xl border border-white/10 bg-gradient-to-r from-purple-950/30 via-black/40 to-[#120d1c] p-4 sm:p-5">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-purple-300">
                        Kitchen Constitutional Archetype
                      </span>
                      <h3 className="text-sm sm:text-base font-extrabold text-white mt-0.5">
                        {menu?.summary.archetype}
                      </h3>
                      <p className="text-[11px] text-white/55 mt-1">
                        Primary Technique:{" "}
                        <span className="text-amber-300 font-semibold">{menu?.summary.topTechnique}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-400/30 bg-rose-500/15 text-rose-200 text-xs font-black">
                        <span>🔥</span> {sig.Fire}%
                      </div>
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-sky-400/30 bg-sky-500/15 text-sky-200 text-xs font-black">
                        <span>💧</span> {sig.Water}%
                      </div>
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-400/30 bg-emerald-500/15 text-emerald-200 text-xs font-black">
                        <span>🌿</span> {sig.Earth}%
                      </div>
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-purple-400/30 bg-purple-500/15 text-purple-200 text-xs font-black">
                        <span>💨</span> {sig.Air}%
                      </div>
                    </div>
                  </div>

                  {/* Signature Ingredients Chips */}
                  {menu?.topIngredients && menu.topIngredients.length > 0 && (
                    <div className="mt-4 border-t border-white/10 pt-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-white/50 block mb-2">
                        Signature Kitchen Ingredients (Most Loved)
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {menu.topIngredients.map((ing) => (
                          <span
                            key={ing}
                            className="inline-flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-bold text-emerald-200"
                          >
                            <span>🌿</span> {ing}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Deconstructed Dishes Grid */}
              <div className="grid gap-4 sm:grid-cols-2 max-h-[460px] overflow-y-auto pr-2">
                {menu?.dishes.map((dish) => {
                  const elStyle = ELEMENT_STYLES[dish.dominantElement];
                  return (
                    <article
                      key={dish.id}
                      className="flex flex-col justify-between rounded-2xl border border-white/10 bg-white/[0.04] p-4 transition-all hover:border-white/20 hover:bg-white/[0.06]"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300">
                              {dish.category}
                            </span>
                            <h4 className="text-sm font-black text-white">{dish.name}</h4>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {dish.price && (
                              <span className="text-xs font-extrabold text-amber-200">{dish.price}</span>
                            )}
                            <span
                              className={`rounded-full border px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${elStyle.chipClass}`}
                            >
                              {elStyle.emoji} {dish.dominantElement}
                            </span>
                          </div>
                        </div>

                        <p className="text-xs text-white/60 leading-relaxed mb-3">{dish.description}</p>

                        {/* Ingredients Breakdown */}
                        {dish.ingredients.length > 0 && (
                          <div className="mb-2">
                            <span className="text-[10px] font-semibold text-white/40 block mb-1">
                              Highlight Ingredients:
                            </span>
                            <div className="flex flex-wrap gap-1">
                              {dish.ingredients.map((ing) => (
                                <span
                                  key={ing}
                                  className="rounded bg-black/40 border border-white/10 px-2 py-0.5 text-[10px] font-medium text-white/80"
                                >
                                  {ing}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Techniques, Textures & Dietary Tags */}
                        <div className="flex flex-wrap gap-1 mt-2">
                          {dish.techniques.map((t) => (
                            <span
                              key={t}
                              className="rounded-full bg-amber-500/10 border border-amber-400/25 px-2 py-0.5 text-[9px] font-bold text-amber-200"
                            >
                              ✨ {t}
                            </span>
                          ))}
                          {dish.textures.map((tx) => (
                            <span
                              key={tx}
                              className="rounded-full bg-sky-500/10 border border-sky-400/25 px-2 py-0.5 text-[9px] font-bold text-sky-200"
                            >
                              {tx}
                            </span>
                          ))}
                          {dish.dietaryTags.map((dt) => (
                            <span
                              key={dt}
                              className="rounded-full bg-emerald-500/10 border border-emerald-400/25 px-2 py-0.5 text-[9px] font-bold text-emerald-200"
                            >
                              {dt}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => setSelectedRatingDish(dish.name)}
                          className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] font-bold uppercase tracking-wider text-amber-200 border border-amber-400/30 flex items-center gap-1 transition-colors"
                        >
                          <span>⭐</span> Rate / Comment on Dish
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Ingest Form */
            <form onSubmit={handleIngestMenu} className="mt-6 space-y-4">
              <div className="rounded-2xl border border-white/10 bg-black/40 p-5 space-y-4">
                <div>
                  <label htmlFor="ingest-website-url" className="block text-xs font-bold uppercase tracking-wider text-amber-300 mb-1">
                    Option A: Restaurant Website or Online Menu URL
                  </label>
                  <p className="text-[11px] text-white/50 mb-2">
                    Enter the URL of the restaurant website or their menu page (Squarespace, BentoBox, Toast, Popmenu, OpenTable, etc.).
                  </p>
                  <input
                    id="ingest-website-url"
                    type="url"
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    placeholder="https://example-restaurant.com/menu"
                    className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-2.5 text-xs text-white placeholder:text-white/30 focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div className="relative flex items-center justify-center my-3">
                  <div className="h-px w-full bg-white/10" />
                  <span className="absolute bg-[#0d0d16] px-3 text-[10px] font-bold uppercase tracking-widest text-white/40">
                    OR
                  </span>
                </div>

                <div>
                  <label htmlFor="ingest-menu-text" className="block text-xs font-bold uppercase tracking-wider text-purple-300 mb-1">
                    Option B: Paste Raw Menu Text
                  </label>
                  <p className="text-[11px] text-white/50 mb-2">
                    Paste raw text from a takeout flyer, PDF, or delivery app. Our AI alchemy engine will extract the dishes, prices, and ingredients.
                  </p>
                  <textarea
                    id="ingest-menu-text"
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value)}
                    rows={6}
                    placeholder={`Starters:\nCrispy Truffle Gyoza - wagyu beef, scallions, dashi dipping sauce. $14\n\nMains:\nWood-Fired Ribeye - charred shallots, rosemary butter, sea salt. $38`}
                    className="w-full rounded-xl border border-white/10 bg-black/50 p-3 text-xs text-white placeholder:text-white/30 focus:border-purple-400 focus:outline-none font-mono"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isIngesting}
                  className="w-full rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 py-3 text-stone-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-900/30 hover:brightness-110 transition-all disabled:opacity-50"
                >
                  {isIngesting ? "Extracting & Alchemizing Menu..." : "⚡ Alchemize & Ingest This Menu"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {selectedRatingDish && (
        <RateDishModal
          restaurant={{
            id: restaurant.id,
            name: restaurant.name,
            ...(restaurant.cuisine ? { cuisine: restaurant.cuisine } : {}),
          }}
          initialDishName={selectedRatingDish}
          onClose={() => setSelectedRatingDish(null)}
        />
      )}
    </div>
  );
}
export default AlchemizeMenuModal;
