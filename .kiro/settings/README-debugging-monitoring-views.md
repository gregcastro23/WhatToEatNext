# Debugging and Monitoring Views Configuration

This document describes the comprehensive debugging and monitoring views system implemented for the WhatToEatNext project in Kiro.

## Configuration Files

### `workspace.json` - Debug Settings Integration
Enhanced with debugging capabilities:
- **Debug Console**: Optimized font size and startup behavior
- **Breakpoint Display**: Visible in overview ruler and inline candidates
- **Debug Toolbar**: Floating toolbar for better accessibility
- **Focus Management**: Automatic window focus on breakpoints
- **Breakpoint Flexibility**: Breakpoints allowed everywhere for comprehensive debugging

### `debugging-monitoring-views.json` - Specialized Debug System
Comprehensive configuration for domain-specific debugging and monitoring:

## Debug Panels System

### 🔮 Astrological Debug Panel
**Purpose**: Monitor and debug astrological calculations in real-time

#### Tabs and Features:
1. **🪐 Planetary Positions Tab**
   - **Real-time Updates**: Hourly refresh of planetary positions
   - **Data Source**: `src/utils/reliableAstronomy.ts`
   - **Display**: Table format with planet, sign, degree, longitude, retrograde status
   - **Actions**: Refresh, validate, export positions
   - **Filters**: By retrograde status and zodiac sign

