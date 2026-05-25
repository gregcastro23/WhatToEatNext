"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import React from "react";
import type {
  CraftedAgentProfile,
  Element,
} from "@/lib/agents/craftedAgentTypes";
import type { AgentInteraction, AgentAction, AgentArtifact } from "@/lib/agents/fetchAgentProfile";

interface Balances {
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
}

const ELEMENT_TINT: Record<Element, string> = {
  Fire: "from-orange-500/25 via-[#08080e]/30 to-red-500/10",
  Water: "from-blue-500/25 via-[#08080e]/30 to-cyan-500/10",
  Air: "from-sky-400/25 via-[#08080e]/30 to-indigo-500/10",
  Earth: "from-emerald-500/25 via-[#08080e]/30 to-lime-500/10",
};

const TOKEN_VISUAL: Record<keyof Balances, { symbol: string; color: string }> = {
  spirit: { symbol: "🝇", color: "text-amber-400" },
  essence: { symbol: "🝑", color: "text-blue-400" },
  matter: { symbol: "🝙", color: "text-emerald-400" },
  substance: { symbol: "🝉", color: "text-purple-400" },
};

function formatBirthDate(dateStr: string | undefined): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "—";
  const year = d.getUTCFullYear();
  const month = d.toLocaleString("en-US", { month: "long", timeZone: "UTC" });
  const day = d.getUTCDate();
  const era = year < 0 ? `${Math.abs(year)} BCE` : `${year}`;
  return `${month} ${day}, ${era}`;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] mb-4">
      {children}
    </h2>
  );
}

