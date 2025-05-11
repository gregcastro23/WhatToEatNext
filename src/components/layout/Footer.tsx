// src / (components || 1)/layout / (Footer || 1).tsx

import React from 'react';

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white px-6 py-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          © {new Date().getFullYear()} What To Eat Next
        </p>
        
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">
            Powered by Alchemical Engine
          </span>
        </div>
      </div>
    </footer>
  );
}