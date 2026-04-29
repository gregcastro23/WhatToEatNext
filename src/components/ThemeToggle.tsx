'use client';

import React from 'react';
import { useTheme, type ThemePreference } from '@/contexts/ThemeContext';

interface ThemeToggleProps {
  /** Compact icon-only mode for header */
  compact?: boolean;
  className?: string;
}

const OPTIONS: Array<{ value: ThemePreference; label: string; icon: string; aria: string }> = [
  { value: 'light', label: 'Light', icon: '☀️', aria: 'Use light theme (day)' },
  { value: 'dark', label: 'Dark', icon: '🌙', aria: 'Use dark theme (night)' },
  { value: 'system', label: 'Auto', icon: '🌗', aria: 'Follow time of day' },
];

/**
 * Theme toggle borrowed from ondeck (next-themes pattern), adapted to our
 * day/night alchemical theme system. "Auto" mode reflects the diurnal/nocturnal
 * sectarian split — light during local day (06:00–18:00), dark at night.
 */
export const ThemeToggle: React.FC<ThemeToggleProps> = ({ compact = false, className = '' }) => {
  const { preference, theme, isDiurnal, setPreference, cycleTheme } = useTheme();

  if (compact) {
    const current = OPTIONS.find((o) => o.value === preference) ?? OPTIONS[2];
    const tooltip =
      preference === 'system'
        ? `Auto (currently ${theme}, ${isDiurnal ? 'day' : 'night'})`
        : `${current.label} theme`;
    return (
      <button
        type="button"
        onClick={cycleTheme}
        title={tooltip}
        aria-label={`Theme: ${tooltip}. Click to cycle.`}
        className={`inline-flex items-center justify-center h-10 w-10 rounded-xl border border-purple-500/30 bg-purple-900/40 text-purple-100 hover:bg-purple-800/60 hover:text-white hover:scale-105 transition-all duration-200 shadow-md ${className}`}
      >
        <span className="text-lg leading-none" aria-hidden="true">{current.icon}</span>
      </button>
    );
  }

  return (
    <div
      role="radiogroup"
      aria-label="Theme preference"
      className={`inline-flex items-center gap-1 rounded-xl border border-purple-500/30 bg-purple-900/30 p-1 ${className}`}
    >
      {OPTIONS.map((opt) => {
        const active = preference === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={opt.aria}
            onClick={() => setPreference(opt.value)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              active
                ? 'bg-purple-700/80 text-white shadow-sm'
                : 'text-purple-200 hover:bg-purple-800/50 hover:text-white'
            }`}
          >
            <span aria-hidden="true">{opt.icon}</span>
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default ThemeToggle;
