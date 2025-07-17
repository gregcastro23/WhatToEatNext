/**
 * Conflict Resolution Panel Component
 * 
 * Provides interface for viewing, analyzing, and resolving campaign conflicts
 * with manual override capabilities and priority management.
 */

import React, { useState, useEffect } from 'react';
import { campaignConflictResolver } from '../../services/CampaignConflictResolver';
import type {
  CampaignConflict,
  ConflictResolutionStrategy,
  ConflictResolutionResult,
  CampaignPriority,
  CampaignDependency,
  ConflictType,
  ConflictSeverity,
  ConflictStatus,
  ResolutionAction
} from '../../services/CampaignConflictResolver';

interface ConflictResolutionPanelProps {
  className?: string;
  onConflictResolved?: (conflictId: string, result: ConflictResolutionResult) => void;
  onManualOverride?: (conflictId: string, action: string) => void;
}

export const ConflictResolutionPanel: React.FC<ConflictResolutionPanelProps> = ({
  className = '',
  onConflictResolved,
  onManualOverride
}) => {
  const [conflicts, setConflicts] = useState<CampaignConflict[]>([]);
  const [selectedConflict, setSelectedConflict] = useState<CampaignConflict | null>(null);
  const [resolutionStrategies, setResolutionStrategies] = useState<ConflictResolutionStrategy[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<ConflictStatus | 'all'>('all');
  const [filterSeverity, setFilterSeverity] = useState<ConflictSeverity | 'all'>('all');
  const [showManualOverride, setShowManualOverride] = useState(false);
  const [overrideReason, setOverrideReason] = useState('');

  // Load conflicts
  useEffect(() => {
    const loadConflicts = async () => {
      try {
        setLoading(true);
        
        // Detect new conflicts
        await campaignConflictResolver.detectConflicts();
        
        // Get all conflicts
        const allConflicts = campaignConflictResolver.getAllConflicts();
        setConflicts(allConflicts);
      } catch (error) {
        console.error('Failed to load conflicts:', error);
      } finally {
        setLoading(false);
      }
    };

    loadConflicts();
    
    // Refresh every 30 seconds
    const interval = setInterval(loadConflicts, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleAutoResolve = async () => {
    try {
      setLoading(true);
      const results = await campaignConflictResolver.autoResolveConflicts();
      
      // Refresh conflicts list
      const updatedConflicts = campaignConflictResolver.getAllConflicts();
      setConflicts(updatedConflicts);
      
      // Notify about resolved conflicts
      results.forEach(result => {
        if (result.success) {
          onConflictResolved?.(result.conflictId, result);
        }
      });
    } catch (error) {
      console.error('Auto-resolve failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResolveConflict = async (conflictId: string, strategyId?: string) => {
    try {
      setLoading(true);
      const result = await campaignConflictResolver.resolveConflict(conflictId, strategyId);
      
      // Refresh conflicts list
      const updatedConflicts = campaignConflictResolver.getAllConflicts();
      setConflicts(updatedConflicts);
      
      if (result.success) {
        onConflictResolved?.(conflictId, result);
      }
    } catch (error) {
      console.error('Failed to resolve conflict:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleManualOverride = async (action: ResolutionAction, parameters: Record<string, any>) => {
    if (!selectedConflict) return;

    try {
      setLoading(true);
      const success = await campaignConflictResolver.createManualOverride(
        selectedConflict.id,
        overrideReason,
        'user',
        action,
        parameters
      );

      if (success) {
        // Refresh conflicts list
        const updatedConflicts = campaignConflictResolver.getAllConflicts();
        setConflicts(updatedConflicts);
        
        setShowManualOverride(false);
        setOverrideReason('');
        onManualOverride?.(selectedConflict.id, action);
      }
    } catch (error) {
      console.error('Manual override failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredConflicts = (): CampaignConflict[] => {
    return conflicts.filter(conflict => {
      const statusMatch = filterStatus === 'all' || conflict.status === filterStatus;
      const severityMatch = filterSeverity === 'all' || conflict.severity === filterSeverity;
      return statusMatch && severityMatch;
    });
  };

  const getConflictTypeColor = (type: ConflictType): string => {
    switch (type) {
      case 'resource_contention': return '#f59e0b';
      case 'dependency_violation': return '#ef4444';
      case 'priority_conflict': return '#3b82f6';
      case 'safety_violation': return '#dc2626';
      case 'scheduling_conflict': return '#8b5cf6';
      default: return '#6b7280';
    }
  };

  const getSeverityColor = (severity: ConflictSeverity): string => {
    switch (severity) {
      case 'low': return '#10b981';
      case 'medium': return '#f59e0b';
      case 'high': return '#ef4444';
      case 'critical': return '#dc2626';
      default: return '#6b7280';
    }
  };

  const getStatusColor = (status: ConflictStatus): string => {
    switch (status) {
      case 'detected': return '#f59e0b';
      case 'analyzing': return '#3b82f6';
      case 'pending_resolution': return '#8b5cf6';
      case 'resolving': return '#06b6d4';
      case 'resolved': return '#10b981';
      case 'failed': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const filteredConflicts = getFilteredConflicts();

  return (
    <div className={`conflict-resolution-panel ${className}`}>
      {/* Header */}
      <div className="panel-header">
        <h2>Campaign Conflict Resolution</h2>
        <div className="header-actions">
          <button
            className="auto-resolve-btn"
            onClick={handleAutoResolve}
            disabled={loading}
          >
            {loading ? 'Resolving...' : 'Auto-Resolve'}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="conflict-filters">
        <div className="filter-group">
          <label htmlFor="statusFilter">Status:</label>
          <select
            id="statusFilter"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as ConflictStatus | 'all')}
          >
            <option value="all">All</option>
            <option value="detected">Detected</option>
            <option value="analyzing">Analyzing</option>
            <option value="pending_resolution">Pending Resolution</option>
            <option value="resolving">Resolving</option>
            <option value="resolved">Resolved</option>
            <option value="failed">Failed</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="severityFilter">Severity:</label>
          <select
            id="severityFilter"
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value as ConflictSeverity | 'all')}
          >
            <option value="all">All</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>
      </div>

      {/* Conflicts Summary */}
      <div className="conflicts-summary">
        <div className="summary-stats">
          <div className="stat">
            <span className="stat-value">{conflicts.length}</span>
            <span className="stat-label">Total Conflicts</span>
          </div>
          <div className="stat">
            <span className="stat-value">
              {conflicts.filter(c => c.status === 'detected' || c.status === 'pending_resolution').length}
            </span>
            <span className="stat-label">Unresolved</span>
          </div>
          <div className="stat">
            <span className="stat-value">
              {conflicts.filter(c => c.severity === 'high' || c.severity === 'critical').length}
            </span>
            <span className="stat-label">High Priority</span>
          </div>
        </div>
      </div>

      {/* Conflicts List */}
      <div className="conflicts-list">
        {filteredConflicts.length === 0 ? (
          <div className="no-conflicts">
            <p>No conflicts found</p>
            {filterStatus !== 'all' || filterSeverity !== 'all' ? (
              <p>Try adjusting the filters to see more conflicts</p>
            ) : (
              <p>All campaigns are running smoothly!</p>
            )}
          </div>
        ) : (
          filteredConflicts.map(conflict => (
            <ConflictCard
              key={conflict.id}
              conflict={conflict}
              onSelect={() => setSelectedConflict(conflict)}
              onResolve={(strategyId) => handleResolveConflict(conflict.id, strategyId)}
              getTypeColor={getConflictTypeColor}
              getSeverityColor={getSeverityColor}
              getStatusColor={getStatusColor}
            />
          ))
        )}
      </div>

      {/* Conflict Details Modal */}
      {selectedConflict && (
        <div className="conflict-details-overlay">
          <div className="conflict-details-modal">
            <div className="modal-header">
              <h3>Conflict Details</h3>
              <button
                className="close-btn"
                onClick={() => setSelectedConflict(null)}
              >
                ×
              </button>
            </div>

            <div className="modal-content">
              <ConflictDetails
                conflict={selectedConflict}
                onResolve={(strategyId) => handleResolveConflict(selectedConflict.id, strategyId)}
                onManualOverride={() => setShowManualOverride(true)}
                getTypeColor={getConflictTypeColor}
                getSeverityColor={getSeverityColor}
                getStatusColor={getStatusColor}
              />
            </div>
          </div>
        </div>
      )}

      {/* Manual Override Modal */}
      {showManualOverride && selectedConflict && (
        <div className="manual-override-overlay">
          <div className="manual-override-modal">
            <div className="modal-header">
              <h3>Manual Override</h3>
              <button
                className="close-btn"
                onClick={() => setShowManualOverride(false)}
              >
                ×
              </button>
            </div>

            <div className="modal-content">
              <ManualOverrideForm
                conflict={selectedConflict}
                overrideReason={overrideReason}
                onReasonChange={setOverrideReason}
                onSubmit={handleManualOverride}
                onCancel={() => setShowManualOverride(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Conflict Card Component
const ConflictCard: React.FC<{
  conflict: CampaignConflict;
  onSelect: () => void;
  onResolve: (strategyId?: string) => void;
  getTypeColor: (type: ConflictType) => string;
  getSeverityColor: (severity: ConflictSeverity) => string;
  getStatusColor: (status: ConflictStatus) => string;
}> = ({ conflict, onSelect, onResolve, getTypeColor, getSeverityColor, getStatusColor }) => {
  return (
    <div className="conflict-card" onClick={onSelect}>
      <div className="conflict-header">
        <div className="conflict-badges">
          <span 
            className="type-badge"
            style={{ backgroundColor: getTypeColor(conflict.type) }}
          >
            {conflict.type.replace('_', ' ').toUpperCase()}
          </span>
          <span 
            className="severity-badge"
            style={{ backgroundColor: getSeverityColor(conflict.severity) }}
          >
            {conflict.severity.toUpperCase()}
          </span>
          <span 
            className="status-badge"
            style={{ backgroundColor: getStatusColor(conflict.status) }}
          >
            {conflict.status.replace('_', ' ').toUpperCase()}
          </span>
        </div>
        <div className="conflict-time">
          {conflict.detectedAt.toLocaleString()}
        </div>
      </div>

      <div className="conflict-description">
        <p>{conflict.description}</p>
      </div>

      <div className="conflict-details">
        <div className="detail-item">
          <span className="detail-label">Campaigns:</span>
          <span className="detail-value">{conflict.involvedCampaigns.length}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Resources:</span>
          <span className="detail-value">{conflict.conflictingResources.length}</span>
        </div>
      </div>

      {conflict.status === 'detected' && (
        <div className="conflict-actions">
          <button
            className="resolve-btn"
            onClick={(e) => {
              e.stopPropagation();
              onResolve();
            }}
          >
            Auto-Resolve
          </button>
        </div>
      )}
    </div>
  );
};

// Conflict Details Component
const ConflictDetails: React.FC<{
  conflict: CampaignConflict;
  onResolve: (strategyId?: string) => void;
  onManualOverride: () => void;
  getTypeColor: (type: ConflictType) => string;
  getSeverityColor: (severity: ConflictSeverity) => string;
  getStatusColor: (status: ConflictStatus) => string;
}> = ({ conflict, onResolve, onManualOverride, getTypeColor, getSeverityColor, getStatusColor }) => {
  return (
    <div className="conflict-details">
      <div className="conflict-info">
        <h4>Conflict Information</h4>
        <div className="info-grid">
          <div className="info-item">
            <span className="info-label">Type:</span>
            <span 
              className="info-badge"
              style={{ backgroundColor: getTypeColor(conflict.type) }}
            >
              {conflict.type.replace('_', ' ').toUpperCase()}
            </span>
          </div>
          <div className="info-item">
            <span className="info-label">Severity:</span>
            <span 
              className="info-badge"
              style={{ backgroundColor: getSeverityColor(conflict.severity) }}
            >
              {conflict.severity.toUpperCase()}
            </span>
          </div>
          <div className="info-item">
            <span className="info-label">Status:</span>
            <span 
              className="info-badge"
              style={{ backgroundColor: getStatusColor(conflict.status) }}
            >
              {conflict.status.replace('_', ' ').toUpperCase()}
            </span>
          </div>
          <div className="info-item">
            <span className="info-label">Detected:</span>
            <span className="info-value">{conflict.detectedAt.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="conflict-description-full">
        <h4>Description</h4>
        <p>{conflict.description}</p>
      </div>

      <div className="involved-campaigns">
        <h4>Involved Campaigns</h4>
        <div className="campaigns-list">
          {conflict.involvedCampaigns.map(campaignId => (
            <div key={campaignId} className="campaign-item">
              {campaignId}
            </div>
          ))}
        </div>
      </div>

      {conflict.conflictingResources.length > 0 && (
        <div className="conflicting-resources">
          <h4>Conflicting Resources</h4>
          <div className="resources-list">
            {conflict.conflictingResources.map((resource, index) => (
              <div key={index} className="resource-item">
                <div className="resource-type">{resource.type}</div>
                <div className="resource-id">{resource.identifier}</div>
                <div className="resource-reason">{resource.conflictReason}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {conflict.resolutionStrategy && (
        <div className="resolution-strategy">
          <h4>Resolution Strategy</h4>
          <div className="strategy-info">
            <div className="strategy-name">{conflict.resolutionStrategy.name}</div>
            <div className="strategy-description">{conflict.resolutionStrategy.description}</div>
            <div className="strategy-details">
              <span>Duration: {conflict.resolutionStrategy.estimatedDuration} min</span>
              <span>Risk: {conflict.resolutionStrategy.riskLevel}</span>
            </div>
          </div>
        </div>
      )}

      <div className="resolution-actions">
        {conflict.status === 'detected' && (
          <>
            <button className="auto-resolve-btn" onClick={() => onResolve()}>
              Auto-Resolve
            </button>
            <button className="manual-override-btn" onClick={onManualOverride}>
              Manual Override
            </button>
          </>
        )}
      </div>
    </div>
  );
};

// Manual Override Form Component
const ManualOverrideForm: React.FC<{
  conflict: CampaignConflict;
  overrideReason: string;
  onReasonChange: (reason: string) => void;
  onSubmit: (action: ResolutionAction, parameters: Record<string, any>) => void;
  onCancel: () => void;
}> = ({ conflict, overrideReason, onReasonChange, onSubmit, onCancel }) => {
  const [selectedAction, setSelectedAction] = useState<ResolutionAction>('PAUSE_CAMPAIGN' as ResolutionAction);
  const [parameters, setParameters] = useState<Record<string, any>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (overrideReason.trim()) {
      onSubmit(selectedAction, parameters);
    }
  };

  return (
    <form className="manual-override-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="overrideReason">Override Reason:</label>
        <textarea
          id="overrideReason"
          value={overrideReason}
          onChange={(e) => onReasonChange(e.target.value)}
          placeholder="Explain why manual override is necessary..."
          required
          rows={3}
        />
      </div>

      <div className="form-group">
        <label htmlFor="resolutionAction">Resolution Action:</label>
        <select
          id="resolutionAction"
          value={selectedAction}
          onChange={(e) => setSelectedAction(e.target.value as ResolutionAction)}
        >
          <option value="PAUSE_CAMPAIGN">Pause Campaign</option>
          <option value="RESUME_CAMPAIGN">Resume Campaign</option>
          <option value="RESCHEDULE_CAMPAIGN">Reschedule Campaign</option>
          <option value="NOTIFY_USER">Notify User</option>
        </select>
      </div>

      {selectedAction === 'PAUSE_CAMPAIGN' && (
        <div className="form-group">
          <label htmlFor="campaignId">Campaign to Pause:</label>
          <select
            id="campaignId"
            onChange={(e) => setParameters({ ...parameters, campaignId: e.target.value })}
          >
            <option value="">Select Campaign</option>
            {conflict.involvedCampaigns.map(campaignId => (
              <option key={campaignId} value={campaignId}>
                {campaignId}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="form-actions">
        <button type="button" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" disabled={!overrideReason.trim()}>
          Apply Override
        </button>
      </div>
    </form>
  );
};

export default ConflictResolutionPanel;