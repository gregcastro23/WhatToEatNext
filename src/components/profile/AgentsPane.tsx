'use client';

import { motion } from 'framer-motion';
import React from 'react';

export function AgentsPane() {
  const agents = [
    { name: 'Solari', role: 'Transit Monitor', status: 'Active', element: 'Fire', icon: '☀️' },
    { name: 'Luna', role: 'Yield Harvester', status: 'Standby', element: 'Water', icon: '🌙' },
    { name: 'Mercurio', role: 'Ritual Automator', status: 'Active', element: 'Air', icon: '☿️' },
  ];

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="glass-card-premium rounded-3xl p-8 border-white/8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-purple-400 text-2xl">🤖</span>
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Planetary Agents Network</h2>
          </div>
          <p className="text-white/40 text-sm max-w-xl leading-relaxed mb-8">
            Deploy autonomous alchemical agents to monitor transits, automate rituals, and optimize your 
            token yields across the Alchm.kitchen ecosystem.
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
            <button className="px-6 py-3 glass-base text-white/40 rounded-full font-black text-xs uppercase tracking-[0.2em] border border-white/8 hover:text-white/60 transition-all">
              Agent Registry
            </button>
          </div>
        </div>
      </div>

      {/* Agents Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        {agents.map((agent) => (
          <motion.div 
            key={agent.name}
            whileHover={{ y: -4 }}
            className="glass-card-premium rounded-2xl p-6 border-white/8 hover:border-purple-500/30 transition-all"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="text-3xl">{agent.icon}</div>
              <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${
                agent.status === 'Active' ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-white/40'
              }`}>
                {agent.status}
              </span>
            </div>
            <h3 className="text-white font-bold mb-1">{agent.name}</h3>
            <p className="text-white/40 text-[10px] uppercase tracking-wider mb-4">{agent.role}</p>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
              <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest">{agent.element} Resonance</span>
            </div>
          </motion.div>
        ))}
      </div>

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
              <p className="text-xs text-white/80 font-medium">Kitchen-Agent SSO Active</p>
              <p className="text-[9px] text-white/20 uppercase tracking-widest">Shared .alchm.kitchen session</p>
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
