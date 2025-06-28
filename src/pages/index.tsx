import React from 'react';
import FoodRecommender from '../components/FoodRecommender';

// Simple index page that renders our fixed FoodRecommender component
export default function HomePage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-8">
        What To Eat Next - Food Recommendations
      </h1>
      
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg shadow-md">
        <FoodRecommender />
      </div>
      
      <div className="mt-8 text-center text-gray-600 text-sm">
        Powered by astrological calculations and nutritional science
      </div>
    </div>
  );
} 