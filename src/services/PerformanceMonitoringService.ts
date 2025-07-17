'use client';

export interface ComponentMetrics {
  name: string;
  renderCount: number;
  totalRenderTime: number;
  averageRenderTime: number;
  lastRenderTime: number;
  errorCount: number;
  memoryUsage: number;
  lastUpdated: Date;
}

export interface SystemMetrics {
  totalMemoryUsage: number;
  peakMemoryUsage: number;
  totalErrors: number;
  activeComponents: number;
  systemUptime: number;
  lastUpdated: Date;
}

export interface PerformanceAlert {
  type: 'warning' | 'error' | 'info';
  component?: string;
  message: string;
  timestamp: Date;
  metric?: string;
  value?: number;
  threshold?: number;
}

class PerformanceMonitoringService {
  private componentMetrics: Map<string, ComponentMetrics> = new Map();
  private systemMetrics: SystemMetrics;
  private alerts: PerformanceAlert[] = [];
  private startTime: number = Date.now();
  private subscribers: Set<(data: any) => void> = new Set();

  // Performance thresholds
  private readonly RENDER_TIME_WARNING = 16; // 60fps threshold
  private readonly RENDER_TIME_ERROR = 33; // 30fps threshold
  private readonly MEMORY_WARNING = 50; // MB
  private readonly MEMORY_ERROR = 100; // MB
  private readonly ERROR_RATE_WARNING = 0.1; // 10% error rate

  constructor() {
    this.systemMetrics = {
      totalMemoryUsage: 0,
      peakMemoryUsage: 0,
      totalErrors: 0,
      activeComponents: 0,
      systemUptime: 0,
      lastUpdated: new Date()
    };

    this.startMonitoring();
  }

  private startMonitoring() {
    // Update system metrics every 5 seconds
    setInterval(() => {
      this.updateSystemMetrics();
      this.checkThresholds();
      this.notifySubscribers();
    }, 5000);
  }

  private updateSystemMetrics() {
    const now = Date.now();
    
    // Calculate memory usage
    let totalMemory = 0;
    if ('memory' in performance) {
      const memInfo = (performance as any).memory;
      totalMemory = memInfo.usedJSHeapSize / 1024 / 1024; // Convert to MB
    }

    // Update system metrics
    this.systemMetrics = {
      ...this.systemMetrics,
      totalMemoryUsage: totalMemory,
      peakMemoryUsage: Math.max(this.systemMetrics.peakMemoryUsage, totalMemory),
      activeComponents: this.componentMetrics.size,
      systemUptime: now - this.startTime,
      lastUpdated: new Date()
    };
  }

  private checkThresholds() {
    // Check component performance
    this.componentMetrics.forEach((metrics, componentName) => {
      // Check render time
      if (metrics.averageRenderTime > this.RENDER_TIME_ERROR) {
        this.addAlert({
          type: 'error',
          component: componentName,
          message: `Component ${componentName} has slow render time`,
          timestamp: new Date(),
          metric: 'renderTime',
          value: metrics.averageRenderTime,
          threshold: this.RENDER_TIME_ERROR
        });
      } else if (metrics.averageRenderTime > this.RENDER_TIME_WARNING) {
        this.addAlert({
          type: 'warning',
          component: componentName,
          message: `Component ${componentName} render time approaching threshold`,
          timestamp: new Date(),
          metric: 'renderTime',
          value: metrics.averageRenderTime,
          threshold: this.RENDER_TIME_WARNING
        });
      }

      // Check error rate
      const errorRate = metrics.errorCount / Math.max(metrics.renderCount, 1);
      if (errorRate > this.ERROR_RATE_WARNING) {
        this.addAlert({
          type: 'warning',
          component: componentName,
          message: `Component ${componentName} has high error rate`,
          timestamp: new Date(),
          metric: 'errorRate',
          value: errorRate,
          threshold: this.ERROR_RATE_WARNING
        });
      }
    });

    // Check system memory
    if (this.systemMetrics.totalMemoryUsage > this.MEMORY_ERROR) {
      this.addAlert({
        type: 'error',
        message: 'System memory usage is critically high',
        timestamp: new Date(),
        metric: 'memoryUsage',
        value: this.systemMetrics.totalMemoryUsage,
        threshold: this.MEMORY_ERROR
      });
    } else if (this.systemMetrics.totalMemoryUsage > this.MEMORY_WARNING) {
      this.addAlert({
        type: 'warning',
        message: 'System memory usage is elevated',
        timestamp: new Date(),
        metric: 'memoryUsage',
        value: this.systemMetrics.totalMemoryUsage,
        threshold: this.MEMORY_WARNING
      });
    }
  }

