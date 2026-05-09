'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import type { SavedRestaurant, FoursquarePlace } from '@/types/restaurant';

interface RestaurantSearchProps {
  savedRestaurants: SavedRestaurant[];
  onSave: (restaurant: SavedRestaurant) => void;
}

export const RestaurantSearch: React.FC<RestaurantSearchProps> = ({
  savedRestaurants,
  onSave,
}) => {
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [results, setResults] = useState<FoursquarePlace[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiNotConfigured, setApiNotConfigured] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const performSearch = useCallback(async (q: string, loc: string) => {
    if (!q.trim() && !loc.trim()) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    setIsSearching(true);
    setError(null);
    setHasSearched(true);

    try {
      const params = new URLSearchParams();
      if (q.trim()) params.set('query', q.trim());
      if (loc.trim()) params.set('near', loc.trim());

      const res = await fetch(`/api/restaurants/search?${params.toString()}`);
      if (!res.ok && res.status !== 501) throw new Error(`Server error (${res.status})`);
      const data = await res.json();

      if (res.status === 501) {
        setApiNotConfigured(true);
        setResults([]);
        return;
      }

      if (!data.success) {
        setError(data.message || 'Search failed.');
        setResults([]);
        return;
      }

      setResults(data.results || []);
    } catch (_err) {
      setError('Failed to search. Please try again.');
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Debounced search
  const handleInputChange = useCallback((newQuery: string, newLocation: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      void performSearch(newQuery, newLocation);
    }, 400);
  }, [performSearch]);

  // Cleanup on unmount
  useEffect(() => {
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, []);

  const isSaved = (fsqId: string) => savedRestaurants.some(r => r.externalId === fsqId);

  const handleSavePlace = (place: FoursquarePlace) => {
    if (isSaved(place.fsq_id)) return;

    // eslint-disable-next-line no-alert
    const dish = window.prompt(`Saving ${place.name}. What's your favorite dish here? (Optional)`);
    const menuItems = dish && dish.trim() ? [{
      id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      name: dish.trim(),
      category: 'Mains' as const,
      dietaryTags: [],
    }] : [];

    const restaurant: SavedRestaurant = {
      id: `fsq_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      name: place.name,
      cuisine: place.categories?.[0]?.name || 'Restaurant',
      location: place.location?.locality
        ? `${place.location.locality}${place.location.region ? `, ${  place.location.region}` : ''}`
        : undefined,
      address: place.location?.formatted_address || place.location?.address,
      menuItems,
      rating: place.rating,
      source: 'foursquare',
      externalId: place.fsq_id,
      url: place.link,
      addedAt: new Date().toISOString(),
    };

    onSave(restaurant);
  };

  const formatDistance = (meters?: number) => {
    if (!meters) return null;
    if (meters < 1000) return `${meters}m`;
    return `${(meters / 1000).toFixed(1)}km`;
  };

  // API key not configured state
  if (apiNotConfigured) {
    return (
      <div className="bg-purple-900/20 border border-purple-500/30 rounded-xl p-5 text-center">
        <div className="text-3xl mb-3">🔑</div>
        <h4 className="font-bold text-purple-200 text-sm mb-2">Restaurant Search Not Yet Configured</h4>
        <p className="text-xs text-purple-300 leading-relaxed mb-3">
          To search real restaurants, add a Foursquare API key to your environment.
        </p>
        <div className="bg-black/30 rounded-lg p-3 text-xs text-purple-200 font-mono text-left border border-purple-500/20">
          <p className="mb-1 text-white/40"># In your .env.local file:</p>
          <p>FOURSQUARE_API_KEY=fsq3...</p>
        </div>
        <a
          href="https://foursquare.com/developers"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-3 px-4 py-2 bg-purple-600 text-white rounded-lg text-xs font-medium hover:bg-purple-700 transition-colors"
        >
          Get a Free API Key →
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Search Input Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
        <div className="sm:col-span-3">
          {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
          <label className="block text-[10px] font-semibold text-white/60 uppercase tracking-wider mb-1">Search</label>
          <input
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); handleInputChange(e.target.value, location); }}
            placeholder="Restaurant name, cuisine type..."
            className="w-full px-4 py-2.5 bg-black/30 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400 text-white placeholder-white/30 text-sm transition-all"
          />
        </div>
        <div className="sm:col-span-2">
          {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
          <label className="block text-[10px] font-semibold text-white/60 uppercase tracking-wider mb-1">Location</label>
          <input
            type="text"
            value={location}
            onChange={(e) => { setLocation(e.target.value); handleInputChange(query, e.target.value); }}
            placeholder="City or address..."
            className="w-full px-4 py-2.5 bg-black/30 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400 text-white placeholder-white/30 text-sm transition-all"
          />
        </div>
      </div>

      {/* Loading State */}
      {isSearching && (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse flex gap-4 p-4 bg-white/5 border border-white/10 rounded-lg">
              <div className="w-10 h-10 bg-white/10 rounded-lg shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-white/10 rounded w-3/4" />
                <div className="h-3 bg-white/5 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-rose-900/20 border border-rose-500/30 rounded-lg p-4 text-sm text-rose-300">
          {error}
        </div>
      )}

      {/* Results */}
      {!isSearching && results.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-[10px] font-semibold text-white/60 uppercase tracking-wider">
            {results.length} Restaurant{results.length !== 1 ? 's' : ''} Found
          </h4>
          <div className="space-y-2">
            {results.map(place => {
              const alreadySaved = isSaved(place.fsq_id);
              const dist = formatDistance(place.distance);
              return (
                <div
                  key={place.fsq_id}
                  className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-lg shadow-sm hover:border-purple-400/50 hover:bg-white/10 transition-colors"
                >
                  {/* Icon */}
                  <div className="w-10 h-10 bg-purple-900/40 border border-purple-500/30 rounded-lg flex items-center justify-center text-lg shrink-0">
                    🍴
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <h5 className="font-semibold text-white text-sm truncate">{place.name}</h5>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-white/60 mt-0.5">
                      {place.categories?.[0]?.name && (
                        <span className="font-medium text-purple-300">{place.categories[0].name}</span>
                      )}
                      {place.location?.formatted_address && (
                        <span className="truncate max-w-[200px]">{place.location.formatted_address}</span>
                      )}
                      {dist && <span className="text-white/40">• {dist}</span>}
                      {place.rating && (
                        <span className="text-amber-400 font-medium">⭐ {(place.rating / 2).toFixed(1)}</span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {place.link && (
                      <a
                        href={place.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-2 bg-white/5 text-purple-300 border border-white/10 hover:border-purple-500/30 hover:bg-white/10 rounded-lg text-xs font-semibold transition-all whitespace-nowrap"
                      >
                        View ↗
                      </a>
                    )}
                    <button
                      onClick={() => handleSavePlace(place)}
                      disabled={alreadySaved}
                      className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                        alreadySaved
                          ? 'bg-emerald-900/20 text-emerald-300 border border-emerald-500/30 cursor-default'
                          : 'bg-purple-900/40 text-purple-200 border border-purple-500/30 hover:bg-purple-800/60 shadow-sm'
                      }`}
                    >
                      {alreadySaved ? '✓ Saved' : '+ Save'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* No Results State */}
      {!isSearching && hasSearched && results.length === 0 && !error && (
        <div className="text-center py-8 bg-white/5 rounded-xl border border-dashed border-white/20">
          <div className="text-3xl mb-2">🔍</div>
          <p className="text-sm text-white/80 font-medium">No restaurants found</p>
          <p className="text-xs text-white/50 mt-1">Try a different search term or location</p>
        </div>
      )}

      {/* Initial Empty State */}
      {!hasSearched && !isSearching && (
        <div className="text-center py-8 bg-white/5 rounded-xl border border-dashed border-white/20">
          <div className="text-3xl mb-2">🌍</div>
          <p className="text-sm text-white/80 font-medium">Discover Restaurants</p>
          <p className="text-xs text-white/50 mt-1">Search by name, cuisine, or location to find and save restaurants</p>
        </div>
      )}
    </div>
  );
};
