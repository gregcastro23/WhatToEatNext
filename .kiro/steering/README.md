# Kiro Steering Files

This directory contains steering files that provide contextual intelligence to Kiro about the WhatToEatNext project's unique architecture and domain knowledge.

## File Organization

### Core Steering Files
- `product.md` - Product vision, mission, and core workflows
- `structure.md` - Project architecture and directory organization
- `tech.md` - Technology stack and development tools documentation

### Domain-Specific Steering Files
- `astrology-rules.md` - Astrological calculation guidelines and principles
- `elemental-principles.md` - Four-element system rules and enforcement
- `campaign-integration.md` - Campaign system patterns and integration

## Inclusion Patterns

### Always Included (Default)
All steering files are included by default to provide comprehensive context.

### Conditional Inclusion
Files can be conditionally included based on file patterns by adding front-matter:
```yaml
---
inclusion: fileMatch
fileMatchPattern: 'src/calculations/**'
---
```

### Manual Inclusion
Files can be manually included via context keys by adding front-matter:
```yaml
---
inclusion: manual
contextKey: 'astrology'
---
```

## File References

Steering files can reference other project files using the syntax:
```markdown
#[[file:relative/path/to/file.ts]]
```

This allows steering files to include relevant code examples, configurations, or documentation directly in their context.

## Naming Conventions

- Use kebab-case for file names (e.g., `astrology-rules.md`)
- Use descriptive names that clearly indicate the file's purpose
- Group related concepts in single files rather than fragmenting
- Keep file names concise but meaningful