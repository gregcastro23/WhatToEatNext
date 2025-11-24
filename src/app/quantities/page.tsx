"use client";

import { Flame, Droplets, Wind, Mountain, Activity } from "lucide-react";
import { Suspense } from "react";
import AlchmQuantitiesDisplay from "@/components/alchm-quantities-display";
import AlchmQuantitiesTrends from "@/components/alchm-quantities-trends";
import AlchmKinetics from "@/components/alchm-kinetics";
import PlanetaryContributionsChart from "@/components/PlanetaryContributionsChart";

export default function QuantitiesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <div className="container mx-auto py-8 px-4">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 flex items-center justify-center gap-3 text-transparent bg-clip-text bg-gradient-to-r from-orange-300 to-purple-300">
            <span>⚗️</span>
            Alchm Quantities
            <span>🔮</span>
          </h1>
          <p className="max-w-3xl mx-auto text-lg text-gray-300">
            Real-time alchemical calculations based on current planetary positions. Spirit,
            Essence, Matter, and Substance quantities with kinetic analysis.
          </p>

          {/* Quantity Badges */}
          <div className="mt-4 flex justify-center gap-4 text-sm flex-wrap">
            <div className="px-3 py-1 bg-white/10 backdrop-blur-sm rounded-lg border border-red-500/30 flex items-center gap-2">
              <Flame className="h-3 w-3 text-red-400" />
              <span className="text-gray-300">Spirit = Creative Force</span>
            </div>
            <div className="px-3 py-1 bg-white/10 backdrop-blur-sm rounded-lg border border-blue-500/30 flex items-center gap-2">
              <Droplets className="h-3 w-3 text-blue-400" />
              <span className="text-gray-300">Essence = Life Energy</span>
            </div>
            <div className="px-3 py-1 bg-white/10 backdrop-blur-sm rounded-lg border border-green-500/30 flex items-center gap-2">
              <Mountain className="h-3 w-3 text-green-400" />
              <span className="text-gray-300">Matter = Physical Form</span>
            </div>
            <div className="px-3 py-1 bg-white/10 backdrop-blur-sm rounded-lg border border-purple-500/30 flex items-center gap-2">
              <Wind className="h-3 w-3 text-purple-400" />
              <span className="text-gray-300">Substance = Etheric Field</span>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="space-y-6">
          {/* Current Quantities Display */}
          <div className="p-6 bg-gradient-to-br from-orange-900/20 to-red-900/20 rounded-lg border border-orange-500/30 backdrop-blur-sm">
            <h2 className="text-2xl font-bold text-orange-300 mb-4">Current Alchm Quantities</h2>
            <p className="text-sm text-gray-400 mb-6">
              Real-time values calculated from current planetary positions
            </p>
            <Suspense fallback={<LoadingSpinner />}>
              <AlchmQuantitiesDisplay />
            </Suspense>
          </div>

          {/* Planetary Contributions - Full Width */}
          <div className="p-6 bg-gradient-to-br from-indigo-900/20 to-purple-900/20 rounded-lg border border-indigo-500/30 backdrop-blur-sm">
            <h2 className="text-2xl font-bold text-indigo-300 mb-4">🪐 Planetary Contributions</h2>
            <p className="text-sm text-gray-400 mb-6">
              Current planetary positions and their ESMS contributions with next sign transitions
            </p>
            <Suspense fallback={<LoadingSpinner />}>
              <PlanetaryContributionsChart />
            </Suspense>
          </div>

          {/* Three Column Layout: Trends, Kinetics, Formulas */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Trends */}
            <div className="p-6 bg-gradient-to-br from-purple-900/20 to-indigo-900/20 rounded-lg border border-purple-500/30 backdrop-blur-sm">
              <h2 className="text-xl font-bold text-purple-300 mb-4">Trends & Forecasts</h2>
              <p className="text-sm text-gray-400 mb-6">Quantity changes over time</p>
              <Suspense fallback={<LoadingSpinner />}>
                <AlchmQuantitiesTrends />
              </Suspense>
            </div>

            {/* Kinetics Section */}
            <div className="p-6 bg-gradient-to-br from-cyan-900/20 to-blue-900/20 rounded-lg border border-cyan-500/30 backdrop-blur-sm">
              <h2 className="text-xl font-bold text-cyan-300 mb-4 flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Kinetic Analysis
              </h2>
              <p className="text-sm text-gray-400 mb-6">Motion and velocity of quantities</p>
              <Suspense fallback={<LoadingSpinner />}>
                <AlchmKinetics />
              </Suspense>
            </div>

            {/* Formulas */}
            <div className="p-6 bg-gradient-to-br from-indigo-900/20 to-purple-900/20 rounded-lg border border-indigo-500/30 backdrop-blur-sm">
              <h2 className="text-xl font-bold text-indigo-300 mb-4">
                Alchemical Mathematics
              </h2>
              <p className="text-sm text-gray-400 mb-6">Core formulas</p>

              <div className="space-y-4">
                {/* A-Number Formula */}
                <div className="p-4 bg-gradient-to-r from-indigo-900/30 to-purple-900/30 rounded-lg border border-indigo-500/20">
                  <h4 className="font-semibold mb-2 flex items-center gap-2 text-gray-200">
                    <span className="text-xl">🎯</span> A-Number
                  </h4>
                  <p className="text-sm font-mono mb-2 text-indigo-300">
                    A# = Spirit + Essence + Matter + Substance
                  </p>
                  <p className="text-xs text-gray-400">
                    Total alchemical energy available from planetary positions.
                  </p>
                </div>

                {/* Thermodynamics */}
                <div className="p-4 bg-gradient-to-r from-green-900/30 to-emerald-900/30 rounded-lg border border-green-500/20">
                  <h4 className="font-semibold mb-2 flex items-center gap-2 text-gray-200">
                    <span className="text-xl">⚡</span> Thermodynamics
                  </h4>
                  <div className="space-y-1 text-xs font-mono text-green-300">
                    <p>Heat = (Spirit² + Fire²) / (All Elements)²</p>
                    <p>Entropy = (Spirit² + Substance² + Fire² + Air²) / (Earth + Water)²</p>
                    <p>Reactivity = (All except Earth)² / (Matter + Earth)²</p>
                    <p className="mt-2 font-bold">Energy = Heat - (Entropy × Reactivity)</p>
                  </div>
                </div>

                {/* Kinetics Formulas */}
                <div className="p-4 bg-gradient-to-r from-blue-900/30 to-cyan-900/30 rounded-lg border border-blue-500/20">
                  <h4 className="font-semibold mb-2 flex items-center gap-2 text-gray-200">
                    <span className="text-xl">🏃</span> Kinetics
                  </h4>
                  <div className="space-y-1 text-xs font-mono text-blue-300">
                    <p>Velocity = ΔQuantity / ΔTime</p>
                    <p>Acceleration = ΔVelocity / ΔTime</p>
                    <p>Momentum = Quantity × Velocity</p>
                    <p className="mt-2 font-bold">Kinetic Energy = ½ × Mass × Velocity²</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Loading component
function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center h-40">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-400"></div>
    </div>
  );
}
