'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import React from 'react';

interface NavAuthLinkProps {
  variant?: 'header' | 'footer';
}

/**
 * Navigation link that shows "Log In" when unauthenticated
 * and "Profile" when the user is signed in.
 */
export default function NavAuthLink({ variant = 'header' }: NavAuthLinkProps) {
  const { status } = useSession();

  const isLoading = status === 'loading';
  const isAuthenticated = status === 'authenticated';
  
  // Default to Log In if loading or unauthenticated
  const label = isAuthenticated ? 'Profile' : 'Log In / Sign Up';
  const ariaLabel = isAuthenticated ? 'View your profile' : 'Log in to your account';

  const handleLoginClick = (e: React.MouseEvent) => {
    if (!isAuthenticated) {
      e.preventDefault();
      window.dispatchEvent(new Event('open-signin-modal'));
    }
  };

  if (variant === 'footer') {
    return (
      <Link
        href={isAuthenticated ? '/profile' : '#'}
        onClick={handleLoginClick}
        className={`text-gray-300 hover:text-blue-300 transition-colors ${isLoading ? 'opacity-50' : ''}`}
        aria-label={ariaLabel}
      >
        {isLoading ? '...' : label}
      </Link>
    );
  }

  // Header variant
  return (
    <Link
      href={isAuthenticated ? '/profile' : '#'}
      onClick={handleLoginClick}
      className={`px-3 py-2 rounded-lg bg-white bg-opacity-70 hover:bg-blue-100 text-blue-700 font-semibold text-sm transition-all duration-200 hover:scale-105 hover:shadow-md border border-blue-200 ${isLoading ? 'animate-pulse opacity-70' : ''}`}
      aria-label={ariaLabel}
    >
      {label}
    </Link>
  );
}
