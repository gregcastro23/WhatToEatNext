"use client";

import React, { useState, useEffect, useRef } from "react";
import type { GeocodingResult } from "@/services/geocodingService";

interface LocationSearchProps {
  onLocationSelect: (location: {
    displayName: string;
    latitude: number;
    longitude: number;
  }) => void;
  defaultValue?: string;
}

/**
 * Location Search Component
 * Allows users to search for their birth location with autocomplete
 */
export function LocationSearch({
  onLocationSelect,
  defaultValue = "",
}: LocationSearchProps) {
  const [query, setQuery] = useState(defaultValue);
  const [results, setResults] = useState<GeocodingResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<string>("");
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
  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setShowResults(false);
      return;
    }

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout
    searchTimeoutRef.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/geocoding?q=${encodeURIComponent(query)}`,
        );
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
    }, 500); // 500ms debounce

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [query]);

  const handleSelectLocation = (result: GeocodingResult) => {
    setQuery(result.displayName);
    setSelectedLocation(result.displayName);
    setShowResults(false);
    onLocationSelect({
      displayName: result.displayName,
      latitude: result.latitude,
      longitude: result.longitude,
    });
  };

  return (
    <div ref={containerRef} className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Birth Location
        <span className="text-red-500 ml-1">*</span>
      </label>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search for your birth city..."
        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none"
        required
      />

      {/* Search Results Dropdown */}
      {showResults && (
        <div className="absolute z-10 w-full mt-1 bg-white border-2 border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {isLoading ? (
            <div className="px-4 py-3 text-gray-500 text-sm">
              Searching locations...
            </div>
          ) : results.length > 0 ? (
            results.map((result, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleSelectLocation(result)}
                className="w-full px-4 py-3 text-left hover:bg-purple-50 transition-colors border-b border-gray-100 last:border-b-0"
              >
                <div className="font-medium text-gray-900">
                  {result.displayName}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {result.type} • {result.country}
                </div>
              </button>
            ))
          ) : (
            <div className="px-4 py-3 text-gray-500 text-sm">
              No locations found
            </div>
          )}
        </div>
      )}

      {/* Selected Location Indicator */}
      {selectedLocation && (
        <div className="mt-2 text-sm text-green-600 flex items-center gap-2">
          <span>✓</span>
          <span>Location selected: {selectedLocation}</span>
        </div>
      )}
    </div>
  );
}