2. **🌟 Elemental Harmony Tab**
   - **Calculated Display**: Dynamic elemental balance analysis
   - **Data Source**: `src/utils/elemental/elementalUtils.ts`
   - **Visualization**: Radar chart showing Fire, Water, Earth, Air balance
   - **Features**: Compatibility scores, recommendations, color-coded elements
   - **Color Scheme**: Fire (#FF6B6B), Water (#4ECDC4), Earth (#45B7D1), Air (#96CEB4)

3. **⭐ Transit Validation Tab**
   - **Validation Status**: Real-time transit date validation
   - **Data Source**: `src/utils/planetaryConsistencyCheck.ts`
   - **Display**: Status indicators with error/warning highlights
   - **Actions**: Revalidate, update transit dates, view details
   - **Grouping**: Organized by planet for easy navigation

4. **⚡ Calculation Performance Tab**
   - **Performance Metrics**: Real-time calculation speed monitoring
   - **Metrics Tracked**:
     - Calculation Speed (threshold: 2000ms)
     - API Response Time (threshold: 5000ms)
     - Cache Hit Rate (threshold: 80%)
     - Fallback Usage (threshold: 10%)
   - **Display**: Gauge format with trend analysis and alerts

#### Shortcuts:
- `Cmd+Alt+Shift+A` - Toggle Astrological Debug Panel
- `Cmd+Alt+P` - Refresh Planetary Positions
- `Cmd+Alt+E` - Analyze Elemental Harmony

### 📊 Performance Monitor Panel
**Purpose**: System-wide performance monitoring and optimization

#### Tabs and Features:
1. **🖥️ System Metrics Tab**
   - **Real-time Monitoring**: 5-second update intervals
   - **Metrics Tracked**:
     - CPU Usage (threshold: 80%)
     - Memory Usage (threshold: 1024MB)
     - TypeScript Server Memory (threshold: 2048MB)
     - Build Performance (threshold: 30s)
   - **Display**: Timeline format with 30-minute history
   - **Alerts**: Automatic threshold-based alerts

2. **✅ Code Quality Tab**
   - **Quality Metrics**: Dynamic code quality tracking
   - **Data Source**: `src/services/campaign/MetricsCollectionSystem.ts`
   - **Metrics Displayed**:
     - TypeScript Errors (target: 0, trend: decreasing)
     - Linting Warnings (target: 0, trend: decreasing)
     - Test Coverage (target: 80%, trend: increasing)
     - Bundle Size (target: 1000KB, trend: stable)
   - **Display**: Progress bars with targets and trend indicators

3. **🔌 API Health Tab**
   - **Service Monitoring**: Real-time API health checks
   - **Services Tracked**:
     - Astrology API (astrology-server)
     - Nutrition API (nutrition-server)
     - Spoonacular API (spoonacular-server)
   - **Display**: Status grid with response times and last check timestamps
   - **Auto-refresh**: 30-second intervals

#### Shortcuts:
- `Cmd+Alt+Shift+P` - Toggle Performance Monitor
- `Cmd+Alt+M` - Refresh Metrics

### ⚡ Campaign Progress Tracker
**Purpose**: Monitor and control code quality improvement campaigns

#### Tabs and Features:
1. **🚀 Active Campaigns Tab**
   - **Real-time Updates**: 10-second refresh intervals
   - **Data Source**: `src/services/campaign/ProgressTracker.ts`
   - **Display**: Card format showing progress, ETA, and metrics
   - **Actions**: Pause, resume, stop, view details
   - **Live Status**: Current campaign state and progress indicators

2. **📈 Campaign History Tab**
   - **Historical Data**: 7-day campaign history
   - **Data Source**: `src/services/campaign/ProgressReportingSystem.ts`
   - **Display**: Timeline format with success rates and duration
   - **Filters**: Campaign type, status, date range
   - **Analytics**: Success rate trends and impact analysis

3. **🔍 Error Analysis Tab**
   - **Error Breakdown**: Detailed error categorization and analysis
   - **Data Source**: `src/services/campaign/TypeScriptErrorAnalyzer.ts`
   - **Display**: Breakdown by error type with trends and file impact
   - **Charts**: Error distribution, trends, and file impact visualization
   - **Solutions**: Suggested fixes and resolution strategies

4. **🛡️ Safety Status Tab**
   - **Safety Monitoring**: Real-time safety protocol status
   - **Data Source**: `src/services/campaign/SafetyProtocol.ts`
   - **Display**: Status board with protocols, rollbacks, and alerts
   - **Alert Levels**: Info, warning, error, critical
   - **Actions**: Emergency stops and rollback management

#### Shortcuts:
- `Cmd+Alt+Shift+C` - Toggle Campaign Tracker
- `Cmd+Shift+R` - Refresh Campaign Data

### 🐛 Error Analysis Dashboard
**Purpose**: Comprehensive error tracking and resolution

#### Tabs and Features:
1. **📝 TypeScript Errors Tab**
   - **Error Tree**: Hierarchical error display grouped by file
   - **Data Source**: `src/services/campaign/TypeScriptErrorAnalyzer.ts`
   - **Features**: Severity indicators, solution suggestions, context display
   - **Filters**: Error code, severity, file
   - **Actions**: Fix error, ignore error, view file, search solution

2. **⚠️ Linting Warnings Tab**
   - **Warning List**: Organized by ESLint rule
   - **Data Source**: `src/services/campaign/LintingWarningAnalyzer.ts`
   - **Features**: Auto-fix availability, impact assessment, frequency tracking
   - **Actions**: Auto-fix, disable rule, view rule documentation, fix all

3. **🏗️ Build Errors Tab**
   - **Build Console**: Real-time build error display
   - **Data Source**: Build logs
   - **Features**: Stack trace display, suggestions, error highlighting
   - **Actions**: Rebuild, clear cache, view full log

4. **⚡ Runtime Errors Tab**
   - **Runtime Timeline**: Chronological runtime error display
   - **Data Source**: Console errors
   - **Features**: Stack traces, context, frequency analysis
   - **Grouping**: By component for better organization
   - **Actions**: Debug error, view component, clear errors

#### Shortcuts:
- `Cmd+Alt+Shift+E` - Toggle Error Analysis
- `Cmd+Shift+E` - Refresh Errors

## Monitoring Dashboards

### 🔮 Astrological Monitoring Dashboard
**Layout**: 3-column grid with specialized widgets

#### Widgets:
1. **Current Planetary Positions** (Medium)
   - Table display of real-time planetary data
   - Hourly refresh rate
   - Interactive position details

2. **Elemental Balance** (Medium)
   - Radar chart visualization
   - 5-minute refresh rate
   - Dynamic balance analysis

3. **Transit Alerts** (Small)
   - Alert list for upcoming transits
   - 30-minute refresh rate
   - Priority-based sorting

4. **Calculation Health** (Medium)
   - Status grid for calculation systems
   - 1-minute refresh rate
   - Health indicators and alerts

5. **API Status** (Small)
   - Status indicators for external APIs
   - 30-second refresh rate
   - Connection health monitoring

6. **Recommendation Statistics** (Medium)
   - Metrics card for recommendation performance
   - 5-minute refresh rate
   - Usage and accuracy statistics

### ⚡ Campaign Monitoring Dashboard
**Layout**: Flexible layout with campaign-focused widgets

#### Widgets:
1. **Campaign Overview** (Large)
   - Summary cards for all active campaigns
   - 10-second refresh rate
   - Progress and status indicators

2. **Error Reduction Trends** (Large)
   - Line chart showing error reduction over time
   - 30-second refresh rate
   - Trend analysis and projections

3. **Quality Metrics** (Medium)
   - Gauge cluster for quality indicators
   - 1-minute refresh rate
   - Target vs. actual comparisons

4. **Safety Status** (Medium)
   - Status board for safety protocols
   - 5-second refresh rate
   - Real-time safety monitoring

### 📊 Performance Monitoring Dashboard
**Layout**: Mixed layout optimized for performance data

#### Widgets:
1. **System Resources** (Large)
   - Resource monitor for CPU, memory, disk
   - 5-second refresh rate
   - Historical trends and alerts

2. **Build Performance** (Medium)
   - Performance chart for build times
   - 1-minute refresh rate
   - Build optimization insights

3. **TypeScript Performance** (Medium)
   - Metrics grid for TypeScript server performance
   - 30-second refresh rate
   - Compilation and analysis metrics

4. **API Performance** (Medium)
   - Response time chart for external APIs
   - 15-second refresh rate
   - Latency and availability tracking

## Alert System

### Alert Types and Conditions:
1. **🔮 Astrological Calculation Failure** (Error)
   - Triggers: Calculation failed, API timeout, fallback activated
   - Actions: Show notification, log error, activate fallback

2. **⚡ Campaign Safety Violation** (Critical)
   - Triggers: Safety violation, corruption detected, rollback required
   - Actions: Emergency stop, critical alert, initiate rollback

3. **📊 Performance Degradation** (Warning)
   - Triggers: High CPU, high memory, slow build
   - Actions: Show warning, log performance, suggest optimization

4. **🐛 Error Threshold Exceeded** (Warning)
   - Triggers: TypeScript errors > 100, linting warnings > 1000
   - Actions: Show alert, suggest campaign, log threshold

### Notification Settings:
- **Status Bar**: Visible alerts in status bar
- **Popups**: Alert popups for critical issues
- **Sound**: Disabled by default
- **Console Logging**: All alerts logged
- **Persistence**: Alerts persist until resolved

## Custom Views

### 🔮 Astrological Workbench
**Purpose**: Integrated development environment for astrological calculations
- **Layout**: Custom 3-panel layout
- **Center Panel**: Calculation editor (60%)
- **Right Panel**: Planetary data display (25%)
- **Bottom Panel**: Test results (15%)

### ⚡ Campaign Control Center
**Purpose**: Comprehensive campaign management interface
- **Layout**: Dashboard layout
- **Top Panel**: Campaign controls (20%)
- **Center Panel**: Metrics display (60%)
- **Bottom Panel**: Safety monitor (20%)

## Global Shortcuts

### Debug Panel Management:
| Shortcut | Action | Description |
|----------|--------|-------------|
| `Cmd+Alt+Shift+D` | Toggle All Debug Panels | Show/hide all debug panels |
| `Cmd+Alt+Shift+M` | Toggle All Monitoring | Show/hide all monitoring views |
| `Cmd+Alt+Shift+R` | Refresh All Views | Refresh all monitoring data |
| `Cmd+Alt+Shift+S` | Show System Status | Comprehensive system status |

### Specialized Panel Shortcuts:
| Shortcut | Action | Description |
|----------|--------|-------------|
| `Cmd+Alt+Shift+A` | Toggle Astrology Debug | Astrological debug panel |
| `Cmd+Alt+Shift+P` | Toggle Performance Monitor | Performance monitoring panel |
| `Cmd+Alt+Shift+C` | Toggle Campaign Tracker | Campaign progress tracker |
| `Cmd+Alt+Shift+E` | Toggle Error Analysis | Error analysis dashboard |

## Integration with Development Workflow

### Astrological Development Integration:
1. **Real-time Monitoring**: Continuous monitoring of planetary calculations
2. **Validation Alerts**: Immediate feedback on calculation accuracy
3. **Performance Tracking**: Optimization insights for astrological algorithms
4. **Error Prevention**: Early detection of calculation issues

### Campaign System Integration:
1. **Progress Visualization**: Real-time campaign progress tracking
2. **Safety Monitoring**: Continuous safety protocol validation
3. **Quality Metrics**: Live code quality improvement tracking
4. **Error Analysis**: Detailed error categorization and resolution

### Performance Optimization Integration:
1. **Resource Monitoring**: System resource usage tracking
2. **Build Optimization**: Build performance analysis and optimization
3. **API Health**: External service health monitoring
4. **Quality Tracking**: Code quality metrics and trends

## Usage Guidelines

### Daily Development Workflow:
1. **Start with System Status** - `Cmd+Alt+Shift+S` for overall health
2. **Monitor Active Work** - Use relevant debug panels for current tasks
3. **Track Performance** - Keep performance monitor visible during development
4. **Review Errors** - Regular error analysis for quality maintenance

### Astrological Development Workflow:
1. **Planetary Position Monitoring** - Keep astrological debug panel active
2. **Calculation Validation** - Regular transit date and harmony checks
3. **Performance Optimization** - Monitor calculation speed and API health
4. **Error Prevention** - Proactive error detection and resolution

### Campaign Management Workflow:
1. **Campaign Monitoring** - Active tracking of running campaigns
2. **Safety Validation** - Continuous safety protocol monitoring
3. **Progress Analysis** - Regular progress and metrics review
4. **Error Resolution** - Systematic error analysis and fixing

### Performance Monitoring Workflow:
1. **Resource Tracking** - Continuous system resource monitoring
2. **Build Optimization** - Regular build performance analysis
3. **API Health Checks** - Proactive external service monitoring
4. **Quality Maintenance** - Ongoing code quality tracking

## Customization and Extension

### Adding New Debug Panels:
1. Define panel configuration in `debugging-monitoring-views.json`
2. Implement data sources and update functions
3. Add keyboard shortcuts to workspace settings
4. Create visualization components as needed

### Extending Monitoring Dashboards:
1. Add new widgets to dashboard configurations
2. Implement data collection and refresh logic
3. Configure alert conditions and actions
4. Update documentation and usage guidelines

### Custom Alert Configuration:
1. Define alert types and conditions
2. Implement trigger logic and actions
3. Configure notification preferences
4. Test alert scenarios and responses

This debugging and monitoring system creates a comprehensive, real-time development environment specifically optimized for the complex, multi-domain nature of astrological food recommendation development with sophisticated automation and quality assurance capabilities.