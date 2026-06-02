import Link from 'next/link';
import { redirect } from 'next/navigation';
import TarotCardDisplay from '@/components/TarotCardDisplay';
import { auth } from '@/lib/auth/auth';
import { withTimeout } from '@/lib/performance/withTimeout';
import { userDatabase } from '@/services/userDatabaseService';
import { CurrentChartClient } from './CurrentChartClient';

export default async function CurrentChartPage() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect('/login');
  }

  // 8s ceiling so a slow Railway lookup can't wedge the Vercel function until
  // its 60s hard limit. On timeout we fall through the same redirect as a
  // genuinely missing chart.
  const profile = await withTimeout(
    userDatabase.getUserByEmail(session.user.email),
    8000,
    null,
    'current-chart getUserByEmail',
  );
  if (!profile?.profile?.natalChart) {
    redirect('/profile'); // Go to onboarding
  }

  const { natalChart } = profile.profile;

  const nowStr = new Date().toLocaleString('en-US', {
    weekday: 'long',
    month: 'long', 
    day: 'numeric',
    year: 'numeric',
    timeZoneName: 'short'
  });

  return (
    <div className="min-h-screen bg-black text-white selection:bg-purple-500/30">
      {/* Background elements */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-orange-900/10 rounded-full blur-[120px] mix-blend-screen transform translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-emerald-900/10 rounded-full blur-[100px] mix-blend-screen transform -translate-x-1/3 translate-y-1/3" />
      </div>

      {/* Main Content */}
      <main className="relative z-10 max-w-4xl mx-auto px-4 py-8 md:py-16 space-y-8">
        
        <div className="flex items-center gap-4 text-sm font-medium text-white/50 hover:text-white/80 transition-colors uppercase tracking-wider mb-8">
          <Link href="/profile" className="flex items-center gap-2 group">
            <svg className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </Link>
        </div>

        {/* Hero Section */}
        <div className="text-center space-y-4 mb-12">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-200">
            Real-Time Celestial Weather
          </h1>
          <p className="text-white/40 font-mono text-sm uppercase tracking-widest">{nowStr}</p>
        </div>

        <CurrentChartClient natalChart={natalChart} />

        {/* Tarot of the Moment — the decan (minor) + planetary (major) cards ruling now */}
        <section className="space-y-5">
          <div className="text-center space-y-2">
            <h2 className="text-2xl md:text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-fuchsia-300">
              Tarot of the Moment
            </h2>
            <p className="text-white/40 font-mono text-xs uppercase tracking-widest">
              The decan &amp; planetary cards ruling now
            </p>
          </div>
          <TarotCardDisplay />
        </section>
      </main>
    </div>
  );
}
