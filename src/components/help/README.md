# Interactive Help and Contextual Assistance System

This directory contains the comprehensive interactive help system for the
WhatToEatNext project, providing contextual assistance, code suggestions,
templates, and guided workflows specifically designed for astrological
development.

## Components Overview

### Core Components

#### `ContextualHelp.tsx`

- **Tooltip**: Contextual tooltips with positioning and delay options
- **HelpOverlay**: Modal overlays for detailed help content
- Features keyboard navigation, accessibility support, and portal rendering

#### `AstrologicalCodeSuggestions.tsx`

- Intelligent code suggestions for astrological patterns
- Follows established casing conventions (Fire/Water/Earth/Air, lowercase zodiac
  signs)
- Categorized suggestions with search and filtering
- Code insertion capabilities

#### `CodeTemplates.tsx`

- Complete code templates for components, services, hooks, and tests
- Placeholder replacement system for customization
- Template preview and validation
- Dependency tracking and documentation

#### `GuidedWorkflows.tsx`

- Step-by-step workflows for complex development tasks
- Progress tracking and completion validation
- Interactive tutorials with code examples
- Difficulty levels and time estimates

#### `InteractiveHelpSystem.tsx`

- Main help system orchestrator
- Tabbed interface with keyboard shortcuts (F1, Ctrl+H)
- Context-aware help filtering
- Integration with all help components

### Utility Components

#### `HelpSystemDemo.tsx`

- Demonstration of help system features
- Integration examples and usage patterns
- Live code insertion demonstration

## Features

### 1. Contextual Tooltips and Help Overlays

```tsx
import { Tooltip, HelpOverlay } from '@/components/help';

// Contextual tooltip
<Tooltip
  content="Use proper capitalization: Fire, Water, Earth, Air"
  trigger={<button>Elemental Properties</button>}
  position="top"
  delay={500}
/>

// Help overlay
<HelpOverlay
  isOpen={showHelp}
  onClose={() => setShowHelp(false)}
  title="Astrological Calculations"
>
  <div>Detailed help content...</div>
</HelpOverlay>
```

### 2. Intelligent Code Suggestions

The system provides context-aware code suggestions following established
conventions:

- **Elemental Properties**: Proper capitalization (Fire, Water, Earth, Air)
- **Zodiac Signs**: Lowercase convention (aries, taurus, gemini, etc.)
- **Planetary Names**: Capitalized (Sun, Moon, Mercury, Venus, etc.)
- **Cuisine Types**: Proper capitalization (Italian, Mexican, Middle-Eastern)
- **Dietary Restrictions**: Capitalized with hyphens (Vegetarian, Gluten-Free)

### 3. Domain-Specific Code Templates

Available templates include:

#### Astrological React Component

```tsx
// Template with placeholder replacement
interface {{COMPONENT_NAME}}Props {
  {{PROP_NAME}}: {{PROP_TYPE}};
  onElementalChange?: (elements: ElementalProperties) => void;
}
```

#### Astrological Service Class

```tsx
// Service template with caching and fallbacks
export class {{SERVICE_NAME}} {
  async {{METHOD_NAME}}({{PARAMETERS}}): Promise<{{RETURN_TYPE}}> {
    // Implementation with proper error handling
  }
}
```

#### Astrological React Hook

```tsx
// Hook template with state management
export function {{HOOK_NAME}}(
  {{PARAMETERS}},
  options: {{HOOK_NAME}}Options = {}
): {{HOOK_NAME}}Result {
  // Implementation with context integration
}
```

#### Astrological Test Suite

```tsx
// Test template with proper validation
describe('{{FUNCTION_NAME}}', () => {
  test('follows self-reinforcement principle', () => {
    // Test implementation with mock data
  });
});
```

### 4. Guided Workflows for Complex Tasks

#### Available Workflows

1. **Creating Astrological Components**
   - Context setup and integration
   - Elemental state management
   - Influence calculations
   - Component rendering and styling

2. **Campaign System Integration**
   - Understanding campaign architecture
   - Error threshold monitoring
   - Campaign execution and monitoring
   - Result handling and validation

3. **Testing Astrological Calculations**
   - Mock data setup
   - Elemental calculation testing
   - Planetary position validation
   - Performance requirement testing

