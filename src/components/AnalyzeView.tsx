import React, { useState, useRef } from 'react';
import {
  Upload,
  Mic,
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
  ArrowRight,
  TrendingUp,
  FileAudio,
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

interface Props {
  onBackToWorkspace: () => void;
  onOpenInComparison: (sampleName: string, transcript: string) => void;
}

export const AnalyzeView: React.FC<Props> = ({ onBackToWorkspace, onOpenInComparison }) => {
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
        throw new Error('Please upload an audio file or choose a sample.');
      }

      setTimeout(() => setLoadingStep('Computing F0 autocorrelation & RMS dynamics...'), 400);

      const result = await analyzeAudio(audioBlob, transcript);
      setAnalysisResult(result);
    } catch (err: any) {
      setError(err.message || 'Analysis failed. Check audio format and microphone bounds.');
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  const chartData = analysisResult?.frames.map((frame) => ({
    timestamp: frame.timestamp,
    pitch: frame.pitch !== null ? Math.round(frame.pitch) : null,
    energy: Number((frame.energy * 100).toFixed(1)),
    isSpeech: frame.isSpeech ? 1 : 0,
  })) || [];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Editorial Header */}
      <div className="border-b border-[#E6E2D9] pb-6 flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
        <div>
          <span className="text-[11px] font-mono font-bold tracking-widest uppercase text-[#6558D9]">
            SPEECH INTELLIGENCE / ACOUSTIC EXTRACTION
          </span>
          <h2 className="font-serif-editorial text-3xl sm:text-4xl font-bold text-[#242522] mt-1">
            Analyze Speech Delivery
          </h2>
          <p className="text-xs sm:text-sm text-[#77766F] mt-1">
            Upload an audio recording to extract fundamental frequency ($F_0$), RMS energy, silence distribution, and speech cadence.
          </p>
        </div>

        <button
          type="button"
          onClick={onBackToWorkspace}
          className="px-4 py-2 rounded-lg border border-[#E6E2D9] bg-[#FFFEFB] hover:bg-[#F7F5F0] text-xs font-semibold text-[#242522] transition shrink-0 cursor-pointer"
        >
          ← Return to Workspace
        </button>
      </div>

      {/* 2-Column Desktop Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Upload & Configure */}
        <div className="lg:col-span-5 editorial-card rounded-2xl p-6 sm:p-7 space-y-5">
          <div className="flex items-center justify-between border-b border-[#E6E2D9] pb-3">
            <h3 className="font-serif-editorial text-lg font-bold text-[#242522]">
              1. Audio Track Ingestion
            </h3>
            {isRecording ? (
              <button
                type="button"
                onClick={stopRecording}
                className="px-3 py-1 rounded-full bg-[#D97757] text-white text-xs font-semibold animate-pulse cursor-pointer"
              >
                Stop Recording ({recordSeconds}s)
              </button>
            ) : (
              <button
                type="button"
                onClick={startRecording}
                className="px-3 py-1 rounded-full bg-[#F7F5F0] border border-[#E6E2D9] hover:bg-[#E6E2D9] text-[#242522] text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
              >
                <Mic className="w-3.5 h-3.5 text-[#6558D9]" />
                <span>Record Mic</span>
              </button>
            )}
          </div>

          {/* Upload Dropzone */}
          <label className="border-2 border-dashed border-[#E6E2D9] hover:border-[#6558D9] rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition bg-[#F7F5F0]/50 hover:bg-[#6558D9]/5 group">
            <input
              type="file"
              accept="audio/wav,audio/x-wav,audio/flac,audio/mp3,audio/ogg"
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="w-10 h-10 rounded-xl bg-[#6558D9]/10 text-[#6558D9] flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
              <Upload className="w-5 h-5" />
            </div>
            <p className="text-sm font-bold text-[#242522]">
              {selectedFile ? selectedFile.name : 'Select or drop audio file'}
            </p>
            <p className="text-[11px] text-[#77766F] mt-1">
              Supports 16/24-bit PCM WAV, FLAC, MP3, OGG · Max 25MB
            </p>
          </label>

          {/* Sample Selectors */}
          <div>
            <span className="text-[11px] font-semibold text-[#77766F] uppercase tracking-wider block mb-2">
              Or Choose Curated Benchmark Audio
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() =>
                  handleSelectSample(
                    '/samples/sample_flawed_keynote.wav',
                    'Welcome everyone. Today we are fundamentally redefining how humans interact with intelligent multimodal interfaces.'
                  )
                }
                className={`p-3 rounded-lg border text-left transition cursor-pointer ${
                  sampleAudioPath === '/samples/sample_flawed_keynote.wav'
                    ? 'border-[#6558D9] bg-[#6558D9]/5 font-bold text-[#6558D9]'
                    : 'border-[#E6E2D9] hover:bg-[#F7F5F0] text-[#242522]'
                }`}
              >
                <div className="font-bold">Keynote (Pause Flaw)</div>
                <div className="text-[11px] text-[#77766F] truncate mt-0.5">Extended hesitation at 2.1s</div>
              </button>
              <button
                type="button"
                onClick={() =>
                  handleSelectSample(
                    '/samples/sample_flawed_monotone.wav',
                    'Your courage will be tested, but your conviction must remain steadfast as you enter this next chapter of life.'
                  )
                }
                className={`p-3 rounded-lg border text-left transition cursor-pointer ${
                  sampleAudioPath === '/samples/sample_flawed_monotone.wav'
                    ? 'border-[#6558D9] bg-[#6558D9]/5 font-bold text-[#6558D9]'
                    : 'border-[#E6E2D9] hover:bg-[#F7F5F0] text-[#242522]'
                }`}
              >
                <div className="font-bold">Commencement (Monotone)</div>
                <div className="text-[11px] text-[#77766F] truncate mt-0.5">Flat pitch dynamics</div>
              </button>
            </div>
          </div>

          {/* Transcript input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="analyze-transcript-field" className="text-xs font-bold text-[#242522]">
                2. Spoken Transcript (Optional)
              </label>
              <span className="text-[11px] text-[#77766F] font-mono">
                {transcript.split(/\s+/).filter(Boolean).length} words
              </span>
            </div>
            <textarea
              id="analyze-transcript-field"
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              rows={2}
              className="w-full text-xs p-3 rounded-xl border border-[#E6E2D9] bg-[#FFFEFB] focus:outline-none focus:border-[#6558D9] text-[#242522] resize-none font-sans"
              placeholder="Paste transcript for calibrated Words-Per-Minute reporting..."
            />
          </div>

          {/* Player Preview */}
          {(selectedFile || sampleAudioPath) && (
            <AudioWaveformPlayer
              src={sampleAudioPath || undefined}
              blob={selectedFile || undefined}
              title={selectedFile ? selectedFile.name : 'Ingested Audio'}
              subtitle="Listen before acoustic analysis"
              seekTime={activeSeekTime}
              variant="participant"
            />
          )}

          {error && (
            <div className="p-3.5 rounded-xl bg-[#D97757]/10 border border-[#D97757]/30 text-[#D97757] text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="button"
            onClick={handleRunAnalysis}
            disabled={isLoading || (!selectedFile && !sampleAudioPath)}
            className="w-full py-3.5 rounded-xl bg-[#242522] hover:bg-[#6558D9] disabled:bg-[#D9D5CC] text-[#FFFEFB] text-xs font-semibold tracking-wide transition shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>{loadingStep || 'Processing Acoustics...'}</span>
              </>
            ) : (
              <>
                <Activity className="w-3.5 h-3.5" />
                <span>Extract Acoustic Features</span>
              </>
            )}
          </button>
        </div>

        {/* Right Column: Acoustic Feature Results */}
        <div className="lg:col-span-7 space-y-6">
          {analysisResult ? (
            <div className="space-y-6">
              {/* Feature Metrics Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="editorial-card rounded-xl p-5">
                  <span className="text-[11px] font-semibold text-[#77766F] uppercase tracking-wider block">
                    Speaking Cadence
                  </span>
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className="text-3xl font-bold text-[#242522] font-mono">
                      {analysisResult.estimatedSpeakingRate?.wordsPerMin !== null &&
                      analysisResult.estimatedSpeakingRate?.wordsPerMin !== undefined
                        ? `${analysisResult.estimatedSpeakingRate.wordsPerMin} WPM`
                        : `${analysisResult.estimatedSpeakingRate?.estimatedSyllablesPerSec || 0} syl/s`}
                    </span>
                  </div>
                  <p className="text-xs text-[#77766F] mt-1 leading-normal">
                    {analysisResult.estimatedSpeakingRate?.note}
                  </p>
                </div>

                <div className="editorial-card rounded-xl p-5">
                  <span className="text-[11px] font-semibold text-[#77766F] uppercase tracking-wider block">
                    F0 Pitch Dynamic Range
                  </span>
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className="text-3xl font-bold text-[#242522] font-mono">
                      {analysisResult.pitchStats.pitchRangeSemitones.toFixed(1)} st
                    </span>
                    <span className="text-xs text-[#77766F]">(μ {analysisResult.pitchStats.mean} Hz)</span>
                  </div>
                  <p className="text-xs text-[#77766F] mt-1 leading-normal">
                    Span: {analysisResult.pitchStats.min}Hz – {analysisResult.pitchStats.max}Hz (σ {analysisResult.pitchStats.stdDev}Hz)
                  </p>
                </div>

                <div className="editorial-card rounded-xl p-5">
                  <span className="text-[11px] font-semibold text-[#77766F] uppercase tracking-wider block">
                    Silence & Pauses
                  </span>
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className="text-3xl font-bold text-[#242522] font-mono">
                      {analysisResult.pauseMetrics.pauseCount}
                    </span>
                    <span className="text-xs text-[#77766F]">pauses ({analysisResult.pauseMetrics.pausesPerMinute.toFixed(1)}/min)</span>
                  </div>
                  <p className="text-xs text-[#77766F] mt-1 leading-normal">
                    Total silence: {analysisResult.silenceDuration.toFixed(2)}s · Mean {analysisResult.pauseMetrics.meanPauseDuration.toFixed(2)}s
                  </p>
                </div>

                <div className="editorial-card rounded-xl p-5">
                  <span className="text-[11px] font-semibold text-[#77766F] uppercase tracking-wider block">
                    RMS Dynamic Range
                  </span>
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className="text-3xl font-bold text-[#242522] font-mono">
                      {analysisResult.energyStats.dynamicRangeDb.toFixed(1)} dB
                    </span>
                  </div>
                  <p className="text-xs text-[#77766F] mt-1 leading-normal">
                    Mean energy: {analysisResult.energyStats.meanRms.toFixed(3)} RMS
                  </p>
                </div>
              </div>

              {/* Acoustic Timeline Curve */}
              <div className="editorial-card rounded-2xl p-6 space-y-3">
                <div className="flex items-center justify-between border-b border-[#E6E2D9] pb-3">
                  <div>
                    <h3 className="font-serif-editorial text-lg font-bold text-[#242522]">
                      Frame-Level Trajectory
                    </h3>
                    <p className="text-xs text-[#77766F]">
                      Click curve to seek audio player to that exact millisecond
                    </p>
                  </div>

                  <div className="flex items-center gap-3 text-xs font-medium">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#6558D9]" />
                      <span>Pitch (Hz)</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#4E8BBD]" />
                      <span>Energy (%)</span>
                    </span>
                  </div>
                </div>

                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart
                      data={chartData}
                      onClick={(e: any) => {
                        if (e && e.activePayload && e.activePayload[0]) {
                          setActiveSeekTime(e.activePayload[0].payload.timestamp);
                        }
                      }}
                      margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#E6E2D9" opacity={0.6} />
                      <XAxis
                        dataKey="timestamp"
                        tickFormatter={(v) => `${v.toFixed(1)}s`}
                        tick={{ fontSize: 10, fill: '#77766F' }}
                      />
                      <YAxis
                        yAxisId="pitch"
                        orientation="left"
                        domain={[60, 450]}
                        tick={{ fontSize: 10, fill: '#6558D9' }}
                      />
                      <YAxis
                        yAxisId="energy"
                        orientation="right"
                        domain={[0, 100]}
                        tick={{ fontSize: 10, fill: '#4E8BBD' }}
                      />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const d = payload[0].payload;
                            return (
                              <div className="bg-[#242522] text-[#FFFEFB] text-xs p-2.5 rounded-lg shadow-lg font-mono">
                                <p className="font-bold text-[#6558D9]">Time: {d.timestamp.toFixed(2)}s</p>
                                <p>Pitch: {d.pitch ? `${d.pitch} Hz` : 'Unvoiced'}</p>
                                <p className="text-[#4E8BBD]">Energy: {d.energy}%</p>
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
                        fill="#4E8BBD"
                        fillOpacity={0.15}
                        stroke="#4E8BBD"
                        strokeWidth={1.5}
                        name="Energy"
                      />
                      <Line
                        yAxisId="pitch"
                        type="monotone"
                        dataKey="pitch"
                        stroke="#6558D9"
                        strokeWidth={2}
                        dot={false}
                        connectNulls={false}
                        name="Pitch"
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          ) : (
            <div className="editorial-card rounded-2xl p-12 text-center flex flex-col items-center justify-center min-h-[360px]">
              <div className="w-12 h-12 rounded-xl bg-[#F7F5F0] border border-[#E6E2D9] flex items-center justify-center text-[#77766F] mb-3">
                <AudioWaveform className="w-6 h-6" />
              </div>
              <h3 className="font-serif-editorial text-lg font-bold text-[#242522]">
                Ready for Extraction
              </h3>
              <p className="text-xs text-[#77766F] max-w-sm mt-1 mb-4 leading-relaxed">
                Ingest an audio recording on the left panel to calculate physical acoustic metrics: F0 pitch, RMS energy, and pause distribution.
              </p>
              <button
                type="button"
                onClick={handleRunAnalysis}
                className="px-4 py-2 rounded-lg bg-[#242522] hover:bg-[#6558D9] text-[#FFFEFB] text-xs font-semibold transition cursor-pointer"
              >
                Analyze Keynote Sample
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
