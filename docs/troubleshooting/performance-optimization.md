# ⚡ Performance Optimization Guide

This guide provides comprehensive performance optimization strategies for the WhatToEatNext project, focusing on astrological calculations, React components, and overall system performance.

## 🎯 Performance Targets

### Key Performance Indicators (KPIs)
```typescript
interface PerformanceTargets {
  astrologicalCalculations: 2000;    // < 2 seconds
  apiResponseTime: 5000;             // < 5 seconds
  pageLoadTime: 3000;                // < 3 seconds
  bundleSize: 5 * 1024 * 1024;      // < 5MB
  cacheHitRate: 0.8;                 // > 80%
  memoryUsage: 100 * 1024 * 1024;   // < 100MB
  buildTime: 30000;                  // < 30 seconds
}
```

### Performance Monitoring Setup
```bash
# Install performance monitoring tools
npm install --save-dev webpack-bundle-analyzer
npm install --save-dev @next/bundle-analyzer

# Run performance analysis
npm run analyze:bundle
npm run analyze:performance
npm run profile:memory
```

## 🌟 Astrological Calculation Optimization

### Calculation Caching Strategy

#### Intelligent Caching Implementation
```typescript
// Astronomical data caching with appropriate TTL
class AstronomicalCache {
  private cache = new Map<string, CacheEntry>();
  private readonly TTL = {
    planetaryPositions: 6 * 60 * 60 * 1000,  // 6 hours
    lunarPhase: 1 * 60 * 60 * 1000,          // 1 hour
    transitDates: 24 * 60 * 60 * 1000,       // 24 hours
    elementalCalculations: 30 * 60 * 1000     // 30 minutes
  };
  
  async get<T>(key: string, calculator: () => Promise<T>, ttl: number): Promise<T> {
    const cached = this.cache.get(key);
    
    if (cached && Date.now() - cached.timestamp < ttl) {
      console.log(`Cache hit for ${key}`);
      return cached.data as T;
    }
    
    console.log(`Cache miss for ${key}, calculating...`);
    const startTime = performance.now();
    
    try {
      const data = await calculator();
      const calculationTime = performance.now() - startTime;
      
      this.cache.set(key, {
        data,
        timestamp: Date.now(),
        calculationTime
      });
      
      console.log(`Calculated ${key} in ${calculationTime.toFixed(2)}ms`);
      return data;
    } catch (error) {
      console.error(`Failed to calculate ${key}:`, error);
      throw error;
    }
  }
  
  // Cache statistics for monitoring
  getStatistics() {
    const entries = Array.from(this.cache.values());
    const totalEntries = entries.length;
    const averageAge = entries.reduce((sum, entry) => 
      sum + (Date.now() - entry.timestamp), 0) / totalEntries;
    
    return {
      totalEntries,
      averageAge: averageAge / 1000 / 60, // minutes
      hitRate: this.calculateHitRate()
    };
  }
  
  private calculateHitRate(): number {
    // Implementation depends on hit/miss tracking
    return 0.85; // Placeholder
  }
}

// Usage example
const astronomicalCache = new AstronomicalCache();

async function getOptimizedPlanetaryPositions(date: Date = new Date()) {
  const cacheKey = `planetary-positions-${date.toISOString().split('T')[0]}`;
  
  return await astronomicalCache.get(
    cacheKey,
    () => calculatePlanetaryPositions(date),
    astronomicalCache.TTL.planetaryPositions
  );
}
```

