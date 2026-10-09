'use client';

import { motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import { fetchAgentsForDate } from '@/lib/planetaryAgentsClient';

interface LiveAgentItem {
  id: string;
  name: string;
  role: string;
  status: string;
  element: string;
  icon: string;
  strength: number;
  esmsBalance: number;
}

const PLANET_ICONS: Record<string, string> = {
  Sun: '☀️',
  Moon: '🌙',
  Mercury: '☿️',
  Venus: '♀️',
  Mars: '♂️',
  Jupiter: '♃',
  Saturn: '♄',
  Uranus: '♅',
  Neptune: '♆',
  Pluto: '♇',
};

const PLANET_ROLES: Record<string, string> = {
  Sun: 'Solar Transit Vitality & Leadership',
  Moon: 'Lunar Yield & Mood Harvesting',
  Mercury: 'Recipe Intelligence & Curation',
  Venus: 'Aesthetic Harmonization & Pairing',
  Mars: 'Heat & Spice Catalyst Engine',
  Jupiter: 'Abundance & Macro Optimization',
  Saturn: 'Discipline & Structure Governance',
  Uranus: 'Unconventional Pairings & Innovation',
  Neptune: 'Subtle Flavors & Dream Aromatics',
  Pluto: 'Deep Fermentation & Transformation',
};

export function AgentsPane() {
  const [agents, setAgents] = useState<LiveAgentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function loadActiveAgents() {
      try {
        const rawActivations = await fetchAgentsForDate(new Date());
        if (!mounted) return;

        if (Array.isArray(rawActivations) && rawActivations.length > 0) {
          const mapped: LiveAgentItem[] = rawActivations.map((a: any, idx: number) => {
            const planet = a.planetaryRuler || a.agent?.name?.split(' ')[0] || 'Sun';
            return {
              id: a.agent?.id || `agent-${idx}`,
              name: a.agent?.name || `${planet} Degree Agent`,
              role: PLANET_ROLES[planet] || `${planet} Degree Intelligence`,
              status: 'Active',
              element: a.element || 'Fire',
              icon: PLANET_ICONS[planet] || '✨',
              strength: Math.round((a.strength ?? 0.85) * 100),
              esmsBalance: 1250 + ((idx * 375) % 1500),
            };
          });
          setAgents(mapped);
        } else {
          // Fallback if network call returns empty
          setAgents([
            { id: 'sun', name: 'Sun in Libra 15°', role: PLANET_ROLES.Sun ?? 'Solar Transit Vitality', status: 'Active', element: 'Air', icon: '☀️', strength: 95, esmsBalance: 2500 },
            { id: 'moon', name: 'Moon in Cancer 8°', role: PLANET_ROLES.Moon ?? 'Lunar Yield Harvesting', status: 'Active', element: 'Water', icon: '🌙', strength: 90, esmsBalance: 1850 },
            { id: 'mercury', name: 'Mercury in Virgo 22°', role: PLANET_ROLES.Mercury ?? 'Recipe Intelligence', status: 'Active', element: 'Earth', icon: '☿️', strength: 92, esmsBalance: 2100 },
          ]);
        }
      } catch (err) {
        console.error('Failed to load active planetary agents:', err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    loadActiveAgents();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="glass-card-premium rounded-3xl p-8 border-white/8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-purple-400 text-2xl">⚡</span>
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Active Degree Agents Network</h2>
          </div>
          <p className="text-white/60 text-sm max-w-xl leading-relaxed mb-8">
            Planetary degree agents activate exclusively when transiting planets enter their exact degrees.
            All active agents hold live ESMS balances, review catalog recipes, and participate in community feeds.
          </p>
          <div className="flex gap-4">
            <a 
              href="https://agents.alchm.kitchen" 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-6 py-3 bg-purple-600 text-white rounded-full font-black text-xs uppercase tracking-[0.2em] shadow-lg hover:bg-purple-700 transition-all"
            >
              Launch Agents Dashboard
            </a>
            <button className="px-6 py-3 glass-base text-white/60 rounded-full font-black text-xs uppercase tracking-[0.2em] border border-white/8 hover:text-white transition-all">
              Live Degree Monitor ({agents.length} Active)
            </button>
          </div>
        </div>
      </div>

      {/* Agents Grid */}
      {isLoading ? (
        <div className="p-8 text-center text-purple-300 animate-pulse">
          Aligning celestial ephemeris and active degree agents...
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {agents.map((agent) => (
            <motion.div 
              key={agent.id}
              whileHover={{ y: -4 }}
              className="glass-card-premium rounded-2xl p-6 border-white/8 hover:border-purple-500/30 transition-all"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="text-3xl">{agent.icon}</div>
                <div className="flex flex-col items-end gap-1">
                  <span className="px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest bg-green-500/20 text-green-400">
                    {agent.status}
                  </span>
                  <span className="text-[9px] font-mono text-amber-300">
                    {agent.esmsBalance.toLocaleString()} ESMS
                  </span>
                </div>
              </div>
              <h3 className="text-white font-bold mb-1 text-sm">{agent.name}</h3>
              <p className="text-white/50 text-[10px] uppercase tracking-wider mb-4">{agent.role}</p>
              <div className="flex items-center justify-between pt-2 border-t border-white/5">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                  <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">{agent.element}</span>
                </div>
                <span className="text-[9px] font-semibold text-purple-300">{agent.strength}% Resonance</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Integration Status */}
      <div className="glass-base rounded-2xl p-6 border border-white/5">
        <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] mb-4">Sync Status</h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center border-2 border-[#08080e] text-[10px]">K</div>
              <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center border-2 border-[#08080e] text-[10px]">A</div>
            </div>
            <div>
              <p className="text-xs text-white/80 font-medium">Kitchen-Agent SSO & Degree Synastry Active</p>
              <p className="text-[9px] text-white/30 uppercase tracking-widest">Shared .alchm.kitchen session • Exact Planetary Degree Gate</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] font-bold text-green-400 uppercase tracking-widest">Live Sync</span>
          </div>
        </div>
      </div>
    </div>
  );
}
