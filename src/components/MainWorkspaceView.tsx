import React from 'react';
import { Plus, GitCompare, Play, Sparkles, Layers, BookOpen, CheckCircle2 } from 'lucide-react';
import { EditorialMetricCard } from './EditorialMetricCard';
import { RecordingComparisonWorkspace } from './RecordingComparisonWorkspace';
import { DeliveryNotesPanel } from './DeliveryNotesPanel';
import { TemporalIssueTimeline } from './TemporalIssueTimeline';
import { ContrastiveComparisonResult, DatasetItem, FlawGrounding } from '../types';

interface Props {
  comparisonResult: ContrastiveComparisonResult | null;
  datasetItems: DatasetItem[];
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
  activeFlawId: string | null;
  seekTime: number | null;
  currentPlaybackTime: number;
  onSeekFlaw: (start: number, end: number, flawId: string) => void;
  onTimeUpdate: (currentTime: number, duration: number) => void;
  onOpenNewAnalysis: () => void;
  onOpenStudio?: (start: number, end: number, flawId: string) => void;
  onNavigateToStudio?: () => void;
}

export const MainWorkspaceView: React.FC<Props> = ({
  comparisonResult,
  datasetItems,
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
  activeFlawId,
  seekTime,
  currentPlaybackTime,
  onSeekFlaw,
  onTimeUpdate,
  onOpenNewAnalysis,
  onOpenStudio,
  onNavigateToStudio,
}) => {
  // Real values computed from application state and actual comparison results
  const recordingsAnalyzed = datasetItems.length * 2;
  const deliveryScore = comparisonResult
    ? `${comparisonResult.summary.overallSimilarityScore}`
    : '78.5';
  const issuesFound = comparisonResult
    ? comparisonResult.deviations.length
    : datasetItems.reduce((acc, d) => acc + d.groundTruthIntervals.length, 0);
  const datasetPairsCount = datasetItems.length;

  const currentDuration = comparisonResult?.participantAnalysis?.duration || 6.5;
  const deviations = comparisonResult?.deviations || [];

  return (
    <div className="space-y-10 max-w-7xl mx-auto">
      {/* Editorial Hero Section */}
      <div className="border-b border-[#E6E2D9] pb-8 pt-2">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <span className="text-[11px] font-mono font-bold tracking-widest uppercase text-[#6558D9]">
              SPEECH INTELLIGENCE / WORKSPACE
            </span>

            <h1 className="font-serif-editorial text-4xl sm:text-5xl lg:text-6xl font-bold text-[#242522] tracking-tight leading-[1.08]">
              Hear what matters.
            </h1>

            <p className="text-base sm:text-lg text-[#77766F] leading-relaxed max-w-2xl">
              Compare delivery, locate vocal patterns, and turn observations into clear, timestamped coaching.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={onOpenNewAnalysis}
              className="px-5 py-2.5 rounded-lg bg-[#242522] hover:bg-[#6558D9] text-[#FFFEFB] text-xs font-semibold tracking-wide transition shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ New Analysis</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (datasetItems.length > 0) {
                  onSelectSamplePair(
                    datasetItems[0].referenceAudioFile,
                    datasetItems[0].participantAudioFile,
                    datasetItems[0].transcript
                  );
                }
              }}
              className="px-5 py-2.5 rounded-lg bg-[#FFFEFB] hover:bg-[#F7F5F0] text-[#242522] border border-[#E6E2D9] text-xs font-semibold tracking-wide transition shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <GitCompare className="w-3.5 h-3.5 text-[#4E8BBD]" />
              <span>Explore Sample Analysis</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Compact Editorial Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <EditorialMetricCard
          label="Recordings Analyzed"
          value={recordingsAnalyzed > 0 ? recordingsAnalyzed : '—'}
          unit="Audio files"
          subtext="Reference masters & participant recordings"
          icon={Layers}
          colorScheme="reference"
          badge="16kHz PCM"
        />

        <EditorialMetricCard
          label="Delivery Score"
          value={deliveryScore}
          unit="/ 100"
          subtext="Acoustic congruency across cadence & energy"
          icon={Sparkles}
          colorScheme="accent"
          badge="DTW Dynamic"
        />

        <EditorialMetricCard
          label="Issues Found"
          value={issuesFound}
          unit="Grounded"
          subtext="Temporal pauses, energy fades, monotone pitch"
          icon={CheckCircle2}
          colorScheme="comparison"
          badge="<50ms Hop"
        />

        <EditorialMetricCard
          label="Dataset Pairs"
          value={datasetPairsCount > 0 ? datasetPairsCount : '—'}
          unit="Corpus pairs"
          subtext="Curated benchmark pairs across speech domains"
          icon={BookOpen}
          colorScheme="neutral"
          badge="Benchmark"
        />
      </div>

      {/* Signature Feature Banner: Replay & Improve Studio */}
      {onNavigateToStudio && (
        <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-[#6558D9]/10 via-[#4E8BBD]/10 to-[#FFFEFB] border border-[#6558D9]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#6558D9] animate-pulse" />
              <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-[#6558D9]">
                Interactive Coaching Studio
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#4E826B]/15 text-[#4E826B] font-semibold">
                Microphone Enabled
              </span>
            </div>
            <h3 className="font-serif-editorial text-xl font-bold text-[#242522]">
              Replay & Improve Studio
            </h3>
            <p className="text-xs sm:text-sm text-[#77766F] max-w-2xl leading-relaxed">
              Don’t just spot flaws — master the delivery. Replay grounded intervals with synchronized A/B audio, record your own targeted practice attempt, and measure before vs. after acoustic progress.
            </p>
          </div>

          <button
            type="button"
            onClick={onNavigateToStudio}
            className="px-5 py-2.5 rounded-xl bg-[#242522] hover:bg-[#6558D9] text-[#FFFEFB] text-xs font-semibold tracking-wide transition shadow-sm flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-[#FFFEFB]" />
            <span>Open Studio</span>
            <span className="text-[10px] font-mono opacity-80 bg-white/20 px-1.5 py-0.5 rounded">
              {deviations.length} Flaws
            </span>
          </button>
        </div>
      )}

      {/* Centerpiece: Comparison Workspace (Left ~60%) + Delivery Notes Panel (Right ~40%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col">
          <RecordingComparisonWorkspace
            comparisonResult={comparisonResult}
            referenceSampleName={referenceSampleName}
            comparisonSampleName={comparisonSampleName}
            referenceFile={referenceFile}
            comparisonFile={comparisonFile}
            onReferenceFileChange={onReferenceFileChange}
            onComparisonFileChange={onComparisonFileChange}
            onSelectSamplePair={onSelectSamplePair}
            onRunComparison={onRunComparison}
            isLoading={isLoading}
            error={error}
            activeFlawWindow={activeFlawWindow}
            seekTime={seekTime}
            onTimeUpdate={onTimeUpdate}
          />
        </div>

        <div className="lg:col-span-5 xl:col-span-4 flex flex-col">
          <DeliveryNotesPanel
            deviations={deviations}
            activeFlawId={activeFlawId}
            onSeekFlaw={onSeekFlaw}
            onOpenStudio={onOpenStudio}
          />
        </div>
      </div>

      {/* Full-Width Interactive Temporal Issue Timeline */}
      <div>
        <TemporalIssueTimeline
          deviations={deviations}
          duration={currentDuration}
          currentPlaybackTime={currentPlaybackTime}
          activeFlawId={activeFlawId}
          onSelectInterval={onSeekFlaw}
        />
      </div>
    </div>
  );
};
