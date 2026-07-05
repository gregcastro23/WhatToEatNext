"use client";

/**
 * /account page client surface.
 *
 * Provides a highly premium, alchemically-inspired account settings dashboard.
 * Mounts Privy connection triggers, allows the user to unify their identity across
 * alchm.kitchen and WTEN, and provides instant status updates with transaction-aware
 * linking, masking, and conflict resolution alerts.
 *
 * @file src/app/(alchm)/account/page.tsx
 */

import { PrivyProvider, usePrivy, useWallets, useFundWallet } from "@privy-io/react-auth";
import { ArrowLeft, Check, CheckCircle2, Copy, ShieldAlert, Sparkles, Wallet } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState, type JSX } from "react";
import { base, baseSepolia } from "viem/chains";
import { OnchainEsmsPanel } from "@/components/account/OnchainEsmsPanel";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID || "cmi9t84qs00acl80dam2j8195";

// Follow the ESMS deployment chain (Base Sepolia on testnet, Base on mainnet)
// so wallet signing, funding, and the on-chain panel all agree with where the
// contracts actually live.
const ESMS_CHAIN = process.env.NEXT_PUBLIC_ESMS_CHAIN === "base" ? base : baseSepolia;

interface DBConnectionStatus {
  connected: boolean;
  privyDid: string | null;
  walletAddress: string | null;
}

function truncateAddress(address: string): string {
  return address.length > 12 ? `${address.slice(0, 6)}…${address.slice(-4)}` : address;
}

