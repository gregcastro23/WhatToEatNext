# Command Palette and Shortcuts Configuration

This document describes the comprehensive command palette and keyboard shortcuts system implemented for the WhatToEatNext project in Kiro.

## Configuration Files

### `workspace.json` - Keyboard Shortcuts Integration
Enhanced workspace settings with:
- **Command Palette History**: 50 recent commands preserved
- **Input Preservation**: Maintains search terms across sessions
- **Quick Open Enhancements**: Improved focus behavior and input preservation
- **Keyboard Dispatch**: Optimized key code handling for macOS

### `command-palette-shortcuts.json` - Custom Commands System
Comprehensive command definitions organized by category:

## Command Categories

### 🔮 Astrology Commands
**Purpose**: Astrological calculations and cosmic analysis

| Command | Shortcut | Description |
|---------|----------|-------------|
| Calculate Current Positions | `Cmd+Alt+P` | Get real-time planetary positions |
| Validate Transit Dates | `Cmd+Alt+T` | Check transit date accuracy |
| Check Elemental Harmony | `Cmd+Alt+E` | Analyze ingredient elemental balance |
| Generate Recommendations | `Cmd+Alt+R` | Create cosmic food recommendations |
| Test Calculations | `Cmd+Alt+Shift+T` | Run astrological test suite |

### ⚡ Campaign Commands
**Purpose**: Code quality improvement campaigns

| Command | Shortcut | Description |
|---------|----------|-------------|
| Analyze TypeScript Errors | `Cmd+Shift+E` | Review current error distribution |
| Run Error Reduction | `Cmd+Shift+R` | Execute error cleanup campaign |
| Check Progress | `Cmd+Shift+P` | View campaign metrics |
| Validate Safety | `Cmd+Shift+S` | Check safety protocols |
| Emergency Stop | `Cmd+Shift+Alt+S` | Emergency campaign halt |
| View Metrics | `Cmd+Shift+M` | Display quality metrics |

### 📋 Spec Management Commands
**Purpose**: Specification creation and management

| Command | Shortcut | Description |
|---------|----------|-------------|
| Create Feature Spec | `Cmd+Alt+N` | New feature specification |
| Create Astrological Spec | `Cmd+Alt+A` | Astrological feature spec |
| Create Campaign Spec | `Cmd+Alt+C` | Campaign specification |
| Validate All Specs | `Cmd+Alt+V` | Check spec completeness |
| List Pending Tasks | `Cmd+Alt+L` | Show all pending tasks |
| Generate Report | `Cmd+Alt+G` | Create progress report |

### 🔌 MCP Server Commands
**Purpose**: MCP server management and testing

| Command | Shortcut | Description |
|---------|----------|-------------|
| Test Connections | `Cmd+M+T` | Test all MCP servers |
| Restart Servers | `Cmd+M+R` | Restart MCP connections |
| Test Astrology MCP | `Cmd+M+A` | Test astrology server |
| Test Nutrition MCP | `Cmd+M+N` | Test nutrition server |
| Test Spoonacular MCP | `Cmd+M+S` | Test recipe server |
| View Logs | `Cmd+M+L` | Display MCP logs |
| Clear Cache | `Cmd+M+C` | Reset MCP caches |

### 🛠️ Development Commands
**Purpose**: Development tools and build operations

| Command | Shortcut | Description |
|---------|----------|-------------|
| Run All Tests | `Cmd+T` | Complete test suite |
| Lint and Fix | `Cmd+L` | ESLint with auto-fix |
| Type Check | `Cmd+Shift+T` | TypeScript validation |
| Build Project | `Cmd+B` | Next.js build |
| Start Dev Server | `Cmd+D` | Development server |
| Clean Build | `Cmd+Shift+C` | Clean and rebuild |

### 🐛 Debug Commands
**Purpose**: Debugging and diagnostic tools

| Command | Shortcut | Description |
|---------|----------|-------------|
| Show Astrological Debug | `Cmd+Alt+D` | Debug info display |
| Check Performance | `Cmd+Alt+M` | Performance metrics |
| Validate Data | `Cmd+Alt+V` | Data integrity check |
| Clear Caches | `Cmd+Alt+Shift+C` | Reset all caches |

## Quick Action Panels

### Quick Astrology Panel (`Cmd+Shift+A`)
Instant access to:
- Current planetary positions
- Elemental harmony analysis
- Recommendation generation

### Quick Campaign Panel (`Cmd+Shift+Q`)
Instant access to:
- Error analysis
- Progress checking
- Metrics viewing

