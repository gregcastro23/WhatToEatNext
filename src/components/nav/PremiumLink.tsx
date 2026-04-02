'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import React from 'react';

/**
 * Premium navigation link that shows the premium page for members
 * but triggers the sign-in modal for guests.
 */
export default function PremiumLink() {
  const { status } = useSession();

  const isAuthenticated = status === 'authenticated';
  const isLoading = status === 'loading';

  const handleClick = (e: React.MouseEvent) => {
    if (!isAuthenticated) {
      e.preventDefault();
      window.dispatchEvent(new Event('open-signin-modal'));
    }
  };

  return (
    <Link
      href={isAuthenticated ? '/premium' : '#'}
      onClick={handleClick}
      className={`px-3 py-2 rounded-lg bg-gradient-to-r from-amber-100 to-yellow-100 hover:from-amber-200 hover:to-yellow-200 text-amber-800 font-semibold text-sm transition-all duration-200 hover:scale-105 hover:shadow-md border border-amber-300 ${isLoading ? 'opacity-70 animate-pulse' : ''}`}
      aria-label="Premium subscription plans"
    >
      ⭐ Premium
    </Link>
  );
}
