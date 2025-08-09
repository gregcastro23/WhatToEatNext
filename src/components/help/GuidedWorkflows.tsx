import React, { useState } from 'react';

interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  code?: string;
  validation?: string;
  tips?: string[];
}

interface GuidedWorkflow {
  id: string;
  title: string;
  description: string;
  category: 'astrological' | 'development' | 'testing' | 'campaign';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: string;
  prerequisites: string[];
  steps: WorkflowStep[];
}

const GUIDED_WORKFLOWS: GuidedWorkflow[] = [
  {
    id: 'astrological-component-creation',
    title: 'Creating Astrological Components',
    description:
      'Step-by-step guide to create React components with astrological context integration',
    category: 'astrological',
    difficulty: 'intermediate',
    estimatedTime: '15-20 minutes',
    prerequisites: [
      'Basic React knowledge',
      'Understanding of TypeScript',
      'Familiarity with astrological concepts',
    ],
    steps: [
      {
        id: 'setup-context',
        title: 'Set up Astrological Context',
        description: 'Import and configure the astrological context for your component',
        code: `import React, { useContext, useEffect, useState } from 'react';
import { AstrologicalContext } from '@/contexts/AstrologicalContext';
import { ElementalProperties } from '@/types/elemental';

// Your component will have access to current planetary positions
const { planetaryPositions, currentElements, isLoading } = useContext(AstrologicalContext);`,
        validation: 'Verify that AstrologicalContext is properly imported and accessible',
        tips: [
          'Always check if context is loading before using planetary data',
          'Use proper TypeScript types for all astrological data',
          'Handle loading states gracefully',
        ],
      },
      {
        id: 'define-elemental-state',
        title: 'Define Elemental State',
        description: 'Set up local state for elemental properties using proper casing',
        code: `const [localElements, setLocalElements] = useState<ElementalProperties>({
  Fire: 0,    // Capitalized element names
  Water: 0,   // Following established conventions
  Earth: 0,   // From TS2820 campaign success
  Air: 0      // Proven working implementation
});`,
        validation: 'Ensure element names use proper capitalization (Fire, Water, Earth, Air)',
        tips: [
          'Use ElementalProperties interface for type safety',
          'Initialize with zero values for clean state',
          'Consider tracking elemental changes over time',
        ],
      },
    ],
  },
  {
    id: 'campaign-system-integration',
    title: 'Integrating with Campaign System',
    description: 'Learn how to work with the automated code quality campaign system',
    category: 'campaign',
    difficulty: 'advanced',
    estimatedTime: '30-45 minutes',
    prerequisites: [
      'Understanding of TypeScript error types',
      'Familiarity with build systems',
      'Knowledge of git workflows',
    ],
    steps: [
      {
        id: 'understand-campaign-structure',
        title: 'Understand Campaign Architecture',
        description: 'Learn about the campaign system components and their roles',
        code: `// Campaign system overview
interface CampaignConfig {
  errorThreshold: number;        // Trigger threshold (e.g., 100 TS errors)
  automationLevel: 'conservative' | 'aggressive';
  rollbackStrategy: 'git-stash' | 'file-backup';
  validationRequired: boolean;   // Manual approval needed
}`,
        validation: 'Run `make phase-status` to see current campaign progress',
        tips: [
          'Campaign system has proven 90→0 TS2820 error elimination',
          'Safety protocols prevent build breakage',
          'Systematic approach with phase-based execution',
        ],
      },
    ],
  },
];

interface GuidedWorkflowsProps {
  className?: string;
}

