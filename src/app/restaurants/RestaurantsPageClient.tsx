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
  const orderStatus = params?.get("order") ?? "";
  const orderRestaurant = params?.get("restaurant") ?? "";
  const onboardingStatus = params?.get("onboarding") ?? "";
  const [cuisine, setCuisine] = useState(initial);
  const [draft, setDraft] = useState(initial);

  return (
    <main className="min-h-screen bg-[#08080e] text-white relative overflow-hidden">
      {/* Ambient cosmic glow */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[180px] pointer-events-none" />
      <div className="absolute top-32 right-1/4 w-[500px] h-[500px] bg-rose-600/10 rounded-full blur-[160px] pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 pt-8 pb-16">
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/cuisines"
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-white/60 hover:text-purple-300 transition-colors"
          >
            <span aria-hidden>←</span> Back to cuisines
          </Link>
          <Link
            href={
              cuisine
                ? `/recipes?cuisine=${encodeURIComponent(cuisine.toLowerCase())}`
                : "/recipes"
            }
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-400/30 text-amber-200 text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all"
          >
            <span aria-hidden>🥘</span> Cook It instead
          </Link>
        </div>

        <header className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-900/40 border border-purple-500/30 text-purple-200 text-xs font-black uppercase tracking-widest mb-5 shadow-[0_0_15px_rgba(168,85,247,0.15)]">
            <span aria-hidden>📍</span> Order It
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-pink-300 to-rose-300 leading-tight pb-1">
            Restaurants Aligned to the Moment
          </h1>
          <p className="mt-3 text-base text-white/60 max-w-2xl leading-relaxed">
            Don&apos;t feel like cooking? We&apos;ll find restaurants near you,
            ranked by their alignment to the current cosmic state.
          </p>
        </header>

        {orderStatus && (
          <div
            className={`mb-6 rounded-2xl border p-4 text-sm ${
              orderStatus === "success"
                ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-100"
                : "border-amber-400/30 bg-amber-500/10 text-amber-100"
            }`}
            role="status"
          >
            <span className="font-bold">
              {orderStatus === "success" ? "✓ " : "⚠️ "}
            </span>
            {orderStatus === "success"
              ? `Order checkout completed${orderRestaurant ? ` for ${orderRestaurant}` : ""}.`
              : `Order checkout was canceled${orderRestaurant ? ` for ${orderRestaurant}` : ""}.`}
          </div>
        )}

        {onboardingStatus && (
          <div
            className={`mb-6 rounded-2xl border p-4 text-sm ${
              onboardingStatus === "success"
                ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-100"
                : "border-amber-400/30 bg-amber-500/10 text-amber-100"
            }`}
            role="status"
          >
            {onboardingStatus === "success"
              ? "Restaurant payout onboarding submitted. Stripe will update the account status as requirements are completed."
              : "Restaurant onboarding needs to be refreshed. Reopen the onboarding link to continue."}
          </div>
        )}

        {/* Cuisine selector */}
        <section className="mb-8 rounded-3xl border border-white/10 bg-gradient-to-br from-[#0c0c14]/90 to-[#16101e]/90 backdrop-blur-xl p-6 shadow-2xl shadow-purple-900/20 relative overflow-hidden">
          <div className="absolute -top-24 -left-24 w-72 h-72 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="relative z-10">
            <h2 className="text-xs uppercase tracking-[0.2em] text-purple-200 font-black mb-4 flex items-center gap-2">
              <span aria-hidden className="text-purple-300">✦</span>
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
                className="flex-1 px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-400/40 focus:border-purple-400/50 transition-all"
              />
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-purple-900/30 hover:brightness-110 transition-all"
              >
                Search
              </button>
            </form>
            <div className="flex flex-wrap gap-2">
              {POPULAR_CUISINES.map((c) => {
                const active = cuisine.toLowerCase() === c.toLowerCase();
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => {
                      setDraft(c);
                      setCuisine(c);
                    }}
                    className={`px-3 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-wider transition-all ${
                      active
                        ? "bg-gradient-to-r from-purple-500 to-pink-500 border-pink-400/40 text-white shadow-lg shadow-purple-900/30"
                        : "bg-white/5 border-white/10 text-white/70 hover:text-white hover:border-purple-400/40 hover:bg-purple-500/10"
                    }`}
                    aria-pressed={active}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {cuisine ? (
          <RestaurantDiscovery cuisineType={cuisine} />
        ) : (
          <div className="rounded-3xl border border-dashed border-white/15 bg-white/[0.03] p-12 text-center">
            <div className="text-5xl mb-3" aria-hidden>
              🍽️
            </div>
            <p className="text-white/70 text-sm font-medium">
              Pick a cuisine above to discover restaurants near you.
            </p>
            <p className="text-white/40 text-xs mt-2">
              Or{" "}
              <Link
                href="/cuisines"
                className="text-purple-300 hover:text-purple-200 underline-offset-2 hover:underline"
              >
                explore today&apos;s cosmic cuisines
              </Link>{" "}
              to see what&apos;s aligned with the moment.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
