'use client';

import Script from 'next/script';
import React, { useState, useEffect } from 'react';

import { Element } from "@/types/alchemy";
// Clock Component
interface ClockProps {
  format?: '12h' | '24h';
  showSeconds?: boolean;
  className?: string;
}

export const Clock: React.FC<ClockProps> = ({ 
  format = '24h', 
  showSeconds = false, 
  className = "text-center py-2 bg-gray-800 text-white font-mono text-xl" 
}) => {
  const [time, setTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = now.getMinutes()?.toString().padStart(2, '0');
      const seconds = now.getSeconds()?.toString().padStart(2, '0');
      
      let timeString = '';
      
      if (format === '12h') {
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        timeString = `${hours}:${minutes}${showSeconds ? `:${seconds}` : ''} ${ampm}`;
      } else {
        timeString = `${hours?.toString()?.padStart(2, '0')}:${minutes}${showSeconds ? `:${seconds}` : ''}`;
      }
      
      setTime(timeString);
    };

    updateTime(); // Initial call
    const interval = setInterval(updateTime, showSeconds ? 1000 : 60000);

    return () => clearInterval(interval);
  }, [format, showSeconds]);

  return (
    <div className={className}>
      {time}
    </div>
  );
};

// Theme Script Component
export const ThemeScript: React.FC = () => {
  return (
    <Script
      id="theme-script"
      strategy="beforeInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          try {
            let theme = 'light';
            const savedTheme = localStorage.getItem('theme');
            const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            
            if (savedTheme) {
              theme = savedTheme;
            } else if (systemPrefersDark) {
              theme = 'dark';
            }
            
            document.documentElement.setAttribute('data-theme', theme);
          } catch (e) {
            document.documentElement.setAttribute('data-theme', 'light');
          }
        `,
      }}
    />
  );
};

// Client Only Wrapper - ensures components only render on client side
interface ClientOnlyProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const ClientOnly: React.FC<ClientOnlyProps> = ({ children, fallback = null }) => {
  const [hasMounted, setHasMounted] = useState(false);
  
  useEffect(() => {
    setHasMounted(true);
  }, []);
  
  if (!hasMounted) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
};

// Simple Loading Spinner
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  color = 'text-blue-600',
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-current ${sizeClasses[size]} ${color} ${className}`} />
  );
};

// ZodiacSign Component
interface ZodiacSignProps {
  sign: string;
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
}

export const ZodiacSign: React.FC<ZodiacSignProps> = ({ 
  sign, 
  size = 'medium',
  showLabel = false
}) => {
  const zodiacEmoji: { [key: string]: string } = {
    aries: '♈', taurus: '♉', gemini: '♊', cancer: '♋',
    leo: '♌', virgo: '♍', libra: '♎', scorpio: '♏',
    sagittarius: '♐', capricorn: '♑', aquarius: '♒', pisces: '♓'
  };

  const zodiacElement: { [key: string]: string } = {
    aries: 'Fire', taurus: 'Earth', gemini: 'Air', cancer: 'Water',
    leo: 'Fire', virgo: 'Earth', libra: 'Air', scorpio: 'Water',
    sagittarius: 'Fire', capricorn: 'Earth', aquarius: 'Air', pisces: 'Water'
  };

  const elementColor: { [key: string]: string } = { Fire: '#FF5722', Earth: '#8D6E63', Air: '#03A9F4', Water: '#0288D1'
  };

  const signName = sign?.toLowerCase();
  const element = zodiacElement[signName] || 'Unknown';
  const emoji = zodiacEmoji[signName] || '?';
  
  const sizeMap = {
    small: { fontSize: '1rem', padding: '0.25rem' },
    medium: { fontSize: '2rem', padding: '0.5rem' },
    large: { fontSize: '3rem', padding: '0.8rem' }
  };
  
  const formattedName = signName.charAt(0)?.toUpperCase() + signName?.slice(1);
  
  return (
    <div 
      className="inline-flex flex-col items-center rounded-full border-2 justify-center leading-none"
      style={{
        backgroundColor: `${elementColor[element]}22`,
        borderColor: elementColor[element],
        color: elementColor[element],
        ...sizeMap[size],
        width: sizeMap[size].fontSize,
        height: sizeMap[size].fontSize,
      }}
      title={`${formattedName} (${element})`}
    >
      {emoji}
      {showLabel && (
        <div style={{ fontSize: '0.7em', marginTop: '0.5rem' }}>
          {formattedName}
        </div>
      )}
    </div>
  );
};

// Simple Debug Info Component
interface DebugInfoProps {
  data?: { [key: string]: any };
  title?: string;
}

export const DebugInfo: React.FC<DebugInfoProps> = ({ data = {}, title = "Debug Info" }) => {
  return (
    <div className="p-4 bg-gray-100 rounded-lg my-4">
      <h2 className="text-lg font-semibold mb-2">{title}</h2>
      <div className="space-y-2 text-sm">
        <pre className="whitespace-pre-wrap text-xs">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    </div>
  );
};

// Export default for backward compatibility
export default Clock; 