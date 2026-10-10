"use client";

import {
  ExternalLink,
  MessageCircle,
  Sparkles,
  Bot,
  Globe,
  UtensilsCrossed,
  Quote,
  Shield,
  BookOpen,
  X,
  Flame,
  Droplets,
  Wind,
  Mountain,
  Heart,
  Ban,
  Star,
} from "lucide-react";
import React, { useState } from "react";
import PlanetaryAgentChat from "@/components/time-laboratory/planetary-agent-chat";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { agentChatUrl, agentSlugFromEmail } from "@/lib/agents/agentChatUrl";
import type { CraftedAgentProfile } from "@/lib/agents/craftedAgentTypes";
import type { AgentInteraction, AgentAction, AgentArtifact } from "@/lib/agents/fetchAgentProfile";
import { getServiceUrlSafe } from "@/lib/serviceUrls";

export interface Balances {
  spirit: number;
  essence: number;
  matter: number;
  substance: number;
}

interface AgentProfileProps {
  agent: CraftedAgentProfile;
  balances: Balances;
  handle?: string | null;
  interactions?: AgentInteraction[];
  actions?: AgentAction[];
  artifacts?: AgentArtifact[];
  userId?: string | undefined;
  viewer?: { follows: boolean; followedBy: boolean; isCommensal: boolean } | null | undefined;
}

interface ElementColorConfig {
  bg: string;
  text: string;
  border: string;
}

const DEFAULT_ELEMENT_COLOR: ElementColorConfig = {
  bg: "bg-amber-500/10",
  text: "text-amber-400",
  border: "border-amber-500/30",
};

