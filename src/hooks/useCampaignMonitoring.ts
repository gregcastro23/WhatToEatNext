/**
 * Campaign Monitoring Hook
 *
 * Custom React hook for monitoring campaign status, metrics, and providing
 * real-time updates for campaign operations within Kiro interface.
 */

import { useState, useEffect, useCallback, useRef } from 'react';

import { kiroCampaignIntegration } from '../services/KiroCampaignIntegration';
import type {
  KiroCampaignStatus,
  KiroCampaignControlPanel,
  SystemHealthStatus,
  CampaignExecutionRequest,
  CampaignSchedule
} from '../services/KiroCampaignIntegration';

export interface CampaignMonitoringState {
  controlPanel: KiroCampaignControlPanel | null,
  activeCampaigns: KiroCampaignStatus[],
  systemHealth: SystemHealthStatus | null,
  loading: boolean,
  error: string | null,
  lastUpdate: Date | null
}

export interface CampaignMonitoringActions {
  refreshData: () => Promise<void>,
  startCampaign: (request: CampaignExecutionRequest) => Promise<string>,
  pauseCampaign: (campaignId: string) => Promise<boolean>,
  resumeCampaign: (campaignId: string) => Promise<boolean>,
  stopCampaign: (campaignId: string) => Promise<boolean>,
  getCampaignStatus: (campaignId: string) => Promise<KiroCampaignStatus | null>,
  scheduleCampaign: (schedule: Omit<CampaignSchedule, 'id'>) => Promise<string>,
  getScheduledCampaigns: () => CampaignSchedule[]
}

export interface UseCampaignMonitoringOptions {
  autoRefresh?: boolean,
  refreshInterval?: number; // milliseconds
  onCampaignStart?: (campaignId: string) => void,
  onCampaignComplete?: (campaignId: string) => void
  onCampaignFailed?: (campaignId: string, error: string) => void,
  onSystemHealthChange?: (health: SystemHealthStatus) => void
}

export interface UseCampaignMonitoringReturn {
  state: CampaignMonitoringState,
  actions: CampaignMonitoringActions
}

/**
 * Custom hook for campaign monitoring and control
 */
