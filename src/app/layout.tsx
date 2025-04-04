// app/layout.tsx
import { Inter } from 'next/font/google'
import './globals.css'
import ClientWrapper from '@/components/ClientWrapper'
import '@/utils/retryChunkLoad'

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
        <ClientWrapper>
          {children}
        </ClientWrapper>
      </body>
    </html>
  )
}

export const dynamic = 'force-dynamic'
export const revalidate = 0