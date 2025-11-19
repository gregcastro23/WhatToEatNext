"use client";
import React, { useState, useEffect } from "react";

interface BirthLocation {
  latitude: number;
  longitude: number;
  city?: string;
  country?: string;
}

interface BirthData {
  birthDate: string; // ISO date string
  birthTime: string; // HH:mm format
  birthLocation: BirthLocation;
}

interface BirthChartInputProps {
  initialData?: BirthData;
  onSave: (data: BirthData) => void;
  onCancel?: () => void;
}

// New York coordinates as default
const DEFAULT_LOCATION: BirthLocation = {
  latitude: 40.7128,
  longitude: -74.006,
  city: "New York",
  country: "United States",
};

export const BirthChartInput: React.FC<BirthChartInputProps> = ({
  initialData,
  onSave,
  onCancel,
}) => {
  const [birthDate, setBirthDate] = useState<string>("");
  const [birthTime, setBirthTime] = useState<string>("");
  const [city, setCity] = useState<string>(DEFAULT_LOCATION.city || "");
  const [latitude, setLatitude] = useState<string>(
    DEFAULT_LOCATION.latitude.toString(),
  );
  const [longitude, setLongitude] = useState<string>(
    DEFAULT_LOCATION.longitude.toString(),
  );

  // Initialize with current moment as default
  useEffect(() => {
    if (initialData) {
      setBirthDate(initialData.birthDate);
      setBirthTime(initialData.birthTime);
      setCity(initialData.birthLocation.city || "");
      setLatitude(initialData.birthLocation.latitude.toString());
      setLongitude(initialData.birthLocation.longitude.toString());
    } else {
      // Default to current moment
      const now = new Date();
      const dateStr = now.toISOString().split("T")[0];
      const timeStr = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
      setBirthDate(dateStr);
      setBirthTime(timeStr);
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const birthData: BirthData = {
      birthDate,
      birthTime,
      birthLocation: {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        city: city || undefined,
        country: "United States", // Can be made editable later
      },
    };

    onSave(birthData);
  };

  return (
    <div className="alchm-card p-6">
      <h3 className="text-2xl font-bold alchm-gradient-text mb-3">
        Birth Chart Information
      </h3>
      <p className="text-gray-600 mb-6">
        Enter your birth details to calculate your natal chart for personalized
        food recommendations based on your planetary placements.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="birthDate"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Birth Date
          </label>
          <input
            type="date"
            id="birthDate"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        <div>
          <label
            htmlFor="birthTime"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Birth Time
          </label>
          <input
            type="time"
            id="birthTime"
            value={birthTime}
            onChange={(e) => setBirthTime(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <small className="text-xs text-gray-500 mt-1 block">
            Enter as accurately as possible for precise planetary positions
          </small>
        </div>

        <div>
          <label
            htmlFor="city"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Birth Location (City)
          </label>
          <input
            type="text"
            id="city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="e.g., New York"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="latitude"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Latitude
            </label>
            <input
              type="number"
              id="latitude"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              step="0.0001"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div>
            <label
              htmlFor="longitude"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Longitude
            </label>
            <input
              type="number"
              id="longitude"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              step="0.0001"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>

        <small className="text-xs text-gray-500 block">
          Coordinates default to New York. Adjust if born elsewhere.
        </small>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-orange-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-orange-700 transition-all duration-200"
          >
            Calculate Birth Chart
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all duration-200"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
