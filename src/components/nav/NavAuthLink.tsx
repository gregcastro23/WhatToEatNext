'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';

interface NavAuthLinkProps {
  variant?: 'header' | 'footer';
}

/**
 * Navigation link that shows "Log In" when unauthenticated
 * and "Profile" when the user is signed in.
 */
export default function NavAuthLink({ variant = 'header' }: NavAuthLinkProps) {
  const { status } = useSession();

  const isAuthenticated = status === 'authenticated';
  const href = isAuthenticated ? '/profile' : '/login';
  const label = isAuthenticated ? 'Profile' : 'Log In';
  const ariaLabel = isAuthenticated ? 'View your profile' : 'Log in to your account';

  if (variant === 'footer') {
    if (status === 'loading') {
      return <span className="text-gray-500 text-sm">...</span>;
    }
    return (
      <Link
        href={href}
        className="text-gray-300 hover:text-blue-300 transition-colors"
        aria-label={ariaLabel}
      >
        {label}
      </Link>
    );
  }

  // Header variant
  if (status === 'loading') {
    return (
      <span className="px-3 py-2 rounded-lg bg-white bg-opacity-70 text-gray-400 font-semibold text-sm border border-gray-200 animate-pulse">
        ...
      </span>
    );
  }

  return (
    <Link
      href={href}
      className="px-3 py-2 rounded-lg bg-white bg-opacity-70 hover:bg-blue-100 text-blue-700 font-semibold text-sm transition-all duration-200 hover:scale-105 hover:shadow-md border border-blue-200"
      aria-label={ariaLabel}
    >
      {label}
    </Link>
  );
}
