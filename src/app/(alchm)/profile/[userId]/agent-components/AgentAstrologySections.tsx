import Link from "next/link";
import React from "react";
import type { CraftedAgentProfile } from "@/lib/agents/craftedAgentTypes";
import type { AgentAction, AgentInteraction } from "@/lib/agents/fetchAgentProfile";

function SectionLabel({ children }: { children: React.ReactNode }): React.ReactElement {
  return (
    <h2 className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] mb-4">
      {children}
    </h2>
  );
}

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

const NatalTable: React.FC<{ planets: Record<string, { sign: string; degree: number; house?: number | string; retrograde?: boolean }> }> = ({ planets }) => (
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
            <td className="py-2 pr-4 text-white/75 tabular-nums">{p.degree.toFixed(1)}°</td>
            <td className="py-2 pr-4 text-white/55">{p.house ?? "—"}</td>
            <td className="py-2 pr-4 text-amber-300">{p.retrograde ? "℞" : ""}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export const NatalChartSection: React.FC<{ agent: CraftedAgentProfile }> = ({ agent }) => {
  const planets = agent.consciousness?.natalChart?.planets ?? {};
  const aspects = agent.consciousness?.natalChart?.aspects ?? [];
  if (Object.keys(planets).length === 0) return null;

  return (
    <section className="glass-card-premium rounded-3xl p-6 md:p-8 border-white/8 mb-8">
      <SectionLabel>Natal Chart</SectionLabel>
      <NatalTable planets={planets} />
      {aspects.length > 0 && (
        <div className="mt-5">
          <p className="text-[9px] uppercase tracking-widest text-white/30 font-bold mb-2">Notable Aspects</p>
          <div className="flex flex-wrap gap-2">
            {aspects.map((a, i) => (
              <span
                key={a.planet1 + a.planet2 + i}
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
  );
};

const DietColumns: React.FC<{
  staples?: string[];
  favoriteFoods?: string[];
  avoidedFoods?: string[];
}> = ({ staples, favoriteFoods, avoidedFoods }) => (
  <div className="grid md:grid-cols-3 gap-5">
    {(staples?.length ?? 0) > 0 && (
      <div>
        <p className="text-[9px] uppercase tracking-widest text-white/30 font-bold mb-2">Staples</p>
        <ul className="space-y-1 text-sm text-white/75">
          {staples?.map((s, i) => (
            <li key={s + i}>· {s}</li>
          ))}
        </ul>
      </div>
    )}
    {(favoriteFoods?.length ?? 0) > 0 && (
      <div>
        <p className="text-[9px] uppercase tracking-widest text-white/30 font-bold mb-2">Favorites</p>
        <ul className="space-y-1 text-sm text-white/75">
          {favoriteFoods?.map((s, i) => (
            <li key={s + i}>· {s}</li>
          ))}
        </ul>
      </div>
    )}
    {(avoidedFoods?.length ?? 0) > 0 && (
      <div>
        <p className="text-[9px] uppercase tracking-widest text-white/30 font-bold mb-2">Avoided</p>
        <ul className="space-y-1 text-sm text-white/75">
          {avoidedFoods?.map((s, i) => (
            <li key={s + i}>· {s}</li>
          ))}
        </ul>
      </div>
    )}
  </div>
);

export const HistoricalDietSection: React.FC<{ agent: CraftedAgentProfile; accent: string }> = ({ agent, accent }) => {
  const { historicalDiet: diet } = agent;
  if (!diet) return null;

  return (
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
        <p className="text-sm text-white/65 leading-relaxed mb-5">{diet.dietaryPhilosophy}</p>
      )}
      <DietColumns
        staples={diet.staples}
        favoriteFoods={diet.favoriteFoods}
        avoidedFoods={diet.avoidedFoods}
      />
      {diet.beverages && diet.beverages.length > 0 && (
        <div className="mt-5">
          <p className="text-[9px] uppercase tracking-widest text-white/30 font-bold mb-2">Beverages</p>
          <div className="flex flex-wrap gap-2">
            {diet.beverages.map((b, i) => (
              <span
                key={b + i}
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
  );
};

export const BirthDataSection: React.FC<{ agent: CraftedAgentProfile }> = ({ agent }) => {
  const { birthData } = agent;
  if (!birthData) return null;
  return (
    <section className="glass-card-premium rounded-3xl p-6 md:p-8 border-white/8 mb-8">
      <SectionLabel>Birth Data</SectionLabel>
      <div className="grid md:grid-cols-3 gap-5 text-sm">
        <div>
          <p className="text-[9px] uppercase tracking-widest text-white/30 font-bold mb-1">Date</p>
          <p className="text-white/85">{formatBirthDate(birthData.date)}</p>
        </div>
        <div>
          <p className="text-[9px] uppercase tracking-widest text-white/30 font-bold mb-1">Time</p>
          <p className="text-white/85">{birthData.time ?? "—"}</p>
        </div>
        <div>
          <p className="text-[9px] uppercase tracking-widest text-white/30 font-bold mb-1">Location</p>
          <p className="text-white/85">{birthData.location?.name ?? "—"}</p>
        </div>
      </div>
    </section>
  );
};

function extractActionTopic(metadata: Record<string, unknown>): string {
  if (typeof metadata.topic === "string") return metadata.topic;
  if (typeof metadata.recipeName === "string") return metadata.recipeName;
  if (typeof metadata.messageExcerpt === "string") return metadata.messageExcerpt;
  return JSON.stringify(metadata);
}

const ActionRow: React.FC<{ action: AgentAction }> = ({ action }) => {
  const topicExcerpt = extractActionTopic(action.metadata as Record<string, unknown>);
  return (
    <div className="py-2 px-3 rounded-lg border border-white/5 bg-white/[0.005] hover:bg-white/[0.015] flex justify-between items-center gap-4 transition-colors">
      <div className="flex items-center gap-3 overflow-hidden">
        <span className="text-white/30 text-[10px]">
          {new Date(action.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
        </span>
        <span className="text-purple-400 font-bold tracking-wide shrink-0">
          [{action.type.toUpperCase()}]
        </span>
        <span className="text-white/70 truncate">{topicExcerpt}</span>
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
  );
};

export const ActionHistorySection: React.FC<{ actions: AgentAction[] }> = ({ actions }) => {
  if (actions.length === 0) return null;
  return (
    <section className="glass-card-premium rounded-3xl p-6 md:p-8 border-white/8 mb-8">
      <SectionLabel>Action History</SectionLabel>
      <div className="space-y-3 font-mono text-xs">
        {actions.slice(0, 10).map((action) => (
          <ActionRow key={action.id} action={action} />
        ))}
      </div>
    </section>
  );
};

export const InteractionsSection: React.FC<{ interactions: AgentInteraction[] }> = ({ interactions }) => {
  if (interactions.length === 0) return null;
  return (
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
  );
};
