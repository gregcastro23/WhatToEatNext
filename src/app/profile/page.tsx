'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import LoginButton from '@/components/LoginButton';
import { BirthDataForm } from '@/components/profile/BirthDataForm';
import { AlchemicalDashboard } from '@/components/profile/AlchemicalDashboard';

const ProfilePage = () => {
  const router = useRouter();
  const { ready, authenticated, user, getAccessToken } = usePrivy();
  const [profileData, setProfileData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (ready && !authenticated) {
      router.push('/');
    }
  }, [ready, authenticated, router]);

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

  if (!authenticated) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="bg-white p-6 rounded-lg shadow-sm flex flex-col md:flex-row justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-purple-800">Alchemist Profile</h1>
            <p className="text-gray-500 text-sm mt-1">ID: {user?.id?.slice(0, 12)}...</p>
          </div>
          <div className="mt-4 md:mt-0">
            <LoginButton />
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
            {error}
          </div>
        )}

        {/* Main Content Area */}
        {profileData ? (
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg text-center">
              ✨ Natal Chart Successfully Calculated!
            </div>
            <AlchemicalDashboard data={profileData} />
            <div className="text-center">
                <button 
                    onClick={() => setProfileData(null)}
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
