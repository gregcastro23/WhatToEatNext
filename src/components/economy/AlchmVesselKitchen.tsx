'use client';

/**
 * Alchm Vessel — Kitchen profile view
 *
 * The culinary face of the cross-app Vessel: the user's ESMS holdings and the
 * ledger-backed inflow streams that filled them (duel yields, daily/sky
 * yields, quests & achievements), read from GET /api/economy/vessel.
 *
 * Every number shown comes from the authoritative token ledger. If the fetch
 * fails the last good snapshot stays on screen with a "reconnecting" halo —
 * it is never replaced with estimated values.
 *
 * @file src/components/economy/AlchmVesselKitchen.tsx
 */

import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { TOKEN_ECONOMY_EVENT } from '@/hooks/useTokenEconomy';
import {
  kitchenVesselLedgerSchema,
  type KitchenVesselLedger,
  type VesselStreamKey,
} from '@/lib/economy/clientSchemas';

const CACHE_PREFIX = 'alchm:vessel:kitchen:v1:';
const REFRESH_MS = 60_000;

const TOKENS = [
  { key: 'spirit', label: 'Spirit', symbol: '🝇', element: 'Fire', text: 'text-amber-300', bar: 'bg-amber-400' },
  { key: 'essence', label: 'Essence', symbol: '🝑', element: 'Water', text: 'text-sky-300', bar: 'bg-sky-400' },
  { key: 'matter', label: 'Matter', symbol: '🝙', element: 'Earth', text: 'text-emerald-300', bar: 'bg-emerald-400' },
  { key: 'substance', label: 'Substance', symbol: '🝉', element: 'Air', text: 'text-purple-300', bar: 'bg-purple-400' },
] as const;

const STREAMS: Array<{ key: VesselStreamKey; label: string; tag: string; note: string }> = [
  { key: 'kitchenAchievements', label: 'Kitchen Quests', tag: 'Kitchen', note: 'Quest rewards, achievements, logs & Sky Drops' },
  { key: 'staking', label: 'Yields & Staking', tag: 'Yield', note: 'Daily faucet, streak bonuses & StarVault' },
  { key: 'jingDuels', label: 'Jing Arena Duels', tag: 'Jing', note: 'Paid duel rounds on agents.alchm.kitchen' },
  { key: 'pentaclesMelee', label: 'Pentacles', tag: 'Pentacles', note: 'Pentacle conversions & arena claims' },
];

const TAG_STYLE: Record<VesselStreamKey | 'other', string> = {
  kitchenAchievements: 'border-amber-400/30 text-amber-300 bg-amber-400/10',
  staking: 'border-emerald-400/30 text-emerald-300 bg-emerald-400/10',
  jingDuels: 'border-rose-400/30 text-rose-300 bg-rose-400/10',
  pentaclesMelee: 'border-yellow-300/30 text-yellow-200 bg-yellow-300/10',
  other: 'border-white/10 text-white/40 bg-white/5',
};

const TAG_LABEL: Record<VesselStreamKey | 'other', string> = {
  kitchenAchievements: 'Kitchen',
  staking: 'Yield',
  jingDuels: 'Jing',
  pentaclesMelee: 'Pentacles',
  other: 'Ledger',
};

function fmt(n: number): string {
  return n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 4 });
}

// Cached snapshots are keyed per signed-in user so a shared browser never
// shows one person's treasury to another.
function readCache(userKey: string | null): KitchenVesselLedger | null {
  if (!userKey) return null;
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + userKey);
    if (!raw) return null;
    const payload: unknown = JSON.parse(raw);
    const parsed = kitchenVesselLedgerSchema.safeParse(payload);
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

function writeCache(userKey: string | null, value: KitchenVesselLedger | null): void {
  if (!userKey) return;
  try {
    if (value) localStorage.setItem(CACHE_PREFIX + userKey, JSON.stringify(value));
    else localStorage.removeItem(CACHE_PREFIX + userKey);
  } catch {
    // storage unavailable (private mode) — the live view still works
  }
}

interface AlchmVesselKitchenProps {
  className?: string;
}

