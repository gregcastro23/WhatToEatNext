import Link from 'next/link';
import { redirect } from 'next/navigation';
import { buildFreeBodyDiagrams, type FBDPositionInput, type PlanetFBD } from '@/calculations/planetaryFBD';
import { NatalTransitChart } from '@/components/dashboard/NatalTransitChart';
import { AlchemicalConstitutionPanel } from '@/components/profile/AlchemicalConstitutionPanel';
import { CosmicAlignmentCard } from '@/components/profile/CosmicAlignmentCard';
import { ElementalWheel } from '@/components/profile/ElementalWheel';
import PlanetFBDCard from '@/components/ui/alchm/PlanetFBDCard';
import { auth } from '@/lib/auth/auth';
import { withTimeout } from '@/lib/performance/withTimeout';
import { userDatabase } from '@/services/userDatabaseService';
import type { NatalChart } from '@/types/natalChart';
import { isSectDiurnalForBirth } from '@/utils/planetaryAlchemyMapping';

/**
 * Natal free-body diagrams from the stored chart. Only planets carrying a
 * real absolute longitude participate (position 0 means unknown/legacy) — a
 * fabricated degree would produce confidently wrong aspects. Stored charts
 * carry no daily motions, so cards degrade honestly (no applying/separating,
 * no momentum).
 */
function buildNatalFBDs(natalChart: NatalChart): PlanetFBD[] | null {
  const fbdPositions: Record<string, FBDPositionInput> = {};
  for (const planet of natalChart.planets ?? []) {
    if (!planet?.name || !planet.sign) continue;
    if (typeof planet.position !== 'number' || planet.position <= 0) continue;
    const degreeInSign = planet.position % 30;
    fbdPositions[planet.name] = {
      sign: planet.sign,
      // `degree` is sign-relative and already carries the fractional
      // arc-minutes; passing `minute` as well would double-count them on the
      // fallback path that reconstructs a longitude from sign + degree.
      degree: degreeInSign,
      exactLongitude: planet.position,
    };
  }
  if (Object.keys(fbdPositions).length < 2) return null;

  const birthDate = natalChart.birthData?.dateTime
    ? new Date(natalChart.birthData.dateTime)
    : new Date(natalChart.calculatedAt);
  return buildFreeBodyDiagrams({
    positions: fbdPositions,
    diurnal: isSectDiurnalForBirth(birthDate),
  }).cards;
}


export default async function BirthChartPage() {
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
    'birth-chart getUserByEmail',
  );
  if (!profile?.profile?.natalChart) {
    redirect('/profile'); // Go to onboarding
  }

  const { natalChart } = profile.profile;
  const natalFBDs = buildNatalFBDs(natalChart);

  // Format the birth date string if available
  const chartDate = natalChart.birthData?.dateTime
    ? new Date(natalChart.birthData.dateTime).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  return (
    <div className="min-h-screen bg-black text-white selection:bg-purple-500/30">
      {/* Background elements */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-purple-900/10 rounded-full blur-[120px] mix-blend-screen transform translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-amber-900/10 rounded-full blur-[100px] mix-blend-screen transform -translate-x-1/3 translate-y-1/3" />
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
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-amber-200">
            Your Cosmic Profile
          </h1>
          {chartDate && (
            <p className="text-white/40 font-mono text-sm uppercase tracking-widest">{chartDate}</p>
          )}
        </div>

        {/* Natal Chart Component Matrix */}
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <ElementalWheel natalChart={natalChart} />
            <AlchemicalConstitutionPanel natalChart={natalChart} />
          </div>
          
          <CosmicAlignmentCard natalChart={natalChart} />

          <div className="bg-gray-950 rounded-3xl p-6 border border-white/5 shadow-2xl mt-8">
             <div className="mb-6">
               <h3 className="text-lg font-bold text-white uppercase tracking-widest">Natal &amp; Transit Cartography</h3>
               <p className="text-white/40 text-sm mt-1">
                 Your exact natal positions against real-time celestial weather — now with aspect
                 chords (teal harmony, ember tension) and elemental sign vectors at each planet.
               </p>
             </div>
             <div className="bg-black/50 p-4 rounded-2xl border border-white/[0.02]">
               <NatalTransitChart natalChart={natalChart} />
             </div>
          </div>

          {/* Natal free-body diagrams (alchm-root scope provides the design tokens) */}
          <div className="alchm-root bg-gray-950 rounded-3xl p-6 border border-white/5 shadow-2xl mt-8">
            <div className="mb-6">
              <h3 className="text-lg font-bold text-white uppercase tracking-widest">Natal Free-Body Diagrams</h3>
              <p className="text-white/40 text-sm mt-1">
                The forces frozen into each planet at your birth moment — aspects at true ecliptic
                bearings, sign and sect pulls on the element compass, dignity boosts and drags, and
                the violet ESMS resultant. A stored chart carries no daily motions, so
                applying/separating dynamics and momentum are shown only on the live sky
                (<Link href="/planetary-chart" className="underline decoration-white/20 hover:text-white/70">planetary ecosystem</Link>).
              </p>
            </div>
            {natalFBDs ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {natalFBDs.map((fbd) => (
                  <PlanetFBDCard key={fbd.planet} fbd={fbd} />
                ))}
              </div>
            ) : (
              <p className="text-white/40 text-sm font-mono uppercase tracking-wider">
                Awaiting exact natal longitudes — re-run ignite to compute degree-precise positions.
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
