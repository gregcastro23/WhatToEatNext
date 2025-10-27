'use client';

/**
 * Astrological Recommendations Page
 * Phase 5: Frontend Integration - Astrological Cooking Guide
 */

import dynamic from 'next/dynamic';

export const dynamic_config = 'force-dynamic';

// Lazy load the astrological component for better performance
const AstrologicalRecommendations = dynamic(
  () => import('@/components/astrological/AstrologicalRecommendations'),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Consulting the stars...</p>
        </div>
      </div>
    )
  }
);

export default function AstrologicalPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <AstrologicalRecommendations />
    </div>
  );
}
