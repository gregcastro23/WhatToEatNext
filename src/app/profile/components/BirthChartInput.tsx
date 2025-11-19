"use client";

import React, { useState } from "react";
import { getDefaultBirthData, validateBirthData, type BirthData } from "@/services/natalChartService";

interface BirthChartInputProps {
  onSubmit: (birthData: BirthData) => void;
  isLoading?: boolean;
  initialData?: Partial<BirthData>;
}

/**
 * BirthChartInput Component
 * Form for entering birth date, time, and location to calculate natal chart
 */
export function BirthChartInput({
  onSubmit,
  isLoading = false,
  initialData,
}: BirthChartInputProps) {
  const defaultData = getDefaultBirthData();
  const [formData, setFormData] = useState<BirthData>({
    ...defaultData,
    ...initialData,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: keyof BirthData, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form data
    if (!validateBirthData(formData)) {
      setErrors({
        general: "Please fill in all required fields with valid values",
      });
      return;
    }

    // Submit the form
    onSubmit(formData);
  };

  return (
    <div className="alchm-card p-6">
      <div className="mb-4">
        <h2 className="text-2xl font-bold alchm-gradient-text mb-2">
          Enter Your Birth Information
        </h2>
        <p className="text-gray-600 text-sm">
          Your natal chart provides the foundation for personalized recommendations
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Date Input */}
        <div>
          <label
            htmlFor="birth-date"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Birth Date *
          </label>
          <input
            id="birth-date"
            type="date"
            value={formData.date}
            onChange={(e) => handleChange("date", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            required
          />
        </div>

        {/* Time Input */}
        <div>
          <label
            htmlFor="birth-time"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Birth Time *
          </label>
          <input
            id="birth-time"
            type="time"
            value={formData.time}
            onChange={(e) => handleChange("time", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            For best results, use your exact birth time. If unknown, noon (12:00) is a common default.
          </p>
        </div>

        {/* Location Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Latitude */}
          <div>
            <label
              htmlFor="latitude"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Latitude *
            </label>
            <input
              id="latitude"
              type="number"
              step="0.0001"
              min="-90"
              max="90"
              value={formData.latitude}
              onChange={(e) => handleChange("latitude", parseFloat(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              required
            />
          </div>

          {/* Longitude */}
          <div>
            <label
              htmlFor="longitude"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Longitude *
            </label>
            <input
              id="longitude"
              type="number"
              step="0.0001"
              min="-180"
              max="180"
              value={formData.longitude}
              onChange={(e) => handleChange("longitude", parseFloat(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              required
            />
          </div>
        </div>

        {/* Location Name (Optional) */}
        <div>
          <label
            htmlFor="location-name"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Location Name (Optional)
          </label>
          <input
            id="location-name"
            type="text"
            value={formData.locationName || ""}
            onChange={(e) => handleChange("locationName", e.target.value)}
            placeholder="e.g., New York, NY"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Default location: New York, NY (40.7128°N, 74.006°W)
          </p>
        </div>

        {/* Error Message */}
        {errors.general && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{errors.general}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-orange-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-orange-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Calculating Natal Chart...
            </span>
          ) : (
            "Calculate My Natal Chart"
          )}
        </button>
      </form>
    </div>
  );
}
