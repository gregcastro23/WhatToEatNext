'use client';

/**
 * Blurred Ledger Preview (Free-Tier Teaser)
 *
 * Shows a fake Trends / Kinetics / Ledger panel with plausible-looking
 * sparkline placeholders blurred behind a glass scrim. On top, a gold
 * "Upgrade to See Your Trends" CTA invites the user to become an Premium.
 *
 * No real data is ever rendered — the sparklines are generated from a
 * deterministic seed so the preview looks alive without leaking anything.
 *
 * @file src/components/economy/BlurredLedgerPreview.tsx
 */

import { motion } from 'framer-motion';
import Link from 'next/link';
import React from 'react';

// ─── Fake data generator ─────────────────────────────────────────────

function fakeSparkline(seed: number, count = 20): number[] {
  // Simple LCG for deterministic pseudo-random values.
  const values: number[] = [];
  let s = seed;
  for (let i = 0; i < count; i++) {
    s = (s * 9301 + 49297) % 233280;
    const r = s / 233280;
    values.push(0.3 + r * 0.7);
  }
  return values;
}

function sparklinePath(values: number[], w: number, h: number): string {
  const step = w / (values.length - 1);
  return values
    .map((v, i) => {
      const x = i * step;
      const y = h - v * h;
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
}

// ─── Fake token rows ─────────────────────────────────────────────────

const FAKE_ROWS = [
  { token: 'Spirit', symbol: '🝇', color: 'text-amber-400', seed: 42 },
  { token: 'Essence', symbol: '🝑', color: 'text-blue-400', seed: 97 },
  { token: 'Matter', symbol: '🝙', color: 'text-emerald-400', seed: 131 },
  { token: 'Substance', symbol: '🝉', color: 'text-purple-400', seed: 173 },
];

// ─── Component ────────────────────────────────────────────────────────

interface BlurredLedgerPreviewProps {
  className?: string;
  /** Override the default upgrade href (e.g., `/pricing`). */
  upgradeHref?: string;
}

export function BlurredLedgerPreview({
  className = '',
  upgradeHref = '/subscribe',
}: BlurredLedgerPreviewProps) {
  return (
    <div className={`relative glass-card-premium rounded-3xl p-7 border-white/10 overflow-hidden ${className}`}>
      {/* ── Blurred fake trends panel ─────────────────────────────── */}
      <div className="pointer-events-none select-none filter blur-[6px] opacity-80">
        <div className="flex items-center gap-3 mb-4">
          <span className="w-8 h-px bg-amber-500/40" />
          <span className="text-[9px] font-black text-amber-400/70 uppercase tracking-[0.4em]">
            Elemental Trends · 30d
          </span>
        </div>
        <h3 className="text-xl font-black text-white/90 tracking-tight mb-5">
          Your Alchemical Trajectory
        </h3>

        <div className="space-y-4">
          {FAKE_ROWS.map((row) => {
            const values = fakeSparkline(row.seed);
            const last = values[values.length - 1];
            const first = values[0];
            const delta = ((last - first) / first) * 100;
            return (
              <div
                key={row.token}
                className="flex items-center gap-4 px-3 py-3 rounded-2xl bg-white/[0.03] border border-white/5"
              >
                <div className="flex items-center gap-2 min-w-[110px]">
                  <span className={`text-lg ${row.color}`}>{row.symbol}</span>
                  <span className="text-[11px] font-black text-white/80 uppercase tracking-wider">
                    {row.token}
                  </span>
                </div>
                <svg
                  viewBox="0 0 120 30"
                  className="flex-1 h-8 text-white/40"
                  preserveAspectRatio="none"
                >
                  <path
                    d={sparklinePath(values, 120, 30)}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span
                  className={`text-[11px] font-black tabular-nums min-w-[50px] text-right ${
                    delta >= 0 ? 'text-emerald-400' : 'text-red-400'
                  }`}
                >
                  {delta >= 0 ? '+' : ''}
                  {delta.toFixed(1)}%
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Upgrade overlay ───────────────────────────────────────── */}
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-[#08080e]/30 via-[#08080e]/50 to-[#08080e]/80">
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 22 }}
          className="text-center px-8"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/30 bg-amber-500/5 mb-4">
            <span className="text-amber-400 text-xs">🔒</span>
            <span className="text-[9px] font-black text-amber-400 uppercase tracking-[0.3em]">
              Premium Only
            </span>
          </div>
          <h3 className="text-2xl font-black text-white tracking-tight mb-2">
            Your Trends Await
          </h3>
          <p className="text-[11px] text-white/50 mb-5 max-w-xs mx-auto leading-relaxed">
            Unlock 30-day elemental trajectories, kinetic variance, and ledger
            analytics when you ascend to the Premium tier.
          </p>
          <Link
            href={upgradeHref}
            className="inline-block px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.25em] bg-gradient-to-r from-amber-500 via-purple-600 to-amber-500 text-white shadow-[0_0_30px_rgba(251,191,36,0.35)] hover:shadow-[0_0_50px_rgba(251,191,36,0.6)] transition-all alchm-shimmer"
            style={{ backgroundSize: '200% 100%' }}
          >
            Ascend to Premium
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
