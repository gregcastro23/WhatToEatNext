import { Analytics } from "@vercel/analytics/next";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import SignInModal from "@/components/auth/SignInModal";
import TokenShopModal from "@/components/economy/TokenShopModal";
import MobileNavToggle from "@/components/nav/MobileNavToggle";
import NavAuthLink from "@/components/nav/NavAuthLink";
import NotificationBell from "@/components/nav/NotificationBell";
import PremiumLink from "@/components/nav/PremiumLink";
import PayPalButton from "@/components/PayPalButton";
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
  title: "What to Eat Next",
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
      <body className="font-sans">
        <ClientProviders>
          <header className="relative bg-gradient-to-r from-purple-50 via-orange-50 to-pink-50 py-4 md:py-6 border-b-2 border-purple-100 shadow-md">
            <div className="mx-auto max-w-[1400px] px-4 md:px-8">
              <div className="flex flex-col xl:flex-row items-center xl:items-start justify-between gap-6">
                {/* Left Side: Logo and Title */}
                <Link href="/" className="group flex flex-col sm:flex-row items-center sm:items-start gap-4 flex-shrink-0 w-full xl:w-1/3">
                  <div className="relative w-32 h-32 md:w-40 md:h-40 xl:w-48 xl:h-48 flex-shrink-0 shadow-lg rounded-2xl overflow-hidden border-2 border-purple-200 group-hover:scale-105 transition-transform duration-300">
                    <Image
                      src="/Aklogo.jpg"
                      alt="Alchm Kitchen Logo"
                      fill
                      unoptimized
                      sizes="(min-width: 1280px) 192px, 160px"
                      className="object-cover"
                    />
                  </div>
                  <div className="text-center sm:text-left mt-2 sm:mt-0">
                    <h1 className="text-3xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-orange-600 group-hover:from-purple-700 group-hover:to-orange-700 transition-all leading-tight">
                      Alchm <br className="hidden sm:block" />
                      Kitchen
                    </h1>
                    <p className="hidden sm:block mt-2 text-gray-700 text-sm md:text-base font-medium tracking-wide">
                      The Menu of the Moment in the Stars and Elements
                    </p>
                  </div>
                </Link>

                {/* Right Side: Navigation & Icons */}
                <div className="flex flex-col items-center xl:items-end flex-grow w-full xl:w-2/3">
                  <div className="flex items-center gap-3 w-full justify-end mb-4 xl:mb-6">
                    <NotificationBell />
                    {/* Hamburger toggle for mobile */}
                    <MobileNavToggle>
                      <Link href="/#cuisines" className="px-3 py-2.5 rounded-lg bg-white/80 hover:bg-purple-100 text-purple-700 font-semibold text-sm border border-purple-200">🍽️ Cuisines</Link>
                      <Link href="/#ingredients" className="px-3 py-2.5 rounded-lg bg-white/80 hover:bg-green-100 text-green-700 font-semibold text-sm border border-green-200">🥬 Ingredients</Link>
                      <Link href="/cooking-methods" className="px-3 py-2.5 rounded-lg bg-white/80 hover:bg-orange-100 text-orange-700 font-semibold text-sm border border-orange-200">🔥 Cooking Methods</Link>
                      <Link href="/menu-planner" className="px-3 py-2.5 rounded-lg bg-white/80 hover:bg-purple-100 text-purple-700 font-semibold text-sm border border-purple-200">📅 Menu Planner</Link>
                      <Link href="/pantry" className="px-3 py-2.5 rounded-lg bg-white/80 hover:bg-emerald-100 text-emerald-700 font-semibold text-sm border border-emerald-200">🥫 Pantry</Link>
                      <Link href="/food-tracking" className="px-3 py-2.5 rounded-lg bg-white/80 hover:bg-teal-100 text-teal-700 font-semibold text-sm border border-teal-200">📔 Food Diary</Link>
                      <Link href="/recipe-builder" className="px-3 py-2.5 rounded-lg bg-white/80 hover:bg-amber-100 text-amber-700 font-semibold text-sm border border-amber-200">✨ Recipe Builder</Link>
                      <Link href="/quantities" className="px-3 py-2.5 rounded-lg bg-white/80 hover:bg-indigo-100 text-indigo-700 font-semibold text-sm border border-indigo-200">⚗️ Alchm Quantities</Link>
                      <Link href="/cosmic-recipe" className="px-3 py-2.5 rounded-lg bg-white/80 hover:bg-pink-100 text-pink-700 font-semibold text-sm border border-pink-200">🌌 Cosmic Recipes</Link>
                      <Link href="/commensal" className="px-3 py-2.5 rounded-lg bg-white/80 hover:bg-cyan-100 text-cyan-700 font-semibold text-sm border border-cyan-200">👥 Commensal Group</Link>
                      <Link href="/restaurant-creator" className="px-3 py-2.5 rounded-lg bg-white/80 hover:bg-rose-100 text-rose-700 font-semibold text-sm border border-rose-200">🏪 Restaurant Creator</Link>
                      <Link href="/sauces" className="px-3 py-2.5 rounded-lg bg-white/80 hover:bg-green-100 text-green-700 font-semibold text-sm border border-green-200">🥣 Sauces</Link>
                      <NavAuthLink />
                    </MobileNavToggle>
                  </div>

                  {/* Desktop Navigation Menu — filling right space */}
                  <nav
                    className="hidden xl:flex flex-wrap justify-end gap-3 w-full"
                    aria-label="Main navigation"
                  >
                    <Link href="/#cuisines" className="px-3 py-2 rounded-lg bg-white bg-opacity-70 hover:bg-purple-100 text-purple-700 font-semibold text-sm transition-all duration-200 hover:scale-105 hover:shadow-md border border-purple-200" aria-label="Explore cuisines">🍽️ Cuisines</Link>
                    <Link href="/#ingredients" className="px-3 py-2 rounded-lg bg-white bg-opacity-70 hover:bg-green-100 text-green-700 font-semibold text-sm transition-all duration-200 hover:scale-105 hover:shadow-md border border-green-200" aria-label="Browse ingredients">🥬 Ingredients</Link>
                    <Link href="/cooking-methods" className="px-3 py-2 rounded-lg bg-white bg-opacity-70 hover:bg-orange-100 text-orange-700 font-semibold text-sm transition-all duration-200 hover:scale-105 hover:shadow-md border border-orange-200" aria-label="Discover cooking methods">🔥 Cooking Methods</Link>
                    <Link href="/menu-planner" className="px-3 py-2 rounded-lg bg-white bg-opacity-70 hover:bg-purple-100 text-purple-700 font-semibold text-sm transition-all duration-200 hover:scale-105 hover:shadow-md border border-purple-200" aria-label="Plan your weekly menu">📅 Menu Planner</Link>
                    <Link href="/pantry" className="px-3 py-2 rounded-lg bg-white bg-opacity-70 hover:bg-emerald-100 text-emerald-700 font-semibold text-sm transition-all duration-200 hover:scale-105 hover:shadow-md border border-emerald-200" aria-label="Track ingredients in your pantry">🥫 Pantry</Link>
                    <Link href="/food-tracking" className="px-3 py-2 rounded-lg bg-white bg-opacity-70 hover:bg-teal-100 text-teal-700 font-semibold text-sm transition-all duration-200 hover:scale-105 hover:shadow-md border border-teal-200" aria-label="Track what you eat">📔 Food Diary</Link>
                    <Link href="/recipe-builder" className="px-3 py-2 rounded-lg bg-white bg-opacity-70 hover:bg-amber-100 text-amber-700 font-semibold text-sm transition-all duration-200 hover:scale-105 hover:shadow-md border border-amber-200" aria-label="Build and generate recipes">✨ Recipe Builder</Link>
                    <Link href="/quantities" className="px-3 py-2 rounded-lg bg-white bg-opacity-70 hover:bg-indigo-100 text-indigo-700 font-semibold text-sm transition-all duration-200 hover:scale-105 hover:shadow-md border border-indigo-200" aria-label="View alchm quantities">⚗️ Alchm Quantities</Link>
                    <Link href="/cosmic-recipe" className="px-3 py-2 rounded-lg bg-white bg-opacity-70 hover:bg-pink-100 text-pink-700 font-semibold text-sm transition-all duration-200 hover:scale-105 hover:shadow-md border border-pink-200" aria-label="AI cosmic recipe generator">🌌 Cosmic Recipes</Link>
                    <Link href="/commensal" className="px-3 py-2 rounded-lg bg-white bg-opacity-70 hover:bg-cyan-100 text-cyan-700 font-semibold text-sm transition-all duration-200 hover:scale-105 hover:shadow-md border border-cyan-200" aria-label="Commensal Group Recommendations">👥 Commensal Group</Link>
                    <Link href="/restaurant-creator" className="px-3 py-2 rounded-lg bg-white bg-opacity-70 hover:bg-rose-100 text-rose-700 font-semibold text-sm transition-all duration-200 hover:scale-105 hover:shadow-md border border-rose-200" aria-label="Create your cosmic restaurant">🏪 Restaurant Creator</Link>
                    <PremiumLink />
                    <Link href="/sauces" className="px-3 py-2 rounded-lg bg-white bg-opacity-70 hover:bg-green-100 text-green-700 font-semibold text-sm transition-all duration-200 hover:scale-105 hover:shadow-md border border-green-200" aria-label="Discover Cosmic Sauces">🥣 Sauces</Link>
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
              <div className="grid md:grid-cols-4 gap-8">
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
                        href="/#cuisines"
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
                        Alchm Quantities
                      </Link>
                    </li>
                    <li className="pt-4">
                      <PayPalButton />
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
        </ClientProviders>
        <Analytics />
      </body>
    </html>
  );
}
// Deployment trigger: Sat Apr 11 21:40:50 EDT 2026
