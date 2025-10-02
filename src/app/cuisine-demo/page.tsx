/**
 * Cuisine System Demo Page
 *
 * Interactive demonstration page for the comprehensive cuisine-level recommendation system.
 */

import CuisineSystemDemo from '@/components/CuisineSystemDemo';

export default function CuisineDemoPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <CuisineSystemDemo />
    </div>
  );
}

export const metadata = {
  title: 'Cuisine System Demo | WhatToEatNext',
  description: 'Interactive demonstration of the comprehensive cuisine-level recommendation system with personalized analysis, signature identification, and planetary patterns.',
};
