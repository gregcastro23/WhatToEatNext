import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/auth';
import { userDatabase } from '@/services/userDatabaseService';
import Link from 'next/link';

// Import necessary chart views
import { AlchemicalConstitutionPanel } from '@/components/profile/AlchemicalConstitutionPanel';
import { ElementalWheel } from '@/components/profile/ElementalWheel';
import { CosmicAlignmentCard } from '@/components/profile/CosmicAlignmentCard';
import { NatalTransitChart } from '@/components/dashboard/NatalTransitChart';

export default async function BirthChartPage() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect('/api/auth/signin');
  }

  const profile = await userDatabase.getUserByEmail(session.user.email);
  if (!profile?.profile?.natalChart) {
    redirect('/profile'); // Go to onboarding
  }

  const { natalChart } = profile.profile;
  
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
                 This overlay renders your exact natal planetary positions against real-time celestial weather.
               </p>
             </div>
             <div className="bg-black/50 p-4 rounded-2xl border border-white/[0.02]">
               <NatalTransitChart natalChart={natalChart} />
             </div>
          </div>
        </div>
      </main>
    </div>
  );
}
