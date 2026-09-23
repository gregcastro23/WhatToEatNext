"use client";

/**
 * /account — Identity and on-chain account settings dashboard.
 *
 * Dynamically loads AccountClient (and its page-scoped PrivyProvider) with ssr: false
 * to decouple heavy web3/wallet SDK chunks from the initial route payload, lowering First Load JS
 * while delivering full identity attunement and wallet management on client mount.
 */

import dynamic from "next/dynamic";
import type { JSX } from "react";
import { Loader2 } from "lucide-react";

const AccountClient = dynamic(() => import("./AccountClient"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg-canvas, #0b0c10)",
        color: "var(--fg-default, #e2e8f0)",
        padding: "80px 24px",
        maxWidth: 720,
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
      }}
    >
      <Loader2 style={{ width: 32, height: 32, animation: "spin 1s linear infinite", color: "#a855f7" }} />
      <p style={{ margin: 0, fontSize: 13.5, color: "var(--fg-mute, #a0aec0)", fontFamily: "var(--font-mono, monospace)" }}>
        Attuning celestial channels…
      </p>
    </div>
  ),
});

export default function AccountPage(): JSX.Element {
  return <AccountClient />;
}
