'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Info,
  AlertCircle,
  CheckCircle,
  HelpCircle,
  Bell,
  Settings,
  Eye,
  EyeOff,
  Maximize2,
  Minimize2,
  Move,
  Filter,
  Search,
  Plus,
  Minus,
  RotateCcw,
  Save,
  Share,
  Download,
  Upload,
  Edit,
  Trash2,
  Star,
  Heart,
  MessageCircle,
  ThumbsUp,
  Bookmark,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

// Interfaces for different UI enhancement state variables
interface ModalState {
  isOpen: boolean;
  type: 'info' | 'warning' | 'error' | 'success' | 'custom';
  title: string;
  content: React.ReactNode;
  size: 'sm' | 'md' | 'lg' | 'xl';
  closable: boolean;
  overlay: boolean;
}

interface TooltipState {
  isVisible: boolean;
  content: string;
  position: { x: number; y: number };
  placement: 'top' | 'bottom' | 'left' | 'right';
  targetElement: string | null;
}

interface NotificationState {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  duration: number;
  actions?: Array<{
    label: string;
    action: () => void;
    style: 'primary' | 'secondary';
  }>;
}

interface PanelState {
  isCollapsed: boolean;
  isDragging: boolean;
  position: { x: number; y: number };
  size: { width: number; height: number };
  zIndex: number;
  isMinimized: boolean;
  isMaximized: boolean;
}

interface FilterState {
  activeFilters: string[];
  searchTerm: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  groupBy: string | null;
  showAdvanced: boolean;
}

interface InteractionState {
  selectedItems: string[];
  hoveredItem: string | null;
  focusedElement: string | null;
  draggedItem: string | null;
  dropZone: string | null;
  isMultiSelect: boolean;
}

export interface UIEnhancementSystemProps {
  onStateChange?: (state: any) => void;
  enableNotifications?: boolean;
  enableModals?: boolean;
  enableTooltips?: boolean;
  enableAdvancedPanels?: boolean;
  className?: string;
}

