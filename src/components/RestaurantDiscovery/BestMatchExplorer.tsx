"use client";

/**
 * BestMatchExplorer — the live "Best Match" restaurant finder.
 *
 * Find nearby restaurants for a selected cuisine, ranked by cosmic match (with
 * rating / distance / price as the loud quality signals), sortable, with a hero
 * "Your Best Match" card and a ranked runners-up list.
 *
 * Calls GET /api/restaurants/best-match, which scores ALL providers (Google →
 * Yelp → Foursquare) uniformly so the ranking is real regardless of source.
 *
 * @file src/components/RestaurantDiscovery/BestMatchExplorer.tsx
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AddToDiaryModal } from "@/components/food-diary/AddToDiaryModal";
import { ReservationModal } from "@/components/RestaurantDiscovery/ReservationModal";
import {
  capitalize,
  cosmicContextLine,
  ELEMENT_DECORATION,
  metersToMiles,
  sourceLabel,
} from "@/components/RestaurantDiscovery/restaurantDisplay";
import { useToast } from "@/components/ToastProvider";
import { useUser } from "@/contexts/UserContext";
import {
  useUserLocation,
  type CitySuggestion,
} from "@/hooks/useUserLocation";
import type { SavedRestaurant } from "@/types/restaurant";
import type {
  AlchmScoredRestaurant,
  RestaurantDiscoverySource,
  RestaurantSearchResponse,
} from "@/types/yelp";

const POPULAR_CUISINES = [
  "Italian", "Mexican", "Japanese", "Thai", "Indian", "Mediterranean",
  "Chinese", "Korean", "American", "French", "Vietnamese", "Greek",
];

type SortKey = "match" | "distance" | "rating" | "price";

const SORTS: Array<{ key: SortKey; label: string }> = [
  { key: "match", label: "Best Match" },
  { key: "distance", label: "Distance" },
  { key: "rating", label: "Rating" },
  { key: "price", label: "Price" },
];

const RADIUS_PRESETS_MI = [1, 2.5, 5, 10];
const MI_TO_M = 1609.344;

type FetchStatus =
  | { kind: "idle" }
  | { kind: "needs-location" }
  | { kind: "loading" }
  | { kind: "ready"; data: RestaurantSearchResponse }
  | { kind: "empty"; cosmicContext: RestaurantSearchResponse["cosmicContext"] }
  | { kind: "not-configured" }
  | { kind: "error"; message: string };

interface SavedRestaurantsPrefs {
  savedRestaurants?: SavedRestaurant[];
  [k: string]: unknown;
}

export interface BestMatchExplorerProps {
  initialCuisine?: string;
  className?: string;
  /** Hide the internal title/subhead/cosmic-pill header (e.g. when embedded
   *  under a host section that supplies its own heading). Default: true. */
  showHeader?: boolean;
}

// ─── Client-side sorting (mirrors the server's sortRestaurants) ─────────────

function distanceOf(r: AlchmScoredRestaurant): number {
  const d = r.business.distance;
  return typeof d === "number" && Number.isFinite(d) ? d : Number.POSITIVE_INFINITY;
}

function priceRank(r: AlchmScoredRestaurant): number {
  const p = r.business.price;
  if (!p) return 99;
  if (p.toLowerCase() === "free") return 0;
  const m = p.match(/\$+/);
  return m ? m[0].length : 99;
}

function sortRestaurants(
  list: AlchmScoredRestaurant[],
  sort: SortKey,
): AlchmScoredRestaurant[] {
  const out = [...list];
  switch (sort) {
    case "distance":
      out.sort((a, b) => distanceOf(a) - distanceOf(b) || b.alchmScore - a.alchmScore);
      break;
    case "rating":
      out.sort(
        (a, b) =>
          (b.business.rating ?? 0) - (a.business.rating ?? 0) || b.alchmScore - a.alchmScore,
      );
      break;
    case "price":
      out.sort((a, b) => priceRank(a) - priceRank(b) || b.alchmScore - a.alchmScore);
      break;
    case "match":
    default:
      // Within one cuisine the cosmic score ties — break by rating then distance.
      out.sort(
        (a, b) =>
          b.alchmScore - a.alchmScore ||
          (b.business.rating ?? 0) - (a.business.rating ?? 0) ||
          distanceOf(a) - distanceOf(b),
      );
      break;
  }
  return out;
}

