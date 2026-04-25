"use client";

/**
 * RestaurantDiscovery — "Order it" parallel to the Instacart "Cook it" CTA.
 *
 * Fetches alchm-scored restaurants from POST /api/restaurants/search using
 * Yelp Fusion under the hood. The Yelp API key never reaches the client.
 *
 * @file src/components/RestaurantDiscovery/RestaurantDiscovery.tsx
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { AlchmScoredRestaurant, RestaurantSearchResponse } from "@/types/yelp";

interface RestaurantDiscoveryProps {
  cuisineType: string;
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

export function RestaurantDiscovery({
  cuisineType,
  userLatitude,
  userLongitude,
  className,
}: RestaurantDiscoveryProps) {
  const [status, setStatus] = useState<FetchStatus>({ kind: "idle" });
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    typeof userLatitude === "number" && typeof userLongitude === "number"
      ? { lat: userLatitude, lng: userLongitude }
      : null,
  );
  const [locationError, setLocationError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

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
        const res = await fetch("/api/restaurants/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cuisineType,
            latitude: coords.lat,
            longitude: coords.lng,
          }),
          signal: controller.signal,
        });

        if (!res.ok) {
          setStatus({ kind: "error", message: `Server error (${res.status})` });
          return;
        }

        const data = (await res.json()) as RestaurantSearchResponse;

        if (data.error === "Yelp integration not configured") {
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

  return (
    <section
      className={`mt-4 rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50 to-rose-50 p-4 ${
        className ?? ""
      }`}
      aria-label="Restaurant discovery"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-extrabold text-amber-900 flex items-center gap-2">
            <span aria-hidden>✦</span>
            Order it — Restaurants Aligned to the Moment
          </h3>
          <p className="text-[11px] text-amber-700/80 mt-0.5">
            {cuisineType ? `${cuisineType} cuisine, scored by current cosmic state` : "Pick a cuisine to begin"}
          </p>
        </div>
      </div>

      {/* Body */}
      {status.kind === "needs-location" && (
        <div className="rounded-lg bg-white/60 border border-amber-200 p-3 text-center">
          <p className="text-xs text-amber-900 mb-2">
            Enable location to discover {cuisineType || "matching"} restaurants near you.
          </p>
          <button
            type="button"
            onClick={requestLocation}
            className="px-3 py-1.5 bg-amber-600 text-white text-xs font-bold rounded-lg hover:bg-amber-700 transition-colors"
          >
            📍 Use my location
          </button>
          {locationError && (
            <p className="text-[11px] text-rose-600 mt-2">{locationError}</p>
          )}
        </div>
      )}

      {status.kind === "loading" && (
        <div className="space-y-2" aria-busy="true">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="animate-pulse flex gap-3 p-3 rounded-lg bg-white/60 border border-amber-100"
            >
              <div className="h-10 w-10 rounded-lg bg-amber-100 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-amber-100 rounded w-2/3" />
                <div className="h-2 bg-amber-100/70 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      )}

      {status.kind === "not-configured" && (
        <div className="rounded-lg bg-white/60 border border-amber-200 p-3 text-xs text-amber-900">
          Restaurant discovery isn't configured yet. Add{" "}
          <code className="font-mono bg-amber-100 px-1 rounded">YELP_API_KEY</code> to enable.
        </div>
      )}

      {status.kind === "error" && (
        <div className="rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700">
          ⚠️ {status.message}
        </div>
      )}

      {status.kind === "empty" && (
        <div className="rounded-lg bg-white/60 border border-amber-200 p-4 text-center text-xs text-amber-900">
          No {cuisineType} restaurants found in your area right now.
        </div>
      )}

      {status.kind === "ready" && (
        <ul className="space-y-2">
          {status.data.restaurants.map((entry) => {
            const { business } = entry;
            const decoration = ELEMENT_DECORATION[entry.dominantElement];
            const distance = metersToMiles(business.distance);
            const scorePct = Math.round(entry.alchmScore * 100);
            const reasons = entry.matchReasons.slice(0, 2);

            return (
              <li
                key={business.id}
                className="flex items-start gap-3 p-3 rounded-lg bg-white border border-amber-100 shadow-sm hover:border-amber-300 transition-colors"
              >
                {/* Score badge */}
                <div className="flex-shrink-0 flex flex-col items-center">
                  <div className="px-2 py-1 rounded-md bg-gradient-to-br from-amber-400 to-amber-600 text-white text-xs font-extrabold shadow-sm">
                    {scorePct}% <span aria-hidden>✦</span>
                  </div>
                  <span
                    className={`mt-1 inline-flex items-center gap-1 px-1.5 py-0.5 rounded border text-[10px] font-semibold ${decoration.chipClass}`}
                    title={`${decoration.label} dominant`}
                  >
                    <span aria-hidden>{decoration.emoji}</span>
                    {decoration.label}
                  </span>
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-gray-800 truncate">
                    {business.name}
                  </h4>
                  <div className="flex flex-wrap items-center gap-x-2 text-[11px] text-gray-500 mt-0.5">
                    {typeof business.rating === "number" && (
                      <span className="text-amber-600 font-semibold">
                        ★ {business.rating.toFixed(1)}
                      </span>
                    )}
                    {business.review_count > 0 && (
                      <span className="text-gray-400">
                        ({business.review_count})
                      </span>
                    )}
                    {business.price && (
                      <span className="text-emerald-600 font-medium">
                        {business.price}
                      </span>
                    )}
                    {distance && <span>· {distance}</span>}
                  </div>
                  {reasons.length > 0 && (
                    <ul className="mt-1 space-y-0.5">
                      {reasons.map((reason, i) => (
                        <li
                          key={i}
                          className="text-[11px] text-amber-800 italic leading-snug"
                        >
                          — {reason}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* CTA */}
                <a
                  href={business.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0 self-center px-3 py-2 bg-amber-600 text-white text-xs font-bold rounded-lg hover:bg-amber-700 transition-colors whitespace-nowrap"
                >
                  Order it →
                </a>
              </li>
            );
          })}
        </ul>
      )}

      {/* Cosmic context line */}
      {cosmicLine && (
        <p className="mt-3 text-[11px] text-amber-700/80 italic text-center">
          Scored for {cosmicLine}
        </p>
      )}

      {/* Yelp ToS attribution */}
      {(status.kind === "ready" || status.kind === "empty") && (
        <p className="mt-2 text-[10px] text-gray-400 text-center">
          Powered by Yelp
        </p>
      )}
    </section>
  );
}

export default RestaurantDiscovery;
