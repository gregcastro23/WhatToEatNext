'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import type { NatalChart } from '@/types/natalChart';

export interface UserPreferences {
  dietaryRestrictions: string[];
  preferredCuisines: string[];
  dislikedIngredients: string[];
  spicePreference: 'mild' | 'medium' | 'hot';
  complexity: 'simple' | 'moderate' | 'complex';
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  dietaryRestrictions: [],
  preferredCuisines: [],
  dislikedIngredients: [],
  spicePreference: 'medium',
  complexity: 'moderate',
};

function getStorageItem(key: string): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(key);
}

export function useProfile() {
  const { data: session, status } = useSession();
  const [profileData, setProfileData] = useState<any>(null);
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      if (status === 'loading') return;
      if (status !== 'authenticated' || !session) {
        setIsLoading(false);
        return;
      }

      let profile: any = null;

      try {
        const res = await fetch('/api/user/profile', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.profile) {
            profile = data.profile;
          }
        }
      } catch (err) {
        console.error('Failed to fetch profile from API:', err);
      }

      if (!profile?.natalChart) {
        try {
          const stored = getStorageItem('userProfile');
          if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed?.natalChart) {
              profile = {
                ...parsed,
                userId: parsed.userId || session.user?.id,
                name: parsed.name || session.user?.name,
                email: parsed.email || session.user?.email,
              };
            }
          }
        } catch {
          // ignore
        }
      }

      if (profile) {
        setProfileData(profile);
      }

      const storedPrefs = getStorageItem('userFoodPreferences');
      const loadedPrefs = storedPrefs ? JSON.parse(storedPrefs) : DEFAULT_PREFERENCES;
      setPreferences(loadedPrefs);

      setIsLoading(false);
    }
    fetchProfile();
  }, [status, session]);

  return { profileData, preferences, isLoading, session, status };
}
