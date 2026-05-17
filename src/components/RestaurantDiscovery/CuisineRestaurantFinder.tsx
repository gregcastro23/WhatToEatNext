"use client";

/**
 * CuisineRestaurantFinder — Dedicated restaurant search for the Cuisines page.
 *
 * Fetches alchm-scored restaurants from /api/restaurants/discover using
 * Google Places (New) under the hood.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AddToDiaryModal } from "@/components/food-diary/AddToDiaryModal";
import { ReservationModal } from "@/components/RestaurantDiscovery/ReservationModal";
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
  Fire:  { emoji: "🔥", label: "Fire",  chipClass: "bg-rose-500/15 text-rose-200 border-rose-400/30" },
  Water: { emoji: "💧", label: "Water", chipClass: "bg-blue-500/15 text-blue-200 border-blue-400/30" },
  Earth: { emoji: "🌿", label: "Earth", chipClass: "bg-emerald-500/15 text-emerald-200 border-emerald-400/30" },
  Air:   { emoji: "💨", label: "Air",   chipClass: "bg-sky-500/15 text-sky-200 border-sky-400/30" },
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
  const [reservingItem, setReservingItem] = useState<AlchmScoredRestaurant | null>(null);
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
      className={`mt-4 rounded-3xl border border-white/10 bg-gradient-to-br from-[#0c0c14]/90 to-[#16101e]/90 backdrop-blur-xl p-6 shadow-2xl shadow-purple-900/20 ${
        className ?? ""
      }`}
      aria-label="Restaurant discovery"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-sm font-extrabold text-purple-100 flex items-center gap-2 uppercase tracking-[0.18em]">
            <span aria-hidden className="text-purple-300">✦</span>
            Order it — Restaurants Aligned to the Moment
          </h3>
          <p className="text-[11px] text-white/50 mt-1 font-medium">
            {cuisineType ? `${cuisineType} cuisine, scored by current cosmic state` : "Search for a cuisine to discover restaurants near you."}
          </p>
        </div>

        <form onSubmit={handleSearch} className="flex w-full md:w-auto gap-2">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search cuisine..."
            className="flex-1 md:w-48 px-3 py-2 text-xs rounded-lg border border-white/10 bg-black/40 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-purple-400/40 focus:border-purple-400/50"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-black uppercase tracking-wider rounded-lg shadow-lg shadow-purple-900/30 hover:brightness-110 transition-all"
          >
            Find
          </button>
        </form>
      </div>

      {/* Body */}
      {status.kind === "needs-location" && (
        <div className="rounded-2xl bg-black/30 border border-white/10 p-8 text-center">
          <div className="text-3xl mb-3">📍</div>
          <p className="text-xs text-white/70 mb-4">
            Enable location to discover {cuisineType || "matching"} restaurants near you.
          </p>
          <button
            type="button"
            onClick={requestLocation}
            className="px-5 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-lg shadow-purple-900/30 hover:brightness-110 transition-all"
          >
            Use my location
          </button>
          {locationError && (
            <p className="text-[11px] text-rose-300 mt-3">{locationError}</p>
          )}
        </div>
      )}

      {status.kind === "loading" && (
        <div className="space-y-3" aria-busy="true">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="animate-pulse flex gap-3 p-4 rounded-xl bg-black/30 border border-white/5"
            >
              <div className="h-12 w-12 rounded-lg bg-white/10 shrink-0" />
              <div className="flex-1 space-y-3">
                <div className="h-3 bg-white/10 rounded w-2/3" />
                <div className="h-2 bg-white/10 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      )}

      {status.kind === "not-configured" && (
        <div className="rounded-lg bg-black/30 border border-white/10 p-3 text-xs text-white/70 leading-snug">
          Restaurant discovery isn&apos;t configured yet. Add{" "}
          <code className="font-mono bg-white/10 text-purple-200 px-1 rounded">GOOGLE_PLACES_API_KEY</code> for Google Nearby Search.
        </div>
      )}

      {status.kind === "error" && (
        <div className="rounded-lg bg-rose-500/10 border border-rose-400/30 p-3 text-xs text-rose-200">
          ⚠️ {status.message}
        </div>
      )}

      {status.kind === "empty" && (
        <div className="rounded-2xl bg-black/30 border border-white/10 p-8 text-center">
          <div className="text-3xl mb-2">🍽️</div>
          <p className="text-xs text-white/70 font-medium">
            No {cuisineType} restaurants found in your area right now.
          </p>
          <p className="text-[10px] text-white/40 mt-1">Try searching for a broader cuisine or adjusting your location.</p>
        </div>
      )}

      {status.kind === "ready" && (
        <>
          {status.data.sourceNotice && (
            <div className="mb-4 rounded-lg border border-purple-400/30 bg-purple-500/10 p-3 text-[11px] text-purple-100 leading-snug">
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
                  className={`flex flex-col sm:flex-row items-start gap-4 p-4 rounded-2xl bg-black/40 border backdrop-blur-sm transition-all hover:bg-black/50 ${
                    isPartner
                      ? "border-emerald-400/40 ring-1 ring-emerald-400/20"
                      : "border-white/10"
                  }`}
                >
                  {/* Score / source badge */}
                  <div className="flex sm:flex-col items-center gap-2 sm:gap-1.5 shrink-0">
                    {isScored ? (
                      <>
                        <div className="px-3 py-1.5 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 text-white text-xs font-black shadow-lg shadow-purple-900/40">
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
                      <div className="px-2 py-1 rounded-md bg-purple-500/15 text-purple-200 text-[10px] font-bold border border-purple-400/30">
                        {providerLabel}
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-black text-white truncate">
                        {business.name}
                      </h4>
                      {isPartner && (
                        <span className="shrink-0 rounded-full border border-emerald-400/30 bg-emerald-500/15 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-emerald-200">
                          Partner
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-white/50 mt-1 font-medium">
                      {typeof business.rating === "number" && business.rating > 0 && (
                        <span className="text-amber-300 font-bold">
                          ★ {business.rating.toFixed(1)}
                        </span>
                      )}
                      {business.review_count > 0 && (
                        <span>
                          ({business.review_count})
                        </span>
                      )}
                      {business.price && (
                        <span className="text-emerald-300 font-black">
                          {business.price}
                        </span>
                      )}
                      {distance && <span>· {distance}</span>}
                    </div>

                    {isScored && reasons.length > 0 && (
                      <ul className="mt-2 space-y-1 border-l-2 border-purple-400/30 pl-3">
                        {reasons.map((reason, i) => (
                          <li
                            key={i}
                            className="text-[10px] text-white/60 font-medium leading-relaxed italic"
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
                        className="flex-1 sm:w-32 px-3 py-2 text-white text-[10px] font-black uppercase tracking-widest rounded-lg transition-all text-center bg-gradient-to-r from-emerald-500 to-emerald-600 hover:brightness-110 shadow-lg shadow-emerald-900/30"
                      >
                        Order Now
                      </a>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setReservingItem(entry)}
                        className="flex-1 sm:w-32 px-3 py-2 text-white text-[10px] font-black uppercase tracking-widest rounded-lg transition-all text-center bg-gradient-to-r from-purple-500 to-pink-500 hover:brightness-110 shadow-lg shadow-purple-900/30"
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
                        onClick={() => void saveRestaurant(entry, source)}
                        disabled={isSaved}
                        className={`px-2 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                          isSaved
                            ? "bg-emerald-500/15 text-emerald-200 border border-emerald-400/30 cursor-default"
                            : "bg-white/5 text-purple-200 border border-purple-400/30 hover:bg-purple-500/15"
                        }`}
                        title={isSaved ? "Saved" : "Save restaurant"}
                      >
                        {isSaved ? "✓" : "♡"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setLoggingItem(entry)}
                        className="px-3 py-2 bg-white/5 text-white/80 border border-white/10 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-colors"
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

      {reservingItem && (
        <ReservationModal
          entry={reservingItem}
          source={status.kind === "ready" ? (status.data.source ?? "google") : "google"}
          cuisineType={cuisineType}
          onClose={() => setReservingItem(null)}
        />
      )}

      {/* Cosmic context line */}
      {cosmicLine && (
        <p className="mt-6 text-[10px] text-purple-300/60 font-bold uppercase tracking-[0.2em] text-center">
          Aligned to {cosmicLine}
        </p>
      )}

      {/* Provider attribution */}
      {status.kind === "ready" && (
        <p className="mt-4 text-[9px] text-white/30 text-center uppercase tracking-widest font-bold">
          Data source: {sourceLabel(status.data.source)}
        </p>
      )}
    </section>
  );
}

export default CuisineRestaurantFinder;
