import { Analytics } from "@vercel/analytics/next";
import React, { Suspense } from "react";
import PageViewTracker from "@/components/analytics/PageViewTracker";
import SignInModal from "@/components/auth/SignInModal";
import TokenShopModal from "@/components/economy/TokenShopModal";
import { GroceryCartDrawer } from "@/components/grocery-cart/GroceryCartDrawer";
import { AppChromeFooter, AppChromeTabBar } from "@/components/nav/AppChrome";
import { MobileGlassTabBar } from "@/components/nav/MobileGlassTabBar";
import { NavigationProgress } from "@/components/nav/NavigationProgress";
import { RedesignedFooter } from "@/components/nav/RedesignedFooter";
import { RedesignedHeader } from "@/components/nav/RedesignedHeader";
import PwaRegistration from "@/components/pwa/PwaRegistration";
import ClientProviders from "./ClientProviders";
import { cormorantGaramond } from "./fonts/cormorantGaramond";
import { jetbrainsMono } from "./fonts/jetbrainsMono";
import { manrope } from "./fonts/manrope";
import { siteMetadata } from "./siteMetadata";
import type { Metadata } from "next";
import "./globals.css";

// app/layout.tsx
// Note: `force-dynamic` is intentionally NOT applied at the root layout. The
// per-request providers (Chakra, User, Alchemical) only run inside the
// (alchm) route group, which sets dynamic = "force-dynamic" itself. Marketing
// and auth-shell routes outside that group remain cacheable at the segment
// level, which dramatically improves TTFB and CDN hit rates.
export const viewport = {
  themeColor: "#07060B",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover" as const,
};

export const metadata: Metadata = siteMetadata;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${cormorantGaramond.variable} ${manrope.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        {process.env.NODE_ENV === "development" &&
          process.env.NEXT_PUBLIC_ENABLE_REACT_SCAN === "true" && (
          <script
            src="https://unpkg.com/react-scan/dist/auto.global.js"
            async
          />
        )}
      </head>
      <body className="font-body alchm-root">
        <a className="alchm-skip-link" href="#alchm-main">
          Skip to main content
        </a>
        <PwaRegistration />
        <ClientProviders>
          <RedesignedHeader />
          <main id="alchm-main" className="alchm-main" tabIndex={-1}>
            {children}
          </main>
          <style>{`
            .alchm-main { min-height: calc(100vh - 80px); }
            @media (max-width: 899px) {
              .alchm-main {
                padding-bottom: calc(96px + env(safe-area-inset-bottom, 0px));
              }
            }
          `}</style>
          <AppChromeFooter>
            <RedesignedFooter />
          </AppChromeFooter>
          <NavigationProgress />
          <AppChromeTabBar>
            <MobileGlassTabBar />
          </AppChromeTabBar>
          {/*
            SignInModal reads URL params (?signin=true) via useSearchParams,
            which forces a CSR bailout on any statically-prerendered page
            that mounts the root layout. Wrapping it in <Suspense> keeps
            those pages cacheable — the modal is mounted but invisible until
            opened, so the fallback can safely be null.
          */}
          <Suspense fallback={null}>
            <SignInModal />
          </Suspense>
          <TokenShopModal />
          <GroceryCartDrawer />
        </ClientProviders>
        <Analytics />
        {/* First-party visit log → /admin/traffic. No cookies, no raw IPs. */}
        <PageViewTracker />
      </body>
    </html>
  );
}
// Deployment trigger: Sat Apr 11 21:40:50 EDT 2026