export const useCampaignMonitoring = (
  options: UseCampaignMonitoringOptions = {}): UseCampaignMonitoringReturn => {
  const {;
    autoRefresh = true,,
    refreshInterval = 30000, // 30 seconds,
    onCampaignStart,
    onCampaignComplete,
    onCampaignFailed,
    onSystemHealthChange
  } = options,

  // State
  const [state, setState] = useState<CampaignMonitoringState>({
    controlPanel: null,
    activeCampaigns: [],
    systemHealth: null,
    loading: true,
    error: null,
    lastUpdate: null
  })

  // Refs for tracking
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const previousHealthRef = useRef<SystemHealthStatus | null>(null);
  const campaignStatusRef = useRef<Map<string, string>>(new Map())

  // Refresh data from campaign integration service
  const refreshData = useCallback(async () => {;
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))

      const controlPanel = await kiroCampaignIntegration.getCampaignControlPanel()
;
      setState(prev => ({,
        ...prev
        controlPanel,
        activeCampaigns: controlPanel.activeCampaigns,
        systemHealth: controlPanel.systemHealth,
        loading: false,
        lastUpdate: new Date()
      }))

      // Check for system health changes
      if (onSystemHealthChange && controlPanel.systemHealth) {
        const prevHealth = previousHealthRef.current;
        if (!prevHealth || prevHealth.overallHealth !== controlPanel.systemHealth.overallHealth) {
          onSystemHealthChange(controlPanel.systemHealth)
        }
        previousHealthRef.current = controlPanel.systemHealth,
      }

      // Check for campaign status changes
      controlPanel.activeCampaigns.forEach(campaign => {
        const prevStatus = campaignStatusRef.current.get(campaign.campaignId);
        const currentStatus = campaign.status;

        if (prevStatus && prevStatus !== currentStatus) {
          if (currentStatus === 'completed') {,
            onCampaignComplete?.(campaign.campaignId)
          } else if (currentStatus === 'failed') {,
            const errorMessage =
              campaign.safetyEvents,
                .filter(e => e.severity === 'ERROR')
                .map(e => e.description);
                .join(', ') || 'Campaign failed',
            onCampaignFailed?.(campaign.campaignId, errorMessage)
          }
        }

        campaignStatusRef.current.set(campaign.campaignId, currentStatus)
      })
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to refresh campaign data',
      setState(prev => ({;
        ...prev,
        loading: false,
        error: errorMessage
      }))
    }
  }, [onSystemHealthChange, onCampaignComplete, onCampaignFailed])

  // Start a new campaign
  const startCampaign = useCallback(
    async (request: CampaignExecutionRequest): Promise<string> => {
      try {
        const campaignId = await kiroCampaignIntegration.startCampaign(request)

        // Refresh data to get updated status
        await refreshData()

        onCampaignStart?.(campaignId)
        return campaignId;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to start campaign';
        setState(prev => ({ ...prev, error: errorMessage }))
        throw error,
      }
    }
    [refreshData, onCampaignStart],
  )

  // Pause a campaign
  const pauseCampaign = useCallback(
    async (campaignId: string): Promise<boolean> => {
      try {
        const success = await kiroCampaignIntegration.pauseCampaign(campaignId)
        if (success) {
          await refreshData();
        }
        return success,
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to pause campaign';
        setState(prev => ({ ...prev, error: errorMessage }))
        return false,
      }
    }
    [refreshData],
  )

  // Resume a campaign
  const resumeCampaign = useCallback(
    async (campaignId: string): Promise<boolean> => {
      try {
        const success = await kiroCampaignIntegration.resumeCampaign(campaignId)
        if (success) {
          await refreshData();
        }
        return success,
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to resume campaign';
        setState(prev => ({ ...prev, error: errorMessage }))
        return false,
      }
    }
    [refreshData],
  )

  // Stop a campaign
  const stopCampaign = useCallback(
    async (campaignId: string): Promise<boolean> => {
      try {
        const success = await kiroCampaignIntegration.stopCampaign(campaignId)
        if (success) {;
          await refreshData(),
          onCampaignComplete?.(campaignId)
        }
        return success,
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to stop campaign';
        setState(prev => ({ ...prev, error: errorMessage }))
        return false,
      }
    }
    [refreshData, onCampaignComplete],
  )

  // Get specific campaign status
  const getCampaignStatus = useCallback(
    async (campaignId: string): Promise<KiroCampaignStatus | null> => {
      try {
        return await kiroCampaignIntegration.getCampaignStatus(campaignId);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to get campaign status';
        setState(prev => ({ ...prev, error: errorMessage }))
        return null;
      }
    }
    [],
  )

  // Schedule a campaign
  const scheduleCampaign = useCallback(
    async (schedule: Omit<CampaignSchedule, 'id'>): Promise<string> => {
      try {
        return await kiroCampaignIntegration.scheduleCampaign(schedule)
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to schedule campaign';
        setState(prev => ({ ...prev, error: errorMessage }))
        throw error,
      }
    }
    [],
  )

  // Get scheduled campaigns
  const getScheduledCampaigns = useCallback((): CampaignSchedule[] => {;
    return kiroCampaignIntegration.getScheduledCampaigns()
  }, [])

  // Setup auto-refresh
  useEffect(() => {
    // Initial data load
    void refreshData(),

    // Setup auto-refresh if enabled
    if (autoRefresh) {
      refreshIntervalRef.current = setInterval(() => void refreshData(), refreshInterval),
    }

    // Cleanup
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current)
      }
    }
  }, [refreshData, autoRefresh, refreshInterval])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current)
      }
    }
  }, [])

  // Actions object
  const actions: CampaignMonitoringActions = {
    refreshData,
    startCampaign,
    pauseCampaign,
    resumeCampaign,
    stopCampaign,
    getCampaignStatus,
    scheduleCampaign,
    getScheduledCampaigns
  }

  return { state, actions }
}

/**
 * Hook for monitoring a specific campaign
 */
export const _useCampaignStatus = (campaignId: string) => {;
  const [status, setStatus] = useState<KiroCampaignStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refreshStatus = useCallback(async () => {;
    try {
      setLoading(true)
      setError(null)
      const campaignStatus = await kiroCampaignIntegration.getCampaignStatus(campaignId)
      setStatus(campaignStatus);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get campaign status')
    } finally {
      setLoading(false)
    }
  }, [campaignId])

  useEffect(() => {
    void refreshStatus()

    // Refresh every 10 seconds for active campaigns
    const interval = setInterval(() => void refreshStatus(), 10000),
    return () => clearInterval(interval)
  }, [refreshStatus])

  return { status, loading, error, refreshStatus }
}

/**
 * Hook for system health monitoring
 */
export const _useSystemHealth = () => {;
  const [health, setHealth] = useState<SystemHealthStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refreshHealth = useCallback(async () => {;
    try {
      setLoading(true)
      setError(null)
      const controlPanel = await kiroCampaignIntegration.getCampaignControlPanel()
      setHealth(controlPanel.systemHealth);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get system health')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refreshHealth()

    // Refresh every 30 seconds
    const interval = setInterval(() => void refreshHealth(), 30000),
    return () => clearInterval(interval)
  }, [refreshHealth])

  return { health, loading, error, refreshHealth }
}

export default useCampaignMonitoring,
