'use client';

import React from 'react';
import FoodRecommender from '@/components/FoodRecommender';
import CuisineRecommender from '@/components/CuisineRecommender';
import IngredientDisplay from '@/components/FoodRecommender/IngredientDisplay';
import IngredientRecommender from '@/components/IngredientRecommender';
import HomeMethodsComponent from '@/components/HomeMethodsComponent';
import { AstrologicalProvider } from '@/context/AstrologicalContext';
import Link from 'next/link';
import { Button } from '@mui/material';
import PlanetaryTimeDisplay from '@/components/PlanetaryTimeDisplay';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-indigo-50 via-blue-50 to-gray-100 text-gray-800">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 text-indigo-900">What to Eat Next</h1>
          <p className="text-indigo-600 mb-4">
            Food recommendations based on the current celestial energies
          </p>
          
          {/* Display planetary day and hour information */}
          <div className="inline-block bg-white px-4 py-2 rounded-lg shadow-sm">
            <PlanetaryTimeDisplay compact={true} />
          </div>
        </header>
        
        {/* Navigation Jump Links */}
        <nav className="flex flex-wrap justify-center gap-4 mb-8 bg-white rounded-lg shadow-md p-4 sticky top-2 z-10">
          <a href="#cuisine" className="text-indigo-600 hover:text-indigo-800 font-medium">
            Cuisine Recommendations
          </a>
          <a href="#ingredients" className="text-indigo-600 hover:text-indigo-800 font-medium">
            Ingredient Recommendations
          </a>
          <a href="#methods" className="text-indigo-600 hover:text-indigo-800 font-medium">
            Cooking Methods
          </a>
        </nav>
        
        <div className="flex flex-col gap-6 max-w-6xl mx-auto">
          <div id="cuisine" className="bg-white rounded-lg shadow-md p-5 w-full">
            <CuisineRecommender />
          </div>
          
          <div id="ingredients" className="bg-white rounded-lg shadow-md p-5 w-full">
            <IngredientRecommender />
          </div>
          
          <div id="methods" className="bg-white rounded-lg shadow-md p-5 w-full">
            <HomeMethodsComponent />
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
