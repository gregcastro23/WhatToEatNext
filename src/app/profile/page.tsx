'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import LoginButton from '@/components/LoginButton';

const ProfilePage = () => {
  const router = useRouter();
  const { ready, authenticated, user } = usePrivy();

  useEffect(() => {
    // If Privy is ready and the user is not authenticated,
    // redirect them to the homepage.
    if (ready && !authenticated) {
      router.push('/');
    }
  }, [ready, authenticated, router]);

  // While Privy is initializing, show a loading spinner.
  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
        <p className="ml-4 text-gray-700">Loading Account...</p>
      </div>
    );
  }

  // If the user is authenticated, show their profile/dashboard.
  // The useEffect above will handle redirecting unauthenticated users.
  return authenticated ? (
    <div className="min-h-screen bg-gray-50 p-6 flex flex-col items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-lg w-full">
        <h1 className="text-3xl font-bold text-purple-700 mb-6 text-center">Your Profile</h1>
        
        <div className="mb-6 border-t pt-4">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Your Privy Account Details</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700 break-all">
            <li><span className="font-medium">Privy DID:</span> {user?.id}</li>
            {user?.email && (
              <li><span className="font-medium">Email:</span> {user.email.address}</li>
            )}
            {user?.phone && (
              <li><span className="font-medium">Phone:</span> {user.phone.number}</li>
            )}
          </ul>
        </div>

        <div className="mt-6 flex justify-center">
            <LoginButton />
        </div>
      </div>
    </div>
  ) : null; // Render nothing while the redirect is in progress
};

export default ProfilePage;
