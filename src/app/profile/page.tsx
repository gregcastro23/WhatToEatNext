"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/UserContext";
import { usePersonalization } from "@/hooks/usePersonalization";
import { ProfileHeader } from "./components/ProfileHeader";
import { AlchemicalProfileDisplay } from "./components/AlchemicalProfileDisplay";
import { PreferencesEditor } from "./components/PreferencesEditor";
import { PersonalizationInsights } from "./components/PersonalizationInsights";
import { GroupManagement } from "./components/GroupManagement";
import { LocationSearch } from "@/components/onboarding/LocationSearch";
import type { BirthData } from "@/types/natalChart";
import { usePrivy } from "@privy-io/react-auth";
import LoginButton from "@/components/LoginButton"; // Assuming LoginButton is in components directory

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

  // Privy hooks for authentication status
  const { ready, authenticated, user } = usePrivy();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (ready && !authenticated) {
      router.push("/"); // Redirect unauthenticated users to the home page
    }
  }, [ready, authenticated, router]);

  // Loading state for Privy and existing user data
  if (!mounted || !ready || userLoading || personalization.data.isLoading) {
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

  // If not authenticated (and ready), the useEffect above will redirect.
  // This block should technically not be reached if the redirect works,
  // but as a fallback or if we decide to show a login modal instead of redirecting.
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex flex-col items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-lg w-full text-center">
          <h1 className="text-3xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-700 mb-6">You must be logged in to view this page.</p>
          <LoginButton />
          <p className="text-sm text-gray-500 mt-4">
            If you do not have an account, you can create one by clicking "Log in".
          </p>
        </div>
      </div>
    );
  }

  // Show onboarding form only if Privy authenticated but no local user data (or natal chart)
  // This assumes currentUser is still managed by UserContext for additional app-specific data
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

          {/* Privy User Info for debugging/display during onboarding */}
          <div className="alchm-card p-8 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Your Privy Account:</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li><span className="font-medium">Privy ID:</span> {user?.id}</li>
              {user?.email && (
                <li><span className="font-medium">Email:</span> {user.email.address}</li>
              )}
              {user?.phone && (
                <li><span className="font-medium">Phone:</span> {user.phone.number}</li>
              )}
            </ul>
            <div className="mt-4">
              <LoginButton />
            </div>
          </div>
          {/* Original Onboarding Form (retained for collecting birth data) */}
          {/* ... (form content remains largely the same, but remove email/name if Privy provides them) ... */}

          <div className="alchm-card p-8">
            <p className="text-lg text-gray-700 mb-6">
              To fully personalize your experience, please provide your birth details:
            </p>
            {/* Name Field - can potentially pre-fill from Privy if available, but keeping for now */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="text"
                value={currentUser?.name || user?.name || ""} // Pre-fill from Privy or existing user
                onChange={(e) => {
                  // This part needs adjustment if UserContext's setName is removed
                  // For now, assuming local state or UserContext handles it
                }}
                placeholder="Your Name"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none"
                required
              />
            </div>

            {/* Birth Date & Time */}
            {/* Retain existing Birth Date & Time and Location Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Birth Date & Time
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="datetime-local"
                value={currentUser?.birthData?.dateTime.slice(0,16) || (new Date()).toISOString().slice(0, 16)} // Pre-fill or default
                onChange={(e) => { /* Update local state or UserContext */ }}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none"
                required
              />
              <p className="text-xs text-gray-500 mt-2">
                Defaults to current moment. Adjust if needed.
              </p>
            </div>

            {/* Location Search */}
            <LocationSearch
              onLocationSelect={(location) => { /* Update local state or UserContext */ }}
            />

            {/* Error Message */}
            {/* ... */}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={false} // Adjust based on actual submitting state
              className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-orange-600 text-white rounded-lg font-semibold text-lg hover:from-purple-700 hover:to-orange-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Complete Onboarding
            </button>
          </div>

          {/* Info Cards */}
          {/* ... */}
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
         {/* Privy User Info and Logout */}
         <div className="alchm-card p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Your Privy Account</h2>
            <ul className="text-gray-700 space-y-1">
              <li><span className="font-semibold">Privy ID:</span> {user?.id}</li>
              {user?.email && <li><span className="font-semibold">Email:</span> {user.email.address}</li>}
              {user?.phone && <li><span className="font-semibold">Phone:</span> {user.phone.number}</li>}
            </ul>
          </div>
          <LoginButton />
        </div>

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
            {currentUser.stats ? (
              <AlchemicalProfileDisplay stats={currentUser.stats} />
            ) : (
              <div className="alchm-card p-6 text-center">
                <p className="text-gray-600">Complete your profile to see your alchemical stats.</p>
              </div>
            )}
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
