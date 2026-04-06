import Link from 'next/link';
import React from 'react';

export default function Navigation() {
  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center h-16">
          <Link href="/" className="font-semibold text-lg">
            Culinary Atlas
          </Link>
          
          <div className="ml-8 flex space-x-4">
            <Link href="/cuisines" className="text-gray-600 hover:text-gray-900">
              Cuisines
            </Link>
            <Link href="/cooking-methods" className="text-gray-600 hover:text-gray-900">
              Cooking Methods
            </Link>
            <Link href="/ingredients" className="text-gray-600 hover:text-gray-900">
              Ingredients
            </Link>
            <Link href="/alchm-kitchen" className="text-purple-600 hover:text-purple-900 font-medium">
              Alchm Kitchen
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
} 