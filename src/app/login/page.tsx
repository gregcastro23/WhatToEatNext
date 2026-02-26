'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

// Default state when Privy is unavailable
const DEFAULT_PRIVY_STATE = { ready: true, authenticated: false, login: () => {}, logout: () => {} };

// Resolve the usePrivy hook at module level so calls are never conditional
let _usePrivy: (() => typeof DEFAULT_PRIVY_STATE) | null = null;
try {
   
  const mod = require('@privy-io/react-auth');
  _usePrivy = mod.usePrivy;
} catch {
  // Privy not available
}

function usePrivySafe() {
  if (_usePrivy) {
    try {
      return _usePrivy();
    } catch {
      return DEFAULT_PRIVY_STATE;
    }
  }
  return DEFAULT_PRIVY_STATE;
}

export default function LoginPage() {
  const [privyAvailable, setPrivyAvailable] = useState(true);
  const { ready, authenticated, login } = usePrivySafe();
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
                <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                "Log in with Google"
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
