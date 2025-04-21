// app/layout.tsx
import type { Metadata } from 'next';
import './globals.css'
import ClientWrapper from '../components/ClientWrapper'
import '@/utils/retryChunkLoad'
import { AstrologicalProvider } from '../context/AstrologicalContext'
import { AlchemicalProvider } from '../contexts/AlchemicalContext/provider'
import Navigation from '../components/Navigation'

// Font declaration without using next/font
export const metadata: Metadata = {
  title: 'What to Eat Next',
  description: 'Personalized food recommendations based on your chakra energies',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans">
        <AstrologicalProvider>
          <ClientWrapper>
            <Navigation />
            {children}
          </ClientWrapper>
        </AstrologicalProvider>
      </body>
    </html>
  )
}

export const dynamic = 'force-dynamic'
export const revalidate = 0