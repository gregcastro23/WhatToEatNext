'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';
import React, { useEffect, useState, useCallback } from 'react';
import { UserDashboard } from '@/components/dashboard';
import { BlurredLedgerPreview } from '@/components/economy/BlurredLedgerPreview';
import { DailyAlignmentWidget } from '@/components/economy/DailyAlignmentWidget';
import { LiveLedgerFeed } from '@/components/economy/LiveLedgerFeed';
import { QuestPanel } from '@/components/economy/QuestPanel';
import { SanctumTasks } from '@/components/economy/SanctumTasks';
import { TokenBalanceBar } from '@/components/economy/TokenBalanceBar';
import { YieldMultiplierCard } from '@/components/economy/YieldMultiplierCard';
import { LocationSearch } from '@/components/onboarding/LocationSearch';
import { AlchemicalConstitutionPanel } from '@/components/profile/AlchemicalConstitutionPanel';
import { CosmicAlignmentCard } from '@/components/profile/CosmicAlignmentCard';
import { ElementalWheel } from '@/components/profile/ElementalWheel';
import { FoodPreferences } from '@/components/profile/FoodPreferences';
import { ProfileHeroCard } from '@/components/profile/ProfileHeroCard';
import { useAlchemical } from '@/contexts/AlchemicalContext/hooks';
import { usePremium } from '@/contexts/PremiumContext';
import { PREMIUM_FEATURES_DISPLAY } from '@/lib/tiers';
import type { BirthData, NatalChart } from '@/types/natalChart';

// ─── Types ────────────────────────────────────────────────────────────────────

type ProfileStep = 'birth-data' | 'preferences' | 'dashboard';

interface UserPreferences {
  dietaryRestrictions: string[];
  preferredCuisines: string[];
  dislikedIngredients: string[];
  spicePreference: 'mild' | 'medium' | 'hot';
  complexity: 'simple' | 'moderate' | 'complex';
}

const DEFAULT_PREFERENCES: UserPreferences = {
  dietaryRestrictions: [],
  preferredCuisines: [],
  dislikedIngredients: [],
  spicePreference: 'medium',
  complexity: 'moderate',
};

function getStorageItem(key: string): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(key);
}

// ─── Premium Dashboard ────────────────────────────────────────────────────────

const PREMIUM_NAV = [
  { id: 'overview', label: 'Command', icon: '⚗️' },
  { id: 'cosmos', label: 'Cosmos', icon: '🔮' },
  { id: 'economy', label: 'Tokens', icon: '☉' },
  { id: 'quests', label: 'Quests', icon: '🎯' },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
] as const;

type PremiumTab = (typeof PREMIUM_NAV)[number]['id'];

