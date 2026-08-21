import { motion } from "framer-motion";
import React from "react";
import { FollowButton } from "@/components/profile/tables/FollowButton";
import { agentChatUrl } from "@/lib/agents/agentChatUrl";
import type { CraftedAgentProfile, Element } from "@/lib/agents/craftedAgentTypes";
import type { Balances } from "./types";

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

const AgentHeroBadges: React.FC<{ agent: CraftedAgentProfile; accent: string }> = ({ agent, accent }) => (
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
);

const BalancesGrid: React.FC<{ balances: Balances }> = ({ balances }) => (
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
);

const HeroAvatar: React.FC<{ accent: string; symbol?: string }> = ({ accent, symbol }) => (
  <div
    className="w-28 h-28 md:w-32 md:h-32 rounded-2xl border-2 flex items-center justify-center text-5xl md:text-6xl shadow-lg backdrop-blur-sm shrink-0"
    style={{ borderColor: accent, background: `${accent}22` }}
    aria-hidden="true"
  >
    <span>{symbol ?? "✦"}</span>
  </div>
);

interface HeroDetailsProps {
  agent: CraftedAgentProfile;
  accent: string;
  handle?: string | null;
  slug: string | null;
  userId?: string;
  viewer?: { follows: boolean; followedBy: boolean; isCommensal: boolean } | null;
}

const HeroDetails: React.FC<HeroDetailsProps> = ({ agent, accent, handle, slug, userId, viewer }) => (
  <div className="flex-1">
    <AgentHeroBadges agent={agent} accent={accent} />
    <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter">{agent.name}</h1>
    <p className="mt-1 text-base md:text-lg italic text-white/70">{agent.title}</p>
    {agent.specialization && <p className="mt-2 text-sm text-white/55">{agent.specialization}</p>}
    {handle && <p className="text-[10px] uppercase tracking-widest text-white/30 font-mono mt-3">{handle}</p>}
    {(slug ?? (userId && viewer)) && (
      <div className="mt-4 flex flex-wrap items-center gap-3">
        {slug && (
          <a
            href={agentChatUrl(slug)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-white text-xs font-black uppercase tracking-[0.2em] transition-all shadow-lg border border-white/20 hover:border-white/40 active:scale-95"
            style={{
              background: `linear-gradient(180deg, ${accent}cc, ${accent}88)`,
              boxShadow: `0 10px 25px -5px ${accent}40`,
            }}
          >
            Chat with {agent.name} ✦
          </a>
        )}
        {userId && <FollowButton targetUserId={userId} viewer={viewer ?? null} />}
      </div>
    )}
  </div>
);

interface AgentHeroHeaderProps {
  agent: CraftedAgentProfile;
  balances: Balances;
  handle?: string | null;
  slug: string | null;
  userId?: string;
  viewer?: { follows: boolean; followedBy: boolean; isCommensal: boolean } | null;
  accent: string;
}

export const AgentHeroHeader: React.FC<AgentHeroHeaderProps> = ({
  agent,
  balances,
  handle,
  slug,
  userId,
  viewer,
  accent,
}) => {
  const dominantElement = agent.consciousness?.dominantElement;
  const tint = (dominantElement && ELEMENT_TINT[dominantElement]) ?? "from-violet-500/25 via-[#08080e]/30 to-fuchsia-500/10";

  return (
    <>
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className={`glass-card-premium rounded-3xl p-8 md:p-10 border-white/8 mb-8 relative overflow-hidden bg-gradient-to-br ${tint}`}
      >
        <div className="absolute inset-0 pointer-events-none opacity-60" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-start gap-6">
          <HeroAvatar accent={accent} symbol={agent.appearance?.symbol} />
          <HeroDetails agent={agent} accent={accent} handle={handle} slug={slug} userId={userId} viewer={viewer} />
        </div>
      </motion.section>
      <BalancesGrid balances={balances} />
    </>
  );
};
