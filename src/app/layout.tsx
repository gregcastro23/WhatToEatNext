import { Analytics } from "@vercel/analytics/next";
import { Cormorant_Garamond, JetBrains_Mono, Manrope } from "next/font/google";
import React from "react";
import SignInModal from "@/components/auth/SignInModal";
import TokenShopModal from "@/components/economy/TokenShopModal";
import { GroceryCartDrawer } from "@/components/grocery-cart/GroceryCartDrawer";
import { AppChromeFooter, AppChromeTabBar } from "@/components/nav/AppChrome";
import { CommandPalette } from "@/components/nav/CommandPalette";
import { MobileGlassTabBar } from "@/components/nav/MobileGlassTabBar";
import { RedesignedFooter } from "@/components/nav/RedesignedFooter";
import { RedesignedHeader } from "@/components/nav/RedesignedHeader";
import PwaRegistration from "@/components/pwa/PwaRegistration";
import ClientProviders from "./ClientProviders";
import type { Metadata } from "next";
import "./globals.css";

const cormorantGaramond = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-mono",
  display: "swap",
});

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
  alternates: {
    canonical: "/",
  },
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
    url: SITE_URL,
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
        {process.env.NODE_ENV === "development" && (
          <script
            src="https://unpkg.com/react-scan/dist/auto.global.js"
            async
          />
        )}
      </head>
      <body className="font-body alchm-root">
        <PwaRegistration />
        <ClientProviders>
          <RedesignedHeader />
          <main id="alchm-main" className="alchm-main">
            {children}
          </main>
          <style>{`
            .alchm-main { min-height: calc(100vh - 80px); }
            @media (max-width: 899px) {
              .alchm-main {
                padding-bottom: max(96px, env(safe-area-inset-bottom));
              }
            }
          `}</style>
          <AppChromeFooter>
            <RedesignedFooter />
          </AppChromeFooter>
          <CommandPalette />
          <AppChromeTabBar>
            <MobileGlassTabBar />
          </AppChromeTabBar>
          <SignInModal />
          <TokenShopModal />
          <GroceryCartDrawer />
        </ClientProviders>
        <Analytics />
      </body>
    </html>
  );
}
// Deployment trigger: Sat Apr 11 21:40:50 EDT 2026
