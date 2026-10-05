'use client'

import { ExternalLink, Sparkles, Wand2, ArrowLeft, Bot, Flame } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { getServiceUrlSafe } from '@/lib/serviceUrls'
import type { ReactNode } from 'react'

export default function ModernPhilosophersStone(): ReactNode {
  const asolBaseUrl = getServiceUrlSafe('agentsUi')
  const philosophersStoneUrl = `${asolBaseUrl}/philosophers-stone`

  return (
    <div className="min-h-screen px-4 py-12 md:py-20 flex items-center justify-center">
      <div className="max-w-2xl w-full mx-auto space-y-8">
        <Card className="glass-card-premium border-white/10 bg-black/60 backdrop-blur-xl shadow-2xl relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-amber-600/20 rounded-full blur-3xl pointer-events-none" />

          <CardHeader className="text-center space-y-4 pt-10 pb-6 relative z-10">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500/20 via-purple-500/20 to-indigo-500/20 border border-white/15 mx-auto shadow-inner">
              <Sparkles className="w-10 h-10 text-amber-300 animate-pulse" />
            </div>

            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium tracking-wide uppercase bg-purple-500/10 border border-purple-500/20 text-purple-300">
                <Wand2 className="w-3 h-3 text-purple-400" />
                Alchemical Genesis
              </span>
              <CardTitle className="text-3xl md:text-4xl font-serif text-white tracking-tight">
                The Philosopher&apos;s Stone
              </CardTitle>
              <CardDescription className="text-white/60 text-base max-w-lg mx-auto leading-relaxed">
                Planetary agent creation, consciousness calculation, and ignition have moved to{' '}
                <span className="text-white/90 font-medium">Alchemical Agents</span>.
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6 pb-10 px-6 md:px-10 relative z-10">
            <div className="rounded-xl p-5 bg-white/5 border border-white/10 space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-white/90">
                <Bot className="w-4 h-4 text-purple-400" />
                <span>Autonomous Agent Evolution</span>
              </div>
              <p className="text-xs text-white/60 leading-relaxed">
                Forge planetary personas, calibrate sacred geometry stats, and commune with Monica Agent directly on the dedicated Alchemical Agents network.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                asChild
                size="lg"
                className="flex-1 bg-gradient-to-r from-amber-500 to-purple-600 hover:from-amber-600 hover:to-purple-700 text-white font-medium shadow-lg shadow-purple-500/20 transition-all duration-200"
              >
                <a
                  href={philosophersStoneUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2"
                >
                  <Flame className="w-4 h-4 text-amber-200" />
                  <span>Enter on Alchemical Agents</span>
                  <ExternalLink className="w-4 h-4 opacity-80" />
                </a>
              </Button>

              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-white/15 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white"
              >
                <Link href="/" className="flex items-center justify-center gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Kitchen</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
