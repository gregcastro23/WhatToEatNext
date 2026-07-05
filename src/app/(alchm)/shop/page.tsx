"use client";

/**
 * /shop — the ESMS Bazaar storefront.
 *
 * The on-chain spend surface: items are bought by BURNING the buyer's claimed
 * soulbound ESMS (EsmsToken.redeemFor on Base) — the burn is the payment. Flow:
 *   1. POST /api/economy/shop/purchase {itemId} → EIP-712 RedeemAuthorization
 *      challenge (mode:'sign') with a 10-minute deadline.
 *   2. The buyer signs it with their Privy embedded wallet (eth_signTypedData_v4
 *      — an off-chain signature, no gas).
 *   3. POST again with {signature, deadline} → the backend settlement wallet
 *      submits the sponsored burn and grants the entitlement.
 *
 * PrivyProvider is scoped HERE (like /account) so the web3 SDK stays out of
 * every other route's bundle. Earned tokens must first be claimed on-chain via
 * the vault on /account — the storefront cross-links when balance is short.
 */

import { PrivyProvider, usePrivy, useWallets } from "@privy-io/react-auth";
import {
  ArrowLeft,
  BadgeCheck,
  ExternalLink,
  Flame,
  Loader2,
  Sparkles,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, type JSX } from "react";
import { base, baseSepolia } from "viem/chains";
import { Button } from "@/components/ui/button";

const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID || "cmi9t84qs00acl80dam2j8195";
const ESMS_CHAIN = process.env.NEXT_PUBLIC_ESMS_CHAIN === "base" ? base : baseSepolia;

interface CoinAmounts {
  spirit: number;
  essence: number;
  matter: number;
  substance: number;
}

interface ShopItem {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  category: string;
  isOneTime: boolean;
  baseCost: CoinAmounts;
  liveCost: CoinAmounts;
  owned: boolean;
}

interface OnchainStatus {
  configured: boolean;
  walletAddress: string | null;
  walletLinked: boolean;
  offchain: CoinAmounts;
  onchain: CoinAmounts | null;
  chain: { chainName: string; testnet: boolean; explorerBaseUrl: string | null };
}

interface SignChallenge {
  domain: { name: string; version: string; chainId: number; verifyingContract: string };
  types: Record<string, Array<{ name: string; type: string }>>;
  primaryType: string;
  message: Record<string, unknown>;
}

type BuyPhase = "idle" | "requesting" | "signing" | "settling";

const COINS: Array<{ key: keyof CoinAmounts; symbol: string; color: string }> = [
  { key: "spirit", symbol: "🝇", color: "#fbbf24" },
  { key: "essence", symbol: "🝑", color: "#60a5fa" },
  { key: "matter", symbol: "🝙", color: "#34d399" },
  { key: "substance", symbol: "🝉", color: "#c084fc" },
];

function fmt(n: number): string {
  return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

function CostRow({ cost, compare }: { cost: CoinAmounts; compare?: CoinAmounts | null }): JSX.Element {
  return (
    <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
      {COINS.map((c) =>
        cost[c.key] > 0 ? (
          <span key={c.key} style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12.5 }}>
            <span style={{ color: c.color, fontSize: 14 }}>{c.symbol}</span>
            <span
              style={{
                fontFamily: "var(--font-mono, monospace)",
                color: compare && compare[c.key] < cost[c.key] ? "#ef4444" : "#e2e8f0",
              }}
            >
              {fmt(cost[c.key])}
            </span>
          </span>
        ) : null,
      )}
    </div>
  );
}

function canAffordOnchain(cost: CoinAmounts, onchain: CoinAmounts | null): boolean {
  if (!onchain) return false;
  return (
    onchain.spirit >= cost.spirit &&
    onchain.essence >= cost.essence &&
    onchain.matter >= cost.matter &&
    onchain.substance >= cost.substance
  );
}