export function BestMatchExplorer({
  initialCuisine = "",
  className,
  showHeader = true,
}: BestMatchExplorerProps) {
  const [cuisine, setCuisine] = useState(initialCuisine);
  useEffect(() => {
    setCuisine(initialCuisine);
  }, [initialCuisine]);
  const [otherOpen, setOtherOpen] = useState(false);
  const [otherDraft, setOtherDraft] = useState("");
  const [sort, setSort] = useState<SortKey>("match");
  const [openNow, setOpenNow] = useState(false);
  const [radiusMi, setRadiusMi] = useState(2.5);

  const [status, setStatus] = useState<FetchStatus>({ kind: "idle" });
  const abortRef = useRef<AbortController | null>(null);

  const { location, status: locStatus, error: locError, requestBrowserLocation, setLocation, searchCity } =
    useUserLocation();

  // City search
  const [cityQuery, setCityQuery] = useState("");
  const [citySuggestions, setCitySuggestions] = useState<CitySuggestion[]>([]);
  const [cityOpen, setCityOpen] = useState(false);
  const cityDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { currentUser, updateProfile } = useUser();
  const { showToast } = useToast();
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [loggingItem, setLoggingItem] = useState<AlchmScoredRestaurant | null>(null);
  const [reservingItem, setReservingItem] = useState<AlchmScoredRestaurant | null>(null);

  // ── Saved restaurants (hydrate from profile + localStorage) ──
  useEffect(() => {
    const ids = new Set<string>();
    const prefs: SavedRestaurantsPrefs | undefined = currentUser?.preferences;
    prefs?.savedRestaurants?.forEach((r) => {
      if (r.externalId) ids.add(r.externalId);
    });
    if (typeof window !== "undefined") {
      try {
        const raw = window.localStorage.getItem("userFoodPreferences");
        if (raw) {
          const parsed = JSON.parse(raw) as SavedRestaurantsPrefs;
          parsed.savedRestaurants?.forEach((r) => {
            if (r.externalId) ids.add(r.externalId);
          });
        }
      } catch {
        // ignore
      }
    }
    setSavedIds(ids);
  }, [currentUser]);

  // ── City search (debounced) ──
  useEffect(() => {
    if (cityDebounce.current) clearTimeout(cityDebounce.current);
    if (cityQuery.trim().length < 2) {
      setCitySuggestions([]);
      return;
    }
    cityDebounce.current = setTimeout(() => {
      void (async () => {
        const results = await searchCity(cityQuery);
        setCitySuggestions(results);
        setCityOpen(true);
      })();
    }, 350);
    return () => {
      if (cityDebounce.current) clearTimeout(cityDebounce.current);
    };
  }, [cityQuery, searchCity]);

  // ── Fetch best matches when inputs change ──
  useEffect(() => {
    if (!cuisine.trim()) {
      setStatus({ kind: "idle" });
      return;
    }
    if (!location) {
      setStatus({ kind: "needs-location" });
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setStatus({ kind: "loading" });

    void (async () => {
      try {
        const params = new URLSearchParams({
          cuisine,
          lat: String(location.lat),
          lng: String(location.lng),
          radius: String(Math.round(radiusMi * MI_TO_M)),
        });
        if (openNow) params.set("openNow", "true");

        const res = await fetch(`/api/restaurants/best-match?${params.toString()}`, {
          signal: controller.signal,
        });
        if (!res.ok && res.status !== 200) {
          setStatus({ kind: "error", message: `Server error (${res.status})` });
          return;
        }
        const data = (await res.json()) as RestaurantSearchResponse;

        if (data.error === "Restaurant discovery is not configured.") {
          setStatus({ kind: "not-configured" });
          return;
        }
        if (data.error) {
          setStatus({ kind: "error", message: data.error });
          return;
        }
        if (!data.restaurants || data.restaurants.length === 0) {
          setStatus({ kind: "empty", cosmicContext: data.cosmicContext });
          return;
        }
        setStatus({ kind: "ready", data });
      } catch (err) {
        if (controller.signal.aborted) return;
        setStatus({
          kind: "error",
          message: err instanceof Error ? err.message : "Failed to fetch restaurants.",
        });
      }
    })();

    return () => controller.abort();
  }, [cuisine, location, radiusMi, openNow]);

  const saveRestaurant = useCallback(
    async (entry: AlchmScoredRestaurant, source: RestaurantDiscoverySource) => {
      const { business } = entry;
      if (savedIds.has(business.id)) return;

      const restaurant: SavedRestaurant = {
        id: `${source}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
        name: business.name,
        cuisine: business.categories[0]?.title || cuisine || "Restaurant",
        location:
          [business.location.city, business.location.state].filter(Boolean).join(", ") ||
          undefined,
        address:
          business.location.display_address.join(", ") ||
          business.location.address1 ||
          undefined,
        menuItems: [],
        rating: business.rating,
        source,
        externalId: business.id,
        url: business.url,
        addedAt: new Date().toISOString(),
      };

      setSavedIds((prev) => new Set(prev).add(business.id));

      if (currentUser?.userId) {
        const currentPrefs: SavedRestaurantsPrefs = currentUser.preferences ?? {};
        const newSaved = [...(currentPrefs.savedRestaurants ?? []), restaurant];
        try {
          await updateProfile({
            preferences: { ...currentPrefs, savedRestaurants: newSaved },
          });
        } catch (err) {
          setSavedIds((prev) => {
            const next = new Set(prev);
            next.delete(business.id);
            return next;
          });
          showToast(
            err instanceof Error ? err.message : "Failed to save restaurant",
            "error",
          );
          return;
        }
      }

      if (typeof window !== "undefined") {
        try {
          const raw = window.localStorage.getItem("userFoodPreferences");
          const parsed: SavedRestaurantsPrefs = raw
            ? (JSON.parse(raw) as SavedRestaurantsPrefs)
            : {};
          parsed.savedRestaurants = [...(parsed.savedRestaurants ?? []), restaurant];
          window.localStorage.setItem("userFoodPreferences", JSON.stringify(parsed));
        } catch {
          // ignore
        }
      }

      showToast(`Saved ${business.name} to your restaurants`, "success");
    },
    [cuisine, currentUser, savedIds, showToast, updateProfile],
  );

  const selectCity = useCallback(
    (c: CitySuggestion) => {
      const primary = c.displayName.split(",")[0]?.trim() || c.displayName;
      setLocation({ lat: c.latitude, lng: c.longitude, label: primary });
      setCityQuery("");
      setCitySuggestions([]);
      setCityOpen(false);
    },
    [setLocation],
  );

  const ranked = useMemo(() => {
    if (status.kind !== "ready") return [];
    return sortRestaurants(status.data.restaurants, sort);
  }, [status, sort]);

  const cosmicLine = useMemo(() => {
    if (status.kind !== "ready" && status.kind !== "empty") return null;
    const ctx = status.kind === "ready" ? status.data.cosmicContext : status.cosmicContext;
    return cosmicContextLine(ctx);
  }, [status]);

  const source: RestaurantDiscoverySource =
    status.kind === "ready" ? status.data.source ?? "google" : "google";

  const hero = ranked[0];
  const runnersUp = ranked.slice(1);

  return (
    <div className={className}>
      {/* Header */}
      {showHeader && (
        <header className="mb-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-300/80 mb-2">
                Alchm Kitchen · Discover
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold leading-tight">
                Find your{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-pink-300 to-amber-300">
                  Best Match
                </span>
              </h1>
              <p className="mt-2 text-sm text-white/55 max-w-xl">
                {cuisine
                  ? `The best ${capitalize(cuisine)} near you, ranked for this moment.`
                  : "Pick a cuisine and we'll rank the best spots near you."}
              </p>
            </div>
            {cosmicLine && (
              <div className="shrink-0 inline-flex items-center gap-2 rounded-full border border-purple-400/30 bg-purple-500/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-purple-200">
                <span aria-hidden>✦</span>
                {cosmicLine}
              </div>
            )}
          </div>
        </header>
      )}

      {/* Control bar */}
      <section className="mb-8 rounded-3xl border border-white/10 bg-gradient-to-br from-[#0c0c14]/90 to-[#16101e]/90 backdrop-blur-xl p-5 shadow-2xl shadow-purple-900/20 relative overflow-hidden">
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="relative z-10 space-y-4">
          {/* Cuisine pills */}
          <div className="flex flex-wrap gap-2">
            {POPULAR_CUISINES.map((c) => {
              const active = cuisine.toLowerCase() === c.toLowerCase();
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => {
                    setOtherOpen(false);
                    setCuisine(c);
                  }}
                  aria-pressed={active}
                  className={`px-3 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-wider transition-all ${
                    active
                      ? "bg-gradient-to-r from-purple-500 to-pink-500 border-pink-400/40 text-white shadow-lg shadow-purple-900/30"
                      : "bg-white/5 border-white/10 text-white/70 hover:text-white hover:border-purple-400/40 hover:bg-purple-500/10"
                  }`}
                >
                  {c}
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => setOtherOpen((v) => !v)}
              className="px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-white/70 text-[10px] font-black uppercase tracking-wider hover:border-purple-400/40 hover:bg-purple-500/10 transition-all"
            >
              ＋ Other
            </button>
          </div>

          {otherOpen && (
            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                if (otherDraft.trim()) setCuisine(otherDraft.trim());
              }}
            >
              <input
                type="text"
                value={otherDraft}
                onChange={(e) => setOtherDraft(e.target.value)}
                placeholder="e.g. Ethiopian, Peruvian, BBQ…"
                className="flex-1 px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400/40 focus:border-purple-400/50 transition-all"
              />
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-purple-900/30 hover:brightness-110 transition-all"
              >
                Search
              </button>
            </form>
          )}

          <div className="h-px bg-white/10" />

          {/* Location + radius */}
          <div className="flex flex-wrap items-center gap-3">
            {location ? (
              <div className="inline-flex items-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-3 py-2 text-xs font-bold text-emerald-100">
                <span aria-hidden>📍</span>
                {location.label ?? "Your location"}
                <button
                  type="button"
                  onClick={() => setLocation(null)}
                  className="ml-1 text-emerald-300/70 hover:text-emerald-100"
                  aria-label="Change location"
                >
                  ✕
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={requestBrowserLocation}
                disabled={locStatus === "locating"}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-purple-900/30 hover:brightness-110 transition-all disabled:opacity-60"
              >
                <span aria-hidden>📍</span>
                {locStatus === "locating" ? "Locating…" : "Use my location"}
              </button>
            )}

            {/* City search */}
            <div className="relative flex-1 min-w-[180px]">
              <input
                type="text"
                value={cityQuery}
                onChange={(e) => setCityQuery(e.target.value)}
                onFocus={() => citySuggestions.length > 0 && setCityOpen(true)}
                placeholder="Or enter a city…"
                className="w-full px-4 py-2 rounded-xl bg-black/40 border border-white/10 text-white placeholder-white/30 text-xs focus:outline-none focus:ring-2 focus:ring-purple-400/40 focus:border-purple-400/50 transition-all"
              />
              {cityOpen && citySuggestions.length > 0 && (
                <ul className="absolute z-30 mt-1 w-full max-h-60 overflow-auto rounded-xl border border-white/10 bg-[#15121f] shadow-2xl shadow-black/50">
                  {citySuggestions.map((c, i) => (
                    <li key={`${c.latitude}-${c.longitude}-${i}`}>
                      <button
                        type="button"
                        onClick={() => selectCity(c)}
                        className="block w-full text-left px-3 py-2 text-xs text-white/80 hover:bg-purple-500/15 transition-colors truncate"
                      >
                        {c.displayName}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Radius */}
            <div className="inline-flex items-center gap-1 rounded-xl border border-white/10 bg-black/30 p-1">
              {RADIUS_PRESETS_MI.map((mi) => (
                <button
                  key={mi}
                  type="button"
                  onClick={() => setRadiusMi(mi)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors ${
                    radiusMi === mi
                      ? "bg-purple-500/30 text-purple-100"
                      : "text-white/50 hover:text-white/80"
                  }`}
                >
                  {mi} mi
                </button>
              ))}
            </div>
          </div>

          {locError && <p className="text-[11px] text-rose-300">{locError}</p>}

          <div className="h-px bg-white/10" />

          {/* Sort + open now */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center gap-1 rounded-xl border border-white/10 bg-black/30 p-1">
              {SORTS.map((s) => (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => setSort(s.key)}
                  aria-pressed={sort === s.key}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors ${
                    sort === s.key
                      ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow shadow-purple-900/30"
                      : "text-white/50 hover:text-white/80"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setOpenNow((v) => !v)}
              aria-pressed={openNow}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-wider transition-all ${
                openNow
                  ? "border-emerald-400/40 bg-emerald-500/15 text-emerald-200"
                  : "border-white/10 bg-white/5 text-white/60 hover:text-white/80"
              }`}
            >
              <span aria-hidden>{openNow ? "🟢" : "○"}</span> Open now
            </button>
          </div>
        </div>
      </section>

      {/* Results */}
      {status.kind === "idle" && (
        <EmptyState
          emoji="🍽️"
          title="Pick a cuisine to begin"
          subtitle="Choose a cuisine above and we'll rank the best matches near you."
        />
      )}

      {status.kind === "needs-location" && (
        <div className="rounded-3xl border border-white/10 bg-black/30 p-10 text-center">
          <div className="text-4xl mb-3" aria-hidden>📍</div>
          <p className="text-sm text-white/70 mb-4">
            Enable location to find {cuisine ? capitalize(cuisine) : "matching"} restaurants near you.
          </p>
          <button
            type="button"
            onClick={requestBrowserLocation}
            className="px-5 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-lg shadow-purple-900/30 hover:brightness-110 transition-all"
          >
            Use my location
          </button>
          <p className="text-[11px] text-white/40 mt-3">…or enter a city in the bar above.</p>
        </div>
      )}

      {status.kind === "loading" && (
        <div className="space-y-3" aria-busy="true">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="animate-pulse flex gap-4 p-4 rounded-2xl bg-black/30 border border-white/5"
            >
              <div className="h-16 w-16 rounded-xl bg-white/10 shrink-0" />
              <div className="flex-1 space-y-3 py-1">
                <div className="h-4 bg-white/10 rounded w-2/3" />
                <div className="h-2.5 bg-white/10 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      )}

      {status.kind === "not-configured" && (
        <div className="rounded-2xl bg-black/30 border border-white/10 p-5 text-sm text-white/70 leading-snug">
          Restaurant discovery isn&apos;t configured yet. Add a{" "}
          <code className="font-mono bg-white/10 text-purple-200 px-1 rounded">
            GOOGLE_PLACES_API_KEY
          </code>{" "}
          or <code className="font-mono bg-white/10 text-purple-200 px-1 rounded">YELP_API_KEY</code>{" "}
          so we can find restaurants for you.
        </div>
      )}

      {status.kind === "error" && (
        <div className="rounded-2xl bg-rose-500/10 border border-rose-400/30 p-4 text-sm text-rose-200">
          ⚠️ {status.message}
        </div>
      )}

      {status.kind === "empty" && (
        <EmptyState
          emoji="🍽️"
          title={`No ${cuisine ? capitalize(cuisine) : ""} spots found nearby`}
          subtitle="Try a wider radius or a different cuisine."
        />
      )}

      {status.kind === "ready" && hero && (
        <div className="space-y-6">
          {status.data.sourceNotice && (
            <div className="rounded-xl border border-purple-400/30 bg-purple-500/10 p-3 text-[11px] text-purple-100 leading-snug">
              ✦ {status.data.sourceNotice}
            </div>
          )}

          {/* Hero — Your Best Match */}
          <HeroCard
            entry={hero}
            source={source}
            cuisine={cuisine}
            saved={savedIds.has(hero.business.id)}
            onReserve={() => setReservingItem(hero)}
            onSave={() => void saveRestaurant(hero, source)}
            onLog={() => setLoggingItem(hero)}
          />

          {/* Runners-up */}
          {runnersUp.length > 0 && (
            <section>
              <div className="flex items-end justify-between mb-3 border-b border-white/10 pb-2">
                <h3 className="text-sm font-black uppercase tracking-[0.18em] text-white/70">
                  Other matches
                </h3>
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/30">
                  {runnersUp.length} result{runnersUp.length === 1 ? "" : "s"}
                </span>
              </div>
              <ul className="space-y-3">
                {runnersUp.map((entry) => (
                  <RestaurantRow
                    key={entry.business.id}
                    entry={entry}
                    source={source}
                    saved={savedIds.has(entry.business.id)}
                    onReserve={() => setReservingItem(entry)}
                    onSave={() => void saveRestaurant(entry, source)}
                    onLog={() => setLoggingItem(entry)}
                  />
                ))}
              </ul>
            </section>
          )}

          {/* Footer cosmic line + attribution */}
          {cosmicLine && (
            <p className="mt-6 text-[10px] text-purple-300/60 font-bold uppercase tracking-[0.2em] text-center">
              Aligned to {cosmicLine}
            </p>
          )}
          {source === "tripadvisor" ? (
            <p className="text-[10px] text-white/40 text-center font-bold">
              Ratings &amp; reviews{" "}
              <a
                href="https://www.tripadvisor.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-300/80 hover:text-emerald-200 underline underline-offset-2"
              >
                Powered by Tripadvisor
              </a>
            </p>
          ) : (
            <p className="text-[9px] text-white/30 text-center uppercase tracking-widest font-bold">
              Data source: {sourceLabel(source)}
            </p>
          )}
        </div>
      )}

      {loggingItem && (
        <AddToDiaryModal
          item={loggingItem}
          itemType="restaurant"
          onClose={() => setLoggingItem(null)}
        />
      )}
      {reservingItem && (
        <ReservationModal
          entry={reservingItem}
          source={source}
          cuisineType={cuisine}
          onClose={() => setReservingItem(null)}
        />
      )}
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function EmptyState({
  emoji,
  title,
  subtitle,
}: {
  emoji: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="rounded-3xl border border-dashed border-white/15 bg-white/[0.03] p-12 text-center">
      <div className="text-5xl mb-3" aria-hidden>{emoji}</div>
      <p className="text-white/70 text-sm font-bold">{title}</p>
      <p className="text-white/40 text-xs mt-2">{subtitle}</p>
    </div>
  );
}

function QualityMeta({ entry }: { entry: AlchmScoredRestaurant }) {
  const { business } = entry;
  const distance = metersToMiles(business.distance);
  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-white/50 font-medium">
      {entry.ratingImageUrl ? (
        // Tripadvisor's terms require displaying their official rating graphic
        // (not our own stars).
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={entry.ratingImageUrl}
          alt={
            typeof business.rating === "number"
              ? `${business.rating.toFixed(1)} of 5 bubbles on Tripadvisor`
              : "Tripadvisor rating"
          }
          className="h-3.5 w-auto"
          loading="lazy"
        />
      ) : (
        typeof business.rating === "number" &&
        business.rating > 0 && (
          <span className="text-amber-300 font-bold">★ {business.rating.toFixed(1)}</span>
        )
      )}
      {business.review_count > 0 && (
        <span>({business.review_count.toLocaleString()})</span>
      )}
      {business.price && <span className="text-emerald-300 font-black">{business.price}</span>}
      {distance && <span>· {distance}</span>}
      {entry.cuisineLabel && <span className="text-purple-300/70">· {entry.cuisineLabel}</span>}
    </div>
  );
}

function MatchRing({ score }: { score: number }) {
  const pct = Math.round(score * 100);
  const r = 30;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - score);
  return (
    <div className="relative w-20 h-20 shrink-0">
      <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 72 72">
        <circle cx="36" cy="36" r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="5" />
        <circle
          cx="36"
          cy="36"
          r={r}
          fill="none"
          stroke="url(#matchGrad)"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
        />
        <defs>
          <linearGradient id="matchGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#c084fc" />
            <stop offset="100%" stopColor="#fbbf24" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-base font-black text-white leading-none">{pct}%</span>
        <span className="text-[7px] font-bold uppercase tracking-wider text-purple-300/70 mt-0.5">
          ✦ Match
        </span>
      </div>
    </div>
  );
}

interface CardActionsProps {
  entry: AlchmScoredRestaurant;
  saved: boolean;
  onReserve: () => void;
  onSave: () => void;
  onLog: () => void;
}

function CardActions({ entry, saved, onReserve, onSave, onLog }: CardActionsProps) {
  const { business } = entry;
  const isPartner = entry.isPartner === true;
  return (
    <div className="flex flex-row sm:flex-col gap-2 w-full sm:w-auto shrink-0">
      {isPartner && entry.partnerRestaurantId ? (
        <a
          href={`/restaurants/${encodeURIComponent(entry.partnerRestaurantId)}/menu`}
          className="flex-1 sm:w-32 px-3 py-2 text-white text-[10px] font-black uppercase tracking-widest rounded-lg text-center bg-gradient-to-r from-emerald-500 to-emerald-600 hover:brightness-110 shadow-lg shadow-emerald-900/30 transition-all"
        >
          Order Now
        </a>
      ) : (
        <button
          type="button"
          onClick={onReserve}
          className="flex-1 sm:w-32 px-3 py-2 text-white text-[10px] font-black uppercase tracking-widest rounded-lg text-center bg-gradient-to-r from-purple-500 to-pink-500 hover:brightness-110 shadow-lg shadow-purple-900/30 transition-all"
        >
          Reserve
        </button>
      )}
      <div className="flex gap-2 flex-1 sm:w-32">
        <a
          href={business.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 px-2 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest text-center bg-white/5 text-white/80 border border-white/10 hover:bg-white/10 transition-colors"
        >
          Menu
        </a>
        <button
          type="button"
          onClick={onSave}
          disabled={saved}
          className={`px-2 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
            saved
              ? "bg-emerald-500/15 text-emerald-200 border border-emerald-400/30 cursor-default"
              : "bg-white/5 text-purple-200 border border-purple-400/30 hover:bg-purple-500/15"
          }`}
          title={saved ? "Saved" : "Save restaurant"}
          aria-label={saved ? "Saved" : "Save restaurant"}
        >
          {saved ? "✓" : "♡"}
        </button>
        <button
          type="button"
          onClick={onLog}
          className="px-3 py-2 bg-white/5 text-white/80 border border-white/10 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-colors"
          title="Log to Food Diary"
          aria-label="Log to Food Diary"
        >
          +
        </button>
      </div>
    </div>
  );
}

interface CardProps extends CardActionsProps {
  source: RestaurantDiscoverySource;
  cuisine?: string;
}

function HeroCard({ entry, saved, onReserve, onSave, onLog }: CardProps) {
  const { business } = entry;
  const decoration = ELEMENT_DECORATION[entry.dominantElement];
  const hasScore = entry.alchmScore > 0;
  const isPartner = entry.isPartner === true;
  const reason = entry.matchReasons[0];

  return (
    <section
      className={`relative overflow-hidden rounded-3xl border bg-gradient-to-br from-[#0c0c14]/90 to-[#16101e]/90 backdrop-blur-xl p-6 shadow-2xl shadow-purple-900/30 ${
        isPartner ? "border-emerald-400/40 ring-1 ring-emerald-400/20" : "border-purple-400/30"
      }`}
    >
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-purple-600/15 rounded-full blur-[100px] pointer-events-none" />
      <div className="relative z-10 flex flex-col sm:flex-row gap-5">
        {hasScore && <MatchRing score={entry.alchmScore} />}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-purple-300/80">
              Your Best Match
            </span>
            {isPartner && (
              <span className="rounded-full border border-emerald-400/30 bg-emerald-500/15 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-emerald-200">
                Partner
              </span>
            )}
          </div>
          <h2 className="text-2xl font-extrabold text-white truncate">{business.name}</h2>
          <div className="mt-2">
            <QualityMeta entry={entry} />
          </div>
          <div className="mt-2 flex items-center gap-2 flex-wrap">
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-black uppercase tracking-wider ${decoration.chipClass}`}
            >
              <span aria-hidden>{decoration.emoji}</span>
              {decoration.label}
            </span>
            {reason && (
              <span className="text-[11px] text-white/55 italic border-l-2 border-purple-400/40 pl-2">
                {reason}
              </span>
            )}
          </div>
        </div>
        <div className="sm:w-36 shrink-0">
          <CardActions
            entry={entry}
            saved={saved}
            onReserve={onReserve}
            onSave={onSave}
            onLog={onLog}
          />
        </div>
      </div>
    </section>
  );
}

