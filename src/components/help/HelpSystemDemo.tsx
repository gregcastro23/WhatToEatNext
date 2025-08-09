import React, { useState } from 'react';

import { log } from '@/services/LoggingService';

import { InteractiveHelpSystem, Tooltip, useContextualHelp } from './index';

// Example component showing help system integration
export const HelpSystemDemo: React.FC = () => {
  const [insertedCode, setInsertedCode] = useState<string>('');
  const { helpItems } = useContextualHelp('astrological-component');

  const handleCodeInsert = (code: string) => {
    setInsertedCode(code);
    log.info('Code inserted:', { code });
  };

  return (
    <div className='mx-auto max-w-4xl p-6'>
      <div className='mb-8'>
        <h1 className='mb-4 text-2xl font-bold text-gray-900'>Interactive Help System Demo</h1>
        <p className='mb-6 text-gray-600'>
          This demonstrates the interactive help and contextual assistance system for astrological
          development.
        </p>
      </div>

      {/* Contextual Tooltips Demo */}
      <div className='mb-8 rounded-lg border p-4'>
        <h2 className='mb-4 text-lg font-semibold text-gray-900'>Contextual Tooltips</h2>
        <div className='space-y-4'>
          <div className='flex items-center gap-4'>
            <Tooltip
              content={
                <div className='max-w-xs'>
                  <p className='mb-1 font-medium'>Elemental Properties</p>
                  <p className='text-sm'>
                    Use proper capitalization: Fire, Water, Earth, Air. This follows the established
                    TS2820 campaign conventions.
                  </p>
                </div>
              }
              trigger={
                <button className='rounded-lg bg-purple-100 px-4 py-2 text-purple-800 hover:bg-purple-200'>
                  Hover for Elemental Help
                </button>
              }
            />

            <Tooltip
              content={
                <div className='max-w-xs'>
                  <p className='mb-1 font-medium'>Planetary Positions</p>
                  <p className='text-sm'>
                    Always use getReliablePlanetaryPositions() with proper fallback handling. Planet
                    names are capitalized, zodiac signs are lowercase.
                  </p>
                </div>
              }
              trigger={
                <button className='rounded-lg bg-blue-100 px-4 py-2 text-blue-800 hover:bg-blue-200'>
                  Hover for Planetary Help
                </button>
              }
            />

            <Tooltip
              content={
                <div className='max-w-xs'>
                  <p className='mb-1 font-medium'>Campaign System</p>
                  <p className='text-sm'>
                    Use 'make phase-status' to check progress. Always create git stash before
                    campaigns. Current: 2566 TS errors → target 0.
                  </p>
                </div>
              }
              trigger={
                <button className='rounded-lg bg-green-100 px-4 py-2 text-green-800 hover:bg-green-200'>
                  Hover for Campaign Help
                </button>
              }
            />
          </div>
        </div>
      </div>

      {/* Code Insertion Demo */}
      <div className='mb-8 rounded-lg border p-4'>
        <h2 className='mb-4 text-lg font-semibold text-gray-900'>Code Insertion Demo</h2>
        <p className='mb-4 text-sm text-gray-600'>
          Use the help system to insert code snippets and templates. Click the help button (bottom
          right) to access suggestions, templates, and workflows.
        </p>

        {insertedCode && (
          <div>
            <h3 className='mb-2 font-medium text-gray-900'>Last Inserted Code:</h3>
            <pre className='max-h-64 overflow-x-auto rounded-lg bg-gray-100 p-3 text-sm'>
              <code>{insertedCode}</code>
            </pre>
          </div>
        )}
      </div>

      {/* Contextual Help Items */}
      <div className='mb-8 rounded-lg border p-4'>
        <h2 className='mb-4 text-lg font-semibold text-gray-900'>Contextual Help Items</h2>
        <p className='mb-4 text-sm text-gray-600'>
          Help items filtered for astrological component context:
        </p>
        <div className='grid gap-3'>
          {helpItems.map(item => (
            <div key={item.id} className='rounded-lg bg-gray-50 p-3'>
              <h4 className='font-medium text-gray-900'>{item.title}</h4>
              <p className='mt-1 text-sm text-gray-600'>{item.description}</p>
              <span
                className={`mt-2 inline-block rounded-full px-2 py-1 text-xs ${
                  item.category === 'astrological'
                    ? 'bg-purple-100 text-purple-800'
                    : item.category === 'development'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-red-100 text-red-800'
                }`}
              >
                {item.category}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Usage Instructions */}
      <div className='rounded-lg border border-blue-200 bg-blue-50 p-4'>
        <h2 className='mb-3 text-lg font-semibold text-blue-900'>How to Use the Help System</h2>
        <div className='space-y-2 text-sm text-blue-800'>
          <p>
            <strong>Keyboard Shortcuts:</strong>
          </p>
          <ul className='ml-4 list-inside list-disc space-y-1'>
            <li>
              Press <kbd className='rounded bg-blue-200 px-2 py-1'>F1</kbd> or{' '}
              <kbd className='rounded bg-blue-200 px-2 py-1'>Ctrl+H</kbd> to toggle help system
            </li>
            <li>
              Press <kbd className='rounded bg-blue-200 px-2 py-1'>Esc</kbd> to close help overlays
            </li>
          </ul>

          <p className='mt-3'>
            <strong>Features:</strong>
          </p>
          <ul className='ml-4 list-inside list-disc space-y-1'>
            <li>
              <strong>Quick Help:</strong> Common issues and reference information
            </li>
            <li>
              <strong>Code Suggestions:</strong> Astrological patterns with proper casing
            </li>
            <li>
              <strong>Templates:</strong> Complete code templates for components, services, tests
            </li>
            <li>
              <strong>Workflows:</strong> Step-by-step guides for complex tasks
            </li>
          </ul>

          <p className='mt-3'>
            <strong>Integration:</strong>
          </p>
          <ul className='ml-4 list-inside list-disc space-y-1'>
            <li>Tooltips provide contextual help on hover/focus</li>
            <li>Help items are filtered based on current context</li>
            <li>Code can be inserted directly into your editor</li>
            <li>All suggestions follow established casing conventions</li>
          </ul>
        </div>
      </div>

      {/* Interactive Help System */}
      <InteractiveHelpSystem onCodeInsert={handleCodeInsert} />
    </div>
  );
};
