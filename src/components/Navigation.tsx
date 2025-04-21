'use client';

import React from 'react';
import Link from 'next/link';
import CombinedHeader from './CombinedHeader';
import { useRouter } from 'next/navigation';

export default function Navigation() {
  const router = useRouter();
  
  const handleServingsChange = (servings: number) => {
    // This can be a no-op or handled as needed
    console.log(`Navigation servings changed: ${servings}`);
  };
  
  const handlePeopleCountChange = (count: number) => {
    // This can be a no-op or handled as needed
    console.log(`Navigation people count changed: ${count}`);
  };
  
  return (
    <>
      <CombinedHeader 
        onServingsChange={handleServingsChange} 
        setNumberOfPeople={handlePeopleCountChange} 
      />
      
      <nav className="bg-white/90 backdrop-blur-sm shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4">
          <div className="flex items-center h-12">
            <div className="flex space-x-6">
              <Link href="/" className="text-indigo-600 hover:text-indigo-900 font-medium">
                Home
              </Link>
              <Link href="/cuisines" className="text-gray-600 hover:text-gray-900">
                Cuisines
              </Link>
              <Link href="/cooking-methods" className="text-gray-600 hover:text-gray-900">
                Cooking Methods
              </Link>
              <Link href="/nutritional-data" className="text-gray-600 hover:text-gray-900">
                Nutritional Data
              </Link>
              <Link href="/profile" className="text-emerald-600 hover:text-emerald-900 font-medium">
                My Profile
              </Link>
              <Link href="/alchm-kitchen" className="text-purple-600 hover:text-purple-900 font-medium">
                Alchm Kitchen
              </Link>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
} 