function RestaurantRow({ entry, source, saved, onReserve, onSave, onLog }: CardProps) {
  const { business } = entry;
  const decoration = ELEMENT_DECORATION[entry.dominantElement];
  const hasScore = entry.alchmScore > 0;
  const isPartner = entry.isPartner === true;
  const scorePct = Math.round(entry.alchmScore * 100);

  return (
    <li
      className={`flex flex-col sm:flex-row items-start gap-4 p-4 rounded-2xl bg-black/40 border backdrop-blur-sm transition-all hover:bg-black/50 ${
        isPartner ? "border-emerald-400/40 ring-1 ring-emerald-400/20" : "border-white/10"
      }`}
    >
      {/* Score / source badge */}
      <div className="flex sm:flex-col items-center gap-2 sm:gap-1.5 shrink-0">
        {hasScore ? (
          <>
            <div className="px-3 py-1.5 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 text-white text-xs font-black shadow-lg shadow-purple-900/40">
              {scorePct}% <span aria-hidden>✦</span>
            </div>
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-black uppercase tracking-wider ${decoration.chipClass}`}
            >
              <span aria-hidden>{decoration.emoji}</span>
              {decoration.label}
            </span>
          </>
        ) : (
          <div className="px-2 py-1 rounded-md bg-purple-500/15 text-purple-200 text-[10px] font-bold border border-purple-400/30 uppercase tracking-wider">
            {sourceLabel(source)}
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-sm font-black text-white truncate">{business.name}</h4>
          {isPartner && (
            <span className="shrink-0 rounded-full border border-emerald-400/30 bg-emerald-500/15 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-emerald-200">
              Partner
            </span>
          )}
        </div>
        <div className="mt-1">
          <QualityMeta entry={entry} />
        </div>
        {hasScore && entry.matchReasons.length > 0 && (
          <ul className="mt-2 space-y-1 border-l-2 border-purple-400/30 pl-3">
            {entry.matchReasons.slice(0, 2).map((reason, i) => (
              <li key={i} className="text-[10px] text-white/60 font-medium leading-relaxed italic">
                {reason}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Actions */}
      <div className="w-full sm:w-36 shrink-0">
        <CardActions
          entry={entry}
          saved={saved}
          onReserve={onReserve}
          onSave={onSave}
          onLog={onLog}
        />
      </div>
    </li>
  );
}

export default BestMatchExplorer;
