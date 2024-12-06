// src/components/layout/Sidebar.tsx

import React from 'react';
import { Filter } from 'lucide-react';

export default function Sidebar() {
  return (
    <aside className="hidden w-64 border-r border-gray-200 bg-white lg:block">
      <div className="p-6">
        <div className="flex items-center space-x-2 mb-6">
          <Filter className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Filters</h2>
        </div>

        <div className="space-y-6">
          {/* Filter sections from your existing FilterSection component */}
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
}