export function AlchmVesselKitchen({ className = '' }: AlchmVesselKitchenProps): React.JSX.Element | null {
  const [vessel, setVessel] = useState<KitchenVesselLedger | null>(null);
  const [state, setState] = useState<'loading' | 'live' | 'reconnecting' | 'signed-out' | 'error'>('loading');
  const vesselRef = useRef<KitchenVesselLedger | null>(null);
  const { data: session } = useSession();
  const userKey = session?.user?.id ?? session?.user?.email ?? null;

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/economy/vessel', { credentials: 'include' });
      if (res.status === 401) {
        writeCache(userKey, null);
        vesselRef.current = null;
        setVessel(null);
        setState('signed-out');
        return;
      }
      const payload: unknown = await res.json();
      const parsed = kitchenVesselLedgerSchema.safeParse(payload);
      if (!res.ok || !parsed.success) throw new Error(`HTTP ${res.status}`);
      vesselRef.current = parsed.data;
      setVessel(vesselRef.current);
      writeCache(userKey, vesselRef.current);
      setState('live');
    } catch {
      const fallback = vesselRef.current ?? readCache(userKey);
      vesselRef.current = fallback;
      setVessel(fallback);
      setState(fallback ? 'reconnecting' : 'error');
    }
  }, [userKey]);

  useEffect(() => {
    // Reset on user change so the previous user's snapshot never lingers.
    const cached = readCache(userKey);
    vesselRef.current = cached;
    setVessel(cached);
    load().catch(() => {});
    const interval = setInterval(() => { load().catch(() => {}); }, REFRESH_MS);
    const onEconomy = (): void => { load().catch(() => {}); };
    window.addEventListener(TOKEN_ECONOMY_EVENT, onEconomy);
    return (): void => {
      clearInterval(interval);
      window.removeEventListener(TOKEN_ECONOMY_EVENT, onEconomy);
    };
  }, [load, userKey]);

  if (state === 'signed-out') return null;

  const total = vessel
    ? vessel.balances.spirit + vessel.balances.essence + vessel.balances.matter + vessel.balances.substance
    : 0;

  return (
    <section
      aria-label="Alchm Vessel"
      className={`relative rounded-3xl glass-card-premium p-6 border ${
        state === 'reconnecting' ? 'border-amber-400/40 shadow-[0_0_24px_rgba(251,191,36,0.15)]' : 'border-white/8'
      } ${className}`}
    >
      <header className="flex items-start justify-between gap-4 mb-5">
        <div>
          <h2 className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em]">The Alchm Vessel</h2>
          <p className="text-white/50 text-xs mt-1">
            One elemental treasury across the Kitchen, Agents, and Pentacles.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {state === 'reconnecting' && (
            <span className="text-[9px] font-bold uppercase tracking-widest text-amber-300/80 animate-pulse">
              Reconnecting · cached
            </span>
          )}
          {vessel && (
            <span className="text-[9px] font-mono text-white/25" title={vessel.generatedAt}>
              {new Date(vessel.generatedAt).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
            </span>
          )}
        </div>
      </header>

      {state === 'loading' && !vessel && (
        <div className="h-40 rounded-2xl bg-white/[0.03] animate-pulse" aria-busy="true" />
      )}

      {state === 'error' && !vessel && (
        <div className="rounded-2xl border border-rose-400/20 bg-rose-400/5 p-4 text-xs text-rose-200/80 flex items-center justify-between">
          <span>The Vessel ledger could not be read right now.</span>
          <button type="button" onClick={() => { load().catch(() => {}); }} className="font-bold uppercase tracking-wider text-rose-200 hover:text-white">
            Retry
          </button>
        </div>
      )}

      {vessel && (
        <div className="space-y-6">
          {/* Holdings: each band's height is its real share of the total */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {TOKENS.map((t) => {
              const amount = vessel.balances[t.key];
              const share = total > 0 ? amount / total : 0;
              return (
                <div key={t.key} className="relative overflow-hidden rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                  <motion.div
                    aria-hidden
                    className={`absolute inset-x-0 bottom-0 ${t.bar} opacity-10`}
                    initial={{ height: 0 }}
                    animate={{ height: `${Math.round(share * 100)}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                  />
                  <div className="relative">
                    <div className={`text-2xl ${t.text}`}>{t.symbol}</div>
                    <div className="text-[10px] font-black text-white/60 uppercase tracking-wider mt-1">
                      {t.label} <span className="text-white/25">· {t.element}</span>
                    </div>
                    <div className="font-mono text-lg text-white/90 mt-1">{fmt(amount)}</div>
                    <div className="text-[9px] text-white/30">{(share * 100).toFixed(1)}% of vessel</div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex flex-wrap gap-2 text-[10px] text-white/50">
            <span className="rounded-full border border-white/10 px-3 py-1">🔥 {vessel.streakDays}-day streak</span>
            {vessel.quests && (
              <>
                <span className="rounded-full border border-white/10 px-3 py-1">
                  🏆 {vessel.quests.achievementsUnlocked} achievements
                </span>
                <span className="rounded-full border border-white/10 px-3 py-1">
                  🍳 {vessel.quests.questsCompleted} quests completed
                </span>
              </>
            )}
          </div>

          {/* Inflow streams */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {STREAMS.map((s) => {
              const stream = vessel.streams[s.key];
              const tracked = stream.sourceTypes.length > 0;
              return (
                <div key={s.key} className="rounded-2xl border border-white/8 bg-white/[0.02] p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-white/80">{s.label}</span>
                    <span className={`text-[9px] font-bold uppercase tracking-wider rounded-full border px-2 py-0.5 ${TAG_STYLE[s.key]}`}>
                      {s.tag}
                    </span>
                  </div>
                  {tracked ? (
                    <div className="grid grid-cols-4 gap-2 font-mono text-[11px]">
                      {TOKENS.map((t, i) => {
                        const amount = stream.esms[i] ?? 0;
                        return (
                          <div key={t.key} className={amount > 0 ? t.text : 'text-white/20'}>
                            {t.symbol} {fmt(amount)}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-[11px] text-white/30 italic">Not credited to the ledger yet</div>
                  )}
                  <div className="text-[9px] text-white/30 mt-2">
                    {s.note}
                    {stream.lastAt && ` · last ${new Date(stream.lastAt).toLocaleDateString()}`}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Transmutation ledger */}
          <div>
            <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-2">Recent ledger</h3>
            {vessel.recent.length === 0 ? (
              <p className="text-xs text-white/30">No ledger activity yet.</p>
            ) : (
              <ul className="divide-y divide-white/5">
                {vessel.recent.slice(0, 8).map((entry) => {
                  const token = TOKENS.find((t) => t.label === entry.tokenType);
                  return (
                    <li key={entry.id} className="flex items-center gap-3 py-2 text-xs">
                      <span className={`text-[9px] font-bold uppercase tracking-wider rounded-full border px-2 py-0.5 ${TAG_STYLE[entry.stream]}`}>
                        {TAG_LABEL[entry.stream]}
                      </span>
                      <span className="flex-1 min-w-0 truncate text-white/60" title={entry.sourceType}>
                        {entry.description ?? entry.sourceType.replace(/_/g, ' ')}
                      </span>
                      <span className={`font-mono ${token?.text ?? 'text-white/60'}`}>
                        {token?.symbol} {fmt(entry.amount)}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
