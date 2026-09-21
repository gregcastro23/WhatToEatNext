"use client";

/**
 * /shop — the ESMS Bazaar storefront.
 *
 * Dynamically loads ShopStorefront (and its page-scoped PrivyProvider) to decouple
 * heavy web3/wallet SDK chunks from the initial route payload, lowering First Load JS
 * while delivering full EIP-712 signing functionality on client mount.
 */

import dynamic from "next/dynamic";
import type { JSX } from "react";
import { Loader2 } from "lucide-react";

const ShopStorefront = dynamic(() => import("./ShopStorefront"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg-canvas, #0b0c10)",
        color: "var(--fg-default, #e2e8f0)",
        padding: "24px 16px",
        maxWidth: 1120,
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
      }}
    >
      <Loader2 style={{ width: 32, height: 32, animation: "spin 1s linear infinite", color: "#a855f7" }} />
      <p style={{ margin: 0, fontSize: 13.5, color: "var(--fg-mute, #a0aec0)" }}>
        Entering the ESMS Bazaar...
      </p>
    </div>
  ),
});

export default function ShopPage(): JSX.Element {
  return <ShopStorefront />;
}
