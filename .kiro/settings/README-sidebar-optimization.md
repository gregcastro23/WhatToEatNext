# Sidebar and File Explorer Optimization

This document describes the sidebar and file explorer optimizations implemented for the WhatToEatNext project in Kiro.

## Configuration Files

### `workspace.json`
Enhanced with explorer-specific settings:
- **File Nesting**: Intelligent grouping of related files (TypeScript, config files, etc.)
- **Smart Sorting**: Mixed sorting with lexicographic options for better organization
- **Visual Enhancements**: Colors and badges for better file identification
- **Auto-reveal**: Focus-based navigation without scrolling disruption
- **Tree Rendering**: Improved indentation and guides for better hierarchy visualization

### `sidebar-optimization.json`
Dedicated configuration for advanced sidebar features:

#### Pinned Directories
High-priority directories with custom labels and icons:
- 🔮 **Astrological Calculations** (`src/calculations`) - Auto-expanded
- 📊 **Data Sources** (`src/data`) - Ingredient and astrological data
- ⚡ **Campaign System** (`src/services/campaign`) - Code quality automation
- 🧩 **Components** (`src/components`) - React components
- 🎯 **Kiro Configuration** (`.kiro`) - Auto-expanded for easy access
- 🌐 **App Routes** (`src/app`) - Next.js routing
- 📝 **Type Definitions** (`src/types`) - TypeScript types
- 🛠️ **Utilities** (`src/utils`) - Helper functions

#### Folder Icons
Contextual icons for better visual navigation:
- Astrological folders: 🔮, ⭐, 🌟, 🪐
- Data folders: 📊, 🥬, 📖, 🍽️
- Development folders: 🧩, 🔧, 🛠️, 📝
- System folders: 🎯, ⚙️, 🧭, 📋

#### Smart Expansion
- Auto-expand on focus for priority directories
- Remember expansion state across sessions
- Configurable expansion depth (default: 2 levels)
- Priority-based expansion for key directories

#### Quick Access Shortcuts
Keyboard shortcuts for instant navigation:
- `Cmd+Shift+C` - Astrological calculations
- `Cmd+Shift+D` - Data sources
- `Cmd+Shift+K` - Kiro configuration
- `Cmd+Shift+S` - Campaign system
- `Cmd+Shift+T` - Type definitions

#### Contextual Actions
Directory-specific actions based on file patterns:
- **Calculations**: Run tests, validate positions, check harmony
- **Data**: Validate integrity, update dates, check properties
- **Campaign**: Run analysis, check metrics, view reports
- **Kiro**: Validate config, test connections, run hooks

## File Associations

Enhanced file type recognition:
- `.astrological` → TypeScript (astrological calculation files)
- `.elemental` → JSON (elemental property data)
- `.planetary` → JSON (planetary position data)
- `.culinary` → TypeScript (culinary astrology files)
- `.campaign` → TypeScript (campaign system files)
- `.spec.md` → Markdown (specification files)
- `.steering.md` → Markdown (steering files)
- `.hook.md` → Markdown (agent hook files)

## Explorer Enhancements

### File Nesting Patterns
Intelligent grouping of related files:
- TypeScript files with their compiled outputs and maps
- Configuration files with their related files
- Package files with lock files
- Environment files with type definitions

### Visual Improvements
- **Decorations**: Colors and badges for file status
- **Sorting**: Mixed sorting with uppercase precedence
- **Open Editors**: Visible list of 10 recent files
- **Auto-reveal**: Smart focus without disruptive scrolling

### Tree Navigation
- **Indent Guides**: Always visible for better hierarchy understanding
- **Single-click Expansion**: Faster navigation
- **Smooth Scrolling**: Enhanced user experience
- **Fast Scroll**: Optimized for large directory structures

## Integration with Astrological Workflow

The sidebar optimization is specifically designed for the WhatToEatNext project's unique structure:

1. **Priority Access**: Most-used directories (calculations, data, campaign) are easily accessible
2. **Visual Context**: Icons provide immediate context for different types of files
3. **Smart Expansion**: Auto-expand critical directories while keeping others collapsed
4. **Contextual Actions**: Directory-specific actions for common development tasks
5. **File Type Recognition**: Enhanced support for astrological and campaign file types

## Usage Guidelines

### Daily Development Workflow
1. Use pinned directories for quick navigation to key areas
2. Leverage keyboard shortcuts for instant access to common directories
3. Utilize contextual actions for directory-specific operations
4. Take advantage of smart expansion to focus on relevant areas

### File Organization Best Practices
1. Follow the established directory structure for optimal sidebar experience
2. Use appropriate file extensions for enhanced type recognition
3. Organize related files to benefit from nesting patterns
4. Maintain consistent naming conventions for better sorting

### Customization
The `sidebar-optimization.json` file can be modified to:
- Add new pinned directories
- Customize folder icons
- Adjust expansion behavior
- Add new keyboard shortcuts
- Define additional contextual actions

This configuration creates an optimized development environment specifically tailored for astrological food recommendation development with intelligent automation support.