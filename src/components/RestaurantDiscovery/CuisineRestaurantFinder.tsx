"use client";

/**
 * CuisineRestaurantFinder — Dedicated restaurant search for the Cuisines page.
 *
 * Fetches alchm-scored restaurants from /api/restaurants/discover using
 * Google Places (New) under the hood.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AddToDiaryModal } from "@/components/food-diary/AddToDiaryModal";
import { useToast } from "@/components/ToastProvider";
import { useUser } from "@/contexts/UserContext";
import type { SavedRestaurant } from "@/types/restaurant";
import type {
  AlchmScoredRestaurant,
  RestaurantDiscoverySource,
  RestaurantSearchResponse,
} from "@/types/yelp";

interface CuisineRestaurantFinderProps {
  initialCuisineType?: string;
  userLatitude?: number;
  userLongitude?: number;
  className?: string;
}

type FetchStatus =
  | { kind: "idle" }
  | { kind: "needs-location" }
  | { kind: "loading" }
  | { kind: "ready"; data: RestaurantSearchResponse }
  | { kind: "empty"; cosmicContext: RestaurantSearchResponse["cosmicContext"] }
  | { kind: "not-configured" }
  | { kind: "error"; message: string };

const ELEMENT_DECORATION: Record<
  AlchmScoredRestaurant["dominantElement"],
  { emoji: string; label: string; chipClass: string }
> = {
  Fire:  { emoji: "🔥", label: "Fire",  chipClass: "bg-rose-100 text-rose-700 border-rose-200" },
  Water: { emoji: "💧", label: "Water", chipClass: "bg-blue-100 text-blue-700 border-blue-200" },
  Earth: { emoji: "🌿", label: "Earth", chipClass: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  Air:   { emoji: "💨", label: "Air",   chipClass: "bg-sky-100 text-sky-700 border-sky-200" },
};

const ZODIAC_GLYPH: Record<string, string> = {
  aries: "♈", taurus: "♉", gemini: "♊", cancer: "♋",
  leo: "♌",  virgo: "♍",  libra: "♎",  scorpio: "♏",
  sagittarius: "♐", capricorn: "♑", aquarius: "♒", pisces: "♓",
};

const PLANET_GLYPH: Record<string, string> = {
  Sun: "☉", Moon: "☽", Mercury: "☿", Venus: "♀", Mars: "♂",
  Jupiter: "♃", Saturn: "♄", Uranus: "♅", Neptune: "♆", Pluto: "♇",
};

function metersToMiles(meters?: number): string | null {
  if (typeof meters !== "number" || !Number.isFinite(meters)) return null;
  const miles = meters / 1609.344;
  return miles < 0.1 ? "<0.1 mi" : `${miles.toFixed(1)} mi`;
}

function capitalize(s: string): string {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

interface SavedRestaurantsPrefs {
  savedRestaurants?: SavedRestaurant[];
  [k: string]: unknown;
}

function sourceLabel(source: RestaurantDiscoverySource | undefined): string {
  switch (source) {
    case "foursquare":
      return "Foursquare";
    case "google":
      return "Google Places";
    case "olo":
      return "Olo";
    case "yelp":
    default:
      return "Yelp";
  }
}

export function CuisineRestaurantFinder({
  initialCuisineType = "",
  userLatitude,
  userLongitude,
  className,
}: CuisineRestaurantFinderProps) {
  const [status, setStatus] = useState<FetchStatus>({ kind: "idle" });
  const [cuisineType, setCuisineType] = useState(initialCuisineType);
  const [searchInput, setSearchInput] = useState(initialCuisineType);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    typeof userLatitude === "number" && typeof userLongitude === "number"
      ? { lat: userLatitude, lng: userLongitude }
      : null,
  );
  const [locationError, setLocationError] = useState<string | null>(null);
  const [loggingItem, setLoggingItem] = useState<AlchmScoredRestaurant | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const { currentUser, updateProfile } = useUser();
  const { showToast } = useToast();

  const saveRestaurant = useCallback(
    async (entry: AlchmScoredRestaurant, source: RestaurantDiscoverySource) => {
      const { business } = entry;
      if (savedIds.has(business.id)) return;

      const restaurant: SavedRestaurant = {
        id: business.id,
        name: business.name,
        cuisine: cuisineType || "General",
        menuItems: [],
        source,
        externalId: business.id,
        url: business.url,
        addedAt: new Date().toISOString(),
      };

      // Optimistic UI
      setSavedIds((prev) => {
        const next = new Set(prev);
        next.add(business.id);
        return next;
      });

      // Persist to user profile when logged in.
      if (currentUser?.userId) {
        const currentPrefs: SavedRestaurantsPrefs =
          currentUser.preferences ?? {};
        const newSaved = [...(currentPrefs.savedRestaurants ?? []), restaurant];
        try {
          await updateProfile({
            preferences: { ...currentPrefs, savedRestaurants: newSaved },
          });
        } catch (err) {
          // Roll back optimistic state on failure
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

      // Always also write to localStorage so anon users + ProfilePage fallback see it.
      if (typeof window !== "undefined") {
        try {
          const raw = window.localStorage.getItem("userFoodPreferences");
          const parsed: SavedRestaurantsPrefs = raw
            ? (JSON.parse(raw) as SavedRestaurantsPrefs)
            : {};
          parsed.savedRestaurants = [
            ...(parsed.savedRestaurants ?? []),
            restaurant,
          ];
          window.localStorage.setItem(
            "userFoodPreferences",
            JSON.stringify(parsed),
          );
        } catch {
          // ignore quota / parse errors
        }
      }

      showToast(`Saved ${business.name} to your restaurants`, "success");
    },
    [currentUser, cuisineType, savedIds, showToast, updateProfile],
  );

  // Sync coords when parent provides them
  useEffect(() => {
    if (
      typeof userLatitude === "number" &&
      typeof userLongitude === "number" &&
      Number.isFinite(userLatitude) &&
      Number.isFinite(userLongitude)
    ) {
      setCoords({ lat: userLatitude, lng: userLongitude });
    }
  }, [userLatitude, userLongitude]);

  const requestLocation = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setLocationError("Location services are unavailable in this browser.");
      return;
    }
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      (err) => {
        setLocationError(
          err.code === err.PERMISSION_DENIED
            ? "Location permission denied. Enable it in your browser to discover restaurants."
            : "Couldn't read your location. Please try again.",
        );
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 5 * 60 * 1000 },
    );
  }, []);

  // Fetch when we have both cuisine + coords
  useEffect(() => {
    if (!cuisineType.trim()) {
      setStatus({ kind: "idle" });
      return;
    }
    if (!coords) {
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
          cuisine: cuisineType,
          lat: String(coords.lat),
          lng: String(coords.lng),
        });
        const res = await fetch(`/api/restaurants/discover?${params.toString()}`, {
          signal: controller.signal,
        });

        if (!res.ok) {
          setStatus({ kind: "error", message: `Server error (${res.status})` });
          return;
        }

        const data = (await res.json()) as RestaurantSearchResponse;

        if (
          data.error === "Yelp integration not configured" ||
          data.error === "Restaurant discovery is not configured." ||
          data.error === "Google Places integration is not configured."
        ) {
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
  }, [cuisineType, coords]);

  const cosmicLine = useMemo(() => {
    if (status.kind !== "ready" && status.kind !== "empty") return null;
    const ctx = status.kind === "ready" ? status.data.cosmicContext : status.cosmicContext;
    if (!ctx.currentZodiac && !ctx.planetaryHour && !ctx.dominantElement) return null;
    const parts: string[] = [];
    if (ctx.currentZodiac) {
      const glyph = ZODIAC_GLYPH[ctx.currentZodiac.toLowerCase()] ?? "";
      parts.push(`${capitalize(ctx.currentZodiac)} ${glyph}`.trim());
    }
    if (ctx.planetaryHour) {
      const glyph = PLANET_GLYPH[ctx.planetaryHour] ?? "";
      parts.push(`${ctx.planetaryHour} Hour ${glyph}`.trim());
    }
    if (ctx.dominantElement) {
      parts.push(`${ctx.dominantElement} dominant`);
    }
    return parts.join(" · ");
  }, [status]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCuisineType(searchInput);
  };

  return (
    <section
      className={`mt-4 rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50 to-rose-50 p-4 ${
        className ?? ""
      }`}
      aria-label="Restaurant discovery"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-sm font-extrabold text-amber-900 flex items-center gap-2">
            <span aria-hidden>✦</span>
            Order it — Restaurants Aligned to the Moment
          </h3>
          <p className="text-[11px] text-amber-700/80 mt-0.5">
            {cuisineType ? `${cuisineType} cuisine, scored by current cosmic state` : "Search for a cuisine to discover restaurants near you."}
          </p>
        </div>
        
        <form onSubmit={handleSearch} className="flex w-full md:w-auto gap-2">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search cuisine..."
            className="flex-1 md:w-48 px-3 py-1.5 text-xs rounded-lg border border-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30 bg-white/80 text-amber-950"
          />
          <button
            type="submit"
            className="px-3 py-1.5 bg-amber-600 text-white text-xs font-bold rounded-lg hover:bg-amber-700 transition-colors"
          >
            Find
          </button>
        </form>
      </div>

      {/* Body */}
      {status.kind === "needs-location" && (
        <div className="rounded-lg bg-white/60 border border-amber-200 p-6 text-center">
          <div className="text-2xl mb-3">📍</div>
          <p className="text-xs text-amber-900 mb-4">
            Enable location to discover {cuisineType || "matching"} restaurants near you.
          </p>
          <button
            type="button"
            onClick={requestLocation}
            className="px-4 py-2 bg-amber-600 text-white text-xs font-bold rounded-xl hover:bg-amber-700 transition-colors shadow-sm"
          >
            Use my location
          </button>
          {locationError && (
            <p className="text-[11px] text-rose-600 mt-3">{locationError}</p>
          )}
        </div>
      )}

      {status.kind === "loading" && (
        <div className="space-y-3" aria-busy="true">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="animate-pulse flex gap-3 p-4 rounded-xl bg-white/60 border border-amber-100"
            >
              <div className="h-12 w-12 rounded-lg bg-amber-100 shrink-0" />
              <div className="flex-1 space-y-3">
                <div className="h-3 bg-amber-100 rounded w-2/3" />
                <div className="h-2 bg-amber-100/70 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      )}

      {status.kind === "not-configured" && (
        <div className="rounded-lg bg-white/60 border border-amber-200 p-3 text-xs text-amber-900 leading-snug">
          Restaurant discovery isn&apos;t configured yet. Add{" "}
          <code className="font-mono bg-amber-100 px-1 rounded">GOOGLE_PLACES_API_KEY</code> for Google Nearby Search.
        </div>
      )}

      {status.kind === "error" && (
        <div className="rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700">
          ⚠️ {status.message}
        </div>
      )}

      {status.kind === "empty" && (
        <div className="rounded-lg bg-white/60 border border-amber-200 p-8 text-center">
          <div className="text-2xl mb-2">🍽️</div>
          <p className="text-xs text-amber-900 font-medium">
            No {cuisineType} restaurants found in your area right now.
          </p>
          <p className="text-[10px] text-amber-700/60 mt-1">Try searching for a broader cuisine or adjusting your location.</p>
        </div>
      )}

      {status.kind === "ready" && (
        <>
          {status.data.sourceNotice && (
            <div className="mb-4 rounded-lg border border-amber-300 bg-amber-100/60 p-3 text-[11px] text-amber-900 leading-snug">
              ✦ {status.data.sourceNotice}
            </div>
          )}
          <ul className="grid grid-cols-1 gap-3">
            {status.data.restaurants.map((entry) => {
              const { business } = entry;
              const source = status.data.source ?? "yelp";
              const isScored = !!entry.dominantElement;
              const providerLabel = sourceLabel(source);
              const decoration = isScored ? ELEMENT_DECORATION[entry.dominantElement] : null;
              const distance = metersToMiles(business.distance);
              const scorePct = Math.round(entry.alchmScore * 100);
              const reasons = entry.matchReasons.slice(0, 2);
              const isSaved = savedIds.has(business.id);
              const isPartner = entry.isPartner === true;

              return (
                <li
                  key={business.id}
                  className={`flex flex-col sm:flex-row items-start gap-4 p-4 rounded-xl bg-white border shadow-sm transition-all hover:shadow-md ${
                    isPartner
                      ? "border-emerald-300 ring-1 ring-emerald-200/50"
                      : "border-amber-100"
                  }`}
                >
                  {/* Score / source badge */}
                  <div className="flex sm:flex-col items-center gap-2 sm:gap-1.5 shrink-0">
                    {isScored ? (
                      <>
                        <div className="px-3 py-1.5 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 text-white text-xs font-black shadow-sm">
                          {scorePct}% <span aria-hidden>✦</span>
                        </div>
                        {decoration && (
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-black uppercase tracking-wider ${decoration.chipClass}`}
                            title={`${decoration.label} dominant`}
                          >
                            <span aria-hidden>{decoration.emoji}</span>
                            {decoration.label}
                          </span>
                        )}
                      </>
                    ) : (
                      <div className="px-2 py-1 rounded-md bg-blue-100 text-blue-700 text-[10px] font-bold border border-blue-200">
                        {providerLabel}
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-black text-amber-950 truncate">
                        {business.name}
                      </h4>
                      {isPartner && (
                        <span className="shrink-0 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-emerald-700">
                          Partner
                        </span>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-amber-800/60 mt-1 font-medium">
                      {typeof business.rating === "number" && business.rating > 0 && (
                        <span className="text-amber-600 font-bold">
                          ★ {business.rating.toFixed(1)}
                        </span>
                      )}
                      {business.review_count > 0 && (
                        <span>
                          ({business.review_count})
                        </span>
                      )}
                      {business.price && (
                        <span className="text-emerald-700 font-black">
                          {business.price}
                        </span>
                      )}
                      {distance && <span>· {distance}</span>}
                    </div>
                    
                    {isScored && reasons.length > 0 && (
                      <ul className="mt-2 space-y-1 border-l-2 border-amber-100 pl-3">
                        {reasons.map((reason, i) => (
                          <li
                            key={i}
                            className="text-[10px] text-amber-800/70 font-medium leading-relaxed italic"
                          >
                            {reason}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* CTAs */}
                  <div className="flex flex-row sm:flex-col gap-2 w-full sm:w-auto shrink-0 mt-2 sm:mt-0">
                    {isPartner && entry.partnerRestaurantId ? (
                      <a
                        href={`/restaurants/${encodeURIComponent(entry.partnerRestaurantId)}/menu`}
                        className="flex-1 sm:w-32 px-3 py-2 text-white text-[10px] font-black uppercase tracking-widest rounded-lg transition-colors text-center bg-emerald-600 hover:bg-emerald-700 shadow-sm"
                      >
                        Order Now
                      </a>
                    ) : (
                      <a
                        href={business.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 sm:w-32 px-3 py-2 text-white text-[10px] font-black uppercase tracking-widest rounded-lg transition-colors text-center bg-amber-600 hover:bg-amber-700 shadow-sm"
                      >
                        View Menu
                      </a>
                    )}
                    
                    <div className="flex gap-2 flex-1 sm:w-32">
                      <button
                        type="button"
                        onClick={() => void saveRestaurant(entry, source)}
                        disabled={isSaved}
                        className={`flex-1 px-2 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                          isSaved
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default"
                            : "bg-white text-purple-700 border border-purple-200 hover:bg-purple-50 shadow-sm"
                        }`}
                      >
                        {isSaved ? "Saved" : "Save"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setLoggingItem(entry)}
                        className="px-3 py-2 bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-amber-200 transition-colors shadow-sm"
                        title="Log to Food Diary"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}

      {loggingItem && (
        <AddToDiaryModal
          item={loggingItem}
          itemType="restaurant"
          onClose={() => setLoggingItem(null)}
        />
      )}

      {/* Cosmic context line */}
      {cosmicLine && (
        <p className="mt-6 text-[10px] text-amber-700/60 font-bold uppercase tracking-[0.2em] text-center">
          Aligned to {cosmicLine}
        </p>
      )}

      {/* Provider attribution */}
      {status.kind === "ready" && (
        <p className="mt-4 text-[9px] text-gray-400 text-center uppercase tracking-widest font-bold">
          Data source: {sourceLabel(status.data.source)}
        </p>
      )}
    </section>
  );
}

export default CuisineRestaurantFinder;
