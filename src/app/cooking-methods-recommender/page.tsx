'use client';

import React from 'react';
import Link from 'next/link';
import { ChefHat } from 'lucide-react';

// Simple test page to verify the route works
export default function CookingMethodsRecommenderPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-blue-50 to-gray-100 text-gray-800">
      <nav className="bg-white shadow-lg border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-2">
              <ChefHat className="w-8 h-8 text-indigo-600" />
              <span className="font-bold text-xl text-indigo-900">What to Eat Next</span>
            </Link>
          </div>
        </div>
      </nav>
      
      <main>
        <div className="container mx-auto px-4 py-8">
          <header className="mb-8 text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-2 text-indigo-900">Cooking Methods Recommender</h1>
            <p className="text-indigo-600 mb-4">
              Advanced cooking method recommendations powered by alchemical pillars and Monica constant
            </p>
          </header>

          <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-6xl mx-auto">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Test Page</h2>
            <p className="text-gray-600">
              This is a test page to verify the route is working. The full implementation will be added once we confirm this works.
            </p>
            <Link href="/" className="inline-block mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
              Return to Home
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
} 