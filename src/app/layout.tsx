// app/layout.tsx
import { Inter } from 'next/font/google'
import ClientProviders from '@/components/providers/ClientProviders'
import './globals.css'
import { AlchemicalProvider } from '@/contexts/AlchemicalContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import Clock from '@/components/Clock'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'What To Eat Next',
  description: 'Find your next meal',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <AlchemicalProvider>
            <ClientProviders>
              <Clock />
              <header className="bg-gray-50 py-6">
                <div className="max-w-7xl mx-auto px-4">
                  <h1 className="text-3xl font-bold text-gray-900">
                    Alchemical Kitchen
                  </h1>
                  <p className="mt-2 text-gray-600">
                    Discover recipes aligned with nature's current elemental balance
                  </p>
                </div>
              </header>
              <main>{children}</main>
            </ClientProviders>
          </AlchemicalProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

export const dynamic = 'force-dynamic'
export const revalidate = 0