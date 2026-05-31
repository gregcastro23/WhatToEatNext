"use client";

/**
 * /account/billing/mcp client surface — buy-button strip for the three
 * MCP top-up SKUs + current ESMS balance + recent purchases.
 *
 * Hits `POST /api/account/billing/mcp-top-up` to mint a Stripe Checkout
 * session and redirects to the returned URL. Reads `?status=success` /
 * `?status=canceled` from the return URL to surface a banner after the
 * Stripe flow completes.
 */

import { Check, CircleX, ExternalLink, Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState, type JSX } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface SkuOption {
  sku: string;
  label: string;
  priceCents: number;
  esmsPerAxis: number;
  available: boolean;
}

interface BalanceState {
  spirit: number;
  essence: number;
  matter: number;
  substance: number;
}

interface TopUpResponse {
  success: boolean;
  url?: string;
  error?: string;
}

const STATIC_OPTIONS: SkuOption[] = [
  {
    sku: "mcp_top_up_5",
    label: "Starter",
    priceCents: 500,
    esmsPerAxis: 50,
    available: true,
  },
  {
    sku: "mcp_top_up_20",
    label: "Builder",
    priceCents: 2000,
    esmsPerAxis: 250,
    available: true,
  },
  {
    sku: "mcp_top_up_50",
    label: "Adept",
    priceCents: 5000,
    esmsPerAxis: 750,
    available: true,
  },
];

