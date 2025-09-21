# Kiro Optimization Complete Configuration Guide

## Overview

This guide provides comprehensive documentation for the fully optimized Kiro
workspace configuration for the WhatToEatNext project. The optimization
transforms Kiro into a specialized development environment that understands
astrological calculations, elemental principles, and campaign systems.

## Table of Contents

1. [Configuration Overview](#configuration-overview)
2. [Steering Files System](#steering-files-system)
3. [Agent Hooks Automation](#agent-hooks-automation)
4. [MCP Server Integration](#mcp-server-integration)
5. [Workspace Settings](#workspace-settings)
6. [Spec Templates](#spec-templates)
7. [Validation and Testing](#validation-and-testing)
8. [Troubleshooting](#troubleshooting)
9. [Maintenance Procedures](#maintenance-procedures)

## Configuration Overview

### Architecture Summary

The Kiro optimization follows a layered architecture:

```
Kiro Workspace Configuration
├── Steering Intelligence Layer
│   ├── Product vision and workflows
│   ├── Project structure documentation
│   ├── Technology stack guidance
│   ├── Astrological calculation rules
│   ├── Elemental principles enforcement
│   └── Campaign system integration
├── Automation Layer
│   ├── Planetary data validation hooks
│   ├── Ingredient consistency checkers
│   ├── TypeScript campaign triggers
│   └── Build quality monitoring
├── Integration Layer
│   ├── Astrological API connections
│   ├── Nutritional database access
│   ├── Recipe API integration
│   └── Fallback mechanisms
└── Development Experience Layer
    ├── TypeScript optimizations
    ├── React development enhancements
    ├── Astrological syntax highlighting
    └── Performance monitoring
```

### Key Benefits

- **Contextual Intelligence**: Kiro understands the project's unique
  astrological domain
- **Automated Quality**: Hooks maintain code quality and data accuracy
  automatically
- **External Integration**: Seamless access to astrological and nutritional APIs
- **Optimized Workflows**: Enhanced development experience for
  TypeScript/React/Astrology

## Steering Files System

### Core Steering Files

#### 1. Product Vision (`product.md`)

- **Purpose**: Defines the mission of bridging astrological wisdom with modern
  AI
- **Key Content**:
  - Core workflows for astrological meal planning
  - Elemental harmony principles
  - Success metrics and KPIs
  - The 14 Alchemical Pillars
- **Usage**: Always included for contextual understanding

#### 2. Project Structure (`structure.md`)

- **Purpose**: Comprehensive guide to the project's architecture
- **Key Content**:
  - Directory organization and patterns
  - Component architecture with astrological context
  - Service layer documentation
  - Campaign system integration
- **Usage**: Always included for navigation assistance

#### 3. Technology Stack (`tech.md`)

- **Purpose**: Complete technology documentation
- **Key Content**:
  - Next.js 15.3.4 with App Router
  - React 19.1.0 with concurrent features
  - TypeScript 5.1.6 configuration
  - Specialized astrological libraries
  - Campaign system infrastructure
- **Usage**: Always included for technical guidance

#### 4. Astrological Rules (`astrology-rules.md`)

- **Purpose**: Guidelines for astronomical calculations
- **Key Content**:
  - Planetary position system hierarchy
  - Transit date validation requirements
  - Fallback mechanisms (March 28, 2025 positions)
  - Error handling standards
  - Testing approaches
- **Usage**: Always included for calculation accuracy

#### 5. Elemental Principles (`elemental-principles.md`)

- **Purpose**: Four-element system enforcement
- **Key Content**:
  - Self-reinforcement principles
  - Compatibility matrix (0.7+ minimum, 0.9+ same-element)
  - Prohibited anti-patterns
  - Implementation guidelines
  - Validation functions
- **Usage**: Always included for elemental consistency

#### 6. Campaign Integration (`campaign-integration.md`)

- **Purpose**: Campaign system patterns and integration
- **Key Content**:
  - Error threshold management
  - Automation triggers
  - Quality metrics tracking
  - Safety protocols
  - Kiro integration patterns
- **Usage**: Always included for campaign coordination

### File Reference System

Steering files can reference other project files using:

```markdown
#[[file:relative/path/to/file.ts]]
```

This allows steering files to include relevant code examples and configurations
directly.

## Agent Hooks Automation

### Hook Configuration Structure

All hooks use YAML front matter configuration:

```yaml
---
name: 'Hook Name'
triggers:
  - file_change: 'path/pattern'
  - condition: 'threshold'
scope: 'operation-scope'
approval: auto|manual
rollback: git_stash|file_backup
priority: high|medium|low
timeout: 300
---
```

### Available Hooks

#### 1. Planetary Data Validator

- **Triggers**: Changes to `src/data/planets/*.ts`,
  `src/calculations/culinary/*.ts`
- **Actions**:
  - Validates transit dates against astronomical data
  - Checks position consistency
  - Runs astronomical tests
  - Updates fallback positions
- **Safety**: Automatic approval with git stash rollback

#### 2. Ingredient Consistency Checker

- **Triggers**: Changes to `src/data/ingredients/**/*.ts`,
  `src/constants/elemental*.ts`
- **Actions**:
  - Validates elemental properties
  - Checks compatibility scores
  - Verifies alchemical mappings
  - Runs ingredient tests
- **Safety**: Automatic approval with file backup rollback

#### 3. TypeScript Campaign Trigger

- **Triggers**: TypeScript errors > 4500, build failures
- **Actions**:
  - Analyzes error distribution
  - Triggers campaign system
  - Creates fix recommendations
  - Schedules batch processing
- **Safety**: Manual approval with campaign stash rollback

#### 4. Build Quality Monitor

- **Triggers**: Performance degradation, memory usage spikes
- **Actions**:
  - Monitors build performance
  - Tracks memory usage
  - Generates quality reports
  - Triggers alerts
- **Safety**: Automatic responses to critical issues

## MCP Server Integration

### Server Configuration

The MCP configuration (`.kiro/settings/mcp.json`) includes:

```json
{
  "mcpServers": {
    "astrology-api": {
      "command": "uvx",
      "args": ["astrology-mcp-server@latest"],
      "env": {
        "API_TIMEOUT": "5000",
        "FALLBACK_MODE": "local"
      },
      "disabled": false,
      "autoApprove": ["get_planetary_positions", "get_lunar_phase"]
    },
    "nutrition-api": {
      "command": "uvx",
      "args": ["nutrition-mcp-server@latest"],
      "env": {
        "USDA_API_KEY": "${USDA_API_KEY}",
        "CACHE_DURATION": "3600"
      },
      "disabled": false,
      "autoApprove": ["get_nutritional_data", "search_ingredients"]
    },
    "spoonacular-api": {
      "command": "uvx",
      "args": ["spoonacular-mcp-server@latest"],
      "env": {
        "SPOONACULAR_API_KEY": "${SPOONACULAR_API_KEY}",
        "RATE_LIMIT": "150/day"
      },
      "disabled": false,
      "autoApprove": ["get_recipe_data", "search_recipes"]
    }
  }
}
```

### Fallback Strategy

Multi-tier fallback system:

1. **Primary API** → 2. **Cache** → 3. **Local Data** → 4. **Hardcoded
   Fallback**

### Credential Management

- Environment variables for API keys
- Secure storage in system keychain
- Automatic credential rotation support

## Workspace Settings

### Core Optimizations

The workspace settings (`.kiro/settings/workspace.json`) include:

```json
{
  "typescript.preferences.includePackageJsonAutoImports": "on",
  "typescript.suggest.autoImports": true,
  "typescript.preferences.importModuleSpecifier": "relative",
  "typescript.inlayHints.parameterNames.enabled": "all",
  "typescript.inlayHints.variableTypes.enabled": true,
  "typescript.inlayHints.functionLikeReturnTypes.enabled": true,

  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true
  },

  "files.associations": {
    "*.astro": "typescript",
    "*.alchm": "typescript"
  },

  "search.exclude": {
    "**/node_modules": true,
    "**/.next": true,
    "**/dist": true,
    "**/*.log": true,
    "**/metrics": true
  }
}
```

### Extension Recommendations

Essential extensions for optimal development:

- TypeScript and React support
- Tailwind CSS IntelliSense
- ESLint and Prettier integration
- Path IntelliSense
- Auto Rename Tag
- Jest testing support

## Spec Templates

### Available Templates

#### 1. Feature Spec Template (`feature-spec-template.md`)

- Standard EARS-format acceptance criteria
- Requirement gathering sections
- Design documentation templates
- Task breakdown structures

#### 2. Astrological Feature Template (`astrological-feature-template.md`)

- Specialized for astrological features
- Astronomical considerations
- Elemental factors
- Planetary timing requirements
- Performance criteria for calculations

#### 3. Campaign Spec Template (`campaign-spec-template.md`)

- Code improvement campaigns
- Error analysis documentation
- Fix strategy templates
- Progress tracking metrics
- Integration with existing systems

### Template Usage

1. Copy template to new spec directory
2. Customize for specific feature
3. Follow EARS format for acceptance criteria
4. Include astrological considerations where relevant
5. Reference existing systems and patterns

## Validation and Testing

### Validation Tools

#### 1. Complete Configuration Validator

```bash
node .kiro/validation/complete-config-validator.cjs
```

- Validates all steering files
- Checks agent hook configurations
- Verifies MCP server setup
- Confirms workspace settings

#### 2. Workflow Tester

```bash
node .kiro/validation/workflow-tester.cjs
```

- Tests spec creation workflows
- Validates campaign integration
- Checks documentation completeness
- Verifies monitoring systems

#### 3. Comprehensive Test Suite

```bash
node .kiro/validation/comprehensive-test-suite.cjs
```

- Configuration tests
- Integration tests
- Performance benchmarks
- Regression tests

### Continuous Validation

- Run validation before major deployments
- Schedule weekly automated runs
- Monitor performance benchmarks
- Update test cases for new features

## Troubleshooting

### Common Issues

#### 1. Steering Files Not Loading

**Symptoms**: Kiro doesn't understand project context **Solutions**:

- Check file paths in `.kiro/steering/`
- Verify YAML front matter syntax
- Ensure file references use correct syntax
- Restart Kiro to reload configurations

#### 2. Agent Hooks Not Triggering

**Symptoms**: Automated validations not running **Solutions**:

- Verify hook YAML front matter
- Check file path patterns in triggers
- Ensure Kiro has file system permissions
- Review hook execution logs

#### 3. MCP Server Connection Issues

**Symptoms**: External API calls failing **Solutions**:

- Check MCP server configuration
- Verify API credentials in environment
- Test fallback mechanisms
- Review server logs for errors

#### 4. Performance Issues

**Symptoms**: Slow TypeScript compilation or linting **Solutions**:

- Run performance benchmarks
- Check for large file exclusions
- Optimize TypeScript configuration
- Review campaign system load

### Debug Commands

```bash
# Validate complete configuration
node .kiro/validation/complete-config-validator.cjs

# Test specific workflows
node .kiro/validation/workflow-tester.cjs

# Run performance benchmarks
node .kiro/validation/comprehensive-test-suite.cjs

# Check TypeScript errors
npx tsc --noEmit --skipLibCheck

# Validate linting configuration
npx eslint --config eslint.config.cjs src --max-warnings=10000
```

## Maintenance Procedures

### Weekly Maintenance

1. **Configuration Validation**

   ```bash
   node .kiro/validation/complete-config-validator.cjs
   ```

2. **Performance Monitoring**

   ```bash
   node .kiro/validation/comprehensive-test-suite.cjs
   ```

3. **Update Check**
   - Review steering file accuracy
   - Update astrological data if needed
   - Check for new MCP server versions

### Monthly Maintenance

1. **Comprehensive Review**
   - Validate all configurations
   - Update documentation
   - Review and update templates
   - Analyze performance trends

2. **Data Updates**
   - Update planetary transit dates
   - Refresh fallback positions
   - Update ingredient databases
   - Review API rate limits

3. **System Optimization**
   - Analyze performance benchmarks
   - Optimize slow operations
   - Update dependencies
   - Review security settings

### Quarterly Maintenance

1. **Full System Audit**
   - Complete configuration review
   - Security audit of API credentials
   - Performance optimization review
   - Documentation updates

2. **Feature Updates**
   - Evaluate new Kiro features
   - Update templates and workflows
   - Enhance automation capabilities
   - Improve integration patterns

### Emergency Procedures

#### Configuration Corruption

1. Stop all active operations
2. Restore from backup configurations
3. Run validation suite
4. Gradually re-enable features

#### Performance Degradation

1. Run performance benchmarks
2. Identify bottlenecks
3. Implement temporary optimizations
4. Schedule comprehensive review

#### API Failures

1. Verify fallback mechanisms
2. Check credential validity
3. Test alternative data sources
4. Update error handling

## Best Practices

### Development Workflow

1. **Before Starting Work**
   - Run configuration validator
   - Check agent hook status
   - Verify MCP server connections

2. **During Development**
   - Use spec templates for new features
   - Follow elemental principles
   - Leverage steering file guidance
   - Monitor automated validations

3. **Before Committing**
   - Run comprehensive test suite
   - Validate configuration changes
   - Check performance benchmarks
   - Review automated feedback

### Configuration Management

1. **Version Control**
   - Track all configuration changes
   - Document modification reasons
   - Test changes in isolation
   - Maintain rollback procedures

2. **Documentation**
   - Keep steering files current
   - Update templates regularly
   - Document custom configurations
   - Maintain troubleshooting guides

3. **Monitoring**
   - Regular validation runs
   - Performance trend analysis
   - Error pattern monitoring
   - User feedback collection

## Support and Resources

### Internal Resources

- `.kiro/steering/` - Contextual guidance files
- `.kiro/validation/` - Testing and validation tools
- `.kiro/templates/` - Spec and feature templates
- `.kiro/docs/` - Comprehensive documentation

### External Resources

- Kiro official documentation
- MCP server documentation
- Astrological calculation libraries
- Campaign system guides

### Getting Help

1. **Configuration Issues**: Run validation tools first
2. **Performance Problems**: Check benchmark results
3. **Integration Failures**: Review MCP server logs
4. **Development Questions**: Consult steering files

This guide provides the foundation for maintaining and optimizing the Kiro
workspace configuration. Regular maintenance and monitoring ensure continued
effectiveness and reliability.
