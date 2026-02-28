'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/profile');
    }
  }, [status, router]);

  const loading = status === 'loading';

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-purple-100">
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600 mb-2">
          Alchm Kitchen
        </h1>
        <p className="text-gray-600 mb-8 font-medium">
          The Menu of the Moment in the Stars and Elements
        </p>

        <div className="space-y-4">
          <button
            disabled={loading}
            onClick={() => signIn('google', { callbackUrl: '/profile' })}
            className="w-full py-3 px-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-bold shadow-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              "Log in with Google"
            )}
          </button>

          <p className="text-xs text-gray-400 px-4">
            By logging in, you agree to our alchemical terms of service and cosmic privacy policy.
          </p>
        </div>
      </div>

      <div className="mt-8 text-sm text-gray-500 italic animate-pulse">
        Calculating current planetary positions...
      </div>
    </div>
  );
}