#### Memoization for Expensive Calculations
```typescript
// Memoize elemental compatibility calculations
const memoizedElementalCompatibility = useMemo(() => {
  return (source: ElementalProperties, target: ElementalProperties) => {
    const cacheKey = `${JSON.stringify(source)}-${JSON.stringify(target)}`;
    
    if (compatibilityCache.has(cacheKey)) {
      return compatibilityCache.get(cacheKey);
    }
    
    const compatibility = calculateElementalCompatibility(source, target);
    compatibilityCache.set(cacheKey, compatibility);
    
    return compatibility;
  };
}, []);

// Memoize ingredient recommendations
const memoizedIngredientRecommendations = useMemo(() => {
  console.log('Recalculating ingredient recommendations...');
  return calculateIngredientRecommendations(
    planetaryPositions,
    userPreferences,
    seasonalFactors
  );
}, [planetaryPositions, userPreferences, seasonalFactors]);
```

### Batch Processing Optimization

#### Batch Astrological Calculations
```typescript
// Process multiple calculations in batches
class BatchAstrologicalProcessor {
  private batchSize = 10;
  private processingQueue: Array<{
    calculation: () => Promise<any>;
    resolve: (value: any) => void;
    reject: (error: any) => void;
  }> = [];
  
  async addCalculation<T>(calculation: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.processingQueue.push({ calculation, resolve, reject });
      this.processBatch();
    });
  }
  
  private async processBatch() {
    if (this.processingQueue.length === 0) return;
    
    const batch = this.processingQueue.splice(0, this.batchSize);
    
    console.log(`Processing batch of ${batch.length} calculations...`);
    
    const promises = batch.map(async (item) => {
      try {
        const result = await item.calculation();
        item.resolve(result);
      } catch (error) {
        item.reject(error);
      }
    });
    
    await Promise.all(promises);
    
    // Process next batch if queue has items
    if (this.processingQueue.length > 0) {
      setTimeout(() => this.processBatch(), 10);
    }
  }
}

// Usage
const batchProcessor = new BatchAstrologicalProcessor();

async function getOptimizedRecommendations(ingredients: Ingredient[]) {
  const calculations = ingredients.map(ingredient => 
    () => calculateIngredientCompatibility(ingredient, currentPlanetaryState)
  );
  
  const results = await Promise.all(
    calculations.map(calc => batchProcessor.addCalculation(calc))
  );
  
  return results;
}
```

## ⚛️ React Component Optimization

### Component Memoization

#### Smart Component Memoization
```typescript
// Memoize expensive astrological components
const AstrologyChart = React.memo(({ planetaryPositions, userChart }) => {
  const chartData = useMemo(() => {
    console.log('Recalculating chart data...');
    return generateChartData(planetaryPositions, userChart);
  }, [planetaryPositions, userChart]);
  
  return (
    <div className="astrology-chart">
      <ChartRenderer data={chartData} />
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison for planetary positions
  return (
    deepEqual(prevProps.planetaryPositions, nextProps.planetaryPositions) &&
    deepEqual(prevProps.userChart, nextProps.userChart)
  );
});

// Memoize elemental display components
const ElementalDisplay = React.memo(({ elementalProperties }) => {
  const dominantElement = useMemo(() => {
    return getDominantElement(elementalProperties);
  }, [elementalProperties]);
  
  const compatibilityScores = useMemo(() => {
    return calculateAllCompatibilityScores(elementalProperties);
  }, [elementalProperties]);
  
  return (
    <div className="elemental-display">
      <DominantElementIndicator element={dominantElement} />
      <CompatibilityMatrix scores={compatibilityScores} />
    </div>
  );
});
```

