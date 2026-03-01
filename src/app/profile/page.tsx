'use client';

import { useEffect, useState } from 'react';
import { signIn, signOut, useSession } from 'next-auth/react';
import { useAlchemical } from '@/contexts/AlchemicalContext/hooks';
import { AlchemicalDashboard } from '@/components/profile/AlchemicalDashboard';
import { BirthDataForm } from '@/components/profile/BirthDataForm';

const ProfilePage = () => {
  const { data: session, status, update: updateSession } = useSession();
  const { state, getDominantElement, getAlchemicalHarmony } = useAlchemical();
  const [natalData, setNatalData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingProfile, setIsFetchingProfile] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch existing profile on mount
  useEffect(() => {
    async function fetchProfile() {
      if (status !== 'authenticated' || !session) {
        setIsFetchingProfile(false);
        return;
      }
      try {
        const res = await fetch('/api/user/profile', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.profile?.natalChart) {
            setNatalData(data.profile);
          }
        }
      } catch (err) {
        console.error('Failed to fetch profile:', err);
      } finally {
        setIsFetchingProfile(false);
      }
    }
    fetchProfile();
  }, [status, session]);

  const handleOnboardingSubmit = async (formData: {
    birth_date: string;
    birth_time: string;
    latitude: number;
    longitude: number;
    city_name: string;
    state_country: string;
  }) => {
    if (!session?.user?.email || !session?.user?.name) {
      setError('Session missing user info. Please log out and log in again.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Build ISO dateTime from date + time fields
      const dateTime = new Date(`${formData.birth_date}T${formData.birth_time}:00`).toISOString();

      const response = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: session.user.email,
          name: session.user.name,
          birthData: {
            dateTime,
            latitude: formData.latitude,
            longitude: formData.longitude,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            cityName: formData.city_name,
            stateCountry: formData.state_country,
          },
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Onboarding failed');
      }

      // Refresh NextAuth session so middleware sees onboardingComplete
      await updateSession();

      // Refresh profile from DB to get full natal chart
      const profileRes = await fetch('/api/user/profile', { credentials: 'include' });
      if (profileRes.ok) {
        const profileData = await profileRes.json();
        if (profileData.success && profileData.profile) {
          setNatalData(profileData.profile);
        }
      }
    } catch (err: any) {
      console.error('Onboarding error:', err);
      setError(err.message || 'An error occurred while calculating your chart');
    } finally {
      setIsLoading(false);
    }
  };

  // ── Loading state ──
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-orange-50 to-blue-50 p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500" />
        <p className="ml-4 text-gray-700">Loading account...</p>
      </div>
    );
  }

  // ── Unauthenticated ──
  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 via-orange-50 to-blue-50 px-4 text-center">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-purple-100">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-orange-600 mb-2">
            Alchemist Profile
          </h1>
          <p className="text-gray-600 mb-8">
            Unlock your cosmic culinary journey. Sign in to access your personalized alchemical dashboard.
          </p>
          <button
            onClick={() => signIn('google', { callbackUrl: '/profile' })}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-bold shadow-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-200"
          >
            Sign in with Google
          </button>
        </div>

        {/* Current cosmic status */}
        <div className="mt-6 text-sm text-gray-500 flex items-center gap-3">
          <span className="capitalize">{state.currentSeason}</span>
          <span className="text-gray-300">|</span>
          <span>Dominant: {getDominantElement()}</span>
          <span className="text-gray-300">|</span>
          <span>Harmony: {(getAlchemicalHarmony() * 100).toFixed(0)}%</span>
        </div>
      </div>
    );
  }

  // ── Authenticated ──
  const hasNatalChart = !!(natalData?.natalChart);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-orange-50 to-blue-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Header */}
        <div className="bg-white p-6 rounded-xl shadow-sm flex flex-col md:flex-row justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-orange-600">
              Alchemist Profile
            </h1>
            {session?.user?.name && (
              <p className="text-gray-600 text-sm mt-1">{session.user.name}</p>
            )}
            {session?.user?.email && (
              <p className="text-gray-400 text-xs">{session.user.email}</p>
            )}
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="mt-4 md:mt-0 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium border border-red-200"
          >
            Log Out
          </button>
        </div>

        {/* Current cosmic status bar */}
        <div className="bg-white rounded-xl shadow-sm p-4 flex flex-wrap items-center justify-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-gray-600">Season: <span className="font-medium capitalize text-gray-800">{state.currentSeason}</span></span>
          </div>
          <span className="text-gray-300">|</span>
          <span className="text-gray-600">Time: <span className="font-medium text-gray-800">{state.timeOfDay}</span></span>
          <span className="text-gray-300">|</span>
          <span className="text-gray-600">Element: <span className="font-medium text-gray-800">{getDominantElement()}</span></span>
          <span className="text-gray-300">|</span>
          <span className="text-gray-600">Harmony: <span className="font-medium text-gray-800">{(getAlchemicalHarmony() * 100).toFixed(0)}%</span></span>
        </div>

        {/* Error display */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl shadow-sm">
            <p className="font-medium text-sm">{error}</p>
          </div>
        )}

        {/* Main content */}
        {isFetchingProfile ? (
          <div className="space-y-6 animate-pulse">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="h-64 bg-white/60 rounded-xl" />
              <div className="h-64 bg-white/60 rounded-xl" />
            </div>
            <div className="h-48 bg-white/60 rounded-xl" />
          </div>
        ) : hasNatalChart ? (
          <div className="space-y-6">
            <AlchemicalDashboard data={natalData} />
            <div className="text-center">
              <button
                onClick={() => setNatalData(null)}
                className="text-sm text-gray-500 hover:text-purple-600 underline transition-colors"
              >
                Recalculate Chart
              </button>
            </div>
          </div>
        ) : (
          <BirthDataForm onSubmit={handleOnboardingSubmit} isLoading={isLoading} />
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
