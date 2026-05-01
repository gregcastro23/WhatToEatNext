"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { RestaurantDiscovery } from "@/components/RestaurantDiscovery/RestaurantDiscovery";

const POPULAR_CUISINES = [
  "Italian",
  "Mexican",
  "Japanese",
  "Chinese",
  "Indian",
  "Thai",
  "French",
  "Mediterranean",
  "Middle-Eastern",
  "Korean",
  "Vietnamese",
  "American",
  "African",
  "Greek",
];

export default function RestaurantsPageClient() {
  const params = useSearchParams();
  const initial = params?.get("cuisine") ?? "";
  const [cuisine, setCuisine] = useState(initial);
  const [draft, setDraft] = useState(initial);

  return (
    <main className="min-h-screen bg-[#08080e] text-white">
      <div className="max-w-4xl mx-auto px-4 pt-8 pb-16">
        <Link
          href="/cuisines"
          className="inline-flex items-center gap-1 text-sm text-white/60 hover:text-orange-300 transition-colors mb-6"
        >
          ← Back to cuisines
        </Link>

        <header className="mb-8">
          <h1 className="text-3xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-rose-300 via-orange-300 to-amber-300 leading-tight pb-1">
            Explore Local Restaurants
          </h1>
          <p className="mt-3 text-base text-white/60 max-w-2xl">
            Don&apos;t feel like cooking? We&apos;ll find restaurants near you,
            ranked by their alignment to the current cosmic moment.
          </p>
        </header>

        {/* Cuisine selector */}
        <section className="mb-8 rounded-2xl border border-white/10 bg-white/5 p-5">
          <h2 className="text-sm uppercase tracking-wider text-white/60 font-semibold mb-3">
            What do you feel like?
          </h2>
          <form
            className="flex flex-col sm:flex-row gap-2 mb-4"
            onSubmit={(e) => {
              e.preventDefault();
              setCuisine(draft.trim());
            }}
          >
            <input
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="e.g. Italian, Thai, Japanese…"
              className="flex-1 px-4 py-2.5 rounded-lg bg-black/30 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-orange-400"
            />
            <button
              type="submit"
              className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-rose-500 to-orange-500 text-white font-bold text-sm hover:from-rose-400 hover:to-orange-400 transition-all"
            >
              Search
            </button>
          </form>
          <div className="flex flex-wrap gap-2">
            {POPULAR_CUISINES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => {
                  setDraft(c);
                  setCuisine(c);
                }}
                className={`px-3 py-1.5 rounded-full border text-xs font-semibold transition-all ${
                  cuisine.toLowerCase() === c.toLowerCase()
                    ? "bg-orange-500 border-orange-400 text-white"
                    : "bg-white/5 border-white/10 text-white/70 hover:text-white hover:border-orange-400/40"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </section>

        {cuisine ? (
          <RestaurantDiscovery cuisineType={cuisine} className="!bg-white/5 !border-white/10" />
        ) : (
          <div className="rounded-2xl border border-dashed border-white/15 bg-white/5 p-10 text-center">
            <div className="text-5xl mb-3" aria-hidden>
              🍽️
            </div>
            <p className="text-white/70 text-sm">
              Pick a cuisine above to discover restaurants near you.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