function PremiumDashboard({
  session,
  profileData,
  natalChart,
  preferences,
  onEditBirthData,
  onEditPreferences,
}: {
  session: any;
  profileData: any;
  natalChart: NatalChart;
  preferences: UserPreferences;
  onEditBirthData: () => void;
  onEditPreferences: () => void;
}) {
  const [activeTab, setActiveTab] = useState<PremiumTab>('overview');
  const userName = session?.user?.name || 'Adept';
  const email = session?.user?.email || '';

  return (
    <div className="min-h-screen bg-[#08080e]">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-950/25 via-[#08080e] to-amber-950/15" />
        <div className="absolute top-0 left-1/3 w-[700px] h-[500px] bg-purple-600/6 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[400px] bg-amber-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-10">

        {/* ── Premium Header ── */}
        <motion.header
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-between mb-10 pb-8 border-b border-white/5"
        >
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="w-10 h-px bg-amber-500/40" />
              <span className="text-[9px] font-black text-amber-400/60 uppercase tracking-[0.5em]">
                Adept — Premium Sanctum
              </span>
            </div>
            <h1 className="text-4xl font-black text-white tracking-tighter alchm-gradient-text uppercase">
              {userName}
            </h1>
            <p className="text-white/20 text-xs mt-1 font-mono">
              {email} · Alchemical Adept · Premium
            </p>
          </div>

          {/* Premium badge + sign out */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 rounded-full border border-amber-500/30">
              <span className="text-amber-400 text-xs">✦</span>
              <span className="text-[10px] font-black text-amber-400 uppercase tracking-[0.3em]">
                Premium Adept
              </span>
            </div>
            <button
              onClick={() => { void signOut({ callbackUrl: '/' }); }}
              className="p-2.5 rounded-full glass-base text-white/20 hover:text-white/60 border border-white/5 hover:border-white/10 transition-all"
              title="Sign out"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </motion.header>

        {/* ── Tab Nav ── */}
        <div className="flex gap-1 p-1 bg-white/[0.025] rounded-2xl border border-white/5 mb-8 overflow-x-auto">
          {PREMIUM_NAV.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-[0.2em]
                transition-all duration-300 whitespace-nowrap flex-shrink-0
                ${activeTab === tab.id
                  ? 'bg-white/10 text-white border border-white/12 shadow-inner'
                  : 'text-white/25 hover:text-white/50 hover:bg-white/[0.03]'
                }
              `}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Tab Content ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          >
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Daily Cosmic Alignment — the keystone ritual */}
                <DailyAlignmentWidget />

                {/* Profile identity row */}
                <ProfileHeroCard
                  userName={userName}
                  email={email}
                  natalChart={natalChart}
                  tier="premium"
                  onEditProfile={onEditBirthData}
                  onOpenSettings={() => setActiveTab('settings')}
                />

                {/* Core data: constitution + elemental wheel */}
                <div className="grid md:grid-cols-2 gap-7">
                  <AlchemicalConstitutionPanel natalChart={natalChart} />
                  <ElementalWheel natalChart={natalChart} />
                </div>

                {/* Live ledger feed */}
                <LiveLedgerFeed />

                {/* Sanctum Tasks — dev-ops quests */}
                <SanctumTasks onOpenSettings={() => setActiveTab('settings')} />

                {/* Quick links */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Birth Chart', href: '/birth-chart', icon: '🌌', desc: 'Natal positions' },
                    { label: 'Current Chart', href: '/current-chart', icon: '⚡', desc: 'Live transits' },
                    { label: 'Token Economy', href: '/quantities', icon: '⚗️', desc: 'ESMS ledger' },
                    { label: 'Menu Planner', href: '/menu-planner', icon: '🍽️', desc: 'Cosmic meals' },
                  ].map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      className="glass-card-premium rounded-2xl p-4 border-white/8 hover:border-purple-500/30 hover:shadow-[0_0_20px_rgba(139,92,246,0.1)] transition-all group"
                    >
                      <div className="text-2xl mb-2">{item.icon}</div>
                      <div className="text-[11px] font-black text-white/60 uppercase tracking-[0.2em] group-hover:text-white transition-colors">
                        {item.label}
                      </div>
                      <div className="text-[9px] text-white/20 mt-0.5">{item.desc}</div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'cosmos' && (
              <div className="space-y-7">
                <CosmicAlignmentCard natalChart={natalChart} />
                {/* Full dashboard for cosmos view */}
                <div className="glass-card-premium rounded-3xl p-1 border-white/8 overflow-hidden">
                  <UserDashboard
                    session={session}
                    profileData={profileData}
                    natalChart={natalChart}
                    preferences={preferences}
                    onEditBirthData={onEditBirthData}
                    onEditPreferences={onEditPreferences}
                  />
                </div>
              </div>
            )}

            {activeTab === 'economy' && (
              <div className="space-y-7">
                <TokenBalanceBar />
                <YieldMultiplierCard />
                <LiveLedgerFeed limit={5} />
                <div className="rounded-3xl glass-card-premium p-6 border-white/8">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em]">
                      Full Token Economy
                    </h2>
                    <Link
                      href="/quantities"
                      className="text-[10px] font-black text-purple-400 hover:text-purple-300 uppercase tracking-[0.3em] transition-colors"
                    >
                      Open Ledger →
                    </Link>
                  </div>
                  <p className="text-white/20 text-xs mb-6">
                    Your Spirit ☉, Essence ☽, Matter ⊕, and Substance ☿ token balances. 
                    As a Premium Adept you earn 2× daily yields.
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { symbol: '☉', label: 'Spirit', color: 'text-amber-400', border: 'border-amber-500/25', bg: 'bg-amber-500/8', desc: 'Creative Force · Sun' },
                      { symbol: '☽', label: 'Essence', color: 'text-blue-400', border: 'border-blue-500/25', bg: 'bg-blue-500/8', desc: 'Life Energy · Moon' },
                      { symbol: '⊕', label: 'Matter', color: 'text-emerald-400', border: 'border-emerald-500/25', bg: 'bg-emerald-500/8', desc: 'Physical Form · Earth' },
                      { symbol: '☿', label: 'Substance', color: 'text-purple-400', border: 'border-purple-500/25', bg: 'bg-purple-500/8', desc: 'Etheric Field · Mercury' },
                    ].map((t) => (
                      <div key={t.label} className={`rounded-2xl p-5 border ${t.border} ${t.bg} text-center`}>
                        <div className={`text-3xl ${t.color} mb-2`}>{t.symbol}</div>
                        <div className="text-[11px] font-black text-white/70 uppercase tracking-wider">{t.label}</div>
                        <div className="text-[9px] text-white/20 mt-1">{t.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'quests' && (
              <div className="space-y-6">
                <TokenBalanceBar className="mb-2" />
                <QuestPanel />
              </div>
            )}

            {activeTab === 'settings' && (
              <PremiumSettingsPanel
                session={session}
                natalChart={natalChart}
                preferences={preferences}
                onEditBirthData={onEditBirthData}
                onEditPreferences={onEditPreferences}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Premium Settings Panel ────────────────────────────────────────────────────

function PremiumSettingsPanel({
  session,
  natalChart,
  preferences,
  onEditBirthData,
  onEditPreferences,
}: {
  session: any;
  natalChart: NatalChart;
  preferences: UserPreferences;
  onEditBirthData: () => void;
  onEditPreferences: () => void;
}) {
  const chartDate = natalChart?.birthData?.dateTime
    ? new Date(natalChart.birthData.dateTime).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit',
      })
    : null;

  const rows = [
    { label: 'Name', value: session?.user?.name || '—' },
    { label: 'Email', value: session?.user?.email || '—' },
    { label: 'Plan', value: 'Premium Adept' },
    { label: 'Dominant Element', value: natalChart.dominantElement || '—' },
    { label: 'Dominant Modality', value: natalChart.dominantModality || '—' },
  ];

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Identity */}
      <div className="glass-card-premium rounded-3xl p-7 border-white/8">
        <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] mb-5">
          Adept Identity
        </h3>
        <div className="space-y-3">
          {rows.map((r) => (
            <div key={r.label} className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0">
              <span className="text-xs text-white/30">{r.label}</span>
              <span className={`text-xs font-semibold ${r.label === 'Plan' ? 'text-amber-400' : 'text-white/80'}`}>
                {r.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Temporal Origin */}
      <div className="glass-card-premium rounded-3xl p-7 border-white/8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em]">
            Temporal Origin
          </h3>
          <button
            onClick={onEditBirthData}
            className="text-[10px] font-black text-purple-400 hover:text-purple-300 uppercase tracking-[0.25em] transition-colors"
          >
            Recalibrate
          </button>
        </div>
        {chartDate && <p className="text-sm text-white/80 font-medium mb-1">{chartDate}</p>}
        {natalChart.birthData && (
          <p className="text-[10px] text-white/25 font-mono">
            {natalChart.birthData.latitude.toFixed(4)}, {natalChart.birthData.longitude.toFixed(4)}
          </p>
        )}
      </div>

      {/* Culinary Vectors */}
      <div className="glass-card-premium rounded-3xl p-7 border-white/8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em]">
            Culinary Vectors
          </h3>
          <button
            onClick={onEditPreferences}
            className="text-[10px] font-black text-purple-400 hover:text-purple-300 uppercase tracking-[0.25em] transition-colors"
          >
            Reconfigure
          </button>
        </div>
        <div className="space-y-2 text-xs text-white/50">
          {preferences.dietaryRestrictions.length > 0 && (
            <p>Dietary: <span className="text-white/80">{preferences.dietaryRestrictions.join(', ')}</span></p>
          )}
          {preferences.preferredCuisines.length > 0 && (
            <p>Cuisines: <span className="text-white/80">{preferences.preferredCuisines.join(', ')}</span></p>
          )}
          <div className="flex gap-6">
            <p>Spice: <span className="text-white/80 capitalize">{preferences.spicePreference}</span></p>
            <p>Complexity: <span className="text-white/80 capitalize">{preferences.complexity}</span></p>
          </div>
        </div>
      </div>

      <div className="flex justify-center pt-2">
        <button
          onClick={() => { void signOut({ callbackUrl: '/' }); }}
          className="px-8 py-3 bg-red-500/8 text-red-400 rounded-full hover:bg-red-500/15 transition-all text-[10px] font-black uppercase tracking-[0.2em] border border-red-500/15"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}

// ─── Free Dashboard ────────────────────────────────────────────────────────────

const FREE_NAV = [
  { id: 'profile', label: 'Profile', icon: '⚗️' },
  { id: 'cosmos', label: 'Cosmos', icon: '🔮' },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
] as const;

type FreeTab = (typeof FREE_NAV)[number]['id'];

function FreeDashboard({
  session,
  profileData,
  natalChart,
  preferences,
  onEditBirthData,
  onEditPreferences,
}: {
  session: any;
  profileData: any;
  natalChart: NatalChart;
  preferences: UserPreferences;
  onEditBirthData: () => void;
  onEditPreferences: () => void;
}) {
  const [activeTab, setActiveTab] = useState<FreeTab>('profile');
  const { openCheckout } = usePremium();
  const userName = session?.user?.name || 'Initiate';
  const email = session?.user?.email || '';

  return (
    <div className="min-h-screen bg-[#08080e]">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-950/20 via-[#08080e] to-blue-950/10" />
        <div className="absolute top-1/4 left-0 w-[600px] h-[400px] bg-purple-800/5 rounded-full blur-[140px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[300px] bg-blue-600/4 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-10">

        {/* ── Header ── */}
        <motion.header
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-10 pb-8 border-b border-white/5"
        >
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="w-10 h-px bg-purple-500/30" />
              <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.5em]">
                Alchm.kitchen // Initiate Profile
              </span>
            </div>
            <h1 className="text-4xl font-black text-white tracking-tighter alchm-gradient-text uppercase">
              {userName}
            </h1>
            <div className="flex items-center gap-3 mt-1.5">
              <span className="text-[10px] font-black px-3 py-1 rounded-full glass-base text-white/30 border border-white/8 uppercase tracking-[0.2em]">
                Free — Initiate
              </span>
            </div>
          </div>
          <button
            onClick={() => { void signOut({ callbackUrl: '/' }); }}
            className="p-2.5 rounded-full glass-base text-white/20 hover:text-white/50 border border-white/5 transition-all"
            title="Sign out"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </motion.header>

        {/* ── Tab Nav ── */}
        <div className="flex gap-1 p-1 bg-white/[0.02] rounded-2xl border border-white/5 mb-8 w-fit">
          {FREE_NAV.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-[0.2em]
                transition-all duration-300 whitespace-nowrap
                ${activeTab === tab.id
                  ? 'bg-white/8 text-white border border-white/10'
                  : 'text-white/25 hover:text-white/50'
                }
              `}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Tab Content ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.28 }}
          >
            {activeTab === 'profile' && (
              <div className="space-y-8">
                {/* Profile card */}
                <ProfileHeroCard
                  userName={userName}
                  email={email}
                  natalChart={natalChart}
                  tier="free"
                  onEditProfile={onEditBirthData}
                  onOpenSettings={() => setActiveTab('settings')}
                />

                {/* Free data: constitution + elemental */}
                <div className="grid md:grid-cols-2 gap-6">
                  <AlchemicalConstitutionPanel natalChart={natalChart} />
                  <ElementalWheel natalChart={natalChart} />
                </div>

                {/* Blurred ledger preview — Adept teaser */}
                <BlurredLedgerPreview />

                {/* Free nav tiles */}
                <div className="grid grid-cols-2 gap-4">
                  <Link
                    href="/birth-chart"
                    className="glass-card-premium rounded-2xl p-5 border-white/8 hover:border-purple-500/25 transition-all group"
                  >
                    <div className="text-2xl mb-2">🌌</div>
                    <div className="text-[11px] font-black text-white/50 uppercase tracking-[0.2em] group-hover:text-white transition-colors">
                      Natal Chart
                    </div>
                    <div className="text-[9px] text-white/20 mt-0.5">Your birth placements</div>
                  </Link>
                  <Link
                    href="/current-chart"
                    className="glass-card-premium rounded-2xl p-5 border-white/8 hover:border-blue-500/25 transition-all group"
                  >
                    <div className="text-2xl mb-2">⚡</div>
                    <div className="text-[11px] font-black text-white/50 uppercase tracking-[0.2em] group-hover:text-white transition-colors">
                      Current Transits
                    </div>
                    <div className="text-[9px] text-white/20 mt-0.5">Live sky now</div>
                  </Link>
                </div>

                {/* ── Premium Upgrade Section (single, elegant, no hard gates) ── */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="relative rounded-3xl overflow-hidden border border-purple-500/20"
                  style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.12) 0%, rgba(15,15,22,0.9) 60%, rgba(251,146,60,0.08) 100%)' }}
                >
                  {/* Glow orb */}
                  <div className="absolute top-0 right-0 w-52 h-52 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

                  <div className="relative z-10 p-8">
                    <div className="flex items-start justify-between gap-6 mb-6">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-amber-400 text-lg">✦</span>
                          <h3 className="text-lg font-black text-white tracking-tight">
                            Ascend to Premium Adept
                          </h3>
                        </div>
                        <p className="text-white/40 text-sm max-w-lg leading-relaxed">
                          Unlock the full alchemical system — advanced transit forecasts, the token economy, 
                          group meal planning, planetary remedies, and daily cosmic insights.
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-3xl font-black text-white">$5</div>
                        <div className="text-[10px] text-white/30 uppercase tracking-widest">per month</div>
                      </div>
                    </div>

                    {/* Feature grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-7">
                      {PREMIUM_FEATURES_DISPLAY.map((feat) => (
                        <div key={feat.feature} className="flex items-start gap-2.5">
                          <span className="text-amber-400 text-xs mt-0.5 flex-shrink-0">✦</span>
                          <div>
                            <p className="text-[11px] font-bold text-white/80">{feat.label}</p>
                            <p className="text-[10px] text-white/30 mt-0.5 leading-relaxed">{feat.description}</p>
                          </div>
                        </div>
                      ))}
                      {/* Extra highlights */}
                      <div className="flex items-start gap-2.5">
                        <span className="text-amber-400 text-xs mt-0.5 flex-shrink-0">✦</span>
                        <div>
                          <p className="text-[11px] font-bold text-white/80">2× Token Yields</p>
                          <p className="text-[10px] text-white/30 mt-0.5">Double daily ESMS payouts & streak bonuses</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <span className="text-amber-400 text-xs mt-0.5 flex-shrink-0">✦</span>
                        <div>
                          <p className="text-[11px] font-bold text-white/80">Full Token Economy</p>
                          <p className="text-[10px] text-white/30 mt-0.5">Complete transmutation ledger & quest rewards</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 flex-wrap">
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => { void openCheckout('premium'); }}
                        className="px-8 py-3 bg-gradient-to-r from-purple-600 to-amber-500 text-white rounded-full font-black text-sm uppercase tracking-[0.2em] shadow-[0_0_30px_rgba(139,92,246,0.3)] hover:shadow-[0_0_40px_rgba(139,92,246,0.5)] transition-all"
                      >
                        Upgrade to Premium
                      </motion.button>
                      <Link
                        href="/premium"
                        className="text-[11px] font-black text-white/30 hover:text-white/60 uppercase tracking-widest transition-colors"
                      >
                        Compare Plans →
                      </Link>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}

            {activeTab === 'cosmos' && (
              <div className="space-y-6">
                <CosmicAlignmentCard natalChart={natalChart} />
                {/* Show base dashboard */}
                <UserDashboard
                  session={session}
                  profileData={profileData}
                  natalChart={natalChart}
                  preferences={preferences}
                  onEditBirthData={onEditBirthData}
                  onEditPreferences={onEditPreferences}
                />
              </div>
            )}

            {activeTab === 'settings' && (
              <FreeSettingsPanel
                session={session}
                natalChart={natalChart}
                preferences={preferences}
                onEditBirthData={onEditBirthData}
                onEditPreferences={onEditPreferences}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Free Settings Panel ──────────────────────────────────────────────────────

function FreeSettingsPanel({
  session,
  natalChart,
  preferences,
  onEditBirthData,
  onEditPreferences,
}: {
  session: any;
  natalChart: NatalChart;
  preferences: UserPreferences;
  onEditBirthData: () => void;
  onEditPreferences: () => void;
}) {
  const chartDate = natalChart?.birthData?.dateTime
    ? new Date(natalChart.birthData.dateTime).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit',
      })
    : null;

  return (
    <div className="space-y-5 max-w-xl">
      <div className="glass-card-premium rounded-3xl p-6 border-white/8">
        <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] mb-4">Account</h3>
        <div className="space-y-2.5">
          {[
            { label: 'Name', value: session?.user?.name || '—' },
            { label: 'Email', value: session?.user?.email || '—' },
          ].map((r) => (
            <div key={r.label} className="flex items-center justify-between py-1.5 border-b border-white/[0.04] last:border-0">
              <span className="text-xs text-white/30">{r.label}</span>
              <span className="text-xs font-medium text-white/70">{r.value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-card-premium rounded-3xl p-6 border-white/8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em]">Birth Data</h3>
          <button onClick={onEditBirthData} className="text-[10px] font-black text-purple-400 hover:text-purple-300 uppercase tracking-widest transition-colors">
            Edit
          </button>
        </div>
        {chartDate
          ? <p className="text-sm text-white/70">{chartDate}</p>
          : <p className="text-xs text-white/25 italic">No birth data on record.</p>
        }
      </div>

      <div className="glass-card-premium rounded-3xl p-6 border-white/8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em]">Preferences</h3>
          <button onClick={onEditPreferences} className="text-[10px] font-black text-purple-400 hover:text-purple-300 uppercase tracking-widest transition-colors">
            Edit
          </button>
        </div>
        <div className="text-xs text-white/40 space-y-1">
          <p>Spice: <span className="text-white/70 capitalize">{preferences.spicePreference}</span></p>
          <p>Complexity: <span className="text-white/70 capitalize">{preferences.complexity}</span></p>
        </div>
      </div>

      <div className="flex justify-center pt-2">
        <button
          onClick={() => { void signOut({ callbackUrl: '/' }); }}
          className="px-8 py-3 bg-red-500/8 text-red-400/80 rounded-full hover:bg-red-500/12 transition-all text-[10px] font-black uppercase tracking-[0.2em] border border-red-500/12"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}

// ─── Loading / Auth screens ────────────────────────────────────────────────────

function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-[#08080e] flex items-center justify-center">
      <div className="relative">
        <div className="w-14 h-14 rounded-full border-2 border-white/8 animate-spin border-t-purple-400" />
        <div className="absolute inset-0 w-14 h-14 rounded-full border-2 border-transparent animate-spin border-b-amber-400 [animation-delay:0.2s]" />
      </div>
    </div>
  );
}

// ─── Main Profile Page ─────────────────────────────────────────────────────────

export default function ProfilePage() {
  const { data: session, status, update: updateSession } = useSession();
  const { state: _state } = useAlchemical();
  const { tier, isLoading: premiumLoading } = usePremium();

  const [profileData, setProfileData] = useState<any>(null);
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [currentStep, setCurrentStep] = useState<ProfileStep>('birth-data');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingProfile, setIsFetchingProfile] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [birthDateTime, setBirthDateTime] = useState('');
  const [birthLocation, setBirthLocation] = useState<{
    displayName: string; latitude: number; longitude: number;
  } | null>(null);

  const determineStep = useCallback((profile: any, _prefs: UserPreferences, _prefsComplete: boolean): ProfileStep => {
    if (!profile?.natalChart) return 'birth-data';
    return 'dashboard';
  }, []);

  useEffect(() => {
    async function fetchProfile() {
      if (status !== 'authenticated' || !session) {
        setIsFetchingProfile(false);
        return;
      }

      let profile: any = null;
      let serverProfileLoaded = false;

      try {
        const res = await fetch('/api/user/profile', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.profile) {
            profile = data.profile;
            serverProfileLoaded = true;
          }
        }
      } catch (err) {
        console.error('Failed to fetch profile from API:', err);
      }

      if (serverProfileLoaded && !profile?.natalChart && typeof window !== 'undefined') {
        localStorage.removeItem('userProfile');
      }

      if (!serverProfileLoaded && !profile?.natalChart) {
        try {
          const stored = getStorageItem('userProfile');
          if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed?.natalChart) {
              profile = {
                ...parsed,
                userId: parsed.userId || session.user?.id,
                name: parsed.name || session.user?.name,
                email: parsed.email || session.user?.email,
              };
            }
          }
        } catch {
          // localStorage parse failed
        }
      }

      if (profile) setProfileData(profile);

      const storedPrefs = getStorageItem('userFoodPreferences');
      const loadedPrefs = storedPrefs ? JSON.parse(storedPrefs) : DEFAULT_PREFERENCES;
      setPreferences(loadedPrefs);

      const prefsComplete = !!getStorageItem('preferencesCompleted');
      setCurrentStep(determineStep(profile, loadedPrefs, prefsComplete));
      setIsFetchingProfile(false);
    }
    void fetchProfile();
  }, [status, session, determineStep]);

  // Birth data submission
  const handleBirthDataSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!session?.user?.email || !session?.user?.name) {
      setError('Session missing user info. Please log out and log in again.');
      return;
    }
    if (!birthLocation) { setError('Please select a birth location.'); return; }
    if (!birthDateTime) { setError('Please enter your birth date and time.'); return; }

    setIsLoading(true);
    try {
      const birthData: BirthData = {
        dateTime: new Date(birthDateTime).toISOString(),
        latitude: birthLocation.latitude,
        longitude: birthLocation.longitude,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      };

      const response = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: session.user.email, name: session.user.name, birthData }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError('Your session has expired. Please log out and sign in again.');
          return;
        }
        throw new Error(`Server error (${response.status})`);
      }
      const result = await response.json();
      if (!result.success) throw new Error(result.message || 'Chart calculation failed');

      localStorage.setItem('userProfile', JSON.stringify({
        userId: session.user.id,
        email: session.user.email,
        name: session.user.name,
        birthData,
        natalChart: result.natalChart,
      }));

      await updateSession();
      document.cookie = 'onboarding_completed=1; path=/; max-age=2592000; SameSite=Lax';
      window.location.href = '/profile';
    } catch (err: any) {
      console.error('Onboarding error:', err);
      setError(err.message || 'An error occurred while calculating your chart');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreferencesSave = (updatedPrefs: UserPreferences) => {
    setPreferences(updatedPrefs);
    if (typeof window !== 'undefined') {
      localStorage.setItem('userFoodPreferences', JSON.stringify(updatedPrefs));
      localStorage.setItem('preferencesCompleted', 'true');
    }
    fetch('/api/user/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ preferences: updatedPrefs }),
    }).catch(() => { /* silent */ });

    // Fire the Temporal Anchor quest — rewards if all essentials are filled.
    const essentialsFilled =
      updatedPrefs.preferredCuisines.length > 0 &&
      updatedPrefs.dietaryRestrictions.length >= 0 &&
      !!updatedPrefs.spicePreference &&
      !!updatedPrefs.complexity;
    if (essentialsFilled) {
      fetch('/api/quests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ event: 'preferences_complete' }),
      })
        .then((res) => res.ok && res.json())
        .then((data) => {
          if (data?.completedQuests?.length > 0 && typeof window !== 'undefined') {
            void import('@/hooks/useTokenEconomy').then(({ emitTokenEconomyUpdate }) => {
              emitTokenEconomyUpdate({
                source: 'quest',
                credits: { spirit: 25, essence: 25, matter: 25, substance: 25 },
              });
            });
          }
        })
        .catch(() => { /* silent */ });
    }
    setCurrentStep('dashboard');
  };

  // Auth states
  if (status === 'loading' || premiumLoading) return <ProfileSkeleton />;
  if (status === 'unauthenticated' || !session) return null;

  // Shared props for sub-dashboards
  const dashboardProps = {
    session,
    profileData,
    natalChart: profileData?.natalChart,
    preferences,
    onEditBirthData: () => setCurrentStep('birth-data'),
    onEditPreferences: () => setCurrentStep('preferences'),
  };

  return (
    <div className="min-h-screen">
      {/* Global error banner */}
      {error && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 max-w-lg w-full px-4">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-950/90 border border-red-500/30 text-red-300 p-4 rounded-2xl shadow-2xl backdrop-blur-xl"
          >
            <p className="text-xs font-medium">{error}</p>
          </motion.div>
        </div>
      )}

      {/* ── Routing ── */}
      {isFetchingProfile ? (
        <ProfileSkeleton />
      ) : currentStep === 'birth-data' ? (
        <BirthDataScreen
          birthDateTime={birthDateTime}
          setBirthDateTime={setBirthDateTime}
          birthLocation={birthLocation}
          setBirthLocation={setBirthLocation}
          onSubmit={(e) => { void handleBirthDataSubmit(e); }}
          isLoading={isLoading}
          hasExistingChart={!!profileData?.natalChart}
          onSkip={profileData?.natalChart ? () => setCurrentStep('dashboard') : undefined}
        />
      ) : currentStep === 'preferences' ? (
        <div className="min-h-screen bg-[#08080e] flex items-center justify-center p-6">
          <div className="w-full max-w-2xl">
            <FoodPreferences
              preferences={preferences}
              onSave={handlePreferencesSave}
              onBack={() => setCurrentStep('birth-data')}
            />
          </div>
        </div>
      ) : profileData?.natalChart ? (
        // ── Tier-aware dashboard split ──
        tier === 'premium' ? (
          <PremiumDashboard {...dashboardProps} natalChart={profileData.natalChart} />
        ) : (
          <FreeDashboard {...dashboardProps} natalChart={profileData.natalChart} />
        )
      ) : (
        <div className="min-h-screen bg-[#08080e] flex items-center justify-center">
          <div className="glass-card-premium rounded-3xl p-10 text-center max-w-sm border-white/8">
            <p className="text-white/40 text-sm mb-5">
              Complete your natal chart to access the dashboard.
            </p>
            <button
              onClick={() => setCurrentStep('birth-data')}
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-amber-500 text-white rounded-full font-black text-sm uppercase tracking-[0.2em]"
            >
              Enter Birth Data
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Birth Data Screen ─────────────────────────────────────────────────────────

function BirthDataScreen({
  birthDateTime,
  setBirthDateTime,
  birthLocation: _birthLocation,
  setBirthLocation,
  onSubmit,
  isLoading,
  hasExistingChart,
  onSkip,
}: {
  birthDateTime: string;
  setBirthDateTime: (v: string) => void;
  birthLocation: { displayName: string; latitude: number; longitude: number } | null;
  setBirthLocation: (v: { displayName: string; latitude: number; longitude: number } | null) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  hasExistingChart: boolean;
  onSkip?: () => void;
}) {
  return (
    <div className="min-h-screen bg-[#08080e] flex items-center justify-center p-6">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-950/20 via-[#08080e] to-amber-950/10" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-purple-700/6 rounded-full blur-[140px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-lg"
      >
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-base border border-white/8 mb-5">
            <span className="text-amber-400 text-lg">⚗️</span>
            <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">
              Alchm.kitchen
            </span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tighter mb-3">
            {hasExistingChart ? 'Recalibrate Your Chart' : 'Calculate Your Natal Chart'}
          </h1>
          <p className="text-white/30 text-sm leading-relaxed max-w-sm mx-auto">
            Your birth time and location power personalized alchemical food recommendations via the ESMS system.
          </p>
        </div>

        {/* Form card */}
        <div className="glass-card-premium rounded-3xl p-8 border-white/8">
          <form onSubmit={onSubmit} className="space-y-6">
            <div>
              <label htmlFor="birthDateTime" className="block text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mb-2">
                Birth Date & Time <span className="text-red-400">*</span>
              </label>
              <input
                id="birthDateTime"
                type="datetime-local"
                value={birthDateTime}
                onChange={(e) => setBirthDateTime(e.target.value)}
                required
                className="w-full px-4 py-3 bg-white/[0.04] border border-white/10 rounded-2xl text-white focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all text-sm"
                style={{ colorScheme: 'dark' }}
              />
              <p className="text-[10px] text-white/20 mt-2">Enter as precisely as possible for the most accurate chart.</p>
            </div>

            <div>
              <label htmlFor="birthLocation" className="block text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mb-2">
                Birth Location <span className="text-red-400">*</span>
              </label>
              <div id="birthLocation" className="[&_input]:bg-white/[0.04] [&_input]:border-white/10 [&_input]:border [&_input]:rounded-2xl [&_input]:text-white [&_input]:outline-none [&_input]:px-4 [&_input]:py-3 [&_input]:w-full [&_input]:text-sm">
                <LocationSearch onLocationSelect={(loc) => setBirthLocation(loc)} />
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 px-6 py-3.5 bg-gradient-to-r from-purple-600 to-amber-500 text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] hover:shadow-[0_0_30px_rgba(139,92,246,0.4)] transition-all disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    Calculating...
                  </span>
                ) : hasExistingChart ? 'Recalculate Chart' : 'Calculate My Chart'}
              </motion.button>
              {onSkip && (
                <button
                  type="button"
                  onClick={onSkip}
                  className="px-6 py-3.5 glass-base text-white/40 rounded-2xl font-medium hover:text-white/70 transition-colors border border-white/8 text-sm"
                >
                  Skip
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Why cards */}
        <div className="grid grid-cols-3 gap-3 mt-6">
          {[
            { icon: '🔮', title: 'Natal Chart', desc: 'Your cosmic blueprint at birth' },
            { icon: '⚗️', title: 'ESMS Profile', desc: 'Spirit, Essence, Matter & Substance' },
            { icon: '🍽️', title: 'Food Alignment', desc: 'Tailored culinary recommendations' },
          ].map((c) => (
            <div key={c.title} className="glass-base rounded-2xl p-4 text-center border border-white/5">
              <div className="text-2xl mb-2">{c.icon}</div>
              <div className="text-[10px] font-black text-white/50 uppercase tracking-wider">{c.title}</div>
              <div className="text-[9px] text-white/20 mt-1">{c.desc}</div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
