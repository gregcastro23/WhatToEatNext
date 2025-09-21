# Kiro Spec-Driven Development Templates

This directory contains comprehensive templates for creating feature specifications within the WhatToEatNext project. These templates support the spec-driven development workflow and ensure consistency across all feature development.

## Available Templates

### 1. Standard Feature Specification Template
**File**: `feature-spec-template.md`

A comprehensive template for general feature specifications that includes:
- EARS-format acceptance criteria
- Requirement gathering and design documentation sections
- Task breakdown and implementation planning templates
- Template variables and customization options
- Risk assessment and success criteria

**Use for**: General features, UI components, API integrations, and standard functionality.

### 2. Astrological Feature Specification Template
**File**: `astrological-feature-template.md`

A specialized template for astrological features that includes:
- Astronomical considerations and planetary timing requirements
- Elemental factors and four-element system integration
- Seasonal adaptation and cosmic timing requirements
- Performance and reliability criteria specific to astrological calculations
- Cultural sensitivity and respectful integration guidelines

**Use for**: Planetary calculations, elemental harmony features, seasonal adaptations, and cosmic timing functionality.

### 3. Campaign Specification Template
**File**: `campaign-spec-template.md`

A template for code improvement campaigns that includes:
- Error analysis and fix strategy documentation sections
- Progress tracking and success metrics templates
- Integration points with existing campaign systems
- Safety protocols and rollback mechanisms
- Comprehensive testing and validation procedures

**Use for**: TypeScript error reduction campaigns, linting improvements, performance optimizations, and automated code quality initiatives.

## Template Usage Instructions

### Getting Started
1. **Choose the appropriate template** based on your feature type
2. **Copy the template** to your spec directory (e.g., `.kiro/specs/your-feature-name/`)
3. **Rename the file** to match your feature (e.g., `requirements.md`, `design.md`, `tasks.md`)
4. **Replace all placeholder text** with feature-specific content
5. **Customize sections** based on your specific requirements

### Template Variables
All templates include customizable variables marked with `{{VARIABLE_NAME}}`:
- Replace these with actual values for your feature
- Remove unused variables and sections
- Add additional sections as needed for your specific use case

### EARS Format Requirements
All templates use EARS (Easy Approach to Requirements Syntax) format for acceptance criteria:
- **WHEN** [trigger condition] **THEN** [system] **SHALL** [expected response]
- **IF** [precondition] **THEN** [system] **SHALL** [required action]
- Ensure all acceptance criteria follow this format for consistency

## Template Customization

### Adding New Sections
- Follow the existing structure and formatting
- Use consistent heading levels and organization
- Include relevant template variables for reusability
- Add appropriate references to related documentation

### Modifying Existing Sections
- Maintain the core structure while adapting content
- Preserve EARS format for acceptance criteria
- Keep integration points with existing systems
- Update template variables as needed

### Creating New Templates
- Use existing templates as a foundation
- Follow the established patterns and conventions
- Include comprehensive customization options
- Add appropriate documentation and usage instructions

## Integration with Kiro Workflow

### Spec Creation Workflow
1. **Requirements Phase**: Use template to create comprehensive requirements
2. **Design Phase**: Expand template with detailed design documentation
3. **Implementation Phase**: Convert requirements into actionable tasks
4. **Validation Phase**: Use success criteria for feature validation

### Template Variables Integration
Templates integrate with Kiro's variable system:
- Variables can be automatically populated based on context
- Custom variables can be defined for specific project needs
- Template expansion can be automated through Kiro commands

### Quality Assurance
- All templates include comprehensive testing strategies
- Success criteria are clearly defined and measurable
- Risk assessment and mitigation strategies are included
- Integration points with existing systems are documented

## Best Practices

### Template Selection
- **Standard Template**: For general features and UI components
- **Astrological Template**: For any feature involving planetary calculations or elemental systems
- **Campaign Template**: For automated code improvement initiatives

### Content Development
- Be specific and detailed in requirement descriptions
- Use concrete, measurable acceptance criteria
- Include comprehensive error handling and edge cases
- Consider cultural sensitivity and accessibility throughout

### Maintenance and Updates
- Keep templates updated with project evolution
- Incorporate lessons learned from completed features
- Maintain consistency across all template versions
- Regular review and improvement of template effectiveness

## Template Validation

### Completeness Checklist
- [ ] All placeholder text replaced with specific content
- [ ] EARS format used consistently for acceptance criteria
- [ ] Integration points with existing systems documented
- [ ] Success criteria are specific and measurable
- [ ] Risk assessment includes mitigation strategies
- [ ] Testing strategy is comprehensive and appropriate

### Quality Review
- [ ] Requirements are clear and unambiguous
- [ ] Design considerations are thorough and practical
- [ ] Implementation plan is detailed and actionable
- [ ] Dependencies and prerequisites are identified
- [ ] Documentation references are accurate and current

## Support and Resources

### Getting Help
- Review existing specifications in `.kiro/specs/` for examples
- Consult steering files in `.kiro/steering/` for domain guidance
- Reference project documentation in `docs/` for context
- Use Kiro's built-in help and guidance features

### Additional Resources
- **Project Architecture**: `.kiro/steering/structure.md`
- **Technology Stack**: `.kiro/steering/tech.md`
- **Astrological Guidelines**: `.kiro/steering/astrology-rules.md`
- **Elemental Principles**: `.kiro/steering/elemental-principles.md`
- **Campaign Integration**: `.kiro/steering/campaign-integration.md`

---

**Last Updated**: [Date]  
**Template Version**: 1.0  
**Maintained by**: Kiro Optimization Team