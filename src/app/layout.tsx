// app/layout.tsx
import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import Providers from "./providers";
import PayPalButton from "@/components/PayPalButton";

export const metadata: Metadata = {
  title: "What to Eat Next",
  description:
    "Personalized food recommendations based on your chakra energies and astrological harmony",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans">
        <Providers>
          <header className="bg-gradient-to-r from-purple-50 via-orange-50 to-pink-50 py-6 border-b-2 border-purple-100 shadow-md sticky top-0 z-50 backdrop-blur-sm bg-opacity-95">
            <div className="mx-auto max-w-7xl px-4">
              <div className="flex flex-col gap-4">
                {/* Top Row: Logo and PayPal */}
                <div className="flex flex-row items-center justify-between">
                  <Link href="/" className="group">
                    <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-orange-600 group-hover:from-purple-700 group-hover:to-orange-700 transition-all">
                      Alchm Kitchen
                    </h1>
                    <p className="mt-1 text-gray-700 text-sm md:text-lg">
                      The Menu of the Moment in the Stars and Elements
                    </p>
                  </Link>
                  {/* PayPal Button */}
                  <div className="hidden md:block">
                    <PayPalButton />
                  </div>
                </div>

                {/* Navigation Menu */}
                <nav className="flex flex-wrap gap-2 md:gap-4" aria-label="Main navigation">
                  <Link
                    href="/#cuisines"
                    className="px-3 py-2 rounded-lg bg-white bg-opacity-70 hover:bg-purple-100 text-purple-700 font-semibold text-sm transition-all duration-200 hover:scale-105 hover:shadow-md border border-purple-200"
                    aria-label="Explore cuisines"
                  >
                    🍽️ Cuisines
                  </Link>
                  <Link
                    href="/#ingredients"
                    className="px-3 py-2 rounded-lg bg-white bg-opacity-70 hover:bg-green-100 text-green-700 font-semibold text-sm transition-all duration-200 hover:scale-105 hover:shadow-md border border-green-200"
                    aria-label="Browse ingredients"
                  >
                    🥬 Ingredients
                  </Link>
                  <Link
                    href="/cooking-methods"
                    className="px-3 py-2 rounded-lg bg-white bg-opacity-70 hover:bg-orange-100 text-orange-700 font-semibold text-sm transition-all duration-200 hover:scale-105 hover:shadow-md border border-orange-200"
                    aria-label="Discover cooking methods"
                  >
                    🔥 Cooking Methods
                  </Link>
                  <Link
                    href="/menu-planner"
                    className="px-3 py-2 rounded-lg bg-white bg-opacity-70 hover:bg-purple-100 text-purple-700 font-semibold text-sm transition-all duration-200 hover:scale-105 hover:shadow-md border border-purple-200"
                    aria-label="Plan your weekly menu"
                  >
                    📅 Menu Planner
                  </Link>
                  <Link
                    href="/quantities"
                    className="px-3 py-2 rounded-lg bg-white bg-opacity-70 hover:bg-indigo-100 text-indigo-700 font-semibold text-sm transition-all duration-200 hover:scale-105 hover:shadow-md border border-indigo-200"
                    aria-label="View alchm quantities"
                  >
                    ⚗️ Alchm Quantities
                  </Link>
                  <Link
                    href="https://planetary-agents.vercel.app/planetary-agents"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 rounded-lg bg-white bg-opacity-70 hover:bg-green-100 text-green-700 font-semibold text-sm transition-all duration-200 hover:scale-105 hover:shadow-md border border-green-200"
                    aria-label="Visit Planetary Agents project"
                  >
                    🧪 Planetary Agents
                  </Link>
                  <Link
                    href="/profile"
                    className="px-3 py-2 rounded-lg bg-white bg-opacity-70 hover:bg-blue-100 text-blue-700 font-semibold text-sm transition-all duration-200 hover:scale-105 hover:shadow-md border border-blue-200"
                    aria-label="View your profile"
                  >
                    👤 Profile
                  </Link>
                  <Link
                    href="/onboarding"
                    className="px-3 py-2 rounded-lg bg-white bg-opacity-70 hover:bg-pink-100 text-pink-700 font-semibold text-sm transition-all duration-200 hover:scale-105 hover:shadow-md border border-pink-200"
                    aria-label="Complete onboarding"
                  >
                    ✨ Get Started
                  </Link>
                </nav>
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
                    Bridging ancient astrological wisdom with cutting-edge AI to help you discover the perfect meal for every moment.
                  </p>
                </div>

                {/* Explore Column */}
                <div>
                  <h4 className="font-bold mb-4 text-purple-300">Explore</h4>
                  <ul className="space-y-2 text-sm">
                    <li>
                      <Link href="/#cuisines" className="text-gray-300 hover:text-purple-300 transition-colors">
                        🍽️ Cuisines
                      </Link>
                    </li>
                    <li>
                      <Link href="/#ingredients" className="text-gray-300 hover:text-green-300 transition-colors">
                        🥬 Ingredients
                      </Link>
                    </li>
                    <li>
                      <Link href="/cooking-methods" className="text-gray-300 hover:text-orange-300 transition-colors">
                        🔥 Cooking Methods
                      </Link>
                    </li>
                    <li>
                      <Link href="/menu-planner" className="text-gray-300 hover:text-purple-300 transition-colors">
                        📅 Menu Planner
                      </Link>
                    </li>
                    <li>
                      <Link href="/profile" className="text-gray-300 hover:text-blue-300 transition-colors">
                        👤 Profile
                      </Link>
                    </li>
                    <li>
                      <Link href="/onboarding" className="text-gray-300 hover:text-pink-300 transition-colors">
                        ✨ Get Started
                      </Link>
                    </li>
                  </ul>
                </div>

                {/* Discover Column */}
                <div>
                  <h4 className="font-bold mb-4 text-orange-300">Discover</h4>
                  <ul className="space-y-2 text-sm">
                    <li>
                      <Link href="/quantities" className="text-gray-300 hover:text-indigo-300 transition-colors">
                        ⚗️ Alchm Quantities
                      </Link>
                    </li>
                  </ul>
                </div>

                {/* System Status Column */}
                <div>
                  <h4 className="font-bold mb-4 text-green-300">System Status</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="inline-block w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                      <span className="text-gray-300">Build: Stable</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="inline-block w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                      <span className="text-gray-300">PostgreSQL: Running</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="inline-block w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
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
        </Providers>
      </body>
    </html>
  );
}
