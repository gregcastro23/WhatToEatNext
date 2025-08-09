'use client';

import { usePathname } from 'next/navigation';
import React, { useEffect, useState } from 'react';

import CelestialDisplay from '@/components/CelestialDisplay/CelestialDisplay';
import Navigation from '@/components/Navigation/Navigation';
import { useAlchemical } from '@/contexts/AlchemicalContext/hooks';
import { logger } from '@/utils/logger';
import { themeManager } from '@/utils/theme';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const pathname = usePathname();
  const { state } = useAlchemical();
  const [isLoading, setIsLoading] = useState(true);
  const [showCelestial, setShowCelestial] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeLayout = async () => {
      try {
        // Initialize theme
        await themeManager.initializeTheme();

        // Check if celestial display should be shown
        const shouldShowCelestial = pathname
          ? !pathname.includes('/settings') && !pathname.includes('/profile')
          : true;
        setShowCelestial(shouldShowCelestial);

        setIsLoading(false);
      } catch (error) {
        logger.error('Error initializing layout:', error);
        setError('Failed to initialize application');
        setIsLoading(false);
      }
    };

    void initializeLayout();
  }, [pathname]);

  // Handle loading state
  if (isLoading) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-gray-50'>
        <div className='space-y-4 text-center'>
          <div className='mx-auto h-16 w-16 animate-spin rounded-full border-4 border-blue-500 border-t-transparent' />
          <p className='text-gray-600'>Loading your cosmic kitchen...</p>
        </div>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-gray-50'>
        <div className='max-w-md rounded-lg bg-white p-6 text-center shadow-lg'>
          <h2 className='mb-2 text-xl font-semibold text-red-600'>Error</h2>
          <p className='mb-4 text-gray-600'>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className='rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600'
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='flex flex-col md:flex-row'>
        {/* Navigation */}
        <Navigation />

        {/* Main Content */}
        <main className='flex-1 p-4 md:p-8'>
          <div className='mx-auto max-w-7xl space-y-8'>
            {/* Celestial Display */}
            {showCelestial && (
              <div className='animate-fade-in-up'>
                <CelestialDisplay />
              </div>
            )}

            {/* Page Content */}
            <div key={pathname} className='animate-fade-in-up'>
              {children}
            </div>

            {/* Loading Overlay */}
            {isLoading && (
              <div className='fixed inset-0 z-50 flex animate-fade-in items-center justify-center bg-white bg-opacity-75'>
                <div className='space-y-4 text-center'>
                  <div className='mx-auto h-16 w-16 animate-spin rounded-full border-4 border-blue-500 border-t-transparent' />
                  <p className='text-gray-600'>Processing cosmic energies...</p>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Scroll to Top Button */}
        <ScrollToTopButton />
      </div>
    </div>
  );
}

function ScrollToTopButton() {
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowButton(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <>
      {showButton && (
        <button
          onClick={scrollToTop}
          className='fixed bottom-4 right-4 animate-fade-in-up rounded-full bg-blue-500 p-3 text-white shadow-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
        >
          <svg className='h-6 w-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M5 10l7-7m0 0l7 7m-7-7v18'
            />
          </svg>
        </button>
      )}
    </>
  );
}