function ShopInner(): JSX.Element {
  const { login, ready, authenticated } = usePrivy();
  const { wallets } = useWallets();

  const [items, setItems] = useState<ShopItem[] | null>(null);
  const [status, setStatus] = useState<OnchainStatus | null>(null);
  const [authError, setAuthError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState<{ slug: string; phase: BuyPhase } | null>(null);
  const [notice, setNotice] = useState<{ kind: "ok" | "err"; text: string; txUrl?: string | null } | null>(null);

  const embeddedWallet = useMemo(
    () => wallets.find((w) => w.walletClientType === "privy"),
    [wallets],
  );

  const refresh = useCallback(async (): Promise<void> => {
    try {
      const [shopRes, chainRes] = await Promise.all([
        fetch("/api/economy/shop?category=all", { cache: "no-store" }),
        fetch("/api/economy/claim-onchain", { cache: "no-store" }),
      ]);
      if (shopRes.status === 401 || chainRes.status === 401) {
        setAuthError(true);
        return;
      }
      if (shopRes.ok) {
        const json = (await shopRes.json()) as { items?: ShopItem[] };
        setItems(json.items ?? []);
      }
      if (chainRes.ok) {
        setStatus((await chainRes.json()) as OnchainStatus);
      }
    } catch {
      /* transient — surfaces as empty state */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const handleBuy = useCallback(
    async (item: ShopItem): Promise<void> => {
      setNotice(null);
      setBuying({ slug: item.slug, phase: "requesting" });
      try {
        const r1 = await fetch("/api/economy/shop/purchase", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ itemId: item.slug }),
        });
        const j1 = (await r1.json()) as {
          ok?: boolean;
          alreadyOwned?: boolean;
          reconciled?: boolean;
          txHash?: string;
          mode?: string;
          orderId?: string;
          deadline?: string;
          challenge?: SignChallenge;
          error?: string;
          code?: string;
        };

        if (j1.ok) {
          const txUrl =
            j1.txHash && status?.chain.explorerBaseUrl
              ? `${status.chain.explorerBaseUrl}/tx/${j1.txHash}`
              : null;
          setNotice({
            kind: "ok",
            text: j1.alreadyOwned
              ? `${item.title} is already yours.`
              : `${item.title} acquired — ESMS burned on-chain.`,
            txUrl,
          });
          return;
        }

        if (j1.code === "no_wallet") {
          setNotice({ kind: "err", text: "Link your Privy wallet first — visit your Account page." });
          return;
        }
        if (j1.code === "onchain_unconfigured" || j1.code === "redeemer_unconfigured") {
          setNotice({ kind: "err", text: "On-chain purchases aren't configured on this server yet." });
          return;
        }

        if (j1.mode === "sign" && j1.challenge && j1.deadline) {
          // The signature must come from the linked wallet the server challenged.
          if (!authenticated) {
            login();
            setNotice({ kind: "err", text: "Authenticate with Privy, then tap Buy again." });
            return;
          }
          const from = String(j1.challenge.message.from || "");
          const signer = embeddedWallet;
          if (!signer || signer.address.toLowerCase() !== from.toLowerCase()) {
            setNotice({
              kind: "err",
              text: "Your Privy session wallet doesn't match your linked wallet — relink on the Account page.",
            });
            return;
          }

          setBuying({ slug: item.slug, phase: "signing" });
          // eth_signTypedData_v4 needs the EIP712Domain type alongside the
          // challenge's primary type.
          const typedData = {
            ...j1.challenge,
            types: {
              EIP712Domain: [
                { name: "name", type: "string" },
                { name: "version", type: "string" },
                { name: "chainId", type: "uint256" },
                { name: "verifyingContract", type: "address" },
              ],
              ...j1.challenge.types,
            },
          };
          const provider = await signer.getEthereumProvider();
          const signature = (await provider.request({
            method: "eth_signTypedData_v4",
            params: [signer.address, JSON.stringify(typedData)],
          })) as string;

          setBuying({ slug: item.slug, phase: "settling" });
          const r2 = await fetch("/api/economy/shop/purchase", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ itemId: item.slug, signature, deadline: j1.deadline }),
          });
          const j2 = (await r2.json()) as { ok?: boolean; txHash?: string; error?: string; code?: string };
          if (j2.ok) {
            const txUrl =
              j2.txHash && status?.chain.explorerBaseUrl
                ? `${status.chain.explorerBaseUrl}/tx/${j2.txHash}`
                : null;
            setNotice({ kind: "ok", text: `${item.title} acquired — ESMS burned on-chain.`, txUrl });
          } else {
            setNotice({ kind: "err", text: j2.error || "The on-chain burn failed — nothing was spent. Try again." });
          }
          return;
        }

        setNotice({ kind: "err", text: j1.error || "Purchase failed — try again." });
      } catch (err) {
        const rejected = err instanceof Error && /reject|denied|cancell?ed/i.test(err.message);
        setNotice({
          kind: "err",
          text: rejected ? "Signature declined — nothing was spent." : "Network error — nothing was spent. Try again.",
        });
      } finally {
        setBuying(null);
        void refresh();
      }
    },
    [authenticated, embeddedWallet, login, refresh, status],
  );

  const onchainTotal = status?.onchain
    ? status.onchain.spirit + status.onchain.essence + status.onchain.matter + status.onchain.substance
    : 0;

  return (
    <div className="bazaar-container">
      <style>{`
        .bazaar-container {
          max-width: 920px;
          margin: 0 auto;
          padding: 72px 24px;
          color: var(--fg, #e2e8f0);
        }
        .bazaar-card {
          background: rgba(18, 16, 26, 0.45);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(139, 92, 246, 0.15);
          border-radius: 16px;
          padding: 24px;
          transition: border-color 0.3s ease;
        }
        .bazaar-card:hover { border-color: rgba(139, 92, 246, 0.3); }
        .bazaar-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 16px;
        }
        .bazaar-btn {
          background: linear-gradient(135deg, #7c3aed 0%, #4c1d95 100%) !important;
          color: white !important;
          border: none !important;
          box-shadow: 0 4px 14px 0 rgba(124, 58, 237, 0.4) !important;
        }
        .bazaar-btn:disabled { opacity: 0.45; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>

      <Link
        href="/"
        style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontFamily: "var(--f-mono, monospace)", letterSpacing: "0.08em", color: "var(--fg-mute, #a0aec0)", textDecoration: "none", marginBottom: 16, width: "fit-content" }}
      >
        <ArrowLeft style={{ width: 12, height: 12 }} />
        RETURN HOME
      </Link>

      <header style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#a78bfa", marginBottom: 8, fontSize: 11, letterSpacing: "0.2em", fontFamily: "var(--font-mono, monospace)" }}>
          <Sparkles style={{ width: 14, height: 14 }} />
          ESMS BAZAAR · {ESMS_CHAIN.name.toUpperCase()}
          {ESMS_CHAIN.testnet ? " · TESTNET" : ""}
        </div>
        <h1 className="t-display" style={{ fontSize: 36, margin: 0, fontWeight: 500, letterSpacing: "-0.02em" }}>
          The Alchemist&apos;s Bazaar
        </h1>
        <p style={{ color: "var(--fg-mute, #718096)", fontSize: 14, lineHeight: 1.6, marginTop: 8, marginBottom: 0, maxWidth: 640 }}>
          Spend your claimed on-chain ESMS. Each purchase burns soulbound tokens from your wallet —
          a gasless signature is your consent, the burn is your receipt.
        </p>
      </header>

      {authError ? (
        <div className="bazaar-card">
          <p style={{ margin: 0, fontSize: 14 }}>Sign in to browse the Bazaar.</p>
          <div style={{ marginTop: 16 }}>
            <Link href="/api/auth/signin?callbackUrl=/shop">
              <Button className="bazaar-btn">Sign In</Button>
            </Link>
          </div>
        </div>
      ) : loading ? (
        <div className="bazaar-card" style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Loader2 style={{ width: 16, height: 16, animation: "spin 1.2s linear infinite" }} />
          <span style={{ fontSize: 13, fontFamily: "var(--font-mono, monospace)", color: "var(--fg-mute, #a0aec0)" }}>
            Unfurling the market stalls…
          </span>
        </div>
      ) : (
        <>
          {/* Wallet strip */}
          <div className="bazaar-card" style={{ marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: 9, fontFamily: "var(--font-mono, monospace)", color: "var(--fg-mute, #718096)", letterSpacing: "0.08em", marginBottom: 6 }}>
                WALLET BALANCE (ON-CHAIN · SPENDABLE)
              </div>
              {status?.walletLinked ? (
                <CostRow cost={status.onchain ?? { spirit: 0, essence: 0, matter: 0, substance: 0 }} />
              ) : (
                <span style={{ fontSize: 13, color: "var(--fg-mute, #a0aec0)" }}>No wallet linked yet.</span>
              )}
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              {!status?.walletLinked && (
                <Link href="/account">
                  <Button className="bazaar-btn" style={{ padding: "10px 16px" }}>
                    <Wallet style={{ width: 14, height: 14, marginRight: 6 }} />
                    Link Wallet
                  </Button>
                </Link>
              )}
              {status?.walletLinked && onchainTotal <= 0 && (
                <Link href="/account" style={{ fontSize: 12.5, color: "#a78bfa", textDecoration: "none" }}>
                  Claim your earned ESMS on-chain →
                </Link>
              )}
              {status?.walletLinked && !authenticated && (
                <Button onClick={login} disabled={!ready} className="bazaar-btn" style={{ padding: "10px 16px" }}>
                  Unlock signing
                </Button>
              )}
            </div>
          </div>

          {status && !status.configured && (
            <div style={{ fontSize: 12.5, color: "#d97706", background: "rgba(217,119,6,0.08)", border: "1px solid rgba(217,119,6,0.25)", borderRadius: 8, padding: "12px 16px", marginBottom: 20 }}>
              On-chain commerce isn&apos;t configured on this server yet — browsing only.
            </div>
          )}

          {notice && (
            <div
              style={{
                fontSize: 13,
                color: notice.kind === "ok" ? "#34d399" : "#ef4444",
                background: notice.kind === "ok" ? "rgba(52,211,153,0.08)" : "rgba(239,68,68,0.08)",
                border: `1px solid ${notice.kind === "ok" ? "rgba(52,211,153,0.25)" : "rgba(239,68,68,0.25)"}`,
                borderRadius: 8,
                padding: "12px 16px",
                marginBottom: 20,
                display: "flex",
                alignItems: "center",
                gap: 10,
                flexWrap: "wrap",
              }}
            >
              <span>{notice.text}</span>
              {notice.txUrl && (
                <a href={notice.txUrl} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 4, color: "#a78bfa", fontFamily: "var(--font-mono, monospace)", fontSize: 12, textDecoration: "none" }}>
                  view burn <ExternalLink style={{ width: 12, height: 12 }} />
                </a>
              )}
            </div>
          )}

          {/* Stalls */}
          {items && items.length > 0 ? (
            <div className="bazaar-grid">
              {items.map((item) => {
                const affordable = canAffordOnchain(item.baseCost, status?.onchain ?? null);
                const busy = buying?.slug === item.slug;
                const disabled =
                  !status?.configured || !status?.walletLinked || (item.owned && item.isOneTime) || busy || !affordable;
                return (
                  <div key={item.slug} className="bazaar-card" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                      <div style={{ fontSize: 15, fontWeight: 600 }}>{item.title}</div>
                      <span style={{ fontSize: 9, fontFamily: "var(--font-mono, monospace)", letterSpacing: "0.06em", color: "#a78bfa", border: "1px solid rgba(139,92,246,0.3)", borderRadius: 999, padding: "2px 8px", whiteSpace: "nowrap" }}>
                        {item.category.toUpperCase()}
                      </span>
                    </div>
                    {item.description && (
                      <p style={{ margin: 0, fontSize: 12.5, color: "var(--fg-mute, #a0aec0)", lineHeight: 1.5 }}>
                        {item.description}
                      </p>
                    )}
                    <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 10 }}>
                      <CostRow cost={item.baseCost} compare={status?.onchain ?? null} />
                      {item.owned && item.isOneTime ? (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12.5, color: "#34d399" }}>
                          <BadgeCheck style={{ width: 14, height: 14 }} /> Owned
                        </span>
                      ) : (
                        <Button
                          onClick={() => void handleBuy(item)}
                          disabled={disabled}
                          className="bazaar-btn"
                          style={{ padding: "10px 14px", width: "100%" }}
                          title={
                            !status?.walletLinked
                              ? "Link your wallet first"
                              : !affordable
                                ? "Not enough claimed ESMS in your wallet"
                                : undefined
                          }
                        >
                          {busy ? (
                            <>
                              <Loader2 style={{ width: 13, height: 13, marginRight: 6, animation: "spin 1.2s linear infinite" }} />
                              {buying?.phase === "signing"
                                ? "Awaiting signature…"
                                : buying?.phase === "settling"
                                  ? "Burning on-chain…"
                                  : "Preparing…"}
                            </>
                          ) : (
                            <>
                              <Flame style={{ width: 13, height: 13, marginRight: 6 }} />
                              Burn to buy
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bazaar-card">
              <p style={{ margin: 0, fontSize: 13.5, color: "var(--fg-mute, #a0aec0)" }}>
                The stalls are being restocked — check back soon.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function ShopPage(): JSX.Element {
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
          accentColor: "#805ad5",
          logo: "/alchm-icon-192.png",
        },
      }}
    >
      <ShopInner />
    </PrivyProvider>
  );
}
