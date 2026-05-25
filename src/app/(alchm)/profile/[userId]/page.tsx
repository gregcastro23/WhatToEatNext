"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";
import Header from "@/components/Header";
import { CustomizeDrawer } from "@/components/profile/CustomizeDrawer";
import { PROFILE_BLOCKS, type ProfileTab } from "@/components/profile/ProfileBlockRegistry";
import type { CraftedAgentProfile } from "@/lib/agents/craftedAgentTypes";
import { narrateFeedEvent } from "@/lib/feed/eventNarration";
import AgentProfile from "./AgentProfile";

interface NatalPosition {
  planet?: string;
  sign?: string;
  degree?: number;
}

interface RecentActivity {
  id: string;
  eventType: string;
  metadataPayload: Record<string, unknown> | null;
  createdAt: string;
}

interface PublicProfile {
  userId: string;
  handle: string | null;
  name: string;
  isAgent: boolean;
  agentSlug: string | null;
  agentProfile: CraftedAgentProfile | null;
  agentInteractions?: any[];
  agentActions?: any[];
  agentArtifacts?: any[];
  bio: string | null;
  dominantElement: string | null;
  natalChart: any;
  natalPositions: NatalPosition[];
  birthData: { date?: string; time?: string; location?: string } | null;
  createdAt: string;
  balances: { spirit: number; essence: number; matter: number; substance: number };
  recentActivity: RecentActivity[];
  dietary_preferences?: any;
  profile_layout?: string[];
  tasteGraph?: any;
}

const ELEMENT_COLORS: Record<string, { glow: string; text: string }> = {
  Fire: { glow: "shadow-amber-500/30", text: "text-amber-400" },
  Water: { glow: "shadow-blue-500/30", text: "text-blue-400" },
  Earth: { glow: "shadow-emerald-500/30", text: "text-emerald-400" },
  Air: { glow: "shadow-purple-500/30", text: "text-purple-400" },
};

const TOKEN_VISUAL: Record<string, { symbol: string; color: string }> = {
  spirit: { symbol: "🝇", color: "text-amber-400" },
  essence: { symbol: "🝑", color: "text-blue-400" },
  matter: { symbol: "🝙", color: "text-emerald-400" },
  substance: { symbol: "🝉", color: "text-purple-400" },
};

function formatRelativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  const diffSec = Math.max(0, Math.floor((Date.now() - then) / 1000));
  if (diffSec < 60) return "just now";
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86_400) return `${Math.floor(diffSec / 3600)}h ago`;
  return `${Math.floor(diffSec / 86_400)}d ago`;
}

function formatPlacement(placement: NatalPosition): string | null {
  if (!placement.planet) return null;
  const degree = typeof placement.degree === "number" ? `${placement.degree.toFixed(1)}°` : "";
  const sign = placement.sign ? ` ${placement.sign}` : "";
  return `${placement.planet} ${degree}${sign}`.trim();
}

