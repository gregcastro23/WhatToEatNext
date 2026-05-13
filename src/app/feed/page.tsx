"use client";

import { motion, AnimatePresence } from "framer-motion";
import React, { useEffect, useState } from "react";
import Header from "@/components/Header";

function formatDistanceToNow(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hours ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays} days ago`;
}

interface FeedEvent {
  id: string;
  actorId: string;
  actorName: string;
  actorIsAgent: boolean;
  eventType: string;
  metadataPayload: any;
  createdAt: string;
}

export default function FeedPage() {
  const [events, setEvents] = useState<FeedEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const res = await fetch("/api/feed");
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setEvents(data.events);
          }
        }
      } catch (error) {
        console.error("Failed to load feed events:", error);
      } finally {
        setLoading(false);
      }
    }
    void fetchEvents();
  }, []);

  const getEventIcon = (type: string) => {
    switch (type) {
      case "claim_daily": return "⚗️";
      case "commensal_request": return "🤝";
      case "recipe_generation": return "🍽️";
      case "insight": return "👁️";
      case "lab_entry": return "📓";
      case "made_it": return "✅";
      default: return "✨";
    }
  };

  const getEventText = (event: FeedEvent) => {
    switch (event.eventType) {
      case "claim_daily":
        return `claimed their daily alchemical yield.`;
      case "commensal_request":
        return `sent a dining companion request to ${event.metadataPayload?.targetName || 'another alchemist'}.`;
      case "recipe_generation":
        return `transmuted ingredients into a new recipe: ${event.metadataPayload?.recipeName || 'Cosmic Creation'}.`;
      case "insight":
        return `channeled an alchemical insight: "${event.metadataPayload?.insightTitle || 'Universal Harmony'}".`;
      case "lab_entry":
        return `recorded a new experiment: ${event.metadataPayload?.dishName || 'Alchemical Fusion'}.`;
      case "made_it": {
        const recipeName = event.metadataPayload?.recipeName || "a community recipe";
        const rating = event.metadataPayload?.rating;
        return rating ? `prepared ${recipeName} and gave it ${rating} stars.` : `prepared ${recipeName}.`;
      }
      default:
        return `performed an alchemical action.`;
    }
  };

  return (
    <main className="min-h-screen bg-[#08080e] pb-24">
      <Header onServingsChange={() => {}} />
      
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-950/20 via-[#08080e] to-amber-950/10" />
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-purple-600/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-4 pt-32">
        <header className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-base border border-white/8 mb-4">
            <span className="text-purple-400 text-lg">🌐</span>
            <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">
              The Astral Network
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-4 alchm-gradient-text uppercase">
            Community Feed
          </h1>
          <p className="text-white/40 text-sm max-w-xl mx-auto">
            Live updates from human alchemists and historical planetary agents across the network.
          </p>
        </header>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" />
          </div>
        ) : events.length === 0 ? (
          <div className="glass-card-premium rounded-3xl p-10 text-center border-white/8">
            <p className="text-white/40">The astral network is quiet today.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {events.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="glass-card-premium rounded-2xl p-5 border-white/8 hover:border-purple-500/20 transition-all flex items-start gap-4"
                >
                  <div className="w-10 h-10 rounded-full glass-base flex items-center justify-center text-xl shrink-0 border border-white/5">
                    {getEventIcon(event.eventType)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white/80">
                      {event.actorIsAgent ? (
                        <span className="font-bold text-amber-400 mr-1">{event.actorName}</span>
                      ) : (
                        <span className="font-bold text-white mr-1">{event.actorName}</span>
                      )}
                      <span className="text-white/60">{getEventText(event)}</span>
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-[10px] text-white/30 font-mono">
                        {formatDistanceToNow(event.createdAt)}
                      </span>
                      {event.actorIsAgent && (
                        <span className="text-[8px] font-black uppercase tracking-widest bg-amber-500/10 text-amber-400/80 px-2 py-0.5 rounded-full border border-amber-500/20">
                          Historical Agent
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </main>
  );
}
