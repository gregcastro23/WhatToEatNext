/**
 * Campaign Scheduler Component
 * 
 * Provides interface for scheduling campaign executions, managing recurring
 * campaigns, and viewing scheduled campaign history within Kiro.
 */

import React, { useState, useEffect } from 'react';

import { useCampaignMonitoring } from '../../hooks/useCampaignMonitoring';
import type {
  CampaignSchedule,
  CampaignPhase
} from '../../services/KiroCampaignIntegration';

interface CampaignSchedulerProps {
  className?: string;
  onScheduleCreated?: (scheduleId: string) => void;
  onScheduleUpdated?: (scheduleId: string) => void;
  onScheduleDeleted?: (scheduleId: string) => void;
}

export const CampaignScheduler: React.FC<CampaignSchedulerProps> = ({
  className = '',
  onScheduleCreated,
  onScheduleUpdated,
  onScheduleDeleted
}) => {
  const { state, actions } = useCampaignMonitoring({ autoRefresh: false });
  const [scheduledCampaigns, setScheduledCampaigns] = useState<CampaignSchedule[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<CampaignSchedule | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    phases: [] as string[],
    scheduledTime: '',
    recurrence: '' as '' | 'daily' | 'weekly' | 'monthly',
    enabled: true
  });

  // Load scheduled campaigns
  useEffect(() => {
    const loadScheduledCampaigns = () => {
      const campaigns = actions.getScheduledCampaigns();
      setScheduledCampaigns(campaigns);
    };

    loadScheduledCampaigns();
    
    // Refresh every minute to update next run times
    const interval = setInterval(loadScheduledCampaigns, 60000);
    return () => clearInterval(interval);
  }, [actions]);

  const handleCreateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const schedule: Omit<CampaignSchedule, 'id'> = {
        name: formData.name,
        phases: formData.phases,
        scheduledTime: new Date(formData.scheduledTime),
        recurrence: formData.recurrence || undefined,
        enabled: formData.enabled
      };

      const scheduleId = await actions.scheduleCampaign(schedule);
      
      // Refresh scheduled campaigns list
      const campaigns = actions.getScheduledCampaigns();
      setScheduledCampaigns(campaigns);
      
      // Reset form
      setFormData({
        name: '',
        phases: [],
        scheduledTime: '',
        recurrence: '',
        enabled: true
      });
      setShowCreateForm(false);
      
      onScheduleCreated?.(scheduleId);
    } catch (error) {
      console.error('Failed to create schedule:', error);
    }
  };

  const handleUpdateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingSchedule) return;

    try {
      const updates = {
        name: formData.name,
        phases: formData.phases,
        scheduledTime: new Date(formData.scheduledTime),
        recurrence: formData.recurrence || undefined,
        enabled: formData.enabled
      };

      await actions.scheduleCampaign({ ...updates }); // This would need an update method
      
      // Refresh scheduled campaigns list
      const campaigns = actions.getScheduledCampaigns();
      setScheduledCampaigns(campaigns);
      
      setEditingSchedule(null);
      setFormData({
        name: '',
        phases: [],
        scheduledTime: '',
        recurrence: '',
        enabled: true
      });
      
      onScheduleUpdated?.(editingSchedule.id);
    } catch (error) {
      console.error('Failed to update schedule:', error);
    }
  };

  const handleDeleteSchedule = async (scheduleId: string) => {
    if (!confirm('Are you sure you want to delete this scheduled campaign?')) {
      return;
    }

    try {
      // This would need a delete method in the integration service
      // await actions.deleteScheduledCampaign(scheduleId);
      
      // For now, just refresh the list
      const campaigns = actions.getScheduledCampaigns();
      setScheduledCampaigns(campaigns.filter(c => c.id !== scheduleId));
      
      onScheduleDeleted?.(scheduleId);
    } catch (error) {
      console.error('Failed to delete schedule:', error);
    }
  };

  const handleEditSchedule = (schedule: CampaignSchedule) => {
    setEditingSchedule(schedule);
    setFormData({
      name: schedule.name,
      phases: schedule.phases,
      scheduledTime: schedule.scheduledTime.toISOString().slice(0, 16),
      recurrence: schedule.recurrence || '',
      enabled: schedule.enabled
    });
    setShowCreateForm(true);
  };

  const handleCancelEdit = () => {
    setEditingSchedule(null);
    setShowCreateForm(false);
    setFormData({
      name: '',
      phases: [],
      scheduledTime: '',
      recurrence: '',
      enabled: true
    });
  };

  const getNextRunDisplay = (schedule: CampaignSchedule): string => {
    if (!schedule.nextRun) return 'Not scheduled';
    
    const now = new Date();
    const nextRun = new Date(schedule.nextRun);
    const diffMs = nextRun.getTime() - now.getTime();
    
    if (diffMs < 0) return 'Overdue';
    
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) {
      return `In ${diffDays} day${diffDays > 1 ? 's' : ''}`;
    } else if (diffHours > 0) {
      return `In ${diffHours} hour${diffHours > 1 ? 's' : ''}`;
    } else {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return `In ${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`;
    }
  };

  return (
    <div className={`campaign-scheduler ${className}`}>
      {/* Header */}
      <div className="scheduler-header">
        <h2>Campaign Scheduler</h2>
        <button
          className="create-schedule-btn"
          onClick={() => setShowCreateForm(true)}
        >
          Schedule New Campaign
        </button>
      </div>

      {/* Create/Edit Form */}
      {showCreateForm && (
        <div className="schedule-form-overlay">
          <div className="schedule-form-modal">
            <div className="form-header">
              <h3>{editingSchedule ? 'Edit Schedule&apos; : 'Create New Schedule&apos;}</h3>
              <button className="close-btn" onClick={handleCancelEdit}>×</button>
            </div>
            
            <form onSubmit={editingSchedule ? handleUpdateSchedule : handleCreateSchedule}>
              <div className="form-group">
                <label htmlFor="scheduleName">Schedule Name</label>
                <input
                  id="scheduleName"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Daily TypeScript Cleanup&quot;
                  required
                />
              </div>

              <div className="form-group">
                <label>Campaign Phases</label>
                <div className="phases-selection">
                  {state.controlPanel?.availablePhases.map(phase => (
                    <label key={phase.id} className="phase-checkbox">
                      <input
                        type="checkbox"
                        checked={formData.phases.includes(phase.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({
                              ...formData,
                              phases: [...formData.phases, phase.id]
                            });
                          } else {
                            setFormData({
                              ...formData,
                              phases: formData.phases.filter(id => id !== phase.id)
                            });
                          }
                        }}
                      />
                      <span className="phase-name">{phase.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="scheduledTime">Scheduled Time</label>
                <input
                  id="scheduledTime"
                  type="datetime-local"
                  value={formData.scheduledTime}
                  onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="recurrence">Recurrence</label>
                <select
                  id="recurrence"
                  value={formData.recurrence}
                  onChange={(e) => setFormData({ ...formData, recurrence: e.target.value as any })}
                >
                  <option value="">One-time</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.enabled}
                    onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                  />
                  <span>Enabled</span>
                </label>
              </div>

              <div className="form-actions">
                <button type="button" onClick={handleCancelEdit}>
                  Cancel
                </button>
                <button type="submit" disabled={formData.phases.length === 0}>
                  {editingSchedule ? 'Update Schedule&apos; : 'Create Schedule&apos;}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Scheduled Campaigns List */}
      <div className="scheduled-campaigns">
        <h3>Scheduled Campaigns ({scheduledCampaigns.length})</h3>
        
        {scheduledCampaigns.length === 0 ? (
          <div className="no-schedules">
            <p>No scheduled campaigns</p>
            <p>Create a schedule to automate campaign execution</p>
          </div>
        ) : (
          <div className="schedules-list">
            {scheduledCampaigns.map(schedule => (
              <ScheduleCard
                key={schedule.id}
                schedule={schedule}
                nextRunDisplay={getNextRunDisplay(schedule)}
                onEdit={() => handleEditSchedule(schedule)}
                onDelete={() => handleDeleteSchedule(schedule.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Schedule Card Component
const ScheduleCard: React.FC<{
  schedule: CampaignSchedule;
  nextRunDisplay: string;
  onEdit: () => void;
  onDelete: () => void;
}> = ({ schedule, nextRunDisplay, onEdit, onDelete }) => {
  return (
    <div className={`schedule-card ${!schedule.enabled ? 'disabled' : ''}`}>
      <div className="schedule-header">
        <h4>{schedule.name}</h4>
        <div className="schedule-status">
          <span className={`status-badge ${schedule.enabled ? 'enabled' : 'disabled'}`}>
            {schedule.enabled ? 'Enabled&apos; : 'Disabled&apos;}
          </span>
        </div>
      </div>

      <div className="schedule-details">
        <div className="detail-row">
          <span className="detail-label">Phases:</span>
          <span className="detail-value">{schedule.phases.join(', ')}</span>
        </div>
        
        <div className="detail-row">
          <span className="detail-label">Next Run:</span>
          <span className="detail-value">{nextRunDisplay}</span>
        </div>
        
        {schedule.recurrence && (
          <div className="detail-row">
            <span className="detail-label">Recurrence:</span>
            <span className="detail-value">{schedule.recurrence}</span>
          </div>
        )}
        
        {schedule.lastRun && (
          <div className="detail-row">
            <span className="detail-label">Last Run:</span>
            <span className="detail-value">
              {new Date(schedule.lastRun).toLocaleString()}
            </span>
          </div>
        )}
      </div>

      <div className="schedule-actions">
        <button className="edit-btn" onClick={onEdit}>
          Edit
        </button>
        <button className="delete-btn" onClick={onDelete}>
          Delete
        </button>
      </div>
    </div>
  );
};

export default CampaignScheduler;