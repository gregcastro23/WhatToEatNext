"use client";

/**
 * /grimoire — the legibility layer of the invisible economy.
 *
 * No tasks live here. The grimoire *documents*: the practices the kitchen
 * honors, today's sky and the reader's personal resonance per coin, the
 * celestial allowance and what's been drawn from it, chambers discovered,
 * the streak's milestones, and the feats absorbed from the retired quest
 * UI (completed feats can still be claimed from this page — the one
 * transactional affordance).
 */

import { BookOpen, Flame, Loader2, Lock, Sparkles } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState, type JSX } from "react";
import { Button } from "@/components/ui/button";
import { emitTokenEconomyUpdate } from "@/hooks/useTokenEconomy";
import { revealPracticeReward } from "@/lib/economy/practiceClient";

interface CoinVector {
  spirit: number;
  essence: number;
  matter: number;
  substance: number;
}

interface GrimoireData {
  success: boolean;
  sky: {
    dominantElement: string;
    skyMultiplier: number;
    rulingDayPlanet: string;
    rulingHourPlanet: string;
    personalized: boolean;
  };
  resonance: CoinVector;
  allowance: { total: number; spent: number; remaining: number };
  practices: Array<{
    type: string;
    tokenType: string;
    description: string;
    baseAmount: number;
    dedupe: "daily" | "ever";
    dailyCap: number;
    todayAmount: number;
    todayModifier: number;
  }>;
  discoveredSurfaces: string[];
  streak: {
    current: number;
    longest: number;
    nextMilestone: { days: number; totalTokens: number } | null;
    milestones: Array<{ days: number; totalTokens: number }>;
  };
  feats: Array<{
    slug: string;
    title: string;
    description: string | null;
    tokenRewardType: string;
    tokenRewardAmount: number;
    progress: number;
    threshold: number;
    completedAt: string | null;
    claimedAt: string | null;
  }>;
}

const COINS: Array<{ key: keyof CoinVector; label: string; symbol: string; color: string }> = [
  { key: "spirit", label: "Spirit", symbol: "🝇", color: "#fbbf24" },
  { key: "essence", label: "Essence", symbol: "🝑", color: "#60a5fa" },
  { key: "matter", label: "Matter", symbol: "🝙", color: "#34d399" },
  { key: "substance", label: "Substance", symbol: "🝉", color: "#c084fc" },
];

const COIN_SYMBOL: Record<string, string> = {
  Spirit: "🝇",
  Essence: "🝑",
  Matter: "🝙",
  Substance: "🝉",
  all: "✦",
};