export default function PublicProfilePage() {
  const params = useParams<{ userId: string }>();
  const userId = params?.userId;
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { data: session } = useSession();
  const isOwner = session?.user?.id === profile?.userId;
  const [activeTab, setActiveTab] = useState<ProfileTab>("Palate");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [layout, setLayout] = useState<string[]>([]);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(`/api/users/${userId}`);
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok || !data.success) {
          setError(data.message || "Profile unavailable");
        } else {
          setProfile(data.profile);
          setLayout(data.profile.profile_layout || ["natalChart", "alchemicalConstitution", "tasteGraph", "dietaryPrefs", "insightsTicker", "tokenEconomy", "recentActivity"]);
        }
      } catch (_err) {
        if (!cancelled) setError("Network error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const placements = (profile?.natalPositions ?? [])
    .map(formatPlacement)
    .filter(Boolean) as string[];

  const hasEnrichedAgent = !!(profile?.isAgent && profile.agentProfile);

  return (
    <main className="min-h-screen bg-[#08080e] pb-24 text-white">
      <Header onServingsChange={() => {}} />

      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-950/20 via-[#08080e] to-amber-950/10" />
        <div className="absolute top-1/4 left-1/3 w-[600px] h-[500px] bg-purple-600/6 rounded-full blur-[140px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 pt-32">
        <div className="flex justify-between items-center mb-8">
          <Link
            href="/feed"
            className="inline-flex items-center gap-2 text-xs text-white/50 hover:text-white uppercase tracking-widest"
          >
            ← Back to Network Feed
          </Link>
          {isOwner && (
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="px-4 py-2 bg-purple-500/10 text-purple-300 border border-purple-500/20 hover:bg-purple-500/20 rounded-full text-xs font-bold uppercase tracking-widest transition-colors"
            >
              Customize Layout
            </button>
          )}
        </div>

        {loading ? (
          <div className="glass-card-premium rounded-3xl p-12 border-white/8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto" />
          </div>
        ) : error || !profile ? (
          <div className="glass-card-premium rounded-3xl p-12 border-white/8 text-center">
            <p className="text-white/40 text-sm">{error || "Profile not found."}</p>
          </div>
        ) : hasEnrichedAgent ? (
          <AgentProfile
            agent={profile.agentProfile!}
            balances={profile.balances}
            handle={profile.handle}
            interactions={profile.agentInteractions || []}
            actions={profile.agentActions || []}
            artifacts={profile.agentArtifacts || []}
          />
        ) : (
          <>
            <motion.section
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card-premium rounded-3xl p-8 md:p-10 border-white/8 mb-8 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/8 rounded-full blur-3xl pointer-events-none" />
              <div className="relative z-10 flex flex-col md:flex-row md:items-start gap-6">
                <div
                  className={`w-20 h-20 rounded-2xl border border-white/10 flex items-center justify-center text-3xl shadow-inner ${
                    profile.isAgent
                      ? "bg-purple-900/40 shadow-purple-500/10"
                      : "bg-emerald-900/30 shadow-emerald-500/10"
                  }`}
                >
                  {profile.isAgent ? "🤖" : "🜍"}
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <h1 className="text-3xl md:text-4xl font-black text-white tracking-tighter">
                      {profile.name}
                    </h1>
                    {profile.isAgent && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-purple-500/20 text-purple-200 border border-purple-400/30">
                        Planetary Agent
                      </span>
                    )}
                    {profile.dominantElement && (
                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-white/10 bg-white/5 ${
                          ELEMENT_COLORS[profile.dominantElement]?.text || "text-white/70"
                        }`}
                      >
                        {profile.dominantElement} Dominant
                      </span>
                    )}
                  </div>
                  {profile.handle && (
                    <p className="text-[11px] uppercase tracking-widest text-white/30 font-mono">
                      {profile.handle}
                    </p>
                  )}
                  {profile.bio && (
                    <p className="text-sm text-white/70 leading-relaxed mt-4 max-w-2xl">
                      {profile.bio}
                    </p>
                  )}
                  {profile.birthData?.date && (
                    <p className="text-[10px] uppercase tracking-widest text-white/30 mt-4">
                      Born {profile.birthData.date}
                      {profile.birthData.time ? ` · ${profile.birthData.time}` : ""}
                      {profile.birthData.location ? ` · ${profile.birthData.location}` : ""}
                    </p>
                  )}
                </div>
              </div>
            </motion.section>

            <div className="flex space-x-6 border-b border-white/10 mb-6">
              {(["Essence", "Palate", "Practice"] as ProfileTab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-2 text-sm uppercase tracking-widest font-bold transition-colors ${
                    activeTab === tab 
                      ? "border-b-2 border-purple-500 text-purple-400" 
                      : "text-white/40 hover:text-white/70"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="space-y-4 mb-8">
              {layout.map((blockId: string) => {
                const block = PROFILE_BLOCKS[blockId];
                if (!block) return null;
                if (block.tab !== activeTab) return null;
                if (block.visibleTo === "owner" && !isOwner) return null;

                return <div key={blockId} className="text-white bg-white/5 border border-white/10 rounded-xl overflow-hidden">{block.render({ data: profile, isOwner })}</div>;
              })}
            </div>

            <div className="grid md:grid-cols-4 gap-4 mb-8">
              {(["spirit", "essence", "matter", "substance"] as const).map((key) => {
                const visual = TOKEN_VISUAL[key];
                return (
                  <div
                    key={key}
                    className="glass-base rounded-2xl p-4 border border-white/8 flex items-center gap-3"
                  >
                    <span className={`text-xl ${visual.color}`}>{visual.symbol}</span>
                    <div>
                      <p className="text-[9px] uppercase tracking-widest text-white/30 font-bold">
                        {key}
                      </p>
                      <p className="text-lg font-black text-white tabular-nums">
                        {profile.balances[key].toFixed(2)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {placements.length > 0 && (
              <section className="glass-card-premium rounded-3xl p-6 md:p-8 border-white/8 mb-8">
                <h2 className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] mb-4">
                  Natal Chart Highlights
                </h2>
                <div className="flex flex-wrap gap-2">
                  {placements.map((placement) => (
                    <span
                      key={placement}
                      className="px-3 py-1.5 rounded-full text-xs font-medium border border-purple-400/15 bg-purple-500/10 text-purple-100/85"
                    >
                      {placement}
                    </span>
                  ))}
                </div>
              </section>
            )}
          </>
        )}

        {!loading && !error && profile && (
          <section className="glass-card-premium rounded-3xl p-6 md:p-8 border-white/8">
            <h2 className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] mb-4">
              Recent Activity
            </h2>
            {profile.recentActivity.length === 0 ? (
              <p className="text-sm text-white/40">No recorded actions yet.</p>
            ) : (
              <ul className="space-y-3">
                {profile.recentActivity.map((event) => {
                  const narration = narrateFeedEvent(
                    event.eventType,
                    event.metadataPayload,
                  );
                  return (
                    <li
                      key={event.id}
                      className="flex items-start gap-3 p-3 rounded-2xl border border-white/5 bg-white/[0.02]"
                    >
                      <span className="text-lg">{narration.icon}</span>
                      <div className="flex-1">
                        {narration.href ? (
                          <Link
                            href={narration.href}
                            className="text-sm text-white/85 hover:text-white underline decoration-purple-500/30 underline-offset-2"
                          >
                            {narration.label}
                          </Link>
                        ) : (
                          <p className="text-sm text-white/85">
                            {narration.label}
                          </p>
                        )}
                        <p className="text-[10px] uppercase tracking-widest text-white/30 mt-1">
                          {formatRelativeTime(event.createdAt)}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        )}
      </div>
      <CustomizeDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        layout={layout}
        onUpdateLayout={(newLayout) => setLayout(newLayout)}
      />
    </main>
  );
}

