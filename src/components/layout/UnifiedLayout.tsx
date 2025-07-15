'use client'

import React from 'react';
import { ErrorBoundary } from '../error-handling/ErrorBoundary';
import { StateDebugger } from '../debug/StateDebugger';
import { Filter } from 'lucide-react';

import { Element } from "@/types/alchemy";
interface UnifiedLayoutProps {
  children: React.ReactNode;
  mode?: 'full' | 'simple' | 'sidebar';
  showFooter?: boolean;
  showSidebar?: boolean;
  showDebugger?: boolean;
}

// Footer Component
const Footer: React.FC = () => (
  <footer className="border-t border-gray-200 bg-white px-6 py-4">
    <div className="flex items-center justify-between">
      <p className="text-sm text-gray-600">
        © {new Date()?.getFullYear()} What To Eat Next
      </p>
      
      <div className="flex items-center space-x-4">
        <span className="text-sm text-gray-600">
          Powered by Alchemical Engine
        </span>
      </div>
    </div>
  </footer>
);

// Sidebar Component
const Sidebar: React.FC = () => (
  <aside className="hidden w-64 border-r border-gray-200 bg-white lg:block">
    <div className="p-6">
      <div className="flex items-center space-x-2 mb-6">
        <Filter className="h-5 w-5" />
        <h2 className="text-lg font-semibold">Filters</h2>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-medium mb-2">Cuisine Types</h3>
          {/* Add cuisine filters */}
        </div>

        <div>
          <h3 className="text-sm font-medium mb-2">Dietary Preferences</h3>
          {/* Add dietary filters */}
        </div>

        <div>
          <h3 className="text-sm font-medium mb-2">Elemental Balance</h3>
          {/* Add elemental filters */}
        </div>
      </div>
    </div>
  </aside>
);

// Main Unified Layout Component
export function UnifiedLayout({ 
  children, 
  mode = 'simple',
  showFooter = true,
  showSidebar = false,
  showDebugger = process.env.NODE_ENV === 'development'
}: UnifiedLayoutProps) {
  const renderContent = () => {
    switch (mode) {
      case 'sidebar':
        return (
          <div className="flex h-screen">
            {showSidebar && <Sidebar />}
            <div className="flex-1 flex flex-col">
              <main className="flex-1 overflow-auto">
                {children}
              </main>
              {showFooter && <Footer />}
            </div>
          </div>
        );
        
      case 'full':
        return (
          <div className="min-h-screen flex flex-col">
            <main className="flex-1">
              {children}
            </main>
            {showFooter && <Footer />}
          </div>
        );
        
      default: // simple
        return (
          <>
            {children}
            {showFooter && <Footer />}
          </>
        );
    }
  };

  return (
    <ErrorBoundary componentName="UnifiedLayout">
      <div id="app-root" className="min-h-screen">
        {renderContent()}
        {showDebugger && <StateDebugger />}
      </div>
    </ErrorBoundary>
  );
}

// Export individual components for backward compatibility
export { Footer, Sidebar };
export default UnifiedLayout; 