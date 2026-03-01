'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense } from 'react';

const ERROR_MESSAGES: Record<string, string> = {
  Configuration: "There's a problem with the server configuration. Please contact support.",
  AccessDenied: "Access denied. You do not have permission to sign in.",
  Verification: "The verification link has expired or has already been used.",
  OAuthSignin: "Could not start the sign-in process. Please try again.",
  OAuthCallback: "Could not complete the sign-in process. Please try again.",
  OAuthCreateAccount: "Could not create your account. Please try again.",
  EmailCreateAccount: "Could not create your account via email. Please try again.",
  Callback: "Could not complete the sign-in process. Please try again.",
  OAuthAccountNotLinked: "This email is already associated with another account. Please sign in with the original provider.",
  SessionRequired: "You must be signed in to access this page.",
  Default: "An unexpected error occurred during sign-in. Please try again.",
};

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const errorType = searchParams.get('error') || 'Default';
  const errorMessage = ERROR_MESSAGES[errorType] || ERROR_MESSAGES.Default;

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-12">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-red-100">
        <div className="text-center mb-6">
          <div className="mx-auto w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Sign-in Error
          </h1>
          <p className="text-gray-600 text-sm">
            {errorMessage}
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => router.push('/login')}
            className="w-full py-3 px-6 bg-gradient-to-r from-purple-600 to-orange-600 text-white rounded-xl font-semibold shadow-sm hover:shadow-md transition-all duration-200"
          >
            Try Again
          </button>
          <button
            onClick={() => router.push('/')}
            className="w-full py-3 px-6 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:border-gray-300 transition-all duration-200"
          >
            Go Home
          </button>
        </div>

        {errorType !== 'Default' && (
          <p className="mt-4 text-xs text-gray-400 text-center">
            Error code: {errorType}
          </p>
        )}
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500" />
      </div>
    }>
      <AuthErrorContent />
    </Suspense>
  );
}
