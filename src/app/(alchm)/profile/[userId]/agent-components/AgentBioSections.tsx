import { motion } from "framer-motion";
import React from "react";
import { ConsciousnessSigil } from "@/components/ui/alchm/ConsciousnessSigil";
import type { CraftedAgentProfile } from "@/lib/agents/craftedAgentTypes";

function SectionLabel({ children }: { children: React.ReactNode }): React.ReactElement {
  return (
    <h2 className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] mb-4">
      {children}
    </h2>
  );
}

export const AboutSection: React.FC<{ agent: CraftedAgentProfile }> = ({ agent }) => {
  const { synthesis, monicaCreationStory } = agent;
  if (!synthesis && !monicaCreationStory) return null;
  return (
    <section className="glass-card-premium rounded-3xl p-6 md:p-8 border-white/8 mb-8">
      <SectionLabel>About</SectionLabel>
      <div className="space-y-3 text-sm leading-relaxed">
        {synthesis && <p className="text-white/85">{synthesis}</p>}
        {monicaCreationStory && <p className="text-white/55">{monicaCreationStory}</p>}
      </div>
    </section>
  );
};

export const EssenceSection: React.FC<{ agent: CraftedAgentProfile }> = ({ agent }) => {
  const core = agent.personality?.core;
  if (!core) return null;
  return (
    <section className="mb-8">
      <SectionLabel>Essence · Expression · Emotion</SectionLabel>
      <div className="grid md:grid-cols-3 gap-4">
        {(["essence", "expression", "emotion"] as const).map((k) => (
          <div key={k} className="glass-base rounded-2xl p-5 border border-white/8">
            <p className="text-[9px] uppercase tracking-widest text-white/30 font-bold mb-2 capitalize">{k}</p>
            <p className="text-sm text-white/80 leading-relaxed">{core[k]}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export const QuotesAndBeliefsSection: React.FC<{ agent: CraftedAgentProfile; accent: string }> = ({ agent, accent }) => (
  <>
    {agent.quotes && agent.quotes.length > 0 && (
      <section className="glass-card-premium rounded-3xl p-6 md:p-8 border-white/8 mb-8">
        <SectionLabel>In Their Own Words</SectionLabel>
        <div className="space-y-4">
          {agent.quotes.slice(0, 5).map((q, i) => (
            <blockquote
              key={q.slice(0, 20) + i}
              className="border-l-4 pl-4 italic text-white/75 text-sm md:text-base leading-relaxed"
              style={{ borderColor: accent }}
            >
              &ldquo;{q}&rdquo;
            </blockquote>
          ))}
        </div>
      </section>
    )}

    {agent.coreBeliefs && agent.coreBeliefs.length > 0 && (
      <section className="glass-card-premium rounded-3xl p-6 md:p-8 border-white/8 mb-8">
        <SectionLabel>Core Beliefs</SectionLabel>
        <ul className="list-disc pl-5 space-y-2 text-sm text-white/80">
          {agent.coreBeliefs.map((b, i) => (
            <li key={b.slice(0, 20) + i}>{b}</li>
          ))}
        </ul>
      </section>
    )}
  </>
);

const PersonalityTraitsBlock: React.FC<{ traits?: string[]; currentMood?: string }> = ({ traits, currentMood }) => {
  if (!traits || traits.length === 0) return null;
  return (
    <section className="mb-8">
      <SectionLabel>Personality</SectionLabel>
      <div className="flex flex-wrap gap-2">
        {traits.map((t, i) => (
          <span
            key={t + i}
            className="px-3 py-1.5 rounded-full text-xs font-medium border border-white/10 bg-white/[0.04] text-white/80"
          >
            {t}
          </span>
        ))}
      </div>
      {currentMood && (
        <p className="mt-4 text-xs text-white/50">
          <span className="font-medium text-white/65">Current mood:</span> {currentMood}
        </p>
      )}
    </section>
  );
};

const GiftsShadowsBlock: React.FC<{ gifts?: Array<{ type: string; description: string; expression?: string }>; shadows?: Array<{ type: string; description: string; transformationPath?: string }> }> = ({ gifts, shadows }) => {
  if ((!gifts || gifts.length === 0) && (!shadows || shadows.length === 0)) return null;

  return (
    <section className="grid md:grid-cols-2 gap-6 mb-8">
      {gifts && gifts.length > 0 && (
        <div>
          <SectionLabel>Gifts</SectionLabel>
          <div className="space-y-3">
            {gifts.map((g, i) => (
              <div key={g.type + i} className="glass-base rounded-2xl p-4 border border-white/8">
                <p className="text-sm font-semibold text-white mb-1">{g.type}</p>
                <p className="text-xs text-white/70 leading-relaxed">{g.description}</p>
                {g.expression && (
                  <p className="text-[11px] text-white/45 mt-2 leading-relaxed">
                    <span className="text-white/60 font-medium">Expression:</span> {g.expression}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      {shadows && shadows.length > 0 && (
        <div>
          <SectionLabel>Shadows</SectionLabel>
          <div className="space-y-3">
            {shadows.map((s, i) => (
              <div key={s.type + i} className="glass-base rounded-2xl p-4 border border-white/8">
                <p className="text-sm font-semibold text-white mb-1">{s.type}</p>
                <p className="text-xs text-white/70 leading-relaxed">{s.description}</p>
                {s.transformationPath && (
                  <p className="text-[11px] text-white/45 mt-2 leading-relaxed">
                    <span className="text-white/60 font-medium">Transformation path:</span> {s.transformationPath}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export const PersonalityAndShadowsSection: React.FC<{ agent: CraftedAgentProfile }> = ({ agent }) => {
  const { personality } = agent;
  if (!personality) return null;

  return (
    <>
      <PersonalityTraitsBlock traits={personality.traits} currentMood={personality.currentMood} />
      <GiftsShadowsBlock gifts={personality.gifts} shadows={personality.shadows} />

      {personality.challenges && personality.challenges.length > 0 && (
        <section className="mb-8">
          <SectionLabel>Challenges & Growth</SectionLabel>
          <div className="space-y-3">
            {personality.challenges.map((c, i) => (
              <div key={c.type + i} className="glass-base rounded-2xl p-4 border border-white/8">
                <p className="text-sm font-semibold text-white mb-1">{c.type}</p>
                <p className="text-xs text-white/70 leading-relaxed">{c.description}</p>
                {c.growthOpportunity && (
                  <p className="text-[11px] text-white/45 mt-2 leading-relaxed">
                    <span className="text-white/60 font-medium">Growth opportunity:</span> {c.growthOpportunity}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
};

export const AbilitiesSection: React.FC<{ agent: CraftedAgentProfile }> = ({ agent }) => {
  const { abilities } = agent;
  if (!abilities) return null;

  return (
    <section className="glass-card-premium rounded-3xl p-6 md:p-8 border-white/8 mb-8">
      <SectionLabel>Abilities</SectionLabel>
      <div className="grid md:grid-cols-2 gap-5">
        <div>
          <p className="text-[9px] uppercase tracking-widest text-white/30 font-bold mb-1">Specialty</p>
          <p className="text-sm text-white/85">{abilities.specialty}</p>
        </div>
        <div>
          <p className="text-[9px] uppercase tracking-widest text-white/30 font-bold mb-1">Teaching Style</p>
          <p className="text-sm text-white/85">{abilities.teachingStyle}</p>
        </div>
        <div>
          <p className="text-[9px] uppercase tracking-widest text-white/30 font-bold mb-1">Resonance</p>
          <p className="text-sm text-white/85">{abilities.resonanceType}</p>
        </div>
        <div>
          <p className="text-[9px] uppercase tracking-widest text-white/30 font-bold mb-1">Unique Power</p>
          <p className="text-sm text-white/85">{abilities.uniquePower}</p>
        </div>
        {abilities.wisdomDomains && abilities.wisdomDomains.length > 0 && (
          <div className="md:col-span-2">
            <p className="text-[9px] uppercase tracking-widest text-white/30 font-bold mb-2">Wisdom Domains</p>
            <div className="flex flex-wrap gap-2">
              {abilities.wisdomDomains.map((d, i) => (
                <span
                  key={d + i}
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
  );
};

const AlchemicalElementsBars: React.FC<{ ae?: { spirit?: number; essence?: number; matter?: number; substance?: number } | Record<string, number | undefined>; accent: string }> = ({ ae, accent }) => {
  if (!ae) return null;
  return (
    <div className="space-y-3 pt-4 border-t border-white/10">
      <p className="text-[9px] uppercase tracking-widest text-white/30 font-bold">Alchemical Elements</p>
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
  );
};

export const ConsciousnessSection: React.FC<{ agent: CraftedAgentProfile; accent: string }> = ({ agent, accent }) => {
  const { consciousness } = agent;
  return (
    <section className="glass-card-premium rounded-3xl p-6 md:p-8 border-white/8 mb-8">
      <SectionLabel>Consciousness Signature</SectionLabel>
      <div className="grid md:grid-cols-2 gap-8 items-center">
        <div className="flex flex-col items-center justify-center p-4 bg-black/20 rounded-2xl border border-white/5 relative overflow-hidden">
          <ConsciousnessSigil agent={agent} size={360} style="triangles" motion />
        </div>

        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-4">
            {consciousness?.strength && (
              <div>
                <p className="text-[9px] uppercase tracking-widest text-white/30 font-bold mb-1">Strength</p>
                <p className="text-sm text-white/85">{consciousness.strength}</p>
              </div>
            )}
            {consciousness?.emotion && (
              <div>
                <p className="text-[9px] uppercase tracking-widest text-white/30 font-bold mb-1">Emotional Tone</p>
                <p className="text-sm text-white/85">{consciousness.emotion}</p>
              </div>
            )}
            <div>
              <p className="text-[9px] uppercase tracking-widest text-white/30 font-bold mb-1">Signature</p>
              <p className="font-mono text-[11px] text-white/70 break-all">{consciousness?.signature}</p>
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-widest text-white/30 font-bold mb-1">Element · Modality</p>
              <p className="text-sm text-white/85">
                {consciousness?.dominantElement} · {consciousness?.dominantModality}
              </p>
            </div>
          </div>

          <AlchemicalElementsBars ae={consciousness?.alchemicalElements} accent={accent} />
        </div>
      </div>
    </section>
  );
};
