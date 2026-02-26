"use client";

import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { LocationSearch } from "@/components/onboarding/LocationSearch";
import type { BirthData } from "@/types/natalChart";

/**
 * Onboarding Portal
 * Collects user information and birth data for personalized recommendations
 */
export default function OnboardingPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [birthLocation, setBirthLocation] = useState<{
    displayName: string;
    latitude: number;
    longitude: number;
  } | null>(null);

  // Current moment as default
  const now = new Date();
  const [birthDateTime, setBirthDateTime] = useState(
    now.toISOString().slice(0, 16),
  ); // Format: YYYY-MM-DDTHH:mm

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate location
    if (!birthLocation) {
      setError("Please select a birth location");
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare birth data
      const birthData: BirthData = {
        dateTime: new Date(birthDateTime).toISOString(),
        latitude: birthLocation.latitude,
        longitude: birthLocation.longitude,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      };

      // Submit onboarding data
      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          name,
          birthData,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Onboarding failed");
      }

      // Store user data in localStorage for immediate use
      localStorage.setItem(
        "userProfile",
        JSON.stringify({
          userId: data.user.id,
          email: data.user.email,
          name: data.user.name,
          birthData,
          natalChart: data.natalChart,
        }),
      );

      // Redirect to profile page
      router.push("/profile");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-purple-50 to-blue-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold alchm-gradient-text mb-4">
            Welcome to alchm.kitchen
          </h1>
          <p className="text-lg text-gray-600 max-w-xl mx-auto">
            Let's personalize your culinary journey with alchemical and
            astrological insights
          </p>
        </div>

        {/* Onboarding Form */}
        <div className="alchm-card p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none"
                required
              />
            </div>

            {/* Name Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your Name"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none"
                required
              />
            </div>

            {/* Birth Date & Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Birth Date & Time
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="datetime-local"
                value={birthDateTime}
                onChange={(e) => setBirthDateTime(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none"
                required
              />
              <p className="text-xs text-gray-500 mt-2">
                Defaults to current moment. Adjust if needed.
              </p>
            </div>

            {/* Location Search */}
            <LocationSearch
              onLocationSelect={(location) => setBirthLocation(location)}
            />

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-orange-600 text-white rounded-lg font-semibold text-lg hover:from-purple-700 hover:to-orange-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                  Creating Your Profile...
                </span>
              ) : (
                "Complete Onboarding"
              )}
            </button>
          </form>

          {/* Info Cards */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
              <div className="text-3xl mb-2">🔮</div>
              <h3 className="font-semibold text-purple-800 mb-1 text-sm">
                Natal Chart
              </h3>
              <p className="text-xs text-purple-700">
                We'll calculate your unique astrological profile
              </p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg">
              <div className="text-3xl mb-2">⚗️</div>
              <h3 className="font-semibold text-orange-800 mb-1 text-sm">
                Alchemical Properties
              </h3>
              <p className="text-xs text-orange-700">
                Discover your elemental affinities and harmonies
              </p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
              <div className="text-3xl mb-2">🍽️</div>
              <h3 className="font-semibold text-blue-800 mb-1 text-sm">
                Personalized Recommendations
              </h3>
              <p className="text-xs text-blue-700">
                Get cuisine suggestions tailored to your cosmic profile
              </p>
            </div>
          </div>

          {/* Privacy Notice */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600 text-center">
              🔒 Your data is securely stored and used only to personalize your
              experience. We respect your privacy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
