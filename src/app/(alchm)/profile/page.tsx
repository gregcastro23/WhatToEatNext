"use client";

import { motion } from "framer-motion";
import React from "react";
import { FoodPreferences } from "@/components/profile/FoodPreferences";
import { BirthDataScreen } from "./components/BirthDataScreen";
import { OperatorDashboard } from "./components/OperatorDashboard";
import { RegisteredDashboard } from "./components/RegisteredDashboard";
import { useProfileManagement } from "./components/useProfileManagement";
import type { DashboardProps } from "./components/types";

const ProfileSkeleton: React.FC = () => (
  <div className="min-h-screen bg-[#08080e] flex items-center justify-center">
    <div className="relative">
      <div className="w-14 h-14 rounded-full border-2 border-white/8 animate-spin border-t-purple-400" />
      <div className="absolute inset-0 w-14 h-14 rounded-full border-2 border-transparent animate-spin border-b-amber-400 [animation-delay:0.2s]" />
    </div>
  </div>
);

const ErrorBanner: React.FC<{ error: string }> = ({ error }) => (
  <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 max-w-lg w-full px-4">
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-red-950/90 border border-red-500/30 text-red-300 p-4 rounded-2xl shadow-2xl backdrop-blur-xl"
    >
      <p className="text-xs font-medium">{error}</p>
    </motion.div>
  </div>
);

const NoChartCTA: React.FC<{ onEnterBirthData: () => void }> = ({ onEnterBirthData }) => (
  <div className="min-h-screen bg-[#08080e] flex items-center justify-center">
    <div className="glass-card-premium rounded-3xl p-10 text-center max-w-sm border-white/8">
      <p className="text-white/40 text-sm mb-5">
        Complete your natal chart to access the dashboard.
      </p>
      <button
        onClick={onEnterBirthData}
        className="px-8 py-3 bg-gradient-to-r from-purple-600 to-amber-500 text-white rounded-full font-black text-sm uppercase tracking-[0.2em]"
      >
        Enter Birth Data
      </button>
    </div>
  </div>
);

type ProfileMgmt = ReturnType<typeof useProfileManagement>;

const ProfileContentRouter: React.FC<{ mgmt: ProfileMgmt; dashboardProps: DashboardProps | null }> = ({
  mgmt,
  dashboardProps,
}) => {
  if (mgmt.isFetchingProfile) return <ProfileSkeleton />;

  if (mgmt.currentStep === "birth-data") {
    return (
      <BirthDataScreen
        birthDateTime={mgmt.birthDateTime}
        setBirthDateTime={mgmt.setBirthDateTime}
        birthLocation={mgmt.birthLocation}
        setBirthLocation={mgmt.setBirthLocation}
        onSubmit={(e): void => { mgmt.handleBirthDataSubmit(e).catch(() => {}); }}
        isLoading={mgmt.isLoading}
        hasExistingChart={Boolean(mgmt.profileData?.natalChart)}
        onSkip={mgmt.profileData?.natalChart ? (): void => { mgmt.setCurrentStep("dashboard"); } : undefined}
      />
    );
  }

  if (mgmt.currentStep === "preferences") {
    return (
      <div className="min-h-screen bg-[#08080e] flex items-center justify-center p-6">
        <div className="w-full max-w-2xl">
          <FoodPreferences
            preferences={mgmt.preferences}
            onSave={mgmt.handlePreferencesSave}
            onBack={(): void => { mgmt.setCurrentStep("birth-data"); }}
          />
        </div>
      </div>
    );
  }

  if (dashboardProps) {
    return mgmt.isOperator ? <OperatorDashboard {...dashboardProps} /> : <RegisteredDashboard {...dashboardProps} />;
  }

  return <NoChartCTA onEnterBirthData={(): void => { mgmt.setCurrentStep("birth-data"); }} />;
};

export default function ProfilePage(): React.ReactElement | null {
  const mgmt = useProfileManagement();
  const { session, status, profileData, preferences, setCurrentStep, error } = mgmt;

  if (status === "loading") return <ProfileSkeleton />;
  if (status === "unauthenticated" || !session) return null;

  const dashboardProps: DashboardProps | null = profileData?.natalChart
    ? {
        session,
        profileData,
        natalChart: profileData.natalChart,
        preferences,
        onEditBirthData: (): void => { setCurrentStep("birth-data"); },
        onEditPreferences: (): void => { setCurrentStep("preferences"); },
      }
    : null;

  return (
    <div className="min-h-screen">
      {error && <ErrorBanner error={error} />}
      <ProfileContentRouter mgmt={mgmt} dashboardProps={dashboardProps} />
    </div>
  );
}
