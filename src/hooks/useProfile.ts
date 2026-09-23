'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { z } from 'zod';
import { readJson } from '@/lib/api/json';
import { _logger } from '@/lib/logger';
import {
  ServerProfileResponseSchema,
  toDomainUserProfile,
  toDomainNatalChart,
  type DomainUserProfile,
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

const UserPreferencesSchema = z.object({
  dietaryRestrictions: z.array(z.string()).default([]),
  preferredCuisines: z.array(z.string()).default([]),
  dislikedIngredients: z.array(z.string()).default([]),
  spicePreference: z.enum(['mild', 'medium', 'hot']).default('medium'),
  complexity: z.enum(['simple', 'moderate', 'complex']).default('moderate'),
});

export const DEFAULT_PREFERENCES: UserPreferences = {
  dietaryRestrictions: [],
  preferredCuisines: [],
  dislikedIngredients: [],
  spicePreference: 'medium',
  complexity: 'moderate',
};

export type ProfileRecord = Omit<DomainUserProfile, 'natalChart'> & {
  natalChart?: NatalChart;
  preferences?: UserPreferences | Record<string, unknown>;
  [key: string]: unknown;
};

export interface UseProfileReturn {
  profileData: ProfileRecord | null;
  preferences: UserPreferences;
  isLoading: boolean;
  session: Session | null;
  status: 'authenticated' | 'loading' | 'unauthenticated';
}

interface StoredProfileData {
  userId?: string;
  name?: string;
  email?: string;
  birthData?: DomainUserProfile['birthData'];
  natalChart?: NatalChart;
  preferences?: UserPreferences | Record<string, unknown>;
  [key: string]: unknown;
}

function isStoredProfileData(val: unknown): val is StoredProfileData {
  return typeof val === 'object' && val !== null && !Array.isArray(val);
}

function getStorageItem(key: string): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(key);
}

function matchesOwnership(parsed: StoredProfileData, currentUserId?: string, currentEmail?: string): boolean {
  if (parsed.userId && currentUserId && parsed.userId !== currentUserId) {
    if (typeof window !== 'undefined') localStorage.removeItem('userProfile');
    return false;
  }
  if (parsed.email && currentEmail && parsed.email.toLowerCase() !== currentEmail.toLowerCase()) {
    return false;
  }
  return true;
}

function resolveLocalBackupProfile(
  existingProfile: ProfileRecord | null,
  currentUserId?: string,
  currentEmail?: string,
  currentName?: string,
): ProfileRecord | null {
  if (existingProfile?.natalChart) return existingProfile;

  try {
    const stored = getStorageItem('userProfile');
    if (!stored) return existingProfile;

    const raw: unknown = JSON.parse(stored);
    if (!isStoredProfileData(raw) || !raw.natalChart) {
      return existingProfile;
    }

    if (!matchesOwnership(raw, currentUserId, currentEmail)) {
      return existingProfile;
    }

    const resolvedName = existingProfile?.name ?? currentName ?? (typeof raw.name === 'string' ? raw.name : undefined);
    const resolvedEmail = existingProfile?.email ?? currentEmail ?? (typeof raw.email === 'string' ? raw.email : undefined);
    const resolvedUserId = existingProfile?.userId ?? currentUserId ?? (typeof raw.userId === 'string' ? raw.userId : '') ?? '';

    const backup: ProfileRecord = {
      ...(existingProfile ?? {}),
      userId: resolvedUserId,
      natalChart: raw.natalChart,
    };
    if (resolvedName) backup.name = resolvedName;
    if (resolvedEmail) backup.email = resolvedEmail;
    if (raw.birthData && !existingProfile?.birthData) backup.birthData = raw.birthData;

    return backup;
  } catch {
    return existingProfile;
  }
}

async function fetchRemoteProfile(
  sessionUserId?: string,
): Promise<ProfileRecord | null> {
  try {
    const res = await fetch('/api/user/profile', { credentials: 'include' });
    if (!res.ok) return null;

    const data = await readJson(res, {
      parse: (x) => ServerProfileResponseSchema.parse(x),
    });
    if (!data.success || !data.profile) return null;

    const domain = toDomainUserProfile(data.profile, sessionUserId);
    const { natalChart: _wireChart, ...restDomain } = domain;
    const profile: ProfileRecord = {
      ...restDomain,
    };
    if (domain.name) profile.name = domain.name;
    if (domain.email) profile.email = domain.email;
    if (data.profile.natalChart) {
      profile.natalChart = toDomainNatalChart(data.profile.natalChart);
    }
    return profile;
  } catch (err) {
    _logger.error('Failed to fetch profile from API:', err);
    return null;
  }
}

function resolveStoredPreferences(): UserPreferences {
  const storedPrefs = getStorageItem('userFoodPreferences');
  if (!storedPrefs) return DEFAULT_PREFERENCES;
  try {
    const raw: unknown = JSON.parse(storedPrefs);
    const result = UserPreferencesSchema.safeParse(raw);
    return result.success ? result.data : DEFAULT_PREFERENCES;
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export function useProfile(): UseProfileReturn {
  const { data: session, status } = useSession();
  const [profileData, setProfileData] = useState<ProfileRecord | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadProfile(): Promise<void> {
      if (status === 'loading') return;
      if (status !== 'authenticated') {
        setIsLoading(false);
        return;
      }

      const remote = await fetchRemoteProfile(session.user?.id ?? undefined);
      const profile = resolveLocalBackupProfile(
        remote,
        session.user?.id ?? undefined,
        session.user?.email ?? undefined,
        session.user?.name ?? undefined,
      );

      if (profile) setProfileData(profile);
      setPreferences(resolveStoredPreferences());
      setIsLoading(false);
    }

    loadProfile().catch((err: unknown) => {
      _logger.error('Unhandled error in useProfile loadProfile:', err);
    });
  }, [status, session]);

  return { profileData, preferences, isLoading, session, status };
}
