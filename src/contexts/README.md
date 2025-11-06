# Contexts Architecture

This directory contains all the React contexts used in the application. Each
context is structured in a consistent way to make them easier to use and
maintain.

## Directory Structure

Each context follows the same structure:

```
ContextName/
├── types.ts        # Type definitions
├── context.tsx     # Context creation and default values
├── provider.tsx    # Provider implementation
├── hooks.ts        # Hooks for accessing the context
├── index.ts        # Re-exports everything
└── server.ts       # (Optional) Server-safe exports
```

## Available Contexts

- **AlchemicalContext**: Manages astrological and alchemical state
- **ChartContext**: Manages astrological chart data
- **TarotContext**: Manages tarot card state and influences
- **ThemeContext**: Manages light/dark theme
- **PopupContext**: Manages application popups and modals

## Usage

```typescript
// Import the hook from the context
import { useAlchemical } from "@/contexts/AlchemicalContext";
import { useChart } from "@/contexts/ChartContext";
import { useTarotContext } from "@/contexts/TarotContext";
import { useTheme } from "@/contexts/ThemeContext";

// Use the hook in your component
function MyComponent() {
  const { state } = useAlchemical();
  const { chart } = useChart();
  const { tarotCard } = useTarotContext();
  const { theme, setTheme } = useTheme();

  // ...
}
```

## Server Components

For server components, use the server-safe exports:

```typescript
import { serverExports } from "@/contexts";

// Use server-safe functions
const season = serverExports.alchemical.getCurrentSeason();
```
