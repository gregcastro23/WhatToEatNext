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

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://alchm.kitchen";
const SITE_TITLE = "Alchm Kitchen — What to Eat Next";
const SITE_DESCRIPTION =
  "Personalized food recommendations based on your chakra energies and astrological harmony.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: "%s | Alchm Kitchen",
  },
  description: SITE_DESCRIPTION,
  applicationName: "Alchm Kitchen",
  manifest: "/manifest.json",
  // No `alternates.canonical` and no `openGraph.url` here: every page that
  // does not set its own inherits them, so a root value of "/" made /recipes,
  // /cuisines, /ingredients… each declare the homepage as its canonical
  // (production, 2026-09-25). A page without one is self-canonical; pages
  // that need a specific canonical (/sauces, /search, dossiers) set their own.
  icons: {
    icon: [
      { url: "/alchm-icon-64.png", sizes: "64x64", type: "image/png" },
      { url: "/alchm-icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/alchm-icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/alchm-icon-512.png",
  },
  openGraph: {
    type: "website",
    siteName: "Alchm Kitchen",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: "/alchm-icon-512.png",
        width: 512,
        height: 512,
        alt: "Alchm Kitchen",
      },
    ],
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: ["/alchm-icon-512.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

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
