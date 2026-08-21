/**
 * Celestial Audio Synthesizer
 *
 * Implements pure, real-time harmonic sound synthesis using the Web Audio API
 * grounded in the Cosmic Octave planetary frequencies and Pythagorean / just
 * intonation aspect intervals.
 *
 * Used for live degree-resonance auditory feedback when exploring planetary
 * transits, celestial weather, and agent voice synthesis.
 */

// Cosmic Octave planetary frequencies (Hz)
export const PLANET_FREQUENCIES: Record<string, number> = {
  Sun: 126.22,      // B2 - Transits of the Sun (Solar vitality)
  Moon: 210.42,     // G#3 - Synodic Moon cycle (Receptivity)
  Mercury: 141.27,  // C#3 - Mercury orbit (Intellect & exchange)
  Venus: 221.23,    // A3 - Venus orbit (Harmony & aesthetic)
  Mars: 144.72,     // D3 - Mars synodic period (Initiation & drive)
  Jupiter: 183.58,  // F#3 - Jupiter orbit (Growth & wisdom)
  Saturn: 147.85,   // D3 - Saturn orbit (Structure & refinement)
  Uranus: 207.36,   // G#3 - Uranus orbit (Innovation & disruption)
  Neptune: 211.44,  // G#3 - Neptune orbit (Intuition & dissolution)
  Pluto: 140.25,    // C#3 - Pluto orbit (Transformation & depth)
};

export type AspectType = "conjunction" | "harmony" | "tension" | "opportunity" | "opposition";

export interface ResonanceOptions {
  planet: string;
  aspect?: AspectType;
  durationSeconds?: number;
  volume?: number;
  degree?: number;
}

class CelestialAudioSynthesizer {
  private static instance: CelestialAudioSynthesizer | null = null;
  private audioCtx: AudioContext | null = null;

  private constructor() {
    // Lazy AudioContext initialization on first user interaction
  }

  public static getInstance(): CelestialAudioSynthesizer {
    CelestialAudioSynthesizer.instance ??= new CelestialAudioSynthesizer();
    return CelestialAudioSynthesizer.instance;
  }

  private getAudioContext(): AudioContext | null {
    if (typeof window === "undefined") return null;

    if (!this.audioCtx || this.audioCtx.state === "closed") {
      const AudioCtxConstructor = window.AudioContext;
      if (AudioCtxConstructor) {
        this.audioCtx = new AudioCtxConstructor();
      }
    }


    if (this.audioCtx?.state === "suspended") {
      this.audioCtx.resume().catch(() => {});
    }

    return this.audioCtx;
  }

  /**
   * Plays a celestial degree resonance tone for a planet and its aspect
   */
  public playResonance(options: ResonanceOptions): void {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const baseFreq = PLANET_FREQUENCIES[options.planet] ?? 144.0;
      const duration = options.durationSeconds ?? 1.2;
      const volume = Math.min(Math.max(options.volume ?? 0.15, 0.01), 0.5);

      // Fine-tune frequency slightly based on degree within sign (0-29 degrees = +/- 1.5%)
      const degreeOffset = typeof options.degree === "number" ? ((options.degree - 15) / 30) * 0.03 : 0;
      const fundamental = baseFreq * (1 + degreeOffset);

      // Determine harmonic ratios based on aspect
      let harmonicMultipliers = [1.0, 2.0];
      let waveform: OscillatorType = "sine";

      switch (options.aspect) {
        case "harmony": // Trine: pure major triad (1, 5/4, 3/2)
          harmonicMultipliers = [1.0, 1.25, 1.5, 2.0];
          waveform = "sine";
          break;
        case "opportunity": // Sextile: sweet harmonious overtone (1, 4/3, 5/3)
          harmonicMultipliers = [1.0, 1.333, 1.667];
          waveform = "sine";
          break;
        case "tension": // Square: metallic bell overtone (1, sqrt(2), 2.2)
          harmonicMultipliers = [1.0, 1.414, 2.2];
          waveform = "triangle";
          break;
        case "opposition": // Deep binaural beating
          harmonicMultipliers = [1.0, 1.015, 2.0];
          waveform = "sine";
          break;
        case "conjunction": // Concentrated unified resonance
        default:
          harmonicMultipliers = [1.0, 2.0, 3.0];
          waveform = "sine";
          break;
      }

      // Master gain node with smooth envelope
      const masterGain = ctx.createGain();
      masterGain.connect(ctx.destination);
      masterGain.gain.setValueAtTime(0.0001, now);
      masterGain.gain.exponentialRampToValueAtTime(volume, now + 0.08);
      masterGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      // Create oscillators for the harmonic chord
      harmonicMultipliers.forEach((ratio, idx) => {
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();

        osc.type = waveform;
        osc.frequency.setValueAtTime(fundamental * ratio, now);

        // Lower gain for higher partials
        const partialWeight = 1.0 / (idx + 1);
        oscGain.gain.setValueAtTime(partialWeight, now);

        osc.connect(oscGain);
        oscGain.connect(masterGain);

        osc.start(now);
        osc.stop(now + duration);
      });
    } catch {
      // Best-effort audio playback (silent fail in restricted browsers)
    }
  }
}

export const celestialAudio = CelestialAudioSynthesizer.getInstance();
