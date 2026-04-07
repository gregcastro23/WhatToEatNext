'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import { useEffect, useState, Suspense } from 'react';

function LoginContent() {
  const { status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingTooLong, setLoadingTooLong] = useState(false);

  // If session status stays "loading" for too long, show the sign-in UI anyway
  useEffect(() => {
    if (status === 'loading') {
      const timer = setTimeout(() => setLoadingTooLong(true), 4000);
      return () => clearTimeout(timer);
    }
    setLoadingTooLong(false);
  }, [status]);

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/profile');
    }
  }, [status, router]);

  // Check for error from OAuth callback
  useEffect(() => {
    const callbackError = searchParams?.get('error');
    if (callbackError) {
      if (callbackError === 'OAuthCallback') {
        setError('Google sign-in was interrupted. Please try again.');
      } else if (callbackError === 'OAuthAccountNotLinked') {
        setError('This email is already linked to another account.');
      } else if (callbackError === 'Configuration' || callbackError === 'Callback') {
        setError('Database was asleep. Please try signing in again.');
      } else {
        setError('Something went wrong during sign-in. Please try again.');
      }
    }
  }, [searchParams]);

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

  // Show a sleek loading spinner
  if (status === 'loading' && !loadingTooLong) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0d]">
        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-orange-500 rounded-full blur-xl opacity-50 animate-pulse border-none" />
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-r-2 border-white/80 relative z-10" />
        </div>
      </div>
    );
  }

  if (status === 'authenticated') return null;

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center font-sans overflow-hidden bg-[#0A0A0F]">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/30 blur-[120px] animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-orange-600/20 blur-[150px] animate-pulse" style={{ animationDuration: '10s', animationDelay: '1s' }} />
        <div className="absolute top-[20%] right-[10%] w-[20%] h-[20%] rounded-full bg-blue-600/20 blur-[100px] animate-pulse" style={{ animationDuration: '12s', animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 w-full max-w-md px-4 sm:px-6 py-12 flex flex-col items-center">
        {/* Glassmorphic Card */}
        <div className="w-full bg-white/5 backdrop-blur-2xl border border-white/10 p-8 sm:p-10 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.36)]">
          
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-block mb-4 p-3 rounded-2xl bg-white/5 border border-white/10 shadow-inner">
              <span className="text-3xl drop-shadow-md">✨</span>
            </div>
            <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-purple-400 to-blue-400 mb-3 tracking-tight">
              Alchm.kitchen
            </h1>
            <p className="text-gray-400 text-sm font-medium tracking-wide">
              Unlock your astrological culinary journey.
            </p>
          </div>

          {/* Error display */}
          {error && (
            <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl backdrop-blur-sm">
              <p className="text-red-400 text-sm text-center font-medium">{error}</p>
            </div>
          )}

          {/* Google Sign-In Button */}
          <button
            disabled={isSigningIn}
            onClick={() => { void handleGoogleSignIn(); }}
            className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-sm font-semibold rounded-2xl text-black bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 focus:ring-offset-[#0A0A0F] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)] hover:-translate-y-0.5 active:translate-y-0"
          >
            {isSigningIn ? (
              <span className="flex items-center gap-3">
                <span className="animate-spin h-5 w-5 border-2 border-gray-800 border-t-transparent rounded-full" />
                <span>Connecting...</span>
              </span>
            ) : (
              <span className="flex items-center gap-3">
                <svg className="w-5 h-5 transition-transform group-hover:scale-110 duration-300" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </span>
            )}
          </button>

          {loadingTooLong && (
            <p className="mt-4 text-xs text-orange-400/80 text-center animate-pulse">
              Network is slow. Click above when ready.
            </p>
          )}

          {/* Features Section */}
          <div className="mt-12">
            <div className="relative flex items-center mb-6">
              <div className="flex-grow border-t border-white/10" />
              <span className="flex-shrink-0 mx-4 text-xs font-semibold text-gray-500 uppercase tracking-widest">Premium Access</span>
              <div className="flex-grow border-t border-white/10" />
            </div>
            
            <ul className="space-y-4">
              {[
                { icon: '🌙', text: 'NASA JPL DE precision natal charting' },
                { icon: '🍲', text: 'Real-time alchemical recipe harmony' },
                { icon: '🔮', text: 'Transit-optimized culinary guidance' }
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-4 text-sm text-gray-300 group">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/5 border border-white/5 group-hover:bg-white/10 transition-colors duration-300">
                    {item.icon}
                  </span>
                  <span className="group-hover:text-white transition-colors duration-300 font-medium">{item.text}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-10 text-center">
            <p className="text-[11px] text-gray-500 leading-relaxed font-medium">
              By continuing, you agree to our <span className="text-gray-400">Terms of Service</span> and <span className="text-gray-400">Privacy Policy</span>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#0A0A0F]">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-r-2 border-purple-500" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