#### Context Optimization
```typescript
// Optimize astrological context to prevent unnecessary re-renders
const AstrologicalContext = createContext<AstrologicalState | null>(null);

export const AstrologicalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [planetaryPositions, setPlanetaryPositions] = useState<PlanetaryPositions | null>(null);
  const [lunarPhase, setLunarPhase] = useState<LunarPhase | null>(null);
  
  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    planetaryPositions,
    lunarPhase,
    updatePlanetaryPositions: setPlanetaryPositions,
    updateLunarPhase: setLunarPhase
  }), [planetaryPositions, lunarPhase]);
  
  // Update planetary positions every hour
  useEffect(() => {
    const updatePositions = async () => {
      try {
        const positions = await getOptimizedPlanetaryPositions();
        setPlanetaryPositions(positions);
      } catch (error) {
        console.error('Failed to update planetary positions:', error);
      }
    };
    
    updatePositions();
    const interval = setInterval(updatePositions, 60 * 60 * 1000); // 1 hour
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <AstrologicalContext.Provider value={contextValue}>
      {children}
    </AstrologicalContext.Provider>
  );
};

// Optimized hook with selective subscriptions
export const useAstrologicalState = (selector?: (state: AstrologicalState) => any) => {
  const context = useContext(AstrologicalContext);
  
  if (!context) {
    throw new Error('useAstrologicalState must be used within AstrologicalProvider');
  }
  
  // If selector provided, only re-render when selected value changes
  return useMemo(() => {
    return selector ? selector(context) : context;
  }, [context, selector]);
};
```

### Virtual Scrolling for Large Lists

#### Optimized Ingredient Lists
```typescript
// Virtual scrolling for large ingredient lists
import { FixedSizeList as List } from 'react-window';

const VirtualizedIngredientList: React.FC<{
  ingredients: Ingredient[];
  onSelect: (ingredient: Ingredient) => void;
}> = ({ ingredients, onSelect }) => {
  const itemHeight = 80;
  const containerHeight = 400;
  
  const IngredientItem = React.memo(({ index, style }: { index: number; style: React.CSSProperties }) => {
    const ingredient = ingredients[index];
    
    const elementalDisplay = useMemo(() => {
      return <ElementalPropertiesDisplay properties={ingredient.elementalProperties} />;
    }, [ingredient.elementalProperties]);
    
    return (
      <div style={style} className="ingredient-item" onClick={() => onSelect(ingredient)}>
        <h3>{ingredient.name}</h3>
        {elementalDisplay}
      </div>
    );
  });
  
  return (
    <List
      height={containerHeight}
      itemCount={ingredients.length}
      itemSize={itemHeight}
      itemData={ingredients}
    >
      {IngredientItem}
    </List>
  );
};
```

## 🚀 Bundle Size Optimization

### Code Splitting Strategies

#### Dynamic Imports for Astrological Features
```typescript
// Lazy load astrological components
const AstrologyChart = lazy(() => import('./components/AstrologyChart'));
const PlanetaryDisplay = lazy(() => import('./components/PlanetaryDisplay'));
const ElementalCalculator = lazy(() => import('./components/ElementalCalculator'));

// Route-based code splitting
const AstrologicalDemo = lazy(() => import('./pages/AstrologicalDemo'));
const CookingMethodsDemo = lazy(() => import('./pages/CookingMethodsDemo'));

// Feature-based splitting
const AdvancedAstrologyFeatures = lazy(() => 
  import('./features/AdvancedAstrology').then(module => ({
    default: module.AdvancedAstrologyFeatures
  }))
);

// Usage with Suspense
const App: React.FC = () => {
  return (
    <Router>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/astrology" element={<AstrologicalDemo />} />
          <Route path="/cooking" element={<CookingMethodsDemo />} />
        </Routes>
      </Suspense>
    </Router>
  );
};
```

#### Library Optimization
```typescript
// Optimize astronomical library imports
// Instead of importing entire library:
// import * as Astronomia from 'astronomia';

// Import only needed functions:
import { julian } from 'astronomia/lib/julian';
import { solar } from 'astronomia/lib/solar';
import { lunar } from 'astronomia/lib/lunar';

// Tree-shake unused utilities
// Use babel-plugin-import or similar for automatic optimization
```

