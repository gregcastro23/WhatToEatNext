'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import LoginButton from '@/components/LoginButton';
import { BirthDataForm } from '@/components/profile/BirthDataForm';
import { AlchemicalDashboard } from '@/components/profile/AlchemicalDashboard';

// Safe hook that gracefully handles missing PrivyProvider
function usePrivySafe() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { usePrivy } = require('@privy-io/react-auth');
    return usePrivy();
  } catch {
    return {
      ready: true,
      authenticated: false,
      user: null,
      getAccessToken: async () => null,
      logout: () => {},
      login: () => {},
    };
  }
}

const ProfilePage = () => {
  const router = useRouter();
  const { ready, authenticated, user, getAccessToken, logout, login } = usePrivySafe();
  const [profileData, setProfileData] = useState<any>(null);
  const [dbProfile, setDbProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch DB profile on mount
  useEffect(() => {
    async function fetchProfile() {
      if (ready && authenticated) {
        try {
          const token = await getAccessToken();
          const res = await fetch('/api/user/profile', {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          if (res.ok) {
            const data = await res.json();
            if (data.success && data.profile) {
              setDbProfile(data.profile);
            }
          }
        } catch (err) {
          console.error("Failed to fetch profile:", err);
        }
      }
    }
    fetchProfile();
  }, [ready, authenticated, getAccessToken]);

  const handleOnboardingSubmit = async (data: any) => {
    setIsLoading(true);
    setError(null);
    try {
      const token = await getAccessToken();
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
      
      const response = await fetch(`${backendUrl}/api/user/onboarding`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error('Failed to calculate chart');
      }

      const result = await response.json();
      setProfileData(result);
      
      // Also refresh DB profile
      const profileRes = await fetch('/api/user/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (profileRes.ok) {
        const profileData = await profileRes.json();
        if (profileData.success) setDbProfile(profileData.profile);
      }
      
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
        <p className="ml-4 text-gray-700">Loading Account...</p>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4 text-center">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
          <h1 className="text-3xl font-bold text-purple-800 mb-4">Alchemist Profile</h1>
          <p className="text-gray-600 mb-8">
            Unlock your cosmic culinary journey. Sign up or log in to access your personalized alchemical dashboard.
          </p>
          <button 
            onClick={login}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-bold shadow-md hover:from-purple-700 hover:to-indigo-700 transition-all duration-200"
          >
            Log in / Sign up
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="bg-white p-6 rounded-lg shadow-sm flex flex-col md:flex-row justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-purple-800">Alchemist Profile</h1>
            <p className="text-gray-500 text-sm mt-1">ID: {user?.id?.slice(0, 12)}...</p>
            {user?.email && <p className="text-gray-400 text-xs">{user.email.address}</p>}
          </div>
          <div className="mt-4 md:mt-0 flex gap-2">
            <button 
              onClick={logout}
              className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
            >
              Log Out
            </button>
            <LoginButton />
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg shadow-sm flex items-center">
            <svg className="h-5 w-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
            </svg>
            <p className="font-medium text-sm">Error: {error}. Please try again or check your input values.</p>
          </div>
        )}

        {/* Main Content Area */}
        {isLoading ? (
          <div className="space-y-6 w-full max-w-4xl mx-auto animate-pulse">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="h-64 bg-gray-200 rounded-lg shadow-sm"></div>
              <div className="h-64 bg-gray-200 rounded-lg shadow-sm"></div>
            </div>
            <div className="h-48 bg-gray-200 rounded-lg shadow-sm"></div>
          </div>
        ) : profileData || (dbProfile && dbProfile.astrologicalData) ? (
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg text-center">
              ✨ Natal Chart Successfully Calculated!
            </div>
            <AlchemicalDashboard data={profileData || dbProfile} />
            <div className="text-center">
                <button 
                    onClick={() => {
                      setProfileData(null);
                      setDbProfile(null);
                    }}
                    className="text-sm text-gray-500 hover:text-purple-600 underline"
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
