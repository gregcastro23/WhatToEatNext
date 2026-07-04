"use client";

/**
 * On-chain ESMS wallet panel — the user-facing half of the claim-to-chain
 * bridge. Shows site (off-chain ledger) vs wallet (on-chain soulbound ERC-1155)
 * balances side by side, a one-click backend-sponsored "Claim to wallet"
 * action, in-flight claim reconciliation, and recent claim history with
 * explorer links. Pure fetch()-driven: no web3 SDK needed here because claim
 * minting is sponsored server-side (the user pays no gas and signs nothing).
 */

import { ArrowDownToLine, ExternalLink, Loader2, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState, type JSX } from "react";
import { Button } from "@/components/ui/button";

interface CoinAmounts {
  spirit: number;
  essence: number;
  matter: number;
  substance: number;
}

interface ClaimInfo {
  claimId: string;
  amounts: CoinAmounts;
  status: "pending" | "minted" | "refunded";
  txHash: string | null;
  explorerUrl?: string | null;
  createdAt?: string;
}

interface OnchainStatus {
  success: boolean;
  configured: boolean;
  walletAddress: string | null;
  walletLinked: boolean;
  offchain: CoinAmounts;
  onchain: CoinAmounts | null;
  pendingClaim: (ClaimInfo & { id: string }) | null;
  recentClaims: Array<ClaimInfo & { id: string; createdAt: string }>;
  chain: {
    chainId: number;
    chainName: string;
    testnet: boolean;
    contractAddress: string | null;
    explorerBaseUrl: string | null;
  };
}

const COINS: Array<{ key: keyof CoinAmounts; label: string; symbol: string; color: string }> = [
  { key: "spirit", label: "Spirit", symbol: "🝇", color: "#fbbf24" },
  { key: "essence", label: "Essence", symbol: "🝑", color: "#60a5fa" },
  { key: "matter", label: "Matter", symbol: "🝙", color: "#34d399" },
  { key: "substance", label: "Substance", symbol: "🝉", color: "#c084fc" },
];

function fmt(n: number): string {
  return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

function totalOf(a: CoinAmounts | null): number {
  if (!a) return 0;
  return a.spirit + a.essence + a.matter + a.substance;
}

function CoinRow({ amounts }: { amounts: CoinAmounts | null }): JSX.Element {
  return (
    <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
      {COINS.map((c) => (
        <span key={c.key} style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 13 }}>
          <span style={{ color: c.color, fontSize: 15 }}>{c.symbol}</span>
          <span style={{ fontFamily: "var(--font-mono, monospace)", color: "#e2e8f0" }}>
            {amounts ? fmt(amounts[c.key]) : "—"}
          </span>
        </span>
      ))}
    </div>
  );
}