function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(0)}`;
}

export function McpTopUpPanel(): JSX.Element {
  const params = useSearchParams();
  const status = params?.get("status") ?? null;
  const sku = params?.get("sku") ?? null;

  const [balance, setBalance] = useState<BalanceState | null>(null);
  const [balanceLoaded, setBalanceLoaded] = useState(false);
  const [buying, setBuying] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Pull current balance so the user can see where they're starting from.
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/economy/balance", {
          credentials: "include",
          cache: "no-store",
        });
        if (!res.ok) return;
        const json = (await res.json()) as {
          success: boolean;
          balances?: BalanceState;
        };
        if (cancelled || !json.balances) return;
        setBalance(json.balances);
      } finally {
        if (!cancelled) setBalanceLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleBuy = useCallback(async (selected: string): Promise<void> => {
    setBuying(selected);
    setError(null);
    try {
      const res = await fetch("/api/account/billing/mcp-top-up", {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ sku: selected }),
      });
      const json = (await res.json()) as TopUpResponse;
      if (!res.ok || !json.success || !json.url) {
        setError(json.error ?? `Checkout failed (${res.status}).`);
        return;
      }
      window.location.href = json.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed.");
    } finally {
      setBuying(null);
    }
  }, []);

  return (
    <div
      style={{
        maxWidth: 880,
        margin: "0 auto",
        padding: "40px 24px",
        color: "var(--fg)",
      }}
    >
      <header style={{ marginBottom: 28 }}>
        <div
          className="t-tag"
          style={{ color: "var(--fg-mute)", marginBottom: 6 }}
        >
          ← ACCOUNT / BILLING / MCP
        </div>
        <h1
          className="t-display"
          style={{ fontSize: 36, margin: 0, marginBottom: 8 }}
        >
          MCP top-up
        </h1>
        <p
          style={{
            color: "var(--fg-mute)",
            fontSize: 14,
            lineHeight: 1.5,
            margin: 0,
          }}
        >
          Buy ESMS bundles to use against the MCP tools that have a token
          cost (right now: <code>generate_cosmic_recipe</code>). Each
          bundle credits an equal amount across Spirit / Essence / Matter /
          Substance.
        </p>
      </header>

      {status === "success" && (
        <Banner
          tone="success"
          icon={<Check />}
          title="Top-up complete"
          body={
            sku
              ? `Your ${sku} bundle is being credited now — check back in a few seconds.`
              : "Your bundle is being credited now."
          }
        />
      )}
      {status === "canceled" && (
        <Banner
          tone="warning"
          icon={<CircleX />}
          title="Checkout canceled"
          body="No charge was made. Pick a bundle below to try again."
        />
      )}
      {error && (
        <Banner
          tone="error"
          icon={<CircleX />}
          title="Couldn't start checkout"
          body={error}
        />
      )}

      <section style={{ marginBottom: 28 }}>
        <div
          className="t-tag"
          style={{
            color: "var(--fg-mute)",
            marginBottom: 10,
            fontSize: 10,
            letterSpacing: "0.16em",
          }}
        >
          CURRENT BALANCE
        </div>
        {balanceLoaded ? (
          balance ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: 10,
              }}
            >
              {(
                [
                  ["Spirit", balance.spirit],
                  ["Essence", balance.essence],
                  ["Matter", balance.matter],
                  ["Substance", balance.substance],
                ] as const
              ).map(([axis, value]) => (
                <div
                  key={axis}
                  style={{
                    border: "1px solid var(--line)",
                    background: "var(--bg-elev, rgba(255,255,255,0.02))",
                    borderRadius: 8,
                    padding: "12px 14px",
                  }}
                >
                  <div
                    className="t-mono"
                    style={{
                      fontSize: 10,
                      letterSpacing: "0.12em",
                      color: "var(--fg-mute)",
                    }}
                  >
                    {axis.toUpperCase()}
                  </div>
                  <div
                    className="t-display"
                    style={{ fontSize: 22, marginTop: 4 }}
                  >
                    {Math.round(value)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div
              style={{
                color: "var(--fg-mute)",
                fontSize: 12,
              }}
            >
              Sign in to view your balance.
            </div>
          )
        ) : (
          <div
            style={{
              color: "var(--fg-mute)",
              fontSize: 12,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <Loader2 className="alchm-spin" />
            Loading balance…
          </div>
        )}
      </section>

      <section>
        <div
          className="t-tag"
          style={{
            color: "var(--fg-mute)",
            marginBottom: 10,
            fontSize: 10,
            letterSpacing: "0.16em",
          }}
        >
          PICK A BUNDLE
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 12,
          }}
        >
          {STATIC_OPTIONS.map((opt) => (
            <div
              key={opt.sku}
              style={{
                border: "1px solid var(--line)",
                background: "var(--bg-elev, rgba(255,255,255,0.02))",
                borderRadius: 10,
                padding: 18,
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              <div
                className="t-mono"
                style={{
                  fontSize: 10,
                  color: "var(--fg-mute)",
                  letterSpacing: "0.16em",
                }}
              >
                {opt.label.toUpperCase()}
              </div>
              <div
                className="t-display"
                style={{ fontSize: 32, lineHeight: 1 }}
              >
                {formatPrice(opt.priceCents)}
              </div>
              <div style={{ fontSize: 12, color: "var(--fg-mute)" }}>
                {opt.esmsPerAxis} of each axis · {opt.esmsPerAxis * 4} total
              </div>
              <div
                style={{
                  display: "flex",
                  gap: 6,
                  flexWrap: "wrap",
                  marginTop: 4,
                }}
              >
                <Badge variant="outline">Spirit +{opt.esmsPerAxis}</Badge>
                <Badge variant="outline">Essence +{opt.esmsPerAxis}</Badge>
                <Badge variant="outline">Matter +{opt.esmsPerAxis}</Badge>
                <Badge variant="outline">Substance +{opt.esmsPerAxis}</Badge>
              </div>
              <div style={{ marginTop: "auto", paddingTop: 8 }}>
                <Button
                  style={{ width: "100%" }}
                  disabled={buying !== null}
                  onClick={() => void handleBuy(opt.sku)}
                >
                  {buying === opt.sku ? "Redirecting…" : "Top up"}
                  <ExternalLink />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <p
        style={{
          marginTop: 28,
          color: "var(--fg-mute)",
          fontSize: 12,
          lineHeight: 1.6,
        }}
      >
        One-time purchase, no recurring charges. Credits land in your
        balance within a few seconds of Stripe confirming the payment.
      </p>
    </div>
  );
}

interface BannerProps {
  tone: "success" | "warning" | "error";
  icon: React.ReactNode;
  title: string;
  body: string;
}

function Banner({ tone, icon, title, body }: BannerProps): JSX.Element {
  const colour =
    tone === "success"
      ? "rgba(80, 200, 120, 0.45)"
      : tone === "warning"
        ? "rgba(245, 166, 35, 0.45)"
        : "rgba(245, 100, 100, 0.45)";
  return (
    <div
      style={{
        border: `1px solid ${colour}`,
        background: "var(--bg-elev, rgba(255,255,255,0.02))",
        borderRadius: 8,
        padding: "12px 14px",
        marginBottom: 18,
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
      }}
    >
      <div style={{ color: colour, marginTop: 2 }}>{icon}</div>
      <div>
        <div className="t-display" style={{ fontSize: 14, marginBottom: 2 }}>
          {title}
        </div>
        <div style={{ fontSize: 12, color: "var(--fg-mute)" }}>{body}</div>
      </div>
    </div>
  );
}
