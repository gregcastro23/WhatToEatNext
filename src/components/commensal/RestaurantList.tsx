"use client";

import React from "react";
import type { FoursquarePlace } from "@/types/restaurant";

interface Props {
  restaurants: FoursquarePlace[];
  /** Display name of the location (e.g. "Brooklyn, NY"). Used in the heading. */
  locationLabel?: string;
}

export function RestaurantList({ restaurants, locationLabel }: Props) {
  if (restaurants.length === 0) return null;

  return (
    <div className="glass-card-premium rounded-3xl p-6 border border-white/10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold flex items-center gap-2 text-purple-100">
          <span aria-hidden>🏪</span>
          <span>
            Nearby restaurants
            {locationLabel && (
              <span className="block text-xs font-normal text-purple-300/80 mt-0.5">
                near {locationLabel}
              </span>
            )}
          </span>
        </h3>
        <span className="text-[11px] text-purple-300/60 uppercase tracking-wider">
          via Foursquare
        </span>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {restaurants.map((place) => {
          const cat = place.categories?.[0]?.name;
          const distanceKm =
            typeof place.distance === "number"
              ? (place.distance / 1000).toFixed(1)
              : null;
          return (
            <div
              key={place.fsq_id}
              className="bg-white/5 p-4 rounded-2xl border border-white/10 hover:border-purple-300/40 transition-colors"
            >
              <h4 className="font-semibold text-purple-100">{place.name}</h4>
              <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                {place.location?.formatted_address ||
                  place.location?.address ||
                  [place.location?.locality, place.location?.region]
                    .filter(Boolean)
                    .join(", ") ||
                  "Location hidden"}
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-3">
                {cat && (
                  <span className="px-2 py-0.5 bg-purple-500/15 border border-purple-300/20 text-purple-100 text-[11px] rounded-full">
                    {cat}
                  </span>
                )}
                {typeof place.rating === "number" && (
                  <span className="px-2 py-0.5 bg-amber-500/15 border border-amber-300/20 text-amber-100 text-[11px] rounded-full">
                    ★ {place.rating.toFixed(1)}
                  </span>
                )}
                {distanceKm && (
                  <span className="text-[11px] text-purple-300/70 font-mono">
                    {distanceKm} km
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default RestaurantList;
