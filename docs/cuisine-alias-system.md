# Cuisine Alias System

## Overview

The Cuisine Alias System unifies regional cuisines under broader ethnic categories to provide consistent cuisine type handling across the application. This system ensures that regional variants like "Sichuanese" and "Cantonese" are properly categorized under their primary cuisine type "Chinese".

## Key Components

### 1. Primary Cuisine Types

These are the main ethnic cuisine categories that regional cuisines map to:

```typescript
type PrimaryCuisineType = 
  | 'Chinese'
  | 'Japanese' 
  | 'Korean'
  | 'Indian'
  | 'Thai'
  | 'Vietnamese'
  | 'Italian'
  | 'French'
  | 'Greek'
  | 'Spanish'
  | 'Mexican'
  | 'American'
  | 'African'
  | 'Middle-Eastern'
  | 'Mediterranean'
  | 'Russian'
  | 'Fusion';
```

### 2. Regional Cuisine Aliases

The system maps regional cuisines to their primary ethnic category:

```typescript
const CUISINE_ALIASES: Record<string, PrimaryCuisineType> = {
  // Chinese Regional Cuisines
  'sichuanese': 'Chinese',
  'cantonese': 'Chinese', 
  'shanghainese': 'Chinese',
  'hunanese': 'Chinese',
  'northern': 'Chinese',
  'sichuan': 'Chinese',
  'canton': 'Chinese',
  'shanghai': 'Chinese',
  'hunan': 'Chinese',
  
  // Additional regional variants for other cuisines...
};
```

## Core Functions

### `standardizeCuisine(cuisineName: string): PrimaryCuisineType`

Resolves any cuisine name to its standardized primary cuisine type.

```typescript
standardizeCuisine('sichuanese') // Returns 'Chinese'
standardizeCuisine('cantonese')  // Returns 'Chinese'
standardizeCuisine('Chinese')    // Returns 'Chinese'
```

### `getCuisineVariants(primaryCuisine: PrimaryCuisineType): string[]`

Gets all regional cuisines that map to a primary cuisine type.

```typescript
getCuisineVariants('Chinese') 
// Returns ['sichuanese', 'cantonese', 'shanghainese', 'hunanese', ...]
```

### `areCuisinesRelated(cuisine1: string, cuisine2: string): boolean`

Checks if two cuisine names belong to the same primary cuisine type.

```typescript
areCuisinesRelated('sichuanese', 'cantonese') // Returns true
areCuisinesRelated('sichuanese', 'Italian')   // Returns false
```

### `getCuisineDisplayName(cuisineName: string): string`

Gets a display name for a cuisine, showing both regional and primary if applicable.

```typescript
getCuisineDisplayName('sichuanese') // Returns 'Sichuanese (Chinese)'
getCuisineDisplayName('Chinese')    // Returns 'Chinese'
```

## Implementation Details

### Type Safety

The system maintains full TypeScript type safety:

```typescript
import type { PrimaryCuisineType, AllCuisineTypes } from '@/types/cuisineAliases';

// All cuisine types are properly typed
export type CuisineType = PrimaryCuisineType;
```

### Backward Compatibility

The system maintains backward compatibility with existing code:

- Existing cuisine references continue to work
- Regional cuisines are automatically resolved to primary types
- Display names show both regional and primary information

### Integration Points

The system integrates with:

1. **Cuisine Data Files**: Regional cuisines include `alias` properties
2. **Flavor Profiles**: Regional variants map to primary cuisines
3. **Recipe Recommendations**: Unified cuisine handling
4. **UI Components**: Consistent cuisine display

## Usage Examples

### Basic Cuisine Resolution

```typescript
import { standardizeCuisine } from '@/utils/cuisineResolver';

// Resolve regional cuisines to primary types
const primaryCuisine = standardizeCuisine('sichuanese'); // 'Chinese'
const displayName = getCuisineDisplayName('sichuanese'); // 'Sichuanese (Chinese)'
```