function AccountInner(): JSX.Element {
  const { login, ready, authenticated, getAccessToken } = usePrivy();
  const { wallets } = useWallets();
  const { fundWallet } = useFundWallet();

  // Local state for DB connection status
  const [dbStatus, setDbStatus] = useState<DBConnectionStatus>({
    connected: false,
    privyDid: null,
    walletAddress: null,
  });
  const [loading, setLoading] = useState(true);
  const [linking, setLinking] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [conflictOpen, setConflictOpen] = useState(false);
  const [conflictMessage, setConflictMessage] = useState("");
  const [copied, setCopied] = useState(false);

  // Prefer the live embedded wallet from this Privy session; fall back to the
  // address stored server-side (resolved from the verified DID on link).
  const embeddedWallet = wallets.find((w) => w.walletClientType === "privy");
  const walletAddress = embeddedWallet?.address ?? dbStatus.walletAddress ?? null;

  // 1. Fetch connection status from alchm.kitchen database
  const fetchStatus = useCallback(async (): Promise<void> => {
    try {
      const res = await fetch("/api/account/privy", {
        credentials: "include",
        cache: "no-store",
      });
      if (res.status === 401) {
        setAuthError("Please sign in to access account settings.");
        setLoading(false);
        return;
      }
      if (!res.ok) {
        setAuthError(`Failed to fetch connection status (${res.status}).`);
        setLoading(false);
        return;
      }
      const json = (await res.json()) as {
        success: boolean;
        connected: boolean;
        privyDid: string | null;
        walletAddress: string | null;
      };
      setDbStatus({
        connected: json.connected,
        privyDid: json.privyDid,
        walletAddress: json.walletAddress ?? null,
      });
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : "Failed to load account details.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchStatus();
  }, [fetchStatus]);

  // 2. secure linking triggered once Privy authenticates
  const performLink = useCallback(async (token: string): Promise<void> => {
    setLinking(true);
    try {
      const res = await fetch("/api/account/privy", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ privyToken: token }),
      });
      const json = (await res.json()) as {
        success: boolean;
        privyDid?: string;
        walletAddress?: string | null;
        error?: string;
      };

      if (res.status === 409) {
        setConflictMessage(json.error || "This Privy identity is already linked to another account.");
        setConflictOpen(true);
        return;
      }

      if (!res.ok || !json.success) {
        setConflictMessage(json.error || "Failed to link your identity. Please try again.");
        setConflictOpen(true);
        return;
      }

      setDbStatus({
        connected: true,
        privyDid: json.privyDid || null,
        walletAddress: json.walletAddress ?? null,
      });
    } catch (err) {
      setConflictMessage(err instanceof Error ? err.message : "Failed to connect identity.");
      setConflictOpen(true);
    } finally {
      setLinking(false);
    }
  }, []);

  // 3. Monitor Privy login completion and auto-link
  useEffect(() => {
    if (ready && authenticated && !dbStatus.connected && !linking) {
      const autoLink = async () => {
        try {
          const token = await getAccessToken();
          if (token) {
            void performLink(token);
          }
        } catch (e) {
          console.error("Failed to fetch Privy access token for link:", e);
        }
      };
      void autoLink();
    }
  }, [ready, authenticated, dbStatus.connected, getAccessToken, performLink, linking]);

  const handleConnect = useCallback((): void => {
    if (!ready) return;
    login();
  }, [ready, login]);

  // Open Privy's fiat on-ramp to fund the embedded Base wallet. If the user
  // isn't authenticated with Privy this session, prompt login first. Hidden on
  // testnet: claim mints and shop burns are backend-sponsored, so the wallet
  // needs no gas — and fiat on-ramps can't fund Sepolia anyway.
  const handleFund = useCallback(async (): Promise<void> => {
    if (!walletAddress) return;
    if (!authenticated) {
      login();
      return;
    }
    try {
      await fundWallet({ address: walletAddress, options: { chain: ESMS_CHAIN } });
    } catch {
      /* user exited the on-ramp or it's unsupported in their region */
    }
  }, [walletAddress, authenticated, login, fundWallet]);

  const copyAddress = useCallback((): void => {
    if (!walletAddress) return;
    void navigator.clipboard?.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [walletAddress]);

  return (
    <div className="account-container">
      {/* Dynamic styles to embed high-end visual aesthetics */}
      <style>{`
        .account-container {
          max-width: 720px;
          margin: 0 auto;
          padding: 80px 24px;
          color: var(--fg, #e2e8f0);
        }
        .alchm-card {
          background: rgba(18, 16, 26, 0.45);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(139, 92, 246, 0.15);
          border-radius: 16px;
          padding: 32px;
          box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.5), inset 0 0 16px 0 rgba(139, 92, 246, 0.05);
          transition: border-color 0.4s ease, box-shadow 0.4s ease;
          position: relative;
          overflow: hidden;
        }
        .alchm-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(139, 92, 246, 0.4), transparent);
        }
        .alchm-card:hover {
          border-color: rgba(139, 92, 246, 0.3);
          box-shadow: 0 12px 40px 0 rgba(0, 0, 0, 0.6), 0 0 20px 2px rgba(139, 92, 246, 0.1), inset 0 0 24px 0 rgba(139, 92, 246, 0.08);
        }
        .pulsing-glow {
          position: absolute;
          width: 150px;
          height: 150px;
          background: radial-gradient(circle, rgba(139, 92, 246, 0.2) 0%, transparent 70%);
          top: -50px;
          right: -50px;
          pointer-events: none;
          animation: pulsing 6s infinite ease-in-out;
        }
        @keyframes pulsing {
          0% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.3); opacity: 0.5; }
          100% { transform: scale(1); opacity: 0.8; }
        }
        .glass-status-box {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          padding: 16px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
        }
        .back-link {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-family: var(--f-mono, monospace);
          letter-spacing: 0.08em;
          color: var(--fg-mute, #a0aec0);
          text-decoration: none;
          margin-bottom: 16px;
          transition: color 0.2s ease;
          width: fit-content;
        }
        .back-link:hover {
          color: #8b5cf6;
        }
        .glowing-btn {
          position: relative;
          background: linear-gradient(135deg, #7c3aed 0%, #4c1d95 100%) !important;
          color: white !important;
          border: none !important;
          box-shadow: 0 4px 14px 0 rgba(124, 58, 237, 0.4) !important;
          transition: all 0.3s ease !important;
        }
        .glowing-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px 0 rgba(124, 58, 237, 0.6), 0 0 0 2px rgba(124, 58, 237, 0.3) !important;
        }
        .glowing-btn:active:not(:disabled) {
          transform: translateY(0);
        }
      `}</style>

      <Link href="/profile" className="back-link">
        <ArrowLeft style={{ width: 12, height: 12 }} />
        RETURN TO PROFILE
      </Link>

      <header style={{ marginBottom: 36 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#a78bfa", marginBottom: 8 }} className="t-mono text-[11px] tracking-[0.2em] font-medium uppercase">
          <Sparkles style={{ width: 14, height: 14 }} />
          IDENTITY ATTUNEMENT
        </div>
        <h1 className="t-display" style={{ fontSize: 38, margin: 0, fontWeight: 500, letterSpacing: "-0.02em" }}>
          Unified Account
        </h1>
        <p style={{ color: "var(--fg-mute, #718096)", fontSize: 14, lineHeight: 1.6, marginTop: 8, marginBottom: 0 }}>
          Link your Decentralized Identity (DID) to unify your culinary progression, tokens, and preferences across
          <strong> Alchm.kitchen</strong> and sibling realms like <strong>WhatToEatNext (WTEN)</strong>. Connecting via wallet or
          email bridges your presence seamlessly.
        </p>
      </header>

      {authError ? (
        <div className="alchm-card" style={{ border: "1px solid rgba(220, 38, 38, 0.3)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, color: "#ef4444" }}>
            <ShieldAlert style={{ width: 24, height: 24, flexShrink: 0 }} />
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>Authentication Required</h3>
              <p style={{ margin: 0, fontSize: 13, marginTop: 4, opacity: 0.8 }}>{authError}</p>
            </div>
          </div>
          <div style={{ marginTop: 20 }}>
            <Link href="/api/auth/signin?callbackUrl=/account">
              <Button className="glowing-btn">Sign In</Button>
            </Link>
          </div>
        </div>
      ) : loading ? (
        <div className="alchm-card" style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "64px 32px" }}>
          <div style={{
            width: 24,
            height: 24,
            border: "2px solid rgba(139, 92, 246, 0.2)",
            borderTopColor: "#8b5cf6",
            borderRadius: "50%",
            animation: "spin 1s linear infinite"
          }} />
          <p style={{ color: "var(--fg-mute, #a0aec0)", fontSize: 13, marginTop: 16, margin: 0, fontFamily: "var(--font-mono, monospace)" }}>
            Attuning celestial channels…
          </p>
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
      ) : (
        <div className="alchm-card">
          <div className="pulsing-glow" />

          <div style={{ display: "flex", flexDirection: "column", gap: 28, position: "relative", zIndex: 1 }}>
            <div className="glass-status-box">
              <div>
                <div style={{ fontSize: 10, fontFamily: "var(--font-mono, monospace)", color: "var(--fg-mute, #718096)", letterSpacing: "0.06em", marginBottom: 4 }}>
                  CONNECTION STATUS
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: dbStatus.connected ? "#10b981" : "#d97706",
                    boxShadow: dbStatus.connected ? "0 0 10px #10b981" : "0 0 10px #d97706"
                  }} />
                  <span style={{ fontSize: 15, fontWeight: 500, color: dbStatus.connected ? "#e2e8f0" : "#cbd5e1" }}>
                    {dbStatus.connected ? "Linked to Privy" : "Unlinked"}
                  </span>
                </div>
              </div>
              <Badge variant={dbStatus.connected ? "success" : "warning"} style={{ padding: "4px 10px" }}>
                {dbStatus.connected ? "Active Link" : "Attunement Pending"}
              </Badge>
            </div>

            {dbStatus.connected ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#34d399" }}>
                  <CheckCircle2 style={{ width: 18, height: 18, flexShrink: 0 }} />
                  <span style={{ fontSize: 13, fontWeight: 500 }}>Successfully unified across channels.</span>
                </div>

                <div style={{ background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.03)", borderRadius: 6, padding: "14px 16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: 9, fontFamily: "var(--font-mono, monospace)", color: "var(--fg-mute, #718096)" }}>
                        LINKED PRIVY DID
                      </div>
                      <code style={{ fontSize: 12, color: "#a78bfa", wordBreak: "break-all", fontFamily: "var(--font-mono, monospace)" }}>
                        {dbStatus.privyDid}
                      </code>
                    </div>
                  </div>
                </div>

                {walletAddress && (
                  <div style={{ background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.03)", borderRadius: 6, padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                    <div>
                      <div style={{ fontSize: 9, fontFamily: "var(--font-mono, monospace)", color: "var(--fg-mute, #718096)", marginBottom: 4 }}>
                        EMBEDDED WALLET · {ESMS_CHAIN.name.toUpperCase()}
                      </div>
                      <button
                        type="button"
                        onClick={copyAddress}
                        title="Copy address"
                        style={{ background: "none", border: "none", padding: 0, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: "#a78bfa", fontFamily: "var(--font-mono, monospace)" }}
                      >
                        {truncateAddress(walletAddress)}
                        {copied ? (
                          <Check style={{ width: 13, height: 13, color: "#34d399" }} />
                        ) : (
                          <Copy style={{ width: 13, height: 13, opacity: 0.5 }} />
                        )}
                      </button>
                    </div>
                    {ESMS_CHAIN.testnet ? (
                      <span style={{ fontSize: 11, color: "var(--fg-mute, #718096)", fontFamily: "var(--font-mono, monospace)" }}>
                        TESTNET · GAS SPONSORED
                      </span>
                    ) : (
                      <Button
                        onClick={() => { void handleFund(); }}
                        disabled={!ready}
                        className="glowing-btn"
                        style={{ padding: "10px 18px" }}
                      >
                        <Wallet style={{ width: 14, height: 14, marginRight: 6 }} />
                        Fund Wallet
                      </Button>
                    )}
                  </div>
                )}

                <p style={{ fontSize: 12, color: "var(--fg-mute, #718096)", lineHeight: 1.5, margin: 0 }}>
                  This alchm.kitchen profile is bound to your Decentralized Identifier. When logging into sibling realms using the
                  same email/wallet, your profile data, tokens, and alchemical preferences will sync automatically.
                </p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <p style={{ fontSize: 13, color: "var(--fg-mute, #a0aec0)", lineHeight: 1.6, margin: 0 }}>
                  Bridge your accounts today. Linking your Privy identity allows you to claim rewards earned on either site, sync streaks,
                  and access premium features seamlessly without duplicating sign-ups.
                </p>

                <div>
                  <Button
                    onClick={handleConnect}
                    disabled={!ready || linking}
                    className="glowing-btn"
                    style={{ padding: "20px 24px" }}
                  >
                    <Wallet style={{ width: 16, height: 16, marginRight: 8 }} />
                    {linking ? "Attuning Identity..." : "Link Privy Identity"}
                  </Button>
                  {!ready && (
                    <p style={{ fontSize: 11, color: "var(--fg-mute, #718096)", marginTop: 6, margin: 0, fontFamily: "var(--font-mono, monospace)" }}>
                      Initializing Privy channels...
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* On-chain ESMS vault: site vs wallet balances + sponsored claim bridge */}
      {!authError && !loading && <OnchainEsmsPanel />}

      {/* Branded modal dialog to present conflict / link error details beautifully */}
      <AlertDialog open={conflictOpen} onOpenChange={setConflictOpen}>
        <AlertDialogContent style={{ background: "rgba(20, 18, 28, 0.95)", border: "1px solid rgba(139, 92, 246, 0.3)", backdropFilter: "blur(20px)" }}>
          <AlertDialogHeader>
            <AlertDialogTitle style={{ display: "flex", alignItems: "center", gap: 10, color: "#ef4444" }}>
              <ShieldAlert style={{ width: 22, height: 22 }} />
              Attunement Conflict
            </AlertDialogTitle>
            <AlertDialogDescription style={{ color: "var(--fg-mute, #cbd5e1)", fontSize: 13.5, lineHeight: 1.6, marginTop: 8 }}>
              {conflictMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter style={{ marginTop: 16 }}>
            <AlertDialogAction
              onClick={() => setConflictOpen(false)}
              className="glowing-btn"
              style={{ background: "#ef4444 !important", boxShadow: "0 4px 14px 0 rgba(239, 68, 68, 0.4) !important" }}
            >
              Acknowledge
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/**
 * PrivyProvider is scoped HERE (not in the app-wide providers tree) so the heavy
 * web3 SDK is only bundled on /account. Mirrors PA's components/account/PrivyConnect.tsx:
 * shared Privy app ⇒ same DID + same embedded Base wallet on alchm.kitchen and
 * agents.alchm.kitchen.
 */
export default function AccountPage(): JSX.Element {
  return (
    <PrivyProvider
      appId={PRIVY_APP_ID}
      config={{
        loginMethods: ["email", "google", "wallet"],
        embeddedWallets: {
          ethereum: { createOnLogin: "users-without-wallets" },
          solana: { createOnLogin: "off" },
        },
        defaultChain: ESMS_CHAIN,
        supportedChains: ESMS_CHAIN.id === base.id ? [base] : [ESMS_CHAIN, base],
        appearance: {
          theme: "dark",
          accentColor: "#805ad5", // Alchm purple accent
          logo: "/alchm-icon-192.png",
        },
      }}
    >
      <AccountInner />
    </PrivyProvider>
  );
}