### Webpack Bundle Analysis
```javascript
// next.config.js - Bundle analysis configuration
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer({
  webpack: (config, { isServer }) => {
    // Optimize astronomical libraries
    config.resolve.alias = {
      ...config.resolve.alias,
      'astronomia': 'astronomia/lib',
    };
    
    // Split vendor chunks
    if (!isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          astronomical: {
            test: /[\\/]node_modules[\\/](astronomia|astronomy-engine|suncalc)[\\/]/,
            name: 'astronomical',
            chunks: 'all',
          },
          react: {
            test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
            name: 'react',
            chunks: 'all',
          },
        },
      };
    }
    
    return config;
  },
});
```

## 💾 Memory Management

### Memory Leak Prevention

#### Proper Cleanup in Effects
```typescript
// Prevent memory leaks in astrological calculations
const useAstrologicalUpdates = () => {
  const [positions, setPositions] = useState<PlanetaryPositions | null>(null);
  
  useEffect(() => {
    let isMounted = true;
    const abortController = new AbortController();
    
    const updatePositions = async () => {
      try {
        const newPositions = await getReliablePlanetaryPositions();
        
        // Only update if component is still mounted
        if (isMounted) {
          setPositions(newPositions);
        }
      } catch (error) {
        if (!abortController.signal.aborted) {
          console.error('Failed to update positions:', error);
        }
      }
    };
    
    const interval = setInterval(updatePositions, 60 * 60 * 1000);
    updatePositions(); // Initial update
    
    return () => {
      isMounted = false;
      abortController.abort();
      clearInterval(interval);
    };
  }, []);
  
  return positions;
};

// Cache cleanup to prevent memory growth
class MemoryManagedCache {
  private cache = new Map<string, CacheEntry>();
  private maxSize = 1000;
  private cleanupInterval: NodeJS.Timeout;
  
  constructor() {
    // Clean up old entries every 10 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 10 * 60 * 1000);
  }
  
  set(key: string, value: any, ttl: number) {
    // Remove oldest entries if cache is full
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
    
    this.cache.set(key, {
      data: value,
      timestamp: Date.now(),
      ttl
    });
  }
  
  private cleanup() {
    const now = Date.now();
    const keysToDelete: string[] = [];
    
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => this.cache.delete(key));
    
    console.log(`Cleaned up ${keysToDelete.length} expired cache entries`);
  }
  
  destroy() {
    clearInterval(this.cleanupInterval);
    this.cache.clear();
  }
}
```

### Memory Monitoring
```typescript
// Monitor memory usage in development
class MemoryMonitor {
  private measurements: number[] = [];
  private interval: NodeJS.Timeout;
  
  start() {
    this.interval = setInterval(() => {
      if (typeof window !== 'undefined' && 'performance' in window && 'memory' in performance) {
        const memory = (performance as any).memory;
        const usedMB = memory.usedJSHeapSize / 1024 / 1024;
        
        this.measurements.push(usedMB);
        
        // Keep only last 100 measurements
        if (this.measurements.length > 100) {
          this.measurements.shift();
        }
        
        // Alert if memory usage is high
        if (usedMB > 100) {
          console.warn(`High memory usage: ${usedMB.toFixed(2)}MB`);
        }
      }
    }, 5000); // Check every 5 seconds
  }
  
  stop() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }
  
  getReport() {
    if (this.measurements.length === 0) return null;
    
    const avg = this.measurements.reduce((sum, val) => sum + val, 0) / this.measurements.length;
    const max = Math.max(...this.measurements);
    const current = this.measurements[this.measurements.length - 1];
    
    return {
      current: current.toFixed(2),
      average: avg.toFixed(2),
      maximum: max.toFixed(2),
      trend: this.calculateTrend()
    };
  }
  
  private calculateTrend(): 'increasing' | 'stable' | 'decreasing' {
    if (this.measurements.length < 10) return 'stable';
    
    const recent = this.measurements.slice(-10);
    const older = this.measurements.slice(-20, -10);
    
    const recentAvg = recent.reduce((sum, val) => sum + val, 0) / recent.length;
    const olderAvg = older.reduce((sum, val) => sum + val, 0) / older.length;
    
    const diff = recentAvg - olderAvg;
    
    if (diff > 5) return 'increasing';
    if (diff < -5) return 'decreasing';
    return 'stable';
  }
}
```