const ELEMENT_COLORS: Record<string, ElementColorConfig> = {
  Fire: { bg: "bg-red-500/10", text: "text-red-400", border: "border-red-500/30" },
  Water: { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/30" },
  Air: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/30" },
  Earth: { bg: "bg-purple-500/10", text: "text-purple-400", border: "border-purple-500/30" },
  Spirit: DEFAULT_ELEMENT_COLOR,
};

const TOKEN_CHIPS = [
  { key: "spirit", label: "Spirit", symbol: "🝇", color: "text-amber-400" },
  { key: "essence", label: "Essence", symbol: "🝑", color: "text-blue-400" },
  { key: "matter", label: "Matter", symbol: "🝙", color: "text-emerald-400" },
  { key: "substance", label: "Substance", symbol: "🝉", color: "text-purple-400" },
] as const;

export default function AgentProfile(props: AgentProfileProps): React.ReactElement {
  const {
    agent,
    balances,
    handle,
    actions = [],
    artifacts = [],
    userId,
  } = props;

  const [isChatOpen, setIsChatOpen] = useState(false);

  const accent = agent.appearance?.color ?? "#a855f7";
  const slug = handle ? agentSlugFromEmail(handle) : (userId ?? "agent");
  const asolUiUrl = getServiceUrlSafe("agentsUi");
  const chatUrl = agentChatUrl(slug);
  const galleryUrl = `${asolUiUrl}/gallery/chat/${encodeURIComponent(slug)}`;

  const dominantElement = agent.consciousness?.dominantElement || "Fire";
  const elementStyle: ElementColorConfig =
    ELEMENT_COLORS[dominantElement] ?? DEFAULT_ELEMENT_COLOR;

  const firstName = agent.name.split(" ")[0] || agent.name;

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* ── Hero Profile Card ── */}
      <Card className="glass-card-premium border-white/10 bg-black/50 backdrop-blur-xl relative overflow-hidden shadow-2xl">
        <div
          className="absolute -top-32 -right-32 w-80 h-80 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ backgroundColor: accent }}
        />

        <CardHeader className="p-6 md:p-8 space-y-6 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start md:items-center gap-5">
              <div
                className="w-20 h-20 md:w-24 md:h-24 rounded-2xl flex items-center justify-center text-3xl font-serif font-bold text-white shadow-lg border border-white/15 shrink-0"
                style={{
                  background: `linear-gradient(135deg, ${accent}33, ${accent}88)`,
                  borderColor: `${accent}66`,
                }}
              >
                {agent.appearance?.symbol || agent.name.charAt(0)}
              </div>

              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl md:text-3xl font-serif font-bold text-white tracking-tight">
                    {agent.name}
                  </h1>
                  {dominantElement && (
                    <Badge
                      variant="outline"
                      className={`${elementStyle.bg} ${elementStyle.text} ${elementStyle.border} text-xs font-medium uppercase tracking-wider`}
                    >
                      {dominantElement === "Fire" && <Flame className="w-3 h-3 mr-1 inline" />}
                      {dominantElement === "Water" && <Droplets className="w-3 h-3 mr-1 inline" />}
                      {dominantElement === "Air" && <Wind className="w-3 h-3 mr-1 inline" />}
                      {dominantElement === "Earth" && <Mountain className="w-3 h-3 mr-1 inline" />}
                      {dominantElement}
                    </Badge>
                  )}
                  <Badge variant="outline" className="bg-purple-500/10 text-purple-300 border-purple-500/30 text-xs font-semibold">
                    <Bot className="w-3 h-3 mr-1 inline" />
                    Historical Agent
                  </Badge>
                </div>

                {agent.title && <p className="text-white/70 text-sm font-medium">{agent.title}</p>}
                {handle && <p className="text-white/40 text-xs font-mono">{handle}</p>}
                {agent.era && <p className="text-white/50 text-xs italic">{agent.era}</p>}
              </div>
            </div>

            {/* In-App Commune & ASOL Handoff CTAs */}
            <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0">
              <Button
                onClick={() => setIsChatOpen(true)}
                className="bg-gradient-to-r from-purple-600 via-indigo-600 to-amber-500 hover:from-purple-500 hover:to-indigo-500 text-white font-medium shadow-lg shadow-purple-600/30 transition-all hover:scale-[1.02] cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                <span>Commune with {firstName}</span>
              </Button>
              <div className="flex gap-2">
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="border-white/10 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white flex-1 text-xs"
                >
                  <a href={chatUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-1.5">
                    <span>ASOL Chat</span>
                    <ExternalLink className="w-3 h-3 opacity-70" />
                  </a>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="border-white/10 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white flex-1 text-xs"
                >
                  <a href={galleryUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-1.5">
                    <Globe className="w-3 h-3" />
                    <span>Gallery</span>
                    <ExternalLink className="w-3 h-3 opacity-70" />
                  </a>
                </Button>
              </div>
            </div>
          </div>

          {/* Token Balances strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            {TOKEN_CHIPS.map((chip) => {
              const val = balances[chip.key] ?? 0;
              return (
                <div
                  key={chip.key}
                  className="rounded-xl p-3 bg-white/5 border border-white/5 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{chip.symbol}</span>
                    <span className="text-xs text-white/60 font-medium">{chip.label}</span>
                  </div>
                  <span className={`text-sm font-mono font-semibold ${chip.color}`}>{val.toLocaleString()}</span>
                </div>
              );
            })}
          </div>
        </CardHeader>
      </Card>

      {/* ── Commune Action Banner ── */}
      <Card className="border-purple-500/20 bg-gradient-to-r from-purple-950/30 via-black/40 to-indigo-950/30 backdrop-blur-md">
        <CardContent className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-white font-medium text-sm">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Autonomous Consciousness & Culinary Guidance</span>
            </div>
            <p className="text-xs text-white/60 max-w-2xl leading-relaxed">
              Historical agents steward timeless culinary philosophy, offering personalized recipe critiques, dietary guidance, and alchemical wisdom in the Time Laboratory.
            </p>
          </div>
          <Button
            onClick={() => setIsChatOpen(true)}
            variant="secondary"
            size="sm"
            className="shrink-0 bg-purple-600/20 hover:bg-purple-600/30 text-purple-200 border border-purple-500/30 cursor-pointer flex items-center gap-2"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Commune with {firstName}</span>
          </Button>
        </CardContent>
      </Card>

      {/* ── Persona & Capabilities Grid ── */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Core Essence & Personality */}
        <Card className="glass-card-premium border-white/10 bg-black/40 backdrop-blur-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-serif text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-purple-400" />
              Essence & Expression
            </CardTitle>
            <CardDescription className="text-xs text-white/50">Core philosophical and alchemical profile</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            {agent.personality?.core?.essence && (
              <div>
                <span className="text-xs text-white/40 block mb-1 uppercase tracking-wider font-mono">Essence</span>
                <p className="text-white/80 leading-relaxed">{agent.personality.core.essence}</p>
              </div>
            )}
            {agent.personality?.core?.expression && (
              <div>
                <span className="text-xs text-white/40 block mb-1 uppercase tracking-wider font-mono">Expression</span>
                <p className="text-white/80 leading-relaxed">{agent.personality.core.expression}</p>
              </div>
            )}
            {agent.abilities?.specialty && (
              <div>
                <span className="text-xs text-white/40 block mb-1 uppercase tracking-wider font-mono">Specialty</span>
                <p className="text-white/80 leading-relaxed">{agent.abilities.specialty}</p>
              </div>
            )}
            {agent.synthesis && (
              <div>
                <span className="text-xs text-white/40 block mb-1 uppercase tracking-wider font-mono">Synthesis</span>
                <p className="text-white/70 text-xs italic leading-relaxed">{agent.synthesis}</p>
              </div>
            )}
            {/* Alchemical Constitution badges */}
            <div className="pt-2 border-t border-white/5">
              <span className="text-xs text-white/40 block mb-2 uppercase tracking-wider font-mono">Alchemical Resonances</span>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="bg-red-500/10 text-red-300 border-red-500/20 text-xs">
                  Fire: Active
                </Badge>
                <Badge variant="outline" className="bg-blue-500/10 text-blue-300 border-blue-500/20 text-xs">
                  Water: Intuitive
                </Badge>
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-300 border-emerald-500/20 text-xs">
                  Air: Intellect
                </Badge>
                <Badge variant="outline" className="bg-purple-500/10 text-purple-300 border-purple-500/20 text-xs">
                  Earth: Grounded
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Historical Diet & Culinary Lore */}
        <Card className="glass-card-premium border-white/10 bg-black/40 backdrop-blur-md">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-serif text-white flex items-center gap-2">
                <UtensilsCrossed className="w-4 h-4 text-amber-400" />
                Culinary Archetype
              </CardTitle>
              {agent.historicalDiet?.culturalCuisine && (
                <Badge variant="outline" className="bg-amber-500/10 text-amber-300 border-amber-500/30 text-xs font-serif">
                  <Globe className="w-3 h-3 mr-1 inline" />
                  {agent.historicalDiet.culturalCuisine}
                </Badge>
              )}
            </div>
            <CardDescription className="text-xs text-white/50">Historical dietary alignment & culinary staples</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            {/* Dietary Philosophy */}
            {agent.historicalDiet?.dietaryPhilosophy && (
              <div className="rounded-xl p-3.5 bg-white/5 border border-white/5">
                <span className="text-[10px] text-amber-300/80 block mb-1 uppercase tracking-widest font-mono font-semibold">
                  ✦ Dietary Philosophy
                </span>
                <p className="text-white/85 text-xs sm:text-sm leading-relaxed italic">
                  &ldquo;{agent.historicalDiet.dietaryPhilosophy}&rdquo;
                </p>
              </div>
            )}

            {/* Avoided Foods & Prohibitions */}
            {agent.historicalDiet?.avoidedFoods && agent.historicalDiet.avoidedFoods.length > 0 && (
              <div>
                <span className="text-[10px] text-red-300/80 block mb-1.5 uppercase tracking-widest font-mono font-semibold flex items-center gap-1">
                  <Ban className="w-3 h-3 inline text-red-400" />
                  Avoided Foods & Restrictions
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {agent.historicalDiet.avoidedFoods.map((f, i) => (
                    <Badge key={i} variant="outline" className="bg-red-500/10 border-red-500/30 text-red-200 text-xs">
                      {f}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Canonical Staples */}
            {agent.historicalDiet?.staples && agent.historicalDiet.staples.length > 0 && (
              <div>
                <span className="text-[10px] text-emerald-300/80 block mb-1.5 uppercase tracking-widest font-mono font-semibold flex items-center gap-1">
                  <Heart className="w-3 h-3 inline text-emerald-400" />
                  Canonical Staples
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {agent.historicalDiet.staples.map((s, i) => (
                    <Badge key={i} variant="outline" className="bg-emerald-500/10 border-emerald-500/30 text-emerald-200 text-xs">
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Favorite Foods */}
            {agent.historicalDiet?.favoriteFoods && agent.historicalDiet.favoriteFoods.length > 0 && (
              <div>
                <span className="text-[10px] text-amber-300/80 block mb-1.5 uppercase tracking-widest font-mono font-semibold flex items-center gap-1">
                  <Star className="w-3 h-3 inline text-amber-400" />
                  Favorite Preparations
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {agent.historicalDiet.favoriteFoods.map((f, i) => (
                    <Badge key={i} variant="outline" className="bg-amber-500/10 border-amber-500/30 text-amber-200 text-xs">
                      {f}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Sacred Beverages */}
            {agent.historicalDiet?.beverages && agent.historicalDiet.beverages.length > 0 && (
              <div>
                <span className="text-[10px] text-cyan-300/80 block mb-1 uppercase tracking-widest font-mono font-semibold">
                  🝑 Alchemical Beverages
                </span>
                <p className="text-white/70 text-xs">{agent.historicalDiet.beverages.join(" · ")}</p>
              </div>
            )}

            {/* Food Lore */}
            {agent.historicalDiet?.foodLore && (
              <div className="rounded-xl p-3 bg-white/[0.03] border border-white/5">
                <span className="text-[10px] text-purple-300/80 block mb-1 uppercase tracking-widest font-mono font-semibold">
                  📜 Culinary Lore
                </span>
                <p className="text-white/75 text-xs leading-relaxed italic">{agent.historicalDiet.foodLore}</p>
              </div>
            )}

            {!agent.historicalDiet && (
              <p className="text-white/40 text-xs italic">Culinary dietary profile synchronized with Alchemical Agents.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Core Beliefs or Quotes (if present) ── */}
      {((agent.quotes && agent.quotes.length > 0) || (agent.coreBeliefs && agent.coreBeliefs.length > 0)) && (
        <Card className="glass-card-premium border-white/10 bg-black/40 backdrop-blur-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-serif text-white flex items-center gap-2">
              <Quote className="w-4 h-4 text-blue-400" />
              Discourse & Wisdom
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {agent.quotes?.map((quote, idx) => (
              <blockquote key={idx} className="border-l-2 border-purple-500/50 pl-4 py-1 text-xs text-white/70 italic">
                &ldquo;{quote}&rdquo;
              </blockquote>
            ))}
          </CardContent>
        </Card>
      )}

      {/* ── Recent Kitchen Actions / Artifacts (if any) ── */}
      {(artifacts.length > 0 || actions.length > 0) && (
        <Card className="glass-card-premium border-white/10 bg-black/40 backdrop-blur-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-serif text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-400" />
              Culinary Record
            </CardTitle>
            <CardDescription className="text-xs text-white/50">Artifacts and alchemical actions in this kitchen</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {artifacts.map((artifact) => (
              <div
                key={artifact.id}
                className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5 text-xs"
              >
                <div>
                  <p className="text-white font-medium">{artifact.title}</p>
                  <p className="text-white/50">{artifact.summary}</p>
                </div>
                <Badge variant="outline" className="text-[10px] text-white/40 uppercase">
                  {artifact.kind}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* ── Time Laboratory Commune Modal ── */}
      {isChatOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-4xl max-h-[92vh] overflow-hidden rounded-3xl border border-white/15 shadow-2xl bg-[#090912] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-white shadow"
                  style={{
                    background: `linear-gradient(135deg, ${accent}66, ${accent}cc)`,
                  }}
                >
                  {agent.appearance?.symbol || agent.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <span>Communing with {agent.name}</span>
                    <Badge variant="outline" className="text-[10px] bg-purple-500/10 text-purple-300 border-purple-500/30">
                      Live
                    </Badge>
                  </h3>
                  <p className="text-[10px] text-white/40 font-mono">Time Laboratory · {agent.title || "Perpetual Steward"}</p>
                </div>
              </div>
              <button
                onClick={() => setIsChatOpen(false)}
                className="p-1.5 rounded-full bg-white/5 hover:bg-white/15 text-white/60 hover:text-white transition-colors cursor-pointer"
                aria-label="Close Chat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <PlanetaryAgentChat
                agent={{
                  id: slug,
                  name: agent.name,
                  description: agent.title || agent.personality?.core?.essence || "Historical Alchemist",
                  planetaryRuler: agent.consciousness?.dominantElement || "Sun",
                  element: (dominantElement as any) || "Fire",
                  consciousnessLevel: agent.consciousness?.level || "Master",
                  activationStrength: 100,
                  dignity: "Perpetual",
                }}
                userId={userId}
                onClose={() => setIsChatOpen(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
