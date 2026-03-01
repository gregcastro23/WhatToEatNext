'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { signIn, useSession } from 'next-auth/react';

export default function LoginPage() {
  const { status } = useSession();
  const router = useRouter();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/profile');
    }
  }, [status, router]);

  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    setError(null);
    try {
      await signIn('google', { callbackUrl: '/profile' });
    } catch {
      setError('Something went wrong. Please try again.');
      setIsSigningIn(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500" />
      </div>
    );
  }

  if (status === 'authenticated') {
    return null;
  }

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-12">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-purple-100">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-orange-600 mb-2">
            Welcome to Alchm Kitchen
          </h1>
          <p className="text-gray-600 text-sm">
            Sign in to unlock your personalized culinary journey based on
            alchemical and astrological insights.
          </p>
        </div>

        {/* Error display */}
        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm text-center">{error}</p>
          </div>
        )}

        {/* Google Sign-In */}
        <button
          disabled={isSigningIn}
          onClick={handleGoogleSignIn}
          className="w-full py-3 px-6 bg-white border-2 border-gray-300 rounded-xl font-semibold text-gray-700 shadow-sm hover:shadow-md hover:border-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
        >
          {isSigningIn ? (
            <span className="animate-spin h-5 w-5 border-2 border-gray-500 border-t-transparent rounded-full" />
          ) : (
            <>
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continue with Google
            </>
          )}
        </button>

        {/* What you get */}
        <div className="mt-8 pt-6 border-t border-gray-100">
          <p className="text-xs text-gray-500 text-center mb-4 font-medium uppercase tracking-wide">
            What you get
          </p>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-purple-500 mt-0.5 shrink-0">&#x2713;</span>
              <p className="text-sm text-gray-600">
                Personalized natal chart based on your birth data
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-purple-500 mt-0.5 shrink-0">&#x2713;</span>
              <p className="text-sm text-gray-600">
                Real-time culinary recommendations aligned to planetary positions
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-purple-500 mt-0.5 shrink-0">&#x2713;</span>
              <p className="text-sm text-gray-600">
                Alchemical harmony scores for cuisines, ingredients, and recipes
              </p>
            </div>
          </div>
        </div>

        {/* Privacy note */}
        <p className="mt-6 text-xs text-gray-400 text-center">
          By signing in you agree to our terms of service and privacy policy.
          Your data is stored securely and never shared.
        </p>
      </div>
    </div>
  );
}
