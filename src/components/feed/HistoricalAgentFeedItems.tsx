/**
 * Presentational cards for the historical-agent Live Network Feed items.
 *
 * Used by both feed surfaces (the /feed page and the AgentsFeedThread slide-out)
 * via a `compact` variant. Reuses the existing element/ESMS/planetary-hour tag
 * treatment (ELEMENT_COLORS + the bordered tag block) rather than rebuilding it.
 *
 * Presentation only — no alchemical/elemental/ESMS computation here.
 */

import Link from "next/link";
import { agentChatUrl } from "@/lib/agents/agentChatUrl";
import { ELEMENT_COLORS, ELEMENT_COLORS_FALLBACK } from "@/lib/elementColors";
import type {
  AgentEventFeedItem,
  FeedAgentBirthchart,
  HistoricalAgentFeedItem,
  RecipePostFeedItem,
  YieldClaimFeedItem,
} from "@/lib/feed/historicalAgentFeed";

function formatRelativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const diffSec = Math.max(0, Math.floor((Date.now() - then) / 1000));
  if (diffSec < 60) return `${diffSec}s ago`;
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86_400) return `${Math.floor(diffSec / 3600)}h ago`;
  return `${Math.floor(diffSec / 86_400)}d ago`;
}

const BIRTHCHART_HIGHLIGHTS: Array<{ key: "sun" | "moon" | "ascendant"; label: string }> = [
  { key: "sun", label: "Sun" },
  { key: "moon", label: "Moon" },
  { key: "ascendant", label: "Asc" },
];

function getBirthchartHighlights(birthchart?: FeedAgentBirthchart): string[] {
  if (!birthchart) return [];
  return BIRTHCHART_HIGHLIGHTS.map(({ key, label }) => {
    const value = birthchart[key];
    return typeof value === "string" && value.trim() ? `${label} ${value}` : null;
  }).filter((entry): entry is string => entry !== null);
}

// ─── Recipe post ────────────────────────────────────────────────────────────

