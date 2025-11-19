"use client";

import React, { useState } from "react";
import type { BirthData } from "@/services/natalChartService";
import { validateBirthData } from "@/services/natalChartService";

interface BirthChartInputProps {
  onSubmit: (birthData: BirthData) => void;
  onCancel?: () => void;
  initialData?: BirthData;
  loading?: boolean;
}

export const BirthChartInput: React.FC<BirthChartInputProps> = ({
  onSubmit,
  onCancel,
  initialData,
  loading = false,
}) => {
  const now = new Date();
  const [formData, setFormData] = useState<BirthData>(
    initialData || {
      dateTime: {
        year: now.getFullYear() - 30,
        month: 1,
        day: 1,
        hour: 12,
        minute: 0,
      },
      location: {
        latitude: 40.7128,
        longitude: -74.006,
        timezone: "America/New_York",
      },
      name: "",
    },
  );

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [locationSearch, setLocationSearch] = useState("");

  const handleChange = (field: string, value: number | string) => {
    const keys = field.split(".");
    setFormData((prev) => {
      const updated = { ...prev };
      let current: any = updated;

      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }

      current[keys[keys.length - 1]] = value;
      return updated;
    });

    // Clear error for this field
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      validateBirthData(formData);
      onSubmit(formData);
    } catch (error) {
      if (error instanceof Error) {
        setErrors({ general: error.message });
      }
    }
  };

  // Common city coordinates for quick selection
  const commonCities = [
    {
      name: "New York, USA",
      lat: 40.7128,
      lng: -74.006,
      timezone: "America/New_York",
    },
    {
      name: "London, UK",
      lat: 51.5074,
      lng: -0.1278,
      timezone: "Europe/London",
    },
    {
      name: "Tokyo, Japan",
      lat: 35.6762,
      lng: 139.6503,
      timezone: "Asia/Tokyo",
    },
    {
      name: "Sydney, Australia",
      lat: -33.8688,
      lng: 151.2093,
      timezone: "Australia/Sydney",
    },
    {
      name: "Los Angeles, USA",
      lat: 34.0522,
      lng: -118.2437,
      timezone: "America/Los_Angeles",
    },
    {
      name: "Paris, France",
      lat: 48.8566,
      lng: 2.3522,
      timezone: "Europe/Paris",
    },
  ];

  const handleCitySelect = (city: (typeof commonCities)[0]) => {
    setFormData((prev) => ({
      ...prev,
      location: {
        latitude: city.lat,
        longitude: city.lng,
        timezone: city.timezone,
      },
    }));
    setLocationSearch("");
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-xl font-semibold text-gray-900">
        Enter Birth Information
      </h3>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name (optional) */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Name (Optional)
          </label>
          <input
            type="text"
            value={formData.name || ""}
            onChange={(e) => handleChange("name", e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            placeholder="Your name"
          />
        </div>

        {/* Date of Birth */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Date of Birth
          </label>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <input
                type="number"
                value={formData.dateTime.year}
                onChange={(e) =>
                  handleChange("dateTime.year", parseInt(e.target.value))
                }
                min={1900}
                max={new Date().getFullYear()}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="Year"
                required
              />
            </div>
            <div>
              <select
                value={formData.dateTime.month}
                onChange={(e) =>
                  handleChange("dateTime.month", parseInt(e.target.value))
                }
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                required
              >
                {[
                  "January",
                  "February",
                  "March",
                  "April",
                  "May",
                  "June",
                  "July",
                  "August",
                  "September",
                  "October",
                  "November",
                  "December",
                ].map((month, idx) => (
                  <option key={month} value={idx + 1}>
                    {month}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <input
                type="number"
                value={formData.dateTime.day}
                onChange={(e) =>
                  handleChange("dateTime.day", parseInt(e.target.value))
                }
                min={1}
                max={31}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="Day"
                required
              />
            </div>
          </div>
        </div>

        {/* Time of Birth */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Time of Birth
          </label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <input
                type="number"
                value={formData.dateTime.hour}
                onChange={(e) =>
                  handleChange("dateTime.hour", parseInt(e.target.value))
                }
                min={0}
                max={23}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="Hour (0-23)"
                required
              />
            </div>
            <div>
              <input
                type="number"
                value={formData.dateTime.minute}
                onChange={(e) =>
                  handleChange("dateTime.minute", parseInt(e.target.value))
                }
                min={0}
                max={59}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="Minute (0-59)"
                required
              />
            </div>
          </div>
          <p className="mt-1 text-xs text-gray-500">Use 24-hour format</p>
        </div>

        {/* Location Selection */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Birth Location
          </label>

          {/* Quick city selector */}
          <div className="mb-2">
            <select
              value=""
              onChange={(e) => {
                const city = commonCities.find((c) => c.name === e.target.value);
                if (city) handleCitySelect(city);
              }}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">Select a common city...</option>
              {commonCities.map((city) => (
                <option key={city.name} value={city.name}>
                  {city.name}
                </option>
              ))}
            </select>
          </div>

          {/* Manual coordinates */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <input
                type="number"
                value={formData.location.latitude}
                onChange={(e) =>
                  handleChange("location.latitude", parseFloat(e.target.value))
                }
                step="0.0001"
                min={-90}
                max={90}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="Latitude"
                required
              />
              <p className="mt-1 text-xs text-gray-500">-90 to 90</p>
            </div>
            <div>
              <input
                type="number"
                value={formData.location.longitude}
                onChange={(e) =>
                  handleChange("location.longitude", parseFloat(e.target.value))
                }
                step="0.0001"
                min={-180}
                max={180}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="Longitude"
                required
              />
              <p className="mt-1 text-xs text-gray-500">-180 to 180</p>
            </div>
          </div>
        </div>

        {/* Errors */}
        {Object.keys(errors).length > 0 && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="text-sm text-red-800">
              {Object.values(errors).map((error, idx) => (
                <div key={idx}>{error}</div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-gray-400"
          >
            {loading ? "Calculating..." : "Calculate Natal Chart"}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-gray-100"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
