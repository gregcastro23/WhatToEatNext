// src/app/layout.tsx

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AlchemicalProvider } from '@/contexts/AlchemicalContext';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "What To Eat Next",
  description: "Intelligent food recommendations based on what you've eaten",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AlchemicalProvider>
          {children}
        </AlchemicalProvider>
      </body>
    </html>
  );
}