export function RecipePostCard({
  item,
  compact = false,
}: {
  item: RecipePostFeedItem;
  compact?: boolean;
}) {
  const { agent, recipe } = item;
  const elementClass = ELEMENT_COLORS[item.element ?? ""] ?? ELEMENT_COLORS_FALLBACK;
  const highlights = getBirthchartHighlights(agent.birthchart);
  const tags = [
    item.planetaryHour ? `Hour ${item.planetaryHour}` : null,
    item.esmsTag ?? null,
    item.element ?? null,
  ].filter((tag): tag is string => Boolean(tag));
  const time = formatRelativeTime(item.createdAt);
  const chatHref = agent.slug ? agentChatUrl(agent.slug) : null;
  const recipeHref = recipe.id ? `/recipes/${recipe.id}` : null;

  const container = compact
    ? "flex gap-3 items-start group"
    : "glass-card-premium rounded-2xl p-5 flex items-start gap-4 border-amber-500/20 hover:border-amber-400/35 transition-all";
  const avatar = compact
    ? "w-8 h-8 text-sm bg-amber-900/40 border-amber-500/20"
    : "w-10 h-10 text-xl bg-amber-900/30 border-white/5";

  return (
    <div className={container}>
      <div className={`rounded-full flex items-center justify-center shrink-0 border ${avatar}`}>
        🍽️
      </div>
      <div className="flex-1 min-w-0">
        <p className={compact ? "text-xs text-white/90 leading-relaxed" : "text-sm text-white/80"}>
          <span className="font-bold text-amber-400 mr-1">{agent.name}</span>{" "}
          <span className="text-white/60">shared a recipe</span>{" "}
          {recipeHref ? (
            <Link
              href={recipeHref}
              className="font-semibold text-white/85 hover:text-white underline decoration-amber-400/30 underline-offset-2"
            >
              {recipe.name}
            </Link>
          ) : (
            <span className="font-semibold text-white/85">{recipe.name}</span>
          )}
        </p>
        <div className={`flex flex-wrap items-center gap-x-3 gap-y-1 ${compact ? "mt-1" : "mt-2"}`}>
          {time && <span className="text-[10px] text-white/30 font-mono">{time}</span>}
          <span className="text-[8px] font-black uppercase tracking-widest bg-amber-500/10 text-amber-400/80 px-2 py-0.5 rounded-full border border-amber-500/20">
            Historical Agent
          </span>
          {chatHref && (
            <a
              href={chatHref}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] text-amber-300/70 hover:text-amber-200 uppercase tracking-wider font-bold"
            >
              Chat ✦
            </a>
          )}
        </div>
        {(tags.length > 0 || highlights.length > 0) && (
          <div className={`mt-2 rounded-xl border px-3 py-2 ${elementClass}`}>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] font-bold uppercase tracking-wider">
                {tags.map((tag, index) => (
                  <span key={`${tag}-${index}`}>{tag}</span>
                ))}
              </div>
            )}
            {highlights.length > 0 && (
              <p className={`${tags.length > 0 ? "mt-1.5" : ""} text-xs leading-relaxed opacity-80`}>
                Natal signature: {highlights.join(" · ")}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Yield claim ──────────────────────────────────────────────────────────────

export function YieldClaimCard({
  item,
  compact = false,
}: {
  item: YieldClaimFeedItem;
  compact?: boolean;
}) {
  const historical = item.historicalAgentName ?? "A historical agent";
  const planetary = item.planetaryAgentName ?? "a planetary agent";
  const amount = Number.isFinite(item.amount) ? item.amount : 0;
  const time = formatRelativeTime(item.createdAt);

  const container = compact
    ? "flex gap-3 items-start group"
    : "glass-card-premium rounded-2xl p-5 flex items-start gap-4 border-emerald-500/20 hover:border-emerald-400/35 transition-all";
  const avatar = compact
    ? "w-8 h-8 text-sm bg-emerald-900/40 border-emerald-500/20"
    : "w-10 h-10 text-xl bg-emerald-900/30 border-white/5";

  return (
    <div className={container}>
      <div className={`rounded-full flex items-center justify-center shrink-0 border ${avatar}`}>
        ⚗️
      </div>
      <div className="flex-1 min-w-0">
        <p className={compact ? "text-xs text-white/90 leading-relaxed" : "text-sm text-white/80"}>
          <span className="font-bold text-emerald-300 mr-1">{historical}</span>
          <span className="text-white/60">claimed </span>
          <span className="font-mono text-emerald-300 tabular-nums">{amount.toFixed(1)} ESMS</span>
          <span className="text-white/60"> yield from </span>
          <span className="font-semibold text-white/85">{planetary}</span>
        </p>
        <div className={`flex items-center gap-2 ${compact ? "mt-1" : "mt-2"}`}>
          {time && <span className="text-[10px] text-white/30 font-mono">{time}</span>}
          <span className="text-[8px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-300/80 px-2 py-0.5 rounded-full border border-emerald-500/20">
            Yield Claim
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Agent event (real WTEN historical-agent activity) ───────────────────────

export function AgentEventCard({
  item,
  compact = false,
}: {
  item: AgentEventFeedItem;
  compact?: boolean;
}) {
  const { agent } = item;
  const elementClass = ELEMENT_COLORS[item.element ?? ""] ?? ELEMENT_COLORS_FALLBACK;
  const tags = [
    item.planetaryHour ? `Hour ${item.planetaryHour}` : null,
    item.esmsTag ?? null,
    item.element ?? null,
  ].filter((tag): tag is string => Boolean(tag));
  const natal = item.natalSignature ?? [];
  const time = formatRelativeTime(item.createdAt);
  const chatHref = agent.slug ? agentChatUrl(agent.slug) : null;

  const container = compact
    ? "flex gap-3 items-start group"
    : "glass-card-premium rounded-2xl p-5 flex items-start gap-4 border-amber-500/20 hover:border-amber-400/35 transition-all";
  const avatar = compact
    ? "w-8 h-8 text-sm bg-amber-900/40 border-amber-500/20"
    : "w-10 h-10 text-xl bg-amber-900/30 border-white/5";

  return (
    <div className={container}>
      <div className={`rounded-full flex items-center justify-center shrink-0 border ${avatar}`}>
        {item.icon || "✨"}
      </div>
      <div className="flex-1 min-w-0">
        <p className={compact ? "text-xs text-white/90 leading-relaxed" : "text-sm text-white/80"}>
          <span className="font-bold text-amber-400 mr-1">{agent.name}</span>{" "}
          {item.href ? (
            <Link
              href={item.href}
              className="text-white/80 hover:text-white underline decoration-amber-400/30 underline-offset-2"
            >
              {item.action}
            </Link>
          ) : (
            <span className="text-white/60">{item.action}</span>
          )}
        </p>
        <div className={`flex flex-wrap items-center gap-x-3 gap-y-1 ${compact ? "mt-1" : "mt-2"}`}>
          {time && <span className="text-[10px] text-white/30 font-mono">{time}</span>}
          <span className="text-[8px] font-black uppercase tracking-widest bg-amber-500/10 text-amber-400/80 px-2 py-0.5 rounded-full border border-amber-500/20">
            Historical Agent
          </span>
          {chatHref && (
            <a
              href={chatHref}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] text-amber-300/70 hover:text-amber-200 uppercase tracking-wider font-bold"
            >
              Chat ✦
            </a>
          )}
        </div>
        {(tags.length > 0 || natal.length > 0) && (
          <div className={`mt-2 rounded-xl border px-3 py-2 ${elementClass}`}>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] font-bold uppercase tracking-wider">
                {tags.map((tag, index) => (
                  <span key={`${tag}-${index}`}>{tag}</span>
                ))}
              </div>
            )}
            {natal.length > 0 && (
              <p className={`${tags.length > 0 ? "mt-1.5" : ""} text-xs leading-relaxed opacity-80`}>
                Natal signature: {natal.join(" · ")}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Dispatcher ──────────────────────────────────────────────────────────────

export function HistoricalAgentFeedCard({
  item,
  compact = false,
}: {
  item: HistoricalAgentFeedItem;
  compact?: boolean;
}) {
  switch (item.type) {
    case "recipe_post":
      return <RecipePostCard item={item} compact={compact} />;
    case "yield_claim":
      return <YieldClaimCard item={item} compact={compact} />;
    case "agent_event":
      return <AgentEventCard item={item} compact={compact} />;
    default:
      return null;
  }
}
