'use client';

import { useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useState, type ReactNode } from 'react';
import OnboardingWizard from './OnboardingWizard';

function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <main className="lab min-h-screen flex items-center justify-center px-4 py-12">
      <section className="w-full max-w-md rounded-2xl border border-purple-100 bg-white/95 p-8 text-center shadow-xl">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-purple-100 text-2xl text-purple-700">
          al
        </div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        <p className="mt-2 text-sm text-gray-600">{subtitle}</p>
        <div className="mt-6">{children}</div>
      </section>
    </main>
  );
}

export function SignInScreen() {
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    setError(null);

    try {
      await signIn('google', {
        callbackUrl: '/profile',
        redirect: true,
      });
    } catch (signInError) {
      console.error('SignIn error:', signInError);
      setError('Could not start Google sign-in. Please try again.');
      setIsSigningIn(false);
    }
  };

  return (
    <AuthShell
      title="Welcome to alchm.kitchen"
      subtitle="Sign in to continue to your calibrated kitchen, profile, and admin tools."
    >
      <button
        type="button"
        onClick={() => { void handleGoogleSignIn(); }}
        disabled={isSigningIn}
        className="inline-flex w-full items-center justify-center rounded-xl bg-purple-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-purple-800 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSigningIn ? 'Opening Google...' : 'Continue with Google'}
      </button>
      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
    </AuthShell>
  );
}

export function AuthErrorScreen() {
  const searchParams = useSearchParams();
  const error = searchParams?.get('error') || 'Authentication failed';

  return (
    <AuthShell
      title="Sign-in needs another try"
      subtitle="The authentication provider returned an error before completing your session."
    >
      <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      <button
        type="button"
        onClick={() => { void signIn('google', { callbackUrl: '/profile', redirect: true }); }}
        className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-purple-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-purple-800"
      >
        Try Google again
      </button>
    </AuthShell>
  );
}

export function OnboardingFlow() {
  return <OnboardingWizard />;
}
