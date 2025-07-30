/**
 * Campaign Integration Dashboard
 * 
 * Main dashboard that integrates all campaign system components including
 * monitoring, workflow management, conflict resolution, and debugging tools.
 */

import React, { useState, useEffect } from 'react';

import { useCampaignMonitoring } from '../../hooks/useCampaignMonitoring';
import { campaignDebugger ,
  DebugSessionStatus
} from '../../services/CampaignDebugger';
import type {
  CampaignHealthReport
} from '../../services/CampaignDebugger';

import { CampaignControlPanel } from './CampaignControlPanel';
import { CampaignScheduler } from './CampaignScheduler';
import { CampaignWorkflowBuilder } from './CampaignWorkflowBuilder';
import { ConflictResolutionPanel } from './ConflictResolutionPanel';

interface CampaignIntegrationDashboardProps {
  className?: string;
}

type DashboardView = 'overview' | 'control' | 'workflows' | 'scheduler' | 'conflicts' | 'debugging';

export const CampaignIntegrationDashboard: React.FC<CampaignIntegrationDashboardProps> = ({
  className = ''
}) => {
  const [activeView, setActiveView] = useState<DashboardView>('overview');
  const [healthReports, setHealthReports] = useState<CampaignHealthReport[]>([]);
  const [debugSessions, setDebugSessions] = useState<any[]>([]);
  
  const { state: campaignState, actions: campaignActions } = useCampaignMonitoring({
    autoRefresh: true,
    refreshInterval: 30000,
    onCampaignStart: (campaignId) => {
      // Campaign started callback
    },
    onCampaignComplete: (campaignId) => {
      // Campaign completed callback
    },
    onCampaignFailed: (campaignId, error) => {
      // Log failure for debugging
      handleCampaignFailure(campaignId);
    },
    onSystemHealthChange: (health) => {
      // System health monitoring callback
    }
  });

  // Load health reports and debug sessions
  useEffect(() => {
    const loadHealthData = () => {
      const reports = campaignDebugger.getAllHealthReports();
      const sessions = campaignDebugger.getAllDebugSessions();
      
      setHealthReports(reports);
      setDebugSessions(sessions);
    };

    void loadHealthData();
    
    // Refresh every minute
    const interval = setInterval(() => void loadHealthData(), 60000);
    return () => clearInterval(interval);
  }, []);

  const handleCampaignFailure = async (campaignId: string) => {
    try {
      // Start debug session for failed campaign
      const sessionId = await campaignDebugger.startDebugSession(campaignId);
      
      // Execute debug steps
      await campaignDebugger.executeDebugSteps(sessionId);
      
      // Generate recovery plan
      await campaignDebugger.generateRecoveryPlan(sessionId);
      
      // Refresh debug sessions
      const sessions = campaignDebugger.getAllDebugSessions();
      setDebugSessions(sessions);
      
      // Switch to debugging view
      setActiveView('debugging');
    } catch (error) {
      console.error('Failed to handle campaign failure:', error);
    }
  };

  const getViewTitle = (view: DashboardView): string => {
    switch (view) {
      case 'overview': return 'Campaign System Overview';
      case 'control': return 'Campaign Control Panel';
      case 'workflows': return 'Workflow Builder';
      case 'scheduler': return 'Campaign Scheduler';
      case 'conflicts': return 'Conflict Resolution';
      case 'debugging': return 'Debugging & Recovery';
      default: return 'Campaign Dashboard';
    }
  };

  const getSystemHealthSummary = () => {
    if (!campaignState.systemHealth) return null;

    const { systemHealth } = campaignState;
    return {
      status: systemHealth.overallHealth,
      errors: systemHealth.typeScriptErrors,
      warnings: systemHealth.lintingWarnings,
      buildTime: systemHealth.buildTime,
      trends: systemHealth.healthTrends
    };
  };

  const getActiveIssuesCount = () => {
    return healthReports.reduce((count, report) => 
      count + report.issues.filter(issue => !issue.resolved).length, 0
    );
  };

  const getActiveDebugSessionsCount = () => {
    return debugSessions.filter(session => 
      session.status === DebugSessionStatus.ACTIVE
    ).length;
  };

  const systemHealth = getSystemHealthSummary();
  const activeIssues = getActiveIssuesCount();
  const activeDebugSessions = getActiveDebugSessionsCount();

  return (
    <div className={`campaign-integration-dashboard ${className}`}>
      {/* Navigation */}
      <div className="dashboard-nav">
        <div className="nav-header">
          <h1>Campaign Management System</h1>
          <div className="system-status">
            {systemHealth &amp;&amp; (
              <div className={`status-indicator ${systemHealth.status}`}>
                <span className="status-dot"></span>
                <span className="status-text">{systemHealth.status.toUpperCase()}</span>
              </div>
            )}
          </div>
        </div>
        
        <nav className="nav-tabs">
          <button
            className={`nav-tab ${activeView === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveView('overview&apos;)}
          >
            Overview
          </button>
          <button
            className={`nav-tab ${activeView === 'control' ? 'active' : ''}`}
            onClick={() => setActiveView('control&apos;)}
          >
            Control Panel
            {campaignState.activeCampaigns.length > 0 &amp;&amp; (
              <span className="badge">{campaignState.activeCampaigns.length}</span>
            )}
          </button>
          <button
            className={`nav-tab ${activeView === 'workflows' ? 'active' : ''}`}
            onClick={() => setActiveView('workflows&apos;)}
          >
            Workflows
          </button>
          <button
            className={`nav-tab ${activeView === 'scheduler' ? 'active' : ''}`}
            onClick={() => setActiveView('scheduler&apos;)}
          >
            Scheduler
          </button>
          <button
            className={`nav-tab ${activeView === 'conflicts' ? 'active' : ''}`}
            onClick={() => setActiveView('conflicts&apos;)}
          >
            Conflicts
            {activeIssues > 0 &amp;&amp; (
              <span className="badge warning">{activeIssues}</span>
            )}
          </button>
          <button
            className={`nav-tab ${activeView === 'debugging' ? 'active' : ''}`}
            onClick={() => setActiveView('debugging&apos;)}
          >
            Debug &amp; Recovery
            {activeDebugSessions > 0 &amp;&amp; (
              <span className="badge error">{activeDebugSessions}</span>
            )}
          </button>
        </nav>
      </div>

      {/* Content */}
      <div className="dashboard-content">
        <div className="content-header">
          <h2>{getViewTitle(activeView)}</h2>
          {campaignState.lastUpdate &amp;&amp; (
            <div className="last-update">
              Last updated: {campaignState.lastUpdate.toLocaleTimeString()}
            </div>
          )}
        </div>

        <div className="content-body">
          {activeView === 'overview' && (
            <OverviewPanel
              systemHealth={systemHealth}
              activeCampaigns={campaignState.activeCampaigns}
              healthReports={healthReports}
              debugSessions={debugSessions}
              onViewChange={setActiveView}
            />
          )}

          {activeView === 'control' && (
            <CampaignControlPanel
              onCampaignStart={(campaignId) => {
                // Campaign started from control panel
              }}
              onCampaignComplete={(campaignId) => {
                // Campaign completed from control panel
              }}
            />
          )}

          {activeView === 'workflows' && (
            <CampaignWorkflowBuilder
              onWorkflowCreated={(workflowId) => {
                // Workflow created callback
              }}
              onWorkflowExecuted={(workflowId) => {
                // Workflow executed callback
              }}
            />
          )}

          {activeView === 'scheduler&apos; &amp;&amp; (
            <CampaignScheduler
              onScheduleCreated={(scheduleId) => {
                // Schedule created callback
              }}
            />
          )}

          {activeView === 'conflicts&apos; &amp;&amp; (
            <ConflictResolutionPanel
              onConflictResolved={(conflictId, result) => {
                // Conflict resolved callback
              }}
              onManualOverride={(conflictId, action) => {
                // Manual override applied callback
              }}
            />
          )}

          {activeView === 'debugging&apos; &amp;&amp; (
            <DebuggingPanel
              healthReports={healthReports}
              debugSessions={debugSessions}
              onStartDebugSession={handleCampaignFailure}
            />
          )}
        </div>
      </div>
    </div>
  );
};

// Overview Panel Component
const OverviewPanel: React.FC<{
  systemHealth: any;
  activeCampaigns: any[];
  healthReports: CampaignHealthReport[];
  debugSessions: any[];
  onViewChange: (view: DashboardView) => void;
}> = ({ systemHealth, activeCampaigns, healthReports, debugSessions, onViewChange }) => {
  return (
    <div className="overview-panel">
      {/* System Health Summary */}
      <div className="overview-section">
        <h3>System Health</h3>
        {systemHealth ? (
          <div className="health-summary">
            <div className={`health-card ${systemHealth.status}`}>
              <div className="health-status">
                <span className="status-icon"></span>
                <span className="status-label">{systemHealth.status.toUpperCase()}</span>
              </div>
              <div className="health-metrics">
                <div className="metric">
                  <span className="metric-value">{systemHealth.errors}</span>
                  <span className="metric-label">TS Errors</span>
                </div>
                <div className="metric">
                  <span className="metric-value">{systemHealth.warnings}</span>
                  <span className="metric-label">Warnings</span>
                </div>
                <div className="metric">
                  <span className="metric-value">{systemHealth.buildTime.toFixed(1)}s</span>
                  <span className="metric-label">Build Time</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="no-data">System health data not available</div>
        )}
      </div>

      {/* Active Campaigns */}
      <div className="overview-section">
        <h3>Active Campaigns</h3>
        <div className="campaigns-summary">
          <div className="summary-card" onClick={() => onViewChange('control&apos;)}>
            <div className="card-value">{activeCampaigns.length}</div>
            <div className="card-label">Running Campaigns</div>
          </div>
          <div className="campaigns-list">
            {activeCampaigns.slice(0, 3).map(campaign => (
              <div key={campaign.campaignId} className="campaign-summary">
                <div className="campaign-name">{campaign.campaignId}</div>
                <div className="campaign-progress">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ width: `${campaign.progress}%` }}
                    />
                  </div>
                  <span className="progress-text">{campaign.progress.toFixed(1)}%</span>
                </div>
              </div>
            ))}
            {activeCampaigns.length > 3 && (
              <div className="more-campaigns">
                +{activeCampaigns.length - 3} more campaigns
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Health Reports */}
      <div className="overview-section">
        <h3>Health Reports</h3>
        <div className="health-reports-summary">
          {healthReports.length === 0 ? (
            <div className="no-data">No health reports available</div>
          ) : (
            <div className="reports-grid">
              {healthReports.slice(0, 4).map(report => (
                <div key={report.campaignId} className="report-card">
                  <div className="report-header">
                    <span className="campaign-id">{report.campaignId}</span>
                    <span className={`health-badge ${report.overallHealth}`}>
                      {report.overallHealth.toUpperCase()}
                    </span>
                  </div>
                  <div className="report-score">
                    <span className="score-value">{report.healthScore}</span>
                    <span className="score-label">Health Score</span>
                  </div>
                  <div className="report-issues">
                    {report.issues.filter(i => !i.resolved).length} active issues
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Debug Sessions */}
      <div className="overview-section">
        <h3>Debug Sessions</h3>
        <div className="debug-sessions-summary">
          <div className="summary-card" onClick={() => onViewChange('debugging&apos;)}>
            <div className="card-value">
              {debugSessions.filter(s => s.status === 'active&apos;).length}
            </div>
            <div className="card-label">Active Sessions</div>
          </div>
          {debugSessions.length > 0 && (
            <div className="recent-sessions">
              {debugSessions.slice(0, 3).map(session => (
                <div key={session.id} className="session-summary">
                  <div className="session-campaign">{session.campaignId}</div>
                  <div className={`session-status ${session.status}`}>
                    {session.status.toUpperCase()}
                  </div>
                  <div className="session-time">
                    {session.startTime.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Debugging Panel Component
const DebuggingPanel: React.FC<{
  healthReports: CampaignHealthReport[];
  debugSessions: any[];
  onStartDebugSession: (campaignId: string) => void;
}> = ({ healthReports, debugSessions, onStartDebugSession }) => {
  return (
    <div className="debugging-panel">
      <div className="debug-actions">
        <h3>Debug Actions</h3>
        <div className="actions-grid">
          <button 
            className="action-btn"
            onClick={() => onStartDebugSession('test-campaign&apos;)}
          >
            Start Debug Session
          </button>
          <button className="action-btn">
            Run Health Check
          </button>
          <button className="action-btn">
            Generate Recovery Plan
          </button>
        </div>
      </div>

      <div className="debug-sessions">
        <h3>Debug Sessions</h3>
        {debugSessions.length === 0 ? (
          <div className="no-data">No debug sessions</div>
        ) : (
          <div className="sessions-list">
            {debugSessions.map(session => (
              <div key={session.id} className="session-card">
                <div className="session-header">
                  <span className="session-id">{session.id}</span>
                  <span className={`session-status ${session.status}`}>
                    {session.status.toUpperCase()}
                  </span>
                </div>
                <div className="session-details">
                  <div>Campaign: {session.campaignId}</div>
                  <div>Started: {session.startTime.toLocaleString()}</div>
                  <div>Findings: {session.findings.length}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="health-reports">
        <h3>Health Reports</h3>
        {healthReports.length === 0 ? (
          <div className="no-data">No health reports</div>
        ) : (
          <div className="reports-list">
            {healthReports.map(report => (
              <div key={report.campaignId} className="health-report-card">
                <div className="report-header">
                  <span className="campaign-id">{report.campaignId}</span>
                  <span className={`health-status ${report.overallHealth}`}>
                    {report.overallHealth.toUpperCase()}
                  </span>
                </div>
                <div className="report-metrics">
                  <div className="metric">
                    <span>Score: {report.healthScore}</span>
                  </div>
                  <div className="metric">
                    <span>Issues: {report.issues.filter(i => !i.resolved).length}</span>
                  </div>
                  <div className="metric">
                    <span>Last Check: {report.lastCheckTime.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CampaignIntegrationDashboard;