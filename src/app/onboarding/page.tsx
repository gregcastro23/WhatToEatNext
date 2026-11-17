"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import React, { Suspense, useState, useEffect } from "react";
import { LocationSearch } from "@/components/onboarding/LocationSearch";
import { RecipeCard } from "@/components/RecipeCard";
import { _logger } from "@/lib/logger";
import type { BirthData, NatalChart } from "@/types/natalChart";
import { wallClockInputToIso } from "@/utils/astrology/ianaZone";

interface LocationData {
  displayName: string;
  latitude: number;
  longitude: number;
  timezone?: string;
}

interface AlchemicalConstitution {
  userId: string;
  spiritBalance: number;
  essenceBalance: number;
  matterBalance: number;
  substanceBalance: number;
  baseArchetype: string;
  lastTransitSync: string;
}

interface OnboardingResponse {
  success: boolean;
  alchemical_constitution: AlchemicalConstitution;
  cosmicRecipe: any;
  birthData?: BirthData;
  natalChart?: NatalChart;
  error?: string;
  message?: string;
}

function formatBirthPlacement(sign: string | undefined, position: number | undefined): string {
  if (!sign) return "—";
  const label = sign.charAt(0).toUpperCase() + sign.slice(1);
  if (typeof position === "number" && Number.isFinite(position) && position > 0) {
    return `${label} ${Math.floor(position % 30)}°`;
  }
  return label;
}

