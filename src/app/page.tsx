'use client';

import React from 'react';
import FoodRecommender from '@/components/FoodRecommender';
import CuisineRecommender from '@/components/CuisineRecommender';
import MethodsRecommender from '@/components/MethodsRecommender';
import { AstrologicalProvider } from '@/context/AstrologicalContext';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-indigo-50 via-blue-50 to-gray-100 text-gray-800">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 text-indigo-900">What to Eat Next</h1>
          <p className="text-indigo-600">
            Food recommendations based on your celestial energies
          </p>
        </header>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-5">
              <CuisineRecommender />
            </div>
            <div className="bg-white rounded-lg shadow-md p-5">
              <MethodsRecommender />
            </div>
          </div>
          
          <div>
            <div className="bg-white rounded-lg shadow-md p-5 h-full">
              <FoodRecommender />
            </div>
          </div>
        </div>
        
        <footer className="mt-12 text-center text-sm text-gray-500">
          <p>
            Astrological and chakra data is for demonstration purposes.
            All recommendations should be considered with proper discretion and personal needs.
          </p>
        </footer>
      </div>
    </main>
  );
}
