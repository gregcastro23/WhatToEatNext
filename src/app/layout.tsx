// app/layout.tsx
import React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import PayPalButton from "@/components/PayPalButton";

const inter = Inter({ subsets: ["latin"] });

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
      <body className={inter.className}>
        <Providers>
          <header className="bg-gradient-to-r from-purple-50 via-orange-50 to-pink-50 py-8 border-b-2 border-purple-100 shadow-sm">
            <div className="mx-auto max-w-7xl px-4">
              <div className="flex flex-row items-center justify-between">
                <div>
                  <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-orange-600">
                    Alchm Kitchen
                  </h1>
                  <p className="mt-2 text-gray-700 text-lg">
                    The Menu of the Moment in the Stars and Elements
                  </p>
                </div>
                {/* PayPal Button */}
                <div>
                  <PayPalButton />
                </div>
              </div>
            </div>
          </header>
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  );
}
