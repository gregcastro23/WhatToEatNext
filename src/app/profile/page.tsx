"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/UserContext";
import { usePersonalization } from "@/hooks/usePersonalization";
import { ProfileHeader } from "./components/ProfileHeader";
import { ElementalAffinitiesChart } from "./components/ElementalAffinitiesChart";
import { PreferencesEditor } from "./components/PreferencesEditor";
import { PersonalizationInsights } from "./components/PersonalizationInsights";
import { GroupManagement } from "./components/GroupManagement";
import { LocationSearch } from "@/components/onboarding/LocationSearch";
import type { BirthData } from "@/types/natalChart";

/**
 * User Profile Page
 * Displays user information, preferences, and personalization insights
 * Shows onboarding form for non-logged-in users
 */
export default function ProfilePage() {
  const router = useRouter();
  const { currentUser, isLoading: userLoading, loadProfile } = useUser();
  const personalization = usePersonalization(currentUser?.userId || null);
  const [mounted, setMounted] = useState(false);

  // Onboarding form state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [birthLocation, setBirthLocation] = useState<{
    displayName: string;
    latitude: number;
    longitude: number;
  } | null>(null);
  const now = new Date();
  const [birthDateTime, setBirthDateTime] = useState(
    now.toISOString().slice(0, 16),
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleOnboardingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!birthLocation) {
      setError("Please select a birth location");
      return;
    }

    setIsSubmitting(true);

    try {
      const birthData: BirthData = {
        dateTime: new Date(birthDateTime).toISOString(),
        latitude: birthLocation.latitude,
        longitude: birthLocation.longitude,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      };

      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, birthData }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Onboarding failed");
      }

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

      // Refresh user context and reload profile
      loadProfile();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!mounted) {
    return null;
  }

  if (userLoading || personalization.data.isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-700">
            Loading your profile...
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Gathering personalization insights
          </p>
        </div>
      </div>
    );
  }

  // Show onboarding form for non-logged-in users
  if (!currentUser) {
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
            <form onSubmit={handleOnboardingSubmit} className="space-y-6">
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
                🔒 Your data is securely stored and used only to personalize
                your experience. We respect your privacy.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Check if user has completed onboarding (has natal chart)
  const hasCompletedOnboarding = !!(
    currentUser.birthData && currentUser.natalChart
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-purple-50 to-blue-50 py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Onboarding Banner - shown if user hasn't completed setup */}
        {!hasCompletedOnboarding && (
          <div className="bg-gradient-to-r from-purple-500 to-orange-500 rounded-xl p-6 text-white shadow-lg">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold mb-2">
                  Complete Your Profile Setup
                </h2>
                <p className="text-purple-100">
                  Add your birth data to unlock personalized recommendations
                  based on your unique alchemical and astrological profile.
                </p>
              </div>
              <a
                href="/onboarding"
                className="flex-shrink-0 px-6 py-3 bg-white text-purple-600 rounded-lg font-semibold hover:bg-purple-50 transition-all duration-200 shadow-md"
              >
                ✨ Complete Setup
              </a>
            </div>
          </div>
        )}

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold alchm-gradient-text mb-2">
            Your Profile
          </h1>
          <p className="text-gray-600">
            Manage your preferences and view personalization insights
          </p>
        </div>

        {/* Profile Header */}
        <ProfileHeader />

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            <ElementalAffinitiesChart
              affinities={personalization.data.preferences.elementalAffinities}
            />
            <PersonalizationInsights
              learningStats={personalization.data.learningStats}
              preferences={{
                cuisines: personalization.data.preferences.cuisines,
                planetaryPreferences:
                  personalization.data.preferences.planetaryPreferences,
              }}
            />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <PreferencesEditor
              preferences={{
                cuisines: personalization.data.preferences.cuisines,
                ingredients: personalization.data.preferences.ingredients,
                complexity: personalization.data.preferences.complexity,
              }}
              onUpdate={async (prefs) => {
                // Save preferences - note: preferences are learned from user interactions
                try {
                  await personalization.refreshPreferences();
                  console.log("Preferences saved:", prefs);
                } catch (error) {
                  console.error("Failed to update preferences:", error);
                }
              }}
            />
          </div>
        </div>

        {/* Group Management Section */}
        <div className="alchm-card p-6">
          <GroupManagement />
        </div>

        {/* Additional Info Section */}
        <div className="alchm-card p-6">
          <h2 className="text-2xl font-bold alchm-gradient-text mb-4">
            About Your Profile
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
              <div className="text-3xl mb-2">🔮</div>
              <h3 className="font-semibold text-purple-800 mb-1">
                Alchemical System
              </h3>
              <p className="text-sm text-purple-700">
                Your preferences are analyzed through our unique alchemical and
                astrological framework
              </p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg">
              <div className="text-3xl mb-2">🎯</div>
              <h3 className="font-semibold text-orange-800 mb-1">
                Personalized Recommendations
              </h3>
              <p className="text-sm text-orange-700">
                The more you interact, the better our recommendations match your
                unique taste profile
              </p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
              <div className="text-3xl mb-2">🌟</div>
              <h3 className="font-semibold text-blue-800 mb-1">
                Elemental Harmony
              </h3>
              <p className="text-sm text-blue-700">
                Discover dishes that resonate with your elemental affinities and
                planetary preferences
              </p>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center text-sm text-gray-500 mt-8 pb-8">
          <p>
            Your profile data is used to personalize recommendations and improve
            your experience.
          </p>
          <p className="mt-1">
            Changes to preferences may take a few moments to reflect in
            recommendations.
          </p>
        </div>
      </div>
    </div>
  );
}
