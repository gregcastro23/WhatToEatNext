"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";
import Header from "@/components/Header";
import AgentProfileWeekCard from "@/components/menu-planner/redesign/AgentProfileWeekCard";
import { CustomizeDrawer } from "@/components/profile/CustomizeDrawer";
import { LiveAgentFeed } from "@/components/profile/LiveAgentFeed";
import { PROFILE_BLOCKS, type ProfileTab } from "@/components/profile/ProfileBlockRegistry";
import { CosmicIdentityPanel } from "@/components/profile/tables/CosmicIdentityPanel";
import { FollowListSheet } from "@/components/profile/tables/FollowListSheet";
import { ProfileIdentityPanel } from "@/components/profile/tables/ProfileIdentityPanel";
import { ProfileStatsPanel } from "@/components/profile/tables/ProfileStatsPanel";
import { TableMemoriesGallery } from "@/components/profile/tables/TableMemoriesGallery";
import type { CraftedAgentProfile } from "@/lib/agents/craftedAgentTypes";
import type { ProfileSocialBlock } from "@/types/social";
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
  avatarUrl: string | null;
  social: ProfileSocialBlock;
  /** Owner-only: the "post anonymously by default" toggle state. */
  shareIdentity?: boolean;
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

const TOKEN_VISUAL: Record<string, { symbol: string; color: string }> = {
  spirit: { symbol: "🝇", color: "text-amber-400" },
  essence: { symbol: "🝑", color: "text-blue-400" },
  matter: { symbol: "🝙", color: "text-emerald-400" },
  substance: { symbol: "🝉", color: "text-purple-400" },
};

const EMPTY_SOCIAL: ProfileSocialBlock = {
  followers: 0,
  following: 0,
  commensals: 0,
  tablesHosted: null,
  tablesJoined: null,
  viewer: null,
};

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
  const [followSheetOpen, setFollowSheetOpen] = useState(false);

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
          setProfile({ social: EMPTY_SOCIAL, ...data.profile });
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
  const social = profile?.social ?? EMPTY_SOCIAL;

  return (
    <main className="min-h-screen bg-[#08080e] pb-24 text-white">
      <Header onServingsChange={() => {}} />

      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-950/20 via-[#08080e] to-amber-950/10" />
        <div className="absolute top-1/4 left-1/3 w-[600px] h-[500px] bg-purple-600/6 rounded-full blur-[140px]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 pt-32">
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

        {/* Living weekly-menu fixture for agent profiles (self-hides when the
            agent hasn't published a week). */}
        {!loading && profile?.isAgent && (
          <div className="mb-6">
            <AgentProfileWeekCard
              userId={profile.userId}
              agentName={profile.name}
            />
          </div>
        )}

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
            userId={profile.userId}
            viewer={social.viewer}
          />
        ) : (
          <div className="grid md:grid-cols-12 gap-6 mb-8">
            {/* ── Left rail: identity, stats, cosmic identity (§3.5) ── */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="md:col-span-4 space-y-6"
            >
              <ProfileIdentityPanel
                userId={profile.userId}
                name={profile.name}
                isAgent={profile.isAgent}
                agentSlug={profile.agentSlug}
                avatarUrl={profile.avatarUrl}
                dominantElement={profile.dominantElement}
                natalPositions={profile.natalPositions ?? []}
                bio={profile.bio}
                createdAt={profile.createdAt}
                isOwner={isOwner}
                shareIdentity={profile.shareIdentity}
                viewer={social.viewer}
                tablesAvailable={social.tablesHosted !== null}
                onAvatarChanged={(avatarUrl) =>
                  setProfile((prev) => (prev ? { ...prev, avatarUrl } : prev))
                }
              />
              <ProfileStatsPanel
                social={social}
                onOpenFollowers={() => setFollowSheetOpen(true)}
              />
              <CosmicIdentityPanel
                elementalAffinities={profile.tasteGraph?.elementalAffinities}
                dominantElement={profile.dominantElement}
              />
            </motion.div>

            {/* ── Main column: memories + the existing block system ── */}
            <div className="md:col-span-8 space-y-6">
              <TableMemoriesGallery userId={profile.userId} />

              <div>
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

                <div className="space-y-4">
                  {layout.map((blockId: string) => {
                    const block = PROFILE_BLOCKS[blockId];
                    if (!block) return null;
                    if (block.tab !== activeTab) return null;
                    if (block.visibleTo === "owner" && !isOwner) return null;

                    return <div key={blockId} className="text-white bg-white/5 border border-white/10 rounded-xl overflow-hidden">{block.render({ data: profile, isOwner })}</div>;
                  })}
                </div>
              </div>

              <div className="grid sm:grid-cols-4 gap-4">
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
                <section className="glass-card-premium rounded-3xl p-6 md:p-8 border-white/8">
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
            </div>
          </div>
        )}

        {!loading && !error && profile && (
          <section className="glass-card-premium rounded-3xl p-6 md:p-8 border-white/8">
            <h2 className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] mb-4">
              Live Feed
            </h2>
            <LiveAgentFeed
              userId={profile.userId}
              initialEvents={profile.recentActivity}
            />
          </section>
        )}
      </div>
      {profile && (
        <FollowListSheet
          userId={profile.userId}
          open={followSheetOpen}
          onClose={() => setFollowSheetOpen(false)}
          viewerSignedIn={Boolean(session?.user?.id)}
          viewerId={session?.user?.id ?? null}
        />
      )}
      <CustomizeDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        layout={layout}
        onUpdateLayout={(newLayout) => setLayout(newLayout)}
      />
    </main>
  );
}
