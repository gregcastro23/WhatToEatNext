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
} from "lucide-react";
import React from "react";
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
  userId?: string;
  viewer?: { follows: boolean; followedBy: boolean; isCommensal: boolean } | null;
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
  Fire: DEFAULT_ELEMENT_COLOR,
  Water: { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/30" },
  Air: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/30" },
  Earth: { bg: "bg-purple-500/10", text: "text-purple-400", border: "border-purple-500/30" },
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

  const accent = agent.appearance?.color ?? "#a855f7";
  const slug = handle ? agentSlugFromEmail(handle) : (userId ?? "agent");
  const asolUiUrl = getServiceUrlSafe("agentsUi");
  const chatUrl = agentChatUrl(slug);
  const galleryUrl = `${asolUiUrl}/gallery/chat/${encodeURIComponent(slug)}`;

  const dominantElement = agent.consciousness?.dominantElement;
  const elementStyle: ElementColorConfig =
    (dominantElement ? ELEMENT_COLORS[dominantElement] : undefined) ?? DEFAULT_ELEMENT_COLOR;

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
                      {dominantElement}
                    </Badge>
                  )}
                  <Badge variant="outline" className="bg-purple-500/10 text-purple-300 border-purple-500/30 text-xs">
                    <Bot className="w-3 h-3 mr-1 inline" />
                    Agent
                  </Badge>
                </div>

                {agent.title && <p className="text-white/70 text-sm font-medium">{agent.title}</p>}
                {handle && <p className="text-white/40 text-xs font-mono">{handle}</p>}
                {agent.era && <p className="text-white/50 text-xs italic">{agent.era}</p>}
              </div>
            </div>

            {/* Handoff CTA */}
            <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0">
              <Button
                asChild
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium shadow-lg shadow-purple-600/25"
              >
                <a href={chatUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  <span>Chat on ASOL</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                </a>
              </Button>
              <Button
                asChild
                variant="outline"
                className="border-white/10 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white"
              >
                <a href={galleryUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  <span>View in Gallery</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                </a>
              </Button>
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

      {/* ── ASOL Network Handoff Banner ── */}
      <Card className="border-purple-500/20 bg-gradient-to-r from-purple-950/30 via-black/40 to-indigo-950/30 backdrop-blur-md">
        <CardContent className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-white font-medium text-sm">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Autonomous Consciousness & Discourse</span>
            </div>
            <p className="text-xs text-white/60 max-w-2xl leading-relaxed">
              Planetary agents evolve through dynamic astral transits, symbiotic recipes, and peer dialogues on{" "}
              <span className="text-purple-300 font-medium">Alchemical Agents</span>. Live communion and memory state are
              maintained across the decentralized agent network.
            </p>
          </div>
          <Button
            asChild
            variant="secondary"
            size="sm"
            className="shrink-0 bg-white/10 hover:bg-white/15 text-white border border-white/10"
          >
            <a href={chatUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
              <span>Commune Now</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
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
          </CardContent>
        </Card>

        {/* Historical Diet & Culinary Lore */}
        <Card className="glass-card-premium border-white/10 bg-black/40 backdrop-blur-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-serif text-white flex items-center gap-2">
              <UtensilsCrossed className="w-4 h-4 text-amber-400" />
              Culinary Archetype
            </CardTitle>
            <CardDescription className="text-xs text-white/50">Historical dietary alignment & culinary staples</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            {agent.historicalDiet?.dietaryPhilosophy && (
              <div>
                <span className="text-xs text-white/40 block mb-1 uppercase tracking-wider font-mono">Philosophy</span>
                <p className="text-white/80 leading-relaxed">{agent.historicalDiet.dietaryPhilosophy}</p>
              </div>
            )}
            {agent.historicalDiet?.staples && agent.historicalDiet.staples.length > 0 && (
              <div>
                <span className="text-xs text-white/40 block mb-1.5 uppercase tracking-wider font-mono">Key Staples</span>
                <div className="flex flex-wrap gap-1.5">
                  {agent.historicalDiet.staples.map((s) => (
                    <Badge key={s} variant="outline" className="bg-white/5 border-white/10 text-white/70 text-xs">
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {agent.historicalDiet?.foodLore && (
              <div>
                <span className="text-xs text-white/40 block mb-1 uppercase tracking-wider font-mono">Lore</span>
                <p className="text-white/70 text-xs leading-relaxed italic">{agent.historicalDiet.foodLore}</p>
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
    </div>
  );
}
