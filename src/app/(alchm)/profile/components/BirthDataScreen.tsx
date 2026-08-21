import { motion } from "framer-motion";
import React from "react";
import { LocationSearch } from "@/components/onboarding/LocationSearch";
import type { LocationData } from "./types";

const BirthDataHeader: React.FC<{ hasExistingChart: boolean }> = ({ hasExistingChart }) => (
  <div className="text-center mb-10">
    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-base border border-white/8 mb-5">
      <span className="text-amber-400 text-lg">⚗️</span>
      <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">
        Alchm.kitchen
      </span>
    </div>
    <h1 className="text-3xl font-black text-white tracking-tighter mb-3">
      {hasExistingChart ? "Recalibrate Your Chart" : "Calculate Your Natal Chart"}
    </h1>
    <p className="text-white/30 text-sm leading-relaxed max-w-sm mx-auto">
      Your birth time and location power personalized alchemical food recommendations via the ESMS system.
    </p>
  </div>
);

const WhyCardsGrid: React.FC = () => (
  <div className="grid grid-cols-3 gap-3 mt-6">
    {[
      { icon: "🔮", title: "Natal Chart", desc: "Your cosmic blueprint at birth" },
      { icon: "⚗️", title: "ESMS Profile", desc: "Spirit, Essence, Matter & Substance" },
      { icon: "🍽️", title: "Food Alignment", desc: "Tailored culinary recommendations" },
    ].map((c) => (
      <div key={c.title} className="glass-base rounded-2xl p-4 text-center border border-white/5">
        <div className="text-2xl mb-2">{c.icon}</div>
        <div className="text-[10px] font-black text-white/50 uppercase tracking-wider">{c.title}</div>
        <div className="text-[9px] text-white/20 mt-1">{c.desc}</div>
      </div>
    ))}
  </div>
);

const BirthDataInputs: React.FC<{
  birthDateTime: string;
  setBirthDateTime: (v: string) => void;
  setBirthLocation: (v: LocationData | null) => void;
}> = ({ birthDateTime, setBirthDateTime, setBirthLocation }) => (
  <>
    <div>
      <label htmlFor="birthDateTime" className="block text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mb-2">
        Birth Date & Time <span className="text-red-400">*</span>
      </label>
      <input
        id="birthDateTime"
        type="datetime-local"
        value={birthDateTime}
        onChange={(e): void => { setBirthDateTime(e.target.value); }}
        required
        className="w-full px-4 py-3 bg-white/[0.04] border border-white/10 rounded-2xl text-white focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all text-sm"
        style={{ colorScheme: "dark" }}
      />
      <p className="text-[10px] text-white/20 mt-2">Enter as precisely as possible for the most accurate chart.</p>
    </div>

    <div>
      <label htmlFor="birthLocation" className="block text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mb-2">
        Birth Location <span className="text-red-400">*</span>
      </label>
      <div id="birthLocation" className="[&_input]:bg-white/[0.04] [&_input]:border-white/10 [&_input]:border [&_input]:rounded-2xl [&_input]:text-white [&_input]:outline-none [&_input]:px-4 [&_input]:py-3 [&_input]:w-full [&_input]:text-sm">
        <LocationSearch onLocationSelect={(loc): void => { setBirthLocation(loc); }} />
      </div>
    </div>
  </>
);

interface BirthDataFormProps {
  birthDateTime: string;
  setBirthDateTime: (v: string) => void;
  setBirthLocation: (v: LocationData | null) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  hasExistingChart: boolean;
  onSkip?: () => void;
}

const BirthDataForm: React.FC<BirthDataFormProps> = ({
  birthDateTime,
  setBirthDateTime,
  setBirthLocation,
  onSubmit,
  isLoading,
  hasExistingChart,
  onSkip,
}) => (
  <div className="glass-card-premium rounded-3xl p-8 border-white/8">
    <form onSubmit={onSubmit} className="space-y-6">
      <BirthDataInputs
        birthDateTime={birthDateTime}
        setBirthDateTime={setBirthDateTime}
        setBirthLocation={setBirthLocation}
      />
      <div className="flex gap-3 pt-1">
        <motion.button
          type="submit"
          disabled={isLoading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex-1 px-6 py-3.5 bg-gradient-to-r from-purple-600 to-amber-500 text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] hover:shadow-[0_0_30px_rgba(139,92,246,0.4)] transition-all disabled:opacity-50"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              Calculating...
            </span>
          ) : hasExistingChart ? "Recalculate Chart" : "Calculate My Chart"}
        </motion.button>
        {onSkip && (
          <button
            type="button"
            onClick={onSkip}
            className="px-6 py-3.5 glass-base text-white/40 rounded-2xl font-medium hover:text-white/70 transition-colors border border-white/8 text-sm"
          >
            Skip
          </button>
        )}
      </div>
    </form>
  </div>
);

interface BirthDataScreenProps {
  birthDateTime: string;
  setBirthDateTime: (v: string) => void;
  birthLocation: LocationData | null;
  setBirthLocation: (v: LocationData | null) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  hasExistingChart: boolean;
  onSkip?: () => void;
}

export const BirthDataScreen: React.FC<BirthDataScreenProps> = ({
  birthDateTime,
  setBirthDateTime,
  birthLocation: _birthLocation,
  setBirthLocation,
  onSubmit,
  isLoading,
  hasExistingChart,
  onSkip,
}) => (
  <div className="min-h-screen bg-[#08080e] flex items-center justify-center p-6">
    <div className="fixed inset-0 pointer-events-none">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-950/20 via-[#08080e] to-amber-950/10" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-purple-700/6 rounded-full blur-[140px]" />
    </div>

    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative z-10 w-full max-w-lg"
    >
      <BirthDataHeader hasExistingChart={hasExistingChart} />
      <BirthDataForm
        birthDateTime={birthDateTime}
        setBirthDateTime={setBirthDateTime}
        setBirthLocation={setBirthLocation}
        onSubmit={onSubmit}
        isLoading={isLoading}
        hasExistingChart={hasExistingChart}
        onSkip={onSkip}
      />
      <WhyCardsGrid />
    </motion.div>
  </div>
);