## 🌐 API and Network Optimization

### Request Optimization

#### Intelligent Request Batching
```typescript
// Batch multiple API requests
class APIRequestBatcher {
  private batchQueue: Map<string, Array<{
    resolve: (value: any) => void;
    reject: (error: any) => void;
    params: any;
  }>> = new Map();
  
  private batchTimeout: Map<string, NodeJS.Timeout> = new Map();
  private batchDelay = 100; // 100ms batching window
  
  async request<T>(endpoint: string, params: any): Promise<T> {
    return new Promise((resolve, reject) => {
      // Add to batch queue
      if (!this.batchQueue.has(endpoint)) {
        this.batchQueue.set(endpoint, []);
      }
      
      this.batchQueue.get(endpoint)!.push({ resolve, reject, params });
      
      // Set timeout to process batch
      if (!this.batchTimeout.has(endpoint)) {
        const timeout = setTimeout(() => {
          this.processBatch(endpoint);
        }, this.batchDelay);
        
        this.batchTimeout.set(endpoint, timeout);
      }
    });
  }
  
  private async processBatch(endpoint: string) {
    const batch = this.batchQueue.get(endpoint) || [];
    this.batchQueue.delete(endpoint);
    
    const timeout = this.batchTimeout.get(endpoint);
    if (timeout) {
      clearTimeout(timeout);
      this.batchTimeout.delete(endpoint);
    }
    
    if (batch.length === 0) return;
    
    try {
      // Process all requests in batch
      const results = await this.executeBatchRequest(endpoint, batch.map(item => item.params));
      
      // Resolve individual promises
      batch.forEach((item, index) => {
        item.resolve(results[index]);
      });
    } catch (error) {
      // Reject all promises in batch
      batch.forEach(item => {
        item.reject(error);
      });
    }
  }
  
  private async executeBatchRequest(endpoint: string, paramsList: any[]): Promise<any[]> {
    // Implementation depends on API capabilities
    // Some APIs support batch requests, others need individual calls
    
    if (endpoint === 'planetary-positions' && paramsList.length > 1) {
      // Batch planetary position requests for different dates
      return await this.batchPlanetaryPositions(paramsList);
    }
    
    // Fallback to individual requests
    return await Promise.all(
      paramsList.map(params => this.singleRequest(endpoint, params))
    );
  }
  
  private async batchPlanetaryPositions(dateList: Date[]): Promise<PlanetaryPositions[]> {
    // Optimize by requesting positions for multiple dates at once
    const uniqueDates = [...new Set(dateList.map(d => d.toISOString().split('T')[0]))];
    
    const results = await Promise.all(
      uniqueDates.map(date => getReliablePlanetaryPositions(new Date(date)))
    );
    
    // Map results back to original request order
    return dateList.map(date => {
      const dateStr = date.toISOString().split('T')[0];
      const index = uniqueDates.indexOf(dateStr);
      return results[index];
    });
  }
}
```

#### Connection Pooling and Reuse
```typescript
// HTTP connection optimization
class OptimizedHTTPClient {
  private agent: any;
  
  constructor() {
    // Configure HTTP agent for connection reuse
    this.agent = new (require('https').Agent)({
      keepAlive: true,
      maxSockets: 10,
      maxFreeSockets: 5,
      timeout: 5000,
      freeSocketTimeout: 30000
    });
  }
  
  async request(url: string, options: RequestInit = {}): Promise<Response> {
    const optimizedOptions = {
      ...options,
      agent: this.agent,
      headers: {
        'Connection': 'keep-alive',
        'Keep-Alive': 'timeout=30',
        ...options.headers
      }
    };
    
    return fetch(url, optimizedOptions);
  }
}
```

## 📊 Performance Monitoring and Profiling

