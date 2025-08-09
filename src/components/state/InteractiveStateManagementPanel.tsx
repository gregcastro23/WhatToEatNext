import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';

interface StateEntry {
  id: string;
  name: string;
  value: unknown;
  type: string;
  timestamp: Date;
  source: string;
}

interface StateHistory {
  entries: StateEntry[];
  maxSize: number;
  currentIndex: number;
}

interface StatePerformanceMetrics {
  updateCount: number;
  averageUpdateTime: number;
  memoryUsage: number;
  renderCount: number;
  lastUpdateTimestamp: Date;
}

interface StateConfiguration {
  persistToLocalStorage: boolean;
  enablePerformanceMonitoring: boolean;
  maxHistorySize: number;
  autoExportEnabled: boolean;
  debugMode: boolean;
}

interface InteractiveStateManagementPanelProps {
  initialState?: Record<string, unknown>;
  onStateChange?: (newState: Record<string, unknown>) => void;
  enableExport?: boolean;
  enableImport?: boolean;
  className?: string;
}

const InteractiveStateManagementPanel: React.FC<InteractiveStateManagementPanelProps> = ({
  initialState = {},
  onStateChange,
  enableExport = true,
  enableImport = true,
  className = '',
}) => {
  // Core state management
  const [currentState, setCurrentState] = useState<Record<string, unknown>>(initialState);
  const [stateHistory, setStateHistory] = useState<StateHistory>({
    entries: [],
    maxSize: 100,
    currentIndex: -1,
  });
  const [performanceMetrics, setPerformanceMetrics] = useState<StatePerformanceMetrics>({
    updateCount: 0,
    averageUpdateTime: 0,
    memoryUsage: 0,
    renderCount: 0,
    lastUpdateTimestamp: new Date(),
  });
  const [configuration, setConfiguration] = useState<StateConfiguration>({
    persistToLocalStorage: false,
    enablePerformanceMonitoring: true,
    maxHistorySize: 100,
    autoExportEnabled: false,
    debugMode: false,
  });

  // UI state variables
  const [selectedStateKey, setSelectedStateKey] = useState<string>('');
  const [editingValue, setEditingValue] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const [viewMode, setViewMode] = useState<'tree' | 'table' | 'json'>('tree');
  const [showPerformancePanel, setShowPerformancePanel] = useState(false);
  const [showConfigurationPanel, setShowConfigurationPanel] = useState(false);
  const [showHistoryPanel, setShowHistoryPanel] = useState(false);
  const [exportFormat, setExportFormat] = useState<'json' | 'csv' | 'yaml'>('json');
  const [importData, setImportData] = useState('');
  const [showImportModal, setShowImportModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  // Performance tracking
  const performanceStartTime = useRef<number>(0);
  const renderCountRef = useRef(0);
  const updateTimesRef = useRef<number[]>([]);

  // State update handler with performance tracking
  const updateState = useCallback(
    (key: string, value: unknown, source: string = 'manual') => {
      const startTime = performance.now();
      performanceStartTime.current = startTime;

      setCurrentState(prevState => {
        const newState = { ...prevState, [key]: value };

        // Add to history
        const historyEntry: StateEntry = {
          id: `${key}-${Date.now()}`,
          name: key,
          value,
          type: typeof value,
          timestamp: new Date(),
          source,
        };

        setStateHistory(prevHistory => ({
          ...prevHistory,
          entries: [...prevHistory.entries.slice(-prevHistory.maxSize + 1), historyEntry],
          currentIndex: prevHistory.entries.length,
        }));

        // Update performance metrics
        const endTime = performance.now();
        const updateTime = endTime - startTime;
        updateTimesRef.current.push(updateTime);

        setPerformanceMetrics(prevMetrics => ({
          updateCount: prevMetrics.updateCount + 1,
          averageUpdateTime:
            updateTimesRef.current.reduce((a, b) => a + b, 0) / updateTimesRef.current.length,
          memoryUsage: (performance as any).memory ? (performance as any).memory.usedJSHeapSize : 0,
          renderCount: renderCountRef.current,
          lastUpdateTimestamp: new Date(),
        }));

        // Notify parent
        onStateChange?.(newState);

        // Persist if enabled
        if (configuration.persistToLocalStorage) {
          localStorage.setItem('stateManagementPanel', JSON.stringify(newState));
        }

        return newState;
      });
    },
    [onStateChange, configuration.persistToLocalStorage],
  );

  // Filtered state entries
  const filteredStateEntries = useMemo(() => {
    return Object.entries(currentState).filter(([key]) =>
      key.toLowerCase().includes(searchFilter.toLowerCase()),
    );
  }, [currentState, searchFilter]);

  // Export functionality
  const exportState = useCallback(() => {
    let exportContent = '';

    switch (exportFormat) {
      case 'json':
        exportContent = JSON.stringify(
          {
            state: currentState,
            history: stateHistory,
            metrics: performanceMetrics,
            configuration,
            exportTimestamp: new Date().toISOString(),
          },
          null,
          2,
        );
        break;
      case 'csv':
        const csvHeaders = 'Key,Value,Type,Timestamp\n';
        const csvRows = Object.entries(currentState)
          .map(
            ([key, value]) =>
              `${key},"${JSON.stringify(value)}",${typeof value},${new Date().toISOString()}`,
          )
          .join('\n');
        exportContent = csvHeaders + csvRows;
        break;
      case 'yaml':
        // Simple YAML conversion
        exportContent = Object.entries(currentState)
          .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
          .join('\n');
        break;
    }

    const blob = new Blob([exportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `state-export-${Date.now()}.${exportFormat}`;
    a.click();
    URL.revokeObjectURL(url);
  }, [currentState, stateHistory, performanceMetrics, configuration, exportFormat]);

  // Import functionality
  const importState = useCallback(() => {
    try {
      const parsed = JSON.parse(importData);
      if (parsed.state) {
        setCurrentState(parsed.state);
        if (parsed.configuration) {
          setConfiguration(parsed.configuration);
        }
        setShowImportModal(false);
        setImportData('');
      } else {
        // Assume direct state object
        setCurrentState(parsed);
        setShowImportModal(false);
        setImportData('');
      }
    } catch (error) {
      alert('Invalid JSON format. Please check your import data.');
    }
  }, [importData]);

  // Load from localStorage on mount
  useEffect(() => {
    if (configuration.persistToLocalStorage) {
      const saved = localStorage.getItem('stateManagementPanel');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setCurrentState(parsed);
        } catch (error) {
          console.warn('Failed to load saved state:', error);
        }
      }
    }
  }, [configuration.persistToLocalStorage]);

  // Track render count
  useEffect(() => {
    renderCountRef.current += 1;
    setPerformanceMetrics(prev => ({
      ...prev,
      renderCount: renderCountRef.current,
    }));
  });

  const handleStateValueEdit = (key: string) => {
    setSelectedStateKey(key);
    setEditingValue(JSON.stringify(currentState[key]));
    setIsEditing(true);
  };

  const saveStateEdit = () => {
    try {
      const parsedValue = JSON.parse(editingValue);
      updateState(selectedStateKey, parsedValue, 'manual-edit');
      setIsEditing(false);
      setSelectedStateKey('');
      setEditingValue('');
    } catch (error) {
      alert('Invalid JSON value. Please check your input.');
    }
  };

  const renderStateTree = () => (
    <div className='space-y-2'>
      {filteredStateEntries.map(([key, value]) => (
        <div key={key} className='rounded border bg-gray-50 p-3'>
          <div className='flex items-center justify-between'>
            <span className='font-medium text-gray-800'>{key}</span>
            <button
              onClick={() => handleStateValueEdit(key)}
              className='text-sm text-blue-600 hover:text-blue-800'
            >
              Edit
            </button>
          </div>
          <div className='mt-2 text-sm text-gray-600'>
            <span className='font-medium'>Type:</span> {typeof value} |{' '}
            <span className='font-medium'>Value:</span>{' '}
            <span className='rounded bg-gray-200 px-1 font-mono'>
              {JSON.stringify(value).slice(0, 50)}
              {JSON.stringify(value).length > 50 ? '...' : ''}
            </span>
          </div>
        </div>
      ))}
    </div>
  );

  const renderStateTable = () => (
    <div className='overflow-x-auto'>
      <table className='min-w-full divide-y divide-gray-200'>
        <thead className='bg-gray-50'>
          <tr>
            <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
              Key
            </th>
            <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
              Type
            </th>
            <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
              Value
            </th>
            <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
              Actions
            </th>
          </tr>
        </thead>
        <tbody className='divide-y divide-gray-200 bg-white'>
          {filteredStateEntries.map(([key, value]) => (
            <tr key={key}>
              <td className='whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900'>
                {key}
              </td>
              <td className='whitespace-nowrap px-6 py-4 text-sm text-gray-500'>{typeof value}</td>
              <td className='max-w-xs truncate whitespace-nowrap px-6 py-4 text-sm text-gray-500'>
                {JSON.stringify(value)}
              </td>
              <td className='whitespace-nowrap px-6 py-4 text-sm font-medium'>
                <button
                  onClick={() => handleStateValueEdit(key)}
                  className='text-blue-600 hover:text-blue-900'
                >
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderStateJSON = () => (
    <pre className='overflow-auto rounded-lg bg-gray-100 p-4 text-sm'>
      {JSON.stringify(currentState, null, 2)}
    </pre>
  );

  return (
    <div className={`rounded-lg bg-white p-6 shadow-lg ${className}`}>
      <div className='mb-6'>
        <h2 className='mb-2 text-2xl font-bold text-gray-800'>
          Interactive State Management Panel
        </h2>
        <p className='text-gray-600'>
          Real-time state visualization, manipulation, and debugging tools
        </p>
      </div>

      {/* Control Panel */}
      <div className='mb-6 flex flex-wrap gap-4'>
        <div className='flex items-center space-x-2'>
          <label className='text-sm font-medium'>Search:</label>
          <input
            type='text'
            value={searchFilter}
            onChange={e => setSearchFilter(e.target.value)}
            placeholder='Filter state keys...'
            className='rounded border px-2 py-1 text-sm'
          />
        </div>

        <div className='flex items-center space-x-2'>
          <label className='text-sm font-medium'>View:</label>
          <select
            value={viewMode}
            onChange={e => setViewMode(e.target.value as 'tree' | 'table' | 'json')}
            className='rounded border px-2 py-1 text-sm'
          >
            <option value='tree'>Tree View</option>
            <option value='table'>Table View</option>
            <option value='json'>JSON View</option>
          </select>
        </div>

        <button
          onClick={() => setShowPerformancePanel(!showPerformancePanel)}
          className='rounded bg-blue-500 px-3 py-1 text-sm text-white hover:bg-blue-600'
        >
          Performance
        </button>

        <button
          onClick={() => setShowHistoryPanel(!showHistoryPanel)}
          className='rounded bg-green-500 px-3 py-1 text-sm text-white hover:bg-green-600'
        >
          History
        </button>

        <button
          onClick={() => setShowConfigurationPanel(!showConfigurationPanel)}
          className='rounded bg-purple-500 px-3 py-1 text-sm text-white hover:bg-purple-600'
        >
          Config
        </button>

        {enableExport && (
          <button
            onClick={() => setShowExportModal(true)}
            className='rounded bg-orange-500 px-3 py-1 text-sm text-white hover:bg-orange-600'
          >
            Export
          </button>
        )}

        {enableImport && (
          <button
            onClick={() => setShowImportModal(true)}
            className='rounded bg-indigo-500 px-3 py-1 text-sm text-white hover:bg-indigo-600'
          >
            Import
          </button>
        )}
      </div>

      {/* Performance Panel */}
      {showPerformancePanel && (
        <div className='mb-6 rounded-lg bg-blue-50 p-4'>
          <h3 className='mb-3 font-bold text-blue-800'>Performance Metrics</h3>
          <div className='grid grid-cols-2 gap-4 text-sm md:grid-cols-4'>
            <div>
              <span className='font-medium'>Updates:</span> {performanceMetrics.updateCount}
            </div>
            <div>
              <span className='font-medium'>Avg Update Time:</span>{' '}
              {performanceMetrics.averageUpdateTime.toFixed(2)}ms
            </div>
            <div>
              <span className='font-medium'>Renders:</span> {performanceMetrics.renderCount}
            </div>
            <div>
              <span className='font-medium'>Memory:</span>{' '}
              {(performanceMetrics.memoryUsage / 1024 / 1024).toFixed(2)}MB
            </div>
          </div>
        </div>
      )}

      {/* History Panel */}
      {showHistoryPanel && (
        <div className='mb-6 rounded-lg bg-green-50 p-4'>
          <h3 className='mb-3 font-bold text-green-800'>State History</h3>
          <div className='max-h-64 overflow-y-auto'>
            {stateHistory.entries.slice(-10).map(entry => (
              <div key={entry.id} className='mb-2 border-b pb-2 text-sm'>
                <div className='font-medium'>{entry.name}</div>
                <div className='text-gray-600'>
                  {entry.timestamp.toLocaleTimeString()} - {entry.source}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Configuration Panel */}
      {showConfigurationPanel && (
        <div className='mb-6 rounded-lg bg-purple-50 p-4'>
          <h3 className='mb-3 font-bold text-purple-800'>Configuration</h3>
          <div className='space-y-2'>
            <label className='flex items-center'>
              <input
                type='checkbox'
                checked={configuration.persistToLocalStorage}
                onChange={e =>
                  setConfiguration(prev => ({
                    ...prev,
                    persistToLocalStorage: e.target.checked,
                  }))
                }
                className='mr-2'
              />
              Persist to Local Storage
            </label>
            <label className='flex items-center'>
              <input
                type='checkbox'
                checked={configuration.enablePerformanceMonitoring}
                onChange={e =>
                  setConfiguration(prev => ({
                    ...prev,
                    enablePerformanceMonitoring: e.target.checked,
                  }))
                }
                className='mr-2'
              />
              Enable Performance Monitoring
            </label>
            <label className='flex items-center'>
              <input
                type='checkbox'
                checked={configuration.debugMode}
                onChange={e =>
                  setConfiguration(prev => ({
                    ...prev,
                    debugMode: e.target.checked,
                  }))
                }
                className='mr-2'
              />
              Debug Mode
            </label>
          </div>
        </div>
      )}

      {/* Main State Display */}
      <div className='mb-6'>
        {viewMode === 'tree' && renderStateTree()}
        {viewMode === 'table' && renderStateTable()}
        {viewMode === 'json' && renderStateJSON()}
      </div>

      {/* Edit Modal */}
      {isEditing && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
          <div className='mx-4 w-full max-w-lg rounded-lg bg-white p-6'>
            <h3 className='mb-4 text-lg font-bold'>Edit State Value: {selectedStateKey}</h3>
            <textarea
              value={editingValue}
              onChange={e => setEditingValue(e.target.value)}
              rows={6}
              className='w-full rounded border p-2 font-mono text-sm'
              placeholder='Enter JSON value...'
            />
            <div className='mt-4 flex space-x-2'>
              <button
                onClick={saveStateEdit}
                className='rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600'
              >
                Save
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className='rounded bg-gray-500 px-4 py-2 text-white hover:bg-gray-600'
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
          <div className='mx-4 w-full max-w-lg rounded-lg bg-white p-6'>
            <h3 className='mb-4 text-lg font-bold'>Export State Data</h3>
            <div className='mb-4'>
              <label className='mb-2 block text-sm font-medium'>Export Format:</label>
              <select
                value={exportFormat}
                onChange={e => setExportFormat(e.target.value as 'json' | 'csv' | 'yaml')}
                className='w-full rounded border px-3 py-2'
              >
                <option value='json'>JSON</option>
                <option value='csv'>CSV</option>
                <option value='yaml'>YAML</option>
              </select>
            </div>
            <div className='flex space-x-2'>
              <button
                onClick={exportState}
                className='rounded bg-orange-500 px-4 py-2 text-white hover:bg-orange-600'
              >
                Export
              </button>
              <button
                onClick={() => setShowExportModal(false)}
                className='rounded bg-gray-500 px-4 py-2 text-white hover:bg-gray-600'
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
          <div className='mx-4 w-full max-w-lg rounded-lg bg-white p-6'>
            <h3 className='mb-4 text-lg font-bold'>Import State Data</h3>
            <textarea
              value={importData}
              onChange={e => setImportData(e.target.value)}
              rows={8}
              className='mb-4 w-full rounded border p-2 font-mono text-sm'
              placeholder='Paste JSON state data here...'
            />
            <div className='flex space-x-2'>
              <button
                onClick={importState}
                className='rounded bg-indigo-500 px-4 py-2 text-white hover:bg-indigo-600'
              >
                Import
              </button>
              <button
                onClick={() => setShowImportModal(false)}
                className='rounded bg-gray-500 px-4 py-2 text-white hover:bg-gray-600'
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New State Entry */}
      <div className='mt-6 border-t p-4'>
        <h3 className='mb-3 font-bold'>Add New State Entry</h3>
        <div className='flex space-x-2'>
          <input
            type='text'
            placeholder='State key'
            className='flex-1 rounded border px-2 py-1'
            onKeyDown={e => {
              if (e.key === 'Enter') {
                const key = e.currentTarget.value;
                const valueInput = e.currentTarget.nextElementSibling as HTMLInputElement;
                if (key && valueInput?.value) {
                  try {
                    const value = JSON.parse(valueInput.value);
                    updateState(key, value, 'manual-add');
                    e.currentTarget.value = '';
                    valueInput.value = '';
                  } catch {
                    updateState(key, valueInput.value, 'manual-add');
                    e.currentTarget.value = '';
                    valueInput.value = '';
                  }
                }
              }
            }}
          />
          <input
            type='text'
            placeholder='State value (JSON or string)'
            className='flex-1 rounded border px-2 py-1'
            onKeyDown={e => {
              if (e.key === 'Enter') {
                const valueInput = e.currentTarget;
                const keyInput = e.currentTarget.previousElementSibling as HTMLInputElement;
                const key = keyInput?.value;
                if (key && valueInput.value) {
                  try {
                    const value = JSON.parse(valueInput.value);
                    updateState(key, value, 'manual-add');
                    keyInput.value = '';
                    valueInput.value = '';
                  } catch {
                    updateState(key, valueInput.value, 'manual-add');
                    keyInput.value = '';
                    valueInput.value = '';
                  }
                }
              }
            }}
          />
        </div>
        <p className='mt-1 text-xs text-gray-500'>Press Enter in either field to add the entry</p>
      </div>
    </div>
  );
};

export default InteractiveStateManagementPanel;
