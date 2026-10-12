"use client";

import {
  Users,
  Sparkles,
  Flame,
  Droplets,
  Wind,
  Mountain,
  Compass,
  Loader2,
} from "lucide-react";
import React, { useState, useEffect } from "react";
import { _logger } from "@/lib/logger";
import { parseCompanionsResponse } from "@/types";
import type {
  BirthData,
  CompanionSuggestion,
  NatalChart,
  ParsedCompanionsResponse,
} from "@/types";

interface CompanionSuggestionsProps {
  onInvite: (
    id: string,
    name: string,
    birthData: BirthData,
    natalChart: NatalChart | null,
  ) => void;
  activeGuests: Array<{ id?: string; name: string }>;
  refreshTrigger?: number;
  /** When true the table is full (12 seats) — invite buttons are disabled. */
  inviteDisabled?: boolean;
}

const ELEMENT_ICON: Record<string, React.ReactNode> = {
  Fire: <Flame className="w-3.5 h-3.5 text-orange-400" />,
  Water: <Droplets className="w-3.5 h-3.5 text-blue-400" />,
  Air: <Wind className="w-3.5 h-3.5 text-purple-300" />,
  Earth: <Mountain className="w-3.5 h-3.5 text-green-400" />,
};

const ELEMENT_BORDER: Record<string, string> = {
  Fire: "border-orange-500/20 hover:border-orange-500/40 focus:ring-orange-500/30",
  Water: "border-blue-500/20 hover:border-blue-500/40 focus:ring-blue-500/30",
  Air: "border-purple-500/20 hover:border-purple-500/40 focus:ring-purple-500/30",
  Earth:
    "border-green-500/20 hover:border-green-500/40 focus:ring-green-500/30",
};

const ELEMENT_GLOW: Record<string, string> = {
  Fire: "shadow-[0_0_15px_-3px_rgba(249,115,22,0.15)]",
  Water: "shadow-[0_0_15px_-3px_rgba(59,130,246,0.15)]",
  Air: "shadow-[0_0_15px_-3px_rgba(168,85,247,0.15)]",
  Earth: "shadow-[0_0_15px_-3px_rgba(34,197,94,0.15)]",
};

const NEUTRAL_BORDER = "border-white/10 hover:border-white/20";

/** An unknown element gets a neutral card, not a guessed one. */
function elementStyle(element: CompanionSuggestion["dominantElement"]): {
  border: string;
  glow: string;
  icon: React.ReactNode;
  label: string;
} {
  const unknown = <Sparkles className="w-3 h-3 text-purple-300" />;
  if (element === null) {
    return { border: NEUTRAL_BORDER, glow: "", icon: unknown, label: "Element unknown" };
  }
  return {
    border: ELEMENT_BORDER[element] ?? NEUTRAL_BORDER,
    glow: ELEMENT_GLOW[element] ?? "",
    icon: ELEMENT_ICON[element] ?? unknown,
    label: element,
  };
}

/**
 * Row by row: one malformed companion must not blank the panel. Only a broken
 * envelope (not an object, a list that is not a list) is a contract failure.
 */
function readCompanions(rawData: unknown): ParsedCompanionsResponse {
  const parsed = parseCompanionsResponse(rawData);
  if (parsed === null) {
    throw new Error("Companion response did not match the expected contract");
  }
  if (parsed.dropped > 0) {
    _logger.error("Companions dropped for malformed chart data", parsed.dropped);
  }
  return parsed;
}

const BUTTON_BASE = "w-full py-1.5 rounded-lg text-xs font-bold transition-all";
const BUTTON_MUTED =
  "bg-white/5 border border-white/10 text-purple-100/40 cursor-not-allowed";

function inviteState(
  hasChart: boolean,
  invited: boolean,
  tableFull: boolean,
): { label: string; title: string | null; className: string } {
  if (!hasChart) {
    return {
      label: "No natal chart",
      title:
        "No birth chart is on file for this agent, so it cannot be seated at a table.",
      className: BUTTON_MUTED,
    };
  }
  if (invited) {
    return {
      label: "Invited to Table",
      title: null,
      className:
        "bg-green-500/10 text-green-300 border border-green-500/20 cursor-default",
    };
  }
  return {
    label: "Invite to Table",
    title: tableFull ? "A table seats twelve." : null,
    className: tableFull
      ? BUTTON_MUTED
      : "bg-white/5 hover:bg-white/10 border border-white/10 text-purple-100 hover:text-white",
  };
}

