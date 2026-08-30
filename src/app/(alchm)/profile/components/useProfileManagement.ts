import { useSession } from "next-auth/react";
import { useState, useEffect, useCallback } from "react";
import {
  executeOnboarding,
  fetchServerProfile,
  getStorageItem,
  loadInitialPreferences,
  parseStoredProfile,
  triggerQuestReward,
} from "./onboardingApi";
import {
  type ProfileStep,
  type UserPreferences,
  type UserProfileData,
  type LocationData,
  DEFAULT_PREFERENCES,
} from "./types";

function useProfileDataLoader(): {
  profileData: UserProfileData | null;
  preferences: UserPreferences;
  isFetchingProfile: boolean;
  setPreferences: React.Dispatch<React.SetStateAction<UserPreferences>>;
} {
  const { data: session } = useSession();
  const [profileData, setProfileData] = useState<UserProfileData | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [isFetchingProfile, setIsFetchingProfile] = useState(true);

  const loadProfile = useCallback(async (): Promise<void> => {
    if (!session) {
      setIsFetchingProfile(false);
      return;
    }
    const { profile: srvProfile, serverLoaded } = await fetchServerProfile();
    let profile = srvProfile;

    if (serverLoaded && profile && !profile.natalChart && typeof window !== "undefined") {
      localStorage.removeItem("userProfile");
    }

    if (!serverLoaded && session?.user) {
      profile = parseStoredProfile(
        getStorageItem("userProfile"),
        session.user.id ?? "",
        session.user.name ?? "",
        session.user.email ?? "",
      );
    }

    if (profile) setProfileData(profile);
    setPreferences(loadInitialPreferences());
    setIsFetchingProfile(false);
  }, [session]);

  useEffect(() => {
    loadProfile().catch(() => {});
  }, [loadProfile]);

  return { profileData, preferences, isFetchingProfile, setPreferences };
}

async function handleOnboardingFlow(
  session: ReturnType<typeof useSession>["data"],
  birthLocation: LocationData,
  birthDateTime: string,
  updateSession: () => Promise<unknown>,
): Promise<{ success: boolean; message?: string }> {
  if (!session?.user?.email || !session.user.name) {
    return { success: false, message: "Session missing user info. Please log out and log in again." };
  }
  const res = await executeOnboarding(session.user.email, session.user.name, birthLocation, birthDateTime);
  if (!res.success) return { success: false, message: res.message ?? "Chart calculation failed" };

  localStorage.setItem("userProfile", JSON.stringify({
    userId: session.user.id,
    email: session.user.email,
    name: session.user.name,
    birthData: res.birthData,
    natalChart: res.natalChart,
  }));
  await updateSession();
  document.cookie = "onboarding_completed=1; path=/; max-age=2592000; SameSite=Lax";
  window.location.href = "/profile";
  return { success: true };
}

function useBirthDataSubmission(
  session: ReturnType<typeof useSession>["data"],
  updateSession: () => Promise<unknown>,
  setError: React.Dispatch<React.SetStateAction<string | null>>,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
): {
  birthDateTime: string;
  birthLocation: LocationData | null;
  setBirthDateTime: React.Dispatch<React.SetStateAction<string>>;
  setBirthLocation: React.Dispatch<React.SetStateAction<LocationData | null>>;
  handleBirthDataSubmit: (e: React.FormEvent) => Promise<void>;
} {
  const [birthDateTime, setBirthDateTime] = useState("");
  const [birthLocation, setBirthLocation] = useState<LocationData | null>(null);

  const handleBirthDataSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setError(null);
    if (!birthLocation) { setError("Please select a birth location."); return; }
    if (!birthDateTime) { setError("Please enter your birth date and time."); return; }

    setIsLoading(true);
    try {
      const res = await handleOnboardingFlow(session, birthLocation, birthDateTime, updateSession);
      if (!res.success && res.message) setError(res.message);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred while calculating your chart");
    } finally {
      setIsLoading(false);
    }
  };

  return { birthDateTime, birthLocation, setBirthDateTime, setBirthLocation, handleBirthDataSubmit };
}

function usePreferencesSaver(
  setPreferences: React.Dispatch<React.SetStateAction<UserPreferences>>,
  setCurrentStep: React.Dispatch<React.SetStateAction<ProfileStep>>,
): (updatedPrefs: UserPreferences) => void {
  return (updatedPrefs: UserPreferences): void => {
    setPreferences(updatedPrefs);
    if (typeof window !== "undefined") {
      localStorage.setItem("userFoodPreferences", JSON.stringify(updatedPrefs));
      localStorage.setItem("preferencesCompleted", "true");
    }
    fetch("/api/user/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ preferences: updatedPrefs }),
    }).catch(() => {});

    triggerQuestReward(updatedPrefs);
    setCurrentStep("dashboard");
  };
}

export interface ProfileManagementState {
  session: ReturnType<typeof useSession>["data"];
  status: ReturnType<typeof useSession>["status"];
  profileData: UserProfileData | null;
  preferences: UserPreferences;
  currentStep: ProfileStep;
  isLoading: boolean;
  isFetchingProfile: boolean;
  error: string | null;
  birthDateTime: string;
  birthLocation: LocationData | null;
  isOperator: boolean;
  setCurrentStep: (step: ProfileStep) => void;
  setBirthDateTime: (val: string) => void;
  setBirthLocation: (val: LocationData | null) => void;
  handleBirthDataSubmit: (e: React.FormEvent) => Promise<void>;
  handlePreferencesSave: (updatedPrefs: UserPreferences) => void;
}

export function useProfileManagement(): ProfileManagementState {
  const { data: session, status, update: updateSession } = useSession();
  const isOperator = session?.user?.role === "admin";
  const { profileData, preferences, isFetchingProfile, setPreferences } = useProfileDataLoader();
  const [currentStep, setCurrentStep] = useState<ProfileStep>("birth-data");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const birthSub = useBirthDataSubmission(session, updateSession, setError, setIsLoading);
  const handlePreferencesSave = usePreferencesSaver(setPreferences, setCurrentStep);

  useEffect(() => {
    if (!isFetchingProfile) {
      setCurrentStep(profileData?.natalChart ? "dashboard" : "birth-data");
    }
  }, [isFetchingProfile, profileData]);

  return {
    session,
    status,
    profileData,
    preferences,
    currentStep,
    isLoading,
    isFetchingProfile,
    error,
    isOperator,
    setCurrentStep,
    handlePreferencesSave,
    ...birthSub,
  };
}
