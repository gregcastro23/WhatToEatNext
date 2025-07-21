/**
 * Campaign Workflow Builder Component
 * 
 * Provides a guided interface for creating, configuring, and managing
 * campaign workflows with templates, validation, and dry-run capabilities.
 */

import React, { useState, useEffect } from 'react';

import { campaignWorkflowManager } from '../../services/CampaignWorkflowManager';
import type {
  CampaignTemplate,
  CampaignWorkflow,
  WorkflowStep,
  ValidationResult,
  DryRunResult,
  CampaignVersion
} from '../../services/CampaignWorkflowManager';

interface CampaignWorkflowBuilderProps {
  className?: string;
  onWorkflowCreated?: (workflowId: string) => void;
  onWorkflowExecuted?: (workflowId: string) => void;
}

export const CampaignWorkflowBuilder: React.FC<CampaignWorkflowBuilderProps> = ({
  className = '',
  onWorkflowCreated,
  onWorkflowExecuted
}) => {
  const [templates, setTemplates] = useState<CampaignTemplate[]>([]);
  const [workflows, setWorkflows] = useState<CampaignWorkflow[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<CampaignTemplate | null>(null);
  const [currentWorkflow, setCurrentWorkflow] = useState<CampaignWorkflow | null>(null);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [showWorkflowBuilder, setShowWorkflowBuilder] = useState(false);
  const [validationResults, setValidationResults] = useState<ValidationResult | null>(null);
  const [dryRunResults, setDryRunResults] = useState<DryRunResult | null>(null);
  const [loading, setLoading] = useState(false);

  // Load templates and workflows
  useEffect(() => {
    const loadData = () => {
      const availableTemplates = campaignWorkflowManager.getTemplates();
      const existingWorkflows = campaignWorkflowManager.getAllWorkflows();
      
      setTemplates(availableTemplates);
      setWorkflows(existingWorkflows);
    };

    loadData();
  }, []);

  const handleCreateFromTemplate = async (template: CampaignTemplate) => {
    try {
      setLoading(true);
      const workflowName = `${template.name} - ${new Date().toLocaleDateString()}`;
      const workflowId = await campaignWorkflowManager.createWorkflowFromTemplate(template.id, workflowName);
      
      const workflow = campaignWorkflowManager.getWorkflow(workflowId);
      setCurrentWorkflow(workflow);
      setSelectedTemplate(template);
      setShowTemplateSelector(false);
      setShowWorkflowBuilder(true);
      
      onWorkflowCreated?.(workflowId);
    } catch (error) {
      console.error('Failed to create workflow:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCustomWorkflow = async () => {
    try {
      setLoading(true);
      const workflowName = `Custom Campaign - ${new Date().toLocaleDateString()}`;
      const workflowId = await campaignWorkflowManager.createCustomWorkflow(
        workflowName,
        'Custom campaign workflow created from scratch'
      );
      
      const workflow = campaignWorkflowManager.getWorkflow(workflowId);
      setCurrentWorkflow(workflow);
      setSelectedTemplate(null);
      setShowTemplateSelector(false);
      setShowWorkflowBuilder(true);
      
      onWorkflowCreated?.(workflowId);
    } catch (error) {
      console.error('Failed to create custom workflow:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleValidateWorkflow = async () => {
    if (!currentWorkflow) return;

    try {
      setLoading(true);
      const validation = await campaignWorkflowManager.validateWorkflowConfig(currentWorkflow.id);
      setValidationResults(validation);
      
      if (validation.success) {
        await campaignWorkflowManager.completeWorkflowStep(currentWorkflow.id);
        const updatedWorkflow = campaignWorkflowManager.getWorkflow(currentWorkflow.id);
        setCurrentWorkflow(updatedWorkflow);
      }
    } catch (error) {
      console.error('Validation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDryRun = async () => {
    if (!currentWorkflow) return;

    try {
      setLoading(true);
      const dryRun = await campaignWorkflowManager.performDryRun(currentWorkflow.id);
      setDryRunResults(dryRun);
      
      if (dryRun.safetyScore >= 0.7) {
        await campaignWorkflowManager.completeWorkflowStep(currentWorkflow.id);
        const updatedWorkflow = campaignWorkflowManager.getWorkflow(currentWorkflow.id);
        setCurrentWorkflow(updatedWorkflow);
      }
    } catch (error) {
      console.error('Dry run failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveWorkflow = async () => {
    if (!currentWorkflow) return;

    try {
      await campaignWorkflowManager.completeWorkflowStep(currentWorkflow.id);
      const updatedWorkflow = campaignWorkflowManager.getWorkflow(currentWorkflow.id);
      setCurrentWorkflow(updatedWorkflow);
    } catch (error) {
      console.error('Approval failed:', error);
    }
  };

  const handleExecuteWorkflow = async () => {
    if (!currentWorkflow) return;

    try {
      setLoading(true);
      // This would integrate with the campaign execution system
      onWorkflowExecuted?.(currentWorkflow.id);
      
      await campaignWorkflowManager.completeWorkflowStep(currentWorkflow.id);
      const updatedWorkflow = campaignWorkflowManager.getWorkflow(currentWorkflow.id);
      setCurrentWorkflow(updatedWorkflow);
    } catch (error) {
      console.error('Execution failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentStep = (): WorkflowStep | null => {
    if (!currentWorkflow) return null;
    return currentWorkflow.steps[currentWorkflow.currentStep] || null;
  };

  const getStepActions = (step: WorkflowStep) => {
    switch (step.type) {
      case 'validation':
        return (
          <button onClick={handleValidateWorkflow} disabled={loading}>
            {loading ? 'Validating...' : 'Validate Configuration'}
          </button>
        );
      case 'dry_run':
        return (
          <button onClick={handleDryRun} disabled={loading}>
            {loading ? 'Running...' : 'Perform Dry Run'}
          </button>
        );
      case 'approval':
        return (
          <button onClick={handleApproveWorkflow} disabled={loading}>
            Approve for Execution
          </button>
        );
      case 'execution':
        return (
          <button onClick={handleExecuteWorkflow} disabled={loading}>
            {loading ? 'Executing...' : 'Execute Campaign'}
          </button>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`campaign-workflow-builder ${className}`}>
      {/* Header */}
      <div className="builder-header">
        <h2>Campaign Workflow Builder</h2>
        <div className="header-actions">
          <button
            className="new-workflow-btn"
            onClick={() => setShowTemplateSelector(true)}
          >
            Create New Workflow
          </button>
        </div>
      </div>

      {/* Template Selector Modal */}
      {showTemplateSelector && (
        <div className="template-selector-overlay">
          <div className="template-selector-modal">
            <div className="modal-header">
              <h3>Choose Campaign Template</h3>
              <button
                className="close-btn"
                onClick={() => setShowTemplateSelector(false)}
              >
                ×
              </button>
            </div>
            
            <div className="template-options">
              <div className="template-categories">
                <h4>Template Categories</h4>
                <div className="templates-grid">
                  {templates.map(template => (
                    <TemplateCard
                      key={template.id}
                      template={template}
                      onSelect={() => handleCreateFromTemplate(template)}
                    />
                  ))}
                </div>
              </div>
              
              <div className="custom-option">
                <h4>Custom Workflow</h4>
                <div className="custom-card">
                  <h5>Create from Scratch</h5>
                  <p>Build a completely custom campaign workflow</p>
                  <button onClick={handleCreateCustomWorkflow}>
                    Create Custom Workflow
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Workflow Builder */}
      {showWorkflowBuilder && currentWorkflow && (
        <div className="workflow-builder">
          <div className="workflow-header">
            <h3>{currentWorkflow.name}</h3>
            <div className="workflow-status">
              <span className={`status-badge ${currentWorkflow.status}`}>
                {currentWorkflow.status.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="workflow-progress">
            <div className="steps-container">
              {currentWorkflow.steps.map((step, index) => (
                <WorkflowStepCard
                  key={step.id}
                  step={step}
                  isActive={index === currentWorkflow.currentStep}
                  isCompleted={step.status === 'completed'}
                  stepNumber={index + 1}
                />
              ))}
            </div>
          </div>

          {/* Current Step Details */}
          {getCurrentStep() && (
            <div className="current-step-details">
              <h4>Current Step: {getCurrentStep()?.name}</h4>
              <p>{getCurrentStep()?.description}</p>
              
              {/* Step-specific content */}
              {getCurrentStep()?.type === 'configuration' && (
                <ConfigurationStep
                  workflow={currentWorkflow}
                  template={selectedTemplate}
                />
              )}
              
              {getCurrentStep()?.type === 'validation' && validationResults && (
                <ValidationResults results={validationResults} />
              )}
              
              {getCurrentStep()?.type === 'dry_run' && dryRunResults && (
                <DryRunResults results={dryRunResults} />
              )}
              
              {getCurrentStep()?.type === 'approval' && (
                <ApprovalStep
                  workflow={currentWorkflow}
                  validationResults={validationResults}
                  dryRunResults={dryRunResults}
                />
              )}

              {/* Step Actions */}
              <div className="step-actions">
                {getStepActions(getCurrentStep()!)}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Existing Workflows */}
      <div className="existing-workflows">
        <h3>Existing Workflows ({workflows.length})</h3>
        {workflows.length === 0 ? (
          <div className="no-workflows">
            <p>No workflows created yet</p>
            <p>Create your first campaign workflow to get started</p>
          </div>
        ) : (
          <div className="workflows-list">
            {workflows.map(workflow => (
              <WorkflowCard
                key={workflow.id}
                workflow={workflow}
                onSelect={() => {
                  setCurrentWorkflow(workflow);
                  setShowWorkflowBuilder(true);
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Template Card Component
const TemplateCard: React.FC<{
  template: CampaignTemplate;
  onSelect: () => void;
}> = ({ template, onSelect }) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return '#10b981';
      case 'intermediate': return '#f59e0b';
      case 'advanced': return '#ef4444';
      default: return '#6b7280';
    }
  };

  return (
    <div className="template-card">
      <div className="template-header">
        <h5>{template.name}</h5>
        <div className="template-badges">
          <span 
            className="difficulty-badge"
            style={{ backgroundColor: getDifficultyColor(template.difficulty) }}
          >
            {template.difficulty}
          </span>
          <span className="category-badge">{template.category}</span>
        </div>
      </div>
      
      <p className="template-description">{template.description}</p>
      
      <div className="template-details">
        <div className="detail">
          <span>Duration: ~{template.estimatedDuration} min</span>
        </div>
        <div className="detail">
          <span>Phases: {template.phases.length}</span>
        </div>
      </div>
      
      <div className="template-outcomes">
        <h6>Expected Outcomes:</h6>
        <ul>
          {template.expectedOutcomes.slice(0, 3).map((outcome, index) => (
            <li key={index}>{outcome}</li>
          ))}
        </ul>
      </div>
      
      <button className="select-template-btn" onClick={onSelect}>
        Use This Template
      </button>
    </div>
  );
};

// Workflow Step Card Component
const WorkflowStepCard: React.FC<{
  step: WorkflowStep;
  isActive: boolean;
  isCompleted: boolean;
  stepNumber: number;
}> = ({ step, isActive, isCompleted, stepNumber }) => {
  return (
    <div className={`workflow-step-card ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}>
      <div className="step-number">{stepNumber}</div>
      <div className="step-content">
        <h5>{step.name}</h5>
        <p>{step.description}</p>
        <div className={`step-status ${step.status}`}>
          {step.status.replace('_', ' ').toUpperCase()}
        </div>
      </div>
    </div>
  );
};

// Configuration Step Component
const ConfigurationStep: React.FC<{
  workflow: CampaignWorkflow;
  template: CampaignTemplate | null;
}> = ({ workflow, template }) => {
  return (
    <div className="configuration-step">
      <h5>Campaign Configuration</h5>
      {template ? (
        <div className="template-config">
          <p>Configuration based on template: <strong>{template.name}</strong></p>
          <div className="config-summary">
            <div>Phases: {workflow.config.phases?.length || 0}</div>
            <div>Safety Level: {workflow.config.safetySettings?.automaticRollbackEnabled ? 'High' : 'Medium'}</div>
          </div>
        </div>
      ) : (
        <div className="custom-config">
          <p>Custom configuration - configure phases and settings manually</p>
        </div>
      )}
    </div>
  );
};

// Validation Results Component
const ValidationResults: React.FC<{
  results: ValidationResult;
}> = ({ results }) => {
  return (
    <div className="validation-results">
      <h5>Validation Results</h5>
      <div className={`validation-status ${results.success ? 'success' : 'failed'}`}>
        {results.success ? 'Configuration Valid' : 'Validation Failed'}
      </div>
      
      {results.errors.length > 0 && (
        <div className="validation-errors">
          <h6>Errors:</h6>
          <ul>
            {results.errors.map((error, index) => (
              <li key={index} className="error">{error}</li>
            ))}
          </ul>
        </div>
      )}
      
      {results.warnings.length > 0 && (
        <div className="validation-warnings">
          <h6>Warnings:</h6>
          <ul>
            {results.warnings.map((warning, index) => (
              <li key={index} className="warning">{warning}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

// Dry Run Results Component
const DryRunResults: React.FC<{
  results: DryRunResult;
}> = ({ results }) => {
  return (
    <div className="dry-run-results">
      <h5>Dry Run Results</h5>
      <div className="results-summary">
        <div className="result-item">
          <span>Files to Process: {results.wouldProcess.length}</span>
        </div>
        <div className="result-item">
          <span>Estimated Changes: {results.estimatedChanges}</span>
        </div>
        <div className="result-item">
          <span>Safety Score: {(results.safetyScore * 100).toFixed(1)}%</span>
        </div>
      </div>
      
      {results.potentialIssues.length > 0 && (
        <div className="potential-issues">
          <h6>Potential Issues:</h6>
          <ul>
            {results.potentialIssues.map((issue, index) => (
              <li key={index}>{issue}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

// Approval Step Component
const ApprovalStep: React.FC<{
  workflow: CampaignWorkflow;
  validationResults: ValidationResult | null;
  dryRunResults: DryRunResult | null;
}> = ({ workflow, validationResults, dryRunResults }) => {
  return (
    <div className="approval-step">
      <h5>Campaign Approval</h5>
      <p>Review the campaign configuration and results before execution:</p>
      
      <div className="approval-checklist">
        <div className={`checklist-item ${validationResults?.success ? 'passed' : 'failed'}`}>
          <span>✓ Configuration Validation</span>
          <span>{validationResults?.success ? 'Passed' : 'Failed'}</span>
        </div>
        
        <div className={`checklist-item ${dryRunResults && dryRunResults.safetyScore >= 0.7 ? 'passed' : 'warning'}`}>
          <span>✓ Dry Run Safety Check</span>
          <span>
            {dryRunResults 
              ? `${(dryRunResults.safetyScore * 100).toFixed(1)}% Safe`
              : 'Not Performed'
            }
          </span>
        </div>
        
        <div className="checklist-item passed">
          <span>✓ Rollback Plan</span>
          <span>Available</span>
        </div>
      </div>
    </div>
  );
};

// Workflow Card Component
const WorkflowCard: React.FC<{
  workflow: CampaignWorkflow;
  onSelect: () => void;
}> = ({ workflow, onSelect }) => {
  return (
    <div className="workflow-card" onClick={onSelect}>
      <div className="workflow-header">
        <h5>{workflow.name}</h5>
        <div className={`status-badge ${workflow.status}`}>
          {workflow.status.toUpperCase()}
        </div>
      </div>
      
      <p className="workflow-description">{workflow.description}</p>
      
      <div className="workflow-progress-summary">
        <span>Step {workflow.currentStep + 1} of {workflow.steps.length}</span>
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ width: `${((workflow.currentStep + 1) / workflow.steps.length) * 100}%` }}
          />
        </div>
      </div>
      
      <div className="workflow-timestamps">
        <span>Created: {workflow.createdAt.toLocaleDateString()}</span>
        <span>Updated: {workflow.updatedAt.toLocaleDateString()}</span>
      </div>
    </div>
  );
};

export default CampaignWorkflowBuilder;