### Quick MCP Panel (`Cmd+Shift+M`)
Instant access to:
- Connection testing
- Server status checks
- Service validation

## Context Menu Enhancements

### Astrological Files (`src/calculations/**/*.ts`)
- 🔮 Test Astrological Function
- ⭐ Validate Calculations

### Data Files (`src/data/**/*.ts`)
- 📊 Validate Data Structure
- 🔄 Update Transit Dates

### Campaign Files (`src/services/campaign/**/*.ts`)
- ⚡ Run Campaign Test
- 📊 Analyze Metrics

### Specification Files (`.kiro/specs/**/*.md`)
- 📋 Validate Spec
- 📝 Execute Next Task

## Command Palette Customization

### Enhanced Features
- **Recently Used**: 20 command history
- **Category Grouping**: Organized by functional area
- **Shortcut Display**: Visible keyboard shortcuts
- **Fuzzy Matching**: Intelligent search
- **Priority Ordering**: Most relevant commands first

### Category Priorities
1. **Astrology** (🔮) - Core domain functionality
2. **Campaign** (⚡) - Quality improvement
3. **Specs** (📋) - Project management
4. **MCP** (🔌) - External integrations
5. **Development** (🛠️) - Build tools
6. **Debug** (🐛) - Diagnostics

## Keyboard Shortcut Patterns

### Modifier Key Conventions
- **`Cmd+Alt+`** - Astrology and spec operations
- **`Cmd+Shift+`** - Campaign and development operations
- **`Cmd+M+`** - MCP server operations
- **Function Keys** - Build and development shortcuts

### Context-Aware Shortcuts
All shortcuts are context-aware and activate when:
- Editor has text focus
- Not in debug mode (for build shortcuts)
- Appropriate file types are open

## Integration with Astrological Workflow

### Domain-Specific Commands
Commands are tailored for astrological development:
- **Planetary Position Calculations** - Real-time cosmic data
- **Elemental Harmony Analysis** - Four-element system validation
- **Transit Date Validation** - Astronomical accuracy checks
- **Recommendation Generation** - AI-powered cosmic suggestions

### Campaign System Integration
Seamless integration with code quality campaigns:
- **Error Analysis** - TypeScript error categorization
- **Progress Tracking** - Real-time metrics monitoring
- **Safety Protocols** - Automated rollback mechanisms
- **Quality Metrics** - Comprehensive reporting

### MCP Server Management
Complete MCP server lifecycle management:
- **Connection Testing** - Validate all external services
- **Server Restart** - Fresh connection establishment
- **Service-Specific Testing** - Individual server validation
- **Cache Management** - Performance optimization

## Usage Guidelines

### Daily Development Workflow
1. **Start with Quick Panels** - Use `Cmd+Shift+A/Q/M` for common tasks
2. **Leverage Shortcuts** - Memorize frequently used command shortcuts
3. **Use Command Palette** - `Cmd+Shift+P` for less common operations
4. **Context Menus** - Right-click for file-specific actions

### Astrological Development
1. **Begin with Positions** - `Cmd+Alt+P` for current cosmic state
2. **Validate Calculations** - `Cmd+Alt+T` for transit accuracy
3. **Check Harmony** - `Cmd+Alt+E` for elemental balance
4. **Generate Recommendations** - `Cmd+Alt+R` for final output

### Campaign Operations
1. **Analyze First** - `Cmd+Shift+E` to understand current state
2. **Check Progress** - `Cmd+Shift+P` for ongoing campaigns
3. **Run Campaigns** - `Cmd+Shift+R` for error reduction
4. **Monitor Safety** - `Cmd+Shift+S` for protocol validation

### MCP Management
1. **Test Connections** - `Cmd+M+T` for overall health
2. **Service-Specific Tests** - `Cmd+M+A/N/S` for individual servers
3. **View Logs** - `Cmd+M+L` for troubleshooting
4. **Clear Cache** - `Cmd+M+C` for performance issues

## Customization and Extension

### Adding New Commands
1. Define command in `command-palette-shortcuts.json`
2. Add keyboard shortcut to workspace settings
3. Implement command handler in appropriate service
4. Update context menu if applicable

### Modifying Shortcuts
1. Update `keybindings` array in workspace settings
2. Ensure no conflicts with existing shortcuts
3. Follow modifier key conventions
4. Test in appropriate contexts

### Category Management
1. Add new categories to `commandPaletteCustomization`
2. Assign appropriate icons and priorities
3. Group related commands logically
4. Update documentation

This command palette and shortcuts system creates a powerful, efficient development environment specifically optimized for astrological food recommendation development with comprehensive automation support.