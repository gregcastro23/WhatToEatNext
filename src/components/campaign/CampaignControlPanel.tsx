/**
 * Campaign Control Panel Component
 * 
 * Provides a comprehensive dashboard for monitoring and controlling campaign operations
 * within the Kiro IDE interface. Displays real-time status, metrics, and control options.
 */

import React, { useState, useEffect } from 'react';

import { kiroCampaignIntegration } from '../../services/KiroCampaignIntegration';
import type {
  KiroCampaignControlPanel,
  KiroCampaignStatus,
  SystemHealthStatus,
  QuickAction,
  CampaignExecutionRequest
} from '../../services/KiroCampaignIntegration';

interface CampaignControlPanelProps {
  className?: string;
  onCampaignStart?: (campaignId: string) => void;
  onCampaignComplete?: (campaignId: string) => void;
}

export const CampaignControlPanel: React.FC<CampaignControlPanelProps> = ({
  className = '',
  onCampaignStart,
  onCampaignComplete
}) => {
  const [controlPanel, setControlPanel] = useState<KiroCampaignControlPanel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPhases, setSelectedPhases] = useState<string[]>([]);
  const [safetyLevel, setSafetyLevel] = useState<'conservative' | 'standard' | 'aggressive'>('standard');

  // Load control panel data
  useEffect(() => {
    const loadControlPanel = async () => {
      try {
        setLoading(true);
        const data = await kiroCampaignIntegration.getCampaignControlPanel();
        setControlPanel(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load campaign data');
      } finally {
        setLoading(false);
      }
    };

    void loadControlPanel();
    
    // Refresh every 30 seconds
    const interval = setInterval(() => void loadControlPanel(), 30000);
    return () => clearInterval(interval);
  }, []);

  const handleStartCampaign = async () => {
    if (selectedPhases.length === 0) return;

    try {
      const request: CampaignExecutionRequest = {
        phaseIds: selectedPhases,
        safetyLevel,
        approvalRequired: safetyLevel === 'aggressive'
      };

      const campaignId = await kiroCampaignIntegration.startCampaign(request);
      onCampaignStart?.(campaignId);
      
      // Refresh control panel
      const data = await kiroCampaignIntegration.getCampaignControlPanel();
      setControlPanel(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start campaign');
    }
  };

  const handleQuickAction = async (action: QuickAction) => {
    try {
      const phaseMap: Record<string, string[]> = {
        'quick-typescript-fix': ['phase1'],
        'linting-cleanup': ['phase2'],
        'build-optimization': ['phase3'],
        'full-campaign': ['phase1', 'phase2', 'phase3']
      };

      const request: CampaignExecutionRequest = {
        phaseIds: phaseMap[action.id] || [],
        safetyLevel: action.safetyLevel === 'maximum' ? 'conservative' : 'standard'
      };

      const campaignId = await kiroCampaignIntegration.startCampaign(request);
      onCampaignStart?.(campaignId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to execute quick action');
    }
  };

  const handleCampaignControl = async (campaignId: string, action: 'pause' | 'resume' | 'stop') => {
    try {
      let success = false;
      
      switch (action) {
        case 'pause':
          success = await kiroCampaignIntegration.pauseCampaign(campaignId);
          break;
        case 'resume':
          success = await kiroCampaignIntegration.resumeCampaign(campaignId);
          break;
        case 'stop':
          success = await kiroCampaignIntegration.stopCampaign(campaignId);
          if (success) onCampaignComplete?.(campaignId);
          break;
      }

      if (success) {
        // Refresh control panel
        const data = await kiroCampaignIntegration.getCampaignControlPanel();
        setControlPanel(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to ${action} campaign`);
    }
  };

  if (loading) {
    return (
      <div className={`campaign-control-panel ${className}`}>
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading campaign data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`campaign-control-panel ${className}`}>
        <div className="error-message">
          <h3>Error Loading Campaign Data</h3>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

  if (!controlPanel) return null;

  return (
    <div className={`campaign-control-panel ${className}`}>
      {/* Header */}
      <div className="panel-header">
        <h2>Campaign Control Panel</h2>
        <div className="system-health">
          <SystemHealthIndicator health={controlPanel.systemHealth} />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions-section">
        <h3>Quick Actions</h3>
        <div className="quick-actions-grid">
          {controlPanel.quickActions.map(action => (
            <QuickActionCard
              key={action.id}
              action={action}
              onExecute={() => handleQuickAction(action)}
            />
          ))}
        </div>
      </div>

      {/* Active Campaigns */}
      <div className="active-campaigns-section">
        <h3>Active Campaigns ({controlPanel.activeCampaigns.length})</h3>
        {controlPanel.activeCampaigns.length === 0 ? (
          <p className="no-campaigns">No active campaigns</p>
        ) : (
          <div className="campaigns-list">
            {controlPanel.activeCampaigns.map(campaign => (
              <CampaignStatusCard
                key={campaign.campaignId}
                campaign={campaign}
                onControl={handleCampaignControl}
              />
            ))}
          </div>
        )}
      </div>

      {/* Campaign Builder */}
      <div className="campaign-builder-section">
        <h3>Start New Campaign</h3>
        <div className="campaign-builder">
          <div className="phase-selection">
            <h4>Select Phases</h4>
            <div className="phases-list">
              {controlPanel.availablePhases.map(phase => (
                <label key={phase.id} className="phase-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedPhases.includes(phase.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedPhases([...selectedPhases, phase.id]);
                      } else {
                        setSelectedPhases(selectedPhases.filter(id => id !== phase.id));
                      }
                    }}
                  />
                  <span className="phase-name">{phase.name}</span>
                  <span className="phase-description">{phase.description}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="safety-level-selection">
            <h4>Safety Level</h4>
            <div className="safety-options">
              {(['conservative&apos;, 'standard&apos;, 'aggressive&apos;] as const).map(level => (
                <label key={level} className="safety-option">
                  <input
                    type="radio"
                    name="safetyLevel"
                    value={level}
                    checked={safetyLevel === level}
                    onChange={(e) => setSafetyLevel(e.target.value as any)}
                  />
                  <span className="safety-label">{level.charAt(0).toUpperCase() + level.slice(1)}</span>
                </label>
              ))}
            </div>
          </div>

          <button
            className="start-campaign-btn"
            onClick={handleStartCampaign}
            disabled={selectedPhases.length === 0}
          >
            Start Campaign
          </button>
        </div>
      </div>

      {/* Recent Results */}
      <div className="recent-results-section">
        <h3>Recent Results</h3>
        {controlPanel.recentResults.length === 0 ? (
          <p className="no-results">No recent campaign results</p>
        ) : (
          <div className="results-list">
            {controlPanel.recentResults.map((result, index) => (
              <CampaignResultCard key={index} result={result} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// System Health Indicator Component
const SystemHealthIndicator: React.FC<{ health: SystemHealthStatus }> = ({ health }) => {
  const getHealthColor = (healthLevel: string) => {
    switch (healthLevel) {
      case 'excellent': return '#10b981';
      case 'good': return '#3b82f6';
      case 'warning': return '#f59e0b';
      case 'critical': return '#ef4444';
      default: return '#6b7280';
    }
  };

  return (
    <div className="system-health-indicator">
      <div 
        className="health-status"
        style={{ backgroundColor: getHealthColor(health.overallHealth) }}
      >
        {health.overallHealth.toUpperCase()}
      </div>
      <div className="health-metrics">
        <div className="metric">
          <span className="metric-label">TS Errors:</span>
          <span className="metric-value">{health.typeScriptErrors}</span>
        </div>
        <div className="metric">
          <span className="metric-label">Warnings:</span>
          <span className="metric-value">{health.lintingWarnings}</span>
        </div>
        <div className="metric">
          <span className="metric-label">Build:</span>
          <span className="metric-value">{health.buildTime.toFixed(1)}s</span>
        </div>
      </div>
    </div>
  );
};

// Quick Action Card Component
const QuickActionCard: React.FC<{
  action: QuickAction;
  onExecute: () => void;
}> = ({ action, onExecute }) => {
  const getSafetyColor = (level: string) => {
    switch (level) {
      case 'low': return '#10b981';
      case 'medium': return '#3b82f6';
      case 'high': return '#f59e0b';
      case 'maximum': return '#ef4444';
      default: return '#6b7280';
    }
  };

  return (
    <div className="quick-action-card">
      <div className="action-header">
        <h4>{action.name}</h4>
        <div 
          className="safety-badge"
          style={{ backgroundColor: getSafetyColor(action.safetyLevel) }}
        >
          {action.safetyLevel}
        </div>
      </div>
      <p className="action-description">{action.description}</p>
      <div className="action-footer">
        <span className="duration">~{action.estimatedDuration} min</span>
        <button
          className="execute-btn"
          onClick={onExecute}
          disabled={!action.enabled}
        >
          Execute
        </button>
      </div>
    </div>
  );
};

// Campaign Status Card Component
const CampaignStatusCard: React.FC<{
  campaign: KiroCampaignStatus;
  onControl: (campaignId: string, action: 'pause' | 'resume' | 'stop') => void;
}> = ({ campaign, onControl }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return '#3b82f6';
      case 'paused': return '#f59e0b';
      case 'completed': return '#10b981';
      case 'failed': return '#ef4444';
      default: return '#6b7280';
    }
  };

  return (
    <div className="campaign-status-card">
      <div className="campaign-header">
        <h4>{campaign.campaignId}</h4>
        <div 
          className="status-badge"
          style={{ backgroundColor: getStatusColor(campaign.status) }}
        >
          {campaign.status.toUpperCase()}
        </div>
      </div>
      
      <div className="campaign-progress">
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ width: `${campaign.progress}%` }}
          />
        </div>
        <span className="progress-text">{campaign.progress.toFixed(1)}%</span>
      </div>

      {campaign.currentPhase && (
        <p className="current-phase">Phase: {campaign.currentPhase}</p>
      )}

      <div className="campaign-metrics">
        <div className="metric">
          <span>TS Errors: {campaign.metrics.typeScriptErrors.current}</span>
        </div>
        <div className="metric">
          <span>Warnings: {campaign.metrics.lintingWarnings.current}</span>
        </div>
      </div>

      <div className="campaign-controls">
        {campaign.status === 'running' && (
          <>
            <button onClick={() => onControl(campaign.campaignId, 'pause&apos;)}>
              Pause
            </button>
            <button onClick={() => onControl(campaign.campaignId, 'stop&apos;)}>
              Stop
            </button>
          </>
        )}
        {campaign.status === 'paused&apos; &amp;&amp; (
          <>
            <button onClick={() => onControl(campaign.campaignId, 'resume&apos;)}>
              Resume
            </button>
            <button onClick={() => onControl(campaign.campaignId, 'stop&apos;)}>
              Stop
            </button>
          </>
        )}
      </div>

      <div className="last-update">
        Updated: {campaign.lastUpdate.toLocaleTimeString()}
      </div>
    </div>
  );
};

// Campaign Result Card Component
const CampaignResultCard: React.FC<{
  result: any; // CampaignResult type from the integration service
}> = ({ result }) => {
  return (
    <div className="campaign-result-card">
      <div className="result-header">
        <h4>{result.phaseName}</h4>
        <div className={`result-status ${result.success ? 'success' : 'failed'}`}>
          {result.success ? 'SUCCESS&apos; : 'FAILED&apos;}
        </div>
      </div>
      
      <div className="result-metrics">
        <div className="metric">
          <span>Errors Reduced: {result.metricsImprovement.errorsReduced}</span>
        </div>
        <div className="metric">
          <span>Warnings Reduced: {result.metricsImprovement.warningsReduced}</span>
        </div>
        <div className="metric">
          <span>Duration: {result.duration} min</span>
        </div>
      </div>

      <div className="result-timestamp">
        {result.completedAt.toLocaleString()}
      </div>
    </div>
  );
};

export default CampaignControlPanel;