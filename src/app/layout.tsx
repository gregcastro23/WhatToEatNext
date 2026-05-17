import { Analytics } from "@vercel/analytics/next";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import SignInModal from "@/components/auth/SignInModal";
import TokenShopModal from "@/components/economy/TokenShopModal";
import { GroceryCartButton } from "@/components/grocery-cart/GroceryCartButton";
import { GroceryCartDrawer } from "@/components/grocery-cart/GroceryCartDrawer";
import MobileNavToggle from "@/components/nav/MobileNavToggle";
import NavAuthLink from "@/components/nav/NavAuthLink";
import NotificationBell from "@/components/nav/NotificationBell";
import PremiumLink from "@/components/nav/PremiumLink";
import PayPalButton from "@/components/PayPalButton";
import PwaRegistration from "@/components/pwa/PwaRegistration";
import ThemeToggle from "@/components/ThemeToggle";
import ClientProviders from "./ClientProviders";
import type { Metadata } from "next";
import "./globals.css";

// app/layout.tsx
// Force dynamic rendering for all pages - the app relies on runtime
// context providers (Chakra, Theme, User, Alchemical) that require
// a client-side React environment during rendering.
export const dynamic = "force-dynamic";
export const viewport = {
  themeColor: "#6366f1",
};

export const metadata: Metadata = {
  title: {
    default: "Alchm Kitchen — What to Eat Next",
    template: "%s | Alchm Kitchen",
  },
  description:
    "Personalized food recommendations based on your chakra energies and astrological harmony",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/alchm-icon-64.png", sizes: "64x64", type: "image/png" },
      { url: "/alchm-icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/alchm-icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/alchm-icon-512.png",
  },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {process.env.NODE_ENV === "development" && (
          <script
            src="https://unpkg.com/react-scan/dist/auto.global.js"
            async
          />
        )}
      </head>
      <body className="font-sans">
        <PwaRegistration />
        <ClientProviders>
          <header className="relative bg-[#08080e] py-4 md:py-6 border-b border-purple-500/30 shadow-lg shadow-purple-900/20" style={{ backgroundImage: 'radial-gradient(ellipse at top center, rgba(109,40,217,0.12) 0%, transparent 60%)' }}>
            <div className="mx-auto max-w-[1400px] px-4 md:px-8">
              <div className="flex flex-col xl:flex-row items-center xl:items-start justify-between gap-6">
                {/* Left Side: Logo and Title */}
                <Link href="/" className="group flex flex-row items-center gap-4 flex-shrink-0 w-full xl:w-1/3 min-h-[44px]">
                  <div className="flex-shrink-0 shadow-xl shadow-purple-900/30 rounded-full overflow-hidden border-2 border-purple-500/50 group-hover:scale-105 group-hover:shadow-purple-500/40 transition-all duration-300">
                    <Image
                      src="/Aklogo.jpg"
                      alt="Alchm Kitchen Logo"
                      width={120}
                      height={120}
                      priority
                      className="object-cover w-[60px] h-[60px] sm:w-[80px] sm:h-[80px] xl:w-[90px] xl:h-[90px] block"
                    />
                  </div>
                  <div className="text-left">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-orange-400 group-hover:from-purple-300 group-hover:to-orange-300 transition-all leading-tight">
                      Alchm Kitchen
                    </h1>
                    <p className="hidden sm:block mt-1 text-gray-400 text-xs md:text-sm font-medium tracking-wide max-w-[280px]">
                      The Menu of the Moment in the Stars and Elements
                    </p>
                  </div>
                </Link>

                {/* Right Side: Navigation & Icons */}
                <div className="flex flex-col items-center xl:items-end flex-grow w-full xl:w-2/3">
                  <div className="flex items-center gap-3 w-full justify-end mb-4 xl:mb-6">
                    <ThemeToggle compact />
                    <GroceryCartButton />
                    <NotificationBell />
                    {/* Hamburger toggle for mobile */}
                    <MobileNavToggle>
                      <Link href="/cuisines" className="px-4 py-3 rounded-xl bg-purple-900/50 hover:bg-purple-800/70 text-purple-200 hover:text-white font-semibold text-sm border border-purple-500/30 transition-all">🍽️ Cuisines</Link>
                      <Link href="/#ingredients" className="px-4 py-3 rounded-xl bg-green-900/40 hover:bg-green-800/60 text-green-200 hover:text-white font-semibold text-sm border border-green-500/30 transition-all">🥬 Ingredients</Link>
                      <Link href="/cooking-methods" className="px-4 py-3 rounded-xl bg-orange-900/40 hover:bg-orange-800/60 text-orange-200 hover:text-white font-semibold text-sm border border-orange-500/30 transition-all">🔥 Cooking Methods</Link>
                      <Link href="/menu-planner" className="px-4 py-3 rounded-xl bg-purple-900/50 hover:bg-purple-800/70 text-purple-200 hover:text-white font-semibold text-sm border border-purple-500/30 transition-all">📅 Menu Planner</Link>
                      <Link href="/pantry" className="px-4 py-3 rounded-xl bg-emerald-900/40 hover:bg-emerald-800/60 text-emerald-200 hover:text-white font-semibold text-sm border border-emerald-500/30 transition-all">🥫 Pantry</Link>
                      <Link href="/food-tracking" className="px-4 py-3 rounded-xl bg-teal-900/40 hover:bg-teal-800/60 text-teal-200 hover:text-white font-semibold text-sm border border-teal-500/30 transition-all">📔 Food Diary</Link>
                      <Link href="/recipe-builder" className="px-4 py-3 rounded-xl bg-amber-900/40 hover:bg-amber-800/60 text-amber-200 hover:text-white font-semibold text-sm border border-amber-500/30 transition-all">✨ Recipe Builder</Link>
                      <Link href="/quantities" className="px-4 py-3 rounded-xl bg-indigo-900/50 hover:bg-indigo-800/70 text-indigo-200 hover:text-white font-semibold text-sm border border-indigo-500/30 transition-all">⚗️ Alchm Quantities</Link>
                      <Link href="/cosmic-recipe" className="px-4 py-3 rounded-xl bg-pink-900/40 hover:bg-pink-800/60 text-pink-200 hover:text-white font-semibold text-sm border border-pink-500/30 transition-all">🌌 Cosmic Recipes</Link>
                      <Link href="/commensal" className="px-4 py-3 rounded-xl bg-cyan-900/40 hover:bg-cyan-800/60 text-cyan-200 hover:text-white font-semibold text-sm border border-cyan-500/30 transition-all">👥 Commensal Group</Link>
                      <Link href="/restaurant-creator" className="px-4 py-3 rounded-xl bg-rose-900/40 hover:bg-rose-800/60 text-rose-200 hover:text-white font-semibold text-sm border border-rose-500/30 transition-all">🏪 Restaurant Creator</Link>
                      <Link href="/sauces" className="px-4 py-3 rounded-xl bg-green-900/40 hover:bg-green-800/60 text-green-200 hover:text-white font-semibold text-sm border border-green-500/30 transition-all">🥣 Sauces</Link>
                      <NavAuthLink />
                    </MobileNavToggle>
                  </div>

                  {/* Desktop Navigation Menu — filling right space */}
                  <nav
                    className="hidden xl:flex flex-wrap justify-end gap-3 w-full"
                    aria-label="Main navigation"
                  >
                    <Link href="/cuisines" className="px-3 py-2 rounded-lg bg-purple-900/50 hover:bg-purple-800/70 text-purple-200 hover:text-white font-semibold text-sm transition-all duration-200 hover:scale-105 hover:shadow-md border border-purple-500/30" aria-label="Explore cuisines">🍽️ Cuisines</Link>
                    <Link href="/ingredients" className="px-3 py-2 rounded-lg bg-green-900/40 hover:bg-green-800/60 text-green-200 hover:text-white font-semibold text-sm transition-all duration-200 hover:scale-105 hover:shadow-md border border-green-500/30" aria-label="Browse ingredients">🥬 Ingredients</Link>
                    <Link href="/cooking-methods" className="px-3 py-2 rounded-lg bg-orange-900/40 hover:bg-orange-800/60 text-orange-200 hover:text-white font-semibold text-sm transition-all duration-200 hover:scale-105 hover:shadow-md border border-orange-500/30" aria-label="Discover cooking methods">🔥 Cooking Methods</Link>
                    <Link href="/menu-planner" className="px-3 py-2 rounded-lg bg-purple-900/50 hover:bg-purple-800/70 text-purple-200 hover:text-white font-semibold text-sm transition-all duration-200 hover:scale-105 hover:shadow-md border border-purple-500/30" aria-label="Plan your weekly menu">📅 Menu Planner</Link>
                    <Link href="/pantry" className="px-3 py-2 rounded-lg bg-emerald-900/40 hover:bg-emerald-800/60 text-emerald-200 hover:text-white font-semibold text-sm transition-all duration-200 hover:scale-105 hover:shadow-md border border-emerald-500/30" aria-label="Track ingredients in your pantry">🥫 Pantry</Link>
                    <Link href="/food-tracking" className="px-3 py-2 rounded-lg bg-teal-900/40 hover:bg-teal-800/60 text-teal-200 hover:text-white font-semibold text-sm transition-all duration-200 hover:scale-105 hover:shadow-md border border-teal-500/30" aria-label="Track what you eat">📔 Food Diary</Link>
                    <Link href="/recipe-builder" className="px-3 py-2 rounded-lg bg-amber-900/40 hover:bg-amber-800/60 text-amber-200 hover:text-white font-semibold text-sm transition-all duration-200 hover:scale-105 hover:shadow-md border border-amber-500/30" aria-label="Build and generate recipes">✨ Recipe Builder</Link>
                    <Link href="/quantities" className="px-3 py-2 rounded-lg bg-indigo-900/50 hover:bg-indigo-800/70 text-indigo-200 hover:text-white font-semibold text-sm transition-all duration-200 hover:scale-105 hover:shadow-md border border-indigo-500/30" aria-label="View alchm quantities">⚗️ Alchm Quantities</Link>
                    <Link href="/cosmic-recipe" className="px-3 py-2 rounded-lg bg-pink-900/40 hover:bg-pink-800/60 text-pink-200 hover:text-white font-semibold text-sm transition-all duration-200 hover:scale-105 hover:shadow-md border border-pink-500/30" aria-label="AI cosmic recipe generator">🌌 Cosmic Recipes</Link>
                    <Link href="/commensal" className="px-3 py-2 rounded-lg bg-cyan-900/40 hover:bg-cyan-800/60 text-cyan-200 hover:text-white font-semibold text-sm transition-all duration-200 hover:scale-105 hover:shadow-md border border-cyan-500/30" aria-label="Commensal Group Recommendations">👥 Commensal Group</Link>
                    <Link href="/restaurant-creator" className="px-3 py-2 rounded-lg bg-rose-900/40 hover:bg-rose-800/60 text-rose-200 hover:text-white font-semibold text-sm transition-all duration-200 hover:scale-105 hover:shadow-md border border-rose-500/30" aria-label="Create your cosmic restaurant">🏪 Restaurant Creator</Link>
                    <PremiumLink />
                    <Link href="/sauces" className="px-3 py-2 rounded-lg bg-green-900/40 hover:bg-green-800/60 text-green-200 hover:text-white font-semibold text-sm transition-all duration-200 hover:scale-105 hover:shadow-md border border-green-500/30" aria-label="Discover Cosmic Sauces">🥣 Sauces</Link>
                    <NavAuthLink />
                  </nav>
                </div>
              </div>
            </div>
          </header>
          <main>{children}</main>
          {/* Footer */}
          <footer className="bg-gradient-to-r from-gray-900 via-purple-900 to-gray-900 text-white py-12 mt-20 border-t-4 border-purple-500">
            <div className="mx-auto max-w-7xl px-4">
              <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-8">
                {/* About Column */}
                <div>
                  <h3 className="text-xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-orange-300">
                    Alchm Kitchen
                  </h3>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    Bridging ancient astrological wisdom with cutting-edge AI to
                    help you discover the perfect meal for every moment.
                  </p>
                </div>
                {/* Explore Column */}
                <div>
                  <h4 className="font-bold mb-4 text-purple-300">Explore</h4>
                  <ul className="space-y-2 text-sm">
                    <li>
                      <Link
                        href="/cuisines"
                        className="text-gray-300 hover:text-purple-300 transition-colors"
                      >
                        🍽️ Cuisines
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/#ingredients"
                        className="text-gray-300 hover:text-green-300 transition-colors"
                      >
                        🥬 Ingredients
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/cooking-methods"
                        className="text-gray-300 hover:text-orange-300 transition-colors"
                      >
                        🔥 Cooking Methods
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/menu-planner"
                        className="text-gray-300 hover:text-purple-300 transition-colors"
                      >
                        📅 Menu Planner
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/pantry"
                        className="text-gray-300 hover:text-emerald-300 transition-colors"
                      >
                        🥫 Pantry
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/food-tracking"
                        className="text-gray-300 hover:text-teal-300 transition-colors"
                      >
                        📔 Food Diary
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/recipe-builder"
                        className="text-gray-300 hover:text-amber-300 transition-colors"
                      >
                        ✨ Recipe Builder
                      </Link>
                    </li>
                    <li>
                      <NavAuthLink variant="footer" />
                    </li>
                  </ul>
                </div>
                {/* Discover Column */}
                <div>
                  <h4 className="font-bold mb-4 text-orange-300">Discover</h4>
                  <ul className="space-y-4 text-sm">
                    <li>
                      <Link
                        href="/quantities"
                        className="text-gray-300 hover:text-indigo-300 transition-colors"
                      >
                        ⚗️ Alchm Quantities
                      </Link>
                    </li>
                    <li className="pt-4">
                      <PayPalButton />
                    </li>
                  </ul>
                </div>
                {/* Legal Column */}
                <div>
                  <h4 className="font-bold mb-4 text-pink-300">Legal</h4>
                  <ul className="space-y-2 text-sm">
                    <li>
                      <Link
                        href="/terms"
                        className="text-gray-300 hover:text-pink-300 transition-colors"
                      >
                        Terms of Service
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/privacy"
                        className="text-gray-300 hover:text-pink-300 transition-colors"
                      >
                        Privacy Policy
                      </Link>
                    </li>
                  </ul>
                </div>
                {/* System Status Column */}
                <div>
                  <h4 className="font-bold mb-4 text-green-300">
                    System Status
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="inline-block w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      <span className="text-gray-300">Build: Stable</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="inline-block w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      <span className="text-gray-300">PostgreSQL: Running</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="inline-block w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      <span className="text-gray-300">Next.js: Active</span>
                    </div>
                  </div>
                </div>
              </div>
              {/* Copyright */}
              <div className="mt-8 pt-8 border-t border-gray-700 text-center text-sm text-gray-400">
                <p>&copy; 2025 Alchm Kitchen. Crafted with cosmic intention.</p>
              </div>
            </div>
          </footer>
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
