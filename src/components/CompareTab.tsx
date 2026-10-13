import React, { useState, useEffect } from 'react';
import {
  GitCompare,
  Upload,
  Play,
  RotateCcw,
  Sparkles,
  AlertCircle,
  Activity,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Info,
  Clock,
  Volume2,
  AudioWaveform,
  TrendingDown,
  Layers,
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceArea,
} from 'recharts';
import { compareAudios } from '../services/api';
import { ContrastiveComparisonResult, DatasetItem, FlawGrounding } from '../types';
import { AudioWaveformPlayer } from './AudioWaveformPlayer';
import { TemporalFlawCard } from './TemporalFlawCard';
import { AcousticMetricsCard } from './AcousticMetricsCard';

interface Props {
  initialPair?: DatasetItem | null;
  onClearInitialPair?: () => void;
}

export const CompareTab: React.FC<Props> = ({ initialPair, onClearInitialPair }) => {
  const [refSample, setRefSample] = useState<string>('sample_reference_keynote.wav');
  const [partSample, setPartSample] = useState<string>('sample_flawed_keynote.wav');
  const [refFile, setRefFile] = useState<File | null>(null);
  const [partFile, setPartFile] = useState<File | null>(null);
  const [transcript, setTranscript] = useState<string>(
    'Welcome everyone. Today we are fundamentally redefining how humans interact with intelligent multimodal interfaces.'
  );

  const [isLoading, setIsLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [comparisonResult, setComparisonResult] = useState<ContrastiveComparisonResult | null>(null);

  // Synchronized playback & highlighting states
  const [participantSeekTime, setParticipantSeekTime] = useState<number | null>(null);
  const [activeFlawWindow, setActiveFlawWindow] = useState<[number, number] | null>(null);
  const [activeFlawId, setActiveFlawId] = useState<string | null>(null);

  // If initialPair passed from overview or dataset tab, load it
  useEffect(() => {
    if (initialPair) {
      setRefSample(initialPair.referenceAudioFile);
      setPartSample(initialPair.participantAudioFile);
      setTranscript(initialPair.transcript);
      setRefFile(null);
      setPartFile(null);
      runComparison(initialPair.referenceAudioFile, initialPair.participantAudioFile, initialPair.transcript);
      if (onClearInitialPair) onClearInitialPair();
    }
  }, [initialPair]);

  const runComparison = async (
    overrideRefSample?: string,
    overridePartSample?: string,
    overrideTranscript?: string
  ) => {
    setIsLoading(true);
    setError(null);
    setActiveFlawWindow(null);
    setActiveFlawId(null);
    setLoadingMsg('Aligning dual acoustic streams via Dynamic Time Warping (DTW)...');

    try {
      const activeRefSample = overrideRefSample || refSample;
      const activePartSample = overridePartSample || partSample;
      const activeText = overrideTranscript !== undefined ? overrideTranscript : transcript;

      const result = await compareAudios({
        referenceFile: refFile || undefined,
        participantFile: partFile || undefined,
        referenceSample: !refFile ? activeRefSample : undefined,
        participantSample: !partFile ? activePartSample : undefined,
        transcript: activeText,
      });

      setComparisonResult(result);
    } catch (err: any) {
      setError(err.message || 'Contrastive comparison failed. Check audio sample rates.');
    } finally {
      setIsLoading(false);
      setLoadingMsg('');
    }
  };

  const handleSeekFlaw = (start: number, end: number, flawId?: string) => {
    setParticipantSeekTime(start);
    setActiveFlawWindow([start, end]);
    if (flawId) setActiveFlawId(flawId);
  };

  // Build comparative chart data
  const chartData = comparisonResult
    ? comparisonResult.participantAnalysis.frames.map((pFrame, idx) => {
        const durRatio = comparisonResult.alignment.durationRatio;
        const refFrames = comparisonResult.referenceAnalysis.frames;
        const mappedRefIdx = Math.min(
          Math.max(0, Math.floor(idx / (durRatio > 0 ? durRatio : 1))),
          refFrames.length - 1
        );
        const rFrame = refFrames[mappedRefIdx];

        return {
          timestamp: pFrame.timestamp,
          participantEnergy: Number((pFrame.energy * 100).toFixed(1)),
          referenceEnergy: rFrame ? Number((rFrame.energy * 100).toFixed(1)) : 0,
          participantPitch: pFrame.pitch !== null ? Math.round(pFrame.pitch) : null,
          referencePitch: rFrame && rFrame.pitch !== null ? Math.round(rFrame.pitch) : null,
        };
      })
    : [];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Title */}
      <div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full bg-[#635BFF]/10 text-[#635BFF] text-xs font-semibold">
            Signature Track C Engine
          </span>
          <span className="text-slate-400">·</span>
          <span className="text-xs text-slate-500 font-medium">DTW Temporal Grounding</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-display mt-1">
          Contrastive Speech Comparison
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl">
          Superimpose master reference audio against candidate recordings. Identify temporal cadence shifts, awkward hesitations, and vocal projection differences.
        </p>
      </div>

      {/* Preset Speech Pairs Shortcuts */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Curated Benchmark Speech Pairs
          </span>
          <span className="text-xs text-slate-400">Click to compare instantly</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => {
              setRefSample('sample_reference_keynote.wav');
              setPartSample('sample_flawed_keynote.wav');
              setTranscript(
                'Welcome everyone. Today we are fundamentally redefining how humans interact with intelligent multimodal interfaces.'
              );
              setRefFile(null);
              setPartFile(null);
              runComparison(
                'sample_reference_keynote.wav',
                'sample_flawed_keynote.wav',
                'Welcome everyone. Today we are fundamentally redefining how humans interact with intelligent multimodal interfaces.'
              );
            }}
            className={`p-3.5 rounded-xl border text-left text-xs transition cursor-pointer ${
              partSample === 'sample_flawed_keynote.wav' && !partFile
                ? 'border-[#635BFF] bg-[#635BFF]/5 font-bold text-[#635BFF]'
                : 'border-slate-200/90 hover:bg-slate-50 text-slate-700'
            }`}
          >
            <div className="font-bold flex items-center justify-between text-slate-900">
              <span>Keynote Opening</span>
              <span className="text-[10px] font-mono text-[#635BFF] bg-[#635BFF]/10 px-1.5 py-0.5 rounded">PAIR-001</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Extended 1.30s pause hesitation at 2.1s</div>
          </button>

          <button
            type="button"
            onClick={() => {
              setRefSample('sample_reference_pitch.wav');
              setPartSample('sample_flawed_pitch_fast.wav');
              setTranscript(
                'Every single day millions of professionals waste countless hours attempting to manually debug temporal inconsistencies in voice pipelines.'
              );
              setRefFile(null);
              setPartFile(null);
              runComparison(
                'sample_reference_pitch.wav',
                'sample_flawed_pitch_fast.wav',
                'Every single day millions of professionals waste countless hours attempting to manually debug temporal inconsistencies in voice pipelines.'
              );
            }}
            className={`p-3.5 rounded-xl border text-left text-xs transition cursor-pointer ${
              partSample === 'sample_flawed_pitch_fast.wav' && !partFile
                ? 'border-[#635BFF] bg-[#635BFF]/5 font-bold text-[#635BFF]'
                : 'border-slate-200/90 hover:bg-slate-50 text-slate-700'
            }`}
          >
            <div className="font-bold flex items-center justify-between text-slate-900">
              <span>Investor Pitch</span>
              <span className="text-[10px] font-mono text-[#635BFF] bg-[#635BFF]/10 px-1.5 py-0.5 rounded">PAIR-002</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Accelerated / rushed cadence (1.45x)</div>
          </button>

          <button
            type="button"
            onClick={() => {
              setRefSample('sample_reference_commence.wav');
              setPartSample('sample_flawed_monotone.wav');
              setTranscript(
                'Your courage will be tested, but your conviction must remain steadfast as you enter this next chapter of life.'
              );
              setRefFile(null);
              setPartFile(null);
              runComparison(
                'sample_reference_commence.wav',
                'sample_flawed_monotone.wav',
                'Your courage will be tested, but your conviction must remain steadfast as you enter this next chapter of life.'
              );
            }}
            className={`p-3.5 rounded-xl border text-left text-xs transition cursor-pointer ${
              partSample === 'sample_flawed_monotone.wav' && !partFile
                ? 'border-[#635BFF] bg-[#635BFF]/5 font-bold text-[#635BFF]'
                : 'border-slate-200/90 hover:bg-slate-50 text-slate-700'
            }`}
          >
            <div className="font-bold flex items-center justify-between text-slate-900">
              <span>Commencement Speech</span>
              <span className="text-[10px] font-mono text-[#635BFF] bg-[#635BFF]/10 px-1.5 py-0.5 rounded">PAIR-003</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Flat monotone pitch dynamics (&lt;1.8 st)</div>
          </button>
        </div>
      </div>

      {/* Side-by-Side Dual Audio Track Workspaces */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Master Reference Track (Indigo) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#635BFF]" />
              <span>Reference Recording (Master)</span>
            </span>
            <span className="text-xs text-slate-400 font-mono">Benchmark Cadence</span>
          </div>

          <label className="border border-dashed border-slate-200 hover:border-[#635BFF] rounded-xl p-3 block text-center cursor-pointer bg-white transition hover:bg-slate-50">
            <input
              type="file"
              accept="audio/*"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  setRefFile(e.target.files[0]);
                  setRefSample('');
                }
              }}
              className="hidden"
            />
            <span className="text-xs font-bold text-slate-800 block">
              {refFile ? refFile.name : `Sample: ${refSample}`}
            </span>
            <span className="text-[11px] text-slate-400 mt-0.5 block">Click to upload custom master WAV</span>
          </label>

          <AudioWaveformPlayer
            src={!refFile && refSample ? `/samples/${refSample}` : undefined}
            blob={refFile || undefined}
            title="Reference Master Stream"
            variant="reference"
          />
        </div>

        {/* Right: Participant Recording (Electric Blue) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#3898FF]" />
              <span>Participant Recording (Candidate)</span>
            </span>
            <span className="text-xs text-slate-400 font-mono">Target of Analysis</span>
          </div>

          <label className="border border-dashed border-slate-200 hover:border-[#3898FF] rounded-xl p-3 block text-center cursor-pointer bg-white transition hover:bg-slate-50">
            <input
              type="file"
              accept="audio/*"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  setPartFile(e.target.files[0]);
                  setPartSample('');
                }
              }}
              className="hidden"
            />
            <span className="text-xs font-bold text-slate-800 block">
              {partFile ? partFile.name : (partSample ? `Sample: ${partSample}` : 'No sample selected')}
            </span>
            <span className="text-[11px] text-slate-400 mt-0.5 block">Click to upload custom participant WAV</span>
          </label>

          <AudioWaveformPlayer
            src={!partFile && partSample ? `/samples/${partSample}` : undefined}
            blob={partFile || undefined}
            title="Participant Delivery Stream"
            seekTime={participantSeekTime}
            highlightWindow={activeFlawWindow}
            variant="participant"
          />
        </div>
      </div>

      {/* Transcript Input & Run Button */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-4">
        <div>
          <label htmlFor="compare-transcript-text" className="text-xs font-bold text-slate-700 block mb-1">
            Common Transcript
          </label>
          <input
            id="compare-transcript-text"
            type="text"
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#635BFF]/20 text-slate-800 font-sans"
            placeholder="Matching script text for both audio tracks..."
          />
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="button"
          onClick={() => runComparison()}
          disabled={isLoading}
          className="w-full py-3.5 rounded-xl bg-[#635BFF] hover:bg-[#5249E6] disabled:bg-slate-200 text-white font-semibold text-sm transition shadow-[0_2px_12px_rgba(99,91,255,0.25)] flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>{loadingMsg || 'Executing Contrastive Alignment...'}</span>
            </>
          ) : (
            <>
              <GitCompare className="w-4 h-4" />
              <span>Run Contrastive Analysis & Ground Temporal Flaws</span>
            </>
          )}
        </button>
      </div>

      {/* Results Container */}
      {comparisonResult && (
        <div className="space-y-6 pt-2">
          {/* Alignment & Score Overview Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  Acoustic Congruence Score
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-4xl font-extrabold text-slate-900 font-display">
                    {comparisonResult.summary.overallSimilarityScore}
                  </span>
                  <span className="text-sm font-semibold text-slate-500">/ 100 Acoustic Match</span>
                </div>
              </div>

              {/* Dynamic Time Warping Metrics */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <div className="px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-slate-700 font-mono">
                  DTW Cost: <strong>{comparisonResult.alignment.dtwDistance}</strong>
                </div>
                <div className="px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-slate-700 font-mono">
                  Duration Ratio: <strong>{comparisonResult.alignment.durationRatio}x</strong>
                </div>
                <div className="px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-slate-700 font-mono">
                  Ref {comparisonResult.alignment.referenceDuration}s · Part {comparisonResult.alignment.participantDuration}s
                </div>
              </div>
            </div>

            {/* Plain English Differences Explanation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/60">
                <span className="font-bold text-slate-800 block mb-1">Pacing & Duration:</span>
                <p className="text-slate-600 leading-relaxed">{comparisonResult.summary.speakingRateComparison}</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/60">
                <span className="font-bold text-slate-800 block mb-1">Intonation & Pitch:</span>
                <p className="text-slate-600 leading-relaxed">{comparisonResult.summary.pitchStabilityComparison}</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/60">
                <span className="font-bold text-slate-800 block mb-1">Volume Dynamics:</span>
                <p className="text-slate-600 leading-relaxed">{comparisonResult.summary.energyDynamicsComparison}</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/60">
                <span className="font-bold text-slate-800 block mb-1">Silence & Pause Rhythm:</span>
                <p className="text-slate-600 leading-relaxed">{comparisonResult.summary.pauseRhythmComparison}</p>
              </div>
            </div>

            {/* Alignment Limitations Notice */}
            <div className="text-xs text-slate-500 bg-slate-50/50 p-3 rounded-xl border border-slate-200/50 flex items-start gap-2">
              <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <strong>Alignment Limitation:</strong> {comparisonResult.alignment.limitations}
              </p>
            </div>
          </div>

          {/* Temporal Flaw Grounding Issue List */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900 font-display">
                    Temporal Flaw Grounding
                  </h3>
                  <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#635BFF]/10 text-[#635BFF]">
                    {comparisonResult.deviations.length} Detected
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Click any candidate issue to highlight its timeline window and seek the participant audio player
                </p>
              </div>
            </div>

            {comparisonResult.deviations.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <ShieldCheck className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-slate-800">No Significant Flaws Detected</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  Participant cadence, pause intervals, and pitch variation align closely with the master reference.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {comparisonResult.deviations.map((flaw) => (
                  <TemporalFlawCard
                    key={flaw.id}
                    flaw={flaw}
                    isActive={activeFlawId === flaw.id}
                    onSeek={(start, end) => handleSeekFlaw(start, end, flaw.id)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Contrastive Acoustic Curve Visualization (Recharts) */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-slate-900 font-display">
                  Contrastive Trajectory Envelopes
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Superimposed energy contours (Reference vs Participant) with highlighted flaw intervals
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs font-medium">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-[#635BFF]" />
                  <span className="text-slate-700">Master Reference Energy</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-[#3898FF]" />
                  <span className="text-slate-700">Participant Energy</span>
                </div>
                {activeFlawWindow && (
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-xs bg-amber-400" />
                    <span className="text-amber-800 font-semibold">Active Flaw Window</span>
                  </div>
                )}
              </div>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={chartData}
                  onClick={(e: any) => {
                    if (e && e.activePayload && e.activePayload[0]) {
                      const t = e.activePayload[0].payload.timestamp;
                      setParticipantSeekTime(t);
                    }
                  }}
                  margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    dataKey="timestamp"
                    tickFormatter={(v) => `${v.toFixed(1)}s`}
                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white text-xs p-3 rounded-xl shadow-lg font-mono space-y-1">
                            <p className="font-bold text-slate-300">Timestamp: {d.timestamp.toFixed(2)}s</p>
                            <p className="text-[#635BFF]">Master Energy: {d.referenceEnergy}%</p>
                            <p className="text-[#3898FF]">Participant Energy: {d.participantEnergy}%</p>
                            {d.participantPitch && (
                              <p className="text-slate-400">Part Pitch: {d.participantPitch} Hz</p>
                            )}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  {activeFlawWindow && (
                    <ReferenceArea
                      x1={activeFlawWindow[0]}
                      x2={activeFlawWindow[1]}
                      stroke="#f59e0b"
                      strokeOpacity={0.8}
                      fill="#f59e0b"
                      fillOpacity={0.16}
                    />
                  )}
                  <Line
                    type="monotone"
                    dataKey="referenceEnergy"
                    stroke="#635BFF"
                    strokeWidth={2.5}
                    dot={false}
                    name="Reference Energy"
                  />
                  <Line
                    type="monotone"
                    dataKey="participantEnergy"
                    stroke="#3898FF"
                    strokeWidth={2}
                    dot={false}
                    name="Participant Energy"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
