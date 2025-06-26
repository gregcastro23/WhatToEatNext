'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

import Navigation from '@/components/Navigation/Navigation';
import CelestialDisplay from '@/components/CelestialDisplay/CelestialDisplay';
import { useAlchemical } from '@/contexts/AlchemicalContext/hooks';
import { themeManager } from '@/utils/theme';
import { logger } from @/utils/logger';

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
        const shouldShowCelestial = pathname ? 
          (!pathname.includes('/settings') && !pathname.includes('/profile')) : 
          true;
        setShowCelestial(shouldShowCelestial);

        setIsLoading(false);
      } catch (error) {
        logger.error('Error initializing layout:', error);
        setError('Failed to initialize application');
        setIsLoading(false);
      }
    };

    initializeLayout();
  }, [pathname]);

  // Handle loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="space-y-4 text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-600">Loading your cosmic kitchen...</p>
        </div>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md p-6 bg-white rounded-lg shadow-lg text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex flex-col md:flex-row">
        {/* Navigation */}
        <Navigation />

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Celestial Display */}
            {showCelestial && (
              <div className="animate-fade-in-up">
                <CelestialDisplay />
              </div>
            )}

            {/* Page Content */}
            <div
              key={pathname}
              className="animate-fade-in-up"
            >
              {children}
            </div>

            {/* Loading Overlay */}
            {isLoading && (
              <div
                className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50 animate-fade-in"
              >
                <div className="space-y-4 text-center">
                  <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-gray-600">Processing cosmic energies...</p>
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
      behavior: 'smooth'
    });
  };

  return (
    <>
      {showButton && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-4 right-4 p-3 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 animate-fade-in-up"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 10l7-7m0 0l7 7m-7-7v18"
            />
          </svg>
        </button>
      )}
    </>
  );
} 