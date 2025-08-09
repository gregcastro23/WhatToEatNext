import React, { useState, useEffect } from 'react';

import { AstrologicalCodeSuggestions } from './AstrologicalCodeSuggestions';
import { CodeTemplates } from './CodeTemplates';
import { Tooltip, HelpOverlay } from './ContextualHelp';
import { GuidedWorkflows } from './GuidedWorkflows';

interface HelpSystemProps {
  className?: string;
  onCodeInsert?: (code: string) => void;
}

type HelpTab = 'suggestions' | 'templates' | 'workflows' | 'quick-help';

interface QuickHelpItem {
  id: string;
  title: string;
  description: string;
  category: 'astrological' | 'development' | 'troubleshooting';
  content: React.ReactNode;
}

const QUICK_HELP_ITEMS: QuickHelpItem[] = [
  {
    id: 'elemental-casing',
    title: 'Elemental Property Casing',
    description: 'Proper casing conventions for elemental properties',
    category: 'astrological',
    content: (
      <div className='space-y-3'>
        <p className='text-sm text-gray-700'>
          Use proper capitalization for elemental properties based on established conventions:
        </p>
        <div className='rounded-lg bg-green-50 p-3'>
          <h6 className='mb-2 font-medium text-green-800'>✅ Correct Usage</h6>
          <pre className='text-sm text-green-700'>
            {`interface ElementalProperties {
  Fire: number;    // Capitalized
  Water: number;   // Capitalized
  Earth: number;   // Capitalized
  Air: number;     // Capitalized
}`}
          </pre>
        </div>
        <div className='rounded-lg bg-red-50 p-3'>
          <h6 className='mb-2 font-medium text-red-800'>❌ Incorrect Usage</h6>
          <pre className='text-sm text-red-700'>
            {`// Don't use lowercase
{ fire: 0.8, water: 0.2, earth: 0.1, air: 0.0 }`}
          </pre>
        </div>
        <p className='text-xs text-gray-600'>
          This convention was established through the TS2820 campaign achieving 90→0 error
          elimination.
        </p>
      </div>
    ),
  },
  {
    id: 'zodiac-signs',
    title: 'Zodiac Sign Conventions',
    description: 'Proper casing for zodiac signs in astrological calculations',
    category: 'astrological',
    content: (
      <div className='space-y-3'>
        <p className='text-sm text-gray-700'>
          Zodiac signs should always use lowercase in the codebase:
        </p>
        <div className='rounded-lg bg-green-50 p-3'>
          <h6 className='mb-2 font-medium text-green-800'>✅ Correct Usage</h6>
          <pre className='text-sm text-green-700'>
            {`type ZodiacSign = 'aries' | 'taurus' | 'gemini' | 'cancer' | 
                  'leo' | 'virgo' | 'libra' | 'scorpio' |
                  'sagittarius' | 'capricorn' | 'aquarius' | 'pisces';

const position = { sign: 'aries', degree: 15 };`}
          </pre>
        </div>
        <div className='rounded-lg bg-red-50 p-3'>
          <h6 className='mb-2 font-medium text-red-800'>❌ Incorrect Usage</h6>
          <pre className='text-sm text-red-700'>
            {`// Don't capitalize zodiac signs
const position = { sign: 'Aries', degree: 15 };`}
          </pre>
        </div>
      </div>
    ),
  },
  {
    id: 'planetary-positions',
    title: 'Planetary Position Handling',
    description: 'Best practices for working with planetary position data',
    category: 'astrological',
    content: (
      <div className='space-y-3'>
        <p className='text-sm text-gray-700'>
          Always use the reliable astronomy utility for planetary positions:
        </p>
        <div className='rounded-lg bg-blue-50 p-3'>
          <pre className='text-sm text-blue-700'>
            import{' '}
            {`import { getReliablePlanetaryPositions } from '@/utils/reliableAstronomy';

async function calculateInfluences(date: Date = new Date()) {
  try {
    const positions = await getReliablePlanetaryPositions(date);
    return processPositions(positions);
  } catch (error) {
    console.warn('Using fallback positions', error);
    return getFallbackPositions();
  }
}`}
          </pre>
        </div>
        <div className='space-y-2'>
          <h6 className='font-medium text-gray-800'>Key Points:</h6>
          <ul className='space-y-1 text-sm text-gray-700'>
            <li>• Always validate planetary positions before calculations</li>
            <li>• Use fallback mechanisms for API failures</li>
            <li>• Planet names are capitalized (Sun, Moon, Mercury, etc.)</li>
            <li>• Zodiac signs in positions are lowercase</li>
          </ul>
        </div>
      </div>
    ),
  },
  {
    id: 'campaign-system',
    title: 'Campaign System Integration',
    description: 'How to work with the automated code quality campaign system',
    category: 'development',
    content: (
      <div className='space-y-3'>
        <p className='text-sm text-gray-700'>
          The campaign system provides automated code quality improvement with safety protocols:
        </p>
        <div className='rounded-lg bg-yellow-50 p-3'>
          <h6 className='mb-2 font-medium text-yellow-800'>Current Status</h6>
          <ul className='space-y-1 text-sm text-yellow-700'>
            <li>• TypeScript errors: 2566 → target 0</li>
            <li>• Linting warnings: 4506 → target 0</li>
            <li>• Proven 90→0 TS2820 error elimination</li>
          </ul>
        </div>
        <div className='rounded-lg bg-blue-50 p-3'>
          <h6 className='mb-2 font-medium text-blue-800'>Key Commands</h6>
          <pre className='text-sm text-blue-700'>
            {`make errors          # Check current error count
make phase-status    # Campaign progress
make phase-validate  # Validate phase completion
make build          # Validate build stability`}
          </pre>
        </div>
        <div className='rounded-lg bg-green-50 p-3'>
          <h6 className='mb-2 font-medium text-green-800'>Safety Protocols</h6>
          <ul className='space-y-1 text-sm text-green-700'>
            <li>• Always create git stash before campaigns</li>
            <li>• Build validation after every 5 files</li>
            <li>• Automatic rollback on build failures</li>
            <li>• Manual approval for critical changes</li>
          </ul>
        </div>
      </div>
    ),
  },
  {
    id: 'troubleshooting',
    title: 'Common Issues & Solutions',
    description: 'Solutions for frequently encountered development issues',
    category: 'troubleshooting',
    content: (
      <div className='space-y-4'>
        <div className='border-l-4 border-red-400 pl-3'>
          <h6 className='font-medium text-red-800'>TypeScript Errors</h6>
          <p className='mb-2 text-sm text-red-700'>If you encounter TS2820 or similar errors:</p>
          <ul className='space-y-1 text-sm text-red-600'>
            <li>• Check casing conventions (Fire/Water/Earth/Air)</li>
            <li>• Verify zodiac signs are lowercase</li>
            <li>• Use established type definitions</li>
            <li>• Run `make errors-detail` for analysis</li>
          </ul>
        </div>

        <div className='border-l-4 border-yellow-400 pl-3'>
          <h6 className='font-medium text-yellow-800'>Build Issues</h6>
          <p className='mb-2 text-sm text-yellow-700'>If builds fail unexpectedly:</p>
          <ul className='space-y-1 text-sm text-yellow-600'>
            <li>• Run `make clean` to clear caches</li>
            <li>• Check for import path issues</li>
            <li>• Verify all dependencies are installed</li>
            <li>• Use `make build` for detailed error info</li>
          </ul>
        </div>

        <div className='border-l-4 border-blue-400 pl-3'>
          <h6 className='font-medium text-blue-800'>Astrological Calculations</h6>
          <p className='mb-2 text-sm text-blue-700'>If astrological calculations fail:</p>
          <ul className='space-y-1 text-sm text-blue-600'>
            <li>• Check API connectivity and fallbacks</li>
            <li>• Validate planetary position data structure</li>
            <li>• Ensure proper error handling is in place</li>
            <li>• Use mock data for testing</li>
          </ul>
        </div>
      </div>
    ),
  },
];