## Usage Patterns

### Basic Integration

```tsx
import { InteractiveHelpSystem } from '@/components/help';

function MyComponent() {
  const handleCodeInsert = (code: string) => {
    // Handle code insertion into editor
    console.log('Inserting code:', code);
  };

  return (
    <div>
      {/* Your component content */}
      <InteractiveHelpSystem onCodeInsert={handleCodeInsert} />
    </div>
  );
}
```

### Contextual Help Hook

```tsx
import { useContextualHelp } from '@/components/help';

function AstrologicalComponent() {
  const { helpItems } = useContextualHelp('astrological-component');

  // helpItems will be filtered for astrological context
  return (
    <div>
      {/* Component with contextual help */}
    </div>
  );
}
```

### Tooltip Integration

```tsx
import { Tooltip } from '@/components/help';

function ElementalDisplay({ elements }: { elements: ElementalProperties }) {
  return (
    <div>
      {Object.entries(elements).map(([element, value]) => (
        <Tooltip
          key={element}
          content={`${element} element: ${value.toFixed(2)}`}
          trigger={
            <div className={`element-${element.toLowerCase()}`}>
              {element}: {value}
            </div>
          }
        />
      ))}
    </div>
  );
}
```

## Keyboard Shortcuts

- **F1** or **Ctrl+H**: Toggle help system
- **Esc**: Close help overlays
- **Tab**: Navigate through help interface
- **Enter**: Activate focused help item

## Casing Conventions Integration

The help system enforces and teaches the established casing conventions:

### ✅ Correct Usage

```typescript
// Elements: Capitalized
interface ElementalProperties {
  Fire: number;
  Water: number;
  Earth: number;
  Air: number;
}

// Zodiac signs: lowercase
type ZodiacSign = 'aries' | 'taurus' | 'gemini';

// Planets: Capitalized
const positions = {
  Sun: { sign: 'aries', degree: 15 },
  Moon: { sign: 'cancer', degree: 10 }
};
```

### ❌ Incorrect Usage

```typescript
// Don't use lowercase elements
{ fire: 0.8, water: 0.2 }

// Don't capitalize zodiac signs
{ sign: 'Aries', degree: 15 }
```

## Campaign System Integration

The help system provides guidance for working with the automated code quality
campaign system:

- **Current Status**: 2566 TypeScript errors → target 0
- **Safety Protocols**: Git stash, build validation, rollback mechanisms
- **Commands**: `make phase-status`, `make errors-detail`, `make build`
- **Success Rate**: Proven 90→0 TS2820 error elimination

## Performance Considerations

- **Lazy Loading**: Help content loaded on demand
- **Caching**: Code suggestions and templates cached
- **Portal Rendering**: Overlays rendered outside component tree
- **Keyboard Navigation**: Efficient keyboard-only operation
- **Accessibility**: Full screen reader and keyboard support

## Testing

The help system includes comprehensive testing:

```bash
# Run help system tests
npm test src/components/help

# Test specific components
npm test src/components/help/ContextualHelp.test.tsx
npm test src/components/help/AstrologicalCodeSuggestions.test.tsx
```

## Integration with Kiro

This help system is designed to integrate with Kiro's development environment:

- **Context Awareness**: Adapts to current file and project context
- **Code Insertion**: Direct integration with editor for code insertion
- **Workflow Guidance**: Step-by-step assistance for complex tasks
- **Error Prevention**: Proactive guidance to prevent common issues

## Future Enhancements

- **AI-Powered Suggestions**: Context-aware code completion
- **Interactive Tutorials**: Hands-on learning experiences
- **Performance Monitoring**: Help usage analytics and optimization
- **Custom Workflows**: User-defined workflow creation
- **Integration Expansion**: Additional tool and service integrations

## References

- [Astrological Calculation Guidelines](../../.kiro/steering/astrology-rules.md)
- [Elemental Principles](../../.kiro/steering/elemental-principles.md)
- [Campaign Integration](../../.kiro/steering/campaign-integration.md)
- [Project Structure](../../.kiro/steering/structure.md)
- [Technology Stack](../../.kiro/steering/tech.md)