function formatWallClockDisplay(dateTime: string | undefined): string | null {
  if (!dateTime) return null;
  const parsed = new Date(dateTime);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toLocaleString("en-US", {
    timeZone: "UTC",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function sanitizeReturn(raw: string | null | undefined): string | null {
  if (!raw) return null;
  if (!raw.startsWith("/") || raw.startsWith("//")) return null;
  if (raw.startsWith("/\\")) return null;
  return raw;
}

function OnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = sanitizeReturn(searchParams?.get("return"));
  const { data: session, status, update: updateSession } = useSession();

  const [mounted, setMounted] = useState(false);
  const [viewState, setViewState] = useState<"input" | "projecting" | "transmuted">("input");
  
  // Input fields
  const [birthDateTime, setBirthDateTime] = useState("");
  const [birthLocation, setBirthLocation] = useState<LocationData | null>(null);
  
  // Loading status text steps
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Result payloads from Agent Forge
  const [constitution, setConstitution] = useState<AlchemicalConstitution | null>(null);
  const [cosmicRecipe, setCosmicRecipe] = useState<any | null>(null);
  const [savedBirthData, setSavedBirthData] = useState<BirthData | null>(null);
  const [computedChart, setComputedChart] = useState<NatalChart | null>(null);
  const [isFinishing, setIsFinishing] = useState(false);

  const loadingTexts = [
    "Geolocating coordinates under the celestial vault...",
    "Retrieving Swiss Ephemeris natal planetary transits...",
    "Aligning active planetary degrees with zodiac houses...",
    "Extracting elemental distribution ratio (Fire/Water/Earth/Air)...",
    "Translating elemental bounds to ESMS token balances...",
    "Igniting Agent Forge furnace and base archetype...",
    "Brewing your first complimentary cosmic recipe..."
  ];

  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirect unauthenticated users
  useEffect(() => {
    if (mounted && status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router, mounted]);

  // If already onboarded, skip to returnTo or /profile
  useEffect(() => {
    if (status !== "authenticated" || !session?.user) return;
    const { user } = session;
    // Bypass if they already have onboardingComplete
    if (user.onboardingComplete === true && viewState === "input") {
      router.replace(returnTo ?? "/profile");
    }
  }, [status, session, router, returnTo, viewState]);

  // Rotate loading text step
  useEffect(() => {
    if (viewState !== "projecting") return;
    const interval = setInterval(() => {
      setLoadingStep((prev) => (prev < loadingTexts.length - 1 ? prev + 1 : prev));
    }, 1500);
    return () => clearInterval(interval);
  }, [viewState, loadingTexts.length]);

  if (!mounted || status === "loading") {
    return (
      <div className="min-h-screen bg-[#08080e] flex items-center justify-center">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-purple-500/20 rounded-full" />
          <div className="absolute inset-0 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!session?.user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!birthLocation) {
      setError("Please select your birth location under the heavens.");
      return;
    }
    if (!birthDateTime) {
      setError("Please specify your date and time of birth.");
      return;
    }

    const normalizedDob = wallClockInputToIso(birthDateTime);
    if (!normalizedDob) {
      setError("Please enter a valid date and time of birth.");
      return;
    }

    setViewState("projecting");
    setLoadingStep(0);

    try {
      const response = await fetch("/api/agent-forge/ignite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dob: normalizedDob,
          city: birthLocation.displayName,
          latitude: birthLocation.latitude,
          longitude: birthLocation.longitude,
          ...(birthLocation.timezone ? { timezone: birthLocation.timezone } : {}),
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        let errorMessage = `Ignition failed with status ${response.status}`;
        if (text) {
          try {
            const errJson: unknown = JSON.parse(text);
            if (
              typeof errJson === "object" &&
              errJson !== null &&
              "message" in errJson &&
              typeof errJson.message === "string" &&
              errJson.message
            ) {
              errorMessage = errJson.message;
            } else {
              errorMessage = text;
            }
          } catch {
            errorMessage = text;
          }
        }
        throw new Error(errorMessage);
      }

      const data: OnboardingResponse = await response.json();
      if (!data.success) {
        throw new Error(data.message || "Celestial ignition failed.");
      }

      const resolvedBirthData: BirthData = data.birthData ?? {
        dateTime: normalizedDob,
        latitude: birthLocation.latitude,
        longitude: birthLocation.longitude,
        ...(birthLocation.timezone ? { timezone: birthLocation.timezone } : {}),
      };

      // Store in LocalStorage
      localStorage.setItem(
        "userProfile",
        JSON.stringify({
          userId: data.alchemical_constitution.userId,
          email: session?.user?.email ?? "",
          name: session?.user?.name ?? "",
          birthData: resolvedBirthData,
          ...(data.natalChart ? { natalChart: data.natalChart } : {}),
          alchemicalConstitution: data.alchemical_constitution
        })
      );

      // Save references in component state
      setConstitution(data.alchemical_constitution);
      setCosmicRecipe(data.cosmicRecipe);
      setSavedBirthData(resolvedBirthData);
      setComputedChart(data.natalChart ?? null);

      // Transition to final reveal step
      setViewState("transmuted");
    } catch (err: unknown) {
      _logger.error("Agent Forge Onboarding Error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "An unexpected eclipse interrupted your onboarding. Please try again.",
      );
      setViewState("input");
    }
  };

  const handleFinish = async () => {
    setIsFinishing(true);
    try {
      // Set short-lived cookie for middleware
      document.cookie = "onboarding_completed=1; path=/; max-age=2592000; SameSite=Lax";
      
      // Update NextAuth session
      await updateSession();

      // Redirect user to dashboard or return destination
      window.location.href = returnTo ?? "/profile";
    } catch (err) {
      _logger.error("Session update failed:", err);
      window.location.href = returnTo ?? "/profile";
    }
  };

  // Astrological constants for SVG Rendering
  const zodiacs = ["♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓"];

  return (
    <div className="min-h-screen bg-[#08080e] text-white relative overflow-hidden flex flex-col items-center justify-center p-4">
      {/* Background Starscape */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-950/20 via-[#08080e] to-amber-950/10" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/5 rounded-full blur-[120px] animate-pulse duration-[8s]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-[120px] animate-pulse duration-[10s]" />
        
        {/* Twinkling star particle mock */}
        <div className="stars-layer absolute inset-0 opacity-40">
          <div className="absolute top-10 left-12 w-1 h-1 bg-white rounded-full animate-ping duration-[3s]" />
          <div className="absolute top-48 right-32 w-1.5 h-1.5 bg-yellow-100 rounded-full animate-ping duration-[5s]" />
          <div className="absolute bottom-32 left-24 w-1 h-1 bg-purple-200 rounded-full animate-ping duration-[4s]" />
          <div className="absolute top-2/3 right-12 w-1 h-1 bg-white rounded-full animate-ping duration-[6s]" />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* ==================== STATE 1: BIRTH DATA INPUT ==================== */}
        {viewState === "input" && (
          <motion.div
            key="input-screen"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-xl z-10 py-6"
          >
            {/* Header Badge */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/[0.02] backdrop-blur-md mb-4 shadow-inner">
                <span className="text-amber-400 text-sm">⚗️</span>
                <span className="text-[10px] font-black text-white/50 uppercase tracking-[0.35em] font-mono">
                  Alchm.kitchen
                </span>
              </div>
              <h1 className="text-4xl font-extrabold text-white tracking-tighter mb-2 font-display bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-purple-200">
                Ignite Your Agent Forge
              </h1>
              <p className="text-white/40 text-xs leading-relaxed max-w-sm mx-auto">
                Align your birth celestial transits to configure your alchemical token yields (ESMS) and claim your first Cosmic Recipe.
              </p>
            </div>

            {/* Input Card Container */}
            <div className="border border-white/10 bg-[#0c0c16]/60 backdrop-blur-xl rounded-[2rem] p-8 shadow-[0_8px_32px_rgba(0,0,0,0.37)]">
              <form onSubmit={(e) => { void handleSubmit(e); }} className="space-y-6">
                
                {/* Session Identification Banner */}
                <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/10 flex items-center justify-between">
                  <div>
                    <div className="text-[9px] font-bold text-purple-400 uppercase tracking-wider font-mono">Initiate Account</div>
                    <div className="text-xs text-white/80 font-medium">{session.user.name}</div>
                  </div>
                  <div className="text-[10px] text-white/40 font-mono bg-white/[0.04] px-2.5 py-1 rounded-lg border border-white/5">
                    {session.user.email}
                  </div>
                </div>

                {/* Birth Date & Time */}
                <div className="space-y-2">
                  <label htmlFor="birth-datetime" className="block text-[10px] font-bold text-white/50 uppercase tracking-[0.25em] font-mono">
                    Birth Date & Time <span className="text-amber-400 font-bold">*</span>
                  </label>
                  <input
                    id="birth-datetime"
                    type="datetime-local"
                    value={birthDateTime}
                    onChange={(e) => setBirthDateTime(e.target.value)}
                    required
                    style={{ colorScheme: "dark" }}
                    className="w-full px-4 py-3.5 bg-white/[0.03] border border-white/10 rounded-2xl text-sm text-white focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all duration-300 shadow-inner"
                  />
                  <p className="text-[9px] text-white/20 italic">Provide exact birth hour & minutes if known to project precise astrological degrees.</p>
                </div>

                {/* Geocoding Location Search */}
                <div className="space-y-2 font-mono [&_label]:text-[10px] [&_label]:font-bold [&_label]:text-white/50 [&_label]:uppercase [&_label]:tracking-[0.25em] [&_input]:bg-white/[0.03] [&_input]:border-white/10 [&_input]:border [&_input]:rounded-2xl [&_input]:text-white [&_input]:outline-none [&_input]:px-4 [&_input]:py-3.5 [&_input]:text-sm [&_input]:shadow-inner">
                  <LocationSearch 
                    onLocationSelect={(loc) => setBirthLocation(loc)}
                    onLocationClear={() => setBirthLocation(null)}
                    placeholder="Search for birth city/region..."
                  />
                </div>

                {/* Error Banner */}
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 rounded-xl border border-red-500/20 bg-red-950/10 text-red-400 text-xs leading-relaxed"
                  >
                    ✦ {error}
                  </motion.div>
                )}

                {/* Ignition Button */}
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="w-full py-4 rounded-2xl font-black text-xs uppercase tracking-[0.25em] font-mono text-black bg-gradient-to-r from-amber-400 via-purple-400 to-indigo-400 hover:shadow-[0_0_30px_rgba(168,85,247,0.35)] transition-all duration-300"
                >
                  Ignite Agent Forge
                </motion.button>
              </form>
            </div>

            {/* Premium Three Pillars Info Grid */}
            <div className="grid grid-cols-3 gap-3 mt-6">
              {[
                { icon: "✨", title: "Transit Map", desc: "Live astrological ephemeris projection" },
                { icon: "⚗️", title: "ESMS Yields", desc: "Spirit, Essence, Matter & Substance ratios" },
                { icon: "🍽️", title: "Alchm Diet", desc: "Complimentary cosmic recipe onboarding" }
              ].map((pill, idx) => (
                <div key={idx} className="border border-white/5 bg-white/[0.01] rounded-2xl p-4 text-center backdrop-blur-sm">
                  <div className="text-xl mb-1.5">{pill.icon}</div>
                  <div className="text-[9px] font-black text-white/50 uppercase tracking-wider font-mono">{pill.title}</div>
                  <div className="text-[8px] text-white/20 mt-1 leading-snug">{pill.desc}</div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ==================== STATE 2: STELLAR PROJECTION ANIMATION ==================== */}
        {viewState === "projecting" && (
          <motion.div
            key="projecting-screen"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center justify-center z-10 w-full max-w-2xl text-center"
          >
            {/* Astronomical Sky Map SVG Container */}
            <div className="relative w-80 h-80 md:w-96 md:h-96 mb-8 flex items-center justify-center">
              
              {/* Outer Circular Aura */}
              <div className="absolute inset-0 rounded-full border border-purple-500/10 bg-purple-500/[0.01] blur-md animate-pulse" />
              
              {/* Rotating Outer Ring (Zodiac signs) */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 60, ease: "linear" }}
                className="absolute inset-0 w-full h-full flex items-center justify-center"
              >
                <svg className="w-full h-full text-white/20 select-none pointer-events-none" viewBox="0 0 400 400">
                  {/* Outer circle */}
                  <circle cx="200" cy="200" r="190" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
                  <circle cx="200" cy="200" r="170" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" strokeDasharray="3,3" />
                  
                  {/* Zodiac Degree Markers */}
                  {Array.from({ length: 36 }).map((_, idx) => {
                    const angle = (idx * 10 * Math.PI) / 180;
                    const x1 = 200 + Math.cos(angle) * 180;
                    const y1 = 200 + Math.sin(angle) * 180;
                    const x2 = 200 + Math.cos(angle) * 190;
                    const y2 = 200 + Math.sin(angle) * 190;
                    return (
                      <line key={idx} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
                    );
                  })}

                  {/* Zodiac Symbols Layout */}
                  {zodiacs.map((sign, idx) => {
                    const angle = (idx * 30 * Math.PI) / 180 - Math.PI / 2;
                    const x = 200 + Math.cos(angle) * 150;
                    const y = 200 + Math.sin(angle) * 150;
                    return (
                      <text
                        key={idx}
                        x={x}
                        y={y}
                        fill="rgba(255, 255, 255, 0.45)"
                        fontSize="12"
                        textAnchor="middle"
                        dominantBaseline="central"
                        className="font-mono text-white/30"
                      >
                        {sign}
                      </text>
                    );
                  })}
                </svg>
              </motion.div>

              {/* Concentric Orbital Rings */}
              <svg className="absolute w-[80%] h-[80%] text-white/10" viewBox="0 0 320 320">
                <circle cx="160" cy="160" r="120" fill="none" stroke="rgba(255, 255, 255, 0.04)" strokeWidth="1" />
                <circle cx="160" cy="160" r="90" fill="none" stroke="rgba(168, 85, 247, 0.05)" strokeWidth="1.5" strokeDasharray="5,10" />
                <circle cx="160" cy="160" r="60" fill="none" stroke="rgba(245, 158, 11, 0.04)" strokeWidth="1" />
              </svg>

              {/* Animate Astro Lines (Connecting vectors mapping transits) */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 400 400">
                <AnimatePresence>
                  {loadingStep >= 1 && (
                    <motion.line
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 1.5, ease: "easeInOut" }}
                      x1="120" y1="130" x2="280" y2="270"
                      stroke="rgba(168, 85, 247, 0.45)"
                      strokeWidth="1.5"
                      style={{ filter: "drop-shadow(0 0 6px rgba(168, 85, 247, 0.8))" }}
                    />
                  )}
                  {loadingStep >= 2 && (
                    <motion.line
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 1.5, ease: "easeInOut", delay: 0.3 }}
                      x1="280" y1="130" x2="120" y2="270"
                      stroke="rgba(245, 158, 11, 0.4)"
                      strokeWidth="1.5"
                      style={{ filter: "drop-shadow(0 0 6px rgba(245, 158, 11, 0.8))" }}
                    />
                  )}
                  {loadingStep >= 3 && (
                    <motion.line
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 1.8, ease: "easeInOut", delay: 0.6 }}
                      x1="200" y1="80" x2="200" y2="320"
                      stroke="rgba(45, 212, 191, 0.4)"
                      strokeWidth="1.2"
                      strokeDasharray="4,4"
                    />
                  )}
                  {loadingStep >= 4 && (
                    <motion.line
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 1.5, ease: "easeInOut", delay: 0.9 }}
                      x1="70" y1="200" x2="330" y2="200"
                      stroke="rgba(255, 255, 255, 0.25)"
                      strokeWidth="1"
                    />
                  )}
                </AnimatePresence>
              </svg>

              {/* Glowing Alchemical Furnace Core */}
              <div className="absolute w-20 h-20 rounded-full flex items-center justify-center">
                {/* Glow aura */}
                <motion.div
                  animate={{ scale: [1, 1.15, 1], rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                  className="absolute w-16 h-16 rounded-full bg-gradient-to-r from-amber-500/20 via-purple-600/20 to-teal-500/20 blur-md border border-white/10"
                />
                <span className="text-2xl z-10 animate-bounce select-none">⚗️</span>
              </div>

              {/* Dominant vector orb tracking */}
              <motion.div
                animate={{
                  x: [0, 80, -40, 0],
                  y: [0, -60, 80, 0]
                }}
                transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
                className="absolute w-3 h-3 rounded-full bg-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.9)] z-10"
                style={{ top: "35%", left: "45%" }}
              />

              {/* Secondary transit orb */}
              <motion.div
                animate={{
                  x: [0, -90, 30, 0],
                  y: [0, 70, -80, 0]
                }}
                transition={{ repeat: Infinity, duration: 10, ease: "easeInOut" }}
                className="absolute w-2.5 h-2.5 rounded-full bg-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.9)] z-10"
                style={{ top: "60%", left: "55%" }}
              />
            </div>

            {/* Interactive Loading Steps Indicator */}
            <div className="w-full max-w-md mx-auto px-6">
              <h2 className="text-xs font-black uppercase tracking-[0.3em] font-mono text-purple-400 mb-3 animate-pulse">
                Stellar Projection Active
              </h2>
              
              <div className="h-10 flex items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={loadingStep}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.3 }}
                    className="text-white/60 text-xs font-mono italic max-w-xs"
                  >
                    {loadingTexts[loadingStep]}
                  </motion.p>
                </AnimatePresence>
              </div>

              {/* Progress bars */}
              <div className="flex gap-1.5 justify-center mt-5">
                {loadingTexts.map((_, i) => (
                  <div key={i} className="w-8 h-1 rounded-full bg-white/5 overflow-hidden">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-purple-500 to-amber-500"
                      initial={{ width: "0%" }}
                      animate={{ width: i < loadingStep ? "100%" : i === loadingStep ? "70%" : "0%" }}
                      transition={{ duration: i === loadingStep ? 1.5 : 0.3, ease: "linear" }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ==================== STATE 3: TRANSMUTED REVEAL ==================== */}
        {viewState === "transmuted" && constitution && (
          <motion.div
            key="reveal-screen"
            initial={{ opacity: 0, scale: 0.7, filter: "blur(20px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={{ type: "spring", damping: 15, stiffness: 60 }}
            className="w-full max-w-4xl z-10 py-6 flex flex-col items-center"
          >
            {/* Top Congratulatory Header */}
            <div className="text-center mb-8">
              <motion.div 
                initial={{ scale: 0.8 }}
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/5 text-amber-300 text-[10px] font-black uppercase tracking-[0.3em] font-mono mb-4"
              >
                ✦ Transmutation Complete ✦
              </motion.div>
              <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter mb-2 font-display">
                Welcome, <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-200 via-purple-300 to-teal-200 font-extrabold">{constitution.baseArchetype}</span>
              </h1>
              <p className="text-white/40 text-xs font-mono">
                Your birth coordinates geocoded successfully. Your cosmic reserves are loaded.
              </p>
            </div>

            {/* Celestial Birth Summary Strip */}
            {(savedBirthData ?? computedChart) && (() => {
              const birthSource = computedChart?.birthData ?? savedBirthData;
              const formattedWallClock = formatWallClockDisplay(birthSource?.dateTime);
              const sunInfo = computedChart?.planets.find((p) => p.name === "Sun");
              const moonInfo = computedChart?.planets.find((p) => p.name === "Moon");
              const ascInfo = computedChart?.planets.find((p) => p.name === "Ascendant");
              return (
                <div className="w-full mb-5 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md px-5 py-4 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-4 text-xs">
                    {computedChart && (
                      <>
                        <div>
                          <span className="text-[10px] font-mono uppercase tracking-wider text-amber-300/70 mr-1.5">Sun</span>
                          <span className="font-bold text-white">
                            {formatBirthPlacement(computedChart.planetaryPositions.Sun, sunInfo?.position)}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] font-mono uppercase tracking-wider text-blue-300/70 mr-1.5">Moon</span>
                          <span className="font-bold text-white">
                            {formatBirthPlacement(computedChart.planetaryPositions.Moon, moonInfo?.position)}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] font-mono uppercase tracking-wider text-purple-300/70 mr-1.5">Rising</span>
                          <span className="font-bold text-white">
                            {formatBirthPlacement(computedChart.ascendant, ascInfo?.position)}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-white/60">
                    {formattedWallClock && <span>{formattedWallClock}</span>}
                    {birthSource?.timezone && (
                      <span className="px-2 py-0.5 rounded-md bg-purple-500/15 border border-purple-400/20 text-purple-200">
                        {birthSource.timezone}
                      </span>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* Content Display: Archetype & Token Yields + First Recipe */}
            <div className="w-full grid grid-cols-1 lg:grid-cols-5 gap-6 mt-4">
              
              {/* Pillar A: Alchemical Balance (ESMS Meters) */}
              <div className="lg:col-span-2 flex flex-col justify-between border border-white/10 bg-[#0c0c16]/50 backdrop-blur-xl rounded-[2rem] p-6 shadow-xl">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] font-mono text-purple-400 border-b border-white/5 pb-3.5 mb-4 flex items-center justify-between">
                    <span>Alchemical Equilibrium</span>
                    <span className="text-[10px] text-white/30 font-medium">Base Reserve Values</span>
                  </h3>

                  <p className="text-[10px] text-white/40 leading-relaxed mb-5">
                    Four quantities, read from the planets in your birth chart.
                    The signs those planets occupy set a separate elemental
                    balance.
                  </p>

                  {/* ESMS Progress List */}
                  <div className="space-y-5">
                    {[
                      { label: "Spirit", color: "from-amber-500 to-yellow-400", icon: "🝇", val: constitution.spiritBalance },
                      { label: "Essence", color: "from-blue-500 to-cyan-400", icon: "🝑", val: constitution.essenceBalance },
                      { label: "Matter", color: "from-emerald-500 to-green-400", icon: "🝙", val: constitution.matterBalance },
                      { label: "Substance", color: "from-purple-500 to-fuchsia-400", icon: "🝉", val: constitution.substanceBalance }
                    ].map((token) => (
                      <div key={token.label} className="space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-mono text-white/70 flex items-center gap-1.5">
                            <span>{token.icon}</span>
                            <span>{token.label}</span>
                          </span>
                          <span className="font-black font-mono text-white">{token.val} units</span>
                        </div>
                        <div className="h-3 w-full rounded-full bg-white/5 overflow-hidden border border-white/5 relative">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${token.val}%` }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            className={`h-full bg-gradient-to-r ${token.color} rounded-full`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Archetype Description Badge */}
                <div className="mt-8 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                  <div className="text-[10px] font-bold text-amber-300 uppercase tracking-wider font-mono mb-1">
                    Archetype Paradigm
                  </div>
                  <p className="text-[10px] text-white/50 leading-relaxed">
                    {constitution.baseArchetype === "Solar Forager" && "Spirit stands out most in your chart — the creative spark, carried by the Sun, Mercury, Jupiter and Saturn. Your culinary blueprint favors quick, roasted, robustly spicy grains and earthy roots."}
                    {constitution.baseArchetype === "Lunar Adept" && "Essence stands out most in your chart — life energy and feeling, carried chiefly by the Moon, Venus and Mars. Your culinary blueprint favors restorative broths, sea harvests, and cooling herbs."}
                    {constitution.baseArchetype === "Root Alchemist" && "Matter stands out most in your chart — physical form and grounding, carried chiefly by Saturn, the Moon and Venus. Your culinary blueprint favors dense proteins, rich reduction sauces, and grounding flora."}
                    {constitution.baseArchetype === "Wind Whisperer" && "Substance stands out most in your chart — the etheric field, and the scarcest of the four, carried only by Mercury and Neptune. Your culinary blueprint favors fermented light cultures, steaming herbal teas, and raw herbs."}
                  </p>
                </div>
              </div>

              {/* Pillar B: First Complimentary Cosmic Recipe card */}
              <div className="lg:col-span-3 border border-white/10 bg-[#0c0c16]/50 backdrop-blur-xl rounded-[2rem] p-6 shadow-xl flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] font-mono text-teal-400 border-b border-white/5 pb-3.5 mb-5 flex items-center justify-between">
                    <span>Your First Transmuted Recipe</span>
                    <span className="text-[10px] text-white/30 font-medium"> complimentary yield </span>
                  </h3>

                  {/* Render Recipe Card */}
                  <div className="flex justify-center w-full my-4">
                    {cosmicRecipe ? (
                      <div className="w-full max-w-sm">
                        <RecipeCard recipe={cosmicRecipe} />
                      </div>
                    ) : (
                      <div className="h-60 w-full rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-center text-xs text-white/30 italic font-mono">
                        Error retrieving compiled recipe details.
                      </div>
                    )}
                  </div>
                </div>

                {/* Enter Kitchen Submit */}
                <div className="mt-6">
                  <motion.button
                    onClick={() => { void handleFinish(); }}
                    disabled={isFinishing}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className="w-full py-4 rounded-2xl font-black text-xs uppercase tracking-[0.25em] font-mono text-black bg-gradient-to-r from-amber-400 to-teal-400 hover:shadow-[0_0_30px_rgba(45,212,191,0.35)] transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isFinishing ? (
                      <>
                        <span className="animate-spin rounded-full h-4.5 w-4.5 border-b-2 border-black" />
                        Synchronizing Vessel...
                      </>
                    ) : (
                      "Enter the Alchm Kitchen →"
                    )}
                  </motion.button>
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * useSearchParams() needs a Suspense boundary for static prerendering. The
 * root loading.tsx used to provide one implicitly; it was removed because it
 * turned every notFound()/redirect() in the app into an HTTP 200.
 */
export default function OnboardingPage(): React.JSX.Element {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center p-4 text-center text-gray-600">
          Loading...
        </div>
      }
    >
      <OnboardingContent />
    </Suspense>
  );
}
