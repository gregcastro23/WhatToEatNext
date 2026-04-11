'use client';

/**
 * Token Rain Particles
 *
 * A "heavy magical" splash overlay that rains ESMS token symbols across the
 * viewport whenever a claim or quest reward is received. Uses framer-motion
 * springs with stiffness 300 to match the house "magical" animation feel.
 *
 * Usage:
 *   <TokenRainParticles trigger={claimAnimating} onComplete={() => setClaimAnimating(false)} />
 *
 * The component is pointer-events-none so it never blocks UI interaction.
 *
 * @file src/components/economy/TokenRainParticles.tsx
 */

import { AnimatePresence, motion } from 'framer-motion';
import React, { useEffect, useMemo, useState } from 'react';
import type { TokenType } from '@/types/economy';

// ─── Palette ──────────────────────────────────────────────────────────

const TOKEN_VISUAL: Record<TokenType, { symbol: string; color: string; glow: string }> = {
  Spirit: { symbol: '☉', color: '#fbbf24', glow: 'rgba(251,191,36,0.6)' },
  Essence: { symbol: '☽', color: '#60a5fa', glow: 'rgba(96,165,250,0.6)' },
  Matter: { symbol: '⊕', color: '#34d399', glow: 'rgba(52,211,153,0.6)' },
  Substance: { symbol: '☿', color: '#c084fc', glow: 'rgba(192,132,252,0.6)' },
};

const ALL_TOKEN_TYPES: TokenType[] = ['Spirit', 'Essence', 'Matter', 'Substance'];

// ─── Props ────────────────────────────────────────────────────────────

interface TokenRainParticlesProps {
  /** When this flips to true, a new splash fires. */
  trigger: boolean;
  /** Optional: restrict which token types to rain. Defaults to all four. */
  tokenTypes?: TokenType[];
  /** Number of particles to spawn. Default 24 for a "heavy" feel. */
  count?: number;
  /** Called after the splash animation completes. */
  onComplete?: () => void;
}

interface Particle {
  id: number;
  tokenType: TokenType;
  startX: number; // percentage 0–100
  endX: number; // percentage 0–100
  delay: number;
  size: number;
  rotate: number;
}

// ─── Component ────────────────────────────────────────────────────────

export function TokenRainParticles({
  trigger,
  tokenTypes = ALL_TOKEN_TYPES,
  count = 24,
  onComplete,
}: TokenRainParticlesProps) {
  const [visible, setVisible] = useState(false);
  const [key, setKey] = useState(0);

  // Fire a new splash each time `trigger` flips to true.
  useEffect(() => {
    if (!trigger) return;
    setKey((k) => k + 1);
    setVisible(true);
    const timer = setTimeout(() => {
      setVisible(false);
      onComplete?.();
    }, 2400);
    return () => clearTimeout(timer);
  }, [trigger, onComplete]);

  const particles = useMemo<Particle[]>(() => {
    if (!visible) return [];
    const pool = tokenTypes.length > 0 ? tokenTypes : ALL_TOKEN_TYPES;
    return Array.from({ length: count }, (_, i) => {
      const startX = 10 + Math.random() * 80; // keep particles away from the very edge
      return {
        id: i,
        tokenType: pool[i % pool.length],
        startX,
        endX: startX + (Math.random() - 0.5) * 20,
        delay: Math.random() * 0.3,
        size: 22 + Math.random() * 22,
        rotate: (Math.random() - 0.5) * 360,
      };
    });
    // Regenerate on every new splash.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, count, visible, tokenTypes]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key={key}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.4 } }}
          className="fixed inset-0 z-[100] pointer-events-none overflow-hidden"
          aria-hidden="true"
        >
          {particles.map((p) => {
            const visual = TOKEN_VISUAL[p.tokenType];
            return (
              <motion.span
                key={p.id}
                initial={{
                  top: '-8%',
                  left: `${p.startX}%`,
                  opacity: 0,
                  scale: 0.4,
                  rotate: 0,
                }}
                animate={{
                  top: '108%',
                  left: `${p.endX}%`,
                  opacity: [0, 1, 1, 0.85, 0],
                  scale: [0.4, 1.15, 1, 0.9, 0.7],
                  rotate: p.rotate,
                }}
                transition={{
                  type: 'spring',
                  stiffness: 300,
                  damping: 18,
                  delay: p.delay,
                  mass: 1.1,
                  // Fallback linear for properties that don't spring cleanly (top/opacity).
                  top: { type: 'tween', duration: 1.9, ease: [0.16, 1, 0.3, 1], delay: p.delay },
                  opacity: { type: 'tween', duration: 1.9, delay: p.delay, times: [0, 0.15, 0.6, 0.85, 1] },
                  scale: { type: 'tween', duration: 1.9, delay: p.delay, times: [0, 0.15, 0.5, 0.85, 1] },
                }}
                style={{
                  position: 'absolute',
                  color: visual.color,
                  fontSize: `${p.size}px`,
                  textShadow: `0 0 18px ${visual.glow}, 0 0 36px ${visual.glow}`,
                  fontFamily: 'serif',
                  willChange: 'transform, opacity',
                }}
              >
                {visual.symbol}
              </motion.span>
            );
          })}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
