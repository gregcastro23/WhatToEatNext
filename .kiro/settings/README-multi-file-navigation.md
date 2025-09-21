# Multi-File Editing and Navigation Optimization

This document describes the comprehensive multi-file editing and navigation optimizations implemented for the WhatToEatNext project in Kiro.

## Configuration Files

### `workspace.json` - Core Editor Settings
Enhanced with multi-file editing capabilities:
- **Tab Management**: 15 tabs per group with smart sizing and positioning
- **Split View Support**: Horizontal/vertical splits with intelligent focus management
- **Preview Disabled**: Direct file opening for faster navigation
- **Navigation Enhancements**: Mouse back/forward, reveal if open, restore view state

### `multi-file-navigation.json` - Advanced Navigation System
Comprehensive configuration for sophisticated multi-file workflows:

## Tab Management System

### Smart Tab Limits
- **Maximum Tabs**: 15 per editor group
- **Close Strategy**: Least recently used tabs closed automatically
- **Tab Sizing**: Shrink mode for better visibility
- **Pinned Tabs**: Up to 5 pinned tabs for critical files

### Default Pinned Files
Essential files automatically pinned:
- `src/calculations/culinaryAstrology.ts` - Core astrological engine
- `src/services/UnifiedRecommendationService.ts` - Main service
- `.kiro/specs/kiro-optimization/tasks.md` - Current specification
- `src/types/astrological.ts` - Core type definitions
- `README.md` - Project overview

