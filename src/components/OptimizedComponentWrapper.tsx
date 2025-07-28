import React, { useState, useEffect, ReactNode, memo } from 'react';
import { log } from '@/services/LoggingService';

interface WrapperProps {
  children: ReactNode;
  name: string;
}

/**
 * Simple component wrapper that shows render count and memoizes children
 * Use this for quick debugging of render counts without full HOC overhead
 */
const OptimizedComponentWrapper: React.FC<WrapperProps> = ({ children, name }) => {
  const [renderCount, setRenderCount] = useState(0);
  const [renderTime, setRenderTime] = useState(0);
  
  useEffect(() => {
    const startTime = performance.now();
    
    setRenderCount(prev => {
      const newCount = prev + 1;
      log.info(`${name} wrapper rendered ${newCount} times`);
      return newCount;
    });
    
    return () => {
      const endTime = performance.now();
      setRenderTime(endTime - startTime);
    };
  }, [name]);
  
  return (
    <div className="optimized-wrapper" data-component={name}>
      {process.env.NODE_ENV !== 'production' && (
        <div style={{ 
          fontSize: '10px', 
          color: renderCount > 10 ? '#ff6b6b' : renderCount > 5 ? '#ffa94d' : '#74c0fc',
          textAlign: 'right',
          padding: '2px 4px',
          backgroundColor: 'rgba(0,0,0,0.03)',
          borderRadius: '2px',
          margin: '2px 0',
          display: 'flex',
          justifyContent: 'space-between'
        }}>
          <span>{name}</span>
          <span>
            Renders: <strong>{renderCount}</strong>
            {renderTime > 0 && <span> ({renderTime.toFixed(1)}ms)</span>}
          </span>
        </div>
      )}
      {children}
    </div>
  );
};

// Memoize the wrapper itself to avoid unnecessary wrapper re-renders
const MemoizedWrapper = memo(OptimizedComponentWrapper);

// Export both the memoized version as default and the named component
export { MemoizedWrapper as OptimizedComponentWrapper };
export default MemoizedWrapper; 