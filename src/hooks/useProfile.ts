'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { readJson } from '@/lib/api/json';
import { _logger } from '@/lib/logger';
import {
  ServerProfileResponseSchema,
  toDomainUserProfile,
} from '@/lib/validation/userProfileResponseSchemas';
import type { NatalChart } from '@/types/natalChart';
import type { Session } from 'next-auth';

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

export interface ProfileRecord {
  userId?: string;
  name?: string;
  email?: string;
  natalChart?: NatalChart;
  preferences?: UserPreferences | Record<string, unknown>;
  [key: string]: unknown;
}

export interface UseProfileReturn {
  profileData: ProfileRecord | null;
  preferences: UserPreferences;
  isLoading: boolean;
  session: Session | null;
  status: 'authenticated' | 'loading' | 'unauthenticated';
}

function getStorageItem(key: string): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(key);
}

export function useProfile(): UseProfileReturn {
  const { data: session, status } = useSession();
  const [profileData, setProfileData] = useState<ProfileRecord | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchProfile(): Promise<void> {
      if (status === 'loading') return;
      if (status !== 'authenticated') {
        setIsLoading(false);
        return;
      }

      let profile: ProfileRecord | null = null;
      let serverProfileLoaded = false;

      try {
        const res = await fetch('/api/user/profile', { credentials: 'include' });
        if (res.ok) {
          const data = await readJson(res, {
            parse: (x) => ServerProfileResponseSchema.parse(x),
          });
          if (data.success && data.profile) {
            const domain = toDomainUserProfile(data.profile, session.user?.id ?? undefined);
            const domainChart = domain.natalChart;
            profile = {
              userId: domain.userId,
              ...(domain.name ? { name: domain.name } : {}),
              ...(domain.email ? { email: domain.email } : {}),
              ...(domain.preferences !== undefined ? { preferences: domain.preferences } : {}),
              ...(domainChart ? { natalChart: domainChart as NatalChart } : {}),
            };
            serverProfileLoaded = true;
          }
        }
      } catch (err) {
        _logger.error('Failed to fetch profile from API:', err);
      }

      if (serverProfileLoaded && !profile?.natalChart && typeof window !== 'undefined') {
        localStorage.removeItem('userProfile');
      }

      if (!serverProfileLoaded && !profile?.natalChart) {
        try {
          const stored = getStorageItem('userProfile');
          if (stored) {
            const parsed = JSON.parse(stored) as ProfileRecord | null;
            if (parsed && typeof parsed === 'object' && parsed.natalChart) {
              const resolvedName = parsed.name ?? session.user?.name ?? undefined;
              const resolvedEmail = parsed.email ?? session.user?.email ?? undefined;
              profile = {
                ...parsed,
                userId: parsed.userId ?? (session.user?.id ?? ""),
                ...(resolvedName ? { name: resolvedName } : {}),
                ...(resolvedEmail ? { email: resolvedEmail } : {}),
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
      if (storedPrefs) {
        try {
          const loadedPrefs = JSON.parse(storedPrefs) as UserPreferences | null;
          if (loadedPrefs && typeof loadedPrefs === 'object') {
            setPreferences(loadedPrefs);
          } else {
            setPreferences(DEFAULT_PREFERENCES);
          }
        } catch {
          setPreferences(DEFAULT_PREFERENCES);
        }
      } else {
        setPreferences(DEFAULT_PREFERENCES);
      }

      setIsLoading(false);
    }
    fetchProfile().catch((err: unknown) => {
      _logger.error('Unhandled error in useProfile fetchProfile:', err);
    });
  }, [status, session]);

  return { profileData, preferences, isLoading, session, status };
}
