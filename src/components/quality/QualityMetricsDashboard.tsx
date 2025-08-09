'use client';

import React, { useState, useEffect } from 'react';

import { buildPerformanceMonitor } from '@/services/BuildPerformanceMonitor';
import { errorTrackingSystem } from '@/services/ErrorTrackingSystem';

interface DashboardData {
  buildMetrics: {
    history: Array<{ timestamp: number; duration: number; success: boolean; errors: number }>;
    bottlenecks: Array<{ file: string; time: number; impact: string }>;
  };
  errorData: {
    summary: {
      topErrorCategories: Array<{ category: string; count: number }>;
    };
    qualityHistory: Array<{ timestamp: number; score: number }>;
    patterns: Array<{ pattern: string; count: number }>;
  };
  campaignProgress: Record<string, unknown>;
  qualityTrends: Record<string, unknown>;
}

interface MetricCard {
  title: string;
  value: string | number;
  trend: 'up' | 'down' | 'stable';
  trendValue: string;
  color: 'green' | 'red' | 'yellow' | 'blue';
  description: string;
}

interface QualityChart {
  type: 'line' | 'bar' | 'pie';
  title: string;
  data: Array<{
    timestamp?: number;
    value?: number;
    label?: string;
    count?: number;
    [key: string]: unknown;
  }>;
  xAxis?: string;
  yAxis?: string;
}

const QualityMetricsDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'1h' | '1d' | '1w' | '1m'>('1d');
  const [selectedView, setSelectedView] = useState<
    'overview' | 'performance' | 'errors' | 'campaigns'
  >('overview');

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);

        // Subscribe to real-time updates
        const buildUnsubscribe = buildPerformanceMonitor.subscribe(buildData => {
          setDashboardData(
            prev =>
              ({
                ...prev,
                buildMetrics: buildData,
              }) as DashboardData,
          );
        });

        const errorUnsubscribe = errorTrackingSystem.subscribe(errorData => {
          setDashboardData(
            prev =>
              ({
                ...prev,
                errorData: errorData,
              }) as DashboardData,
          );
        });

        // Load initial data
        const buildSummary = buildPerformanceMonitor.getPerformanceSummary();
        const errorSummary = errorTrackingSystem.getErrorSummary();
        const qualityMetrics = errorTrackingSystem.getCurrentQualityMetrics();

        setDashboardData({
          buildMetrics: {
            summary: buildSummary,
            history: buildPerformanceMonitor.getBuildHistory(20),
            bottlenecks: buildPerformanceMonitor.getBottlenecks(),
            regressions: buildPerformanceMonitor.getRegressions(),
          },
          errorData: {
            summary: errorSummary,
            activeErrors: errorTrackingSystem.getActiveErrors(),
            patterns: errorTrackingSystem.getErrorPatterns(),
            qualityHistory: errorTrackingSystem.getQualityHistory(50),
          },
          campaignProgress: {
            // This would integrate with campaign system
            activeCampaigns: [],
            completedCampaigns: [],
            successRate: 0,
          },
          qualityTrends: {
            codeQuality: qualityMetrics?.codeQualityScore || 0,
            technicalDebt: qualityMetrics?.technicalDebtScore || 0,
            maintainability: qualityMetrics?.maintainabilityIndex || 0,
          },
        });

        setLoading(false);

        // Cleanup subscriptions
        return () => {
          buildUnsubscribe();
          errorUnsubscribe();
        };
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
        setLoading(false);
      }
    };

    void loadDashboardData();
  }, [selectedTimeframe]);

  const getMetricCards = (): MetricCard[] => {
    if (!dashboardData) return [];

    const { buildMetrics, errorData, qualityTrends } = dashboardData;

    return [
      {
        title: 'Code Quality Score',
        value: qualityTrends.codeQuality,
        trend:
          (qualityTrends as Record<string, unknown>).codeQuality > 80
            ? 'up'
            : (qualityTrends as Record<string, unknown>).codeQuality > 60
              ? 'stable'
              : 'down',
        trendValue: `${qualityTrends.codeQuality}%`,
        color:
          (qualityTrends as Record<string, unknown>).codeQuality > 80
            ? 'green'
            : (qualityTrends as Record<string, unknown>).codeQuality > 60
              ? 'yellow'
              : 'red',
        description: 'Overall code quality based on errors and warnings',
      },
      {
        title: 'Build Performance',
        value: `${Math.round(buildMetrics.summary.averageBuildTime / 1000)}s`,
        trend:
          buildMetrics.summary.averageBuildTime < 30000
            ? 'up'
            : buildMetrics.summary.averageBuildTime < 60000
              ? 'stable'
              : 'down',
        trendValue: `${buildMetrics.summary.performanceScore}%`,
        color:
          buildMetrics.summary.performanceScore > 80
            ? 'green'
            : buildMetrics.summary.performanceScore > 60
              ? 'yellow'
              : 'red',
        description: 'Average build time and performance score',
      },
      {
        title: 'Active Errors',
        value: errorData.summary.totalActiveErrors,
        trend:
          errorData.summary.totalActiveErrors < 100
            ? 'up'
            : errorData.summary.totalActiveErrors < 500
              ? 'stable'
              : 'down',
        trendValue: `${errorData.summary.totalActiveErrors}`,
        color:
          errorData.summary.totalActiveErrors < 100
            ? 'green'
            : errorData.summary.totalActiveErrors < 500
              ? 'yellow'
              : 'red',
        description: 'Current TypeScript and linting errors',
      },
      {
        title: 'Technical Debt',
        value: qualityTrends.technicalDebt,
        trend:
          (qualityTrends as Record<string, unknown>).technicalDebt < 30
            ? 'up'
            : (qualityTrends as Record<string, unknown>).technicalDebt < 60
              ? 'stable'
              : 'down',
        trendValue: `${qualityTrends.technicalDebt}%`,
        color:
          (qualityTrends as Record<string, unknown>).technicalDebt < 30
            ? 'green'
            : (qualityTrends as Record<string, unknown>).technicalDebt < 60
              ? 'yellow'
              : 'red',
        description: 'Accumulated technical debt score',
      },
      {
        title: 'Maintainability',
        value: qualityTrends.maintainability,
        trend:
          (qualityTrends as Record<string, unknown>).maintainability > 80
            ? 'up'
            : (qualityTrends as Record<string, unknown>).maintainability > 60
              ? 'stable'
              : 'down',
        trendValue: `${qualityTrends.maintainability}%`,
        color:
          (qualityTrends as Record<string, unknown>).maintainability > 80
            ? 'green'
            : (qualityTrends as Record<string, unknown>).maintainability > 60
              ? 'yellow'
              : 'red',
        description: 'Code maintainability index',
      },
      {
        title: 'Cache Efficiency',
        value: `${buildMetrics.summary.cacheEfficiency}%`,
        trend:
          buildMetrics.summary.cacheEfficiency > 80
            ? 'up'
            : buildMetrics.summary.cacheEfficiency > 60
              ? 'stable'
              : 'down',
        trendValue: `${buildMetrics.summary.cacheEfficiency}%`,
        color:
          buildMetrics.summary.cacheEfficiency > 80
            ? 'green'
            : buildMetrics.summary.cacheEfficiency > 60
              ? 'yellow'
              : 'red',
        description: 'Build cache hit rate efficiency',
      },
    ];
  };

  const getQualityCharts = (): QualityChart[] => {
    if (!dashboardData) return [];

    const { buildMetrics, errorData } = dashboardData;

    return [
      {
        type: 'line',
        title: 'Build Performance Trend',
        data: buildMetrics.history.map(
          (
            build: { timestamp: number; duration: number; success: boolean; errors: number },
            index: number,
          ) => ({
            x: index,
            y: build.totalBuildTime / 1000,
            label: new Date(build.timestamp).toLocaleDateString(),
          }),
        ),
        xAxis: 'Build Number',
        yAxis: 'Build Time (seconds)',
      },
      {
        type: 'bar',
        title: 'Error Categories',
        data: errorData.summary.topErrorCategories.map(
          (cat: { category: string; count: number }) => ({
            x: cat.category,
            y: cat.count,
            label: cat.category,
          }),
        ),
        xAxis: 'Error Category',
        yAxis: 'Count',
      },
      {
        type: 'line',
        title: 'Quality Score History',
        data: errorData.qualityHistory.map(
          (quality: { timestamp: number; score: number }, index: number) => ({
            x: index,
            y: quality.codeQualityScore,
            label: new Date(quality.timestamp).toLocaleDateString(),
          }),
        ),
        xAxis: 'Time',
        yAxis: 'Quality Score',
      },
      {
        type: 'pie',
        title: 'Error Distribution',
        data: errorData.patterns.slice(0, 5).map((pattern: { pattern: string; count: number }) => ({
          label: pattern.pattern,
          value: pattern.frequency,
          color:
            pattern.priority === 'critical'
              ? '#ef4444'
              : pattern.priority === 'high'
                ? '#f97316'
                : pattern.priority === 'medium'
                  ? '#eab308'
                  : '#22c55e',
        })),
      },
    ];
  };

  const renderMetricCard = (metric: MetricCard, index: number) => (
    <div
      key={index}
      className='rounded-lg border-l-4 bg-white p-6 shadow-md'
      style={{
        borderLeftColor:
          metric.color === 'green'
            ? '#22c55e'
            : metric.color === 'red'
              ? '#ef4444'
              : metric.color === 'yellow'
                ? '#eab308'
                : '#3b82f6',
      }}
    >
      <div className='flex items-center justify-between'>
        <div>
          <p className='text-sm font-medium text-gray-600'>{metric.title}</p>
          <p className='text-2xl font-bold text-gray-900'>{metric.value}</p>
          <p className='mt-1 text-xs text-gray-500'>{metric.description}</p>
        </div>
        <div className='text-right'>
          <div
            className={`flex items-center ${
              metric.trend === 'up'
                ? 'text-green-600'
                : metric.trend === 'down'
                  ? 'text-red-600'
                  : 'text-gray-600'
            }`}
          >
            <span className='text-sm font-medium'>{metric.trendValue}</span>
            <span className='ml-1'>
              {metric.trend === 'up' ? '↗' : metric.trend === 'down' ? '↘' : '→'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderChart = (chart: QualityChart, index: number) => (
    <div key={index} className='rounded-lg bg-white p-6 shadow-md'>
      <h3 className='mb-4 text-lg font-semibold text-gray-900'>{chart.title}</h3>
      <div className='flex h-64 items-center justify-center'>
        {chart.type === 'line' && (
          <div className='relative h-full w-full'>
            <svg className='h-full w-full' viewBox='0 0 400 200'>
              {chart.data.map((point, i) => (
                <g key={i}>
                  <circle
                    cx={50 + (i * 300) / Math.max(chart.data.length - 1, 1)}
                    cy={
                      180 -
                      ((point as Record<string, unknown>).y * 150) /
                        Math.max(...chart.data.map(p => p.y))
                    }
                    r='3'
                    fill='#3b82f6'
                  />
                  {i < chart.data.length - 1 && (
                    <line
                      x1={50 + (i * 300) / Math.max(chart.data.length - 1, 1)}
                      y1={
                        180 -
                        ((point as Record<string, unknown>).y * 150) /
                          Math.max(...chart.data.map(p => p.y))
                      }
                      x2={50 + ((i + 1) * 300) / Math.max(chart.data.length - 1, 1)}
                      y2={
                        180 -
                        ((chart as Record<string, unknown>).data[i + 1].y * 150) /
                          Math.max(...(chart as Record<string, unknown>).data.map(p => p.y))
                      }
                      stroke='#3b82f6'
                      strokeWidth='2'
                    />
                  )}
                </g>
              ))}
            </svg>
            <div className='absolute bottom-0 left-0 text-xs text-gray-500'>{chart.xAxis}</div>
            <div className='absolute left-0 top-0 origin-left -rotate-90 transform text-xs text-gray-500'>
              {chart.yAxis}
            </div>
          </div>
        )}
        {chart.type === 'bar' && (
          <div className='flex h-full w-full items-end justify-around'>
            {chart.data.map((bar, i) => (
              <div key={i} className='flex flex-col items-center'>
                <div
                  className='mb-2 w-8 bg-blue-500'
                  style={{
                    height: `${((bar as Record<string, unknown>).y / Math.max(...chart.data.map(b => b.y))) * 150}px`,
                  }}
                ></div>
                <span className='origin-center -rotate-45 transform text-xs text-gray-600'>
                  {bar.label}
                </span>
              </div>
            ))}
          </div>
        )}
        {chart.type === 'pie' && (
          <div className='flex h-full w-full items-center justify-center'>
            <div className='text-center'>
              <div className='mb-2 text-sm text-gray-600'>Pie Chart</div>
              {chart.data.map((slice, i) => (
                <div key={i} className='mb-1 flex items-center justify-between'>
                  <div className='flex items-center'>
                    <div
                      className='mr-2 h-3 w-3 rounded'
                      style={{ backgroundColor: slice.color }}
                    ></div>
                    <span className='text-xs'>{slice.label}</span>
                  </div>
                  <span className='text-xs font-medium'>{slice.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderOverviewTab = () => (
    <div className='space-y-6'>
      <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
        {getMetricCards().map(renderMetricCard)}
      </div>
      <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
        {getQualityCharts().slice(0, 2).map(renderChart)}
      </div>
    </div>
  );

  const renderPerformanceTab = () => (
    <div className='space-y-6'>
      <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4'>
        {getMetricCards()
          .filter(m => m.title.includes('Performance') || m.title.includes('Cache'))
          .map(renderMetricCard)}
      </div>

      {dashboardData && (
        <div className='rounded-lg bg-white p-6 shadow-md'>
          <h3 className='mb-4 text-lg font-semibold text-gray-900'>Performance Bottlenecks</h3>
          <div className='overflow-x-auto'>
            <table className='min-w-full divide-y divide-gray-200'>
              <thead className='bg-gray-50'>
                <tr>
                  <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                    File
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                    Errors
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                    Complexity
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                    Dependencies
                  </th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-200 bg-white'>
                {dashboardData.buildMetrics.bottlenecks
                  .slice(0, 10)
                  .map(
                    (bottleneck: { file: string; time: number; impact: string }, index: number) => (
                      <tr key={index}>
                        <td className='whitespace-nowrap px-6 py-4 text-sm text-gray-900'>
                          {bottleneck.file.split('/').pop()}
                        </td>
                        <td className='whitespace-nowrap px-6 py-4 text-sm text-gray-900'>
                          {bottleneck.errorCount}
                        </td>
                        <td className='whitespace-nowrap px-6 py-4 text-sm text-gray-900'>
                          {bottleneck.complexity}
                        </td>
                        <td className='whitespace-nowrap px-6 py-4 text-sm text-gray-900'>
                          {bottleneck.dependencies.length}
                        </td>
                      </tr>
                    ),
                  )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );

  const renderErrorsTab = () => (
    <div className='space-y-6'>
      <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
        {getMetricCards()
          .filter(
            m =>
              m.title.includes('Error') || m.title.includes('Quality') || m.title.includes('Debt'),
          )
          .map(renderMetricCard)}
      </div>

      {dashboardData && (
        <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
          <div className='rounded-lg bg-white p-6 shadow-md'>
            <h3 className='mb-4 text-lg font-semibold text-gray-900'>Error Patterns</h3>
            <div className='space-y-3'>
              {dashboardData.errorData.patterns.slice(0, 10).map((pattern: any, index: number) => (
                <div
                  key={index}
                  className='flex items-center justify-between rounded bg-gray-50 p-3'
                >
                  <div>
                    <p className='text-sm font-medium text-gray-900'>{pattern.pattern}</p>
                    <p className='text-xs text-gray-500'>
                      {pattern.files.length} files affected •{' '}
                      {pattern.automatable ? 'Automatable' : 'Manual fix required'}
                    </p>
                  </div>
                  <div className='text-right'>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        pattern.priority === 'critical'
                          ? 'bg-red-100 text-red-800'
                          : pattern.priority === 'high'
                            ? 'bg-orange-100 text-orange-800'
                            : pattern.priority === 'medium'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {pattern.frequency}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className='rounded-lg bg-white p-6 shadow-md'>
            <h3 className='mb-4 text-lg font-semibold text-gray-900'>Automation Opportunities</h3>
            <div className='space-y-3'>
              {dashboardData.errorData.patterns
                .filter((p: any) => p.automatable)
                .slice(0, 5)
                .map((pattern: any, index: number) => (
                  <div key={index} className='rounded border-l-4 border-green-400 bg-green-50 p-3'>
                    <p className='text-sm font-medium text-green-900'>{pattern.pattern}</p>
                    <p className='mt-1 text-xs text-green-700'>{pattern.suggestedFix}</p>
                    <p className='mt-1 text-xs text-green-600'>
                      {pattern.frequency} occurrences across {pattern.files.length} files
                    </p>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderCampaignsTab = () => (
    <div className='space-y-6'>
      <div className='rounded-lg bg-white p-6 shadow-md'>
        <h3 className='mb-4 text-lg font-semibold text-gray-900'>Campaign Integration</h3>
        <p className='mb-4 text-gray-600'>
          Campaign system integration will be implemented in task 10. This section will show:
        </p>
        <ul className='list-inside list-disc space-y-1 text-sm text-gray-600'>
          <li>Active campaign status and progress</li>
          <li>Campaign success rates and metrics</li>
          <li>Automated fix recommendations</li>
          <li>Campaign scheduling and management</li>
        </ul>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className='flex h-64 items-center justify-center'>
        <div className='h-32 w-32 animate-spin rounded-full border-b-2 border-blue-500'></div>
      </div>
    );
  }

  return (
    <div className='mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold text-gray-900'>Quality Metrics Dashboard</h1>
        <p className='mt-2 text-gray-600'>
          Real-time monitoring of code quality, performance, and technical debt
        </p>
      </div>

      {/* Timeframe and View Selection */}
      <div className='mb-6 flex flex-wrap gap-4'>
        <div className='flex space-x-1 rounded-lg bg-gray-100 p-1'>
          {(['1h', '1d', '1w', '1m'] as const).map(timeframe => (
            <button
              key={timeframe}
              onClick={() => setSelectedTimeframe(timeframe)}
              className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
                selectedTimeframe === timeframe
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {timeframe}
            </button>
          ))}
        </div>

        <div className='flex space-x-1 rounded-lg bg-gray-100 p-1'>
          {(['overview', 'performance', 'errors', 'campaigns'] as const).map(view => (
            <button
              key={view}
              onClick={() => setSelectedView(view)}
              className={`rounded-md px-3 py-1 text-sm font-medium capitalize transition-colors ${
                selectedView === view
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {view}
            </button>
          ))}
        </div>
      </div>

      {/* Dashboard Content */}
      {selectedView === 'overview' && renderOverviewTab()}
      {selectedView === 'performance' && renderPerformanceTab()}
      {selectedView === 'errors' && renderErrorsTab()}
      {selectedView === 'campaigns' && renderCampaignsTab()}
    </div>
  );
};

export default QualityMetricsDashboard;
