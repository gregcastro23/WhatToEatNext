"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import type { GeocodingResult } from "@/services/geocodingService";


interface LocationData {
  displayName: string;
  latitude: number;
  longitude: number;
  timezone?: string;
}

interface LocationSearchProps {
  onLocationSelect: (location: LocationData) => void;
  defaultValue?: string;
  /** Compact mode for inline forms (e.g. commensal add) */
  compact?: boolean;
  /** Show coordinates after selection */
  showCoordinates?: boolean;
  /** Placeholder text */
  placeholder?: string;
}

/**
 * Estimate IANA timezone from longitude (rough but useful fallback).
 * For birth chart calculations, the exact timezone matters less than
 * the UTC offset at the time of birth, which the backend derives from coords.
 */
function estimateTimezone(latitude: number, longitude: number): string {
  // Simple longitude-based UTC offset estimation
  const offsetHours = Math.round(longitude / 15);
  const absOffset = Math.abs(offsetHours);
  const sign = offsetHours >= 0 ? "+" : "-";
  return `UTC${sign}${absOffset}`;
}

/**
 * Format a location display name to be more readable.
 * Nominatim returns very long strings; extract the key parts.
 */
function formatDisplayName(raw: string): { primary: string; secondary: string } {
  const parts = raw.split(",").map((p) => p.trim());
  if (parts.length <= 2) {
    return { primary: parts[0], secondary: parts.slice(1).join(", ") };
  }
  // Typically: City, State/Region, Country
  const primary = parts[0];
  const secondary = [parts[1], parts[parts.length - 1]]
    .filter(Boolean)
    .join(", ");
  return { primary, secondary };
}

/**
 * Location Search Component
 * Allows users to search for their birth location with autocomplete,
 * timezone estimation, and coordinate display.
 */
export function LocationSearch({
  onLocationSelect,
  defaultValue = "",
  compact = false,
  showCoordinates = true,
  placeholder = "Search for your birth city...",
}: LocationSearchProps) {
  const [query, setQuery] = useState(defaultValue);
  const [results, setResults] = useState<GeocodingResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(
    null
  );
  const searchTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close results
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Search with debounce
  const performSearch = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setResults([]);
      setShowResults(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/geocoding?q=${encodeURIComponent(searchQuery)}`
      );
      if (!response.ok) throw new Error("Geocoding failed");
      const data = await response.json();

      if (data.success) {
        setResults(data.results);
        setShowResults(true);
      }
    } catch (error) {
      console.error("Location search error:", error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Don't search if the query matches the selected location
    if (selectedLocation && query === selectedLocation.displayName) {
      return;
    }

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      void performSearch(query);
    }, 400);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [query, performSearch, selectedLocation]);

  const handleSelectLocation = (result: GeocodingResult) => {
    const timezone = estimateTimezone(result.latitude, result.longitude);
    const locationData: LocationData = {
      displayName: result.displayName,
      latitude: result.latitude,
      longitude: result.longitude,
      timezone,
    };

    setQuery(result.displayName);
    setSelectedLocation(locationData);
    setShowResults(false);
    onLocationSelect(locationData);
  };

  const handleClear = () => {
    setQuery("");
    setSelectedLocation(null);
    setResults([]);
  };

  const inputClasses = compact
    ? "w-full border border-purple-900/60 bg-black/40 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-400/50 pr-8"
    : "w-full px-4 py-3 border-2 border-purple-900/60 bg-black/40 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-400/50 transition-all outline-none text-white pr-10";

  return (
    <div ref={containerRef} className="relative">
      {!compact && (
        <label htmlFor="birth-location" className="block text-sm font-medium text-purple-200 mb-2">
          Birth Location
          <span className="text-red-500 ml-1">*</span>
        </label>
      )}

      <div className="relative">
        <input
          id="birth-location"
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (selectedLocation) setSelectedLocation(null);
          }}
          onFocus={() => {
            if (results.length > 0 && !selectedLocation) setShowResults(true);
          }}
          placeholder={placeholder}
          className={inputClasses}
          required
        />
        {/* Search/Clear icon */}
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
            tabIndex={-1}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
        {!query && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        )}
      </div>

      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute right-10 top-1/2 -translate-y-1/2">
          <div className="w-4 h-4 border-2 border-purple-300 border-t-purple-600 rounded-full animate-spin" />
        </div>
      )}

      {/* Search Results Dropdown */}
      {showResults && (
        <div className="absolute z-50 w-full mt-1 bg-[#0a0a14] border border-white/10 rounded-xl shadow-lg max-h-72 overflow-y-auto">
          {results.length > 0 ? (
            results.map((result, index) => {
              const { primary, secondary } = formatDisplayName(
                result.displayName
              );
              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSelectLocation(result)}
                  className="w-full px-4 py-3 text-left hover:bg-purple-900/20 transition-colors border-b border-white/5 last:border-b-0 group"
                >
                  <div className="flex items-start gap-2">
                    <svg
                      className="w-4 h-4 mt-0.5 text-gray-400 group-hover:text-purple-400 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <div className="min-w-0">
                      <div className="font-medium text-gray-200 text-sm truncate">
                        {primary}
                      </div>
                      <div className="text-xs text-gray-400 truncate">
                        {secondary}
                      </div>
                      <div className="text-[10px] text-gray-500 mt-0.5">
                        {result.latitude.toFixed(2)}N, {result.longitude.toFixed(2)}E
                        {result.type && <span className="ml-1.5 capitalize text-purple-400/70">{result.type}</span>}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })
          ) : (
            <div className="px-4 py-3 text-gray-500 text-sm">
              No locations found. Try a different search term.
            </div>
          )}
        </div>
      )}

      {/* Selected Location Detail */}
      {selectedLocation && (
        <div className="mt-2 flex items-start gap-2">
          <span className="text-green-500 text-sm mt-0.5">&#x2713;</span>
          <div className="text-sm">
            <span className="text-green-700 font-medium">Location set</span>
            {showCoordinates && (
              <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                <span className="font-mono">
                  {selectedLocation.latitude.toFixed(4)}&#xB0;N,{" "}
                  {selectedLocation.longitude.toFixed(4)}&#xB0;E
                </span>
                {selectedLocation.timezone && (
                  <span className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-600">
                    {selectedLocation.timezone}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
