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
import type { BirthData, NatalChart } from "@/types/natalChart";

interface Companion {
  userId: string;
  email: string;
  name: string;
  bio: string;
  dominantElement: "Fire" | "Water" | "Air" | "Earth" | string;
  monicaConstant: number | null;
  birthData: BirthData;
  natalChart: NatalChart | null;
  activation?: {
    strength: number;
    dignity: string;
    element: string;
    planetaryRuler: string;
    description: string;
  };
  lastActionAt?: string;
}

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

export function CompanionSuggestions({
  onInvite,
  activeGuests,
  refreshTrigger = 0,
  inviteDisabled = false,
}: CompanionSuggestionsProps) {
  const [activeAgents, setActiveAgents] = useState<Companion[]>([]);
  const [historicalAgents, setHistoricalAgents] = useState<Companion[]>([]);
  const [cosmicRoster, setCosmicRoster] = useState<Companion[]>([]);
  const [savedCompanions, setSavedCompanions] = useState<Companion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [degraded, setDegraded] = useState(false);
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
        const res = await fetch("/api/commensal/companions", {
          signal: controller.signal,
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data.message || "Failed to load dining companions");
        }

        if (data.success) {
          setActiveAgents(data.activeAgents || []);
          setHistoricalAgents(data.historicalAgents || []);
          setCosmicRoster(data.cosmicRoster || []);
          setSavedCompanions(data.savedCompanions || []);
          setDegraded(data.degraded === true);

          if (data.savedCompanions && data.savedCompanions.length > 0) {
            setActiveTab("saved");
          }
        } else {
          throw new Error(data.message || "Failed to load dining companions");
        }
      } catch (err) {
        if (controller.signal.aborted) return;
        console.error("Error loading companions:", err);
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
            const borderClass =
              ELEMENT_BORDER[agent.dominantElement] ||
              "border-white/10 hover:border-white/20";
            const glowClass = ELEMENT_GLOW[agent.dominantElement] || "";

            return (
              <div
                key={agent.userId}
                className={`glass-card-premium rounded-xl p-3.5 border transition-all ${borderClass} ${glowClass} flex flex-col justify-between space-y-3`}
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
                      {ELEMENT_ICON[agent.dominantElement] || (
                        <Sparkles className="w-3 h-3 text-purple-300" />
                      )}
                      <span className="text-[10px] font-semibold text-purple-200">
                        {agent.dominantElement}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-purple-300/70 mt-1.5 leading-relaxed line-clamp-2">
                    {agent.activation?.description || agent.bio}
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

                <button
                  onClick={() =>
                    onInvite(
                      agent.userId,
                      agent.name,
                      agent.birthData,
                      agent.natalChart,
                    )
                  }
                  disabled={isAlreadyInvited || inviteDisabled}
                  title={
                    !isAlreadyInvited && inviteDisabled
                      ? "A table seats twelve."
                      : undefined
                  }
                  className={`w-full py-1.5 rounded-lg text-xs font-bold transition-all ${
                    isAlreadyInvited
                      ? "bg-green-500/10 text-green-300 border border-green-500/20 cursor-default"
                      : inviteDisabled
                        ? "bg-white/5 border border-white/10 text-purple-100/40 cursor-not-allowed"
                        : "bg-white/5 hover:bg-white/10 border border-white/10 text-purple-100 hover:text-white"
                  }`}
                >
                  {isAlreadyInvited ? "Invited to Table" : "Invite to Table"}
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
export default CompanionSuggestions;
