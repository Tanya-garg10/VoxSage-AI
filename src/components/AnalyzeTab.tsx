import React, { useState, useRef } from 'react';
import {
  Upload,
  Mic,
  FileAudio,
  Play,
  RotateCcw,
  Sparkles,
  AlertCircle,
  Activity,
  Layers,
  Volume2,
  CheckCircle2,
  Clock,
  AudioWaveform,
  GitCompare,
  Lightbulb,
  PlayCircle,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { analyzeAudio } from '../services/api';
import { SpeechAnalysis } from '../types';
import { AudioWaveformPlayer } from './AudioWaveformPlayer';
import { AcousticMetricsCard } from './AcousticMetricsCard';

interface Props {
  onNavigateToCompare?: () => void;
}

export const AnalyzeTab: React.FC<Props> = ({ onNavigateToCompare }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [sampleAudioPath, setSampleAudioPath] = useState<string>('/samples/sample_flawed_keynote.wav');
  const [transcript, setTranscript] = useState<string>(
    'Welcome everyone. Today we are fundamentally redefining how humans interact with intelligent multimodal interfaces.'
  );
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<SpeechAnalysis | null>(null);
  const [activeSeekTime, setActiveSeekTime] = useState<number | null>(null);

  // Microphone recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // File size validation (backend limit 25MB)
      if (file.size > 25 * 1024 * 1024) {
        setError('Audio file exceeds the 25MB system limit.');
        return;
      }
      setSelectedFile(file);
      setSampleAudioPath('');
      setError(null);
    }
  };

  const handleSelectSample = (sampleUrl: string, sampleTranscript: string) => {
    setSampleAudioPath(sampleUrl);
    setSelectedFile(null);
    setTranscript(sampleTranscript);
    setError(null);
  };

  const startRecording = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const recordedFile = new File([audioBlob], 'live_recording.wav', { type: 'audio/wav' });
        setSelectedFile(recordedFile);
        setSampleAudioPath('');
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordSeconds(0);
      timerRef.current = setInterval(() => {
        setRecordSeconds((s) => s + 1);
      }, 1000);
    } catch (err: any) {
      setError(`Microphone access error: ${err.message || 'Permission denied'}`);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const handleRunAnalysis = async () => {
    setIsLoading(true);
    setError(null);
    setLoadingStep('Ingesting audio stream & downsampling to 16kHz PCM...');

    try {
      let audioBlob: Blob;
      if (selectedFile) {
        audioBlob = selectedFile;
      } else if (sampleAudioPath) {
        const res = await fetch(sampleAudioPath);
        if (!res.ok) throw new Error('Failed to load sample audio.');
        audioBlob = await res.blob();
      } else {
        throw new Error('Please upload an audio file or pick a sample.');
      }

      setTimeout(() => setLoadingStep('Extracting F0 autocorrelation & RMS dynamics...'), 400);

      const result = await analyzeAudio(audioBlob, transcript);
      setAnalysisResult(result);
    } catch (err: any) {
      setError(err.message || 'Analysis failed. Check audio format and microphone bounds.');
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  // Prepare chart data from frame-level features
  const chartData = analysisResult?.frames.map((frame) => ({
    timestamp: frame.timestamp,
    pitch: frame.pitch !== null ? Math.round(frame.pitch) : null,
    energy: Number((frame.energy * 100).toFixed(1)),
    isSpeech: frame.isSpeech ? 1 : 0,
  })) || [];

  // Derive an overall delivery score (0-100) based on dynamic pitch range, pause distribution, and speaking rate
  const deliveryScore = analysisResult ? Math.min(95, Math.max(45, Math.round(
    65 +
    (analysisResult.pitchStats.pitchRangeSemitones > 4 ? 12 : -8) +
    (analysisResult.speechRatio > 0.75 ? 10 : -5) +
    (analysisResult.pauseMetrics.pausesPerMinute < 12 ? 8 : -10)
  ))) : 75;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 font-display">Analyze Speech Delivery</h2>
        <p className="text-xs text-slate-500 mt-1">
          Extract frame-level acoustic markers: fundamental pitch contour ($F_0$), RMS volume dynamics, pauses, and cadence.
        </p>
      </div>

      {/* Two-Column Desktop Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Upload & Configure (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 font-display">1. Audio Source</h3>
              {isRecording ? (
                <button
                  type="button"
                  onClick={stopRecording}
                  className="px-3 py-1 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold flex items-center gap-1.5 transition animate-pulse cursor-pointer shadow-xs"
                >
                  <span className="w-2 h-2 rounded-full bg-white" />
                  <span>Stop ({recordSeconds}s)</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={startRecording}
                  className="px-3 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Mic className="w-3.5 h-3.5 text-[#635BFF]" />
                  <span>Record Microphone</span>
                </button>
              )}
            </div>

            {/* Drag-and-drop Upload Zone */}
            <label className="border-2 border-dashed border-slate-200 hover:border-[#635BFF] rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition bg-slate-50/50 hover:bg-[#635BFF]/5 group">
              <input
                type="file"
                accept="audio/wav,audio/x-wav,audio/flac,audio/mp3,audio/ogg"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="w-11 h-11 rounded-2xl bg-[#635BFF]/10 flex items-center justify-center text-[#635BFF] mb-2.5 group-hover:scale-105 transition-transform">
                <Upload className="w-5 h-5" />
              </div>
              <p className="text-sm font-bold text-slate-800">
                {selectedFile ? selectedFile.name : 'Click to browse or drop audio'}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                WAV (16/24-bit PCM), FLAC, MP3, OGG · Max 25MB
              </p>
            </label>

            {/* Preset Samples Selector */}
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                Or Use Curated Benchmark Audio
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() =>
                    handleSelectSample(
                      '/samples/sample_flawed_keynote.wav',
                      'Welcome everyone. Today we are fundamentally redefining how humans interact with intelligent multimodal interfaces.'
                    )
                  }
                  className={`p-3 rounded-xl border text-left text-xs transition cursor-pointer ${
                    sampleAudioPath === '/samples/sample_flawed_keynote.wav'
                      ? 'border-[#635BFF] bg-[#635BFF]/5 font-bold text-[#635BFF]'
                      : 'border-slate-200/90 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="font-bold text-slate-900">Keynote Delivery</div>
                  <div className="text-[11px] text-slate-500 mt-0.5 truncate">Hesitation pause at 2.1s</div>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleSelectSample(
                      '/samples/sample_flawed_monotone.wav',
                      'Your courage will be tested, but your conviction must remain steadfast as you enter this next chapter of life.'
                    )
                  }
                  className={`p-3 rounded-xl border text-left text-xs transition cursor-pointer ${
                    sampleAudioPath === '/samples/sample_flawed_monotone.wav'
                      ? 'border-[#635BFF] bg-[#635BFF]/5 font-bold text-[#635BFF]'
                      : 'border-slate-200/90 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="font-bold text-slate-900">Commencement Speech</div>
                  <div className="text-[11px] text-slate-500 mt-0.5 truncate">Monotone pitch profile</div>
                </button>
              </div>
            </div>

            {/* Transcript Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="analyze-transcript" className="text-xs font-bold text-slate-700">
                  2. Spoken Transcript (Optional)
                </label>
                <span className="text-[11px] text-slate-400 font-mono">
                  {transcript.split(/\s+/).filter(Boolean).length} words
                </span>
              </div>
              <textarea
                id="analyze-transcript"
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                rows={2}
                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#635BFF]/20 focus:border-[#635BFF] text-slate-800 resize-none font-sans"
                placeholder="Paste the expected spoken transcript for calibrated words-per-minute reporting..."
              />
            </div>

            {/* Audio Waveform Player Preview */}
            {(selectedFile || sampleAudioPath) && (
              <AudioWaveformPlayer
                src={sampleAudioPath || undefined}
                blob={selectedFile || undefined}
                title={selectedFile ? selectedFile.name : 'Loaded Audio Track'}
                subtitle="Preview playback before feature extraction"
                seekTime={activeSeekTime}
                variant="participant"
              />
            )}

            {error && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Actions: Analyze Recording & Compare Shortcut */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={handleRunAnalysis}
                disabled={isLoading || (!selectedFile && !sampleAudioPath)}
                className="w-full py-3.5 rounded-xl bg-[#635BFF] hover:bg-[#5249E6] disabled:bg-slate-200 text-white font-semibold text-sm transition shadow-[0_2px_12px_rgba(99,91,255,0.25)] flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>{loadingStep || 'Processing Acoustics...'}</span>
                  </>
                ) : (
                  <>
                    <Activity className="w-4 h-4" />
                    <span>Analyze Vocal Delivery</span>
                  </>
                )}
              </button>

              {onNavigateToCompare && (
                <button
                  type="button"
                  onClick={onNavigateToCompare}
                  className="w-full py-2.5 rounded-xl border border-slate-200/90 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <GitCompare className="w-3.5 h-3.5 text-[#3898FF]" />
                  <span>Compare with Master Reference Track →</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Results & Interactive Timeline (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {analysisResult ? (
            <div className="space-y-6">
              {/* Score Card Banner */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                    Vocal Delivery Clarity Score
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-4xl font-extrabold text-slate-900 font-display">
                      {deliveryScore}
                    </span>
                    <span className="text-sm font-semibold text-slate-500">/ 100 Overall</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm">
                    {deliveryScore >= 80
                      ? 'Solid cadence, dynamic pitch variation, and disciplined pause structure.'
                      : 'Localized pacing hesitations or compressed pitch contour detected.'}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <div className="px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 font-mono text-slate-700">
                    Dur: <strong>{analysisResult.duration.toFixed(2)}s</strong>
                  </div>
                  <div className="px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 font-mono text-slate-700">
                    Speech: <strong>{Math.round(analysisResult.speechRatio * 100)}%</strong>
                  </div>
                </div>
              </div>

              {/* 4 Core Acoustic Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <AcousticMetricsCard
                  title="Speaking Pace"
                  value={
                    analysisResult.estimatedSpeakingRate?.wordsPerMin !== null &&
                    analysisResult.estimatedSpeakingRate?.wordsPerMin !== undefined
                      ? `${analysisResult.estimatedSpeakingRate.wordsPerMin} WPM`
                      : `${analysisResult.estimatedSpeakingRate?.estimatedSyllablesPerSec || 0} syl/s`
                  }
                  subtitle={analysisResult.estimatedSpeakingRate?.note || 'Syllable nucleus estimate'}
                  icon={Activity}
                  accentColor="indigo"
                  badge={analysisResult.estimatedSpeakingRate?.confidence}
                />
                <AcousticMetricsCard
                  title="F0 Dynamic Range"
                  value={`${analysisResult.pitchStats.pitchRangeSemitones.toFixed(1)} st`}
                  unit={`(μ ${analysisResult.pitchStats.mean} Hz)`}
                  subtitle={`Span: ${analysisResult.pitchStats.min}Hz – ${analysisResult.pitchStats.max}Hz`}
                  icon={AudioWaveform}
                  accentColor="blue"
                  badge={analysisResult.pitchStats.pitchRangeSemitones < 2.5 ? 'Monotone Profile' : 'Dynamic Pitch'}
                />
                <AcousticMetricsCard
                  title="Silence & Pauses"
                  value={`${analysisResult.pauseMetrics.pauseCount}`}
                  unit="Pauses"
                  subtitle={`Total silence: ${analysisResult.silenceDuration.toFixed(2)}s · Mean ${analysisResult.pauseMetrics.meanPauseDuration.toFixed(2)}s`}
                  icon={Clock}
                  accentColor="amber"
                  badge={`${analysisResult.pauseMetrics.pausesPerMinute.toFixed(1)}/min`}
                />
                <AcousticMetricsCard
                  title="Dynamic Range (RMS)"
                  value={`${analysisResult.energyStats.dynamicRangeDb.toFixed(1)} dB`}
                  unit="Loudness"
                  subtitle={`Mean energy: ${analysisResult.energyStats.meanRms.toFixed(3)} RMS`}
                  icon={Volume2}
                  accentColor="emerald"
                  badge="Acoustic Projection"
                />
              </div>

              {/* Interactive Acoustic Timeline (Recharts) */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 font-display">
                      Interactive Feature Trajectory
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Click anywhere on the curve to scrub audio playback to that exact second
                    </p>
                  </div>

                  <div className="flex items-center gap-3 text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#635BFF]" />
                      <span className="text-slate-600 font-medium">Pitch (Hz)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#3898FF]" />
                      <span className="text-slate-600 font-medium">Energy (%)</span>
                    </div>
                  </div>
                </div>

                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart
                      data={chartData}
                      onClick={(e: any) => {
                        if (e && e.activePayload && e.activePayload[0]) {
                          const t = e.activePayload[0].payload.timestamp;
                          setActiveSeekTime(t);
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
                        yAxisId="pitch"
                        orientation="left"
                        domain={[60, 450]}
                        tick={{ fontSize: 11, fill: '#635BFF' }}
                      />
                      <YAxis
                        yAxisId="energy"
                        orientation="right"
                        domain={[0, 100]}
                        tick={{ fontSize: 11, fill: '#3898FF' }}
                      />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const d = payload[0].payload;
                            return (
                              <div className="bg-slate-900 text-white text-xs p-2.5 rounded-xl shadow-lg font-mono">
                                <p className="font-bold text-[#635BFF]">Time: {d.timestamp.toFixed(2)}s</p>
                                <p className="text-slate-200">Pitch: {d.pitch ? `${d.pitch} Hz` : 'Unvoiced'}</p>
                                <p className="text-[#3898FF]">Energy: {d.energy}%</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Area
                        yAxisId="energy"
                        type="monotone"
                        dataKey="energy"
                        fill="#3898FF"
                        fillOpacity={0.12}
                        stroke="#3898FF"
                        strokeWidth={1.5}
                        name="Energy"
                      />
                      <Line
                        yAxisId="pitch"
                        type="monotone"
                        dataKey="pitch"
                        stroke="#635BFF"
                        strokeWidth={2}
                        dot={false}
                        connectNulls={false}
                        name="Pitch"
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Pause Intervals List */}
              {analysisResult.pauseMetrics.pauseIntervals.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-3">
                  <h3 className="text-sm font-bold text-slate-900 font-display">
                    Detected Silence & Pause Intervals
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                    {analysisResult.pauseMetrics.pauseIntervals.map(([pStart, pEnd], idx) => {
                      const pDur = pEnd - pStart;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setActiveSeekTime(pStart)}
                          className="p-3 rounded-xl border border-slate-200/80 bg-slate-50 hover:bg-[#635BFF]/5 hover:border-[#635BFF] transition text-left cursor-pointer"
                        >
                          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                            <span>Pause #{idx + 1}</span>
                            <span className="font-mono">{pDur.toFixed(2)}s</span>
                          </div>
                          <div className="font-bold text-slate-800 font-mono">
                            {pStart.toFixed(2)}s – {pEnd.toFixed(2)}s
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Empty State */
            <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col items-center justify-center min-h-[380px]">
              <div className="w-14 h-14 rounded-2xl bg-[#635BFF]/10 text-[#635BFF] flex items-center justify-center mb-4">
                <AudioWaveform className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-800 font-display">
                Awaiting Audio Ingestion
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mt-1 mb-5 leading-relaxed">
                Choose a pre-packaged benchmark sample or upload a recording on the left panel to generate full acoustic metrics.
              </p>
              <button
                type="button"
                onClick={handleRunAnalysis}
                className="px-5 py-2.5 rounded-xl bg-[#635BFF] hover:bg-[#5249E6] text-white font-semibold text-xs transition shadow-sm cursor-pointer"
              >
                Analyze Default Sample (Keynote)
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
