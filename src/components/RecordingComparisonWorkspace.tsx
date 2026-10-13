import React, { useRef, useState, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  FastForward,
  Upload,
  Sparkles,
  GitCompare,
  AlertCircle,
  Clock,
  Layers,
} from 'lucide-react';
import { ContrastiveComparisonResult, AcousticFrame, FlawGrounding } from '../types';

interface Props {
  comparisonResult: ContrastiveComparisonResult | null;
  referenceSampleName: string;
  comparisonSampleName: string;
  referenceFile: File | null;
  comparisonFile: File | null;
  onReferenceFileChange: (file: File) => void;
  onComparisonFileChange: (file: File) => void;
  onSelectSamplePair: (refSample: string, partSample: string, transcript: string) => void;
  onRunComparison: () => void;
  isLoading: boolean;
  error: string | null;
  activeFlawWindow: [number, number] | null;
  seekTime: number | null;
  onTimeUpdate: (currentTime: number, duration: number) => void;
}

export const RecordingComparisonWorkspace: React.FC<Props> = ({
  comparisonResult,
  referenceSampleName,
  comparisonSampleName,
  referenceFile,
  comparisonFile,
  onReferenceFileChange,
  onComparisonFileChange,
  onSelectSamplePair,
  onRunComparison,
  isLoading,
  error,
  activeFlawWindow,
  seekTime,
  onTimeUpdate,
}) => {
  // Audio state for reference track
  const refAudioRef = useRef<HTMLAudioElement | null>(null);
  const [refPlaying, setRefPlaying] = useState(false);
  const [refTime, setRefTime] = useState(0);
  const [refDuration, setRefDuration] = useState(0);
  const [refUrl, setRefUrl] = useState<string | null>(null);

  // Audio state for comparison/participant track
  const compAudioRef = useRef<HTMLAudioElement | null>(null);
  const [compPlaying, setCompPlaying] = useState(false);
  const [compTime, setCompTime] = useState(0);
  const [compDuration, setCompDuration] = useState(0);
  const [compUrl, setCompUrl] = useState<string | null>(null);

  // Sync external seek commands
  useEffect(() => {
    if (seekTime !== null && seekTime !== undefined && compAudioRef.current) {
      compAudioRef.current.currentTime = seekTime;
      setCompTime(seekTime);
    }
  }, [seekTime]);

  // Handle URL creation for Reference audio
  useEffect(() => {
    if (referenceFile) {
      const url = URL.createObjectURL(referenceFile);
      setRefUrl(url);
      return () => URL.revokeObjectURL(url);
    } else if (referenceSampleName && referenceSampleName.trim() !== '') {
      setRefUrl(`/samples/${referenceSampleName}`);
    } else {
      setRefUrl(null);
    }
  }, [referenceFile, referenceSampleName]);

  // Handle URL creation for Comparison audio
  useEffect(() => {
    if (comparisonFile) {
      const url = URL.createObjectURL(comparisonFile);
      setCompUrl(url);
      return () => URL.revokeObjectURL(url);
    } else if (comparisonSampleName && comparisonSampleName.trim() !== '') {
      setCompUrl(`/samples/${comparisonSampleName}`);
    } else {
      setCompUrl(null);
    }
  }, [comparisonFile, comparisonSampleName]);

  const toggleRefPlay = () => {
    if (!refAudioRef.current || !refUrl) return;
    if (refPlaying) {
      refAudioRef.current.pause();
      setRefPlaying(false);
    } else {
      refAudioRef.current.play().then(() => setRefPlaying(true)).catch(() => {});
    }
  };

  const toggleCompPlay = () => {
    if (!compAudioRef.current || !compUrl) return;
    if (compPlaying) {
      compAudioRef.current.pause();
      setCompPlaying(false);
    } else {
      compAudioRef.current.play().then(() => setCompPlaying(true)).catch(() => {});
    }
  };

  const handleRefSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!refAudioRef.current || !refDuration || !refUrl) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const newT = pct * refDuration;
    refAudioRef.current.currentTime = newT;
    setRefTime(newT);
  };

  const handleCompSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!compAudioRef.current || !compDuration || !compUrl) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const newT = pct * compDuration;
    compAudioRef.current.currentTime = newT;
    setCompTime(newT);
    onTimeUpdate(newT, compDuration);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    const ms = Math.floor((secs % 1) * 10);
    return `${m}:${s < 10 ? '0' : ''}${s}.${ms}`;
  };

  // Generate waveform bars from actual extracted frames or calibrated speech profile
  const refFrames = comparisonResult?.referenceAnalysis?.frames || [];
  const compFrames = comparisonResult?.participantAnalysis?.frames || [];

  const refBars = refFrames.length > 0
    ? refFrames.slice(0, 72).map((f) => Math.max(0.12, Math.min(1.0, f.energy * 3.6)))
    : Array.from({ length: 60 }, (_, i) => 0.2 + 0.6 * Math.abs(Math.sin((i / 60) * Math.PI * 4)));

  const compBars = compFrames.length > 0
    ? compFrames.slice(0, 72).map((f) => Math.max(0.12, Math.min(1.0, f.energy * 3.6)))
    : Array.from({ length: 60 }, (_, i) => 0.2 + 0.6 * Math.abs(Math.cos((i / 60) * Math.PI * 3.8)));

  return (
    <div className="editorial-card-elevated rounded-2xl p-6 sm:p-8 space-y-6">
      <audio
        ref={refAudioRef}
        src={refUrl || undefined}
        onTimeUpdate={() => {
          if (refAudioRef.current) setRefTime(refAudioRef.current.currentTime);
        }}
        onLoadedMetadata={() => {
          if (refAudioRef.current) setRefDuration(refAudioRef.current.duration || 0);
        }}
        onEnded={() => setRefPlaying(false)}
      />

      <audio
        ref={compAudioRef}
        src={compUrl || undefined}
        onTimeUpdate={() => {
          if (compAudioRef.current) {
            const t = compAudioRef.current.currentTime;
            setCompTime(t);
            onTimeUpdate(t, compDuration);
          }
        }}
        onLoadedMetadata={() => {
          if (compAudioRef.current) {
            const d = compAudioRef.current.duration || 0;
            setCompDuration(d);
            onTimeUpdate(compTime, d);
          }
        }}
        onEnded={() => setCompPlaying(false)}
      />

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-[#E6E2D9] pb-4">
        <div>
          <h2 className="font-serif-editorial text-2xl font-bold text-[#242522]">
            Recording comparison
          </h2>
          <p className="text-xs text-[#77766F] mt-0.5">
            Reference vs. comparison audio
          </p>
        </div>

        {/* Quick Sample Selector */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-[#77766F] text-[11px] font-medium">Sample pairs:</span>
          <button
            type="button"
            onClick={() =>
              onSelectSamplePair(
                'sample_reference_keynote.wav',
                'sample_flawed_keynote.wav',
                'Welcome everyone. Today we are fundamentally redefining how humans interact with intelligent multimodal interfaces.'
              )
            }
            className={`px-2.5 py-1 rounded-md border text-[11px] font-medium transition cursor-pointer ${
              comparisonSampleName === 'sample_flawed_keynote.wav' && !comparisonFile
                ? 'bg-[#242522] text-[#FFFEFB] border-[#242522]'
                : 'border-[#E6E2D9] hover:bg-[#F7F5F0] text-[#77766F]'
            }`}
          >
            Keynote (Pause Flaw)
          </button>
          <button
            type="button"
            onClick={() =>
              onSelectSamplePair(
                'sample_reference_pitch.wav',
                'sample_flawed_pitch_fast.wav',
                'Every single day millions of professionals waste countless hours attempting to manually debug temporal inconsistencies in voice pipelines.'
              )
            }
            className={`px-2.5 py-1 rounded-md border text-[11px] font-medium transition cursor-pointer ${
              comparisonSampleName === 'sample_flawed_pitch_fast.wav' && !comparisonFile
                ? 'bg-[#242522] text-[#FFFEFB] border-[#242522]'
                : 'border-[#E6E2D9] hover:bg-[#F7F5F0] text-[#77766F]'
            }`}
          >
            Pitch (Rushed Flaw)
          </button>
          <button
            type="button"
            onClick={() =>
              onSelectSamplePair(
                'sample_reference_commence.wav',
                'sample_flawed_monotone.wav',
                'Your courage will be tested, but your conviction must remain steadfast as you enter this next chapter of life.'
              )
            }
            className={`px-2.5 py-1 rounded-md border text-[11px] font-medium transition cursor-pointer ${
              comparisonSampleName === 'sample_flawed_monotone.wav' && !comparisonFile
                ? 'bg-[#242522] text-[#FFFEFB] border-[#242522]'
                : 'border-[#E6E2D9] hover:bg-[#F7F5F0] text-[#77766F]'
            }`}
          >
            Commencement (Monotone)
          </button>
        </div>
      </div>

      {/* Dual Waveform Panels: Reference (Blue #4E8BBD) vs Comparison (Warm Coral #D97757) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Reference Recording Panel (#4E8BBD) */}
        <div className="p-5 rounded-xl bg-[#F7F5F0]/60 border border-[#E6E2D9] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#4E8BBD]" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#4E8BBD]">
                Reference Recording
              </span>
            </div>
            <span className="text-xs font-mono font-medium text-[#77766F]">
              {formatTime(refTime)} / {formatTime(refDuration)}
            </span>
          </div>

          <div className="text-xs font-medium text-[#242522] truncate">
            {referenceFile ? referenceFile.name : referenceSampleName}
          </div>

          {/* Reference Waveform Scrub Bar */}
          <div
            onClick={handleRefSeek}
            className="h-16 bg-[#FFFEFB] rounded-lg border border-[#E6E2D9] p-1.5 flex items-end justify-between gap-[2px] cursor-pointer overflow-hidden relative select-none hover:border-[#4E8BBD]/60 transition"
            title="Click to seek reference audio"
          >
            {refBars.map((val, idx) => {
              const pct = idx / refBars.length;
              const curPct = refDuration > 0 ? refTime / refDuration : 0;
              const isPlayed = pct <= curPct;
              return (
                <div
                  key={idx}
                  className={`w-full rounded-t-xs transition-colors duration-75 ${
                    isPlayed ? 'bg-[#4E8BBD]' : 'bg-[#D9D5CC]'
                  }`}
                  style={{ height: `${Math.round(val * 100)}%` }}
                />
              );
            })}

            {refDuration > 0 && (
              <div
                className="absolute top-0 bottom-0 w-[2px] bg-[#242522] pointer-events-none"
                style={{ left: `${(refTime / refDuration) * 100}%` }}
              />
            )}
          </div>

          {/* Reference Controls */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleRefPlay}
                disabled={!refUrl}
                className="w-8 h-8 rounded-lg bg-[#4E8BBD] hover:bg-[#3D74A1] text-white flex items-center justify-center transition cursor-pointer disabled:opacity-40"
                aria-label={refPlaying ? 'Pause reference audio' : 'Play reference audio'}
              >
                {refPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (refAudioRef.current) {
                    refAudioRef.current.currentTime = 0;
                    setRefTime(0);
                  }
                }}
                disabled={!refUrl}
                className="w-7 h-7 rounded-lg bg-[#FFFEFB] border border-[#E6E2D9] text-[#77766F] hover:text-[#242522] flex items-center justify-center transition cursor-pointer disabled:opacity-40"
                title="Restart"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            </div>

            {/* Upload replacement */}
            <label className="text-[11px] font-medium text-[#4E8BBD] hover:underline cursor-pointer flex items-center gap-1">
              <Upload className="w-3 h-3" />
              <span>Replace master WAV</span>
              <input
                type="file"
                accept="audio/*"
                onChange={(e) => {
                  if (e.target.files?.[0]) onReferenceFileChange(e.target.files[0]);
                }}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Comparison Recording Panel (#D97757) */}
        <div className="p-5 rounded-xl bg-[#F7F5F0]/60 border border-[#E6E2D9] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#D97757]" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#D97757]">
                Comparison Audio
              </span>
            </div>
            <span className="text-xs font-mono font-medium text-[#77766F]">
              {formatTime(compTime)} / {formatTime(compDuration)}
            </span>
          </div>

          <div className="text-xs font-medium text-[#242522] truncate">
            {comparisonFile ? comparisonFile.name : comparisonSampleName}
          </div>

          {/* Comparison Waveform Scrub Bar with Flaw Window Highlight */}
          <div
            onClick={handleCompSeek}
            className="h-16 bg-[#FFFEFB] rounded-lg border border-[#E6E2D9] p-1.5 flex items-end justify-between gap-[2px] cursor-pointer overflow-hidden relative select-none hover:border-[#D97757]/60 transition"
            title="Click to seek comparison audio"
          >
            {compBars.map((val, idx) => {
              const pct = idx / compBars.length;
              const curPct = compDuration > 0 ? compTime / compDuration : 0;
              const isPlayed = pct <= curPct;

              // Check if bar is inside active flaw interval
              let inHighlight = false;
              if (activeFlawWindow && compDuration > 0) {
                const barTime = pct * compDuration;
                inHighlight = barTime >= activeFlawWindow[0] && barTime <= activeFlawWindow[1];
              }

              let barColor = isPlayed ? 'bg-[#D97757]' : 'bg-[#D9D5CC]';
              if (inHighlight) {
                barColor = isPlayed ? 'bg-[#D97757] ring-1 ring-[#D97757]' : 'bg-[#EAB308]/60';
              }

              return (
                <div
                  key={idx}
                  className={`w-full rounded-t-xs transition-colors duration-75 ${barColor}`}
                  style={{ height: `${Math.round(val * 100)}%` }}
                />
              );
            })}

            {compDuration > 0 && (
              <div
                className="absolute top-0 bottom-0 w-[2px] bg-[#242522] pointer-events-none"
                style={{ left: `${(compTime / compDuration) * 100}%` }}
              />
            )}
          </div>

          {/* Comparison Controls */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleCompPlay}
                disabled={!compUrl}
                className="w-8 h-8 rounded-lg bg-[#D97757] hover:bg-[#C06548] text-white flex items-center justify-center transition cursor-pointer disabled:opacity-40"
                aria-label={compPlaying ? 'Pause comparison audio' : 'Play comparison audio'}
              >
                {compPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (compAudioRef.current) {
                    compAudioRef.current.currentTime = 0;
                    setCompTime(0);
                    onTimeUpdate(0, compDuration);
                  }
                }}
                disabled={!compUrl}
                className="w-7 h-7 rounded-lg bg-[#FFFEFB] border border-[#E6E2D9] text-[#77766F] hover:text-[#242522] flex items-center justify-center transition cursor-pointer disabled:opacity-40"
                title="Restart"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            </div>

            {/* Upload replacement */}
            <label className="text-[11px] font-medium text-[#D97757] hover:underline cursor-pointer flex items-center gap-1">
              <Upload className="w-3 h-3" />
              <span>Replace candidate WAV</span>
              <input
                type="file"
                accept="audio/*"
                onChange={(e) => {
                  if (e.target.files?.[0]) onComparisonFileChange(e.target.files[0]);
                }}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Action Footer: Comparison Trigger & Dynamic Status */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <div className="text-xs text-[#77766F]">
          {comparisonResult ? (
            <span>
              DTW Distance: <strong className="text-[#242522] font-mono">{comparisonResult.alignment.dtwDistance}</strong> · Duration ratio: <strong className="text-[#242522] font-mono">{comparisonResult.alignment.durationRatio}x</strong>
            </span>
          ) : (
            <span>Load reference & candidate recordings to evaluate temporal differences.</span>
          )}
        </div>

        <button
          type="button"
          onClick={onRunComparison}
          disabled={isLoading}
          className="px-5 py-2.5 rounded-lg bg-[#6558D9] hover:bg-[#5244C7] disabled:bg-[#D9D5CC] text-[#FFFEFB] text-xs font-semibold tracking-wide transition shadow-xs flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed shrink-0"
        >
          {isLoading ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Aligning Envelopes via DTW...</span>
            </>
          ) : (
            <>
              <GitCompare className="w-3.5 h-3.5" />
              <span>Re-analyze Comparison</span>
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-[#D97757]/10 border border-[#D97757]/30 text-[#D97757] text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
