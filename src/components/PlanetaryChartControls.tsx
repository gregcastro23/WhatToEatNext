/**
 * PlanetaryChartControls Component
 *
 * User controls for planetary chart parameters:
 * - Date/time selection
 * - Location input
 * - Zodiac system toggle
 * - Refresh button
 */

"use client";

import React, { useState } from "react";

export interface ChartControlsProps {
  onDateTimeChange: (dateTime: Date | undefined) => void;
  onLocationChange: (location: { latitude: number; longitude: number }) => void;
  onZodiacSystemChange: (system: "tropical" | "sidereal") => void;
  onRefresh: () => void;
  currentDateTime?: Date;
  currentLocation: { latitude: number; longitude: number };
  currentZodiacSystem: "tropical" | "sidereal";
  isLoading?: boolean;
}

export const PlanetaryChartControls: React.FC<ChartControlsProps> = ({
  onDateTimeChange,
  onLocationChange,
  onZodiacSystemChange,
  onRefresh,
  currentDateTime,
  currentLocation,
  currentZodiacSystem,
  isLoading = false,
}) => {
  const [useCustomDate, setUseCustomDate] = useState(!!currentDateTime);
  const [dateString, setDateString] = useState(
    currentDateTime ? currentDateTime.toISOString().slice(0, 16) : "",
  );
  const [latitude, setLatitude] = useState(currentLocation.latitude.toString());
  const [longitude, setLongitude] = useState(
    currentLocation.longitude.toString(),
  );

  const handleDateToggle = () => {
    const newUseCustom = !useCustomDate;
    setUseCustomDate(newUseCustom);

    if (!newUseCustom) {
      // Switch to current moment
      onDateTimeChange(undefined);
      setDateString("");
    } else {
      // Initialize with current time
      const now = new Date();
      setDateString(now.toISOString().slice(0, 16));
      onDateTimeChange(now);
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDateString = e.target.value;
    setDateString(newDateString);

    if (newDateString) {
      const date = new Date(newDateString);
      onDateTimeChange(date);
    }
  };

  const handleLocationUpdate = () => {
    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);

    if (
      !isNaN(lat) &&
      !isNaN(lon) &&
      lat >= -90 &&
      lat <= 90 &&
      lon >= -180 &&
      lon <= 180
    ) {
      onLocationChange({ latitude: lat, longitude: lon });
    } else {
      alert("Invalid coordinates. Latitude: -90 to 90, Longitude: -180 to 180");
    }
  };

  const handlePresetLocation = (
    preset: "nyc" | "london" | "tokyo" | "sydney",
  ) => {
    const presets = {
      nyc: { latitude: 40.7128, longitude: -74.006, name: "New York City" },
      london: { latitude: 51.5074, longitude: -0.1278, name: "London" },
      tokyo: { latitude: 35.6762, longitude: 139.6503, name: "Tokyo" },
      sydney: { latitude: -33.8688, longitude: 151.2093, name: "Sydney" },
    };

    const location = presets[preset];
    setLatitude(location.latitude.toString());
    setLongitude(location.longitude.toString());
    onLocationChange({
      latitude: location.latitude,
      longitude: location.longitude,
    });
  };

  const handleUseCurrentLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          setLatitude(lat.toFixed(4));
          setLongitude(lon.toFixed(4));
          onLocationChange({ latitude: lat, longitude: lon });
        },
        (error) => {
          alert(`Error getting location: ${error.message}`);
        },
      );
    } else {
      alert("Geolocation is not supported by your browser");
    }
  };

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-purple-900/20 to-blue-900/20 rounded-lg border border-purple-500/30">
      {/* Date/Time Controls */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-purple-300">Date & Time</h3>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={useCustomDate}
              onChange={handleDateToggle}
              className="w-4 h-4 rounded border-purple-500/50 bg-purple-900/30 text-purple-500 focus:ring-purple-500"
            />
            <span className="text-sm text-gray-300">Use custom date/time</span>
          </label>
        </div>

        {useCustomDate && (
          <input
            type="datetime-local"
            value={dateString}
            onChange={handleDateChange}
            className="w-full px-4 py-2 bg-purple-900/30 border border-purple-500/50 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        )}

        {!useCustomDate && (
          <p className="text-sm text-gray-400 italic">
            Using current moment (live updates)
          </p>
        )}
      </div>

      {/* Location Controls */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-purple-300">Location</h3>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Latitude</label>
            <input
              type="number"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              step="0.0001"
              min="-90"
              max="90"
              className="w-full px-3 py-2 bg-purple-900/30 border border-purple-500/50 rounded-lg text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="40.7128"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">
              Longitude
            </label>
            <input
              type="number"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              step="0.0001"
              min="-180"
              max="180"
              className="w-full px-3 py-2 bg-purple-900/30 border border-purple-500/50 rounded-lg text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="-74.0060"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleLocationUpdate}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Update Location
          </button>

          <button
            onClick={handleUseCurrentLocation}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Use My Location
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-gray-400">Presets:</span>
          {[
            { key: "nyc" as const, label: "NYC" },
            { key: "london" as const, label: "London" },
            { key: "tokyo" as const, label: "Tokyo" },
            { key: "sydney" as const, label: "Sydney" },
          ].map((preset) => (
            <button
              key={preset.key}
              onClick={() => handlePresetLocation(preset.key)}
              className="px-3 py-1 bg-purple-900/40 hover:bg-purple-800/60 text-purple-300 rounded text-xs font-medium transition-colors border border-purple-500/30"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Zodiac System */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-purple-300">Zodiac System</h3>

        <div className="flex gap-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="zodiacSystem"
              value="tropical"
              checked={currentZodiacSystem === "tropical"}
              onChange={() => onZodiacSystemChange("tropical")}
              className="w-4 h-4 text-purple-500 border-purple-500/50 bg-purple-900/30 focus:ring-purple-500"
            />
            <span className="text-sm text-gray-300">Tropical</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="zodiacSystem"
              value="sidereal"
              checked={currentZodiacSystem === "sidereal"}
              onChange={() => onZodiacSystemChange("sidereal")}
              className="w-4 h-4 text-purple-500 border-purple-500/50 bg-purple-900/30 focus:ring-purple-500"
            />
            <span className="text-sm text-gray-300">Sidereal</span>
          </label>
        </div>
      </div>

      {/* Refresh Button */}
      <button
        onClick={onRefresh}
        disabled={isLoading}
        className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 text-white rounded-lg font-semibold transition-all transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed"
      >
        {isLoading ? "Calculating..." : "Refresh Chart"}
      </button>
    </div>
  );
};

export default PlanetaryChartControls;
