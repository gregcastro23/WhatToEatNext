"use client";

import { ArrowRight, Check, Loader2, Sparkles } from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import type { CommunityTip } from "@/lib/validation/socialResponseSchemas";

interface HistoricalCouncilAgent {
  slug: string;
  name: string;
  title: string;
  element: "Fire" | "Water" | "Air" | "Earth";
  color: string;
  symbol: string;
}

const CANONICAL_COUNCIL: HistoricalCouncilAgent[] = [
  {
    slug: "leonardo-da-vinci",
    name: "Leonardo da Vinci",
    title: "Ethical Vegetarian",
    element: "Fire",
    color: "#ef4444",
    symbol: "⚗️",
  },
  {
    slug: "socrates",
    name: "Socrates",
    title: "Dialectic Moderation",
    element: "Air",
    color: "#10b981",
    symbol: "🏛️",
  },
  {
    slug: "carl-jung",
    name: "Carl Jung",
    title: "Archetypal Soul",
    element: "Fire",
    color: "#f59e0b",
    symbol: "🌀",
  },
  {
    slug: "cleopatra",
    name: "Cleopatra",
    title: "Royal Botanicals",
    element: "Water",
    color: "#3b82f6",
    symbol: "👑",
  },
  {
    slug: "hildegard-of-bingen",
    name: "Hildegard von Bingen",
    title: "Viriditas Healing",
    element: "Fire",
    color: "#14b8a6",
    symbol: "🌿",
  },
  {
    slug: "isaac-newton",
    name: "Isaac Newton",
    title: "Thermal Precision",
    element: "Earth",
    color: "#8b5cf6",
    symbol: "📐",
  },
  {
    slug: "aristotle",
    name: "Aristotle",
    title: "The Golden Mean",
    element: "Earth",
    color: "#a855f7",
    symbol: "⚖️",
  },
];

interface RecipeAgentCouncilProps {
  recipeId: string;
  recipeName?: string | undefined;
  onCritiqueGenerated?: ((tip: CommunityTip) => void) | undefined;
}

export function RecipeAgentCouncil({
  recipeId,
  recipeName,
  onCritiqueGenerated,
}: RecipeAgentCouncilProps): React.JSX.Element {
  const [selectedAgent, setSelectedAgent] = useState<HistoricalCouncilAgent>(CANONICAL_COUNCIL[0]!);
  const [loading, setLoading] = useState(false);
  const [activeCritique, setActiveCritique] = useState<{
    author: string;
    agentSlug: string;
    tip: string;
    dominantElement?: string;
  } | null>(null);

  const requestCritique = async (agent: HistoricalCouncilAgent): Promise<void> => {
    setSelectedAgent(agent);
    setLoading(true);
    setActiveCritique(null);

    try {
      const res = await fetch(`/api/recipes/${encodeURIComponent(recipeId)}/critique`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentSlug: agent.slug,
          recipeName,
        }),
      });

      if (!res.ok) {
        throw new Error(`Failed to request critique (${res.status})`);
      }

      const data = await res.json();
      if (data.success && data.review) {
        const critiqueObj = {
          author: data.review.author || agent.name,
          agentSlug: agent.slug,
          tip: data.review.tip,
          dominantElement: data.review.dominantElement || agent.element,
        };
        setActiveCritique(critiqueObj);

        if (onCritiqueGenerated) {
          onCritiqueGenerated({
            author: critiqueObj.author,
            rating: 5,
            tip: critiqueObj.tip,
            postedAt: data.review.postedAt || new Date().toISOString(),
          });
        }
      }
    } catch (err) {
      console.error("[RecipeAgentCouncil] critique request failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-950/20 via-black/40 to-[#0c0d18] p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span>Historical Council Critique</span>
              <Badge variant="outline" className="text-[9px] bg-purple-500/10 text-purple-300 border-purple-500/30 py-0">
                On-Demand
              </Badge>
            </h4>
            <p className="text-[11px] text-white/50">
              Request an authentic culinary reflection from historical stewards.
            </p>
          </div>
        </div>
      </div>

      {/* Agents Selection Strip */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
        {CANONICAL_COUNCIL.map((agent) => {
          const isSelected = selectedAgent.slug === agent.slug;
          return (
            <button
              key={agent.slug}
              type="button"
              onClick={() => { requestCritique(agent).catch(() => {}); }}
              disabled={loading}
              className={`shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border transition-all cursor-pointer disabled:opacity-50 ${
                isSelected
                  ? "bg-purple-600/25 border-purple-500/60 text-white shadow-md shadow-purple-900/30 scale-[1.02]"
                  : "bg-white/[0.03] border-white/8 text-white/70 hover:bg-white/[0.07] hover:text-white"
              }`}
            >
              <span className="text-sm">{agent.symbol}</span>
              <div className="text-left">
                <span className="block font-semibold leading-tight">{agent.name}</span>
                <span className="block text-[9px] text-white/40">{agent.title}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Loading state */}
      {loading && (
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-center gap-3 text-xs text-purple-200">
          <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
          <span>{selectedAgent.name} is examining the culinary essences of this dish...</span>
        </div>
      )}

      {/* Active Critique Card */}
      {activeCritique && !loading && (
        <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-500/30 space-y-2 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-base">{selectedAgent.symbol}</span>
              <span className="text-sm font-bold text-amber-300">{activeCritique.author}</span>
              <Badge variant="outline" className="text-[9px] bg-white/5 border-white/10 text-white/60">
                {activeCritique.dominantElement}
              </Badge>
              <span className="text-xs text-amber-400 flex items-center gap-0.5">
                ★★★★★
              </span>
            </div>
            <Link
              href={`/profile/${activeCritique.agentSlug}`}
              className="text-[11px] text-purple-300 hover:text-purple-200 flex items-center gap-1 font-medium group"
            >
              <span>View Profile</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
          <p className="text-xs sm:text-sm text-white/90 leading-relaxed italic pl-1 border-l-2 border-purple-400/40">
            &ldquo;{activeCritique.tip}&rdquo;
          </p>
          <p className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono pt-1">
            <Check className="w-3 h-3 inline" /> Dual-written to recipe Community Tips & feed events
          </p>
        </div>
      )}
    </div>
  );
}
