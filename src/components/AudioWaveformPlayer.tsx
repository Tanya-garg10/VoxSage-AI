import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Volume2, FastForward } from 'lucide-react';
import { AcousticFrame } from '../types';

interface Props {
  src?: string;
  blob?: Blob | null;
  title: string;
  subtitle?: string;
  frames?: AcousticFrame[];
  highlightWindow?: [number, number] | null;
  onTimeUpdate?: (currentTime: number) => void;
  seekTime?: number | null;
  variant?: 'reference' | 'participant' | 'neutral';
}

export const AudioWaveformPlayer: React.FC<Props> = ({
  src,
  blob,
  title,
  subtitle,
  frames = [],
  highlightWindow,
  onTimeUpdate,
  seekTime,
  variant = 'neutral',
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  useEffect(() => {
    if (blob) {
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
      return () => URL.revokeObjectURL(url);
    } else if (src && src.trim() !== '') {
      setAudioUrl(src);
    } else {
      setAudioUrl(null);
    }
  }, [src, blob]);

  useEffect(() => {
    if (seekTime !== null && seekTime !== undefined && audioRef.current) {
      audioRef.current.currentTime = seekTime;
      setCurrentTime(seekTime);
    }
  }, [seekTime]);

  const togglePlay = () => {
    if (!audioRef.current || !audioUrl) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const handleRestart = () => {
    if (!audioRef.current || !audioUrl) return;
    audioRef.current.currentTime = 0;
    setCurrentTime(0);
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    const t = audioRef.current.currentTime;
    setCurrentTime(t);
    if (onTimeUpdate) onTimeUpdate(t);
  };

  const handleLoadedMetadata = () => {
    if (!audioRef.current) return;
    setDuration(audioRef.current.duration || 0);
  };

  const handleEnded = () => {
    setIsPlaying(false);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !duration || !audioUrl) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(1, clickX / rect.width));
    const newT = pct * duration;
    audioRef.current.currentTime = newT;
    setCurrentTime(newT);
  };

  const cycleRate = () => {
    const rates = [1.0, 1.25, 1.5, 0.8];
    const nextIdx = (rates.indexOf(playbackRate) + 1) % rates.length;
    const nextRate = rates[nextIdx];
    setPlaybackRate(nextRate);
    if (audioRef.current) audioRef.current.playbackRate = nextRate;
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    const ms = Math.floor((secs % 1) * 10);
    return `${m}:${s < 10 ? '0' : ''}${s}.${ms}`;
  };

  const themeConfig = {
    reference: {
      card: 'border-slate-200/90 bg-white',
      badge: 'bg-[#635BFF]/10 text-[#635BFF] border-[#635BFF]/20',
      barActive: 'bg-[#635BFF]',
      barMuted: 'bg-slate-200',
      btnPlay: 'bg-[#635BFF] hover:bg-[#5249E6]',
      label: 'Master Reference',
    },
    participant: {
      card: 'border-slate-200/90 bg-white',
      badge: 'bg-[#3898FF]/10 text-[#3898FF] border-[#3898FF]/20',
      barActive: 'bg-[#3898FF]',
      barMuted: 'bg-slate-200',
      btnPlay: 'bg-[#3898FF] hover:bg-[#2580E6]',
      label: 'Participant Audio',
    },
    neutral: {
      card: 'border-slate-200/90 bg-white',
      badge: 'bg-slate-100 text-slate-700 border-slate-200',
      barActive: 'bg-slate-700',
      barMuted: 'bg-slate-200',
      btnPlay: 'bg-slate-800 hover:bg-slate-900',
      label: 'Audio Stream',
    },
  }[variant];

  // Prepare normalized energy waveform bars from acoustic frames or deterministic envelope
  const waveBars = frames.length > 0
    ? frames.slice(0, 72).map((f) => Math.max(0.12, Math.min(1.0, f.energy * 3.6)))
    : Array.from({ length: 54 }, (_, i) => 0.2 + 0.65 * Math.abs(Math.sin((i / 54) * Math.PI * 4.2)));

  return (
    <div className={`rounded-2xl border p-4.5 shadow-[0_2px_12px_rgba(0,0,0,0.02)] transition-all ${themeConfig.card}`}>
      <audio
        ref={audioRef}
        src={audioUrl || undefined}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
      />

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <span className={`text-[11px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full border ${themeConfig.badge}`}>
            {themeConfig.label}
          </span>
          <div>
            <h4 className="text-sm font-bold text-slate-900">{title}</h4>
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
        </div>

        <button
          type="button"
          onClick={cycleRate}
          className="text-xs font-mono font-medium px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition flex items-center gap-1 cursor-pointer"
          title="Adjust playback rate"
        >
          <FastForward className="w-3.5 h-3.5 text-slate-500" />
          <span>{playbackRate}x</span>
        </button>
      </div>

      {/* Waveform Visualization & Scrubber */}
      <div
        onClick={handleSeek}
        className="relative h-14 bg-slate-50 rounded-xl border border-slate-200/70 p-1 flex items-end justify-between gap-[2px] cursor-pointer overflow-hidden group select-none hover:border-slate-300 transition"
        title="Click to seek timestamp"
      >
        {waveBars.map((val, idx) => {
          const barPct = idx / waveBars.length;
          const currentPct = duration > 0 ? currentTime / duration : 0;
          const isPlayed = barPct <= currentPct;

          let inHighlight = false;
          if (highlightWindow && duration > 0) {
            const barTime = barPct * duration;
            inHighlight = barTime >= highlightWindow[0] && barTime <= highlightWindow[1];
          }

          let barColor = isPlayed ? themeConfig.barActive : themeConfig.barMuted;
          if (inHighlight) {
            barColor = isPlayed ? 'bg-amber-500' : 'bg-amber-300';
          }

          return (
            <div
              key={idx}
              className={`w-full rounded-t-xs transition-colors duration-75 ${barColor}`}
              style={{ height: `${Math.round(val * 100)}%` }}
            />
          );
        })}

        {/* Playhead position line */}
        {duration > 0 && (
          <div
            className="absolute top-0 bottom-0 w-[2px] bg-slate-900 z-10 pointer-events-none shadow-xs"
            style={{ left: `${(currentTime / duration) * 100}%` }}
          />
        )}
      </div>

      {/* Controls Bar */}
      <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-100">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={togglePlay}
            disabled={!audioUrl}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition cursor-pointer text-white shadow-xs ${
              !audioUrl ? 'bg-slate-300 cursor-not-allowed' : themeConfig.btnPlay
            }`}
            aria-label={isPlaying ? 'Pause audio' : 'Play audio'}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
          </button>
          <button
            type="button"
            onClick={handleRestart}
            disabled={!audioUrl}
            className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-600 transition cursor-pointer disabled:opacity-40"
            title="Restart from beginning"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 ml-1">
            <Volume2 className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-mono font-bold text-slate-800">{formatTime(currentTime)}</span>
            <span>/</span>
            <span className="font-mono text-slate-500">{formatTime(duration)}</span>
          </div>
        </div>

        {highlightWindow && (
          <div className="text-[11px] text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200 font-mono font-medium">
            Active Flaw: {highlightWindow[0].toFixed(2)}s – {highlightWindow[1].toFixed(2)}s
          </div>
        )}
      </div>
    </div>
  );
};