### Real-time Performance Monitoring
```typescript
// Comprehensive performance monitoring system
class PerformanceMonitoringService {
  private metrics: Map<string, PerformanceMetric[]> = new Map();
  private observers: PerformanceObserver[] = [];
  
  start() {
    // Monitor long tasks
    if ('PerformanceObserver' in window) {
      const longTaskObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 50) {
            console.warn(`Long task detected: ${entry.duration.toFixed(2)}ms`);
            this.recordMetric('long-tasks', {
              duration: entry.duration,
              startTime: entry.startTime,
              name: entry.name
            });
          }
        }
      });
      
      longTaskObserver.observe({ entryTypes: ['longtask'] });
      this.observers.push(longTaskObserver);
    }
    
    // Monitor navigation timing
    this.monitorNavigationTiming();
    
    // Monitor resource loading
    this.monitorResourceTiming();
    
    // Monitor custom metrics
    this.startCustomMetrics();
  }
  
  private monitorNavigationTiming() {
    if ('performance' in window && 'getEntriesByType' in performance) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      if (navigation) {
        const metrics = {
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
          loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
          firstPaint: this.getFirstPaint(),
          firstContentfulPaint: this.getFirstContentfulPaint()
        };
        
        console.log('Navigation Timing:', metrics);
        this.recordMetric('navigation', metrics);
      }
    }
  }
  
  private getFirstPaint(): number {
    const paintEntries = performance.getEntriesByType('paint');
    const firstPaint = paintEntries.find(entry => entry.name === 'first-paint');
    return firstPaint ? firstPaint.startTime : 0;
  }
  
  private getFirstContentfulPaint(): number {
    const paintEntries = performance.getEntriesByType('paint');
    const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint');
    return fcp ? fcp.startTime : 0;
  }
  
  // Custom performance measurement
  measureAsync<T>(name: string, operation: () => Promise<T>): Promise<T> {
    const startTime = performance.now();
    
    return operation().then(
      result => {
        const duration = performance.now() - startTime;
        this.recordMetric(name, { duration, success: true });
        
        if (duration > 2000) {
          console.warn(`Slow operation: ${name} took ${duration.toFixed(2)}ms`);
        }
        
        return result;
      },
      error => {
        const duration = performance.now() - startTime;
        this.recordMetric(name, { duration, success: false, error: error.message });
        throw error;
      }
    );
  }
  
  private recordMetric(category: string, metric: any) {
    if (!this.metrics.has(category)) {
      this.metrics.set(category, []);
    }
    
    const categoryMetrics = this.metrics.get(category)!;
    categoryMetrics.push({
      ...metric,
      timestamp: Date.now()
    });
    
    // Keep only last 1000 metrics per category
    if (categoryMetrics.length > 1000) {
      categoryMetrics.shift();
    }
  }
  
  getPerformanceReport(): PerformanceReport {
    const report: PerformanceReport = {
      timestamp: Date.now(),
      categories: {}
    };
    
    for (const [category, metrics] of this.metrics.entries()) {
      const durations = metrics
        .filter(m => typeof m.duration === 'number')
        .map(m => m.duration);
      
      if (durations.length > 0) {
        report.categories[category] = {
          count: durations.length,
          average: durations.reduce((sum, d) => sum + d, 0) / durations.length,
          median: this.calculateMedian(durations),
          p95: this.calculatePercentile(durations, 95),
          max: Math.max(...durations),
          min: Math.min(...durations)
        };
      }
    }
    
    return report;
  }
  
  private calculateMedian(values: number[]): number {
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0 
      ? (sorted[mid - 1] + sorted[mid]) / 2 
      : sorted[mid];
  }
  
  private calculatePercentile(values: number[], percentile: number): number {
    const sorted = [...values].sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[Math.max(0, index)];
  }
}

// Usage
const performanceMonitor = new PerformanceMonitoringService();
performanceMonitor.start();

// Measure astrological calculations
const positions = await performanceMonitor.measureAsync(
  'planetary-positions',
  () => getReliablePlanetaryPositions()
);
```