export default function UIEnhancementSystem({
  onStateChange,
  enableNotifications = true,
  enableModals = true,
  enableTooltips = true,
  enableAdvancedPanels = true,
  className = ''
}: UIEnhancementSystemProps) {
  
  // Modal System State Variables (activates unused modal state)
  const [modalStates, setModalStates] = useState<ModalState[]>([]);
  const [activeModal, setActiveModal] = useState<ModalState | null>(null);
  const [modalStack, setModalStack] = useState<string[]>([]);
  
  // Tooltip System State Variables (activates unused tooltip state)
  const [tooltipState, setTooltipState] = useState<TooltipState>({
    isVisible: false,
    content: '',
    position: { x: 0, y: 0 },
    placement: 'top',
    targetElement: null
  });
  
  // Notification System State Variables (activates unused notification state)
  const [notifications, setNotifications] = useState<NotificationState[]>([]);
  const [notificationQueue, setNotificationQueue] = useState<NotificationState[]>([]);
  const [maxNotifications, setMaxNotifications] = useState(5);
  
  // Panel Management State Variables (activates unused panel state)
  const [panelStates, setPanelStates] = useState<Record<string, PanelState>>({});
  const [activePanels, setActivePanels] = useState<string[]>([]);
  const [panelLayout, setPanelLayout] = useState<'grid' | 'stack' | 'cascade'>('grid');
  
  // Filter and Search State Variables (activates unused filter state)
  const [filterState, setFilterState] = useState<FilterState>({
    activeFilters: [],
    searchTerm: '',
    sortBy: 'name',
    sortOrder: 'asc',
    groupBy: null,
    showAdvanced: false
  });
  
  // Interaction State Variables (activates unused interaction state)
  const [interactionState, setInteractionState] = useState<InteractionState>({
    selectedItems: [],
    hoveredItem: null,
    focusedElement: null,
    draggedItem: null,
    dropZone: null,
    isMultiSelect: false
  });

  // UI Enhancement Control State Variables
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [animationsEnabled, setAnimationsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [accessibilityMode, setAccessibilityMode] = useState(false);
  const [debugMode, setDebugMode] = useState(false);
  const [performanceMode, setPerformanceMode] = useState(false);

  // Component Control State Variables
  const [componentVisibility, setComponentVisibility] = useState({
    modals: true,
    tooltips: true,
    notifications: true,
    panels: true,
    filters: true,
    interactions: true
  });

  // Refs for element tracking
  const tooltipRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Notify parent of state changes
  useEffect(() => {
    if (onStateChange) {
      onStateChange({
        modals: { modalStates, activeModal, modalStack },
        tooltip: tooltipState,
        notifications: { notifications, notificationQueue },
        panels: { panelStates, activePanels, panelLayout },
        filters: filterState,
        interactions: interactionState,
        ui: { isDarkMode, animationsEnabled, soundEnabled, accessibilityMode, debugMode, performanceMode },
        visibility: componentVisibility
      });
    }
  }, [
    modalStates, activeModal, modalStack,
    tooltipState,
    notifications, notificationQueue,
    panelStates, activePanels, panelLayout,
    filterState,
    interactionState,
    isDarkMode, animationsEnabled, soundEnabled, accessibilityMode, debugMode, performanceMode,
    componentVisibility,
    onStateChange
  ]);

  // Modal Management Functions
  const openModal = (config: Partial<ModalState> & { title: string; content: React.ReactNode }) => {
    if (!enableModals) return;
    
    const modal: ModalState = {
      isOpen: true,
      type: 'info',
      size: 'md',
      closable: true,
      overlay: true,
      ...config
    };
    
    setActiveModal(modal);
    setModalStack(prev => [...prev, modal.title]);
  };

  const closeModal = () => {
    setActiveModal(null);
    setModalStack(prev => prev.slice(0, -1));
  };

  // Tooltip Management Functions
  const _showTooltip = (content: string, element: HTMLElement, placement: TooltipState['placement'] = 'top') => {
    if (!enableTooltips) return;
    
    const rect = element.getBoundingClientRect();
    const position = calculateTooltipPosition(rect, placement);
    
    setTooltipState({
      isVisible: true,
      content,
      position,
      placement,
      targetElement: element.id || element.className
    });
  };

  const _hideTooltip = () => {
    setTooltipState(prev => ({ ...prev, isVisible: false }));
  };

  const _calculateTooltipPosition = (rect: DOMRect, placement: TooltipState['placement']) => {
    switch (placement) {
      case 'top':
        return { x: rect.left + rect.width / 2, y: rect.top };
      case 'bottom':
        return { x: rect.left + rect.width / 2, y: rect.bottom };
      case 'left':
        return { x: rect.left, y: rect.top + rect.height / 2 };
      case 'right':
        return { x: rect.right, y: rect.top + rect.height / 2 };
      default:
        return { x: rect.left + rect.width / 2, y: rect.top };
    }
  };

  // Notification Management Functions
  const addNotification = (notification: Omit<NotificationState, 'id'>) => {
    if (!enableNotifications) return;
    
    const id = Math.random().toString(36).substr(2, 9);
    const newNotification = { ...notification, id };
    
    setNotifications(prev => {
      const updated = [...prev, newNotification];
      if (updated.length > maxNotifications) {
        return updated.slice(-maxNotifications);
      }
      return updated;
    });

    // Auto-remove notification after duration
    if (notification.duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, notification.duration);
    }
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Panel Management Functions
  const createPanel = (id: string, initialState?: Partial<PanelState>) => {
    const defaultState: PanelState = {
      isCollapsed: false,
      isDragging: false,
      position: { x: Math.random() * 200, y: Math.random() * 200 },
      size: { width: 300, height: 200 },
      zIndex: 100 + Object.keys(panelStates).length,
      isMinimized: false,
      isMaximized: false,
      ...initialState
    };
    
    setPanelStates(prev => ({ ...prev, [id]: defaultState }));
    setActivePanels(prev => [...prev, id]);
  };

  const _updatePanelState = (id: string, updates: Partial<PanelState>) => {
    setPanelStates(prev => ({
      ...prev,
      [id]: { ...prev[id], ...updates }
    }));
  };

  const _removePanel = (id: string) => {
    setPanelStates(prev => {
      const { [id]: removed, ...rest } = prev;
      return rest;
    });
    setActivePanels(prev => prev.filter(p => p !== id));
  };

  // Filter Management Functions
  const updateFilter = (key: keyof FilterState, value: any) => {
    setFilterState(prev => ({ ...prev, [key]: value }));
  };

  const _addFilter = (filter: string) => {
    setFilterState(prev => ({
      ...prev,
      activeFilters: [...prev.activeFilters, filter]
    }));
  };

  const removeFilter = (filter: string) => {
    setFilterState(prev => ({
      ...prev,
      activeFilters: prev.activeFilters.filter(f => f !== filter)
    }));
  };

  const clearFilters = () => {
    setFilterState(prev => ({
      ...prev,
      activeFilters: [],
      searchTerm: ''
    }));
  };

  // Interaction Management Functions
  const _selectItem = (id: string, multiSelect = false) => {
    setInteractionState(prev => {
      if (multiSelect || prev.isMultiSelect) {
        const newSelected = prev.selectedItems.includes(id)
          ? prev.selectedItems.filter(item => item !== id)
          : [...prev.selectedItems, id];
        return { ...prev, selectedItems: newSelected };
      } else {
        return { ...prev, selectedItems: [id] };
      }
    });
  };

  const _clearSelection = () => {
    setInteractionState(prev => ({ ...prev, selectedItems: [] }));
  };

  // Demo/Test Functions
  const runModalDemo = () => {
    openModal({
      title: 'Demo Modal',
      content: (
        <div className="space-y-4">
          <p>This is a demonstration of the modal system with various features activated:</p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>Modal Stack: {modalStack.length} deep</div>
            <div>Overlay: {activeModal?.overlay ? 'Yes' : 'No'}</div>
            <div>Closable: {activeModal?.closable ? 'Yes' : 'No'}</div>
            <div>Size: {activeModal?.size}</div>
          </div>
          <button 
            onClick={() => addNotification({ type: 'success', message: 'Modal action triggered!', duration: 3000 })}
            className="px-3 py-1 bg-blue-500 text-white rounded text-sm"
          >
            Trigger Notification
          </button>
        </div>
      ),
      type: 'info',
      size: 'lg'
    });
  };

  const runNotificationDemo = () => {
    const types: Array<NotificationState['type']> = ['info', 'success', 'warning', 'error'];
    const type = types[Math.floor(Math.random() * types.length)];
    const messages = {
      info: 'Here is some useful information for you.',
      success: 'Operation completed successfully!',
      warning: 'Please review this warning message.',
      error: 'An error occurred. Please try again.'
    };
    
    addNotification({
      type,
      message: messages[type],
      duration: 5000,
      actions: [
        { label: 'Action', action: () => {}, style: 'primary' },
        { label: 'Dismiss', action: () => {}, style: 'secondary' }
      ]
    });
  };

  const runPanelDemo = () => {
    const id = `panel-${Date.now()}`;
    createPanel(id, {
      size: { width: 400, height: 300 },
      position: { x: Math.random() * 300 + 50, y: Math.random() * 200 + 50 }
    });
  };

  // Render Modal System
  const renderModal = () => {
    if (!activeModal || !activeModal.isOpen || !enableModals) return null;
    
    return (
      <div className={`fixed inset-0 z-50 ${animationsEnabled ? 'transition-opacity' : ''}`}>
        {activeModal.overlay && (
          <div 
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={activeModal.closable ? closeModal : undefined}
          />
        )}
        <div className="flex items-center justify-center min-h-full p-4">
          <div className={`
            bg-white rounded-lg shadow-xl relative
            ${activeModal.size === 'sm' ? 'max-w-sm' : ''}
            ${activeModal.size === 'md' ? 'max-w-md' : ''}
            ${activeModal.size === 'lg' ? 'max-w-lg' : ''}
            ${activeModal.size === 'xl' ? 'max-w-xl' : ''}
            ${animationsEnabled ? 'transform transition-transform scale-100' : ''}
          `}>
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">{activeModal.title}</h3>
              {activeModal.closable && (
                <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
            <div className="p-4">
              {activeModal.content}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render Tooltip System
  const renderTooltip = () => {
    if (!tooltipState.isVisible || !enableTooltips) return null;
    
    return (
      <div
        ref={tooltipRef}
        className={`
          absolute z-50 px-2 py-1 text-xs text-white bg-black rounded shadow-lg pointer-events-none
          ${animationsEnabled ? 'transition-opacity' : ''}
        `}
        style={{
          left: tooltipState.position.x,
          top: tooltipState.position.y,
          transform: 'translate(-50%, -100%)'
        }}
      >
        {tooltipState.content}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black" />
      </div>
    );
  };

  // Render Notification System
  const renderNotifications = () => {
    if (!enableNotifications) return null;
    
    return (
      <div className="fixed top-4 right-4 z-40 space-y-2">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`
              p-4 rounded-lg shadow-lg max-w-sm flex items-start gap-3
              ${notification.type === 'info' ? 'bg-blue-50 border border-blue-200' : ''}
              ${notification.type === 'success' ? 'bg-green-50 border border-green-200' : ''}
              ${notification.type === 'warning' ? 'bg-yellow-50 border border-yellow-200' : ''}
              ${notification.type === 'error' ? 'bg-red-50 border border-red-200' : ''}
              ${animationsEnabled ? 'transform transition-transform' : ''}
            `}
          >
            <div className="flex-shrink-0 mt-0.5">
              {notification.type === 'info' && <Info className="w-4 h-4 text-blue-600" />}
              {notification.type === 'success' && <CheckCircle className="w-4 h-4 text-green-600" />}
              {notification.type === 'warning' && <AlertCircle className="w-4 h-4 text-yellow-600" />}
              {notification.type === 'error' && <AlertCircle className="w-4 h-4 text-red-600" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900">{notification.message}</p>
              {notification.actions && (
                <div className="mt-2 flex gap-2">
                  {notification.actions.map((action, index) => (
                    <button
                      key={index}
                      onClick={action.action}
                      className={`
                        text-xs px-2 py-1 rounded
                        ${action.style === 'primary' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'}
                      `}
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={() => removeNotification(notification.id)}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div ref={containerRef} className={`ui-enhancement-system ${className}`}>
      {/* Control Panel */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-4">
        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5" />
          UI Enhancement System
        </h3>
        
        {/* Demo Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <button
            onClick={runModalDemo}
            className="flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
            disabled={!enableModals}
          >
            <Maximize2 className="w-4 h-4" />
            Demo Modal
          </button>
          
          <button
            onClick={runNotificationDemo}
            className="flex items-center gap-2 px-3 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200"
            disabled={!enableNotifications}
          >
            <Bell className="w-4 h-4" />
            Demo Notification
          </button>
          
          <button
            onClick={runPanelDemo}
            className="flex items-center gap-2 px-3 py-2 bg-purple-100 text-purple-700 rounded hover:bg-purple-200"
            disabled={!enableAdvancedPanels}
          >
            <Plus className="w-4 h-4" />
            Demo Panel
          </button>
        </div>

        {/* System Status */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="bg-gray-50 rounded p-2">
            <div className="font-medium">Active Modals</div>
            <div className="text-gray-600">{modalStack.length}</div>
          </div>
          <div className="bg-gray-50 rounded p-2">
            <div className="font-medium">Notifications</div>
            <div className="text-gray-600">{notifications.length}</div>
          </div>
          <div className="bg-gray-50 rounded p-2">
            <div className="font-medium">Active Panels</div>
            <div className="text-gray-600">{activePanels.length}</div>
          </div>
          <div className="bg-gray-50 rounded p-2">
            <div className="font-medium">Selected Items</div>
            <div className="text-gray-600">{interactionState.selectedItems.length}</div>
          </div>
        </div>

        {/* Filter Demo */}
        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center gap-2 mb-2">
            <Filter className="w-4 h-4" />
            <span className="text-sm font-medium">Filter System Demo</span>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Search..."
              value={filterState.searchTerm}
              onChange={(e) => updateFilter('searchTerm', e.target.value)}
              className="px-2 py-1 border rounded text-sm"
            />
            <select
              value={filterState.sortBy}
              onChange={(e) => updateFilter('sortBy', e.target.value)}
              className="px-2 py-1 border rounded text-sm"
            >
              <option value="name">Name</option>
              <option value="date">Date</option>
              <option value="score">Score</option>
            </select>
            <button
              onClick={clearFilters}
              className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-sm hover:bg-gray-200"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>
          <div className="mt-2 flex flex-wrap gap-1">
            {filterState.activeFilters.map((filter) => (
              <span
                key={filter}
                className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs flex items-center gap-1"
              >
                {filter}
                <button onClick={() => removeFilter(filter)}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Render active UI systems */}
      {renderModal()}
      {renderTooltip()}
      {renderNotifications()}

      {/* Debug Information */}
      {debugMode && (
        <div className="fixed bottom-4 left-4 bg-black bg-opacity-80 text-white p-2 rounded text-xs max-w-sm">
          <div>Modal Stack: {modalStack.length}</div>
          <div>Tooltip: {tooltipState.isVisible ? 'Visible' : 'Hidden'}</div>
          <div>Notifications: {notifications.length}</div>
          <div>Panels: {activePanels.length}</div>
          <div>Selected: {interactionState.selectedItems.join(', ')}</div>
          <div>Filters: {filterState.activeFilters.length} active</div>
        </div>
      )}
    </div>
  );
}