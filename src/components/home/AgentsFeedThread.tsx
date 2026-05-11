"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

type FeedItem = {
  id: string;
  user: string;
  isAgent: boolean;
  action: string;
  time: string;
  icon: string;
};

export function AgentsFeedThread() {
  const [isVisible, setIsVisible] = useState(true);
  const [feedItems, setFeedItems] = useState<FeedItem[]>([
    { id: '1', user: 'Solari', isAgent: true, action: 'Monitored Sun entering Leo', time: '2m ago', icon: '☀️' },
    { id: '2', user: 'Mercurio', isAgent: true, action: 'Automated morning ritual', time: '15m ago', icon: '☿️' },
    { id: '3', user: 'Venus', isAgent: true, action: 'Balanced elemental harmony', time: '42m ago', icon: '♀️' },
    { id: '4', user: 'Luna', isAgent: true, action: 'Yield Harvested: 50 🝙', time: '1h ago', icon: '🌙' },
    { id: '5', user: 'Mars', isAgent: true, action: 'Initiated transmutative fire phase', time: '2h ago', icon: '♂️' },
  ]);

  return (
    <>
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-6 right-6 w-80 sm:w-96 z-50 glass-card-premium rounded-2xl border border-purple-500/30 shadow-2xl shadow-purple-900/30 overflow-hidden bg-[#08080e]/90 backdrop-blur-xl"
          >
            <div className="flex justify-between items-center px-4 py-3 border-b border-white/10 bg-white/5">
              <div className="flex items-center gap-2">
                <span className="text-purple-400">⚡</span>
                <h3 className="text-sm font-bold text-white tracking-wide">Live Network Feed</h3>
              </div>
              <button
                onClick={() => setIsVisible(false)}
                className="text-white/50 hover:text-white/90 transition-colors focus:outline-none w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/10"
                aria-label="Hide feed"
              >
                ✕
              </button>
            </div>
            <div className="p-4 space-y-4 max-h-64 overflow-y-auto custom-scrollbar">
              {feedItems.map((item) => (
                <div key={item.id} className="flex gap-3 items-start group">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border text-sm shadow-inner transition-colors ${
                    item.isAgent 
                      ? 'bg-purple-900/50 border-purple-500/20 shadow-purple-500/10' 
                      : 'bg-emerald-900/40 border-emerald-500/20 shadow-emerald-500/10'
                  }`}>
                    {item.icon}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-white/90 font-medium leading-relaxed">
                      <span className={`${item.isAgent ? 'text-purple-300' : 'text-emerald-300'} font-bold`}>
                        {item.user}
                      </span>{' '}
                      {item.isAgent && <span className="inline-block px-1 py-0.5 ml-1 mr-1 rounded text-[8px] uppercase tracking-wider bg-purple-500/20 text-purple-200">Agent</span>}
                      {item.action}
                    </p>
                    <p className="text-[10px] text-white/40 mt-1">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-4 py-3 border-t border-white/10 bg-white/5 flex items-center justify-between">
              <span className="text-[10px] font-bold text-green-400 uppercase tracking-widest flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                Network Active
              </span>
              <Link href="/profile#agents" className="text-[10px] text-purple-300 hover:text-purple-200 uppercase tracking-wider underline">
                View Network
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsVisible(true)}
          className="fixed bottom-6 right-6 w-12 h-12 rounded-full bg-purple-600 hover:bg-purple-500 shadow-lg shadow-purple-900/50 flex items-center justify-center z-50 border border-purple-400/50 text-xl"
          aria-label="Show Network Feed"
        >
          ⚡
        </motion.button>
      )}
    </>
  );
}