export const InteractiveHelpSystem: React.FC<HelpSystemProps> = ({
  className = '',
  onCodeInsert,
}) => {
  const [activeTab, setActiveTab] = useState<HelpTab>('quick-help');
  const [isVisible, setIsVisible] = useState(false);
  const [selectedQuickHelp, setSelectedQuickHelp] = useState<QuickHelpItem | null>(null);

  // Keyboard shortcut to toggle help system
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F1' || (e.ctrlKey && e.key === 'h')) {
        e.preventDefault();
        setIsVisible(!isVisible);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isVisible]);

  const tabs = [
    { id: 'quick-help' as const, label: 'Quick Help', icon: '❓' },
    { id: 'suggestions' as const, label: 'Code Suggestions', icon: '💡' },
    { id: 'templates' as const, label: 'Templates', icon: '📋' },
    { id: 'workflows' as const, label: 'Workflows', icon: '🔄' },
  ];

  const filteredQuickHelp = QUICK_HELP_ITEMS;

  return (
    <>
      {/* Help System Toggle Button */}
      <Tooltip
        content='Open Interactive Help System (F1 or Ctrl+H)'
        trigger={
          <button
            onClick={() => setIsVisible(true)}
            className={`fixed bottom-4 right-4 z-40 rounded-full bg-blue-600 p-3 text-white shadow-lg transition-colors hover:bg-blue-700 ${className}`}
          >
            <svg className='h-6 w-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
              />
            </svg>
          </button>
        }
      />

      {/* Help System Overlay */}
      <HelpOverlay
        isOpen={isVisible}
        onClose={() => setIsVisible(false)}
        title='Interactive Help System'
      >
        <div className='flex h-96'>
          {/* Tab Navigation */}
          <div className='w-48 border-r border-gray-200 pr-4'>
            <nav className='space-y-2'>
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-100 font-medium text-blue-800'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <span className='mr-2'>{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>

            <div className='mt-6 border-t border-gray-200 pt-4'>
              <p className='mb-2 text-xs text-gray-500'>Keyboard Shortcuts</p>
              <ul className='space-y-1 text-xs text-gray-600'>
                <li>F1 - Toggle Help</li>
                <li>Ctrl+H - Toggle Help</li>
                <li>Esc - Close Help</li>
              </ul>
            </div>
          </div>

          {/* Tab Content */}
          <div className='flex-1 overflow-y-auto pl-4'>
            {activeTab === 'quick-help' && (
              <div className='space-y-3'>
                <h4 className='mb-3 font-medium text-gray-900'>Quick Help &amp; Reference</h4>
                {filteredQuickHelp.map(item => (
                  <div
                    key={item.id}
                    className='cursor-pointer rounded-lg border p-3 transition-colors hover:border-blue-300'
                    onClick={() => setSelectedQuickHelp(item)}
                  >
                    <div className='flex items-start justify-between'>
                      <div>
                        <h5 className='font-medium text-gray-900'>{item.title}</h5>
                        <p className='mt-1 text-sm text-gray-600'>{item.description}</p>
                      </div>
                      <span
                        className={`rounded-full px-2 py-1 text-xs ${
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
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'suggestions' && (
              <AstrologicalCodeSuggestions
                onInsertCode={onCodeInsert}
                className='border-0 shadow-none'
              />
            )}

            {activeTab === 'templates' && (
              <CodeTemplates onInsertTemplate={onCodeInsert} className='border-0 shadow-none' />
            )}

            {activeTab === 'workflows' && <GuidedWorkflows className='border-0 shadow-none' />}
          </div>
        </div>
      </HelpOverlay>

      {/* Quick Help Detail Overlay */}
      {selectedQuickHelp && (
        <HelpOverlay
          isOpen={true}
          onClose={() => setSelectedQuickHelp(null)}
          title={selectedQuickHelp.title}
        >
          <div className='max-h-96 overflow-y-auto'>{selectedQuickHelp.content}</div>
        </HelpOverlay>
      )}
    </>
  );
};

// Context-aware help hook for components
export const useContextualHelp = (context: string) => {
  const [helpItems, setHelpItems] = useState<QuickHelpItem[]>([]);

  useEffect(() => {
    // Filter help items based on context
    const contextualItems = QUICK_HELP_ITEMS.filter(item => {
      if (context.includes('astrological') || context.includes('elemental')) {
        return item.category === 'astrological';
      }
      if (context.includes('campaign') || context.includes('build')) {
        return item.category === 'development';
      }
      return true;
    });

    setHelpItems(contextualItems);
  }, [context]);

  return { helpItems };
};