### Tab Groups with Visual Organization
Color-coded tab groups for different file types:
- 🔮 **Astrological Core** (`src/calculations/**`) - Purple (#8B5CF6)
- 📊 **Data Sources** (`src/data/**`) - Green (#10B981)
- ⚡ **Campaign System** (`src/services/campaign/**`) - Amber (#F59E0B)
- 🧩 **Components** (`src/components/**`) - Blue (#3B82F6)
- 🎯 **Kiro Config** (`.kiro/**`) - Red (#EF4444)
- 🧪 **Tests** (`**/*.test.ts`) - Gray (#6B7280)

## Split View Layouts

### Preset Layouts
Pre-configured split view patterns for common workflows:

#### 1. Component + Test Layout
- **Layout**: Horizontal split (70/30)
- **Auto-match**: Automatically pairs components with tests
- **Patterns**: 
  - `src/components/**/*.tsx` ↔ `src/components/**/*.test.tsx`
  - `src/utils/**/*.ts` ↔ `src/utils/**/*.test.ts`
  - `src/services/**/*.ts` ↔ `src/services/**/*.test.ts`

#### 2. Calculation + Data Layout
- **Layout**: Horizontal split (60/40)
- **Purpose**: Astrological calculations with data sources
- **Pattern**: `src/calculations/**/*.ts` ↔ `src/data/**/*.ts`

#### 3. Service + Types Layout
- **Layout**: Vertical split (65/35)
- **Purpose**: Service implementation with type definitions
- **Pattern**: `src/services/**/*.ts` ↔ `src/types/**/*.ts`

#### 4. Spec + Implementation Layout
- **Layout**: Horizontal split (40/60)
- **Purpose**: Specifications with implementation files
- **Pattern**: `.kiro/specs/**/*.md` ↔ `src/**/*.ts`

#### 5. Campaign Analysis Layout
- **Layout**: Vertical split (70/30)
- **Purpose**: Campaign scripts with metrics/logs
- **Patterns**:
  - `src/services/campaign/**/*.ts` ↔ `**/*-metrics.json`
  - `src/services/campaign/**/*.ts` ↔ `**/*.log`

#### 6. Triple Pane Astrology Layout
- **Layout**: 3-column grid (40/30/30)
- **Purpose**: Calculation + Data + Test
- **Pattern**: `src/calculations/**/*.ts` ↔ `src/data/**/*.ts` ↔ `src/calculations/**/*.test.ts`

### Split View Shortcuts
| Shortcut | Action | Description |
|----------|--------|-------------|
| `Cmd+\` | Split Horizontal | Split editor horizontally |
| `Cmd+Shift+\` | Split Vertical | Split editor vertically |
| `Cmd+Alt+\` | Auto Split | Auto-split based on patterns |
| `Cmd+1/2/3` | Focus Group | Focus specific editor group |

## Breadcrumb Navigation

### Enhanced Breadcrumbs
- **File Path**: Full path with custom icons
- **Symbol Path**: Function/class navigation
- **Custom Icons**: Domain-specific icons for different directories
- **Contextual Info**: File size, modification date, Git status

### Custom Directory Icons
- 🔮 `calculations` - Astrological computations
- 📊 `data` - Data sources and databases
- ⚡ `campaign` - Campaign system files
- 🧩 `components` - React components
- 🔧 `services` - Business logic services
- 🛠️ `utils` - Utility functions
- 📝 `types` - Type definitions
- 🪝 `hooks` - React hooks
- 📋 `constants` - Constants and configurations

### Breadcrumb Shortcuts
| Shortcut | Action | Description |
|----------|--------|-------------|
| `Cmd+Shift+.` | Focus Breadcrumbs | Focus breadcrumb navigation |
| `Cmd+Shift+;` | Focus and Select | Focus and select in breadcrumbs |

### Contextual Information
Breadcrumbs display additional context:
- **Astrological Files**: Elemental properties, planetary correspondences
- **Campaign Files**: Campaign status and metrics
- **Data Files**: Validation status and structure info
- **General Files**: Size, modification date, Git status

## File Preview System

### Hover Preview
- **Delay**: 500ms hover delay
- **Max Lines**: 50 lines preview
- **Syntax Highlighting**: Full syntax support
- **Line Numbers**: Visible for better navigation

### Quick Peek (`Cmd+Shift+Space`)
Enhanced peek functionality:
- **Max Size**: 800x600 pixel window
- **Metadata**: File information display
- **Context-aware**: Different previews for different file types

### Contextual Previews
Specialized previews for different file types:

#### Astrological Files
- **Elemental Summary**: Quick elemental property overview
- **Planetary Info**: Relevant planetary correspondences
- **Calculation Preview**: Sample calculation results

#### Data Files
- **Structure Overview**: Data structure visualization
- **Sample Data**: Representative data samples
- **Validation Status**: Data integrity indicators

#### Campaign Files
- **Metrics Display**: Current performance metrics
- **Last Run Info**: Recent execution information
- **Success Rate**: Historical success indicators

#### Specification Files
- **Progress Overview**: Task completion status
- **Task Count**: Pending and completed tasks
- **Requirements**: Key requirement highlights

## File Switching and Navigation

### Quick Open (`Cmd+P`)
Enhanced file opening:
- **Fuzzy Matching**: Intelligent file name matching
- **Recent Files**: 20 most recent files
- **Path Display**: Full path information
- **Project Grouping**: Organized by project structure

### Recent Files (`Cmd+R`)
Improved recent file access:
- **History**: 30 file history
- **Type Grouping**: Organized by file type
- **Timestamps**: Last access information

### Related Files (`Cmd+Alt+O`)
Smart file relationship navigation:
- **Components**: Component ↔ Test ↔ Stories ↔ Types
- **Calculations**: Calculation ↔ Test ↔ Data ↔ Types
- **Services**: Service ↔ Test ↔ Types ↔ Utils
- **Data**: Data ↔ Calculations ↔ Types ↔ Constants
- **Specs**: Spec ↔ Implementation ↔ Templates

### Smart Navigation
Advanced navigation shortcuts:
| Shortcut | Action | Description |
|----------|--------|-------------|
| `Cmd+Click` | Go to Definition | Navigate to definition |
| `Cmd+Alt+Click` | Go to Implementation | Navigate to implementation |
| `Cmd+Shift+Click` | Go to Type Definition | Navigate to type definition |
| `Shift+F12` | Find References | Find all references |
| `Alt+F12` | Peek Definition | Peek at definition |
| `Shift+Alt+F12` | Peek References | Peek at references |

## Workspace Navigation Enhancements

### Minimap Configuration
- **Position**: Right side of editor
- **Show Slider**: On mouse hover
- **Render Characters**: Full character rendering
- **Max Column**: 120 characters
- **Scale**: 1x for optimal visibility

### Outline Panel
Enhanced outline with custom icons:
- **Follow Cursor**: Automatic cursor tracking
- **Custom Icons**: Domain-specific function icons
- **Complete Symbol Tree**: All symbol types visible
- **Smart Filtering**: Intelligent symbol filtering

### Symbol Search (`Cmd+Shift+O`)
Improved symbol navigation:
- **Fuzzy Matching**: Intelligent symbol matching
- **Kind Display**: Symbol type indicators
- **Kind Grouping**: Organized by symbol type

## Editor Group Management

### Focus Management
- **Auto Focus**: Intelligent focus switching
- **Recent Editor Focus**: Focus most recent after close
- **Restore Focus**: Maintain focus after split operations

### Layout Management
- **Preserve Layout**: Maintain layout across sessions
- **Startup Restore**: Restore layout on startup
- **Max Groups**: 4 editor groups maximum
- **Default Layout**: Horizontal split preference

### Synchronization Options
- **Independent Operation**: No automatic synchronization
- **Manual Sync**: User-controlled synchronization
- **Flexible Workflow**: Adaptable to different needs

## Contextual Navigation

### Astrological Context
Real-time astrological information:
- **Current Positions**: Live planetary positions
- **Elemental Balance**: Current elemental influences
- **Transit Dates**: Upcoming astronomical events
- **Update Frequency**: Hourly updates

### Campaign Context
Live campaign information:
- **Active Metrics**: Current quality metrics
- **Error Counts**: Real-time error tracking
- **Progress Status**: Campaign progress indicators
- **Update Frequency**: Real-time updates

### Project Context
Development environment status:
- **Build Status**: Current build state
- **Test Results**: Latest test outcomes
- **Git Status**: Repository status
- **Dependencies**: Dependency health

## Keyboard Shortcuts Summary

### Core Navigation
| Shortcut | Action |
|----------|--------|
| `Cmd+P` | Quick Open |
| `Cmd+R` | Recent Files |
| `Cmd+Alt+O` | Related Files |
| `Cmd+Shift+O` | Go to Symbol |

### Split View Management
| Shortcut | Action |
|----------|--------|
| `Cmd+\` | Split Horizontal |
| `Cmd+Shift+\` | Split Vertical |
| `Cmd+1/2/3` | Focus Editor Group |

### Breadcrumb Navigation
| Shortcut | Action |
|----------|--------|
| `Cmd+Shift+.` | Focus Breadcrumbs |
| `Cmd+Shift+;` | Focus and Select |

### Preview and Peek
| Shortcut | Action |
|----------|--------|
| `Cmd+Shift+Space` | Peek Definition |
| `Alt+F12` | Peek Definition |
| `Shift+Alt+F12` | Peek References |

## Usage Guidelines

### Daily Development Workflow
1. **Start with Pinned Tabs** - Essential files always accessible
2. **Use Split Views** - Leverage preset layouts for common patterns
3. **Navigate with Breadcrumbs** - Quick navigation within files
4. **Preview Before Opening** - Use hover and peek for quick inspection
5. **Switch with Shortcuts** - Memorize key navigation shortcuts

### Astrological Development Patterns
1. **Calculation + Data + Test** - Use triple pane layout
2. **Service + Types** - Vertical split for implementation
3. **Component + Test** - Horizontal split for TDD
4. **Spec + Implementation** - Track progress while coding

### Campaign Development Patterns
1. **Script + Metrics** - Monitor performance while developing
2. **Analysis + Logs** - Debug with real-time information
3. **Controller + Safety** - Ensure safety while orchestrating

### File Organization Best Practices
1. **Pin Critical Files** - Keep essential files always accessible
2. **Use Tab Groups** - Organize by functional area
3. **Leverage Related Files** - Quick navigation between related code
4. **Preview Before Opening** - Reduce tab clutter

This multi-file navigation system creates a sophisticated, efficient development environment specifically optimized for the complex, multi-domain nature of astrological food recommendation development with comprehensive automation support.