### Cuisine Grouping

```typescript
import { groupCuisinesByType } from '@/utils/cuisineResolver';

const cuisines = ['sichuanese', 'cantonese', 'Italian', 'shanghainese'];
const groups = groupCuisinesByType(cuisines);

// Result:
// {
//   Chinese: ['sichuanese', 'cantonese', 'shanghainese'],
//   Italian: ['Italian']
// }
```

### Recipe Recommendations

```typescript
import { areCuisinesRelated } from '@/utils/cuisineResolver';

// Check if recipes are from related cuisines
const isRelated = areCuisinesRelated(recipe1.cuisine, recipe2.cuisine);
```

## Benefits

### 1. Consistency
- All regional variants are properly categorized
- Consistent cuisine type handling across the application
- Unified recommendation system

### 2. User Experience
- Clear cuisine categorization
- Intuitive cuisine selection
- Proper cuisine relationships

### 3. Maintainability
- Centralized cuisine type management
- Easy to add new regional variants
- Type-safe cuisine handling

### 4. Scalability
- Extensible for new cuisines
- Support for complex regional hierarchies
- Flexible mapping system

## Migration Guide

### For Existing Code

1. **Update Imports**: Import from the new alias system
```typescript
// Old
import type { CuisineType } from '@/types/alchemy';

// New
import type { PrimaryCuisineType } from '@/types/cuisineAliases';
```

2. **Use Resolver Functions**: Use the new resolver utilities
```typescript
// Old
const cuisine = 'sichuanese';

// New
import { standardizeCuisine } from '@/utils/cuisineResolver';
const cuisine = standardizeCuisine('sichuanese'); // Returns 'Chinese'
```

3. **Update Display Logic**: Use display name functions
```typescript
// Old
const displayName = cuisine;

// New
import { getCuisineDisplayName } from '@/utils/cuisineResolver';
const displayName = getCuisineDisplayName(cuisine); // Returns 'Sichuanese (Chinese)'
```

### For New Code

1. **Always Use Primary Types**: Use primary cuisine types for internal logic
2. **Use Resolver Functions**: Use resolver functions for any cuisine name input
3. **Display Regional Names**: Use display name functions for UI

## Testing

The system includes comprehensive tests in `src/utils/cuisineResolver.test.ts`:

```bash
# Run cuisine resolver tests
yarn test cuisineResolver.test.ts
```

## Future Enhancements

### Planned Features

1. **Dynamic Alias Loading**: Load cuisine aliases from external sources
2. **Cultural Context**: Add cultural context information for regional variants
3. **Seasonal Variations**: Support seasonal cuisine variations
4. **Dietary Preferences**: Cuisine-specific dietary information

### Extension Points

1. **New Regional Variants**: Easy to add new regional cuisine mappings
2. **Custom Aliases**: Support for custom cuisine alias definitions
3. **Hierarchical Relationships**: Support for complex cuisine hierarchies
4. **Localization**: Multi-language cuisine name support

## Troubleshooting

### Common Issues

1. **Unknown Cuisine Types**: Use `isSupportedCuisine()` to validate
2. **Case Sensitivity**: The system handles case variations automatically
3. **Missing Aliases**: Add new aliases to `CUISINE_ALIASES` mapping

### Debug Tools

```typescript
import { 
  standardizeCuisine,
  isSupportedCuisine,
  getCuisineSuggestions 
} from '@/utils/cuisineResolver';

// Check if cuisine is supported
console.log(isSupportedCuisine('unknown-cuisine')); // false

// Get suggestions for partial names
console.log(getCuisineSuggestions('sich')); // ['sichuanese', ...]
```

## Conclusion

The Cuisine Alias System provides a robust, type-safe, and user-friendly way to handle regional cuisine variants while maintaining consistency across the application. It successfully unifies regional cuisines like Sichuanese and Cantonese under their primary Chinese cuisine type, improving the overall user experience and system maintainability. 