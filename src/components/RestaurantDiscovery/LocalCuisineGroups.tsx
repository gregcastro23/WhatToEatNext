"use client";

/**
 * LocalCuisineGroups — fetch nearby restaurants without a cuisine filter,
 * then group them by detected cuisine label (from Google Places primaryType).
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  AlchmScoredRestaurant,
  RestaurantSearchResponse,
} from "@/types/yelp";

type Status =
  | { kind: "idle" }
  | { kind: "needs-location" }
  | { kind: "loading" }
  | { kind: "ready"; data: RestaurantSearchResponse }
  | { kind: "empty" }
  | { kind: "not-configured" }
  | { kind: "error"; message: string };

function metersToMiles(meters?: number): string | null {
  if (typeof meters !== "number" || !Number.isFinite(meters)) return null;
  const miles = meters / 1609.344;
  return miles < 0.1 ? "<0.1 mi" : `${miles.toFixed(1)} mi`;
}

function groupByCuisine(
  list: AlchmScoredRestaurant[],
): Array<{ cuisine: string; items: AlchmScoredRestaurant[] }> {
  const map = new Map<string, AlchmScoredRestaurant[]>();
  for (const entry of list) {
    const label = entry.cuisineLabel ?? "Other";
    if (!map.has(label)) map.set(label, []);
    map.get(label)!.push(entry);
  }
  return Array.from(map.entries())
    .map(([cuisine, items]) => ({ cuisine, items }))
    .sort((a, b) => {
      if (b.items.length !== a.items.length) return b.items.length - a.items.length;
      return a.cuisine.localeCompare(b.cuisine);
    });
}

export function LocalCuisineGroups() {
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const abortRef = useRef<AbortController | null>(null);

  const requestLocation = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setLocationError("Location services are unavailable in this browser.");
      return;
    }
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => {
        setLocationError(
          err.code === err.PERMISSION_DENIED
            ? "Location permission denied. Enable it to see local cuisines."
            : "Couldn't read your location. Please try again.",
        );
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 5 * 60 * 1000 },
    );
  }, []);

  useEffect(() => {
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
          lat: String(coords.lat),
          lng: String(coords.lng),
          limit: "20",
        });
        const res = await fetch(
          `/api/restaurants/discover?${params.toString()}`,
          { signal: controller.signal },
        );

        if (!res.ok) {
          setStatus({ kind: "error", message: `Server error (${res.status})` });
          return;
        }
        const data = (await res.json()) as RestaurantSearchResponse;
        if (
          data.error === "Google Places integration is not configured." ||
          data.error === "Restaurant discovery is not configured."
        ) {
          setStatus({ kind: "not-configured" });
          return;
        }
        if (data.error) {
          setStatus({ kind: "error", message: data.error });
          return;
        }
        if (!data.restaurants || data.restaurants.length === 0) {
          setStatus({ kind: "empty" });
          return;
        }
        setStatus({ kind: "ready", data });
      } catch (err) {
        if (controller.signal.aborted) return;
        setStatus({
          kind: "error",
          message: err instanceof Error ? err.message : "Failed to load.",
        });
      }
    })();

    return () => controller.abort();
  }, [coords]);

  const groups = useMemo(
    () =>
      status.kind === "ready" ? groupByCuisine(status.data.restaurants) : [],
    [status],
  );

  const toggle = (cuisine: string) =>
    setExpanded((prev) => ({ ...prev, [cuisine]: !prev[cuisine] }));

  return (
    <section
      aria-label="Local restaurants grouped by cuisine"
      className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#0c0c14]/90 to-[#16101e]/90 backdrop-blur-xl p-6 shadow-2xl shadow-purple-900/20"
    >
      <header className="mb-6">
        <h3 className="text-sm font-extrabold text-purple-100 uppercase tracking-[0.18em] flex items-center gap-2">
          <span aria-hidden className="text-purple-300">⌖</span>
          What&apos;s Cooking Near You
        </h3>
        <p className="text-[11px] text-white/50 mt-1 font-medium">
          Local restaurants grouped by cuisine — based on your current location.
        </p>
      </header>

      {status.kind === "needs-location" && (
        <div className="rounded-2xl bg-black/30 border border-white/10 p-8 text-center">
          <div className="text-3xl mb-3">📍</div>
          <p className="text-xs text-white/70 mb-4">
            Enable location to see what cuisines are available near you.
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
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="animate-pulse h-14 rounded-xl bg-white/5 border border-white/5"
            />
          ))}
        </div>
      )}

      {status.kind === "not-configured" && (
        <div className="rounded-lg bg-black/30 border border-white/10 p-3 text-xs text-white/70">
          Local discovery isn&apos;t configured. Add{" "}
          <code className="font-mono bg-white/10 text-purple-200 px-1 rounded">
            GOOGLE_PLACES_API_KEY
          </code>
          .
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
          <p className="text-xs text-white/70">
            No restaurants found in your immediate area.
          </p>
        </div>
      )}

      {status.kind === "ready" && (
        <ul className="space-y-2">
          {groups.map(({ cuisine, items }) => {
            const isOpen = expanded[cuisine] ?? false;
            return (
              <li
                key={cuisine}
                className="rounded-2xl border border-white/10 bg-black/30 overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => toggle(cuisine)}
                  className="w-full flex items-center justify-between gap-3 px-4 py-3 hover:bg-white/5 transition-colors"
                  aria-expanded={isOpen}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-extrabold text-white">
                      {cuisine}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-purple-500/15 border border-purple-400/30 text-[10px] font-black uppercase tracking-widest text-purple-200">
                      {items.length}
                    </span>
                  </div>
                  <span
                    aria-hidden
                    className={`text-purple-300/70 transition-transform ${isOpen ? "rotate-90" : ""}`}
                  >
                    ▶
                  </span>
                </button>
                {isOpen && (
                  <ul className="border-t border-white/5 divide-y divide-white/5">
                    {items.map((entry) => {
                      const distance = metersToMiles(entry.business.distance);
                      return (
                        <li
                          key={entry.business.id}
                          className="flex items-center justify-between gap-3 px-4 py-2.5 hover:bg-white/[0.02] transition-colors"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-bold text-white truncate">
                              {entry.business.name}
                            </div>
                            <div className="text-[10px] text-white/40 mt-0.5 flex gap-2">
                              {typeof entry.business.rating === "number" &&
                                entry.business.rating > 0 && (
                                  <span className="text-amber-300">
                                    ★ {entry.business.rating.toFixed(1)}
                                  </span>
                                )}
                              {distance && <span>· {distance}</span>}
                            </div>
                          </div>
                          <a
                            href={entry.business.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="shrink-0 px-3 py-1.5 rounded-md bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-white/80 hover:bg-white/10 transition-colors"
                          >
                            View
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

export default LocalCuisineGroups;
