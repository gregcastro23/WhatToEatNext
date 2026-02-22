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
        ) : profileData ? (
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
