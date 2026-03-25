"use client";

import { FaFire, FaTint, FaWind, FaMountain, FaBolt } from "react-icons/fa";
import { Suspense } from "react";
import dynamic from "next/dynamic";
import AlchmKinetics from "@/components/alchm-kinetics";
import AlchmQuantitiesDisplay from "@/components/alchm-quantities-display";
import PlanetaryAspectsDisplay from "@/components/PlanetaryAspectsDisplay";
import PlanetaryContributionsChart from "@/components/PlanetaryContributionsChart";

const AlchmQuantitiesTrends = dynamic(() => import("@/components/alchm-quantities-trends"), {
  ssr: false,
});

export default function QuantitiesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <div className="container mx-auto py-8 px-4">

        {/* ── Hero header ── */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 flex items-center justify-center gap-3 text-transparent bg-clip-text bg-gradient-to-r from-orange-300 to-purple-300">
            <span>⚗️</span>
            Alchm Quantities
            <span>🔮</span>
          </h1>
          <p className="max-w-3xl mx-auto text-lg text-gray-300">
            Real-time alchemical calculations based on current planetary
            positions. Spirit, Essence, Matter, and Substance quantities with
            kinetic and aspect analysis.
          </p>

          {/* ESMS badges */}
          <div className="mt-4 flex justify-center gap-4 text-sm flex-wrap">
            <div className="px-3 py-1 bg-white/10 backdrop-blur-sm rounded-lg border border-red-500/30 flex items-center gap-2">
              <FaFire className="h-3 w-3 text-red-400" />
              <span className="text-gray-300">Spirit = Creative Force</span>
            </div>
            <div className="px-3 py-1 bg-white/10 backdrop-blur-sm rounded-lg border border-blue-500/30 flex items-center gap-2">
              <FaTint className="h-3 w-3 text-blue-400" />
              <span className="text-gray-300">Essence = Life Energy</span>
            </div>
            <div className="px-3 py-1 bg-white/10 backdrop-blur-sm rounded-lg border border-green-500/30 flex items-center gap-2">
              <FaMountain className="h-3 w-3 text-green-400" />
              <span className="text-gray-300">Matter = Physical Form</span>
            </div>
            <div className="px-3 py-1 bg-white/10 backdrop-blur-sm rounded-lg border border-purple-500/30 flex items-center gap-2">
              <FaWind className="h-3 w-3 text-purple-400" />
              <span className="text-gray-300">Substance = Etheric Field</span>
            </div>
          </div>
        </div>

        {/* ── Main content ── */}
        <div className="space-y-6">

          {/* 1. Current Quantities — full width */}
          <div className="p-6 bg-gradient-to-br from-orange-900/20 to-red-900/20 rounded-lg border border-orange-500/30 backdrop-blur-sm">
            <h2 className="text-2xl font-bold text-orange-300 mb-1">
              Current Alchm Quantities
            </h2>
            <p className="text-sm text-gray-400 mb-6">
              Real-time values from live planetary positions (updated every 30 s)
            </p>
            <Suspense fallback={<Spinner />}>
              <AlchmQuantitiesDisplay />
            </Suspense>
          </div>

          {/* 2. Planetary Contributions — full width */}
          <div className="p-6 bg-gradient-to-br from-indigo-900/20 to-purple-900/20 rounded-lg border border-indigo-500/30 backdrop-blur-sm">
            <h2 className="text-2xl font-bold text-indigo-300 mb-1">
              🪐 Planetary Contributions
            </h2>
            <p className="text-sm text-gray-400 mb-6">
              Live sign positions, diurnal/nocturnal sect elements, and ESMS contributions per planet
            </p>
            <Suspense fallback={<Spinner />}>
              <PlanetaryContributionsChart />
            </Suspense>
          </div>

          {/* 3. Aspects + Kinetics — two column */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Active Aspects */}
            <div className="p-6 bg-gradient-to-br from-violet-900/20 to-indigo-900/20 rounded-lg border border-violet-500/30 backdrop-blur-sm">
              <h2 className="text-xl font-bold text-violet-300 mb-1">
                ☌ Active Aspects
              </h2>
              <p className="text-sm text-gray-400 mb-6">
                Major inter-planetary aspects with applying / separating status and
                countdown to exact
              </p>
              <Suspense fallback={<Spinner />}>
                <PlanetaryAspectsDisplay />
              </Suspense>
            </div>

            {/* Kinetic Analysis */}
            <div className="p-6 bg-gradient-to-br from-cyan-900/20 to-blue-900/20 rounded-lg border border-cyan-500/30 backdrop-blur-sm">
              <h2 className="text-xl font-bold text-cyan-300 mb-1 flex items-center gap-2">
                <FaBolt className="h-5 w-5" />
                Kinetic Analysis
              </h2>
              <p className="text-sm text-gray-400 mb-6">
                ESMS velocity, acceleration, momentum, and P = IV circuit metrics
              </p>
              <Suspense fallback={<Spinner />}>
                <AlchmKinetics />
              </Suspense>
            </div>
          </div>

          {/* 4. Trends + Formulas — two column */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* 7-Day Trends */}
            <div className="p-6 bg-gradient-to-br from-purple-900/20 to-indigo-900/20 rounded-lg border border-purple-500/30 backdrop-blur-sm">
              <h2 className="text-xl font-bold text-purple-300 mb-1">
                Trends &amp; Forecasts
              </h2>
              <p className="text-sm text-gray-400 mb-6">
                7-day ESMS quantity history (sampled every 4 h, updated every 5 min)
              </p>
              <Suspense fallback={<Spinner />}>
                <AlchmQuantitiesTrends />
              </Suspense>
            </div>

            {/* Alchemical Mathematics */}
            <div className="p-6 bg-gradient-to-br from-indigo-900/20 to-purple-900/20 rounded-lg border border-indigo-500/30 backdrop-blur-sm">
              <h2 className="text-xl font-bold text-indigo-300 mb-1">
                Alchemical Mathematics
              </h2>
              <p className="text-sm text-gray-400 mb-6">Core formulas used in every calculation</p>

              <div className="space-y-4">

                {/* A-Number */}
                <div className="p-4 bg-gradient-to-r from-indigo-900/30 to-purple-900/30 rounded-lg border border-indigo-500/20">
                  <h4 className="font-semibold mb-2 flex items-center gap-2 text-gray-200">
                    <span className="text-xl">🎯</span> A-Number
                  </h4>
                  <p className="text-sm font-mono text-indigo-300">
                    A# = Spirit + Essence + Matter + Substance
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Total alchemical energy from current planetary positions.
                  </p>
                </div>

                {/* Thermodynamics */}
                <div className="p-4 bg-gradient-to-r from-green-900/30 to-emerald-900/30 rounded-lg border border-green-500/20">
                  <h4 className="font-semibold mb-2 flex items-center gap-2 text-gray-200">
                    <span className="text-xl">⚡</span> Thermodynamics
                  </h4>
                  <div className="space-y-1 text-xs font-mono text-green-300">
                    <p>Heat = (S² + F²) / (E+M+Sub+W+A+Ea)²</p>
                    <p>Entropy = (S² + Sub² + F² + A²) / (Ea+W)²</p>
                    <p>Reactivity = (S²+Sub²+E²+F²+A²+W²) / (M+Ea)²</p>
                    <p className="font-bold text-green-200 mt-1">
                      GregsEnergy = Heat − Entropy × Reactivity
                    </p>
                    <p className="text-green-400 mt-1">
                      K<sub>alchm</sub> = (S^S · E^E) / (M^M · Sub^Sub)
                    </p>
                    <p>Monica = −G / (R · ln K) when K &gt; 0</p>
                  </div>
                </div>

                {/* P = IV Circuit */}
                <div className="p-4 bg-gradient-to-r from-blue-900/30 to-cyan-900/30 rounded-lg border border-blue-500/20">
                  <h4 className="font-semibold mb-2 flex items-center gap-2 text-gray-200">
                    <span className="text-xl">⚙️</span> P = IV Circuit
                  </h4>
                  <div className="space-y-1 text-xs font-mono text-blue-300">
                    <p>Q (charge) = Matter + Substance</p>
                    <p>V (potential) = GregsEnergy / Q</p>
                    <p>I (current) = Reactivity × Q × 0.1</p>
                    <p className="font-bold text-blue-200 mt-1">P (power) = I × V</p>
                    <p>Inertia = max(1, M + Earth + Sub/2)</p>
                  </div>
                </div>

                {/* Sect */}
                <div className="p-4 bg-gradient-to-r from-amber-900/30 to-yellow-900/30 rounded-lg border border-amber-500/20">
                  <h4 className="font-semibold mb-2 flex items-center gap-2 text-gray-200">
                    <span className="text-xl">☀️</span> Diurnal / Nocturnal Sect
                  </h4>
                  <div className="space-y-1 text-xs text-amber-300">
                    <p>Day 06:00–18:00 UTC → Saturn=Air, Mars=Fire, Jupiter=Fire …</p>
                    <p>Night 18:00–06:00 UTC → Saturn=Earth, Mars=Water, Jupiter=Air …</p>
                    <p className="text-amber-200 mt-1">
                      Elemental mix = 60% sign element + 40% sect element
                    </p>
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

function Spinner() {
  return (
    <div className="flex justify-center items-center h-40">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-400" />
    </div>
  );
}
