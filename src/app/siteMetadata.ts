/**
 * The root layout's metadata, in a module of its own so it can be tested
 * without loading the layout's components.
 *
 * Every field here is inherited by each page that does not set the same
 * top-level key, so only site-wide facts belong here — never a page-specific
 * one such as a canonical URL or og:url (see rootMetadata.test.ts).
 */
import type { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://alchm.kitchen";
const SITE_TITLE = "Alchm Kitchen — What to Eat Next";
const SITE_DESCRIPTION =
  "Personalized food recommendations based on your chakra energies and astrological harmony.";

export const siteMetadata: Metadata = {
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
