# 🎯 Kiro Setup and Configuration Guide

This comprehensive guide will walk you through setting up Kiro for optimal development with the WhatToEatNext project, leveraging all the specialized configurations and intelligent features.

## 📋 Prerequisites

### Required Software
- **Kiro IDE**: Latest version with MCP support
- **Node.js**: Version 20.18.0 or higher
- **Git**: For version control
- **Python**: For MCP servers (with uv/uvx)

### Recommended Knowledge
- Basic familiarity with TypeScript/React development
- Understanding of IDE configuration concepts
- Optional: Basic astrological concepts (will be explained)

## 🚀 Step 1: Initial Kiro Installation and Setup

### 1.1 Install Kiro
```bash
# Download and install Kiro from official website
# Follow platform-specific installation instructions
```

### 1.2 Open WhatToEatNext Project
```bash
# Clone the repository if you haven't already
git clone https://github.com/your-org/WhatToEatNext.git
cd WhatToEatNext

# Open in Kiro
kiro .
# Or use File > Open Folder in Kiro
```

### 1.3 Verify Project Structure
Ensure you see these key directories:
- `.kiro/` - Kiro-specific configurations
- `src/` - Source code
- `docs/` - Documentation
- `mcp-servers/` - MCP server configurations

## 🧠 Step 2: Understanding Kiro's Intelligent Features

### 2.1 Steering Files System
Kiro uses steering files to understand your project's unique context:

**Location**: `.kiro/steering/`

**Key Files**:
- `product.md` - Product vision and workflows
- `structure.md` - Project architecture guide  
- `tech.md` - Technology stack documentation
- `astrology-rules.md` - Astrological calculation guidelines
- `elemental-principles.md` - Four-element system rules
- `campaign-integration.md` - Campaign system patterns

**How They Work**:
- Automatically included in Kiro's context
- Provide domain-specific knowledge
- Guide code suggestions and analysis

### 2.2 Agent Hooks System
Automated tasks that trigger on file changes:

**Location**: `.kiro/hooks/`

**Available Hooks**:
- `planetary-data-validator.md` - Validates astrological data
- `ingredient-consistency-checker.md` - Checks elemental properties
- `typescript-campaign-trigger.md` - Triggers error cleanup
- `build-quality-monitor.md` - Monitors performance

### 2.3 MCP Integration
External API connections with fallback mechanisms:

**Location**: `.kiro/settings/mcp.json`

**Configured Servers**:
- Astrology API server
- Nutrition database server
- Spoonacular recipe API server

## ⚙️ Step 3: Kiro Workspace Configuration

### 3.1 Verify Workspace Settings
Check `.kiro/settings/workspace.json`:

```json
{
  "typescript.preferences.includePackageJsonAutoImports": "on",
  "typescript.suggest.autoImports": true,
  "typescript.inlayHints.parameterNames.enabled": "all",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true
  },
  "files.associations": {
    "*.astro": "typescript",
    "*.alchm": "typescript"
  }
}
```

### 3.2 Install Recommended Extensions
Kiro should prompt you to install recommended extensions. If not, check `.kiro/settings/extensions.json` and install:

- TypeScript and JavaScript Language Features
- Tailwind CSS IntelliSense
- Prettier - Code formatter
- ESLint
- Auto Rename Tag
- Path Intellisense

### 3.3 Configure Language Settings
Verify TypeScript settings in `.kiro/settings/typescript.json`:

```json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "typescript.inlayHints.variableTypes.enabled": true,
  "typescript.inlayHints.functionLikeReturnTypes.enabled": true,
  "typescript.workspaceSymbols.scope": "allOpenProjects"
}
```

## 🔌 Step 4: MCP Server Setup

### 4.1 Install Python Dependencies
```bash
# Install uv (Python package manager)
curl -LsSf https://astral.sh/uv/install.sh | sh

# Verify installation
uv --version
uvx --version
```

### 4.2 Configure MCP Servers
The MCP configuration is already set up in `.kiro/settings/mcp.json`. Verify the configuration:

```json
{
  "mcpServers": {
    "astrology-server": {
      "command": "uvx",
      "args": ["mcp-servers/astrology-server.py"],
      "env": {
        "FASTMCP_LOG_LEVEL": "ERROR"
      },
      "disabled": false,
      "autoApprove": ["get_planetary_positions", "get_lunar_phase"]
    },
    "nutrition-server": {
      "command": "uvx", 
      "args": ["mcp-servers/nutrition-server.py"],
      "env": {
        "CACHE_DURATION": "3600"
      },
      "disabled": false,
      "autoApprove": ["get_nutritional_data", "search_ingredients"]
    },
    "spoonacular-server": {
      "command": "uvx",
      "args": ["mcp-servers/spoonacular-server.py"],
      "env": {
        "RATE_LIMIT": "150/day"
      },
      "disabled": false,
      "autoApprove": ["get_recipe_data", "search_recipes"]
    }
  }
}
```