export function OnchainEsmsPanel(): JSX.Element | null {
  const [status, setStatus] = useState<OnchainStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [notice, setNotice] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const refresh = useCallback(async (): Promise<void> => {
    try {
      const res = await fetch("/api/economy/claim-onchain", { cache: "no-store" });
      if (!res.ok) {
        setStatus(null);
        return;
      }
      setStatus((await res.json()) as OnchainStatus);
    } catch {
      setStatus(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const handleClaim = useCallback(async (): Promise<void> => {
    setClaiming(true);
    setNotice(null);
    try {
      const res = await fetch("/api/economy/claim-onchain", { method: "POST" });
      const json = (await res.json()) as {
        success?: boolean;
        error?: string;
        code?: string;
        retryable?: boolean;
        claim?: ClaimInfo;
      };
      if (json.success) {
        const claimed = json.claim ? totalOf(json.claim.amounts) : 0;
        setNotice({
          kind: "ok",
          text: claimed > 0 ? `Claimed ${fmt(claimed)} ESMS to your wallet on-chain.` : "Claim settled on-chain.",
        });
      } else if (json.code === "mint_pending") {
        setNotice({ kind: "ok", text: "Claim submitted — confirming on-chain. Check back in a moment." });
      } else {
        setNotice({ kind: "err", text: json.error || "Claim failed — try again." });
      }
    } catch {
      setNotice({ kind: "err", text: "Network error — try again." });
    } finally {
      setClaiming(false);
      void refresh();
    }
  }, [refresh]);

  // Silent panel while loading or when the API is unreachable/signed-out.
  if (loading) return null;
  if (!status) return null;

  const claimable = totalOf(status.offchain);
  const pending = status.pendingClaim;
  const canClaim = status.configured && status.walletLinked && !claiming && (claimable > 0 || Boolean(pending));

  return (
    <div className="alchm-card" style={{ marginTop: 24 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 20, position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 10, fontFamily: "var(--font-mono, monospace)", color: "var(--fg-mute, #718096)", letterSpacing: "0.08em", marginBottom: 4 }}>
              ON-CHAIN ESMS · {status.chain.chainName.toUpperCase()}
              {status.chain.testnet ? " · TESTNET" : ""}
            </div>
            <div style={{ fontSize: 15, fontWeight: 600, color: "#e2e8f0" }}>Soulbound Token Vault</div>
          </div>
          <button
            type="button"
            onClick={() => void refresh()}
            title="Refresh balances"
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--fg-mute, #718096)", padding: 4 }}
          >
            <RefreshCw style={{ width: 14, height: 14 }} />
          </button>
        </div>

        {!status.configured && (
          <div style={{ fontSize: 12, color: "#d97706", background: "rgba(217,119,6,0.08)", border: "1px solid rgba(217,119,6,0.25)", borderRadius: 6, padding: "10px 14px" }}>
            On-chain claiming isn&apos;t configured on this server yet — your tokens keep accruing off-chain.
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12 }}>
          <div className="glass-status-box" style={{ flexDirection: "column", alignItems: "flex-start" }}>
            <div style={{ fontSize: 9, fontFamily: "var(--font-mono, monospace)", color: "var(--fg-mute, #718096)", marginBottom: 8 }}>
              SITE BALANCE (CLAIMABLE)
            </div>
            <CoinRow amounts={status.offchain} />
          </div>
          <div className="glass-status-box" style={{ flexDirection: "column", alignItems: "flex-start" }}>
            <div style={{ fontSize: 9, fontFamily: "var(--font-mono, monospace)", color: "var(--fg-mute, #718096)", marginBottom: 8 }}>
              WALLET BALANCE (ON-CHAIN)
            </div>
            <CoinRow amounts={status.onchain} />
          </div>
        </div>

        {pending && (
          <div style={{ fontSize: 12, color: "#a78bfa", background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.25)", borderRadius: 6, padding: "10px 14px", display: "flex", alignItems: "center", gap: 8 }}>
            <Loader2 style={{ width: 13, height: 13, animation: "spin 1.2s linear infinite" }} />
            A claim of {fmt(totalOf(pending.amounts))} ESMS is in flight — claiming again will settle it first.
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
          <Button
            onClick={() => void handleClaim()}
            disabled={!canClaim}
            className="glowing-btn"
            style={{ padding: "12px 20px" }}
          >
            {claiming ? (
              <Loader2 style={{ width: 14, height: 14, marginRight: 6, animation: "spin 1.2s linear infinite" }} />
            ) : (
              <ArrowDownToLine style={{ width: 14, height: 14, marginRight: 6 }} />
            )}
            {pending ? "Settle pending claim" : "Claim all to wallet"}
          </Button>
          {!status.walletLinked && (
            <span style={{ fontSize: 12, color: "var(--fg-mute, #718096)" }}>
              Link your Privy identity above to unlock on-chain claims.
            </span>
          )}
          {status.walletLinked && claimable <= 0 && !pending && (
            <span style={{ fontSize: 12, color: "var(--fg-mute, #718096)" }}>
              Nothing to claim yet — collect your daily Cosmic Yield first.
            </span>
          )}
          <span style={{ fontSize: 11, color: "var(--fg-mute, #718096)", fontFamily: "var(--font-mono, monospace)" }}>
            Gas-free · sponsored mint
          </span>
        </div>

        {notice && (
          <div
            style={{
              fontSize: 12.5,
              color: notice.kind === "ok" ? "#34d399" : "#ef4444",
              background: notice.kind === "ok" ? "rgba(52,211,153,0.08)" : "rgba(239,68,68,0.08)",
              border: `1px solid ${notice.kind === "ok" ? "rgba(52,211,153,0.25)" : "rgba(239,68,68,0.25)"}`,
              borderRadius: 6,
              padding: "10px 14px",
            }}
          >
            {notice.text}
          </div>
        )}

        {status.recentClaims.length > 0 && (
          <div>
            <div style={{ fontSize: 9, fontFamily: "var(--font-mono, monospace)", color: "var(--fg-mute, #718096)", marginBottom: 8 }}>
              CLAIM HISTORY
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {status.recentClaims.slice(0, 5).map((c) => {
                const txUrl =
                  c.txHash && status.chain.explorerBaseUrl
                    ? `${status.chain.explorerBaseUrl}/tx/${c.txHash}`
                    : null;
                return (
                  <div
                    key={c.id}
                    style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, fontSize: 12, background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.03)", borderRadius: 6, padding: "8px 12px" }}
                  >
                    <span style={{ fontFamily: "var(--font-mono, monospace)", color: "#cbd5e1" }}>
                      {fmt(totalOf(c.amounts))} ESMS
                    </span>
                    <span
                      style={{
                        fontSize: 10,
                        fontFamily: "var(--font-mono, monospace)",
                        letterSpacing: "0.05em",
                        color: c.status === "minted" ? "#34d399" : c.status === "pending" ? "#d97706" : "#ef4444",
                      }}
                    >
                      {c.status.toUpperCase()}
                    </span>
                    {txUrl ? (
                      <a
                        href={txUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ display: "inline-flex", alignItems: "center", gap: 4, color: "#a78bfa", textDecoration: "none", fontSize: 11, fontFamily: "var(--font-mono, monospace)" }}
                      >
                        tx <ExternalLink style={{ width: 11, height: 11 }} />
                      </a>
                    ) : (
                      <span style={{ fontSize: 11, color: "var(--fg-mute, #718096)" }}>—</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
