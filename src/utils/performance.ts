// Performance optimization utilities
import { logger } from ./logger';

/**
 * Interface for performance metrics collection
 */
export interface PerformanceMetrics {
  navigationStart?: number;
  loadTime?: number;
  domInteractive?: number;
  domContentLoaded?: number;
  firstPaint?: number;
  firstContentfulPaint?: number;
  memoryUsage?: {
    jsHeapSizeLimit?: number;
    totalJSHeapSize?: number;
    usedJSHeapSize?: number;
  };
  networkLatency?: number;
}

/**
 * Apply performance optimizations and monitoring
 * @returns Object with optimization status
 */
export function optimizePerformance(): { success: boolean; optimizations: string[] } {
  const appliedOptimizations: string[] = [];
  
  try {
    // Only run browser-specific optimizations if in browser environment
    if (typeof window !== 'undefined') {
      // Optimize image loading with lazy loading
      const lazyLoadImages = () => {
        const images = document.querySelectorAll('img:not([loading])');
        images.forEach(img => {
          img.setAttribute('loading', 'lazy');
        });
        appliedOptimizations.push('image-lazy-loading');
      };
      
      // Debounce expensive event handlers
      const setupDebounce = () => {
        const debounce = (func: (...args: unknown[]) => void, wait: number) => {
          let timeout: ReturnType<typeof setTimeout>;
          return function executedFunction(...args: unknown[]) {
            const later = () => {
              clearTimeout(timeout);
              func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
          };
        };
        
        // Apply debounce to scroll and resize events
        if (typeof window.onscroll === 'function') {
          const originalScroll = window.onscroll;
          window.onscroll = debounce(originalScroll, 100);
        }
        
        if (typeof window.onresize === 'function') {
          const originalResize = window.onresize;
          window.onresize = debounce(originalResize, 150);
        }
        
        appliedOptimizations.push('event-debouncing');
      };
      
      // Run optimizations
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
          lazyLoadImages();
          setupDebounce();
        });
      } else {
        lazyLoadImages();
        setupDebounce();
      }
    }
    
    // Log performance initialization
    logger.info('Performance optimizations applied', { optimizations: appliedOptimizations });
    
    return { 
      success: true, 
      optimizations: appliedOptimizations 
    };
  } catch (error) {
    logger.error('Failed to apply performance optimizations', error);
    return { 
      success: false, 
      optimizations: appliedOptimizations 
    };
  }
}

/**
 * Collect current performance metrics
 * @returns Performance metrics object
 */
export function collectPerformanceMetrics(): PerformanceMetrics {
  const metrics: PerformanceMetrics = {};
  
  try {
    if (typeof window !== 'undefined' && window.performance) {
      const perf = window.performance;
      
      // Basic timing metrics
      if (perf.timing) {
        metrics.navigationStart = perf.timing.navigationStart;
        metrics.loadTime = perf.timing.loadEventEnd - perf.timing.navigationStart;
        metrics.domInteractive = perf.timing.domInteractive - perf.timing.navigationStart;
        metrics.domContentLoaded = perf.timing.domContentLoadedEventEnd - perf.timing.navigationStart;
      }
      
      // Memory metrics (Chrome only)
      const memory = (perf as unknown).memory;
      if (memory) {
        metrics.memoryUsage = {
          jsHeapSizeLimit: memory.jsHeapSizeLimit,
          totalJSHeapSize: memory.totalJSHeapSize,
          usedJSHeapSize: memory.usedJSHeapSize
        };
      }
      
      // Paint metrics
      if (perf.getEntriesByType) {
        const paintMetrics = perf.getEntriesByType('paint');
        paintMetrics.forEach(entry => {
          if (entry.name === 'first-paint') {
            metrics.firstPaint = entry.startTime;
          } else if (entry.name === 'first-contentful-paint') {
            metrics.firstContentfulPaint = entry.startTime;
          }
        });
      }
    }
    
    return metrics;
  } catch (error) {
    logger.error('Error collecting performance metrics', error);
    return metrics;
  }
} 