### 4.3 Test MCP Connections
1. Open Kiro's MCP panel (View > MCP Servers)
2. Verify all servers show as "Connected"
3. Test a simple call like getting planetary positions
4. Check fallback mechanisms work when APIs are unavailable

## 🎣 Step 5: Agent Hooks Configuration

### 5.1 Enable Agent Hooks
1. Open Kiro's Agent Hooks panel (View > Agent Hooks)
2. Verify all hooks are enabled:
   - Planetary Data Validator
   - Ingredient Consistency Checker
   - TypeScript Campaign Trigger
   - Build Quality Monitor

### 5.2 Test Hook Functionality
**Test Planetary Data Validator**:
1. Open `src/data/planets/mars.ts`
2. Make a small change to transit dates
3. Save the file
4. Verify the hook triggers and validates the data

**Test Ingredient Consistency Checker**:
1. Open any file in `src/data/ingredients/`
2. Modify elemental properties
3. Save and verify validation runs

**Test TypeScript Campaign Trigger**:
1. Introduce a TypeScript error
2. Save multiple files with errors
3. Verify campaign system activates when threshold is reached

## 📊 Step 6: Understanding the Campaign System

### 6.1 Campaign System Overview
The project includes an advanced automated code quality improvement system:

**Key Components**:
- `CampaignController.ts` - Orchestrates campaigns
- `ProgressTracker.ts` - Tracks metrics
- `SafetyProtocol.ts` - Ensures safe operations
- Various analyzers and fixers

**Current Status**:
- TypeScript errors reduced from 4,310 to <100
- 92%+ fix success rate
- Comprehensive safety protocols

### 6.2 Monitor Campaign Activity
1. Open the Campaign Dashboard in Kiro
2. View real-time metrics:
   - Current TypeScript error count
   - Linting warning count
   - Build performance metrics
   - Campaign progress

### 6.3 Manual Campaign Execution
```bash
# Run TypeScript error reduction campaign
npm run campaign:typescript

# Run linting improvement campaign  
npm run campaign:lint

# Run performance optimization campaign
npm run campaign:performance
```

## 🧪 Step 7: Development Workflow Integration

### 7.1 Optimal File Organization
Kiro is configured to understand the project structure:

```
src/
├── app/                    # Next.js App Router
├── calculations/           # Astrological computations
│   ├── culinary/          # Food-specific calculations
│   └── core/              # Core astronomical math
├── data/                  # Databases and reference data
│   ├── ingredients/       # Ingredient databases
│   ├── planets/           # Planetary data
│   └── recipes/           # Recipe collections
├── components/            # React components
├── services/              # Business logic
│   └── campaign/          # Quality improvement system
├── utils/                 # Utility functions
└── types/                 # TypeScript definitions
```

### 7.2 Intelligent Code Assistance
Kiro provides enhanced assistance for:

**Astrological Calculations**:
- Auto-completion for planetary positions
- Validation of transit dates
- Elemental property suggestions

**React Components**:
- Context provider integration
- Astrological state management
- Elemental design patterns

**TypeScript Development**:
- Domain-specific type suggestions
- Import optimization
- Error prevention

### 7.3 Quality Assurance Integration
Kiro automatically:
- Runs TypeScript checks on save
- Fixes ESLint issues
- Organizes imports
- Validates astrological data
- Triggers campaigns when needed

## 🔍 Step 8: Testing Your Setup

### 8.1 Basic Functionality Test
```bash
# Install dependencies
yarn install

# Run development server
npm run dev

# In another terminal, run tests
npm test

# Check TypeScript compilation
npm run type-check

# Run linting
npm run lint
```

### 8.2 Kiro-Specific Tests
1. **Steering Files**: Ask Kiro about the project architecture - it should understand the four-element system
2. **Agent Hooks**: Modify a planetary data file and verify validation runs
3. **MCP Integration**: Try getting current planetary positions through Kiro
4. **Campaign System**: Check the campaign dashboard for current metrics

### 8.3 Astrological Feature Test
1. Open `src/app/astrologize-demo/page.tsx`
2. Modify the astrological calculation
3. Verify Kiro provides relevant suggestions
4. Check that elemental principles are enforced

## 🎯 Step 9: Customizing Your Kiro Experience

### 9.1 Personal Preferences
Customize these settings in Kiro preferences:

**Editor Settings**:
- Font size and family
- Color theme (consider elemental themes)
- Indentation preferences

**TypeScript Settings**:
- Error reporting level
- Auto-import preferences
- IntelliSense behavior

**File Explorer**:
- Pin frequently used directories
- Customize folder icons
- Set up quick access shortcuts

### 9.2 Workspace-Specific Customizations
Create `.kiro/settings/personal.json` for personal settings:

```json
{
  "workbench.colorTheme": "Elemental Dark",
  "editor.fontSize": 14,
  "explorer.compactFolders": false,
  "files.exclude": {
    "**/node_modules": true,
    "**/.next": true,
    "**/dist": true
  }
}
```

### 9.3 Custom Snippets
Create custom code snippets for common patterns:

**Astrological Calculation Snippet**:
```json
{
  "Astrological Calculation": {
    "prefix": "astro-calc",
    "body": [
      "async function calculate${1:Feature}() {",
      "  try {",
      "    const positions = await getReliablePlanetaryPositions();",
      "    // ${2:Your calculation here}",
      "    return ${3:result};",
      "  } catch (error) {",
      "    logger.error('${1:Feature} calculation failed', error);",
      "    return ${4:fallback};",
      "  }",
      "}"
    ],
    "description": "Template for astrological calculations with error handling"
  }
}
```

## 🚨 Step 10: Troubleshooting Common Issues

### 10.1 MCP Server Connection Issues
**Problem**: MCP servers show as disconnected

**Solutions**:
1. Verify Python/uv installation: `uvx --version`
2. Check server logs in Kiro's MCP panel
3. Restart MCP servers from the panel
4. Verify environment variables are set

### 10.2 Agent Hooks Not Triggering
**Problem**: File changes don't trigger hooks

**Solutions**:
1. Check Agent Hooks panel for errors
2. Verify file patterns match hook configurations
3. Restart Kiro to reload hook configurations
4. Check file permissions

### 10.3 TypeScript Errors in Kiro
**Problem**: Kiro shows TypeScript errors that don't appear in terminal

**Solutions**:
1. Restart TypeScript language server in Kiro
2. Clear TypeScript cache: `rm -rf .tsbuildinfo`
3. Verify tsconfig.json is properly configured
4. Check for conflicting TypeScript versions

### 10.4 Campaign System Issues
**Problem**: Campaigns don't run or fail

**Solutions**:
1. Check campaign logs in the dashboard
2. Verify git working directory is clean
3. Ensure sufficient disk space
4. Check Node.js version compatibility

### 10.5 Performance Issues
**Problem**: Kiro runs slowly with the project

**Solutions**:
1. Exclude large directories in settings
2. Disable unused extensions
3. Increase memory allocation for Kiro
4. Use file watchers efficiently

## 🎉 Step 11: Advanced Features

### 11.1 Spec-Driven Development
Use Kiro's spec system for complex features:

1. Create specs in `.kiro/specs/`
2. Use templates from `.kiro/templates/`
3. Follow the iterative workflow:
   - Requirements → Design → Tasks → Implementation

### 11.2 Custom Steering Files
Create project-specific steering files:

```markdown
---
inclusion: fileMatch
fileMatchPattern: 'src/calculations/**'
---

# Custom Calculation Guidelines

When working with astrological calculations:
- Always validate planetary positions
- Use fallback mechanisms
- Follow elemental principles
- Include comprehensive error handling
```

### 11.3 Integration with External Tools
Connect Kiro with:
- Git hooks for quality gates
- CI/CD pipelines for automated testing
- External monitoring tools
- Documentation generators

## 📚 Next Steps

### Immediate Actions
1. ✅ Complete this setup guide
2. ✅ Test all Kiro features
3. ✅ Familiarize yourself with steering files
4. ✅ Try the campaign system

### Short-term Goals
1. Customize Kiro to your preferences
2. Create your first feature using Kiro's assistance
3. Contribute to the project using Kiro's workflows
4. Explore advanced features like spec-driven development

### Long-term Mastery
1. Create custom steering files for your work areas
2. Develop custom agent hooks for specific needs
3. Integrate Kiro with your broader development workflow
4. Contribute improvements to the Kiro configuration

## 🤝 Getting Help

### Resources
- **Documentation**: This guide and related docs
- **Community**: Project discussions and forums
- **Issue Tracker**: Report Kiro-specific issues
- **Code Review**: Learn from others' Kiro usage

### Common Questions
- **Q**: How do I add new MCP servers?
  **A**: Edit `.kiro/settings/mcp.json` and restart Kiro

- **Q**: Can I disable certain agent hooks?
  **A**: Yes, set `disabled: true` in the hook configuration

- **Q**: How do I create custom steering files?
  **A**: Add `.md` files to `.kiro/steering/` with appropriate front-matter

- **Q**: What if the campaign system makes unwanted changes?
  **A**: All campaigns have rollback mechanisms - check the safety protocols

---

**Congratulations! You now have a fully configured Kiro environment optimized for WhatToEatNext development.** 🌟

*This setup leverages Kiro's intelligent features to provide contextual assistance, automated quality improvement, and seamless integration with the project's unique astrological domain.*