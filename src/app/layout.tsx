// app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google'
import './globals.css'
import ClientWrapper from '@/components/ClientWrapper'
import '@/utils/retryChunkLoad'
import { AstrologicalProvider } from '@/context/AstrologicalContext'
import ScriptLoader from '@/components/ScriptLoader'

const inter = Inter({ subsets: ['latin'] })

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
      <head>
        <link rel="stylesheet" href="/transition-helper.css" />
      </head>
      <body className={inter.className}>
        <ScriptLoader />
        <AstrologicalProvider>
          <ClientWrapper>
            {children}
          </ClientWrapper>
        </AstrologicalProvider>
      </body>
    </html>
  )
}

export const dynamic = 'force-dynamic'
export const revalidate = 0