export default function AgentProfile({
  agent,
  balances,
  handle,
  interactions = [],
  actions = [],
  artifacts = [],
}: AgentProfileProps) {
  const accent = agent.appearance?.color || "#7c3aed";
  const dominantElement = agent.consciousness?.dominantElement;
  const tint =
    (dominantElement && ELEMENT_TINT[dominantElement]) ||
    "from-violet-500/25 via-[#08080e]/30 to-fuchsia-500/10";

  const planets = agent.consciousness?.natalChart?.planets ?? {};
  const aspects = agent.consciousness?.natalChart?.aspects ?? [];
  const ae = agent.consciousness?.alchemicalElements;
  const personality = agent.personality;
  const abilities = agent.abilities;
  const diet = agent.historicalDiet;

  return (
    <>
      {/* 1. Hero */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className={`glass-card-premium rounded-3xl p-8 md:p-10 border-white/8 mb-8 relative overflow-hidden bg-gradient-to-br ${tint}`}
      >
        <div className="absolute inset-0 pointer-events-none opacity-60" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-start gap-6">
          <div
            className="w-28 h-28 md:w-32 md:h-32 rounded-2xl border-2 flex items-center justify-center text-5xl md:text-6xl shadow-lg backdrop-blur-sm shrink-0"
            style={{ borderColor: accent, background: `${accent}22` }}
            aria-hidden="true"
          >
            <span>{agent.appearance?.symbol ?? "✦"}</span>
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {agent.era && (
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-white/5 border border-white/15 text-white/70">
                  {agent.era}
                </span>
              )}
              {agent.consciousness?.level && (
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-white/10 border border-white/15 text-white/80">
                  {agent.consciousness.level}
                </span>
              )}
              {agent.consciousness?.dominantElement && (
                <span
                  className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border"
                  style={{
                    backgroundColor: `${accent}33`,
                    borderColor: `${accent}66`,
                    color: "#fff",
                  }}
                >
                  {agent.consciousness.dominantElement} · {agent.consciousness.dominantModality}
                </span>
              )}
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter">
              {agent.name}
            </h1>
            <p className="mt-1 text-base md:text-lg italic text-white/70">{agent.title}</p>
            {agent.specialization && (
              <p className="mt-2 text-sm text-white/55">{agent.specialization}</p>
            )}
            {handle && (
              <p className="text-[10px] uppercase tracking-widest text-white/30 font-mono mt-3">
                {handle}
              </p>
            )}
          </div>
        </div>
      </motion.section>

      {/* Balances tiles — local to alchm.kitchen, sit between hero and About */}
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
                <p className="text-[9px] uppercase tracking-widest text-white/30 font-bold">{key}</p>
                <p className="text-lg font-black text-white tabular-nums">
                  {balances[key].toFixed(2)}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* 2. About — synthesis + creation story */}
      {(agent.synthesis || agent.monicaCreationStory) && (
        <section className="glass-card-premium rounded-3xl p-6 md:p-8 border-white/8 mb-8">
          <SectionLabel>About</SectionLabel>
          <div className="space-y-3 text-sm leading-relaxed">
            {agent.synthesis && <p className="text-white/85">{agent.synthesis}</p>}
            {agent.monicaCreationStory && (
              <p className="text-white/55">{agent.monicaCreationStory}</p>
            )}
          </div>
        </section>
      )}

      {/* 3. Essence · Expression · Emotion */}
      {personality?.core && (
        <section className="mb-8">
          <SectionLabel>Essence · Expression · Emotion</SectionLabel>
          <div className="grid md:grid-cols-3 gap-4">
            {(["essence", "expression", "emotion"] as const).map((k) => {
              const core = personality.core!;
              return (
                <div
                  key={k}
                  className="glass-base rounded-2xl p-5 border border-white/8"
                >
                  <p className="text-[9px] uppercase tracking-widest text-white/30 font-bold mb-2 capitalize">
                    {k}
                  </p>
                  <p className="text-sm text-white/80 leading-relaxed">
                    {core[k]}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 4. Quotes */}
      {agent.quotes && agent.quotes.length > 0 && (
        <section className="glass-card-premium rounded-3xl p-6 md:p-8 border-white/8 mb-8">
          <SectionLabel>In Their Own Words</SectionLabel>
          <div className="space-y-4">
            {agent.quotes.slice(0, 5).map((q, i) => (
              <blockquote
                key={i}
                className="border-l-4 pl-4 italic text-white/75 text-sm md:text-base leading-relaxed"
                style={{ borderColor: accent }}
              >
                &ldquo;{q}&rdquo;
              </blockquote>
            ))}
          </div>
        </section>
      )}

      {/* 5. Core Beliefs */}
      {agent.coreBeliefs && agent.coreBeliefs.length > 0 && (
        <section className="glass-card-premium rounded-3xl p-6 md:p-8 border-white/8 mb-8">
          <SectionLabel>Core Beliefs</SectionLabel>
          <ul className="list-disc pl-5 space-y-2 text-sm text-white/80">
            {agent.coreBeliefs.map((b, i) => (
              <li key={i}>{b}</li>
            ))}
          </ul>
        </section>
      )}

      {/* 6. Personality */}
      {personality?.traits && personality.traits.length > 0 && (
        <section className="mb-8">
          <SectionLabel>Personality</SectionLabel>
          <div className="flex flex-wrap gap-2">
            {personality.traits.map((t, i) => (
              <span
                key={i}
                className="px-3 py-1.5 rounded-full text-xs font-medium border border-white/10 bg-white/[0.04] text-white/80"
              >
                {t}
              </span>
            ))}
          </div>
          {personality.currentMood && (
            <p className="mt-4 text-xs text-white/50">
              <span className="font-medium text-white/65">Current mood:</span>{" "}
              {personality.currentMood}
            </p>
          )}
        </section>
      )}

      {/* 7. Gifts & Shadows */}
      {((personality?.gifts && personality.gifts.length > 0) ||
        (personality?.shadows && personality.shadows.length > 0)) && (
        <section className="grid md:grid-cols-2 gap-6 mb-8">
          {personality.gifts && personality.gifts.length > 0 && (
            <div>
              <SectionLabel>Gifts</SectionLabel>
              <div className="space-y-3">
                {personality.gifts.map((g, i) => (
                  <div key={i} className="glass-base rounded-2xl p-4 border border-white/8">
                    <p className="text-sm font-semibold text-white mb-1">{g.type}</p>
                    <p className="text-xs text-white/70 leading-relaxed">{g.description}</p>
                    {g.expression && (
                      <p className="text-[11px] text-white/45 mt-2 leading-relaxed">
                        <span className="text-white/60 font-medium">Expression:</span>{" "}
                        {g.expression}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          {personality.shadows && personality.shadows.length > 0 && (
            <div>
              <SectionLabel>Shadows</SectionLabel>
              <div className="space-y-3">
                {personality.shadows.map((s, i) => (
                  <div key={i} className="glass-base rounded-2xl p-4 border border-white/8">
                    <p className="text-sm font-semibold text-white mb-1">{s.type}</p>
                    <p className="text-xs text-white/70 leading-relaxed">{s.description}</p>
                    {s.transformationPath && (
                      <p className="text-[11px] text-white/45 mt-2 leading-relaxed">
                        <span className="text-white/60 font-medium">
                          Transformation path:
                        </span>{" "}
                        {s.transformationPath}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* 8. Challenges & Growth */}
      {personality?.challenges && personality.challenges.length > 0 && (
        <section className="mb-8">
          <SectionLabel>Challenges & Growth</SectionLabel>
          <div className="space-y-3">
            {personality.challenges.map((c, i) => (
              <div key={i} className="glass-base rounded-2xl p-4 border border-white/8">
                <p className="text-sm font-semibold text-white mb-1">{c.type}</p>
                <p className="text-xs text-white/70 leading-relaxed">{c.description}</p>
                {c.growthOpportunity && (
                  <p className="text-[11px] text-white/45 mt-2 leading-relaxed">
                    <span className="text-white/60 font-medium">Growth opportunity:</span>{" "}
                    {c.growthOpportunity}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 9. Abilities */}
      {abilities && (
        <section className="glass-card-premium rounded-3xl p-6 md:p-8 border-white/8 mb-8">
          <SectionLabel>Abilities</SectionLabel>
          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <p className="text-[9px] uppercase tracking-widest text-white/30 font-bold mb-1">
                Specialty
              </p>
              <p className="text-sm text-white/85">{abilities.specialty}</p>
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-widest text-white/30 font-bold mb-1">
                Teaching Style
              </p>
              <p className="text-sm text-white/85">{abilities.teachingStyle}</p>
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-widest text-white/30 font-bold mb-1">
                Resonance
              </p>
              <p className="text-sm text-white/85">{abilities.resonanceType}</p>
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-widest text-white/30 font-bold mb-1">
                Unique Power
              </p>
              <p className="text-sm text-white/85">{abilities.uniquePower}</p>
            </div>
            {abilities.wisdomDomains && abilities.wisdomDomains.length > 0 && (
              <div className="md:col-span-2">
                <p className="text-[9px] uppercase tracking-widest text-white/30 font-bold mb-2">
                  Wisdom Domains
                </p>
                <div className="flex flex-wrap gap-2">
                  {abilities.wisdomDomains.map((d, i) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 rounded-full text-xs font-medium border border-white/15 text-white/75"
                    >
                      {d}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* 10. Consciousness Signature */}
      <section className="glass-card-premium rounded-3xl p-6 md:p-8 border-white/8 mb-8">
        <SectionLabel>Consciousness Signature</SectionLabel>
        <div className="grid md:grid-cols-2 gap-5 mb-6">
          {agent.consciousness?.strength && (
            <div>
              <p className="text-[9px] uppercase tracking-widest text-white/30 font-bold mb-1">
                Strength
              </p>
              <p className="text-sm text-white/85">{agent.consciousness.strength}</p>
            </div>
          )}
          {agent.consciousness?.emotion && (
            <div>
              <p className="text-[9px] uppercase tracking-widest text-white/30 font-bold mb-1">
                Emotional Tone
              </p>
              <p className="text-sm text-white/85">{agent.consciousness.emotion}</p>
            </div>
          )}
          <div>
            <p className="text-[9px] uppercase tracking-widest text-white/30 font-bold mb-1">
              Signature
            </p>
            <p className="font-mono text-[11px] text-white/70 break-all">
              {agent.consciousness?.signature}
            </p>
          </div>
          <div>
            <p className="text-[9px] uppercase tracking-widest text-white/30 font-bold mb-1">
              Element · Modality
            </p>
            <p className="text-sm text-white/85">
              {agent.consciousness?.dominantElement} · {agent.consciousness?.dominantModality}
            </p>
          </div>
        </div>

        {ae && (
          <div className="space-y-3 pt-2">
            <p className="text-[9px] uppercase tracking-widest text-white/30 font-bold">
              Alchemical Elements
            </p>
            {(["spirit", "essence", "matter", "substance"] as const).map((k) => {
              const pct = Math.round((ae[k] ?? 0) * 100);
              return (
                <div key={k}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="capitalize text-white/70">{k}</span>
                    <span className="text-white/45 tabular-nums">{pct}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/10">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className="h-full rounded-full"
                      style={{ background: accent }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 10.5. Recent Discourses, Actions, and Artifacts */}
      {interactions && interactions.length > 0 && (
        <section className="glass-card-premium rounded-3xl p-6 md:p-8 border-white/8 mb-8">
          <SectionLabel>Recent Discourses</SectionLabel>
          <div className="space-y-4">
            {interactions.map((interaction) => (
              <div
                key={interaction.id}
                className="p-4 rounded-2xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-colors flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${
                      interaction.kind === "agent_to_agent"
                        ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                        : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    }`}>
                      {interaction.kind === "agent_to_agent" ? "Agent-to-Agent" : "Agent-to-User"}
                    </span>
                    {interaction.kind === "agent_to_agent" && (
                      <span className="text-white/60 font-semibold text-sm">
                        With {interaction.counterparty.name}
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-medium text-white mb-1">{interaction.topic}</p>
                  <p className="text-xs text-white/50 italic font-serif leading-relaxed">
                    &ldquo;{interaction.messagePreview}&rdquo;
                  </p>
                </div>
                <div className="shrink-0 flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
                  <span className="text-[10px] text-white/30 uppercase tracking-widest">
                    {interaction.messageCount} turns
                  </span>
                  <a
                    href={interaction.chatThread}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg border border-purple-500/30 hover:border-purple-500/60 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 text-xs font-bold uppercase tracking-wider transition-all"
                  >
                    View Discourse →
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {artifacts && artifacts.length > 0 && (
        <section className="glass-card-premium rounded-3xl p-6 md:p-8 border-white/8 mb-8">
          <SectionLabel>Created by this Agent</SectionLabel>
          <div className="grid md:grid-cols-2 gap-4">
            {artifacts.map((artifact) => (
              <div
                key={artifact.id}
                className="p-4 rounded-2xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest bg-amber-500/25 text-amber-300 border border-amber-500/30">
                      {artifact.kind}
                    </span>
                    <span className="text-[10px] text-white/30 font-mono">
                      {new Date(artifact.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white mb-1">{artifact.title}</h3>
                  <p className="text-xs text-white/60 leading-relaxed mb-4">{artifact.summary}</p>
                </div>
                {artifact.alchmKitchenPath && (
                  <Link
                    href={artifact.alchmKitchenPath}
                    className="text-xs font-bold text-amber-400 hover:text-amber-300 uppercase tracking-widest inline-flex items-center gap-1 mt-auto hover:underline"
                  >
                    View Recipe ✦
                  </Link>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {actions && actions.length > 0 && (
        <section className="glass-card-premium rounded-3xl p-6 md:p-8 border-white/8 mb-8">
          <SectionLabel>Action History</SectionLabel>
          <div className="space-y-3 font-mono text-xs">
            {actions.slice(0, 10).map((action) => (
              <div
                key={action.id}
                className="py-2 px-3 rounded-lg border border-white/5 bg-white/[0.005] hover:bg-white/[0.015] flex justify-between items-center gap-4 transition-colors"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <span className="text-white/30 text-[10px]">
                    {new Date(action.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                  <span className="text-purple-400 font-bold tracking-wide shrink-0">
                    [{action.type.toUpperCase()}]
                  </span>
                  <span className="text-white/70 truncate">
                    {action.metadata.topic || action.metadata.recipeName || action.metadata.messageExcerpt || JSON.stringify(action.metadata)}
                  </span>
                </div>
                <div className="flex gap-2">
                  {action.links.recipe && (
                    <Link
                      href={action.links.recipe.replace(/^https?:\/\/[^/]+/, "")}
                      className="text-[10px] font-bold text-amber-400 hover:underline uppercase shrink-0"
                    >
                      Recipe
                    </Link>
                  )}
                  {action.links.chatThread && (
                    <a
                      href={action.links.chatThread}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] font-bold text-purple-400 hover:underline uppercase shrink-0"
                    >
                      Thread
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 11. Natal Chart */}
      {Object.keys(planets).length > 0 && (
        <section className="glass-card-premium rounded-3xl p-6 md:p-8 border-white/8 mb-8">
          <SectionLabel>Natal Chart</SectionLabel>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left text-[10px] uppercase tracking-widest text-white/40">
                  <th className="py-2 pr-4">Planet</th>
                  <th className="py-2 pr-4">Sign</th>
                  <th className="py-2 pr-4">Degree</th>
                  <th className="py-2 pr-4">House</th>
                  <th className="py-2 pr-4">Rx</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(planets).map(([planet, p]) => (
                  <tr key={planet} className="border-b border-white/5 last:border-0">
                    <td className="py-2 pr-4 font-medium text-white/90">{planet}</td>
                    <td className="py-2 pr-4 text-white/75">{p.sign}</td>
                    <td className="py-2 pr-4 text-white/75 tabular-nums">
                      {p.degree.toFixed(1)}°
                    </td>
                    <td className="py-2 pr-4 text-white/55">{p.house ?? "—"}</td>
                    <td className="py-2 pr-4 text-amber-300">{p.retrograde ? "℞" : ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {aspects.length > 0 && (
            <div className="mt-5">
              <p className="text-[9px] uppercase tracking-widest text-white/30 font-bold mb-2">
                Notable Aspects
              </p>
              <div className="flex flex-wrap gap-2">
                {aspects.map((a, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 rounded-full text-xs font-medium border border-white/15 text-white/75"
                  >
                    {a.planet1} {a.type} {a.planet2}
                    {a.exact ? " (exact)" : ` · ${a.orb.toFixed(1)}°`}
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* 12. Historical Diet */}
      {diet && (
        <section className="glass-card-premium rounded-3xl p-6 md:p-8 border-white/8 mb-8">
          <SectionLabel>
            Historical Diet
            {diet.culturalCuisine && (
              <span className="ml-2 normal-case tracking-normal text-white/50 font-medium">
                ({diet.culturalCuisine})
              </span>
            )}
          </SectionLabel>
          {diet.dietaryPhilosophy && (
            <p className="text-sm text-white/65 leading-relaxed mb-5">
              {diet.dietaryPhilosophy}
            </p>
          )}
          <div className="grid md:grid-cols-3 gap-5">
            {(diet.staples?.length ?? 0) > 0 && (
              <div>
                <p className="text-[9px] uppercase tracking-widest text-white/30 font-bold mb-2">
                  Staples
                </p>
                <ul className="space-y-1 text-sm text-white/75">
                  {diet.staples?.map((s, i) => (
                    <li key={i}>· {s}</li>
                  ))}
                </ul>
              </div>
            )}
            {(diet.favoriteFoods?.length ?? 0) > 0 && (
              <div>
                <p className="text-[9px] uppercase tracking-widest text-white/30 font-bold mb-2">
                  Favorites
                </p>
                <ul className="space-y-1 text-sm text-white/75">
                  {diet.favoriteFoods?.map((s, i) => (
                    <li key={i}>· {s}</li>
                  ))}
                </ul>
              </div>
            )}
            {(diet.avoidedFoods?.length ?? 0) > 0 && (
              <div>
                <p className="text-[9px] uppercase tracking-widest text-white/30 font-bold mb-2">
                  Avoided
                </p>
                <ul className="space-y-1 text-sm text-white/75">
                  {diet.avoidedFoods?.map((s, i) => (
                    <li key={i}>· {s}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          {diet.beverages && diet.beverages.length > 0 && (
            <div className="mt-5">
              <p className="text-[9px] uppercase tracking-widest text-white/30 font-bold mb-2">
                Beverages
              </p>
              <div className="flex flex-wrap gap-2">
                {diet.beverages.map((b, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 rounded-full text-xs font-medium border border-white/15 text-white/75"
                  >
                    {b}
                  </span>
                ))}
              </div>
            </div>
          )}
          {diet.foodLore && (
            <p
              className="border-l-2 pl-3 italic text-white/55 text-sm leading-relaxed mt-5"
              style={{ borderColor: `${accent}66` }}
            >
              {diet.foodLore}
            </p>
          )}
        </section>
      )}

      {/* 13. Birth Data */}
      {agent.birthData && (
        <section className="glass-card-premium rounded-3xl p-6 md:p-8 border-white/8 mb-8">
          <SectionLabel>Birth Data</SectionLabel>
          <div className="grid md:grid-cols-3 gap-5 text-sm">
            <div>
              <p className="text-[9px] uppercase tracking-widest text-white/30 font-bold mb-1">
                Date
              </p>
              <p className="text-white/85">{formatBirthDate(agent.birthData.date)}</p>
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-widest text-white/30 font-bold mb-1">
                Time
              </p>
              <p className="text-white/85">{agent.birthData.time || "—"}</p>
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-widest text-white/30 font-bold mb-1">
                Location
              </p>
              <p className="text-white/85">{agent.birthData.location?.name || "—"}</p>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
