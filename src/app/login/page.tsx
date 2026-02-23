'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

// Safe hook that returns Privy state without crashing when provider is absent
function usePrivySafe() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { usePrivy } = require('@privy-io/react-auth');
    return usePrivy();
  } catch {
    return { ready: true, authenticated: false, login: () => {}, logout: () => {} };
  }
}

export default function LoginPage() {
  const [privyAvailable, setPrivyAvailable] = useState(true);
  let privyState = { ready: false, authenticated: false, login: () => {}, logout: () => {} };

  try {
    privyState = usePrivySafe();
  } catch {
    // Will be handled below
  }

  const { ready, authenticated, login } = privyState;
  const router = useRouter();

  useEffect(() => {
    // Check if Privy is actually configured
    const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
    if (!appId || appId.trim() === '' || appId === 'undefined') {
      setPrivyAvailable(false);
    }
  }, []);

  useEffect(() => {
    if (ready && authenticated) {
      router.push('/profile');
    }
  }, [ready, authenticated, router]);

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
          {!privyAvailable ? (
            <div className="py-4 px-6 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
              <p className="font-semibold mb-1">Authentication Not Configured</p>
              <p className="text-xs">Login requires Privy configuration. All public pages (cooking methods, cuisines, ingredients) are fully accessible without an account.</p>
            </div>
          ) : (
            <button
              disabled={!ready}
              onClick={login}
              className="w-full py-3 px-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-bold shadow-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {!ready ? (
                <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
              ) : (
                "✨ Log in / Sign up"
              )}
            </button>
          )}

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
