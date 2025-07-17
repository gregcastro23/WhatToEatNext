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
    description: 'Step-by-step guide to create React components with astrological context integration',
    category: 'astrological',
    difficulty: 'intermediate',
    estimatedTime: '15-20 minutes',
    prerequisites: [
      'Basic React knowledge',
      'Understanding of TypeScript',
      'Familiarity with astrological concepts'
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
          'Handle loading states gracefully'
        ]
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
          'Consider tracking elemental changes over time'
        ]
      }
    ]
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
      'Knowledge of git workflows'
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
          'Systematic approach with phase-based execution'
        ]
      }
    ]
  }
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
    <div className={`bg-white rounded-lg shadow-lg border ${className}`}>
      <div className="p-4 border-b">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          Guided Workflows
        </h3>
      </div>
      
      <div className="p-4">
        {!selectedWorkflow ? (
          <div className="grid gap-4">
            {GUIDED_WORKFLOWS.map(workflow => (
              <div
                key={workflow.id}
                className="p-4 border rounded-lg hover:border-blue-300 cursor-pointer transition-colors"
                onClick={() => setSelectedWorkflow(workflow)}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{workflow.title}</h4>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      workflow.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                      workflow.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {workflow.difficulty}
                    </span>
                    <span className="text-xs text-gray-500">{workflow.estimatedTime}</span>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 mb-3">{workflow.description}</p>
                
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    workflow.category === 'astrological' ? 'bg-purple-100 text-purple-800' :
                    workflow.category === 'development' ? 'bg-blue-100 text-blue-800' :
                    workflow.category === 'testing' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {workflow.category}
                  </span>
                  
                  <span className="text-sm text-gray-500">
                    {workflow.steps.length} steps
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-medium text-gray-900">
                {selectedWorkflow.title}
              </h4>
              <button
                onClick={resetWorkflow}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">
                  Step {currentStep + 1} of {selectedWorkflow.steps.length}
                </span>
                <span className="text-sm text-gray-600">
                  {Math.round(((currentStep + 1) / selectedWorkflow.steps.length) * 100)}% complete
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentStep + 1) / selectedWorkflow.steps.length) * 100}%` }}
                />
              </div>
            </div>
            
            {selectedWorkflow.steps[currentStep] && (
              <div className="space-y-4">
                <div>
                  <h5 className="text-lg font-medium text-gray-900 mb-2">
                    {selectedWorkflow.steps[currentStep].title}
                  </h5>
                  <p className="text-gray-600 mb-4">
                    {selectedWorkflow.steps[currentStep].description}
                  </p>
                </div>
                
                {selectedWorkflow.steps[currentStep].code && (
                  <div>
                    <h6 className="font-medium text-gray-900 mb-2">Code Example</h6>
                    <pre className="p-4 bg-gray-100 rounded-lg text-sm overflow-x-auto">
                      <code>{selectedWorkflow.steps[currentStep].code}</code>
                    </pre>
                  </div>
                )}
                
                {selectedWorkflow.steps[currentStep].validation && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h6 className="font-medium text-yellow-800 mb-1">Validation</h6>
                    <p className="text-sm text-yellow-700">
                      {selectedWorkflow.steps[currentStep].validation}
                    </p>
                  </div>
                )}
                
                {selectedWorkflow.steps[currentStep].tips && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <h6 className="font-medium text-blue-800 mb-2">Tips</h6>
                    <ul className="text-sm text-blue-700 space-y-1">
                      {selectedWorkflow.steps[currentStep].tips!.map((tip, index) => (
                        <li key={index}>• {tip}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <div className="flex items-center justify-between pt-4">
                  <button
                    onClick={handlePrevStep}
                    disabled={currentStep === 0}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 text-sm text-gray-600">
                      <input
                        type="checkbox"
                        checked={completedSteps.has(selectedWorkflow.steps[currentStep].id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            handleStepComplete(selectedWorkflow.steps[currentStep].id);
                          }
                        }}
                        className="rounded"
                      />
                      Mark as complete
                    </label>
                    
                    <button
                      onClick={handleNextStep}
                      disabled={currentStep === selectedWorkflow.steps.length - 1}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
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