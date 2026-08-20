"use client";

import { Play, Pause, Volume2, VolumeX, RotateCcw } from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";

interface FeedAudioPlayerProps {
  src: string;
  title?: string;
  author?: string;
  compact?: boolean;
  className?: string;
}

const PLAYBACK_RATES = [1, 1.25, 1.5, 2];

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function FeedAudioPlayer({
  src,
  title,
  author,
  compact = false,
  className = "",
}: FeedAudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRateIndex, setPlaybackRateIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Initialize and tear down Audio element safely
  useEffect(() => {
    if (!src) return;

    const audio = new Audio();
    audio.preload = "metadata";
    audio.src = src;
    audioRef.current = audio;

    const onLoadedMetadata = () => {
      setDuration(audio.duration || 0);
      setIsLoading(false);
      setHasError(false);
    };

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime || 0);
    };

    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    const onError = () => {
      setHasError(true);
      setIsLoading(false);
      setIsPlaying(false);
    };

    const onWaiting = () => setIsLoading(true);
    const onPlaying = () => setIsLoading(false);

    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", onError);
    audio.addEventListener("waiting", onWaiting);
    audio.addEventListener("playing", onPlaying);

    return () => {
      audio.pause();
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("error", onError);
      audio.removeEventListener("waiting", onWaiting);
      audio.removeEventListener("playing", onPlaying);
      audio.src = "";
      audioRef.current = null;
    };
  }, [src]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio
        .play()
        .then(() => {
          setIsPlaying(true);
          setHasError(false);
        })
        .catch(() => {
          setHasError(true);
          setIsPlaying(false);
        });
    }
  }, [isPlaying]);

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetTime = Number(e.target.value);
    setCurrentTime(targetTime);
    if (audioRef.current) {
      audioRef.current.currentTime = targetTime;
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    const nextMuted = !isMuted;
    audioRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
  };

  const cycleRate = () => {
    if (!audioRef.current) return;
    const nextIndex = (playbackRateIndex + 1) % PLAYBACK_RATES.length;
    const rate = PLAYBACK_RATES[nextIndex];
    audioRef.current.playbackRate = rate;
    setPlaybackRateIndex(nextIndex);
  };

  const restart = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = 0;
    setCurrentTime(0);
  };

  if (hasError) {
    return (
      <div className={`rounded-xl border border-rose-500/20 bg-rose-950/20 p-3 text-xs text-rose-300 flex items-center gap-2 ${className}`}>
        <span>⚠ Audio narration stream unavailable</span>
      </div>
    );
  }

  const currentRate = PLAYBACK_RATES[playbackRateIndex];

  if (compact) {
    return (
      <div className={`inline-flex items-center gap-2 rounded-lg bg-amber-950/40 border border-amber-500/30 px-3 py-1.5 text-xs text-amber-200 ${className}`}>
        <button
          type="button"
          onClick={togglePlay}
          className="rounded-full bg-amber-500/20 p-1 text-amber-300 hover:bg-amber-500/30 transition-colors"
          aria-label={isPlaying ? "Pause audio" : "Play audio"}
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
        </button>
        <span className="font-mono text-[10px] text-white/70 tabular-nums">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>
        {isPlaying && (
          <div className="flex items-center gap-0.5 h-3">
            <span className="w-0.5 h-2 bg-amber-400 animate-pulse" />
            <span className="w-0.5 h-3 bg-amber-400 animate-bounce" style={{ animationDelay: "150ms" }} />
            <span className="w-0.5 h-1.5 bg-amber-400 animate-pulse" style={{ animationDelay: "300ms" }} />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`rounded-xl border border-amber-500/25 bg-gradient-to-r from-amber-950/40 via-purple-950/20 to-black/60 p-3.5 backdrop-blur-md shadow-lg shadow-black/40 ${className}`}>
      {(title ?? author) && (
        <div className="flex items-center justify-between mb-2">
          <div className="min-w-0 flex-1">
            {title && <h4 className="text-xs font-semibold text-white/90 truncate">{title}</h4>}
            {author && <p className="text-[10px] text-amber-400/80 uppercase tracking-wider font-mono truncate">{author}</p>}
          </div>
          {isPlaying && (
            <div className="flex items-end gap-1 h-3.5 px-2">
              <span className="w-1 bg-amber-400/80 rounded-full animate-[pulse_0.8s_ease-in-out_infinite] h-2" />
              <span className="w-1 bg-amber-300 rounded-full animate-[pulse_0.6s_ease-in-out_infinite] h-3.5" />
              <span className="w-1 bg-amber-400/80 rounded-full animate-[pulse_0.9s_ease-in-out_infinite] h-1.5" />
              <span className="w-1 bg-amber-200 rounded-full animate-[pulse_0.7s_ease-in-out_infinite] h-3" />
            </div>
          )}
        </div>
      )}

      {/* Scrub bar */}
      <div className="space-y-1">
        <div className="relative flex items-center group">
          <input
            type="range"
            min={0}
            max={duration || 100}
            step={0.1}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
            aria-label="Audio scrubber"
          />
        </div>
        <div className="flex justify-between text-[10px] font-mono text-white/50 tabular-nums">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between mt-2 pt-1 border-t border-white/5">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={togglePlay}
            disabled={isLoading}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
            aria-label={isPlaying ? "Pause audio" : "Play audio"}
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current translate-x-0.5" />}
          </button>
          <button
            type="button"
            onClick={restart}
            className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-colors"
            title="Restart"
            aria-label="Restart audio"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={cycleRate}
            className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-white/5 border border-white/10 text-amber-300 hover:bg-white/10 transition-colors"
            title="Playback Speed"
            aria-label={`Playback speed ${currentRate}x`}
          >
            {currentRate}x
          </button>
          <button
            type="button"
            onClick={toggleMute}
            className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-colors"
            title={isMuted ? "Unmute" : "Mute"}
            aria-label={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
