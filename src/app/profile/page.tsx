"use client";

import React, { useEffect, useState } from "react";
import { useUser } from "@/contexts/UserContext";
import { usePersonalization } from "@/hooks/usePersonalization";
import { ProfileHeader } from "./components/ProfileHeader";
import { ElementalAffinitiesChart } from "./components/ElementalAffinitiesChart";
import { PreferencesEditor } from "./components/PreferencesEditor";
import { PersonalizationInsights } from "./components/PersonalizationInsights";
import { GroupManagement } from "./components/GroupManagement";

/**
 * User Profile Page
 * Displays user information, preferences, and personalization insights
 */
export default function ProfilePage() {
  const { currentUser, isLoading: userLoading } = useUser();
  const personalization = usePersonalization(currentUser?.userId || null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-purple-50 to-blue-50 flex items-center justify-center">
        <div className="alchm-card p-8 max-w-md mx-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold alchm-gradient-text mb-4">
              Profile Access Required
            </h1>
            <p className="text-gray-600 mb-6">
              Please log in to view and manage your profile.
            </p>
            <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-orange-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-orange-700 transition-all duration-200">
              Log In
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-purple-50 to-blue-50 py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-6">
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
                // Save preferences to backend
                try {
                  await personalization.actions.updatePreferences(prefs);
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