  private addAlert(alert: PerformanceAlert) {
    this.alerts.push(alert);
    
    // Keep only last 50 alerts
    if (this.alerts.length > 50) {
      this.alerts = this.alerts.slice(-50);
    }

    // Log critical alerts
    if (alert.type === 'error') {
      console.error('[Performance Monitor]', alert.message, alert);
    } else if (alert.type === 'warning') {
      console.warn('[Performance Monitor]', alert.message, alert);
    }
  }

  private notifySubscribers() {
    const data = {
      componentMetrics: Array.from(this.componentMetrics.entries()),
      systemMetrics: this.systemMetrics,
      alerts: this.alerts.slice(-10), // Last 10 alerts
      summary: this.getPerformanceSummary()
    };

    this.subscribers.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('[Performance Monitor] Subscriber error:', error);
      }
    });
  }

  // Public methods
  public trackComponentRender(componentName: string, renderTime: number) {
    const existing = this.componentMetrics.get(componentName);
    
    if (existing) {
      const newRenderCount = existing.renderCount + 1;
      const newTotalTime = existing.totalRenderTime + renderTime;
      
      this.componentMetrics.set(componentName, {
        ...existing,
        renderCount: newRenderCount,
        totalRenderTime: newTotalTime,
        averageRenderTime: newTotalTime / newRenderCount,
        lastRenderTime: renderTime,
        lastUpdated: new Date()
      });
    } else {
      this.componentMetrics.set(componentName, {
        name: componentName,
        renderCount: 1,
        totalRenderTime: renderTime,
        averageRenderTime: renderTime,
        lastRenderTime: renderTime,
        errorCount: 0,
        memoryUsage: 0,
        lastUpdated: new Date()
      });
    }
  }

  public trackComponentError(componentName: string, error: Error | string) {
    const existing = this.componentMetrics.get(componentName);
    
    if (existing) {
      this.componentMetrics.set(componentName, {
        ...existing,
        errorCount: existing.errorCount + 1,
        lastUpdated: new Date()
      });
    } else {
      this.componentMetrics.set(componentName, {
        name: componentName,
        renderCount: 0,
        totalRenderTime: 0,
        averageRenderTime: 0,
        lastRenderTime: 0,
        errorCount: 1,
        memoryUsage: 0,
        lastUpdated: new Date()
      });
    }

    this.systemMetrics.totalErrors += 1;
  }

  public subscribe(callback: (data: any) => void) {
    this.subscribers.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.subscribers.delete(callback);
    };
  }

  public getComponentMetrics(componentName?: string) {
    if (componentName) {
      return this.componentMetrics.get(componentName);
    }
    return Array.from(this.componentMetrics.entries());
  }

  public getSystemMetrics() {
    return this.systemMetrics;
  }

  public getAlerts(type?: 'warning' | 'error' | 'info') {
    if (type) {
      return this.alerts.filter(alert => alert.type === type);
    }
    return this.alerts;
  }

  public clearAlerts() {
    this.alerts = [];
  }

  public getPerformanceSummary() {
    const components = Array.from(this.componentMetrics.values());
    const slowComponents = components.filter(c => c.averageRenderTime > this.RENDER_TIME_WARNING);
    const errorProneComponents = components.filter(c => 
      (c.errorCount / Math.max(c.renderCount, 1)) > this.ERROR_RATE_WARNING
    );

    return {
      totalComponents: components.length,
      slowComponents: slowComponents.length,
      errorProneComponents: errorProneComponents.length,
      averageRenderTime: components.reduce((sum, c) => sum + c.averageRenderTime, 0) / Math.max(components.length, 1),
      totalErrors: this.systemMetrics.totalErrors,
      memoryUsage: this.systemMetrics.totalMemoryUsage,
      uptime: this.systemMetrics.systemUptime,
      healthScore: this.calculateHealthScore()
    };
  }

  private calculateHealthScore(): number {
    let score = 100;
    
    // Deduct for slow components
    const components = Array.from(this.componentMetrics.values());
    const slowComponents = components.filter(c => c.averageRenderTime > this.RENDER_TIME_WARNING);
    score -= (slowComponents.length / Math.max(components.length, 1)) * 30;
    
    // Deduct for errors
    const totalRenders = components.reduce((sum, c) => sum + c.renderCount, 0);
    const errorRate = this.systemMetrics.totalErrors / Math.max(totalRenders, 1);
    score -= errorRate * 40;
    
    // Deduct for memory usage
    if (this.systemMetrics.totalMemoryUsage > this.MEMORY_WARNING) {
      score -= 20;
    }
    
    return Math.max(0, Math.min(100, score));
  }

  public reset() {
    this.componentMetrics.clear();
    this.alerts = [];
    this.systemMetrics = {
      totalMemoryUsage: 0,
      peakMemoryUsage: 0,
      totalErrors: 0,
      activeComponents: 0,
      systemUptime: 0,
      lastUpdated: new Date()
    };
    this.startTime = Date.now();
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitoringService();
export default PerformanceMonitoringService;