function fmt(n: number): string {
  return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

export default function GrimoirePage(): JSX.Element {
  const [data, setData] = useState<GrimoireData | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(false);
  const [claiming, setClaiming] = useState<string | null>(null);

  const refresh = useCallback(async (): Promise<void> => {
    try {
      const res = await fetch("/api/economy/grimoire", { cache: "no-store" });
      if (res.status === 401) {
        setAuthError(true);
        return;
      }
      if (res.ok) setData((await res.json()) as GrimoireData);
    } catch {
      /* the grimoire stays shut — error state below */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const claimFeat = useCallback(
    async (slug: string, tokenType: string): Promise<void> => {
      setClaiming(slug);
      try {
        const res = await fetch("/api/quests/claim", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ questSlug: slug }),
        });
        const json = (await res.json()) as { success?: boolean; tokensAwarded?: number };
        if (json.success && json.tokensAwarded) {
          revealPracticeReward({
            tokenType: tokenType === "all" ? "Spirit" : tokenType,
            amount: json.tokensAwarded,
            hint: "A feat, recorded in the Work",
          });
          emitTokenEconomyUpdate({ source: "quest" });
        }
      } catch {
        /* silent */
      } finally {
        setClaiming(null);
        void refresh();
      }
    },
    [refresh],
  );

  return (
    <div className="grimoire-container">
      <style>{`
        .grimoire-container { max-width: 820px; margin: 0 auto; padding: 72px 24px; color: var(--fg, #e2e8f0); }
        .grim-card {
          background: rgba(18, 16, 26, 0.45);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(139, 92, 246, 0.15);
          border-radius: 16px;
          padding: 26px;
          margin-bottom: 20px;
        }
        .grim-label { font-size: 10px; font-family: var(--font-mono, monospace); color: var(--fg-mute, #718096); letter-spacing: 0.14em; margin-bottom: 12px; text-transform: uppercase; }
        .grim-bar { height: 8px; border-radius: 999px; background: rgba(255,255,255,0.06); overflow: hidden; }
        .grim-bar > div { height: 100%; border-radius: 999px; background: linear-gradient(90deg, #7c3aed, #c084fc); transition: width 0.6s ease; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>

      <header style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#a78bfa", marginBottom: 8, fontSize: 11, letterSpacing: "0.2em", fontFamily: "var(--font-mono, monospace)" }}>
          <BookOpen style={{ width: 14, height: 14 }} />
          THE PRACTICES &amp; THEIR REWARDS
        </div>
        <h1 className="t-display" style={{ fontSize: 38, margin: 0, fontWeight: 500, letterSpacing: "-0.02em" }}>
          Grimoire
        </h1>
        <p style={{ color: "var(--fg-mute, #718096)", fontSize: 14, lineHeight: 1.6, marginTop: 8, marginBottom: 0, maxWidth: 620 }}>
          The kitchen honors certain practices without announcing them. This book records what the
          attentive have learned: which acts the Work rewards, how today&apos;s sky bends the rates,
          and the feats already inscribed against your name.
        </p>
      </header>

      {authError ? (
        <div className="grim-card">
          <p style={{ margin: 0, fontSize: 14 }}>The grimoire opens only for the signed-in.</p>
          <div style={{ marginTop: 16 }}>
            <Link href="/api/auth/signin?callbackUrl=/grimoire">
              <Button style={{ background: "linear-gradient(135deg, #7c3aed 0%, #4c1d95 100%)", color: "white" }}>Sign In</Button>
            </Link>
          </div>
        </div>
      ) : loading || !data ? (
        <div className="grim-card" style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Loader2 style={{ width: 16, height: 16, animation: "spin 1.2s linear infinite" }} />
          <span style={{ fontSize: 13, fontFamily: "var(--font-mono, monospace)", color: "var(--fg-mute, #a0aec0)" }}>
            Unclasping the covers…
          </span>
        </div>
      ) : (
        <>
          {/* Today's sky + resonance */}
          <div className="grim-card">
            <div className="grim-label">Today&apos;s Sky</div>
            <div style={{ display: "flex", gap: 18, flexWrap: "wrap", alignItems: "baseline", marginBottom: 16 }}>
              <span style={{ fontSize: 15 }}>
                Dominated by <strong>{data.sky.dominantElement}</strong>
              </span>
              <span style={{ fontSize: 12.5, color: "var(--fg-mute, #a0aec0)" }}>
                Day of {data.sky.rulingDayPlanet} · Hour of {data.sky.rulingHourPlanet}
              </span>
              <span style={{ fontSize: 11, fontFamily: "var(--font-mono, monospace)", color: "#a78bfa" }}>
                sky ×{fmt(data.sky.skyMultiplier)}
              </span>
            </div>
            <div className="grim-label">Your Resonance {data.sky.personalized ? "(natal × transit)" : "(complete onboarding to personalize)"}</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 10 }}>
              {COINS.map((c) => (
                <div key={c.key} style={{ background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.04)", borderRadius: 8, padding: "10px 14px", display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ color: c.color, fontSize: 18 }}>{c.symbol}</span>
                  <div>
                    <div style={{ fontSize: 11, color: "var(--fg-mute, #a0aec0)" }}>{c.label}</div>
                    <div style={{ fontFamily: "var(--font-mono, monospace)", fontSize: 13, color: data.resonance[c.key] >= 1 ? "#34d399" : "#f59e0b" }}>
                      ×{fmt(data.resonance[c.key])}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Celestial allowance */}
          <div className="grim-card">
            <div className="grim-label">The Celestial Allowance</div>
            <p style={{ fontSize: 12.5, color: "var(--fg-mute, #a0aec0)", margin: "0 0 14px", lineHeight: 1.6 }}>
              Each day the sky sets how much the practices may pour into one vessel. Today it grants{" "}
              <strong style={{ color: "#e2e8f0" }}>{fmt(data.allowance.total)}</strong> — you have drawn{" "}
              <strong style={{ color: "#e2e8f0" }}>{fmt(data.allowance.spent)}</strong>.
            </p>
            <div className="grim-bar">
              <div style={{ width: `${Math.min(100, (data.allowance.spent / Math.max(1, data.allowance.total)) * 100)}%` }} />
            </div>
          </div>

          {/* The practices */}
          <div className="grim-card">
            <div className="grim-label">The Practices</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {data.practices.map((p) => (
                <div key={p.type} style={{ display: "flex", gap: 14, alignItems: "flex-start", background: "rgba(0,0,0,0.18)", border: "1px solid rgba(255,255,255,0.04)", borderRadius: 10, padding: "14px 16px" }}>
                  <span style={{ fontSize: 22, lineHeight: 1 }}>{COIN_SYMBOL[p.tokenType] ?? "✦"}</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.55 }}>{p.description}</p>
                    <div style={{ display: "flex", gap: 14, marginTop: 6, flexWrap: "wrap", fontSize: 11, fontFamily: "var(--font-mono, monospace)", color: "var(--fg-mute, #718096)" }}>
                      <span style={{ color: "#a78bfa" }}>
                        today +{fmt(p.todayAmount)} {COIN_SYMBOL[p.tokenType]}
                      </span>
                      <span>{p.dedupe === "daily" ? "renews daily" : "honored once"}</span>
                      <span>up to {p.dailyCap}×/day</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <p style={{ fontSize: 11.5, color: "var(--fg-mute, #718096)", margin: "16px 0 0", lineHeight: 1.6 }}>
              The daily Cosmic Yield remains the one open ritual —{" "}
              <Link href="/quantities?tab=economy" style={{ color: "#a78bfa" }}>
                collect it here
              </Link>
              .
            </p>
          </div>

          {/* Streak + milestones */}
          <div className="grim-card">
            <div className="grim-label">The Flame</div>
            <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 15 }}>
                <Flame style={{ width: 16, height: 16, color: "#f59e0b" }} />
                <strong>{data.streak.current}</strong>-day streak
                <span style={{ fontSize: 12, color: "var(--fg-mute, #718096)" }}>(longest {data.streak.longest})</span>
              </span>
              {data.streak.nextMilestone && (
                <span style={{ fontSize: 12.5, color: "var(--fg-mute, #a0aec0)" }}>
                  Next milestone: day {data.streak.nextMilestone.days} pours +{data.streak.nextMilestone.totalTokens} across the coins.
                </span>
              )}
            </div>
          </div>

          {/* Chambers discovered */}
          <div className="grim-card">
            <div className="grim-label">Chambers Discovered · {data.discoveredSurfaces.length}</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {data.discoveredSurfaces.length > 0 ? (
                data.discoveredSurfaces.map((s) => (
                  <span key={s} style={{ fontSize: 11, fontFamily: "var(--font-mono, monospace)", color: "#c084fc", border: "1px solid rgba(192,132,252,0.3)", borderRadius: 999, padding: "3px 10px" }}>
                    {s}
                  </span>
                ))
              ) : (
                <span style={{ fontSize: 12.5, color: "var(--fg-mute, #718096)" }}>
                  None yet inscribed — every unvisited page of the kitchen holds a first-crossing gift.
                </span>
              )}
            </div>
          </div>

          {/* Feats */}
          <div className="grim-card">
            <div className="grim-label">Feats of the Work</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {data.feats.length === 0 && (
                <span style={{ fontSize: 12.5, color: "var(--fg-mute, #718096)" }}>The pages await your first feat.</span>
              )}
              {data.feats.map((f) => {
                const done = Boolean(f.completedAt);
                const claimed = Boolean(f.claimedAt);
                return (
                  <div key={f.slug} style={{ display: "flex", alignItems: "center", gap: 14, background: "rgba(0,0,0,0.18)", border: `1px solid ${done ? "rgba(52,211,153,0.25)" : "rgba(255,255,255,0.04)"}`, borderRadius: 10, padding: "12px 16px" }}>
                    {done ? (
                      <Sparkles style={{ width: 16, height: 16, color: "#34d399", flexShrink: 0 }} />
                    ) : (
                      <Lock style={{ width: 15, height: 15, color: "var(--fg-mute, #4a5568)", flexShrink: 0 }} />
                    )}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13.5, fontWeight: 600, color: done ? "#e2e8f0" : "var(--fg-mute, #a0aec0)" }}>{f.title}</div>
                      {f.description && (
                        <div style={{ fontSize: 12, color: "var(--fg-mute, #718096)", marginTop: 2 }}>{f.description}</div>
                      )}
                      {!done && f.threshold > 1 && (
                        <div style={{ fontSize: 10.5, fontFamily: "var(--font-mono, monospace)", color: "var(--fg-mute, #4a5568)", marginTop: 4 }}>
                          {f.progress}/{f.threshold}
                        </div>
                      )}
                    </div>
                    {done && !claimed ? (
                      <Button
                        onClick={() => void claimFeat(f.slug, f.tokenRewardType)}
                        disabled={claiming === f.slug}
                        style={{ background: "linear-gradient(135deg, #7c3aed 0%, #4c1d95 100%)", color: "white", padding: "8px 14px", fontSize: 12 }}
                      >
                        {claiming === f.slug ? "Inscribing…" : `Claim +${f.tokenRewardAmount} ${COIN_SYMBOL[f.tokenRewardType] ?? ""}`}
                      </Button>
                    ) : claimed ? (
                      <span style={{ fontSize: 10.5, fontFamily: "var(--font-mono, monospace)", color: "#34d399", letterSpacing: "0.06em" }}>
                        INSCRIBED
                      </span>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