## 🔧 Build and Development Optimization

### TypeScript Compilation Optimization
```json
// tsconfig.json - Optimized for performance
{
  "compilerOptions": {
    "target": "es2018",
    "module": "esnext",
    "moduleResolution": "node",
    "strict": true,
    "noImplicitAny": false,
    "strictNullChecks": false,
    "incremental": true,
    "tsBuildInfoFile": ".tsbuildinfo",
    "skipLibCheck": true,
    "skipDefaultLibCheck": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@components/*": ["./src/components/*"],
      "@utils/*": ["./src/utils/*"],
      "@types/*": ["./src/types/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": [
    "node_modules",
    ".next",
    "dist",
    "**/*.test.ts",
    "**/*.test.tsx"
  ]
}
```

### Development Server Optimization
```javascript
// next.config.js - Development optimization
module.exports = {
  // Enable SWC for faster compilation
  swcMinify: true,
  
  // Optimize development builds
  webpack: (config, { dev, isServer }) => {
    if (dev) {
      // Faster development builds
      config.optimization.splitChunks = false;
      config.optimization.minimize = false;
    }
    
    // Optimize astronomical libraries
    config.resolve.alias = {
      ...config.resolve.alias,
      'astronomia': 'astronomia/lib',
    };
    
    return config;
  },
  
  // Enable experimental features for performance
  experimental: {
    esmExternals: true,
    serverComponentsExternalPackages: ['astronomia', 'astronomy-engine']
  }
};
```

## 📈 Performance Testing and Benchmarking

### Automated Performance Testing
```typescript
// Performance test suite
describe('Performance Tests', () => {
  const performanceMonitor = new PerformanceMonitoringService();
  
  beforeAll(() => {
    performanceMonitor.start();
  });
  
  test('astrological calculations complete within 2 seconds', async () => {
    const startTime = performance.now();
    
    const positions = await getReliablePlanetaryPositions();
    
    const duration = performance.now() - startTime;
    expect(duration).toBeLessThan(2000);
    
    console.log(`Planetary positions calculated in ${duration.toFixed(2)}ms`);
  });
  
  test('elemental compatibility calculations are fast', async () => {
    const testProperties = [
      { fire: 0.8, water: 0.1, earth: 0.1, air: 0.0 },
      { fire: 0.1, water: 0.8, earth: 0.1, air: 0.0 },
      { fire: 0.1, water: 0.1, earth: 0.8, air: 0.0 },
      { fire: 0.0, water: 0.1, earth: 0.1, air: 0.8 }
    ];
    
    const startTime = performance.now();
    
    // Calculate all combinations
    for (const source of testProperties) {
      for (const target of testProperties) {
        const compatibility = calculateElementalCompatibility(source, target);
        expect(compatibility).toBeGreaterThanOrEqual(0.7);
      }
    }
    
    const duration = performance.now() - startTime;
    expect(duration).toBeLessThan(100); // Should be very fast
    
    console.log(`Elemental compatibility calculations completed in ${duration.toFixed(2)}ms`);
  });
  
  test('memory usage remains stable', async () => {
    const initialMemory = process.memoryUsage().heapUsed;
    
    // Perform many calculations
    for (let i = 0; i < 1000; i++) {
      await getReliablePlanetaryPositions();
    }
    
    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }
    
    const finalMemory = process.memoryUsage().heapUsed;
    const memoryIncrease = finalMemory - initialMemory;
    
    // Memory increase should be reasonable (less than 50MB)
    expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
    
    console.log(`Memory increase: ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB`);
  });
});
```

---

**Remember**: Performance optimization is an ongoing process. Monitor key metrics, profile regularly, and optimize based on real usage patterns. Focus on the most impactful optimizations first. 🚀