export const GuidedWorkflows: React.FC<GuidedWorkflowsProps> = ({ className = '' }) => {
  const [selectedWorkflow, setSelectedWorkflow] = useState<GuidedWorkflow | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  const handleStepComplete = (stepId: string) => {
    setCompletedSteps(prev => new Set([...prev, stepId]));
  };

  const handleNextStep = () => {
    if (selectedWorkflow && currentStep < selectedWorkflow.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const resetWorkflow = () => {
    setSelectedWorkflow(null);
    setCurrentStep(0);
    setCompletedSteps(new Set());
  };

  return (
    <div className={`rounded-lg border bg-white shadow-lg ${className}`}>
      <div className='border-b p-4'>
        <h3 className='mb-3 text-lg font-semibold text-gray-900'>Guided Workflows</h3>
      </div>

      <div className='p-4'>
        {!selectedWorkflow ? (
          <div className='grid gap-4'>
            {GUIDED_WORKFLOWS.map(workflow => (
              <div
                key={workflow.id}
                className='cursor-pointer rounded-lg border p-4 transition-colors hover:border-blue-300'
                onClick={() => setSelectedWorkflow(workflow)}
              >
                <div className='mb-2 flex items-start justify-between'>
                  <h4 className='font-medium text-gray-900'>{workflow.title}</h4>
                  <div className='flex items-center gap-2'>
                    <span
                      className={`rounded-full px-2 py-1 text-xs ${
                        workflow.difficulty === 'beginner'
                          ? 'bg-green-100 text-green-800'
                          : workflow.difficulty === 'intermediate'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {workflow.difficulty}
                    </span>
                    <span className='text-xs text-gray-500'>{workflow.estimatedTime}</span>
                  </div>
                </div>

                <p className='mb-3 text-sm text-gray-600'>{workflow.description}</p>

                <div className='flex items-center justify-between'>
                  <span
                    className={`rounded-full px-2 py-1 text-xs ${
                      workflow.category === 'astrological'
                        ? 'bg-purple-100 text-purple-800'
                        : workflow.category === 'development'
                          ? 'bg-blue-100 text-blue-800'
                          : workflow.category === 'testing'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {workflow.category}
                  </span>

                  <span className='text-sm text-gray-500'>{workflow.steps.length} steps</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div>
            <div className='mb-4 flex items-center justify-between'>
              <h4 className='text-lg font-medium text-gray-900'>{selectedWorkflow.title}</h4>
              <button onClick={resetWorkflow} className='text-gray-400 hover:text-gray-600'>
                ×
              </button>
            </div>

            <div className='mb-6'>
              <div className='mb-2 flex items-center justify-between'>
                <span className='text-sm text-gray-600'>
                  Step {currentStep + 1} of {selectedWorkflow.steps.length}
                </span>
                <span className='text-sm text-gray-600'>
                  {Math.round(((currentStep + 1) / selectedWorkflow.steps.length) * 100)}% complete
                </span>
              </div>
              <div className='h-2 w-full rounded-full bg-gray-200'>
                <div
                  className='h-2 rounded-full bg-blue-600 transition-all duration-300'
                  style={{ width: `${((currentStep + 1) / selectedWorkflow.steps.length) * 100}%` }}
                />
              </div>
            </div>

            {selectedWorkflow.steps[currentStep] && (
              <div className='space-y-4'>
                <div>
                  <h5 className='mb-2 text-lg font-medium text-gray-900'>
                    {selectedWorkflow.steps[currentStep].title}
                  </h5>
                  <p className='mb-4 text-gray-600'>
                    {selectedWorkflow.steps[currentStep].description}
                  </p>
                </div>

                {selectedWorkflow.steps[currentStep].code && (
                  <div>
                    <h6 className='mb-2 font-medium text-gray-900'>Code Example</h6>
                    <pre className='overflow-x-auto rounded-lg bg-gray-100 p-4 text-sm'>
                      <code>{selectedWorkflow.steps[currentStep].code}</code>
                    </pre>
                  </div>
                )}

                {selectedWorkflow.steps[currentStep].validation && (
                  <div className='rounded-lg border border-yellow-200 bg-yellow-50 p-3'>
                    <h6 className='mb-1 font-medium text-yellow-800'>Validation</h6>
                    <p className='text-sm text-yellow-700'>
                      {selectedWorkflow.steps[currentStep].validation}
                    </p>
                  </div>
                )}

                {selectedWorkflow.steps[currentStep].tips && (
                  <div className='rounded-lg border border-blue-200 bg-blue-50 p-3'>
                    <h6 className='mb-2 font-medium text-blue-800'>Tips</h6>
                    <ul className='space-y-1 text-sm text-blue-700'>
                      {(selectedWorkflow.steps[currentStep].tips || []).map((tip, index) => (
                        <li key={index}>• {tip}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className='flex items-center justify-between pt-4'>
                  <button
                    onClick={handlePrevStep}
                    disabled={currentStep === 0}
                    className='rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 disabled:opacity-50'
                  >
                    Previous
                  </button>

                  <div className='flex items-center gap-3'>
                    <label className='flex items-center gap-2 text-sm text-gray-600'>
                      <input
                        type='checkbox'
                        checked={completedSteps.has(selectedWorkflow.steps[currentStep].id)}
                        onChange={e => {
                          if (e.target.checked) {
                            handleStepComplete(selectedWorkflow.steps[currentStep].id);
                          }
                        }}
                        className='rounded'
                      />
                      Mark as complete
                    </label>

                    <button
                      onClick={handleNextStep}
                      disabled={currentStep === selectedWorkflow.steps.length - 1}
                      className='rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50'
                    >
                      {currentStep === selectedWorkflow.steps.length - 1 ? 'Finish' : 'Next'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
