"use client";

import React, { useEffect, useState } from "react";
import { useUser } from "@/contexts/UserContext";
import { usePersonalization } from "@/hooks/usePersonalization";
import { ProfileHeader } from "./components/ProfileHeader";
import { ElementalAffinitiesChart } from "./components/ElementalAffinitiesChart";
import { PreferencesEditor } from "./components/PreferencesEditor";
import { PersonalizationInsights } from "./components/PersonalizationInsights";
import { BirthChartInput } from "./components/BirthChartInput";
import { BirthChartDisplay } from "./components/BirthChartDisplay";
import {
  calculateNatalChart,
  getDefaultBirthData,
  type NatalChart,
} from "@/services/natalChartService";

/**
 * User Profile Page
 * Displays user information, preferences, and personalization insights
 */
interface BirthLocation {
  latitude: number;
  longitude: number;
  city?: string;
  country?: string;
}

interface BirthData {
  birthDate: string;
  birthTime: string;
  birthLocation: BirthLocation;
}

export default function ProfilePage() {
  const { currentUser, isLoading: userLoading, updateProfile } = useUser();
  const personalization = usePersonalization(currentUser?.userId || null);
  const [mounted, setMounted] = useState(false);
  const [showBirthChartInput, setShowBirthChartInput] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [calculationError, setCalculationError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCalculateBirthChart = async (birthData: BirthData) => {
    setIsCalculating(true);
    setCalculationError(null);

    try {
      // Calculate natal chart
      const natalChart = await calculateNatalChart(birthData);

      // Update user profile with birth data and natal chart
      await updateProfile({
        birthData,
        natalChart,
      });

      setShowBirthChartInput(false);
    } catch (error) {
      console.error("Error calculating birth chart:", error);
      setCalculationError(
        error instanceof Error ? error.message : "Failed to calculate birth chart",
      );
    } finally {
      setIsCalculating(false);
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

        {/* Birth Chart Section */}
        <div className="mb-6">
          {currentUser?.natalChart && !showBirthChartInput ? (
            <BirthChartDisplay
              natalChart={currentUser.natalChart}
              birthData={currentUser.birthData}
              onEdit={() => setShowBirthChartInput(true)}
            />
          ) : (
            <div>
              <BirthChartInput
                initialData={currentUser?.birthData || getDefaultBirthData()}
                onSave={handleCalculateBirthChart}
                onCancel={
                  currentUser?.natalChart
                    ? () => setShowBirthChartInput(false)
                    : undefined
                }
              />
              {isCalculating && (
                <div className="mt-4 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-4 border-purple-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    Calculating your natal chart...
                  </p>
                </div>
              )}
              {calculationError && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800">{calculationError}</p>
                </div>
              )}
            </div>
          )}
        </div>

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
              onUpdate={(prefs) => {
                // Handle preference updates
                // In a real implementation, this would save to backend
                console.log("Preferences updated:", prefs);
              }}
            />
          </div>
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
