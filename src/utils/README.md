# Centralized Logging Module

This directory contains a centralized logging module (`logger.ts`) that provides standardized logging across the application. The logger supports component-specific prefixing, log levels, and environment-aware logging.

## Basic Usage

### Direct Utility Functions

For quick logging needs, import the utility functions:

```typescript
import { debugLog, infoLog, warnLog, errorLog } from '@/utils/logger';

// Basic usage
debugLog('This is a debug message');
infoLog('This is an info message');
warnLog('This is a warning message');
errorLog('This is an error message');

// With additional data
debugLog('Processing data:', { id: 123, name: 'Example' });
```

### Component-Specific Logging

For component-specific logging with automatic prefixing:

```typescript
import { createLogger } from '@/utils/logger';

// Create a logger for your component
const logger = createLogger('MyComponent');

// Use the component logger
logger.debug('Component initialized');
logger.info('Processing data', { count: 5 });
logger.warn('Something might be wrong');
logger.error('Operation failed', new Error('Detailed error'));
```

## Benefits

1. **Consistent Formatting**: All logs follow the same format with timestamps and component prefixes.
2. **Environment-Aware**: Debug logs only appear in development environments.
3. **Component Identification**: Easily identify which component generated each log message.
4. **Error Tracking**: All errors are stored and can be retrieved for reporting.
5. **Centralized Configuration**: Change logging behavior in one place.

## Log Levels

- **debug**: Detailed information, only shown in development.
- **info**: General information about application flow.
- **warn**: Warning situations that should be addressed.
- **error**: Error conditions requiring attention.

## Best Practices

1. **Be Descriptive**: Include enough context in log messages to understand what happened.
2. **Use Appropriate Levels**: Don't use error for non-error conditions.
3. **Structure Additional Data**: When logging objects, make them easy to read.
4. **Include One Logger Per File**: Create one logger per component/module.
5. **Avoid Sensitive Information**: Never log passwords, tokens, or PII.

## Example Integration

```typescript
// In a React component
import { createLogger } from '@/utils/logger';
import { useState, useEffect } from 'react';

const logger = createLogger('UserProfile');

const UserProfile = ({ userId }) => {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    async function fetchUser() {
      try {
        logger.debug(`Fetching user data for ID: ${userId}`);
        const response = await api.getUser(userId);
        logger.info('User data retrieved successfully');
        setUser(response.data);
      } catch (error) {
        logger.error('Failed to load user data', error);
      }
    }
    
    fetchUser();
  }, [userId]);
  
  // Rest of component...
};
``` 