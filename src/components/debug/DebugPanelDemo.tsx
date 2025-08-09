'use client';

import React from 'react';

import ConsolidatedDebugInfo from './ConsolidatedDebugInfo';

/**
 * Demo component to showcase the ConsolidatedDebugInfo panel
 * This can be used for testing and demonstration purposes
 */
const DebugPanelDemo: React.FC = () => {
  return (
    <div className='min-h-screen bg-gray-100 p-8'>
      <div className='mx-auto max-w-4xl'>
        <h1 className='mb-8 text-3xl font-bold text-gray-800'>Debug Panel Demo</h1>

        <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
          <div className='rounded-lg bg-white p-6 shadow-md'>
            <h2 className='mb-4 text-xl font-semibold'>Features</h2>
            <ul className='space-y-2 text-gray-600'>
              <li>✅ Real-time performance metrics tracking</li>
              <li>✅ Astrological data display</li>
              <li>✅ Component state monitoring</li>
              <li>✅ Drag and drop repositioning</li>
              <li>✅ Collapsible interface</li>
              <li>✅ Persistent settings storage</li>
              <li>✅ Error tracking and display</li>
              <li>✅ Memory usage monitoring</li>
            </ul>
          </div>

          <div className='rounded-lg bg-white p-6 shadow-md'>
            <h2 className='mb-4 text-xl font-semibold'>Usage Instructions</h2>
            <ol className='space-y-2 text-gray-600'>
              <li>1. The debug panel appears in the bottom-right corner</li>
              <li>2. Click and drag the header to reposition</li>
              <li>3. Use the collapse button (▲/▼) to minimize</li>
              <li>4. Click the settings gear (⚙️) for options</li>
              <li>5. Use the X button to hide the panel</li>
              <li>6. When hidden, click the bug icon (🐛) to show</li>
            </ol>
          </div>

          <div className='rounded-lg bg-white p-6 shadow-md'>
            <h2 className='mb-4 text-xl font-semibold'>Performance Metrics</h2>
            <p className='mb-4 text-gray-600'>
              The debug panel tracks various performance metrics:
            </p>
            <ul className='space-y-1 text-sm text-gray-600'>
              <li>• Render count and timing</li>
              <li>• Memory usage (if available)</li>
              <li>• Error count and recent errors</li>
              <li>• System health score</li>
              <li>• Component-specific metrics</li>
            </ul>
          </div>

          <div className='rounded-lg bg-white p-6 shadow-md'>
            <h2 className='mb-4 text-xl font-semibold'>Astrological Data</h2>
            <p className='mb-4 text-gray-600'>Real-time astrological information includes:</p>
            <ul className='space-y-1 text-sm text-gray-600'>
              <li>• Current sun sign</li>
              <li>• Lunar phase</li>
              <li>• Planetary hour</li>
              <li>• Day/night status</li>
              <li>• Elemental balance</li>
              <li>• Alchemical token values</li>
            </ul>
          </div>
        </div>

        <div className='mt-8 rounded-lg border border-yellow-200 bg-yellow-50 p-4'>
          <h3 className='mb-2 text-lg font-semibold text-yellow-800'>Note</h3>
          <p className='text-yellow-700'>
            The debug panel is designed to be non-intrusive and can be easily hidden or
            repositioned. All settings are automatically saved to localStorage and will persist
            across browser sessions.
          </p>
        </div>
      </div>

      {/* The actual debug panel */}
      <ConsolidatedDebugInfo />
    </div>
  );
};

export default DebugPanelDemo;