interface InviteButtonProps {
  agent: CompanionSuggestion;
  invited: boolean;
  tableFull: boolean;
  onInvite: CompanionSuggestionsProps["onInvite"];
}

/** An agent with no birth data cannot be seated: there is no chart to seat. */
function InviteButton({
  agent,
  invited,
  tableFull,
  onInvite,
}: InviteButtonProps): React.ReactElement {
  const { birthData } = agent;
  const state = inviteState(birthData !== null, invited, tableFull);
  return (
    <button
      onClick={() => {
        if (birthData === null) return;
        onInvite(agent.userId, agent.name, birthData, agent.natalChart);
      }}
      disabled={birthData === null || invited || tableFull}
      title={state.title ?? undefined}
      className={`${BUTTON_BASE} ${state.className}`}
    >
      {state.label}
    </button>
  );
}

export function CompanionSuggestions({
  onInvite,
  activeGuests,
  refreshTrigger = 0,
  inviteDisabled = false,
}: CompanionSuggestionsProps) {
  const [activeAgents, setActiveAgents] = useState<CompanionSuggestion[]>([]);
  const [historicalAgents, setHistoricalAgents] = useState<
    CompanionSuggestion[]
  >([]);
  const [cosmicRoster, setCosmicRoster] = useState<CompanionSuggestion[]>([]);
  const [savedCompanions, setSavedCompanions] = useState<CompanionSuggestion[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [degraded, setDegraded] = useState(false);
  const [dropped, setDropped] = useState(0);
  const [activeTab, setActiveTab] = useState<
    "moment" | "feed" | "roster" | "saved"
  >("moment");

  useEffect(() => {
    const controller = new AbortController();

    async function loadCompanions() {
      try {
        setLoading(true);
        setError(null);
        setDegraded(false);
        setDropped(0);
        const res = await fetch("/api/commensal/companions", {
          signal: controller.signal,
        });
        const rawData: unknown = await res
          .json()
          .catch(() => ({ success: false }));
        const parsed = readCompanions(rawData);
        const data = parsed.response;
        if (!res.ok) {
          throw new Error(
            data.success
              ? "Failed to load dining companions"
              : (data.message ?? "Failed to load dining companions"),
          );
        }

        if (data.success) {
          setActiveAgents(data.activeAgents);
          setHistoricalAgents(data.historicalAgents);
          setCosmicRoster(data.cosmicRoster);
          setSavedCompanions(data.savedCompanions);
          setDegraded(data.degraded === true);
          setDropped(parsed.dropped);

          if (data.savedCompanions.length > 0) {
            setActiveTab("saved");
          }
        } else {
          throw new Error(data.message ?? "Failed to load dining companions");
        }
      } catch (err) {
        if (controller.signal.aborted) return;
        _logger.error("Error loading companions", err);
        setError(
          "Unable to retrieve planetary companions. Check back shortly.",
        );
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void loadCompanions();
    return () => controller.abort();
  }, [refreshTrigger]);

  const getActiveList = () => {
    if (activeTab === "moment") return activeAgents;
    if (activeTab === "feed") return historicalAgents;
    if (activeTab === "saved") return savedCompanions;
    return cosmicRoster;
  };

  const currentList = getActiveList();

  return (
    <div className="glass-card-premium rounded-2xl p-5 border border-white/10 flex flex-col space-y-4">
      <div>
        <h3 className="text-lg font-bold text-purple-100 flex items-center gap-2">
          <Users className="w-5 h-5 text-alchm-copper" />
          Cosmic Dining Companions
        </h3>
        <p className="text-xs text-purple-300/70 mt-1">
          Bridge the cosmos by inviting historical sages or active planetary
          agents to your dining table.
        </p>
      </div>

      {degraded && !error && (
        <div className="px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-400/20 text-[11px] text-amber-100">
          Some companion sources are temporarily unavailable. You can still add
          saved or manual charts and build the dinner party.
        </div>
      )}

      {dropped > 0 && !error && (
        <div className="px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-400/20 text-[11px] text-amber-100">
          {dropped === 1
            ? "1 companion couldn't be shown — its chart data was unreadable."
            : `${dropped} companions couldn't be shown — their chart data was unreadable.`}
        </div>
      )}

      {/* Tabs */}
      <div className="flex bg-black/40 rounded-lg p-1 border border-white/5 flex-wrap gap-1">
        {savedCompanions.length > 0 && (
          <button
            onClick={() => setActiveTab("saved")}
            className={`flex-1 min-w-[70px] py-1.5 text-[11px] font-semibold rounded-md transition-all ${
              activeTab === "saved"
                ? "bg-purple-500/20 text-purple-100 border border-purple-500/30"
                : "text-purple-300/60 hover:text-purple-200"
            }`}
          >
            My Saved
          </button>
        )}
        <button
          onClick={() => setActiveTab("moment")}
          className={`flex-1 min-w-[70px] py-1.5 text-[11px] font-semibold rounded-md transition-all ${
            activeTab === "moment"
              ? "bg-purple-500/20 text-purple-100 border border-purple-500/30"
              : "text-purple-300/60 hover:text-purple-200"
          }`}
        >
          Planetary
        </button>
        <button
          onClick={() => setActiveTab("feed")}
          className={`flex-1 min-w-[70px] py-1.5 text-[11px] font-semibold rounded-md transition-all ${
            activeTab === "feed"
              ? "bg-purple-500/20 text-purple-100 border border-purple-500/30"
              : "text-purple-300/60 hover:text-purple-200"
          }`}
        >
          From Feed
        </button>
        <button
          onClick={() => setActiveTab("roster")}
          className={`flex-1 min-w-[70px] py-1.5 text-[11px] font-semibold rounded-md transition-all ${
            activeTab === "roster"
              ? "bg-purple-500/20 text-purple-100 border border-purple-500/30"
              : "text-purple-300/60 hover:text-purple-200"
          }`}
        >
          Cosmic
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-[300px] max-h-[420px] overflow-y-auto pr-1 space-y-3">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 space-y-2">
            <Loader2 className="w-8 h-8 text-alchm-copper animate-spin" />
            <span className="text-xs text-purple-300/60">
              Interrogating the heavens...
            </span>
          </div>
        ) : error ? (
          <div className="text-center py-12 px-3 border border-red-500/10 rounded-xl bg-red-500/5">
            <p className="text-xs text-red-200">{error}</p>
          </div>
        ) : currentList.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-16 px-4">
            <Compass className="w-10 h-10 text-purple-500/20 mb-3" />
            <h4 className="text-sm font-semibold text-purple-200">
              No Companions Aligned
            </h4>
            <p className="text-xs text-purple-300/50 mt-1 max-w-xs leading-relaxed">
              {activeTab === "moment"
                ? "No planetary agents are strongly activated at this exact degree under today's sky."
                : activeTab === "feed"
                  ? "No recent feed broadcasts found. Sync agentic updates from Planetary Agents."
                  : activeTab === "saved"
                    ? "You haven't saved any custom companion charts yet. Add charts using the form to keep them here."
                    : "The cosmic roster is currently empty."}
            </p>
          </div>
        ) : (
          currentList.map((agent) => {
            const isAlreadyInvited = activeGuests.some(
              (g) =>
                g.id === agent.userId ||
                g.name.toLowerCase() === agent.name.toLowerCase(),
            );
            const style = elementStyle(agent.dominantElement);

            return (
              <div
                key={agent.userId}
                className={`glass-card-premium rounded-xl p-3.5 border transition-all ${style.border} ${style.glow} flex flex-col justify-between space-y-3`}
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-purple-100">
                        {agent.name}
                      </h4>
                      {agent.activation?.planetaryRuler && (
                        <span className="text-[10px] uppercase font-mono tracking-wider text-purple-400">
                          Ruler: {agent.activation.planetaryRuler}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/5 border border-white/5">
                      {style.icon}
                      <span className="text-[10px] font-semibold text-purple-200">
                        {style.label}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-purple-300/70 mt-1.5 leading-relaxed line-clamp-2">
                    {agent.activation?.description ?? agent.bio}
                  </p>

                  {/* Active Strength Indicator */}
                  {agent.activation && (
                    <div className="mt-2.5 space-y-1">
                      <div className="flex items-center justify-between text-[10px] text-purple-400 font-mono">
                        <span>Alignment: {agent.activation.dignity}</span>
                        <span>
                          {Math.round(agent.activation.strength * 100)}%
                        </span>
                      </div>
                      <div className="w-full bg-white/5 rounded-full h-1 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-alchm-copper to-alchm-violet rounded-full"
                          style={{
                            width: `${agent.activation.strength * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Feed Action Indicator */}
                  {agent.lastActionAt && !agent.activation && (
                    <div className="mt-2 text-[10px] text-purple-400 font-mono">
                      Last Active:{" "}
                      {new Date(agent.lastActionAt).toLocaleDateString()}
                    </div>
                  )}
                </div>

                <InviteButton
                  agent={agent}
                  invited={isAlreadyInvited}
                  tableFull={inviteDisabled}
                  onInvite={onInvite}
                />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
export default CompanionSuggestions;
