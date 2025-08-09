# Debug Panel System

## Overview

The ConsolidatedDebugInfo component provides a comprehensive debugging interface
for the "What To Eat Next" application. It consolidates real-time performance
metrics, astrological data, and component state monitoring into a single,
draggable panel.

## Features

### ✅ Task 2.1: ConsolidatedDebugInfo Component

- **Collapsible debug panel** positioned in bottom right corner
- **Real-time astrological data display** including sun sign, lunar phase,
  planetary hour
- **Component state monitoring** with loading states and error tracking

### ✅ Task 2.2: Performance Metrics Tracking

- **Render time monitoring** with average calculations
- **Memory usage tracking** (when available in browser)
- **Error count display** with recent error history
- **System health score** calculation
- **Component-specific performance data**

### ✅ Task 2.3: Debug Panel Toggle and Positioning

- **Show/hide functionality** with persistent state
- **Drag-and-drop repositioning** with boundary constraints
- **Persistent settings storage** in localStorage
- **Opacity control** and display options
- **Mobile-friendly touch support**

## Components

### ConsolidatedDebugInfo

Main debug panel component with all features integrated.

**Props:**

```typescript
interface DebugInfoProps {
  position?: 'bottom-right' | 'bottom-left' | 'top-right';
  collapsible?: boolean;
  showPerformanceMetrics?: boolean;
  showAstrologicalData?: boolean;
  showComponentStates?: boolean;
}
```

### DebugPanelDemo

Demo component showcasing the debug panel functionality.

## Hooks

### usePerformanceMetrics

Tracks component performance metrics including render times, memory usage, and
errors.

**Returns:**

- `metrics`: Current performance data
- `trackRenderStart/End`: Manual render tracking
- `trackDataFetch`: Async operation tracking
- `trackError`: Error tracking
- `resetMetrics`: Reset all metrics

### useDebugSettings

Manages persistent debug panel settings.

**Returns:**

- `settings`: Current settings object
- `toggleVisibility`: Show/hide panel
- `toggleCollapsed`: Expand/collapse panel
- `setPosition`: Set panel position
- `setCustomPosition`: Set custom drag position
- Various toggle functions for display options

### useDraggable

Provides drag-and-drop functionality for elements.

**Options:**

- `handle`: CSS selector for drag handle
- `bounds`: Boundary constraints
- `onDragStart/Drag/End`: Event callbacks

## Services

### PerformanceMonitoringService

Singleton service that monitors system-wide performance metrics.

**Features:**

- Component render tracking
- Memory usage monitoring
- Error rate calculation
- Performance alerts
- Health score calculation
- Subscriber pattern for real-time updates

## Usage

### Basic Usage

```tsx
import { ConsolidatedDebugInfo } from '@/components/debug';

function App() {
  return (
    <div>
      {/* Your app content */}
      <ConsolidatedDebugInfo />
    </div>
  );
}
```

### With Custom Settings

```tsx
<ConsolidatedDebugInfo
  position="top-right"
  showPerformanceMetrics={true}
  showAstrologicalData={true}
  showComponentStates={false}
/>
```

### Demo Page

```tsx
import { DebugPanelDemo } from '@/components/debug';

// Renders a full demo page with the debug panel
<DebugPanelDemo />
```

## Data Displayed

### Performance Metrics

- Render count and timing
- Average render time
- Memory usage (MB)
- Error count
- System health score
- Total components tracked

### Astrological Data

- Current sun sign
- Lunar phase
- Planetary hour
- Day/night status
- Dominant element
- Elemental balance (Fire, Water, Earth, Air)
- Alchemical token values (Spirit, Essence, Matter, Substance)

### Component States

- Context status
- Data loading state
- Last update timestamp
- Recent errors (last 3)

## Settings

All settings are automatically persisted to localStorage:

- **Visibility**: Show/hide panel
- **Collapsed state**: Expanded/collapsed
- **Position**: Corner position or custom coordinates
- **Display options**: Toggle different data sections
- **Opacity**: Panel transparency (10-100%)

## Browser Compatibility

- **Desktop**: Full drag-and-drop support with mouse events
- **Mobile**: Touch-friendly drag support
- **Memory tracking**: Available in Chromium-based browsers
- **LocalStorage**: Supported in all modern browsers

## Performance Impact

The debug panel is designed to have minimal performance impact:

- Efficient React.memo usage
- Debounced updates
- Lazy rendering of collapsed content
- Optional memory monitoring
- Configurable update intervals

## Requirements Satisfied

This implementation satisfies all requirements from the main-page-restoration
spec:

- **Requirement 2.1**: Debug components visible in bottom right corner ✅
- **Requirement 2.2**: Real-time astrological and system data display ✅
- **Requirement 2.3**: Toggle show/hide without affecting other components ✅
- **Requirement 2.4**: Real-time data updates ✅
- **Requirement 2.5**: Graceful error handling ✅
- **Requirement 8.3**: Performance monitoring and metrics ✅
